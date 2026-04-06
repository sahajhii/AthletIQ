import { motion } from "framer-motion";
import { Activity, Dumbbell, Flame, HeartPulse, Home, Sparkles, type LucideIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useBundleSuggestion } from "@/hooks/use-ai";
import { buildBundleFromPreferences } from "@/lib/personalization";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { BundlePreferences, GoalKey } from "@/types";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";

const softSurfaceStyle = {
  borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
  backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha-soft))",
} as const;

const mediumSurfaceStyle = {
  borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
  backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha))",
} as const;

const defaultPreferences: BundlePreferences = {
  fitnessGoal: "muscle-gain",
  experienceLevel: "beginner",
  activityLevel: "moderate",
  budget: 4000,
  heightCm: 170,
  weightKg: 70,
};

const goalOptions: Array<{
  label: string;
  value: GoalKey;
  icon: LucideIcon;
  description: string;
}> = [
  { label: "Weight loss", value: "weight-loss", icon: Flame, description: "Lean support, cardio, and recovery essentials." },
  { label: "Muscle gain", value: "muscle-gain", icon: Dumbbell, description: "Strength-focused stack for growth and recovery." },
  { label: "Home workout", value: "home-workout", icon: Home, description: "Compact training tools for home sessions." },
  { label: "Beginner", value: "beginner", icon: HeartPulse, description: "Simple essentials to start strong." },
  { label: "Advanced", value: "advanced", icon: Activity, description: "Higher-output picks for experienced training." },
];

const activityOptions: Array<{ label: string; value: BundlePreferences["activityLevel"]; description: string }> = [
  { label: "Low", value: "low", description: "Mostly light movement and few weekly sessions." },
  { label: "Moderate", value: "moderate", description: "Balanced routine with regular workouts." },
  { label: "High", value: "high", description: "Frequent training and higher recovery demand." },
];

const experienceOptions: Array<{ label: string; value: BundlePreferences["experienceLevel"] }> = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

