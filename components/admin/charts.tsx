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

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
      <BarChart data={chartData}>
        <XAxis dataKey="date" hide={chartData.length < 3} />
        <YAxis hide={chartData.length < 2} />
        <Tooltip />
        <Bar dataKey="fees" fill="#ffe500" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
