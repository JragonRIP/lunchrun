import type { AppSettings, LunchRunSession } from "@/lib/types";
import { parseTimeToTodayInAppTz } from "@/lib/time";

/**
 * Session can take orders (status + capacity). Ignores cutoff time so
 * extending the cutoff can reopen ordering without fighting a stale "closed" flag.
 */
export function isSessionAcceptingOrders(
  session: LunchRunSession,
  settings: AppSettings,
  orderCount: number,
): boolean {
  if (settings.test_mode) return true;

  if (session.status === "cancelled" || session.status === "completed") {
    return false;
  }
  if (session.status !== "open" && session.status !== "scheduled") {
    return false;
  }
  if (orderCount >= (session.max_orders || settings.max_daily_orders)) {
    return false;
  }
  return true;
}

/** Whether students can place orders right now (session + cutoff). */
export function isOrderingOpen(
  session: LunchRunSession,
  settings: AppSettings,
  orderCount: number,
): boolean {
  if (settings.test_mode) return true;
  if (!isSessionAcceptingOrders(session, settings, orderCount)) return false;

  const cutoff = parseTimeToTodayInAppTz(
    session.cutoff_time || settings.default_cutoff,
  );
  return Date.now() < cutoff.getTime();
}
