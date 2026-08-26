"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { toSavedOrder, useMyOrdersStore } from "@/lib/store/my-orders";
import type { Order } from "@/lib/types";
import { formatMoney, formatMoneyRange } from "@/lib/utils";

export function OrderStatusView({ order }: { order: Order }) {
  const saveOrder = useMyOrdersStore((s) => s.saveOrder);
  const items = order.items ?? [];
  const purchased = items.filter(
    (i) => i.status === "found" || i.status === "substituted",
  );
  const skipped = items.filter(
    (i) => i.status === "skipped" || i.status === "unavailable",
  );

  useEffect(() => {
    saveOrder(toSavedOrder(order));
  }, [order, saveOrder]);

  return (
    <div className="space-y-5">
      <Link
        href="/track"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-500 hover:text-lr-black"
      >
        <ArrowLeft className="h-4 w-4" />
        All orders
      </Link>

      <div className="rounded-3xl bg-lr-black p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-lr-yellow">
          Order {order.order_code}
        </p>
        <h1 className="mt-1 text-2xl font-black">{order.customer_name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="yellow">{ORDER_STATUS_LABELS[order.status]}</Badge>
          <Badge
            tone={
              order.payment_status === "paid"
                ? "success"
                : order.payment_status === "unpaid"
                  ? "warning"
                  : "neutral"
            }
          >
            {order.payment_status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
        <h2 className="font-black">Totals</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Estimated</dt>
            <dd className="font-semibold">
              {formatMoneyRange(
                order.estimated_total_min,
                order.estimated_total_max,
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Final total</dt>
            <dd className="text-lg font-black">
              {order.final_total != null
                ? formatMoney(order.final_total)
                : "Pending"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Paid</dt>
            <dd className="font-semibold">{formatMoney(order.amount_paid)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Change owed</dt>
            <dd className="font-black text-emerald-600">
              {formatMoney(order.change_owed)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Location</dt>
            <dd className="font-semibold">
              {order.delivery_location_other || order.delivery_location}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Payment</dt>
            <dd className="font-semibold">{order.payment_method}</dd>
          </div>
        </dl>
      </div>

      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
        <h2 className="font-black">What you ordered</h2>
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 border-b border-neutral-50 pb-3 last:border-0"
            >
              <div>
                <p className="font-semibold">
                  {item.quantity}× {item.product_name}
                </p>
                {item.status === "substituted" && item.replacement_name ? (
                  <p className="text-sm text-amber-700">
                    Sub: {item.replacement_name}
                  </p>
                ) : null}
                <p className="text-xs capitalize text-neutral-400">
                  {item.status.replace("_", " ")}
                </p>
              </div>
              <p className="font-bold">
                {item.actual_price != null || item.replacement_price != null
                  ? formatMoney(
                      (item.replacement_price ?? item.actual_price ?? 0) *
                        item.quantity,
                    )
                  : `${formatMoney(item.max_price * item.quantity)} max`}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {skipped.length > 0 ? (
        <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
          <h2 className="font-black text-amber-900">Skipped / unavailable</h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            {skipped.map((i) => (
              <li key={i.id}>
                {i.product_name} ×{i.quantity}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {purchased.length > 0 && order.final_total != null ? (
        <p className="text-center text-sm text-neutral-500">
          Delivered during lunch. Thanks for using Lunch Run!
        </p>
      ) : (
        <p className="text-center text-sm text-neutral-500">
          We&apos;re on it — hang tight until lunch.
        </p>
      )}

      <Link href="/track">
        <Button variant="outline" className="w-full">
          Back to My Orders
        </Button>
      </Link>
    </div>
  );
}
