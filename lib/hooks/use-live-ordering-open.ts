"use client";

import { useEffect, useState } from "react";
import { msUntilCutoff } from "@/lib/time";

/**
 * Live open/closed from session eligibility + cutoff countdown.
 * Extending the cutoff reopens ordering as soon as the new time is ahead of now.
 */
export function useLiveOrderingOpen(
  sessionAccepting: boolean,
  cutoffTime: string,
  testMode = false,
): boolean {
  const [withinCutoff, setWithinCutoff] = useState(
    () => testMode || msUntilCutoff(cutoffTime) > 0,
  );

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
  return sessionAccepting && withinCutoff;
}
