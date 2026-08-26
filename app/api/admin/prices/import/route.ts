import { NextResponse } from "next/server";
import { importPrices, isDemoMode } from "@/lib/services/data";
import { priceImportSchema } from "@/lib/validation/schemas";

const rateMap = new Map<string, { count: number; reset: number }>();

function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.reset < now) {
    rateMap.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const expected = process.env.PRICE_IMPORT_API_KEY;

  if (!expected) {
    if (!isDemoMode()) {
      return NextResponse.json(
        { error: "PRICE_IMPORT_API_KEY not configured" },
        { status: 503 },
      );
    }
  } else if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = priceImportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const log = await importPrices(parsed.data, "external-collector");
  return NextResponse.json({ ok: true, log });
}
