"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { formatMoney, formatMoneyRange } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { ProductWithCategory } from "@/lib/types";

export function ProductCard({
  product,
  onAdd,
}: {
  product: ProductWithCategory;
  onAdd: (product: ProductWithCategory) => void;
}) {
  const priceLabel =
    product.current_price != null
      ? formatMoney(product.current_price)
      : formatMoneyRange(product.min_price, product.max_price);

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm transition hover:border-neutral-200 hover:shadow-md">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        <Image
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover"
          sizes="64px"
          unoptimized={!product.image_url}
        />
      </div>
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onAdd(product)}
      >
        <h3 className="truncate font-bold text-lr-black">{product.name}</h3>
        <p className="truncate text-sm text-neutral-500">
          {[product.flavor, product.size].filter(Boolean).join(" · ") ||
            product.brand ||
            "Snack"}
        </p>
        <p className="mt-1 text-sm font-semibold text-lr-black">{priceLabel}</p>
      </button>
      <button
        type="button"
        onClick={() => onAdd(product)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lr-yellow text-lr-black transition hover:bg-yellow-300 active:scale-95"
        aria-label={`Add ${product.name}`}
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </article>
  );
}
