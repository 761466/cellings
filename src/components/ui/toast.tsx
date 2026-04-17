"use client";

import { Toaster as Sonner } from "sonner";

export { toast } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-border bg-background text-foreground shadow-elevated",
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground",
        },
      }}
    />
  );
}
