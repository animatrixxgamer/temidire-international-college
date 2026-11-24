import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { paystackEnabled, verifyTransaction } from "@/lib/paystack";
import { payableStudentIds } from "@/lib/payment-access";
import { settleSuccessfulPayment } from "@/lib/payment-settlement";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const schema = z.object({ reference: z.string().min(1).max(120) });

/**
 * Confirm a checkout when the parent returns from Paystack.
 *
 * The webhook is still the main path, but if it was delayed, rejected while the
 * site was restarting, or never configured, this asks Paystack for the truth and
 * credits the invoice. Settlement is idempotent, so both paths can run.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please sign in again." }, { status: 401 });
  if (session.role !== "STUDENT" && session.role !== "PARENT") {
    return Response.json({ error: "Only students and parents can confirm payments." }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, `paystack-verify-${session.id}`), 10, 60_000)) {
    return tooManyRequests();
  }
  if (!paystackEnabled()) {
    return Response.json({ error: "Online payment is not switched on." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid reference" }, { status: 400 });

  const payment = await prisma.payment.findFirst({
    where: { reference: parsed.data.reference, method: "PAYSTACK" },
    include: { invoice: { select: { studentId: true } } },
  });
  if (!payment) return Response.json({ error: "Payment not found." }, { status: 404 });

  const allowed = await payableStudentIds(session.id);
  if (!allowed.includes(payment.invoice.studentId)) {
    return Response.json({ error: "You cannot confirm this payment." }, { status: 403 });
  }
  if (payment.status === "SUCCESS") {
    revalidatePath("/portal");
    return Response.json({ status: "SUCCESS" });
  }

  let verified;
  try {
    verified = await verifyTransaction(parsed.data.reference);
  } catch (error) {
    console.error("Paystack verify failed:", error);
    return Response.json({ status: payment.status, error: "Could not reach Paystack." }, { status: 502 });
  }
  if (!verified) return Response.json({ status: payment.status });

  if (verified.status !== "success") {
    return Response.json({ status: verified.status === "failed" ? "FAILED" : "PENDING" });
  }

  const settled = await settleSuccessfulPayment({
    reference: parsed.data.reference,
    amountNaira: verified.amountNaira,
    channel: verified.channel,
    source: "verify",
  });

  revalidatePath("/portal");
  revalidatePath("/admin/fees");
  if (settled) return Response.json({ status: "SUCCESS" });

  // The payment row we read above may be out of date: the webhook often lands a
  // moment before this request, and this call then settles nothing because the
  // money is already credited. Answer from the row's current state so a payment
  // the webhook settled is never reported as failed.
  const current = await prisma.payment.findUnique({
    where: { id: payment.id },
    select: { status: true },
  });
  if (current?.status === "SUCCESS") return Response.json({ status: "SUCCESS" });

  // Paystack says the charge succeeded but our record is not paid: either the
  // amount did not match the checkout or something else needs the bursary.
  return Response.json({ status: "FAILED" });
}
