import { Search } from "lucide-react";
import { Input } from "@/components/shared/input";
import { RangeSlider } from "@/components/shared/range-slider";
import { Select } from "@/components/shared/select";
import type { ProductFilters } from "@/types";

export function FilterBar({
  filters,
  onChange,
  categories,
}: {
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
  categories: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr,0.9fr,0.9fr,1.2fr]">
      <div className="relative flex h-11 items-center">
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-foreground/70" />
        <Input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Search by product or benefit"
          className="h-11 pl-11"
        />
      </div>
      <Select
        value={filters.category}
        onValueChange={(value) => onChange({ ...filters, category: value })}
        placeholder="All categories"
        options={[{ label: "All categories", value: "" }, ...categories]}
      />
      <Select
        value={filters.goal}
        onValueChange={(value) => onChange({ ...filters, goal: value })}
        placeholder="All goals"
        options={[
          { label: "All goals", value: "" },
          { label: "Weight Loss", value: "weight-loss" },
          { label: "Muscle Gain", value: "muscle-gain" },
          { label: "Home Workout", value: "home-workout" },
          { label: "Beginner", value: "beginner" },
          { label: "Advanced", value: "advanced" },
        ]}
      />
      <RangeSlider min={0} max={20000} step={250} value={filters.priceRange} onChange={(priceRange) => onChange({ ...filters, priceRange })} />
    </div>
  );
}
