"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { useOrderFlowStore } from "@/lib/store/order-flow";
import { formatMoney, roundMoney } from "@/lib/utils";
import { effectiveServiceFee } from "@/lib/constants";
import type { AppSettings } from "@/lib/types";

export function CartBar({ settings }: { settings: AppSettings }) {
  const items = useCartStore((s) => s.items);
  const openCart = useOrderFlowStore((s) => s.openCart);
  const sheetOpen = useOrderFlowStore((s) => s.open);
  const [count, setCount] = useState(0);
  const [maxAuth, setMaxAuth] = useState(0);

  useEffect(() => {
    const fee = effectiveServiceFee(settings);
    setCount(items.reduce((sum, i) => sum + i.quantity, 0));
    setMaxAuth(
      roundMoney(items.reduce((sum, i) => sum + i.maxPrice * i.quantity, 0) + fee),
    );
  }, [items, settings]);

  if (count === 0 || sheetOpen) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-30 px-4 pb-[env(safe-area-inset-bottom)] md:bottom-4">
      <div className="pointer-events-auto mx-auto max-w-lg">
        <Button
          size="lg"
          className="w-full shadow-xl shadow-black/20"
          onClick={openCart}
        >
          <ShoppingCart className="h-5 w-5" />
          View cart · {count} {count === 1 ? "item" : "items"}
          <span className="ml-auto font-black">{formatMoney(maxAuth)} max</span>
        </Button>
      </div>
    </div>
  );
}
