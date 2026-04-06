interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function RangeSlider({ min, max, step = 100, value, onChange }: RangeSliderProps) {
  const leftPercent = ((value[0] - min) / (max - min)) * 100;
  const rightPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div
      className="rounded-[1.25rem] border p-4"
      style={{
        borderColor: "rgba(var(--surface-tint), var(--surface-border-strong))",
        backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha))",
      }}
    >
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>₹{value[0]}</span>
        <span>₹{value[1]}</span>
      </div>
      <div className="relative mt-5 h-6">
        <div
          className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "rgba(var(--surface-tint), var(--surface-border-alpha))" }}
        />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{
            left: `${leftPercent}%`,
            width: `${Math.max(rightPercent - leftPercent, 0)}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(event) => onChange([Math.min(Number(event.target.value), value[1] - step), value[1]])}
          className="range-slider range-slider-left pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(event) => onChange([value[0], Math.max(Number(event.target.value), value[0] + step)])}
          className="range-slider pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}
