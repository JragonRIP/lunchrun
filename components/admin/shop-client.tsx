"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check } from "lucide-react";
import { ProductThumb } from "@/components/shared/product-thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  finishShoppingAction,
  markUnavailableAction,
  setShelfPriceAction,
  substituteAction,
  togglePickedAction,
} from "@/lib/actions";
import type { ShoppingListItem } from "@/lib/types";
import { SUBSTITUTION_LABELS, cn, formatMoney, roundMoney } from "@/lib/utils";

export function ShopClient({ items }: { items: ShoppingListItem[] }) {
  const router = useRouter();
  const [layout, setLayout] = useState<"category" | "flat">("category");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [subs, setSubs] = useState<
    Record<string, { name: string; price: string }>
  >({});
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    if (layout === "flat") return [{ name: "All items", items }];
    const map = new Map<string, ShoppingListItem[]>();
    for (const item of items) {
      const list = map.get(item.categoryName) ?? [];
      list.push(item);
      map.set(item.categoryName, list);
    }
    return Array.from(map.entries()).map(([name, groupItems]) => ({
      name,
      items: groupItems,
    }));
  }, [items, layout]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Shopping List</h1>
          <p className="text-sm text-neutral-500 sm:text-base">
            {items.length} unique items · store mode
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-2xl border bg-white p-1">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-xl px-3 py-2.5 text-xs font-bold sm:flex-none",
                layout === "category" && "bg-lr-black text-white",
              )}
              onClick={() => setLayout("category")}
            >
              By Category
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-xl px-3 py-2.5 text-xs font-bold sm:flex-none",
                layout === "flat" && "bg-lr-black text-white",
              )}
              onClick={() => setLayout("flat")}
            >
              Flat List
            </button>
          </div>
          <Button
            className="w-full sm:w-auto"
            size="lg"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await finishShoppingAction();
                if (!result.ok) {
                  toast.error(result.error || "Could not finish shopping");
                  return;
                }
                toast.success("Shopping finished");
                router.push("/admin/deliver");
                router.refresh();
              })
            }
          >
            Finish Shopping
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-3xl bg-white p-8 text-center text-neutral-500">
          No Lunch Run orders yet today.
        </p>
      ) : null}

      {grouped.map((group) => (
        <section key={group.name} className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400">
            {group.name}
          </h2>
          {group.items.map((item) => {
            const priceVal =
              prices[item.productKey] ??
              (item.actualPrice != null
                ? String(item.actualPrice)
                : item.knownPrice != null
                  ? String(item.knownPrice)
                  : "");
            const shelf = Number(priceVal);
            const exceeded = item.customers.some(
              (c) => !Number.isNaN(shelf) && shelf > c.maxPrice,
            );
            const diff =
              item.knownPrice != null && !Number.isNaN(shelf)
                ? roundMoney(shelf - item.knownPrice)
                : null;

            return (
              <article
                key={item.productKey}
                className={cn(
                  "rounded-3xl border bg-white p-4 shadow-sm",
                  item.pickedUp && "border-emerald-200 bg-emerald-50/40",
                  exceeded && "border-red-300",
                )}
              >
                <div className="flex gap-3">
                  <ProductThumb name={item.name} imageUrl={item.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black">{item.name}</h3>
                        <p className="text-sm text-neutral-500">
                          {[item.brand, item.size, item.flavor]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <Badge tone="yellow">Qty {item.totalQty}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">
                      For:{" "}
                      {item.customers
                        .map((c) => `${c.customerName} ×${c.quantity}`)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Maxes:{" "}
                      {item.customers
                        .map((c) => `${c.customerName} ${formatMoney(c.maxPrice)}`)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Shelf price
                      {item.knownPrice != null
                        ? ` (listed ${formatMoney(item.knownPrice)})`
                        : ""}
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={priceVal}
                      onChange={(e) =>
                        setPrices((p) => ({
                          ...p,
                          [item.productKey]: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      className="h-12 text-lg font-bold"
                    />
                    {diff != null && diff !== 0 ? (
                      <p
                        className={cn(
                          "mt-1 text-xs font-semibold",
                          diff > 0 ? "text-amber-700" : "text-emerald-700",
                        )}
                      >
                        Difference: {diff > 0 ? "+" : ""}
                        {formatMoney(diff)}
                      </p>
                    ) : null}
                  </div>

                  <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold">
                    <input
                      type="checkbox"
                      className="h-6 w-6 rounded"
                      checked={item.pickedUp}
                      onChange={(e) =>
                        startTransition(async () => {
                          const checked = e.target.checked;
                          if (checked && priceVal && !Number.isNaN(Number(priceVal))) {
                            const result = await setShelfPriceAction(
                              item.productKey,
                              Number(priceVal),
                            );
                            if (!result.ok) {
                              toast.error(result.error);
                              return;
                            }
                            if (result.warnings.length) {
                              result.warnings.forEach((w: string) =>
                                toast.warning(w),
                              );
                            }
                          } else {
                            await togglePickedAction(item.productKey, checked);
                          }
                          router.refresh();
                        })
                      }
                    />
                    Found / picked up
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="lg"
                      disabled={pending || !priceVal}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await setShelfPriceAction(
                            item.productKey,
                            Number(priceVal),
                          );
                          if (!result.ok) {
                            toast.error(result.error);
                            return;
                          }
                          if (result.warnings.length) {
                            result.warnings.forEach((w: string) =>
                              toast.warning(w),
                            );
                          } else {
                            toast.success("Price saved");
                          }
                          router.refresh();
                        })
                      }
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await markUnavailableAction(item.productKey);
                          toast.message("Marked unavailable");
                          router.refresh();
                        })
                      }
                    >
                      Unavailable
                    </Button>
                  </div>
                </div>

                {exceeded ? (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-black">CUSTOMER MAXIMUM EXCEEDED</p>
                      <p>Do not purchase unless approved. Skip or substitute.</p>
                    </div>
                  </div>
                ) : null}

                {item.unavailable || exceeded ? (
                  <div className="mt-3 space-y-3 rounded-2xl bg-neutral-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      Substitution preferences
                    </p>
                    {item.customers.map((c) => (
                      <div
                        key={c.orderItemId}
                        className="rounded-xl border bg-white p-3"
                      >
                        <p className="font-bold">{c.customerName}</p>
                        <p className="text-sm text-neutral-500">
                          {SUBSTITUTION_LABELS[c.substitution]} · max{" "}
                          {formatMoney(c.maxPrice)}
                        </p>
                        {c.substitution !== "skip" ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Input
                              placeholder="Replacement name"
                              value={subs[c.orderItemId]?.name ?? ""}
                              onChange={(e) =>
                                setSubs((s) => ({
                                  ...s,
                                  [c.orderItemId]: {
                                    name: e.target.value,
                                    price: s[c.orderItemId]?.price ?? "",
                                  },
                                }))
                              }
                              className="h-10 flex-1"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={subs[c.orderItemId]?.price ?? ""}
                              onChange={(e) =>
                                setSubs((s) => ({
                                  ...s,
                                  [c.orderItemId]: {
                                    name: s[c.orderItemId]?.name ?? "",
                                    price: e.target.value,
                                  },
                                }))
                              }
                              className="h-10 w-28"
                            />
                            <Button
                              size="sm"
                              disabled={pending}
                              onClick={() =>
                                startTransition(async () => {
                                  const sub = subs[c.orderItemId];
                                  if (!sub?.name || !sub.price) {
                                    toast.error("Enter replacement details");
                                    return;
                                  }
                                  const result = await substituteAction({
                                    orderItemId: c.orderItemId,
                                    replacementName: sub.name,
                                    replacementPrice: Number(sub.price),
                                  });
                                  if (!result.ok) {
                                    toast.error(result.error);
                                    return;
                                  }
                                  toast.success("Substitution recorded");
                                  router.refresh();
                                })
                              }
                            >
                              Record sub
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
