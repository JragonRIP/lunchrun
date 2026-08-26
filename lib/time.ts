/** School / operator timezone for cutoff, sessions, and countdown. */
export const APP_TIMEZONE = "America/Chicago";

type ZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZonedParts(date: Date, timeZone = APP_TIMEZONE): ZoneParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? "0" : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/** Today's calendar date in Central Time as YYYY-MM-DD. */
export function todayInAppTz(now = new Date()): string {
  const p = getZonedParts(now);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * Interpret HH:MM as today's time in Central Time and return the UTC Date.
 */
export function parseTimeToTodayInAppTz(
  time: string,
  now = new Date(),
): Date {
  const [hRaw, mRaw] = time.split(":");
  const hour = Number(hRaw);
  const minute = Number(mRaw);
  const h = Number.isFinite(hour) ? hour : 11;
  const m = Number.isFinite(minute) ? minute : 30;

  const today = getZonedParts(now);
  return zonedLocalToUtc(today.year, today.month, today.day, h, m, 0);
}

/** Convert a wall-clock time in APP_TIMEZONE to a UTC Date. */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
  timeZone = APP_TIMEZONE,
): Date {
  // Start with a UTC guess, then correct using the zone's wall time.
  let utc = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let i = 0; i < 3; i++) {
    const parts = getZonedParts(new Date(utc), timeZone);
    const asIfUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const desired = Date.UTC(year, month - 1, day, hour, minute, second);
    utc += desired - asIfUtc;
  }
  return new Date(utc);
}

export function formatCutoffLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour = Number.isFinite(h) ? h : 11;
  const minute = Number.isFinite(m) ? m : 30;
  const d = new Date(2000, 0, 1, hour, minute);
  const label = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${label} CT`;
}

export function msUntilCutoff(time: string, now = new Date()): number {
  return parseTimeToTodayInAppTz(time, now).getTime() - now.getTime();
}
