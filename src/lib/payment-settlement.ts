import "server-only";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";

type SettleInput = {
  reference: string;
  amountNaira: number;
  channel?: string | null;
  source: "webhook" | "verify";
};

/**
 * Mark a Paystack payment as paid and move the invoice balance.
 *
 * Safe to call more than once (webhook retries, webhook plus confirmation): only
 * the delivery that flips the payment out of its previous status changes the
 * invoice. A payment that had been written off as FAILED still settles when
 * Paystack confirms the money arrived, so a slow or missed webhook never loses a
 * parent's payment. Overpayments are credited in full and logged for the bursary
 * to refund or carry forward.
 */
export async function settleSuccessfulPayment(
  input: SettleInput
): Promise<{ invoiceId: string; credited: number; excess: number } | null> {
  const payment = await prisma.payment.findFirst({
    where: { reference: input.reference, method: "PAYSTACK" },
  });
  if (!payment) return null;
  if (payment.status === "SUCCESS") return null;

  if (!Number.isFinite(input.amountNaira) || Math.abs(input.amountNaira - payment.amount) > 0.01) {
    // The signed amount should match what we asked Paystack to charge.
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await audit("payment.amount-mismatch", {
      entity: "Payment",
      entityId: payment.id,
      detail: `expected ₦${payment.amount}, got ₦${input.amountNaira} · ${input.reference}`,
      session: null,
    });
    return null;
  }

  const settled = await prisma.$transaction(async (tx) => {
    // Only the first delivery may move the payment out of its current status.
    const marked = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "SUCCESS" } },
      data: {
        status: "SUCCESS",
        channel: input.channel ?? null,
        paidAt: new Date(),
      },
    });
    if (marked.count === 0) return null;

    const invoice = await tx.feeInvoice.findUnique({ where: { id: payment.invoiceId } });
    if (!invoice) return null;

    const paid = invoice.paidAmount + payment.amount;
    await tx.feeInvoice.update({
      where: { id: invoice.id },
      data: { paidAmount: paid, status: paid >= invoice.amount ? "PAID" : "PART" },
    });
    return {
      invoiceId: invoice.id,
      credited: payment.amount,
      excess: Math.max(0, paid - invoice.amount),
    };
  });

  if (!settled) return null;

  await audit("payment.paystack", {
    entity: "FeeInvoice",
    entityId: settled.invoiceId,
    detail:
      `₦${settled.credited} · ${input.reference} · ${input.source}` +
      (settled.excess > 0 ? ` · overpaid by ₦${settled.excess}` : ""),
    session: null,
  });
  return settled;
}
