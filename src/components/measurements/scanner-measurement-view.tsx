"use client";

import * as React from "react";
import {
  FIELDS_BY_GROUP,
  FOOT_FIELDS_LEFT,
  FOOT_FIELDS_RIGHT,
  MEASUREMENT_GROUP_LABEL,
  formatMeasurementValue,
  type MeasurementData,
  type MeasurementField,
  type MeasurementGroup,
} from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Footprints } from "lucide-react";

const SECTIONS: { group: MeasurementGroup; fields: MeasurementField[] }[] = (
  ["body", "composition", "posture", "spine"] as MeasurementGroup[]
).map((g) => ({ group: g, fields: FIELDS_BY_GROUP[g] }));

function Section({
  title,
  badge,
  filledCount,
  children,
}: {
  title: string;
  badge?: string;
  filledCount?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
        </div>
        {filledCount ? (
          <span className="text-xs text-muted-foreground">{filledCount}</span>
        ) : null}
      </div>
      <div className="border-t border-border px-5 py-4">{children}</div>
    </div>
  );
}

function FieldGrid({
  fields,
  data,
}: {
  fields: MeasurementField[];
  data: MeasurementData;
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((f) => {
        const v = data[f.key];
        const has = v != null && v !== "";
        return (
          <div
            key={f.key}
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

function countFilled(fields: MeasurementField[], data: MeasurementData): number {
  return fields.filter((f) => {
    const v = data[f.key];
    return v != null && v !== "";
  }).length;
}

export function ScannerMeasurementView({ data }: { data: MeasurementData }) {
  const [footSide, setFootSide] = React.useState<"left" | "right">("left");

  return (
    <div className="space-y-3">
      {SECTIONS.map(({ group, fields }) => {
        const filled = countFilled(fields, data);
        return (
          <Section
            key={group}
            title={MEASUREMENT_GROUP_LABEL[group]}
            badge={`${fields.length}개 항목`}
            filledCount={`${filled}/${fields.length} 입력됨`}
          >
            <FieldGrid fields={fields} data={data} />
          </Section>
        );
      })}

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">발 스캔</span>
            <Badge variant="outline">좌/우 분리</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            L {countFilled(FOOT_FIELDS_LEFT, data)}/{FOOT_FIELDS_LEFT.length} ·
            R {countFilled(FOOT_FIELDS_RIGHT, data)}/{FOOT_FIELDS_RIGHT.length}
          </div>
        </div>
        <div className="border-t border-border px-5 py-4">
          <div className="mb-4 inline-flex rounded-lg border border-border bg-muted p-1">
            {(["left", "right"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFootSide(s)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm transition-colors",
                  footSide === s
                    ? "bg-background shadow-card text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Footprints className="h-3.5 w-3.5" />
                {s === "left" ? "왼발" : "오른발"}
              </button>
            ))}
          </div>
          <FieldGrid
            fields={footSide === "left" ? FOOT_FIELDS_LEFT : FOOT_FIELDS_RIGHT}
            data={data}
          />
        </div>
      </div>
    </div>
  );
}
