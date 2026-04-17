"use client";

import * as React from "react";
import {
  FIELDS_BY_GROUP,
  FOOT_FIELDS_LEFT,
  FOOT_FIELDS_RIGHT,
  MEASUREMENT_GROUP_LABEL,
  type MeasurementData,
  type MeasurementField,
  type MeasurementGroup,
} from "@/lib/domain";
import { MeasurementInputGrid } from "./measurement-input-grid";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Footprints } from "lucide-react";

type Section = { group: MeasurementGroup; fields: MeasurementField[] };

const SECTIONS: Section[] = (
  ["body", "composition", "posture", "spine"] as MeasurementGroup[]
).map((g) => ({ group: g, fields: FIELDS_BY_GROUP[g] }));

function CollapsibleSection({
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">{title}</span>
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
        </div>
      </button>
      {open ? <div className="border-t border-border px-5 py-4">{children}</div> : null}
    </div>
  );
}

export function ScannerMeasurementEditor({
  value,
  onChange,
  defaultOpenGroups = ["body"],
}: {
  value: MeasurementData;
  onChange: (next: MeasurementData) => void;
  defaultOpenGroups?: (MeasurementGroup | "foot")[];
}) {
  const [footSide, setFootSide] = React.useState<"left" | "right">("left");

  return (
    <div className="space-y-3">
      {SECTIONS.map(({ group, fields }) => (
        <CollapsibleSection
          key={group}
          title={MEASUREMENT_GROUP_LABEL[group]}
          badge={`${fields.length}개 항목`}
          defaultOpen={defaultOpenGroups.includes(group)}
        >
          <MeasurementInputGrid
            keys={fields}
            value={value}
            onChange={onChange}
            columns={3}
          />
        </CollapsibleSection>
      ))}

      <CollapsibleSection
        title="발 스캔"
        badge="좌/우 분리"
        defaultOpen={defaultOpenGroups.includes("foot")}
      >
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
        <MeasurementInputGrid
          keys={footSide === "left" ? FOOT_FIELDS_LEFT : FOOT_FIELDS_RIGHT}
          value={value}
          onChange={onChange}
          columns={3}
        />
      </CollapsibleSection>
    </div>
  );
}
