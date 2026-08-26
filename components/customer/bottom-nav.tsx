"use client";

import { Home, Package } from "lucide-react";
import { NavLink } from "@/components/shared/nav-link";
import { cn } from "@/lib/utils";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        <NavLink
          href="/"
          match="exact"
          linkClassName="flex flex-1"
          className={({ active }) =>
            cn(
              "flex w-full flex-col items-center gap-1 py-3 text-xs font-semibold transition",
              active ? "text-lr-black" : "text-neutral-400",
            )
          }
        >
          {({ active }) => (
            <>
              <Home
                className={cn("h-5 w-5", active && "stroke-[2.5]")}
                style={active ? { color: "#CA8A04" } : undefined}
              />
              <span>Home</span>
              {active ? (
                <span className="h-1 w-1 rounded-full bg-lr-yellow" />
              ) : (
                <span className="h-1 w-1" />
              )}
            </>
          )}
        </NavLink>
        <NavLink
          href="/track"
          match={(pathname) =>
            pathname.startsWith("/track") ||
            pathname.startsWith("/order") ||
            pathname.startsWith("/confirmed")
          }
          linkClassName="flex flex-1"
          className={({ active }) =>
            cn(
              "flex w-full flex-col items-center gap-1 py-3 text-xs font-semibold transition",
              active ? "text-lr-black" : "text-neutral-400",
            )
          }
        >
          {({ active }) => (
            <>
              <Package
                className={cn("h-5 w-5", active && "stroke-[2.5]")}
                style={active ? { color: "#CA8A04" } : undefined}
              />
              <span>Orders</span>
              {active ? (
                <span className="h-1 w-1 rounded-full bg-lr-yellow" />
              ) : (
                <span className="h-1 w-1" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
