import "server-only";

const API = "https://api.paystack.co";

/** Online payments stay off until a secret key is configured. */
export function paystackEnabled() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

type InitializeInput = {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
};

type InitializeResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

/** Start a Paystack transaction and return the hosted checkout URL. */
export async function initializeTransaction(input: InitializeInput): Promise<InitializeResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured");

  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNaira * 100), // Paystack expects kobo
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | { status?: boolean; message?: string; data?: InitializeResult }
    | null;

  if (!res.ok || !json?.status || !json.data?.authorization_url) {
    throw new Error(json?.message || `Paystack rejected the request (${res.status})`);
  }
  return json.data;
}

export type VerifiedTransaction = {
  status: string; // success | failed | abandoned
  amountNaira: number;
  channel: string | null;
};

/**
 * Ask Paystack what actually happened to a reference.
 *
 * Used when the parent returns from checkout: if the webhook was delayed, or the
 * site was restarted while it arrived, this still credits the invoice.
 */
export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured");

  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | {
        status?: boolean;
        data?: { status?: string; amount?: number; channel?: string | null };
      }
    | null;

  if (!res.ok || !json?.status || !json.data?.status) return null;

  return {
    status: json.data.status,
    amountNaira: Number(json.data.amount ?? 0) / 100,
    channel: json.data.channel ?? null,
  };
}
