"use client";

import { useState } from "react";

type PayableInvoice = {
  id: string;
  label: string;
  balance: number;
};

const naira = (n: number) => "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export function PayFees({
  invoices,
  enabled,
  className = "",
}: {
  invoices: PayableInvoice[];
  enabled: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function pay(invoiceId: string) {
    setBusy(invoiceId);
    setError("");
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorizationUrl) {
        throw new Error(data.error || "We couldn't start the payment.");
      }
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't start the payment.");
      setBusy(null);
    }
  }

  if (invoices.length === 0) return null;

  return (
    <div className={`rounded-[12px] border border-ivory-100/10 bg-navy-800/60 p-4 ${className}`}>
      <p className="text-sm font-semibold">Pay online</p>
      {enabled ? (
        <ul className="mt-3 space-y-2">
          {invoices.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-ivory-100/70">
                {i.label} · {naira(i.balance)} outstanding
              </span>
              <button
                type="button"
                onClick={() => pay(i.id)}
                disabled={busy !== null}
                className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-navy-950 disabled:opacity-60"
              >
                {busy === i.id ? "Opening checkout…" : "Pay with Paystack"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ivory-100/70">
          Online payment is not switched on yet. Pay at the bursary or by bank transfer.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-ember-500">{error}</p>}
      {enabled && (
        <p className="mt-3 text-xs text-ivory-100/40">
          You will finish on Paystack&apos;s secure checkout. The balance updates here once
          Paystack confirms the payment.
        </p>
      )}
    </div>
  );
}
