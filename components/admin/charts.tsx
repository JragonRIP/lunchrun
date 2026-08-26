"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function StatusDonut({
  data,
}: {
  data: Array<{ name: string; value: number; fill: string }>;
}) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        No orders yet today
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function FeesBarChart({
  data,
}: {
  data: Array<{ date: string; fees: number }>;
}) {
  const chartData = data.length ? data : [{ date: "Today", fees: 0 }];
  const maxFee = Math.max(...chartData.map((d) => d.fees), 1);

  if (chartData.every((d) => d.fees <= 0)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        No fee revenue yet — complete a delivery to see the chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          width={40}
          domain={[0, Math.ceil(maxFee * 1.25 * 2) / 2 || 2]}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value) => [
            `$${Number(value ?? 0).toFixed(2)}`,
            "Fees",
          ]}
        />
        <Bar dataKey="fees" fill="#ffe500" radius={[8, 8, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
