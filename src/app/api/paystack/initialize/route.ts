import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { initializeTransaction, paystackEnabled } from "@/lib/paystack";
import { payableStudentIds } from "@/lib/payment-access";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";

const schema = z.object({ invoiceId: z.string().min(1) });

/** A checkout stays usable for half an hour, then it is written off. */
const CHECKOUT_TTL_MS = 30 * 60_000;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please sign in again." }, { status: 401 });
  if (session.role !== "STUDENT" && session.role !== "PARENT") {
    return Response.json({ error: "Only students and parents can pay online." }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, `paystack-${session.id}`), 5, 60_000)) return tooManyRequests();
  if (!paystackEnabled()) {
    return Response.json(
      { error: "Online payment is not switched on yet. Please pay at the bursary." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Choose an invoice to pay." }, { status: 400 });

  const invoice = await prisma.feeInvoice.findUnique({ where: { id: parsed.data.invoiceId } });
  if (!invoice) return Response.json({ error: "That invoice was not found." }, { status: 404 });

  const allowed = await payableStudentIds(session.id);
  if (!allowed.includes(invoice.studentId)) {
    return Response.json({ error: "You cannot pay this invoice." }, { status: 403 });
  }

  const balance = Math.max(0, invoice.amount - invoice.paidAmount);
  if (balance <= 0) return Response.json({ error: "This invoice is already paid." }, { status: 400 });

  // One open checkout per invoice. Clicking Pay again returns the link already
  // issued, so a double-click cannot create two live checkouts and take the fee
  // twice.
  const cutoff = new Date(Date.now() - CHECKOUT_TTL_MS);
  const open = await prisma.payment.findFirst({
    where: {
      invoiceId: invoice.id,
      method: "PAYSTACK",
      status: "PENDING",
      amount: balance,
      checkoutUrl: { not: null },
      paidAt: { gte: cutoff },
    },
    orderBy: { paidAt: "desc" },
  });
  if (open?.checkoutUrl) {
    return Response.json({ authorizationUrl: open.checkoutUrl, reference: open.reference });
  }

  // Older attempts are left on the record but no longer offered. If one of them
  // was actually paid, its webhook still credits the invoice (settlement accepts
  // FAILED payments), so nothing is lost.
  await prisma.payment.updateMany({
    where: { invoiceId: invoice.id, method: "PAYSTACK", status: "PENDING" },
    data: { status: "FAILED" },
  });

  const reference = `TMD-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  const pending = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: balance,
      method: "PAYSTACK",
      reference,
      status: "PENDING",
    },
  });

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const checkout = await initializeTransaction({
      email: session.email,
      amountNaira: balance,
      reference,
      callbackUrl: `${origin}/portal?payment=${encodeURIComponent(reference)}`,
      metadata: { invoiceId: invoice.id, studentId: invoice.studentId },
    });

    await prisma.payment.update({
      where: { id: pending.id },
      data: { checkoutUrl: checkout.authorization_url },
    });

    await audit("payment.initialize", {
      entity: "FeeInvoice",
      entityId: invoice.id,
      detail: `₦${balance} · ${reference}`,
      session,
    });

    return Response.json({ authorizationUrl: checkout.authorization_url, reference });
  } catch (error) {
    console.error("Paystack initialize failed:", error);
    await prisma.payment.update({ where: { id: pending.id }, data: { status: "FAILED" } });
    return Response.json(
      { error: "We couldn't start the payment. Please try again or pay at the bursary." },
      { status: 502 },
    );
  }
}
