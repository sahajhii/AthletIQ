import { appConfig } from "@/config/env";
import { bundles, products } from "@/data/mock-data";
import type { Bundle, BundlePreferences, BundleSuggestion, GoalKey, Product, Profile } from "@/types";

export function getRecommendedProducts(profile?: Partial<Profile> | null): Product[] {
  if (!profile?.goal_preference) {
    return products.filter((product) => product.featured).slice(0, 4);
  }

  const activityBoost = profile.activity_level === "high" ? 0.25 : profile.activity_level === "moderate" ? 0.1 : 0;

  return [...products]
    .map((product) => ({
      product,
      score:
        (product.goal_tags.includes(profile.goal_preference as GoalKey) ? 1 : 0) +
        (product.featured ? 0.25 : 0) +
        activityBoost +
        product.rating / 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.product);
}

export function getRecommendedBundle(goal?: GoalKey | null): Bundle | null {
  if (!goal) return bundles[0] ?? null;
  return bundles.find((bundle) => bundle.goal === goal) ?? bundles[0] ?? null;
}

export function buildBundleFromPreferences(preferences: BundlePreferences): BundleSuggestion {
  const budgetTier = preferences.budget < 3000 ? "budget" : preferences.budget < 8000 ? "balanced" : "premium";
  const bmiSignal = preferences.heightCm > 0 ? preferences.weightKg / ((preferences.heightCm / 100) * (preferences.heightCm / 100)) : 0;
  const existingBundle = bundles.find((bundle) => bundle.goal === preferences.fitnessGoal) ?? bundles[0];
  const matchedProducts = products
    .filter(
      (product) =>
        product.goal_tags.includes(preferences.fitnessGoal) &&
        (preferences.experienceLevel === "advanced" || !product.goal_tags.includes("advanced")),
    )
    .filter((product) => {
      if (preferences.activityLevel === "low") {
        return !product.tags?.includes("high-intensity");
      }
      return true;
    })
    .filter((product) => product.price <= Math.max(preferences.budget, 1200))
    .filter((product) => {
      if (preferences.fitnessGoal === "weight-loss") {
        return !product.tags?.includes("strength") || bmiSignal >= 25;
      }
      return true;
    })
    .slice(0, budgetTier === "premium" ? 4 : 3);

  const selectedProducts = matchedProducts.length ? matchedProducts : products.slice(0, 3);

  return {
    title: `${preferences.experienceLevel[0].toUpperCase()}${preferences.experienceLevel.slice(1)} ${preferences.fitnessGoal
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ")} Bundle`,
    description: "A dynamic stack generated instantly from your fitness goal, body metrics, experience level, and budget.",
    products: selectedProducts,
    estimatedTotal: selectedProducts.reduce((sum, product) => sum + product.price, 0),
    reason: `Optimized for ${preferences.fitnessGoal.replace("-", " ")}, ${preferences.experienceLevel} training experience, ${preferences.activityLevel} activity, ${preferences.heightCm} cm height, ${preferences.weightKg} kg weight, and a ${budgetTier} budget.`,
    image_url: existingBundle?.image_url ?? selectedProducts[0]?.image_url ?? "",
  };
}

export function calculateLoyaltyPoints(total: number) {
  return Math.floor(total / 100);
}

export function getRedeemableDiscount(points: number) {
  return Math.floor(points / 50) * 100;
}

export function getRewardProgress(streak: number) {
  return {
    streak,
    target: appConfig.rewardTargetDays,
    completed: streak >= appConfig.rewardTargetDays,
  };
}
