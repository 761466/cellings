"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatKRW } from "@/lib/utils";

export function RevenueBarChart({
  data,
  xKey = "label",
  yKey = "revenue",
  height = 260,
}: {
  data: Array<Record<string, unknown>>;
  xKey?: string;
  yKey?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(222 47% 20%)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(222 47% 11%)" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            stroke="#64748b"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            stroke="#64748b"
            tickFormatter={(v) => {
              const n = Number(v);
              return n >= 10000
                ? `${(n / 10000).toFixed(0)}만`
                : n.toLocaleString();
            }}
          />
          <Tooltip
            cursor={{ fill: "rgba(15,23,42,0.04)" }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(value) => [formatKRW(Number(value)), "매출"]}
          />
          <Bar dataKey={yKey} fill="url(#bar-gradient)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
