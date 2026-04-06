import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[140px] w-full rounded-[1.25rem] border px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/70",
          className,
        )}
        style={{
          borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
          backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha-soft))",
        }}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
