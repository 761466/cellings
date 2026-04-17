import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function Thead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      {...props}
      className={cn(
        "[&_tr]:border-b bg-muted/40 text-muted-foreground",
        props.className,
      )}
    />
  );
}

export function Tbody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      {...props}
      className={cn("[&_tr:last-child]:border-0", props.className)}
    />
  );
}

export function Tr(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      {...props}
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted",
        props.className,
      )}
    />
  );
}

export function Th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      className={cn(
        "h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide",
        props.className,
      )}
    />
  );
}

export function Td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      className={cn("px-4 py-3 align-middle", props.className)}
    />
  );
}
