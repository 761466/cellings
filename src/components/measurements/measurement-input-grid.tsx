"use client";

import * as React from "react";
import {
  MEASUREMENT_META,
  UNIT_SUFFIX,
  type MeasurementData,
  type MeasurementField,
} from "@/lib/domain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function resolveField(keyOrField: string | MeasurementField): MeasurementField | null {
  if (typeof keyOrField !== "string") return keyOrField;
  return MEASUREMENT_META[keyOrField] ?? null;
}

export function MeasurementInputGrid({
  keys,
  value,
  onChange,
  columns = 2,
  className,
}: {
  keys: (string | MeasurementField)[];
  value: MeasurementData;
  onChange: (next: MeasurementData) => void;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const grid =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";

  const setValue = (k: string, raw: string, isText: boolean) => {
    const next = { ...value };
    if (raw === "") {
      delete next[k];
    } else if (isText) {
      next[k] = raw;
    } else {
      const num = Number(raw);
      next[k] = Number.isNaN(num) ? raw : num;
    }
    onChange(next);
  };

  return (
    <div className={cn(`grid gap-4 ${grid}`, className)}>
      {keys.map((k) => {
        const field = resolveField(k);
        if (!field) return null;
        const current = value[field.key];
        const isText = field.unit === "text";
        const suffix = UNIT_SUFFIX[field.unit];
        return (
          <div key={field.key} className="space-y-1.5">
            <Label>
              {field.label}
              {field.hint ? (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  · {field.hint}
                </span>
              ) : null}
            </Label>
            <div className="relative">
              <Input
                type={isText ? "text" : "number"}
                inputMode={isText ? "text" : "decimal"}
                step={isText ? undefined : "0.1"}
                value={current ?? ""}
                onChange={(e) => setValue(field.key, e.target.value, isText)}
                placeholder={isText ? "예: 표준 / 평발 / 경증" : suffix}
                className={suffix ? "pr-12" : undefined}
              />
              {suffix ? (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {suffix}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
