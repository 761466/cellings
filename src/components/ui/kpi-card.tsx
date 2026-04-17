import * as React from "react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: number; suffix?: string } | null;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        {delta ? (
          <span
            className={cn(
              "text-xs font-medium",
              delta.value >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {delta.value >= 0 ? "▲" : "▼"} {Math.abs(delta.value)}
            {delta.suffix ?? "%"}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
