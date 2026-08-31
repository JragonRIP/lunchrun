"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, Minus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ProductThumb } from "@/components/shared/product-thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { placeOrderAction } from "@/lib/actions";
import { PaymentMethodPicker } from "@/components/customer/payment-method-picker";
import { effectiveServiceFee } from "@/lib/constants";
import {
  getAvailablePaymentMethods,
  normalizePaymentMethodId,
  PAYMENT_METHOD_META,
  type PaymentMethodId,
} from "@/lib/payments";
import { useCartStore, usePreferencesStore } from "@/lib/store/cart";
import { toSavedOrder, useMyOrdersStore } from "@/lib/store/my-orders";
import { useOrderFlowStore } from "@/lib/store/order-flow";
import type { AppSettings } from "@/lib/types";
import {
  SUBSTITUTION_LABELS,
  formatMoney,
  formatMoneyRange,
  roundMoney,
} from "@/lib/utils";

export function OrderFlowSheet({
  settings,
  orderingOpen,
}: {
  settings: AppSettings;
  orderingOpen: boolean;
}) {
  const router = useRouter();
  const availablePayments = getAvailablePaymentMethods(settings);
  const { open, step, close, setStep, openCheckout } = useOrderFlowStore();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const saveOrder = useMyOrdersStore((s) => s.saveOrder);
  const prefs = usePreferencesStore();

  const [name, setName] = useState(prefs.name || "");
  const [location, setLocation] = useState(prefs.location || "Cafeteria");
  const [locationOther, setLocationOther] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethodId>(
    availablePayments[0] ?? "cash",
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setName(prefs.name || "");
      setLocation(prefs.location || "Cafeteria");
    }
  }, [open, prefs.name, prefs.location]);

  useEffect(() => {
    if (!availablePayments.includes(payment)) {
      setPayment(availablePayments[0] ?? "cash");
    }
  }, [availablePayments, payment]);

  if (!open) return null;

  const fee = effectiveServiceFee(settings);
  const merchMin = roundMoney(
    items.reduce(
      (sum, i) => sum + (i.minEstimated ?? i.estimatedPrice ?? 0) * i.quantity,
      0,
    ),
  );
  const merchMax = roundMoney(
    items.reduce(
      (sum, i) =>
        sum + (i.maxEstimated ?? i.estimatedPrice ?? i.maxPrice) * i.quantity,
      0,
    ),
  );
  const maxAuth = roundMoney(
    items.reduce((sum, i) => sum + i.maxPrice * i.quantity, 0) + fee,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-flow-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {step === "checkout" ? (
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="rounded-full p-1.5 hover:bg-neutral-100"
                aria-label="Back to cart"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <h2 id="order-flow-title" className="text-xl font-black">
              {step === "cart" ? "Your Cart" : "Checkout"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-bold">Your cart is empty</p>
              <p className="mt-1 text-sm text-neutral-500">
                Add snacks from the menu to get started.
              </p>
              <Button className="mt-4" onClick={close}>
                Keep browsing
              </Button>
            </div>
          ) : step === "cart" ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="rounded-2xl border border-neutral-100 bg-white p-3"
                >
                  <div className="flex gap-3">
                    <ProductThumb
                      name={item.name}
                      imageUrl={item.imageUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-xs text-neutral-500">
                            Max {formatMoney(item.maxPrice)} ·{" "}
                            {SUBSTITUTION_LABELS[item.substitution]}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 p-1">
                          <button
                            type="button"
                            className="rounded-lg p-1.5 hover:bg-neutral-100"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            aria-label="Decrease"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 hover:bg-neutral-100"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            aria-label="Increase"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">
                          Est.{" "}
                          {formatMoneyRange(
                            item.minEstimated ?? item.estimatedPrice,
                            item.maxEstimated ?? item.estimatedPrice,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl bg-neutral-50 p-4 text-sm">
                <Row
                  label="Merchandise estimate"
                  value={formatMoneyRange(merchMin, merchMax)}
                />
                <Row label="Lunch Run fee" value={formatMoney(fee)} />
                <Row
                  label="Estimated total"
                  value={formatMoneyRange(merchMin + fee, merchMax + fee)}
                  strong
                />
                <div className="mt-3 rounded-xl bg-lr-yellow/40 p-3">
                  <p className="text-xs font-bold">Cash to give operator now</p>
                  <p className="text-2xl font-black">{formatMoney(maxAuth)}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Max snack prices + {formatMoney(fee)} Lunch Run fee. Final
                    bill uses shelf prices; unused cash returns as change.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-lr-yellow/40 bg-lr-yellow/20 px-4 py-3 text-sm">
                <p className="font-black">
                  Prepay {formatMoney(maxAuth)} via{" "}
                  {PAYMENT_METHOD_META[payment].shortLabel}
                </p>
                <p className="mt-0.5 text-neutral-600">
                  {PAYMENT_METHOD_META[payment].description}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold">Payment method</p>
                <PaymentMethodPicker
                  methods={availablePayments}
                  value={payment}
                  onChange={setPayment}
                />
              </div>

              <div>
                <label htmlFor="flow-name" className="mb-1 block text-sm font-bold">
                  Your Name *
                </label>
                <Input
                  id="flow-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tyler M."
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="flow-location"
                  className="mb-1 block text-sm font-bold"
                >
                  Where should I find you? *
                </label>
                <Select
                  id="flow-location"
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
                <label htmlFor="flow-notes" className="mb-1 block text-sm font-bold">
                  Notes (optional)
                </label>
                <Textarea
                  id="flow-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="I'm wearing a blue hoodie."
                />
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-600">
                Prices are estimates. Give{" "}
                <strong>{formatMoney(maxAuth)}</strong> up front (never charged
                above that without approval). Final bill = actual store prices +{" "}
                {formatMoney(fee)} fee.
              </div>
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-neutral-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {step === "cart" ? (
              <Button
                size="lg"
                className="w-full"
                disabled={!orderingOpen}
                onClick={() => {
                  if (!orderingOpen) {
                    toast.error("Today's ordering has closed.");
                    return;
                  }
                  openCheckout();
                }}
              >
                {orderingOpen ? "Continue" : "Ordering Closed"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                disabled={!orderingOpen || pending || name.trim().length < 2 || availablePayments.length === 0}
                onClick={() => {
                  startTransition(async () => {
                    const result = await placeOrderAction({
                      customerName: name.trim(),
                      deliveryLocation: location,
                      deliveryLocationOther:
                        location === "Other" ? locationOther : null,
                      paymentMethod: payment,
                      notes: notes || null,
                      tipAmount: 0,
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
                    saveOrder(toSavedOrder(result.order));
                    clear();
                    close();

                    const methodId =
                      normalizePaymentMethodId(result.order.payment_method);

                    if (methodId === "stripe") {
                      const res = await fetch("/api/stripe/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          trackingToken: result.order.tracking_token,
                        }),
                      });
                      const data = (await res.json()) as {
                        url?: string;
                        error?: string;
                      };
                      if (data.url) {
                        window.location.href = data.url;
                        return;
                      }
                      toast.error(data.error ?? "Could not open card checkout");
                      router.push(
                        `/confirmed?token=${result.order.tracking_token}`,
                      );
                      return;
                    }

                    if (methodId === "cash") {
                      toast.success(
                        `Order placed — give ${formatMoney(result.order.max_authorized_total)} cash now`,
                      );
                    } else {
                      toast.success("Order placed — complete payment next");
                    }
                    router.push(`/confirmed?token=${result.order.tracking_token}`);
                  });
                }}
              >
                {pending
                  ? "Placing…"
                  : `Place Order · ${PAYMENT_METHOD_META[payment].shortLabel}`}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={strong ? "font-bold" : "text-neutral-500"}>{label}</span>
      <span className={strong ? "font-black" : "font-semibold"}>{value}</span>
    </div>
  );
}
