"use client";

import { CartBar } from "@/components/customer/cart-bar";
import { BottomNav } from "@/components/customer/bottom-nav";
import { CustomerHeader } from "@/components/customer/header";
import { OrderFlowSheet } from "@/components/customer/order-flow-sheet";
import type { AppSettings } from "@/lib/types";

export function CustomerShell({
  children,
  settings,
  orderingOpen,
}: {
  children: React.ReactNode;
  settings: AppSettings;
  orderingOpen: boolean;
}) {
  return (
    <div className="relative mx-auto flex min-h-full max-w-lg flex-col bg-[radial-gradient(ellipse_at_top,_#fffef5_0%,_#f7f7f5_55%)]">
      <CustomerHeader />
      <main className="flex-1 px-4 py-5 pb-36">{children}</main>
      <CartBar settings={settings} />
      <OrderFlowSheet settings={settings} orderingOpen={orderingOpen} />
      <BottomNav />
    </div>
  );
}
