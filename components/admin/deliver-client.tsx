"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deliverAction, notFoundAction, paymentAction } from "@/lib/actions";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function DeliverClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paidInputs, setPaidInputs] = useState<Record<string, string>>({});

  const active = useMemo(
    () => orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),
    [orders],
  );
  const completed = useMemo(
    () => orders.filter((o) => o.status === "delivered"),
    [orders],
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Deliveries & Change</h1>
        <p className="text-sm text-neutral-500">Large cards for hallway delivery</p>
      </div>

      <div className="space-y-4">
        {active.map((order) => {
          const paid =
            paidInputs[order.id] ??
            (order.amount_paid ? String(order.amount_paid) : "");
          const finalTotal = order.final_total ?? order.max_authorized_total;
          const change = Math.max(0, Number(paid || 0) - finalTotal);

          return (
            <article
              key={order.id}
              className="rounded-[28px] border-2 border-lr-black bg-white p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                    {order.customer_name}
                  </h2>
                  <p className="mt-1 text-lg font-bold text-neutral-500">
                    {order.delivery_location_other || order.delivery_location}
                  </p>
                </div>
                <Badge
                  tone={order.payment_status === "paid" ? "success" : "warning"}
                >
                  {order.payment_status}
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-xs font-bold uppercase text-neutral-400">
                    Total
                  </p>
                  <p className="text-3xl font-black">{formatMoney(finalTotal)}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-xs font-bold uppercase text-neutral-400">
                    Paid
                  </p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    className="mt-1 h-12 text-center text-xl font-black"
                    value={paid}
                    onChange={(e) =>
                      setPaidInputs((p) => ({
                        ...p,
                        [order.id]: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      startTransition(async () => {
                        if (!paid) return;
                        await paymentAction(order.id, Number(paid));
                        router.refresh();
                      })
                    }
                  />
                </div>
                <div className="rounded-2xl bg-lr-yellow p-3">
                  <p className="text-xs font-bold uppercase">Change</p>
                  <p className="text-3xl font-black">{formatMoney(change)}</p>
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-sm text-neutral-600">
                {(order.items ?? [])
                  .filter((i) => i.status !== "skipped" && i.status !== "unavailable")
                  .map((item) => (
                    <li key={item.id}>
                      {item.quantity}×{" "}
                      {item.replacement_name || item.product_name}
                      {item.actual_price != null || item.replacement_price != null
                        ? ` — ${formatMoney((item.replacement_price ?? item.actual_price ?? 0) * item.quantity)}`
                        : ""}
                    </li>
                  ))}
              </ul>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full flex-1"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      if (paid) await paymentAction(order.id, Number(paid), "paid");
                      await deliverAction(order.id);
                      toast.success(`Delivered to ${order.customer_name}`);
                      router.refresh();
                    })
                  }
                >
                  MARK DELIVERED
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await notFoundAction(order.id);
                      toast.message("Couldn't find student — retry later");
                      router.refresh();
                    })
                  }
                >
                  Couldn&apos;t Find
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {completed.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-neutral-400">
            Completed
          </h2>
          <div className="space-y-2 opacity-70">
            {completed.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3"
              >
                <span className="font-bold">{o.customer_name}</span>
                <span className="text-sm">
                  {formatMoney(o.final_total)} · Change{" "}
                  {formatMoney(o.change_owed)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
