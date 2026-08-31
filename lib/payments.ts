import type { AppSettings, Order } from "@/lib/types";

export const PAYMENT_METHOD_IDS = ["cash", "venmo", "cashapp", "stripe"] as const;
export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

export const PAYMENT_METHOD_META: Record<
  PaymentMethodId,
  { label: string; shortLabel: string; description: string }
> = {
  cash: {
    label: "Cash",
    shortLabel: "Cash",
    description: "Hand cash to the operator when you order or at delivery.",
  },
  venmo: {
    label: "Venmo",
    shortLabel: "Venmo",
    description: "Send the prepay amount via Venmo. Include your order code in the note.",
  },
  cashapp: {
    label: "Cash App",
    shortLabel: "Cash App",
    description: "Send the prepay amount on Cash App. Include your order code in the note.",
  },
  stripe: {
    label: "Card (Stripe)",
    shortLabel: "Card",
    description: "Pay now with debit or credit card. Secured by Stripe.",
  },
};

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Map legacy stored values to canonical ids. */
export function normalizePaymentMethodId(raw: string): PaymentMethodId | null {
  const v = raw.trim().toLowerCase();
  if (v === "cash" || v === "cash prepay") return "cash";
  if (v === "venmo") return "venmo";
  if (v === "cashapp" || v === "cash app") return "cashapp";
  if (v === "stripe" || v === "card" || v === "card (stripe)") return "stripe";
  return null;
}

export function getPaymentMethodLabel(raw: string): string {
  const id = normalizePaymentMethodId(raw);
  if (id) return PAYMENT_METHOD_META[id].label;
  return raw;
}

export function isDigitalPrepay(method: string): boolean {
  const id = normalizePaymentMethodId(method);
  return id === "venmo" || id === "cashapp" || id === "stripe";
}

/** Payment methods enabled in settings and configured for use. */
export function getAvailablePaymentMethods(settings: AppSettings): PaymentMethodId[] {
  const out: PaymentMethodId[] = [];
  for (const raw of settings.payment_methods) {
    const id = normalizePaymentMethodId(raw);
    if (!id) continue;
    if (id === "stripe" && (!settings.stripe_enabled || !stripeConfigured())) continue;
    if (id === "venmo" && !settings.venmo_username?.trim()) continue;
    if (id === "cashapp" && !settings.cashapp_cashtag?.trim()) continue;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

export function venmoPayUrl(
  username: string,
  amount: number,
  note: string,
): string {
  const user = username.replace(/^@/, "").trim();
  const params = new URLSearchParams({
    txn: "pay",
    recipients: user,
    amount: amount.toFixed(2),
    note: note.slice(0, 200),
  });
  return `https://venmo.com/?${params.toString()}`;
}

export function cashAppPayUrl(cashtag: string, amount: number): string {
  const tag = cashtag.replace(/^\$/, "").trim();
  return `https://cash.app/$${encodeURIComponent(tag)}/${amount.toFixed(2)}`;
}

export function paymentInstructions(
  order: Order,
  settings: AppSettings,
): { title: string; amount: number; body: string; actionUrl?: string; actionLabel?: string } {
  const id = normalizePaymentMethodId(order.payment_method) ?? "cash";
  const amount = order.max_authorized_total;
  const code = order.order_code;

  switch (id) {
    case "venmo":
      const venmo = settings.venmo_username?.trim() ?? "";
      return {
        title: "Pay with Venmo",
        amount,
        body: `Send ${amount.toFixed(2)} to @${venmo.replace(/^@/, "")}. Put ${code} in the payment note so we can match your order.`,
        actionUrl: venmo ? venmoPayUrl(venmo, amount, `Lunch Run ${code}`) : undefined,
        actionLabel: "Open Venmo",
      };
    case "cashapp":
      const tag = settings.cashapp_cashtag?.trim() ?? "";
      return {
        title: "Pay with Cash App",
        amount,
        body: `Send ${amount.toFixed(2)} to $${tag.replace(/^\$/, "")}. Add ${code} in the note.`,
        actionUrl: tag ? cashAppPayUrl(tag, amount) : undefined,
        actionLabel: "Open Cash App",
      };
    case "stripe":
      return {
        title: order.payment_status === "paid" ? "Card payment received" : "Pay with card",
        amount,
        body:
          order.payment_status === "paid"
            ? "Your card payment was received. We'll shop and deliver your snacks."
            : "Complete card payment to confirm your order.",
      };
    default:
      return {
        title: "Give the operator cash now",
        amount,
        body: `Hand over ${amount.toFixed(2)} before shopping starts. Covers max snack prices + fee. Change back at delivery if snacks cost less.`,
      };
  }
}
