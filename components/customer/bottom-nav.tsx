"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/track", label: "Orders", icon: Package },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith("/track") ||
                pathname.startsWith("/order") ||
                pathname.startsWith("/confirmed");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition",
                active ? "text-lr-black" : "text-neutral-400",
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "stroke-[2.5]")}
                style={active ? { color: "#CA8A04" } : undefined}
              />
              <span>{label}</span>
              {active ? (
                <span className="h-1 w-1 rounded-full bg-lr-yellow" />
              ) : (
                <span className="h-1 w-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
