import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({
  value,
  onValueChange,
  placeholder,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="relative flex h-11 items-center">
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          "h-11 w-full appearance-none rounded-full border px-4 pr-10 text-sm leading-none text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
        )}
        style={{
          borderColor: "rgba(var(--surface-tint), var(--surface-border-strong))",
          backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha))",
        }}
      >
        <option value="">{placeholder}</option>
        {options
          .filter((option) => !(option.value === "" && option.label === placeholder))
          .map((option) => (
            <option key={option.value} value={option.value} className="bg-[#10151d]">
              {option.label}
            </option>
          ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70" />
    </div>
  );
}
