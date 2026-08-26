import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PriceFreshness, SubstitutionPreference } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatMoneyRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null && Math.abs(min - max) < 0.005) {
    return formatMoney(min);
  }
  if (min != null && max != null) {
    return `${formatMoney(min)}–${formatMoney(max)}`;
  }
  return formatMoney(min ?? max);
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function suggestMaxPrice(estimated: number | null): number {
  if (estimated == null) return 5;
  return roundMoney(Math.ceil(estimated * 1.15 * 2) / 2);
}

export function getPriceFreshness(lastUpdate: string | null): PriceFreshness {
  if (!lastUpdate) return "stale";
  const hours = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60);
  if (hours < 24) return "fresh";
  if (hours < 72) return "aging";
  return "stale";
}

export function freshnessLabel(lastUpdate: string | null): string {
  if (!lastUpdate) return "Estimated price";
  const d = new Date(lastUpdate);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (sameDay) return `Last checked today at ${time}`;
  return `Last checked ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
}

export const SUBSTITUTION_LABELS: Record<SubstitutionPreference, string> = {
  closest_under_max: "Get closest similar item under my maximum",
  any_flavor: "Any flavor of this item",
  skip: "Skip this item",
  ask_me: "Ask me (may slow down the order)",
};

export function generateOrderCode(seq: number): string {
  return `LR-${String(seq).padStart(4, "0")}`;
}

export function generateTrackingToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function parseTimeToToday(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 11, m ?? 30, 0, 0);
  return d;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function normalizeProductKey(brand: string | null, name: string, size: string | null): string {
  return [brand, name, size]
    .map((s) => (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())
    .join("|");
}

export function sanitizeText(input: string, max = 500): string {
  return input.replace(/[<>]/g, "").trim().slice(0, max);
}
