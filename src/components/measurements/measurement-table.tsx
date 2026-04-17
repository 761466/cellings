import * as React from "react";
import {
  formatMeasurementValue,
  MEASUREMENT_META,
  type MeasurementData,
  type MeasurementField,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

function resolveField(keyOrField: string | MeasurementField): MeasurementField | null {
  if (typeof keyOrField !== "string") return keyOrField;
  return MEASUREMENT_META[keyOrField] ?? null;
}

export function MeasurementTable({
  data,
  keys,
  className,
  columns = 2,
}: {
  data: MeasurementData;
  keys: (string | MeasurementField)[];
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  const grid =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";
  return (
    <dl className={cn("grid gap-x-6 gap-y-1", grid, className)}>
      {keys.map((k) => {
        const field = resolveField(k);
        if (!field) return null;
        const value = data[field.key];
        const display = formatMeasurementValue(value, field.unit);
        const hasValue = value != null && value !== "";
        return (
          <div
            key={field.key}
            className="flex items-center justify-between gap-2 border-b border-border/70 py-2"
          >
            <dt className="text-sm text-muted-foreground">{field.label}</dt>
            <dd
              className={cn(
                "text-sm tabular-nums",
                hasValue ? "font-medium" : "text-muted-foreground",
              )}
            >
              {hasValue ? display : "-"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
