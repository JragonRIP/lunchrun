"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { useOrderFlowStore } from "@/lib/store/order-flow";
import { useLiveOrderingOpen } from "@/lib/hooks/use-live-ordering-open";
import { formatMoney, roundMoney } from "@/lib/utils";
import { effectiveServiceFee } from "@/lib/constants";
import { formatCutoffLabel } from "@/lib/time";
import type { AppSettings } from "@/lib/types";

export function CartBar({
  settings,
  sessionAccepting,
  cutoffTime,
}: {
  settings: AppSettings;
  sessionAccepting: boolean;
  cutoffTime: string;
}) {
  const items = useCartStore((s) => s.items);
  const openCart = useOrderFlowStore((s) => s.openCart);
  const sheetOpen = useOrderFlowStore((s) => s.open);
  const liveOpen = useLiveOrderingOpen(
    sessionAccepting,
    cutoffTime,
    settings.test_mode,
  );
  const [count, setCount] = useState(0);
  const [maxAuth, setMaxAuth] = useState(0);

  useEffect(() => {
    const fee = effectiveServiceFee(settings);
    setCount(items.reduce((sum, i) => sum + i.quantity, 0));
    setMaxAuth(
      roundMoney(items.reduce((sum, i) => sum + i.maxPrice * i.quantity, 0) + fee),
    );
  }, [items, settings]);

  if (sheetOpen) return null;

  if (!liveOpen) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-16 z-30 px-4 pb-[env(safe-area-inset-bottom)] md:bottom-4">
        <div className="pointer-events-auto mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-bold text-neutral-600 shadow-lg">
          Ordering is closed (cutoff {formatCutoffLabel(cutoffTime)}). Browse
          only — check back next school day.
        </div>
      </div>
    );
  }

  if (count === 0) return null;

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
          <span className="ml-auto font-black">
            Give {formatMoney(maxAuth)}
          </span>
        </Button>
      </div>
    </div>
  );
}
