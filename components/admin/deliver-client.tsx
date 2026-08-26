"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deliverAction, notFoundAction, paymentAction } from "@/lib/actions";
import { changeDue, prepayAmount } from "@/lib/order-money";
import type { Order } from "@/lib/types";
import { formatMoney, roundMoney } from "@/lib/utils";

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
        <p className="text-sm text-neutral-500">
          Change = cash collected − actual snacks − Lunch Run fee
        </p>
      </div>

      <div className="space-y-4">
        {active.map((order) => {
          const collectTarget = prepayAmount(order);
          const paidDefault =
            order.amount_paid > 0
              ? order.amount_paid
              : order.final_total != null
                ? order.final_total
                : collectTarget;
          const paidStr =
            paidInputs[order.id] ??
            (paidDefault ? String(paidDefault) : "");
          const paidNum = Number(paidStr);
          const merch = order.merchandise_actual;
          const fee = order.service_fee;
          const actualDue = order.final_total;
          const paidValid = Number.isFinite(paidNum) && paidNum >= 0;
          const change =
            actualDue != null && paidValid
              ? roundMoney(Math.max(0, paidNum - actualDue))
              : 0;
          const ready = actualDue != null;
          const underpaid =
            ready && (!paidValid || paidNum + 0.001 < (actualDue ?? 0));
          const invalidCash = ready && !paidValid;

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
                  {order.payment_status === "paid" ? "prepaid" : order.payment_status}
                </Badge>
              </div>

              <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">Snacks (actual)</span>
                  <span className="font-bold">
                    {merch != null ? formatMoney(merch) : "—"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between gap-3">
                  <span className="text-neutral-500">Lunch Run fee</span>
                  <span className="font-bold">{formatMoney(fee)}</span>
                </div>
                {order.tax_amount > 0 ? (
                  <div className="mt-1 flex justify-between gap-3">
                    <span className="text-neutral-500">Tax</span>
                    <span className="font-bold">{formatMoney(order.tax_amount)}</span>
                  </div>
                ) : null}
                <div className="mt-2 flex justify-between gap-3 border-t border-neutral-200 pt-2">
                  <span className="font-black">Actual total</span>
                  <span className="text-xl font-black">
                    {ready ? formatMoney(actualDue) : "Finish shopping first"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between gap-3 text-neutral-500">
                  <span>Should have prepaid</span>
                  <span className="font-semibold">{formatMoney(collectTarget)}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-xs font-bold uppercase text-neutral-400">
                    Actual due
                  </p>
                  <p className="text-3xl font-black">
                    {ready ? formatMoney(actualDue) : "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <p className="text-xs font-bold uppercase text-neutral-400">
                    Cash collected
                  </p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    className="mt-1 h-12 text-center text-xl font-black"
                    value={paidStr}
                    onChange={(e) =>
                      setPaidInputs((p) => ({
                        ...p,
                        [order.id]: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      startTransition(async () => {
                        const n = Number(paidStr);
                        if (!paidStr || !Number.isFinite(n) || n < 0) return;
                        const result = await paymentAction(order.id, n);
                        if (!result.ok) {
                          toast.error(result.error || "Could not save payment");
                          return;
                        }
                        router.refresh();
                      })
                    }
                  />
                </div>
                <div className="rounded-2xl bg-lr-yellow p-3">
                  <p className="text-xs font-bold uppercase">Change to give</p>
                  <p className="text-3xl font-black">
                    {ready ? formatMoney(change) : "—"}
                  </p>
                </div>
              </div>

              {!ready ? (
                <p className="mt-3 text-sm font-semibold text-amber-700">
                  Save shelf prices in Shop, then Finish Shopping — then change
                  will calculate from actual snack cost + fee.
                </p>
              ) : invalidCash ? (
                <p className="mt-3 text-sm font-semibold text-red-700">
                  Enter a valid cash amount collected.
                </p>
              ) : underpaid ? (
                <p className="mt-3 text-sm font-semibold text-red-700">
                  Cash collected is less than actual due (
                  {formatMoney(actualDue)}).
                </p>
              ) : null}

              <ul className="mt-4 space-y-1 text-sm text-neutral-600">
                {(order.items ?? [])
                  .filter((i) => i.status !== "skipped" && i.status !== "unavailable")
                  .map((item) => (
                    <li key={item.id}>
                      {item.quantity}×{" "}
                      {item.replacement_name || item.product_name}
                      {item.actual_price != null || item.replacement_price != null
                        ? ` — ${formatMoney((item.replacement_price ?? item.actual_price ?? 0) * item.quantity)}`
                        : " — price pending"}
                    </li>
                  ))}
              </ul>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full flex-1"
                  disabled={pending || !ready || underpaid || invalidCash}
                  onClick={() =>
                    startTransition(async () => {
                      if (!paidValid) {
                        toast.error("Enter a valid cash amount");
                        return;
                      }
                      const paid = await paymentAction(order.id, paidNum);
                      if (!paid.ok) {
                        toast.error(paid.error || "Could not save payment");
                        return;
                      }
                      const delivered = await deliverAction(order.id);
                      if (!delivered.ok) {
                        toast.error(delivered.error || "Deliver failed");
                        return;
                      }
                      toast.success(
                        `Delivered · give ${formatMoney(change)} change`,
                      );
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
                      const result = await notFoundAction(order.id);
                      if (!result.ok) {
                        toast.error(result.error || "Update failed");
                        return;
                      }
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
                  Due {formatMoney(o.final_total)} · Change{" "}
                  {formatMoney(changeDue(o))}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
