"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paymentAction, statusAction } from "@/lib/actions";
import type { Order } from "@/lib/types";
import { formatMoney, formatMoneyRange } from "@/lib/utils";
import { cn } from "@/lib/utils";

const FILTERS = [
  "all",
  "paid",
  "unpaid",
  "shopping",
  "purchased",
  "ready",
  "delivered",
  "cancelled",
] as const;

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      if (q && !o.customer_name.toLowerCase().includes(q) && !o.order_code.toLowerCase().includes(q)) {
        return false;
      }
      switch (filter) {
        case "paid":
          return o.payment_status === "paid";
        case "unpaid":
          return o.payment_status === "unpaid";
        case "shopping":
          return ["shopping", "shopping_soon"].includes(o.status);
        case "purchased":
          return o.status === "purchased";
        case "ready":
          return o.status === "ready";
        case "delivered":
          return o.status === "delivered";
        case "cancelled":
          return o.status === "cancelled";
        default:
          return true;
      }
    });
  }, [orders, filter, search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Today&apos;s Orders</h1>
        <p className="text-neutral-500">{orders.length} total</p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by student name…"
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize",
              filter === f ? "bg-lr-black text-white" : "bg-white border",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((order) => (
          <article
            key={order.id}
            className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{order.customer_name}</h2>
                <p className="font-mono text-sm text-neutral-500">
                  {order.order_code}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  tone={order.payment_status === "paid" ? "success" : "warning"}
                >
                  {order.payment_status}
                </Badge>
                <Badge tone="neutral">{order.status}</Badge>
              </div>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-neutral-600">
              {(order.items ?? []).map((item) => (
                <li key={item.id}>
                  {item.quantity}× {item.product_name}
                </li>
              ))}
            </ul>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-neutral-400">Est. total</dt>
                <dd className="font-bold">
                  {formatMoneyRange(
                    order.estimated_total_min,
                    order.estimated_total_max,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">Collect now</dt>
                <dd className="text-lg font-black text-lr-black">
                  {formatMoney(order.max_authorized_total)}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">Cash collected</dt>
                <dd className="font-bold">{formatMoney(order.amount_paid)}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">Location</dt>
                <dd className="font-bold">
                  {order.delivery_location_other || order.delivery_location}
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {order.payment_status !== "paid" ? (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const collect =
                        order.final_total != null
                          ? order.final_total
                          : order.max_authorized_total;
                      const result = await paymentAction(
                        order.id,
                        collect,
                        "paid",
                      );
                      if (!result.ok) {
                        toast.error(result.error || "Collect failed");
                        return;
                      }
                      toast.success(`Collected ${formatMoney(collect)}`);
                      router.refresh();
                    })
                  }
                >
                  Collect{" "}
                  {formatMoney(
                    order.final_total != null
                      ? order.final_total
                      : order.max_authorized_total,
                  )}
                </Button>
              ) : (
                <div className="col-span-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 sm:col-span-1">
                  Prepaid {formatMoney(order.amount_paid)}
                  {order.final_total != null
                    ? ` · change ${formatMoney(Math.max(0, order.amount_paid - order.final_total))}`
                    : " · change after shopping"}
                </div>
              )}
              {["purchased", "returning", "ready"].includes(order.status) ||
              order.final_total != null ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={pending || order.status === "ready"}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await statusAction(order.id, "ready");
                      if (!result.ok) {
                        toast.error(result.error || "Update failed");
                        return;
                      }
                      toast.success("Marked ready for delivery");
                      router.refresh();
                    })
                  }
                >
                  {order.status === "ready" ? "Ready" : "Mark Ready"}
                </Button>
              ) : null}
              <Button
                size="lg"
                variant="ghost"
                className="col-span-2 w-full sm:col-span-1 sm:w-auto"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await statusAction(order.id, "cancelled");
                    if (!result.ok) {
                      toast.error(result.error || "Cancel failed");
                      return;
                    }
                    toast.message("Order cancelled");
                    router.refresh();
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
