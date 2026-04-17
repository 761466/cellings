"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onChange,
  items,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: React.ReactNode; count?: number }[];
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted p-1 text-sm",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold",
                  active
                    ? "bg-muted text-foreground"
                    : "bg-foreground/10 text-foreground/70",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
