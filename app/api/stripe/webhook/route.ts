import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { applyStripeCheckoutComplete } from "@/lib/services/supabase-data";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId && session.payment_status === "paid") {
      const amountCents = session.amount_total ?? 0;
      try {
        await applyStripeCheckoutComplete(
          session.id,
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
          orderId,
          amountCents,
        );
      } catch (e) {
        console.error("stripe webhook apply payment", e);
        return NextResponse.json({ error: "Apply failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
