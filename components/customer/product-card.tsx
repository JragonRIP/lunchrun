"use client";

import { Plus } from "lucide-react";
import { ProductThumb } from "@/components/shared/product-thumb";
import { formatMoney, formatMoneyRange, cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/types";

export function ProductCard({
  product,
  onAdd,
  orderingOpen = true,
}: {
  product: ProductWithCategory;
  onAdd: (product: ProductWithCategory) => void;
  orderingOpen?: boolean;
}) {
  const priceLabel =
    product.current_price != null
      ? formatMoney(product.current_price)
      : formatMoneyRange(product.min_price, product.max_price);

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm transition",
        orderingOpen
          ? "hover:border-neutral-200 hover:shadow-md"
          : "opacity-70",
      )}
    >
      <ProductThumb
        name={product.name}
        imageUrl={product.image_url}
        categorySlug={product.category?.slug}
      />
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => orderingOpen && onAdd(product)}
        disabled={!orderingOpen}
        aria-disabled={!orderingOpen}
      >
        <h3 className="truncate font-bold text-lr-black">{product.name}</h3>
        <p className="truncate text-sm text-neutral-500">
          {[product.flavor, product.size].filter(Boolean).join(" · ") ||
            product.brand ||
            product.category?.name ||
            "Snack"}
        </p>
        <p className="mt-1 text-sm font-semibold text-lr-black">{priceLabel}</p>
      </button>
      <button
        type="button"
        onClick={() => orderingOpen && onAdd(product)}
        disabled={!orderingOpen}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition active:scale-95",
          orderingOpen
            ? "bg-lr-yellow text-lr-black hover:bg-yellow-300"
            : "cursor-not-allowed bg-neutral-200 text-neutral-400",
        )}
        aria-label={
          orderingOpen
            ? `Add ${product.name}`
            : `Ordering closed — cannot add ${product.name}`
        }
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </article>
  );
}
