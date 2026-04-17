"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-sm font-medium leading-none text-foreground/90",
      className,
    )}
    {...props}
  >
    {children}
    {required ? <span className="ml-0.5 text-destructive">*</span> : null}
  </label>
));
Label.displayName = "Label";
