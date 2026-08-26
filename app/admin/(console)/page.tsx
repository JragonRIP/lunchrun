import Link from "next/link";
import { FeesBarChart, StatusDonut } from "@/components/admin/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminDashboard, getRevenueSummary } from "@/lib/services/data";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const dash = await getAdminDashboard();
  const revenue = await getRevenueSummary();

  const statusData = [
    { name: "Delivered", value: dash.statusBreakdown.delivered, fill: "#10b981" },
    { name: "Ready", value: dash.statusBreakdown.ready, fill: "#3b82f6" },
    { name: "Shopping", value: dash.statusBreakdown.shopping, fill: "#f59e0b" },
    { name: "Received", value: dash.statusBreakdown.received, fill: "#a3a3a3" },
    { name: "Unpaid", value: dash.statusBreakdown.unpaid, fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  const metrics = [
    { label: "Today's Orders", value: String(dash.metrics.todaysOrders) },
    { label: "Shopping Total", value: formatMoney(dash.metrics.shoppingTotal) },
    { label: "Lunch Run Fees", value: formatMoney(dash.metrics.lunchRunFees) },
    {
      label: "Delivered",
      value: `${dash.metrics.delivered} / ${dash.metrics.todaysOrders}`,
    },
    { label: "Paid Orders", value: String(dash.metrics.paidOrders) },
    { label: "Pending Payments", value: String(dash.metrics.pendingPayments) },
  ];

  const chartDaily = revenue.daily.length
    ? revenue.daily
    : [{ date: "Today", fees: dash.metrics.lunchRunFees }];

  return (
    <div className="space-y-6">
      <div className="space-y-3 sm:flex sm:flex-wrap sm:items-end sm:justify-between sm:space-y-0 sm:gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-neutral-500">
            {new Date(dash.session.date + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            · Cutoff {dash.session.cutoff_time}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href="/admin/shop" className="sm:block">
            <Button className="w-full" size="lg">
              Shopping Mode
            </Button>
          </Link>
          <Link href="/admin/deliver" className="sm:block">
            <Button className="w-full" size="lg" variant="secondary">
              Deliveries
            </Button>
          </Link>
        </div>
      </div>

      {dash.metrics.stalePrices > 0 ? (
        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">
            {dash.metrics.stalePrices} prices stale
          </p>
          <Link href="/admin/prices">
            <Button size="sm" variant="outline">
              Review Price Data
            </Button>
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 sm:text-xs">
              {m.label}
            </p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-black">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {dash.recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No Lunch Run orders yet today.
              </p>
            ) : (
              dash.recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3"
                >
                  <div>
                    <p className="font-bold">{o.customer_name}</p>
                    <p className="text-xs text-neutral-500">
                      {o.order_code} · {o.items?.length ?? 0} items ·{" "}
                      {formatMoney(o.max_authorized_total)} max
                    </p>
                  </div>
                  <Badge
                    tone={o.payment_status === "paid" ? "success" : "warning"}
                  >
                    {o.payment_status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Order Status</h2>
          <div className="mt-2 h-52">
            <StatusDonut data={statusData} />
          </div>
          <ul className="space-y-1 text-sm">
            {statusData.map((s) => (
              <li key={s.name} className="flex justify-between">
                <span className="text-neutral-500">{s.name}</span>
                <span className="font-bold">{s.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Today&apos;s Top Items</h2>
          <ol className="mt-4 space-y-2">
            {dash.topItems.map((item, i) => (
              <li
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  <span className="mr-2 font-black text-neutral-300">
                    {i + 1}
                  </span>
                  {item.name}
                </span>
                <span className="font-bold">×{item.qty}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Revenue Overview</h2>
          <div className="mt-2 h-52">
            <FeesBarChart data={chartDaily} />
          </div>
          <p className="text-sm text-neutral-500">
            Service fee revenue only — merchandise is reimbursement.
          </p>
        </section>
      </div>
    </div>
  );
}
