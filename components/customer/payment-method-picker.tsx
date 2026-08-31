"use client";

import {
  PAYMENT_METHOD_META,
  type PaymentMethodId,
} from "@/lib/payments";
import { cn } from "@/lib/utils";

export function PaymentMethodPicker({
  methods,
  value,
  onChange,
}: {
  methods: PaymentMethodId[];
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
}) {
  if (methods.length === 0) {
    return (
      <p className="text-sm text-amber-800">
        No payment methods are configured. Ask the operator to update settings.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {methods.map((id) => {
        const meta = PAYMENT_METHOD_META[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition",
              active
                ? "border-lr-black bg-lr-yellow shadow-sm"
                : "border-neutral-200 bg-white hover:border-neutral-300",
            )}
          >
            <p className="font-bold">{meta.label}</p>
            <p className="mt-0.5 text-xs text-neutral-600">{meta.description}</p>
          </button>
        );
      })}
    </div>
  );
}
