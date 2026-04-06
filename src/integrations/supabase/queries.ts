import { supabase } from "@/integrations/supabase/client";
import { bundles as mockBundles, categories as mockCategories, products as mockProducts } from "@/data/mock-data";
import type { Bundle, DailyUsageLog, Order, Product, Profile, RewardProgress, Subscription } from "@/types";
import { appConfig } from "@/config/env";
import { storageKeys } from "@/lib/storage";

const fallbackProducts = mockProducts.map((product) => ({
  ...product,
  category: mockCategories.find((category) => category.id === product.category_id),
}));

function getProfileOverrides(userId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const overrides = JSON.parse(localStorage.getItem(storageKeys.profileOverrides) ?? "{}") as Record<string, Partial<Profile>>;
  return overrides[userId] ?? null;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return fallbackProducts;
  if (!data || data.length === 0) return fallbackProducts;
  return data as Product[];
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }
  return data as Product;
}

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) return mockCategories;
  if (!data || data.length === 0) return mockCategories;
  return data;
}

export async function getBundles() {
  const { data, error } = await supabase.from("bundles").select("*").order("created_at", { ascending: false });
  if (error) return mockBundles;
  if (!data || data.length === 0) return mockBundles;
  return data as Bundle[];
}

export async function getProfile(userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  const overrides = getProfileOverrides(userId);
  if (!data && !overrides) {
    return null;
  }

  return {
    ...(data as Profile | null),
    ...overrides,
  } as Profile;
}

export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [] as Order[];
  return (data as Order[]) ?? [];
}

export async function getSubscriptions(userId: string) {
  const localSubscriptions =
    typeof window !== "undefined"
      ? ((JSON.parse(localStorage.getItem(storageKeys.subscriptions) ?? "[]") as Subscription[]).filter(
          (subscription) => subscription.user_id === userId,
        ) ?? [])
      : [];

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, product:products(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return localSubscriptions;
  return [...(((data as Subscription[]) ?? [])), ...localSubscriptions];
}

export async function getRewardProgress(userId: string): Promise<RewardProgress> {
  const { data: logs, error } = await supabase
    .from("usage_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_on", { ascending: false })
    .limit(30);

  if (error || !logs) {
    return {
      streak: 0,
      target: appConfig.rewardTargetDays,
      completed: false,
      recentLogs: [],
      couponCode: null,
    };
  }

  const recentLogs = logs as DailyUsageLog[];
  const uniqueDays = [...new Set(recentLogs.map((log) => log.logged_on))];
  let streak = 0;
  let cursor = new Date();

  for (const day of uniqueDays) {
    const expected = cursor.toISOString().slice(0, 10);
    if (day === expected) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      if (day === cursor.toISOString().slice(0, 10)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const { data: coupon } = await supabase
    .from("coupons")
    .select("code")
    .eq("active", true)
    .eq("created_by", userId)
    .ilike("code", "STREAK%")
    .limit(1)
    .maybeSingle();

  return {
    streak,
    target: appConfig.rewardTargetDays,
    completed: streak >= appConfig.rewardTargetDays,
    recentLogs,
    couponCode: coupon?.code ?? null,
  };
}

export async function getAdminOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), profile:profiles(display_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) return [] as Order[];
  return (data as Order[]) ?? [];
}

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [] as Profile[];
  return (data as Profile[]) ?? [];
}
