"use client";

import { useEffect, useState } from "react";
import { Clock, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCountdown, parseTimeToToday } from "@/lib/utils";
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
  const full = !testMode && orderCount >= maxOrders;

  useEffect(() => {
    const tick = () => {
      const cutoff = parseTimeToToday(session.cutoff_time);
      setCountdown(formatCountdown(cutoff.getTime() - Date.now()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.cutoff_time]);

  const closed = !orderingOpen;

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
        <Badge tone={closed || full ? "danger" : "yellow"}>
          {testMode
            ? "Test mode"
            : full
              ? "Full"
              : closed
                ? "Ordering Closed"
                : "Ordering Open"}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="text-xs text-neutral-400">Orders close at</p>
          <p className="mt-1 text-lg font-bold">
            {formatCutoff(session.cutoff_time)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="flex items-center gap-1 text-xs text-neutral-400">
            <Clock className="h-3.5 w-3.5" />
            {testMode ? "Status" : closed ? "Status" : "Closes in"}
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-lr-yellow">
            {testMode ? "Open" : closed ? "Closed" : countdown}
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
      ) : closed ? (
        <p className="mt-4 text-sm text-neutral-300">
          Today&apos;s Lunch Run has already left. Orders reopen next school day.
        </p>
      ) : (
        <p className="mt-4 text-sm text-neutral-300">
          Pick your snacks, set a max price, and we&apos;ll shop for you.
        </p>
      )}
    </section>
  );
}

function formatCutoff(time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 11, m ?? 30);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
