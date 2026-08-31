import { NextResponse } from "next/server";
import { getStripe, siteUrl } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { normalizePaymentMethodId } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { trackingToken?: string };
    const trackingToken = body.trackingToken?.trim();
    if (!trackingToken) {
      return NextResponse.json({ error: "Missing order" }, { status: 400 });
    }

    const db = createServiceClient();
    const { data: row, error } = await db
      .from("orders")
      .select("*")
      .eq("tracking_token", trackingToken)
      .maybeSingle();
    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const method = normalizePaymentMethodId(String(row.payment_method));
    if (method !== "stripe") {
      return NextResponse.json({ error: "Not a card order" }, { status: 400 });
    }
    if (row.payment_status === "paid") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const amount = Number(row.max_authorized_total);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const stripe = getStripe();
    const base = siteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lunch Run ${row.order_code}`,
              description: "Snack prepay (max authorized). Change/refund if snacks cost less.",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: String(row.id),
        tracking_token: trackingToken,
      },
      success_url: `${base}/confirmed?token=${trackingToken}&paid=1`,
      cancel_url: `${base}/order/${trackingToken}`,
    });

    await db
      .from("orders")
      .update({
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("stripe checkout", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
