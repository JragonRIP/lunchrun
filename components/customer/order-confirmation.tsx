"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { toSavedOrder, useMyOrdersStore } from "@/lib/store/my-orders";
import type { Order } from "@/lib/types";
import { formatMoney, formatMoneyRange } from "@/lib/utils";

export function OrderConfirmation({ order }: { order: Order }) {
  const saveOrder = useMyOrdersStore((s) => s.saveOrder);

  useEffect(() => {
    saveOrder(toSavedOrder(order));
  }, [order, saveOrder]);

  return (
    <div className="space-y-6 py-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-pop">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      <div>
        <h1 className="text-3xl font-black tracking-tight">ORDER RECEIVED</h1>
        <p className="mt-2 text-lg text-neutral-600">
          You&apos;re all set, {order.customer_name.split(" ")[0]}!
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-100 bg-white p-5 text-left shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-lg font-black">{order.order_code}</span>
          <Badge tone="success">{ORDER_STATUS_LABELS[order.status]}</Badge>
        </div>

        <div className="mt-4 rounded-2xl bg-lr-yellow p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-lr-black/70">
            Give the operator this cash now
          </p>
          <p className="mt-1 text-4xl font-black text-lr-black">
            {formatMoney(order.max_authorized_total)}
          </p>
          <p className="mt-2 text-sm text-lr-black/70">
            Covers your max snack prices + {formatMoney(order.service_fee)} fee.
            You get change back at delivery if snacks cost less.
          </p>
        </div>

        <ul className="mt-4 space-y-2 border-b border-neutral-50 pb-4 text-sm">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                {item.quantity}× {item.product_name}
              </span>
              <span className="text-neutral-500">
                max {formatMoney(item.max_price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 text-sm">
          <Row
            label="Estimated snacks"
            value={formatMoneyRange(
              order.merchandise_estimate_min,
              order.merchandise_estimate_max,
            )}
          />
          <Row label="Lunch Run fee" value={formatMoney(order.service_fee)} />
          <Row
            label="Estimated total"
            value={formatMoneyRange(
              order.estimated_total_min,
              order.estimated_total_max,
            )}
          />
          <Row
            label="Cash to give now"
            value={formatMoney(order.max_authorized_total)}
          />
          <Row label="Payment" value="Cash Prepay" />
          <Row
            label="Find you"
            value={order.delivery_location_other || order.delivery_location}
          />
        </dl>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4 text-left text-sm text-neutral-600">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This order is saved on your phone. Open the{" "}
          <strong>Orders</strong> tab anytime to check status and see what you
          ordered.
        </p>
      </div>

      <Link href={`/order/${order.tracking_token}`}>
        <Button variant="outline" className="w-full">
          View your order
        </Button>
      </Link>
      <Link href="/track">
        <Button className="mt-3 w-full">Go to My Orders</Button>
      </Link>
      <Link href="/">
        <Button variant="ghost" className="mt-2 w-full">
          Back to menu
        </Button>
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold capitalize">{value}</dd>
    </div>
  );
}
