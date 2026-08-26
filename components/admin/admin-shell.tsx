"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  QrCode,
  Settings,
  ShoppingBasket,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { adminLogoutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, match: "exact" as const },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, match: "prefix" as const },
  { href: "/admin/shop", label: "Shop", icon: ShoppingBasket, match: "prefix" as const },
  { href: "/admin/deliver", label: "Deliver", icon: Truck, match: "prefix" as const },
];

const MORE_NAV = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/prices", label: "Price Data", icon: Tag },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/admin/qr", label: "QR Code", icon: QrCode },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const ALL_NAV = [
  ...PRIMARY_NAV.map(({ href, label, icon }) => ({ href, label, icon })),
  ...MORE_NAV,
];

function isActive(pathname: string, href: string, match: "exact" | "prefix" = "prefix") {
  if (match === "exact" || href === "/admin") return pathname === href;
  return pathname.startsWith(href);
}

export function AdminShell({
  children,
  demo,
}: {
  children: React.ReactNode;
  demo?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const pageTitle =
    ALL_NAV.find((item) => isActive(pathname, item.href))?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-lr-black text-white lg:flex">
        <div className="border-b border-white/10 p-5">
          <Logo light />
          <p className="mt-1 text-xs text-neutral-400">Operator console</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ALL_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-lr-yellow text-lr-black"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          {demo ? (
            <p className="mb-2 px-3 text-[11px] text-amber-300">Demo mode</p>
          ) : null}
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-300 hover:bg-white/5"
            onClick={async () => {
              await adminLogoutAction();
              router.push("/admin/login");
              router.refresh();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="min-w-0">
            <Logo size="sm" />
            <p className="truncate text-xs font-bold text-neutral-500">{pageTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/shop"
              className="rounded-xl bg-lr-yellow px-3 py-2 text-xs font-black text-lr-black"
            >
              Shop
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-xl bg-neutral-100 p-2.5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 pb-28 lg:p-8 lg:pb-8">{children}</main>

        {/* Mobile bottom nav — primary operator actions */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
            {PRIMARY_NAV.map(({ href, label, icon: Icon, match }) => {
              const active = isActive(pathname, href, match);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-bold transition",
                    active ? "text-lr-black" : "text-neutral-400",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-2xl",
                      active ? "bg-lr-yellow" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-bold text-neutral-400"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl">
                <Menu className="h-5 w-5" />
              </span>
              More
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile full menu sheet */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-black">Admin menu</p>
                {demo ? (
                  <p className="text-xs font-semibold text-amber-600">Demo mode</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-neutral-100 p-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ALL_NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-3 py-3.5 text-sm font-bold",
                      active
                        ? "border-lr-black bg-lr-yellow"
                        : "border-neutral-100 bg-neutral-50",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 py-3.5 text-sm font-bold text-neutral-600"
              onClick={async () => {
                await adminLogoutAction();
                router.push("/admin/login");
                router.refresh();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
