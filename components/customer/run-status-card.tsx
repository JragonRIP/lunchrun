"use client";

import { useEffect, useState } from "react";
import { Clock, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCutoffLabel, msUntilCutoff } from "@/lib/time";
import { formatCountdown } from "@/lib/utils";
import type { LunchRunSession, Store as StoreType } from "@/lib/types";

export function RunStatusCard({
  session,
  store,
  orderingOpen,
  orderCount,
  maxOrders,
  testMode = false,
}: {
  session: LunchRunSession;
  store: StoreType | null;
  orderingOpen: boolean;
  orderCount: number;
  maxOrders: number;
  testMode?: boolean;
}) {
  const [countdown, setCountdown] = useState("00:00");
  const [msLeft, setMsLeft] = useState(0);
  const full = !testMode && orderCount >= maxOrders;

  useEffect(() => {
    const tick = () => {
      const ms = msUntilCutoff(session.cutoff_time);
      setMsLeft(ms);
      setCountdown(formatCountdown(ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.cutoff_time]);

  const withinCutoff = msLeft > 0;
  const open = testMode || (!full && orderingOpen && withinCutoff);

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-black p-5 text-white shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lr-yellow">
            Today&apos;s Run
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-black">
            <Store className="h-5 w-5 text-lr-yellow" />
            {store?.name ?? "Store TBD"}
          </h2>
        </div>
        <Badge tone={!open ? "danger" : "yellow"}>
          {testMode
            ? "Test mode"
            : full
              ? "Full"
              : open
                ? "Ordering Open"
                : "Ordering Closed"}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-xs text-neutral-400">Orders close at</p>
          <p className="mt-1 text-lg font-bold">
            {formatCutoffLabel(session.cutoff_time)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="flex items-center gap-1 text-xs text-neutral-400">
            <Clock className="h-3.5 w-3.5" />
            {testMode ? "Status" : open ? "Time left" : "Status"}
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-lr-yellow tabular-nums">
            {testMode ? "Open" : full ? "Full" : open ? countdown : "Closed"}
          </p>
        </div>
      </div>

      {testMode ? (
        <p className="mt-4 text-sm text-amber-200">
          Test mode is on — you can place orders past the normal cutoff.
        </p>
      ) : full ? (
        <p className="mt-4 text-sm text-amber-200">
          Today&apos;s Lunch Run is full. Check back tomorrow!
        </p>
      ) : open ? (
        <p className="mt-4 text-sm text-neutral-300">
          {countdown} left to order
        </p>
      ) : (
        <p className="mt-4 text-sm text-neutral-300">
          Today&apos;s Lunch Run has already left. Orders reopen next school day.
        </p>
      )}
    </section>
  );
}
