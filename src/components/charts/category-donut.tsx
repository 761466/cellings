"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1"];

export function CategoryDonut({
  data,
  height = 220,
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(value, _n, item) => [
              formatNumber(Number(value)),
              (item as { payload?: { label?: string } }).payload?.label ?? "",
            ]}
          />
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            nameKey="label"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
