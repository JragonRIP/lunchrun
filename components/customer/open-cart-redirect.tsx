"use client";

import { useEffect } from "react";
import { useOrderFlowStore } from "@/lib/store/order-flow";

/** Opens the in-app cart sheet, then sends you back to the menu. */
export function OpenCartRedirect({ step = "cart" }: { step?: "cart" | "checkout" }) {
  const openCart = useOrderFlowStore((s) => s.openCart);
  const openCheckout = useOrderFlowStore((s) => s.openCheckout);

  useEffect(() => {
    if (step === "checkout") openCheckout();
    else openCart();
    window.history.replaceState(null, "", "/");
  }, [step, openCart, openCheckout]);

  return (
    <p className="py-12 text-center text-sm text-neutral-500">Opening your order…</p>
  );
}
