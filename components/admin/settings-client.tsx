"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  categoryOrderAction,
  reopenOrdersAction,
  saveSettingsAction,
  sessionStatusAction,
} from "@/lib/actions";
import { TestModeToggle } from "@/components/admin/test-mode-toggle";
import {
  PAYMENT_METHOD_IDS,
  PAYMENT_METHOD_META,
  type PaymentMethodId,
} from "@/lib/payments";
import type { AppSettings, Category, Store } from "@/lib/types";

export function SettingsClient({
  settings,
  stores,
  categories,
}: {
  settings: AppSettings;
  stores: Store[];
  categories: Category[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [catOrder, setCatOrder] = useState(
    [...categories].sort((a, b) => a.shopping_order - b.shopping_order).map((c) => c.id),
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-neutral-500">Fees, capacity, tax, and day controls</p>
      </div>

      <TestModeToggle enabled={settings.test_mode} />

      <section className="space-y-3 rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Pricing</h2>
        <Field label="Lunch Run fee ($)">
          <Input
            type="number"
            step="0.25"
            value={form.service_fee}
            onChange={(e) => set("service_fee", Number(e.target.value))}
          />
        </Field>
        <Field label="Min merchandise ($)">
          <Input
            type="number"
            step="0.25"
            value={form.min_merchandise}
            onChange={(e) => set("min_merchandise", Number(e.target.value))}
          />
        </Field>
        <Field label="Max merchandise ($)">
          <Input
            type="number"
            step="0.25"
            value={form.max_merchandise}
            onChange={(e) => set("max_merchandise", Number(e.target.value))}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.promo_active}
            onChange={(e) => set("promo_active", e.target.checked)}
          />
          Promo fee active
        </label>
        <Field label="Promo label">
          <Input
            value={form.promo_label ?? ""}
            onChange={(e) => set("promo_label", e.target.value || null)}
            placeholder="Friday Special"
          />
        </Field>
        <Field label="Promo fee ($)">
          <Input
            type="number"
            step="0.25"
            value={form.promo_fee ?? ""}
            onChange={(e) =>
              set("promo_fee", e.target.value ? Number(e.target.value) : null)
            }
          />
        </Field>
      </section>

      <section className="space-y-3 rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Capacity & timing</h2>
        <Field label="Max items per order">
          <Input
            type="number"
            value={form.max_items_per_order}
            onChange={(e) => set("max_items_per_order", Number(e.target.value))}
          />
        </Field>
        <Field label="Max daily orders">
          <Input
            type="number"
            value={form.max_daily_orders}
            onChange={(e) => set("max_daily_orders", Number(e.target.value))}
          />
        </Field>
        <Field label="Orders close at (HH:MM)">
          <Input
            value={form.default_cutoff}
            onChange={(e) => set("default_cutoff", e.target.value)}
            placeholder="11:30"
          />
        </Field>
        <Field label="Delivery window">
          <Input
            value={form.default_delivery_window}
            onChange={(e) => set("default_delivery_window", e.target.value)}
          />
        </Field>
        <Field label="Active store">
          <Select
            value={form.active_store_id ?? ""}
            onChange={(e) => set("active_store_id", e.target.value || null)}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </section>

      <section className="space-y-3 rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Tax</h2>
        <Field label="Tax mode">
          <Select
            value={form.tax_mode}
            onChange={(e) =>
              set("tax_mode", e.target.value as AppSettings["tax_mode"])
            }
          >
            <option value="simple">Simple rate</option>
            <option value="receipt">Receipt-level allocation</option>
          </Select>
        </Field>
        <Field label="Tax rate (e.g. 0.0825)">
          <Input
            type="number"
            step="0.0001"
            value={form.tax_rate}
            onChange={(e) => set("tax_rate", Number(e.target.value))}
          />
        </Field>
        <p className="text-xs text-neutral-500">
          Active mode: <strong>{form.tax_mode}</strong>
        </p>
      </section>

      <section className="space-y-3 rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Payment methods</h2>
        <p className="text-sm text-neutral-500">
          Students prepay the max authorized amount. Change or refunds apply if
          snacks cost less at delivery.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PAYMENT_METHOD_IDS.map((id) => {
            const enabled = form.payment_methods.includes(id);
            return (
              <label
                key={id}
                className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-3"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={enabled}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...form.payment_methods, id]
                      : form.payment_methods.filter((m) => m !== id);
                    set(
                      "payment_methods",
                      next.length ? next : (["cash"] as PaymentMethodId[]),
                    );
                  }}
                />
                <span>
                  <span className="font-bold">{PAYMENT_METHOD_META[id].label}</span>
                  <span className="block text-xs text-neutral-500">
                    {PAYMENT_METHOD_META[id].description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <Field label="Venmo username (without @)">
          <Input
            value={form.venmo_username ?? ""}
            onChange={(e) =>
              set("venmo_username", e.target.value.trim() || null)
            }
            placeholder="YourSchoolLunchRun"
          />
        </Field>
        <Field label="Cash App $cashtag">
          <Input
            value={form.cashapp_cashtag ?? ""}
            onChange={(e) =>
              set("cashapp_cashtag", e.target.value.trim() || null)
            }
            placeholder="YourCashtag"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.stripe_enabled}
            onChange={(e) => set("stripe_enabled", e.target.checked)}
          />
          Accept card payments (Stripe)
        </label>
        <p className="text-xs text-neutral-500">
          Stripe needs{" "}
          <code className="rounded bg-neutral-100 px-1">STRIPE_SECRET_KEY</code>,{" "}
          <code className="rounded bg-neutral-100 px-1">
            STRIPE_WEBHOOK_SECRET
          </code>
          , and a webhook pointing to{" "}
          <code className="rounded bg-neutral-100 px-1">
            /api/stripe/webhook
          </code>
          . Keys not visible in this UI — configure in Vercel env.
        </p>
      </section>

      <section className="space-y-3 rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Locations & options</h2>
        <Field label="Delivery locations (comma-separated)">
          <Input
            value={form.delivery_locations.join(", ")}
            onChange={(e) =>
              set(
                "delivery_locations",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              )
            }
          />
        </Field>
        <p className="text-xs text-neutral-500">
          Lunch Run prepay — students authorize max snack prices + fee.
        </p>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.allow_custom_requests}
            onChange={(e) => set("allow_custom_requests", e.target.checked)}
          />
          Allow custom requests
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={form.allow_substitutions}
            onChange={(e) => set("allow_substitutions", e.target.checked)}
          />
          Allow substitutions
        </label>
      </section>

      <section className="space-y-3 rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Shopping category order</h2>
        <p className="text-sm text-neutral-500">
          Drag mentally — use up/down to set store walk order.
        </p>
        <ul className="space-y-2">
          {catOrder.map((id, idx) => {
            const cat = categories.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <li
                key={id}
                className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2"
              >
                <span className="font-semibold">
                  {idx + 1}. {cat.name}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...catOrder];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setCatOrder(next);
                    }}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={idx === catOrder.length - 1}
                    onClick={() => {
                      const next = [...catOrder];
                      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                      setCatOrder(next);
                    }}
                  >
                    ↓
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await categoryOrderAction(catOrder);
              toast.success("Shopping order saved");
              router.refresh();
            })
          }
        >
          Save category order
        </Button>
      </section>

      <section className="flex flex-wrap gap-2 rounded-3xl border bg-white p-5 shadow-sm">
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await saveSettingsAction(form);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success("Settings saved");
              router.refresh();
            })
          }
        >
          Save settings
        </Button>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await reopenOrdersAction();
              toast.success("Orders reopened");
              router.refresh();
            })
          }
        >
          Reopen orders
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await sessionStatusAction("ordering_closed");
              toast.message("Ordering closed");
              router.refresh();
            })
          }
        >
          Close ordering
        </Button>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      {children}
    </div>
  );
}
