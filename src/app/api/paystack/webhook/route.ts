import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { settleSuccessfulPayment } from "@/lib/payment-settlement";

export const runtime = "nodejs";

type PaystackEvent = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    status?: string;
    channel?: string | null;
  };
};

function validSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new Response("Not configured", { status: 503 });

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  if (!validSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const reference = event.data?.reference;
  if (!reference) return Response.json({ ok: true });

  const payment = await prisma.payment.findFirst({
    where: { reference, method: "PAYSTACK" },
  });
  // Not one of ours, or a reference we never issued.
  if (!payment) return Response.json({ ok: true });

  if (event.event === "charge.failed") {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return Response.json({ ok: true });
  }

  if (event.event !== "charge.success") return Response.json({ ok: true });

  const amountNaira = Number(event.data?.amount) / 100;
  const settled = await settleSuccessfulPayment({
    reference,
    amountNaira,
    channel: event.data?.channel ?? null,
    source: "webhook",
  });

  if (settled) {
    revalidatePath("/portal");
    revalidatePath("/admin/fees");
  } else if (!Number.isFinite(amountNaira) || Math.abs(amountNaira - payment.amount) > 0.01) {
    await audit("payment.rejected", {
      entity: "Payment",
      entityId: payment.id,
      detail: `amount mismatch · ${reference}`,
      session: null,
    });
  }

  return Response.json({ ok: true });
}
