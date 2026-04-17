"use client";

import * as React from "react";
import {
  MEASUREMENT_META,
  categoryLabel,
  formatMeasurementValue,
  resolveMeasurementKeysBySide,
  type MeasurementData,
  type MeasurementProfile,
} from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Footprints } from "lucide-react";

function KeyGrid({
  keys,
  data,
  columns = 3,
}: {
  keys: string[];
  data: MeasurementData;
  columns?: 2 | 3;
}) {
  const grid =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <dl className={cn("grid gap-x-6 gap-y-1", grid)}>
      {keys.map((k) => {
        const f = MEASUREMENT_META[k];
        if (!f) return null;
        const v = data[k];
        const has = v != null && v !== "";
        return (
          <div
            key={k}
            className="flex items-center justify-between gap-2 border-b border-border/60 py-2"
          >
            <dt className="text-sm text-muted-foreground">{f.label}</dt>
            <dd
              className={cn(
                "text-sm tabular-nums",
                has ? "font-medium" : "text-muted-foreground",
              )}
            >
              {has ? formatMeasurementValue(v, f.unit) : "-"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function CategoryMeasurementView({
  profile,
  categoryName,
  data,
  compact,
}: {
  profile: MeasurementProfile;
  categoryName?: string | null;
  data: MeasurementData;
  compact?: boolean;
}) {
  const mapping = resolveMeasurementKeysBySide({ profile, customKeys: null });
  const [side, setSide] = React.useState<"left" | "right">("left");

  if (mapping.common) {
    return (
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline">
            {categoryName ?? categoryLabel(profile)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            제작에 필요한 측정값
          </span>
        </div>
        <KeyGrid keys={mapping.common} data={data} columns={compact ? 2 : 3} />
      </div>
    );
  }

  // 신발: 좌/우 탭
  const keys = side === "left" ? mapping.left ?? [] : mapping.right ?? [];
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="outline">
          {categoryName ?? categoryLabel(profile)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          좌/우발 각각 측정값
        </span>
      </div>
      <div className="mb-3 inline-flex rounded-lg border border-border bg-muted p-1">
        {(["left", "right"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm transition-colors",
              side === s
                ? "bg-background shadow-card text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Footprints className="h-3.5 w-3.5" />
            {s === "left" ? "왼발" : "오른발"}
          </button>
        ))}
      </div>
      <KeyGrid keys={keys} data={data} columns={compact ? 2 : 3} />
    </div>
  );
}
