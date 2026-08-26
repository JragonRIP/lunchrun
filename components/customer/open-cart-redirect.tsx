"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrderFlowStore } from "@/lib/store/order-flow";

/** Opens the in-app cart sheet, then navigates to the menu. */
export function OpenCartRedirect({ step = "cart" }: { step?: "cart" | "checkout" }) {
  const router = useRouter();
  const openCart = useOrderFlowStore((s) => s.openCart);
  const openCheckout = useOrderFlowStore((s) => s.openCheckout);

  useEffect(() => {
    if (step === "checkout") openCheckout();
    else openCart();
    router.replace("/");
  }, [step, openCart, openCheckout, router]);

  return (
    <p className="py-12 text-center text-sm text-neutral-500">Opening your order…</p>
  );
}
