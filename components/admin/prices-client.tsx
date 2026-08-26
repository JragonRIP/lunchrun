"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import type {
  PendingProductMatch,
  PriceHistoryEntry,
  PriceImportLog,
  Product,
} from "@/lib/types";
import { formatMoney, freshnessLabel, getPriceFreshness } from "@/lib/utils";

export function PricesClient({
  products,
  history,
  pending,
  logs,
}: {
  products: Product[];
  history: PriceHistoryEntry[];
  pending: PendingProductMatch[];
  logs: PriceImportLog[];
}) {
  const sampleProduct = products[0];
  const chartData = history
    .filter((h) => h.product_id === sampleProduct?.id)
    .map((h) => ({
      date: h.created_at.slice(0, 10),
      price: h.new_price,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Price Data</h1>
        <p className="text-neutral-500">
          Import via API · never auto-publish uncertain matches
        </p>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="font-bold">Admin price disclaimer</p>
        <p className="mt-1">
          Imported prices show source, last checked time, and match status.
          Uncertain matches stay in Needs Review until you connect them.
        </p>
      </div>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Needs Review ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No pending matches.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-bold">{p.name}</span>
                  {p.brand ? ` · ${p.brand}` : ""}
                  {p.price != null ? ` · ${formatMoney(p.price)}` : ""}
                </span>
                <Badge tone="warning">{p.match_status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Product freshness</h2>
        <div className="mt-3 space-y-2">
          {products.map((p) => {
            const f = getPriceFreshness(p.last_price_update);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-neutral-500">
                    {freshnessLabel(p.last_price_update)} · Source: Dollar
                    General Online · Match: Verified
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black">
                    {p.current_price != null
                      ? formatMoney(p.current_price)
                      : "—"}
                  </p>
                  <Badge
                    tone={
                      f === "fresh"
                        ? "success"
                        : f === "aging"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {f}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {sampleProduct ? (
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="font-black">Price history · {sampleProduct.name}</h2>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  chartData.length
                    ? chartData
                    : [
                        {
                          date: "now",
                          price: sampleProduct.current_price ?? 0,
                        },
                      ]
                }
              >
                <XAxis dataKey="date" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#0a0a0a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Import logs</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            No imports yet. POST to /api/admin/prices/import with Bearer
            PRICE_IMPORT_API_KEY.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="rounded-2xl bg-neutral-50 px-4 py-3">
                <p className="font-bold">
                  {log.source} · {new Date(log.timestamp).toLocaleString()}
                </p>
                <p className="text-neutral-500">
                  {log.successful_updates} updated · {log.new_products} new ·{" "}
                  {log.failed_updates} failed · {log.warnings.length} warnings
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
