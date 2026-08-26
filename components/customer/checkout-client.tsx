"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { placeOrderAction } from "@/lib/actions";
import { effectiveServiceFee } from "@/lib/constants";
import { useCartStore, usePreferencesStore } from "@/lib/store/cart";
import type { AppSettings } from "@/lib/types";
import { formatMoney, roundMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TIPS = [0, 0.5, 1, 2];

export function CheckoutClient({
  settings,
  orderingOpen,
}: {
  settings: AppSettings;
  orderingOpen: boolean;
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const prefs = usePreferencesStore();
  const [name, setName] = useState(prefs.name || "");
  const [location, setLocation] = useState(prefs.location || "Cafeteria");
  const [locationOther, setLocationOther] = useState("");
  const [payment, setPayment] = useState(settings.payment_methods[0] ?? "Cash");
  const [notes, setNotes] = useState("");
  const [tip, setTip] = useState(0);
  const [pending, startTransition] = useTransition();

  const fee = effectiveServiceFee(settings);
  const maxAuth = roundMoney(
    items.reduce((sum, i) => sum + i.maxPrice * i.quantity, 0) + fee + tip,
  );

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-neutral-50 p-8 text-center">
        <p className="font-bold">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Browse snacks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28">
      <h1 className="text-2xl font-black">Checkout</h1>

      <div className="space-y-4 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-bold">
            Your Name *
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tyler M."
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-bold">
            Where should I find you? *
          </label>
          <Select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {settings.delivery_locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </Select>
          {location === "Other" ? (
            <Input
              className="mt-2"
              value={locationOther}
              onChange={(e) => setLocationOther(e.target.value)}
              placeholder="Describe where"
            />
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">Payment method</p>
          <div className="flex flex-wrap gap-2">
            {settings.payment_methods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPayment(method)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-bold transition",
                  payment === method
                    ? "bg-lr-black text-white"
                    : "bg-neutral-100 text-neutral-600",
                )}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">Add a tip (optional)</p>
          <div className="flex flex-wrap gap-2">
            {TIPS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTip(t)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-bold transition",
                  tip === t
                    ? "bg-lr-yellow text-lr-black"
                    : "bg-neutral-100 text-neutral-600",
                )}
              >
                {t === 0 ? "None" : formatMoney(t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-bold">
            Notes
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="I'm wearing a blue hoodie."
          />
        </div>
      </div>

      <div className="rounded-3xl bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-600">
        Prices shown are estimates based on the latest available store
        information. Your final merchandise price is based on the actual store
        price when purchased. Your order will never exceed your authorized
        maximum without approval. A {formatMoney(fee)} Lunch Run service fee is
        added once per order.
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Max authorized</span>
          <span className="font-black">{formatMoney(maxAuth)}</span>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          You will pay the actual store price + {formatMoney(fee)} fee.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur md:bottom-0">
        <div className="mx-auto max-w-lg">
          <Button
            size="lg"
            className="w-full"
            disabled={!orderingOpen || pending || name.trim().length < 2}
            onClick={() => {
              startTransition(async () => {
                const result = await placeOrderAction({
                  customerName: name.trim(),
                  deliveryLocation: location,
                  deliveryLocationOther:
                    location === "Other" ? locationOther : null,
                  paymentMethod: payment,
                  notes: notes || null,
                  tipAmount: tip,
                  items: items.map((i) => ({
                    productId: i.productId,
                    isCustom: i.isCustom,
                    name: i.name,
                    brand: i.brand,
                    size: i.size,
                    flavor: i.flavor,
                    description: i.description,
                    imageUrl: i.imageUrl,
                    quantity: i.quantity,
                    estimatedPrice: i.estimatedPrice,
                    minEstimated: i.minEstimated,
                    maxEstimated: i.maxEstimated,
                    maxPrice: i.maxPrice,
                    substitution: i.substitution,
                  })),
                });

                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }

                prefs.setName(name.trim());
                prefs.setLocation(location);
                clear();
                toast.success("Order placed!");
                router.push(
                  `/confirmed?token=${result.order.tracking_token}`,
                );
              });
            }}
          >
            {pending ? "Placing…" : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
