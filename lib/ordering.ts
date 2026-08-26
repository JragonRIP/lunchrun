import type { AppSettings, LunchRunSession } from "@/lib/types";
import { parseTimeToToday } from "@/lib/utils";

/** Whether students can place orders right now. */
export function isOrderingOpen(
  session: LunchRunSession,
  settings: AppSettings,
  orderCount: number,
): boolean {
  if (settings.test_mode) return true;

  if (session.status === "cancelled" || session.status === "completed") return false;
  if (session.status !== "open" && session.status !== "scheduled") return false;
  if (orderCount >= (session.max_orders || settings.max_daily_orders)) return false;
  const cutoff = parseTimeToToday(session.cutoff_time || settings.default_cutoff);
  return Date.now() < cutoff.getTime();
}
