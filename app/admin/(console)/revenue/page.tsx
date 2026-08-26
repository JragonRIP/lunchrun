import { FeesBarChart } from "@/components/admin/charts";
import { getRevenueSummary } from "@/lib/services/data";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Revenue" };

export default async function AdminRevenuePage() {
  const r = await getRevenueSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Revenue</h1>
        <p className="text-neutral-500">
          Merchandise is reimbursement — fees are service revenue
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Collected", r.collected],
          ["Store Merchandise Cost", r.merchandise],
          ["Lunch Run Fees", r.fees],
          ["Gross Service Revenue", r.grossServiceRevenue],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-3xl border bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase text-neutral-400">
              {label as string}
            </p>
            <p className="mt-2 text-2xl font-black">
              {formatMoney(value as number)}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Daily report</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Orders" value={String(r.orderCount)} />
          <Stat label="Items" value={String(r.itemCount)} />
          <Stat label="Average order" value={formatMoney(r.averageOrder)} />
          <Stat label="Refunds" value={formatMoney(r.refunds)} />
          <Stat label="Most popular item" value={r.mostPopularItem} />
          <Stat label="Most popular category" value={r.mostPopularCategory} />
          <Stat label="Skipped items" value={String(r.skipped)} />
          <Stat label="Substitutions" value={String(r.substitutions)} />
        </dl>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Service fee revenue</h2>
        <div className="mt-3 h-56">
          <FeesBarChart
            data={r.daily.length ? r.daily : [{ date: "Today", fees: r.fees }]}
          />
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Top products</h2>
        <ol className="mt-3 space-y-2">
          {r.topProducts.map((p, i) => (
            <li key={p.name} className="flex justify-between text-sm">
              <span>
                <span className="mr-2 font-black text-neutral-300">{i + 1}</span>
                {p.name}
              </span>
              <span className="font-bold">×{p.qty}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <dt className="text-xs font-bold uppercase text-neutral-400">{label}</dt>
      <dd className="mt-1 font-black">{value}</dd>
    </div>
  );
}
