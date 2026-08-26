import { NextResponse } from "next/server";
import { findOrderByCodeAndName } from "@/lib/services/data";
import { z } from "zod";

const bodySchema = z.object({
  code: z.string().min(3).max(20),
  name: z.string().min(2).max(60),
});

const rateMap = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.reset < now) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await findOrderByCodeAndName(parsed.data.code, parsed.data.name);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    token: order.tracking_token,
    order: {
      tracking_token: order.tracking_token,
      order_code: order.order_code,
      customer_name: order.customer_name,
      created_at: order.created_at,
      max_authorized_total: order.max_authorized_total,
      estimated_total_min: order.estimated_total_min,
      estimated_total_max: order.estimated_total_max,
      delivery_location: order.delivery_location,
      delivery_location_other: order.delivery_location_other,
      items: (order.items ?? []).map((i) => ({
        product_name: i.product_name,
        quantity: i.quantity,
      })),
    },
  });
}
