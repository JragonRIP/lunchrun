"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useCartStore } from "@/lib/store/cart";
import type { ProductWithCategory, SubstitutionPreference } from "@/lib/types";
import {
  SUBSTITUTION_LABELS,
  freshnessLabel,
  formatMoney,
  formatMoneyRange,
  suggestMaxPrice,
} from "@/lib/utils";

export function ProductDetailSheet({
  product,
  open,
  onClose,
  orderingOpen,
}: {
  product: ProductWithCategory | null;
  open: boolean;
  onClose: () => void;
  orderingOpen: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [maxPrice, setMaxPrice] = useState(5);
  const [substitution, setSubstitution] =
    useState<SubstitutionPreference>("closest_under_max");

  useEffect(() => {
    if (product) {
      setQty(1);
      setMaxPrice(suggestMaxPrice(product.current_price ?? product.max_price));
      setSubstitution("closest_under_max");
    }
  }, [product]);

  if (!open || !product) return null;

  const estimated = product.current_price;
  const range = formatMoneyRange(product.min_price, product.max_price);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-sheet-title"
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl animate-slide-up sm:rounded-3xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="h-1.5 w-12 rounded-full bg-neutral-200 sm:hidden" />
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full p-2 hover:bg-neutral-100"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-3xl bg-neutral-100">
          <Image
            src={product.image_url || PLACEHOLDER_IMAGE}
            alt={product.name}
            fill
            className="object-cover"
            sizes="176px"
            unoptimized={!product.image_url}
          />
        </div>

        <h2 id="product-sheet-title" className="mt-4 text-2xl font-black text-lr-black">
          {product.name}
        </h2>
        <p className="text-neutral-500">
          {[product.brand, product.flavor, product.size].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
          <p className="text-sm text-neutral-500">Estimated price</p>
          <p className="text-2xl font-black">
            {estimated != null ? formatMoney(estimated) : range}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {freshnessLabel(product.last_price_update)}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold">Quantity</label>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-neutral-200 p-1">
              <button
                type="button"
                className="rounded-xl p-2 hover:bg-neutral-100"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button
                type="button"
                className="rounded-xl p-2 hover:bg-neutral-100"
                onClick={() =>
                  setQty((q) =>
                    Math.min(product.max_quantity ?? 8, q + 1),
                  )
                }
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="max-price" className="mb-2 block text-sm font-bold">
              Maximum I will pay (each)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                $
              </span>
              <Input
                id="max-price"
                type="number"
                step="0.25"
                min="0.25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="pl-8"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              If the shelf price is above this, we&apos;ll skip or substitute per your preference.
            </p>
          </div>

          <div>
            <label htmlFor="sub-pref" className="mb-2 block text-sm font-bold">
              If unavailable
            </label>
            <Select
              id="sub-pref"
              value={substitution}
              onChange={(e) =>
                setSubstitution(e.target.value as SubstitutionPreference)
              }
            >
              {(Object.keys(SUBSTITUTION_LABELS) as SubstitutionPreference[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {SUBSTITUTION_LABELS[key]}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={!orderingOpen}
          onClick={() => {
            addItem({
              productId: product.id,
              isCustom: false,
              name: product.name,
              brand: product.brand,
              size: product.size,
              flavor: product.flavor,
              description: product.description,
              imageUrl: product.image_url,
              quantity: qty,
              estimatedPrice: product.current_price,
              minEstimated: product.min_price,
              maxEstimated: product.max_price,
              maxPrice,
              substitution,
            });
            toast.success(`Added ${product.name}`);
            onClose();
            // Keep browsing — sticky cart bar appears at the bottom
          }}
        >
          {orderingOpen ? "Add to Cart" : "Ordering Closed"}
        </Button>
      </div>
    </div>
  );
}
