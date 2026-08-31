"use client";

import { useState, useTransition } from "react";
import { ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPaymentMethodLabel,
  normalizePaymentMethodId,
  paymentInstructions,
} from "@/lib/payments";
import type { AppSettings, Order } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function PaymentInstructions({
  order,
  settings,
  stripePaidHint,
}: {
  order: Order;
  settings: AppSettings;
  stripePaidHint?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const info = paymentInstructions(order, settings);
  const methodId = normalizePaymentMethodId(order.payment_method);
  const paid = order.payment_status === "paid" || stripePaidHint;

  return (
    <div
      className={
        paid
          ? "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center"
          : "mt-4 rounded-2xl bg-lr-yellow p-4 text-center"
      }
    >
      <div className="flex items-center justify-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-lr-black/70">
          {paid ? "Payment received" : info.title}
        </p>
        {paid ? (
          <Badge tone="success">Paid</Badge>
        ) : (
          <Badge tone="warning">Awaiting payment</Badge>
        )}
      </div>
      <p className="mt-1 text-4xl font-black text-lr-black">
        {formatMoney(info.amount)}
      </p>
      <p className="mt-2 text-sm text-lr-black/70">{info.body}</p>

      {methodId === "stripe" && !paid ? (
        <Button
          className="mt-4 w-full"
          size="lg"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackingToken: order.tracking_token }),
              });
              const data = (await res.json()) as { url?: string; error?: string };
              if (data.url) {
                window.location.href = data.url;
                return;
              }
              alert(data.error ?? "Could not start card payment");
            });
          }}
        >
          <CreditCard className="h-5 w-5" />
          {pending ? "Opening checkout…" : "Pay with card"}
        </Button>
      ) : null}

      {info.actionUrl && !paid ? (
        <a
          href={info.actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lr-black px-4 py-3 text-sm font-bold text-white"
        >
          <ExternalLink className="h-4 w-4" />
          {info.actionLabel ?? "Open app"}
        </a>
      ) : null}

      <p className="mt-3 text-xs text-neutral-600">
        Payment method: {getPaymentMethodLabel(order.payment_method)}
      </p>
    </div>
  );
}
