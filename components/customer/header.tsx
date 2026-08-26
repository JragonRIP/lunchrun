"use client";

import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useCartStore } from "@/lib/store/cart";
import { useMyOrdersStore } from "@/lib/store/my-orders";
import { useOrderFlowStore } from "@/lib/store/order-flow";
import { useEffect, useState } from "react";

export function CustomerHeader() {
  const items = useCartStore((s) => s.items);
  const orders = useMyOrdersStore((s) => s.orders);
  const openCart = useOrderFlowStore((s) => s.openCart);
  const [count, setCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    setCount(items.reduce((sum, i) => sum + i.quantity, 0));
  }, [items]);

  useEffect(() => {
    setOrderCount(orders.length);
  }, [orders]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-lr-black text-white">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Lunch Run home">
          <Logo light size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/track"
            className="relative rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-bold transition hover:bg-white/15"
            aria-label="Your orders"
          >
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-lr-yellow" />
              Orders
            </span>
            {orderCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lr-yellow px-1 text-[11px] font-black text-lr-black">
                {orderCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-2xl bg-white/10 p-2.5 transition hover:bg-white/15"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingCart className="h-5 w-5 text-lr-yellow" />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lr-yellow px-1 text-[11px] font-black text-lr-black">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
