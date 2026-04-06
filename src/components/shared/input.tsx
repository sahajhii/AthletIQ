import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-full border px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/70",
          className,
        )}
        style={{
          borderColor: "rgba(var(--surface-tint), var(--surface-border-strong))",
          backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha))",
        }}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
