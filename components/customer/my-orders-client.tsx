"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronRight, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyOrdersStore, type SavedOrder } from "@/lib/store/my-orders";
import { formatMoney, formatMoneyRange } from "@/lib/utils";

export function MyOrdersClient() {
  const router = useRouter();
  const orders = useMyOrdersStore((s) => s.orders);
  const saveOrder = useMyOrdersStore((s) => s.saveOrder);
  const [hydrated, setHydrated] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-neutral-200" />
        <div className="h-28 animate-pulse rounded-3xl bg-neutral-200" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Your Orders</h1>
        <p className="text-sm text-neutral-500">
          Tap an order to see status, items, and totals.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No saved orders yet"
          description="After you place an order, it shows up here so you can check it anytime on this phone."
          action={
            <Link href="/">
              <Button>Order snacks</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.token} order={order} />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setShowLookup((v) => !v)}
        >
          <span className="flex items-center gap-2 font-bold">
            <Search className="h-4 w-4" />
            Find an order on another phone
          </span>
          <ChevronRight
            className={`h-4 w-4 text-neutral-400 transition ${showLookup ? "rotate-90" : ""}`}
          />
        </button>

        {showLookup ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const res = await fetch("/api/orders/lookup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code, name }),
                });
                const data = await res.json();
                if (!res.ok || !data.token) {
                  toast.error(data.error || "Order not found");
                  return;
                }
                if (data.order) {
                  saveOrder({
                    token: data.order.tracking_token,
                    orderCode: data.order.order_code,
                    customerName: data.order.customer_name,
                    createdAt: data.order.created_at,
                    items: (data.order.items ?? []).map(
                      (i: { product_name: string; quantity: number }) => ({
                        name: i.product_name,
                        quantity: i.quantity,
                      }),
                    ),
                    itemCount: (data.order.items ?? []).reduce(
                      (s: number, i: { quantity: number }) => s + i.quantity,
                      0,
                    ),
                    maxAuthorized: data.order.max_authorized_total,
                    estimatedMin: data.order.estimated_total_min,
                    estimatedMax: data.order.estimated_total_max,
                    location:
                      data.order.delivery_location_other ||
                      data.order.delivery_location,
                  });
                }
                router.push(`/order/${data.token}`);
              });
            }}
          >
            <p className="text-sm text-neutral-500">
              Enter your order code and name to pull it up and save it here.
            </p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LR-1047"
              required
              aria-label="Order code"
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tyler M."
              required
              aria-label="Your name"
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Looking up…" : "Find & save order"}
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: SavedOrder }) {
  return (
    <Link
      href={`/order/${order.token}`}
      className="block rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:border-neutral-200 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lr-yellow text-lr-black">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-sm font-black">{order.orderCode}</p>
            <p className="font-bold">{order.customerName}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {new Date(order.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              · {order.location}
            </p>
          </div>
        </div>
        <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-neutral-300" />
      </div>

      <ul className="mt-3 space-y-1 border-t border-neutral-50 pt-3 text-sm text-neutral-700">
        {order.items.slice(0, 4).map((item, idx) => (
          <li key={`${item.name}-${idx}`}>
            {item.quantity}× {item.name}
          </li>
        ))}
        {order.items.length > 4 ? (
          <li className="text-neutral-400">
            +{order.items.length - 4} more
          </li>
        ) : null}
      </ul>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-neutral-500">
          Est. {formatMoneyRange(order.estimatedMin, order.estimatedMax)}
        </span>
        <span className="font-bold">
          Max {formatMoney(order.maxAuthorized)}
        </span>
      </div>
    </Link>
  );
}
