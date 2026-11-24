"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type State = "checking" | "paid" | "pending" | "failed" | "error";

/**
 * Shown when the parent returns from Paystack. Asks the server to confirm the
 * reference with Paystack, so the balance updates even if the webhook was late.
 */
export function PaymentNotice({ reference }: { reference: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;

    async function confirm() {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        // A failed request is not a failed payment: never tell a parent their money
        // did not go through when we simply could not check.
        if (!res.ok || data.error) {
          setState("error");
          return;
        }
        if (data.status === "SUCCESS") {
          setState("paid");
          router.refresh();
        } else if (data.status === "FAILED") {
          setState("failed");
        } else {
          setState("pending");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    confirm();
    return () => {
      cancelled = true;
    };
  }, [reference, router]);

  const message: Record<State, string> = {
    checking: "Confirming your payment with Paystack…",
    paid: "Payment received — this term's balance below has been updated.",
    pending:
      "Paystack has not confirmed this payment yet. If you completed checkout, refresh in a minute.",
    failed:
      "We have not recorded this payment as received, so your balance is unchanged. You can try again, or show the bursary your Paystack receipt — a payment that reached us is never lost.",
    error:
      "We couldn't reach Paystack just now. If you completed checkout, refresh this page in a minute — your payment is not lost.",
  };

  return (
    <p className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4 text-sm text-gold-300">
      {message[state]}
    </p>
  );
}
