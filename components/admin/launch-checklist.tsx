"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

const CHECKS = [
  {
    id: "test-mode",
    label: "Test mode is OFF",
    href: "/admin/settings",
    done: (ctx: Ctx) => !ctx.testMode,
  },
  {
    id: "cutoff",
    label: "Cutoff time is set for today",
    href: "/admin/settings",
    done: () => true,
  },
  {
    id: "e2e",
    label: "Run one full practice order (order → shop → deliver → change)",
    href: "/admin/orders",
    done: (ctx: Ctx) => ctx.hasDeliveredOrder,
  },
  {
    id: "password",
    label: "Admin password rotated after sharing",
    href: "/admin/settings",
    done: () => false,
    manual: true,
  },
] as const;

type Ctx = {
  testMode: boolean;
  hasDeliveredOrder: boolean;
};

export function LaunchChecklist({
  testMode,
  hasDeliveredOrder,
}: {
  testMode: boolean;
  hasDeliveredOrder: boolean;
}) {
  const ctx = { testMode, hasDeliveredOrder };
  const blockers = CHECKS.filter((c) => !("manual" in c && c.manual) && !c.done(ctx));

  return (
    <section
      className={
        testMode || blockers.length
          ? "rounded-3xl border border-amber-300 bg-amber-50 p-5 shadow-sm"
          : "rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-800">
            Launch checklist
          </p>
          <h2 className="mt-1 text-lg font-black text-lr-black">
            {testMode
              ? "Test mode is still on — do not share the QR yet"
              : blockers.length
                ? "Almost ready"
                : "Looking good for go-live"}
          </h2>
        </div>
        {testMode ? (
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-lr-black">
            TEST MODE
          </span>
        ) : null}
      </div>
      <ul className="mt-4 space-y-2">
        {CHECKS.map((item) => {
          const done = item.done(ctx);
          const manual = "manual" in item && item.manual;
          return (
            <li key={item.id} className="flex items-start gap-2 text-sm">
              {done && !manual ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              )}
              <span className={done && !manual ? "text-neutral-600" : "font-semibold"}>
                <Link href={item.href} className="underline-offset-2 hover:underline">
                  {item.label}
                </Link>
                {manual ? (
                  <span className="ml-1 font-normal text-neutral-500">
                    (confirm in Supabase Auth)
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
