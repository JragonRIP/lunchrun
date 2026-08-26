"use client";

import { useEffect, useState } from "react";
import { msUntilCutoff } from "@/lib/time";

/**
 * Server `orderingOpen` plus a live Central Time countdown so the UI closes
 * at cutoff without waiting for a refresh.
 */
export function useLiveOrderingOpen(
  orderingOpen: boolean,
  cutoffTime: string,
  testMode = false,
): boolean {
  const [withinCutoff, setWithinCutoff] = useState(true);

  useEffect(() => {
    if (testMode) {
      setWithinCutoff(true);
      return;
    }
    const tick = () => setWithinCutoff(msUntilCutoff(cutoffTime) > 0);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cutoffTime, testMode]);

  if (testMode) return true;
  return orderingOpen && withinCutoff;
}
