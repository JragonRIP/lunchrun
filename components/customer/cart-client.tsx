"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PLACEHOLDER_IMAGE, effectiveServiceFee } from "@/lib/constants";
import { useCartStore } from "@/lib/store/cart";
import type { AppSettings } from "@/lib/types";
import {
  SUBSTITUTION_LABELS,
  formatMoney,
  formatMoneyRange,
  roundMoney,
} from "@/lib/utils";

export function CartClient({
  settings,
  orderingOpen,
}: {
  settings: AppSettings;
  orderingOpen: boolean;
}) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const fee = effectiveServiceFee(settings);
  const merchMin = roundMoney(
    items.reduce(
      (sum, i) => sum + (i.minEstimated ?? i.estimatedPrice ?? 0) * i.quantity,
      0,
    ),
  );
  const merchMax = roundMoney(
    items.reduce(
      (sum, i) =>
        sum + (i.maxEstimated ?? i.estimatedPrice ?? i.maxPrice) * i.quantity,
      0,
    ),
  );
  const maxAuth = roundMoney(
    items.reduce((sum, i) => sum + i.maxPrice * i.quantity, 0) + fee,
  );

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add snacks from the catalog to get started."
        action={
          <Link href="/">
            <Button>Browse snacks</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5 pb-28">
      <h1 className="text-2xl font-black">Your Cart</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
          >
            <div className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                <Image
                  src={item.imageUrl || PLACEHOLDER_IMAGE}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={!item.imageUrl}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-neutral-500">
                      {[item.flavor, item.size].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm font-semibold">
                  Est.{" "}
                  {formatMoneyRange(
                    item.minEstimated ?? item.estimatedPrice,
                    item.maxEstimated ?? item.estimatedPrice,
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  Max {formatMoney(item.maxPrice)} ·{" "}
                  {SUBSTITUTION_LABELS[item.substitution]}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 p-1">
                <button
                  type="button"
                  className="rounded-lg p-1.5 hover:bg-neutral-100"
                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-sm font-bold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="rounded-lg p-1.5 hover:bg-neutral-100"
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm font-bold">
                Max {formatMoney(item.maxPrice * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
        <Row label="Merchandise estimate" value={formatMoneyRange(merchMin, merchMax)} />
        <Row label="Lunch Run fee" value={formatMoney(fee)} />
        <Row
          label="Estimated total"
          value={formatMoneyRange(merchMin + fee, merchMax + fee)}
          strong
        />
        <div className="mt-4 rounded-2xl bg-lr-yellow/30 p-4">
          <p className="text-sm font-bold">Cash to give operator</p>
          <p className="text-3xl font-black">{formatMoney(maxAuth)}</p>
          <p className="mt-2 text-xs text-neutral-600">
            Hand over this amount before shopping (max snack prices +{" "}
            {formatMoney(fee)} fee). You get change at delivery if snacks cost
            less.
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur md:bottom-0">
        <div className="mx-auto max-w-lg">
          {orderingOpen ? (
            <Link href="/checkout">
              <Button size="lg" className="w-full">
                Checkout
              </Button>
            </Link>
          ) : (
            <Button size="lg" className="w-full" disabled>
              Ordering Closed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={strong ? "font-bold" : "text-neutral-500"}>{label}</span>
      <span className={strong ? "font-black text-base" : "font-semibold"}>
        {value}
      </span>
    </div>
  );
}