function formatHeightValue(heightCm: number, unit: "cm" | "ft") {
  if (unit === "cm") {
    return String(heightCm);
  }

  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}.${String(inches).padStart(2, "0")}`;
}

function parseHeightValue(value: string, unit: "cm" | "ft") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  if (unit === "cm") {
    return numeric;
  }

  const feet = Math.floor(numeric);
  const inches = Math.round((numeric - feet) * 100);
  return Math.round((feet * 12 + inches) * 2.54);
}

function formatWeightValue(weightKg: number, unit: "kg" | "lbs") {
  if (unit === "kg") {
    return String(weightKg);
  }

  return String(Math.round(weightKg * 2.20462));
}

function parseWeightValue(value: string, unit: "kg" | "lbs") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  if (unit === "kg") {
    return numeric;
  }

  return Math.round((numeric / 2.20462) * 10) / 10;
}

export function BundlePersonalizer() {
  const [preferences, setPreferences] = useState<BundlePreferences>(defaultPreferences);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const suggestion = useBundleSuggestion();
  const addBundle = useCartStore((state) => state.addBundle);

  const fallbackSuggestion = buildBundleFromPreferences(preferences);
  const activeSuggestion = suggestion.data ?? fallbackSuggestion;
  const bundleProducts = activeSuggestion.products.map((product) => ({ product, quantity: 1 }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    await suggestion.mutateAsync(preferences);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
      <Card>
        <Badge>
          <Sparkles className="mr-2 h-3 w-3" />
          Personalized bundle
        </Badge>
        <div className="mt-4 rounded-[1.5rem] border border-primary/20 bg-primary/[0.08] p-4">
          <p className="text-sm text-foreground">
            Build a sharper bundle with your body metrics, training rhythm, experience, and spending range.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-primary">
            Quick form • one focused recommendation
          </p>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">1. Choose your goal</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {goalOptions.map((option) => {
                const Icon = option.icon;
                const active = preferences.fitnessGoal === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreferences((prev) => ({ ...prev, fitnessGoal: option.value }))}
                    className={[
                      "rounded-[1.35rem] border px-4 py-4 text-left transition-all",
                      active
                        ? "border-primary/60 bg-primary/[0.14] shadow-glow"
                        : "hover:border-primary/30",
                    ].join(" ")}
                    style={
                      active
                        ? undefined
                        : {
                            borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
                            backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha-soft))",
                          }
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={active ? "rounded-2xl bg-primary/20 p-2 text-primary" : "rounded-2xl p-2 text-foreground/80"}
                        style={active ? undefined : { backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha-strong))" }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">2. Body metrics</p>
              <div className="mt-3 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[1.35rem] border p-4" style={softSurfaceStyle}>
                  <div className="mb-3 space-y-3">
                    <p className="text-sm text-muted-foreground">Height</p>
                    <div className="inline-flex rounded-full border p-1" style={mediumSurfaceStyle}>
                      {(["cm", "ft"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setHeightUnit(unit)}
                          className={[
                            "rounded-full px-3 py-1 text-xs transition-all",
                            heightUnit === unit ? "bg-primary/[0.16] text-primary" : "text-muted-foreground hover:text-foreground",
                          ].join(" ")}
                        >
                          {unit === "cm" ? "cm" : "ft/in"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={heightUnit === "cm" ? 120 : 4}
                    max={heightUnit === "cm" ? 230 : 7.11}
                    step={heightUnit === "cm" ? 1 : 0.01}
                    value={formatHeightValue(preferences.heightCm, heightUnit)}
                    onChange={(event) =>
                      setPreferences((prev) => ({
                        ...prev,
                        heightCm: parseHeightValue(event.target.value, heightUnit),
                      }))
                    }
                    placeholder={heightUnit === "cm" ? "Height in cm" : "Height as 5.10"}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {heightUnit === "cm" ? "Use centimeters." : "Use feet.inches format, for example 5.10."}
                  </p>
                </div>
                <div className="rounded-[1.35rem] border p-4" style={softSurfaceStyle}>
                  <div className="mb-3 space-y-3">
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <div className="inline-flex rounded-full border p-1" style={mediumSurfaceStyle}>
                      {(["kg", "lbs"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setWeightUnit(unit)}
                          className={[
                            "rounded-full px-3 py-1 text-xs transition-all",
                            weightUnit === unit ? "bg-primary/[0.16] text-primary" : "text-muted-foreground hover:text-foreground",
                          ].join(" ")}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={weightUnit === "kg" ? 30 : 66}
                    max={weightUnit === "kg" ? 250 : 551}
                    step={weightUnit === "kg" ? 1 : 1}
                    value={formatWeightValue(preferences.weightKg, weightUnit)}
                    onChange={(event) =>
                      setPreferences((prev) => ({
                        ...prev,
                        weightKg: parseWeightValue(event.target.value, weightUnit),
                      }))
                    }
                    placeholder={weightUnit === "kg" ? "Weight in kg" : "Weight in lbs"}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {weightUnit === "kg" ? "Use kilograms." : "Use pounds."}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">3. Training profile</p>
              <div className="mt-3 space-y-4 rounded-[1.35rem] border p-4" style={softSurfaceStyle}>
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Activity level</p>
                  <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                    {activityOptions.map((option) => {
                      const active = preferences.activityLevel === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPreferences((prev) => ({ ...prev, activityLevel: option.value }))}
                          className={[
                            "rounded-2xl border px-4 py-4 text-left transition-all",
                            active
                              ? "border-primary/60 bg-primary/[0.14] text-foreground"
                              : "bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
                          ].join(" ")}
                          style={active ? undefined : { borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))" }}
                        >
                          <p className="font-medium">{option.label}</p>
                          <p className="mt-2 text-sm leading-7">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Experience level</p>
                  <div className="flex flex-wrap gap-2">
                    {experienceOptions.map((option) => {
                      const active = preferences.experienceLevel === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPreferences((prev) => ({ ...prev, experienceLevel: option.value }))}
                          className={[
                            "rounded-full border px-4 py-2 text-sm transition-all",
                            active
                              ? "border-primary/60 bg-primary/[0.14] text-foreground"
                              : "bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
                          ].join(" ")}
                          style={active ? undefined : { borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))" }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.35rem] border p-4" style={softSurfaceStyle}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">4. Budget</p>
                <p className="mt-1 text-sm text-muted-foreground">Move the range based on how much you want to spend.</p>
              </div>
              <div className="rounded-full border border-primary/30 bg-primary/[0.12] px-4 py-2 text-sm font-semibold text-primary">
                {formatCurrency(preferences.budget)}
              </div>
            </div>
            <input
              type="range"
              min={1500}
              max={12000}
              step={500}
              value={preferences.budget}
              onChange={(event) => setPreferences((prev) => ({ ...prev, budget: Number(event.target.value) }))}
              className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full accent-primary"
              style={{ backgroundColor: "rgba(var(--surface-tint), var(--surface-border-alpha))" }}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>₹1,500</span>
              <span>₹12,000</span>
            </div>
          </div>

          <Button type="submit" disabled={suggestion.isPending} className="w-full sm:w-auto">
            {suggestion.isPending ? "Building bundle..." : "Generate personalized bundle"}
          </Button>
        </form>
      </Card>

      {hasSubmitted ? (
        <Card className="overflow-hidden p-0">
          <motion.img
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            src={activeSuggestion.image_url}
            alt={activeSuggestion.title}
            className="h-64 w-full object-cover"
          />
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <Badge>Personalized for you</Badge>
              <span className="text-sm text-primary">{formatCurrency(activeSuggestion.estimatedTotal)}</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">{activeSuggestion.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{activeSuggestion.description}</p>
              <p className="mt-3 text-sm text-primary">{activeSuggestion.reason}</p>
            </div>
            <div className="grid gap-3">
              {activeSuggestion.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.tags?.join(" • ")}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>
            <Button onClick={() => addBundle(bundleProducts)}>Add personalized bundle</Button>
          </div>
        </Card>
      ) : (
        <Card className="flex min-h-[420px] items-center justify-center text-center">
          <div className="max-w-md">
            <Badge>Ready when you are</Badge>
            <h3 className="mt-4 text-2xl font-semibold">Your custom bundle will appear here</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Fill out the form to get one curated bundle with matching products, pricing, and a hero image.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
