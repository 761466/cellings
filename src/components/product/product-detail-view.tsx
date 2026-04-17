import * as React from "react";
import { cn } from "@/lib/utils";
import type { DetailBlock } from "@/lib/types";

export function ProductDetailView({
  blocks,
  className,
}: {
  blocks: DetailBlock[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      {blocks.map((b) => {
        if (b.type === "image") {
          return b.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={b.id}
              src={b.url}
              alt={b.alt ?? ""}
              className={cn(
                "rounded-xl object-cover",
                b.layout === "half" ? "w-1/2" : "w-full",
              )}
            />
          ) : null;
        }
        if (b.type === "text") {
          if (b.variant === "title") {
            return (
              <h3
                key={b.id}
                className="text-balance text-xl font-semibold tracking-tight text-foreground"
              >
                {b.content}
              </h3>
            );
          }
          return (
            <p
              key={b.id}
              className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90"
            >
              {b.content}
            </p>
          );
        }
        if (b.type === "features") {
          return (
            <ul key={b.id} className="space-y-2">
              {b.items.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-foreground/5 text-sm">
                    {it.icon ?? "•"}
                  </span>
                  <span className="text-[15px] leading-relaxed">{it.text}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "divider") {
          return <hr key={b.id} className="border-border" />;
        }
        return null;
      })}
    </div>
  );
}
