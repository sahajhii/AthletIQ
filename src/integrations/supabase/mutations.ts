import { supabase } from "@/integrations/supabase/client";
import { calculateLoyaltyPoints } from "@/lib/personalization";
import { getCheckoutAmounts } from "@/lib/fees";
import { isUuid, storageKeys } from "@/lib/storage";
import type { CartItem, Product, Profile, Subscription } from "@/types";

function getStoredProfileOverrides() {
  if (typeof window === "undefined") {
    return {} as Record<string, Partial<Profile>>;
  }

  return JSON.parse(localStorage.getItem(storageKeys.profileOverrides) ?? "{}") as Record<string, Partial<Profile>>;
}

function saveProfileOverride(userId: string, updates: Partial<Profile>) {
  if (typeof window === "undefined") {
    return;
  }

  const overrides = getStoredProfileOverrides();
  localStorage.setItem(
    storageKeys.profileOverrides,
    JSON.stringify({
      ...overrides,
      [userId]: {
        ...(overrides[userId] ?? {}),
        ...updates,
      },
    }),
  );
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/account` : undefined;
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  captchaToken: string,
  acceptedTerms: boolean,
) {
  if (!acceptedTerms) {
    throw new Error("Please accept the Terms & Conditions.");
  }
  if (!captchaToken) {
    throw new Error("Please complete the CAPTCHA validation.");
  }

  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      captchaToken,
      data: {
        display_name: displayName,
        accepted_terms: acceptedTerms,
      },
    },
  });

  return result;
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function updateProfile(profile: Partial<Profile> & { id: string }) {
  const { id, ...updates } = profile;
  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", id).single();
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select("*").single();

  if (error) {
    const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
    const missingRow = error.code === "PGRST116" || message.includes("no rows");
    const schemaIssue =
      error.code === "42703" ||
      message.includes("column") ||
      message.includes("schema cache") ||
      message.includes("could not find the");

    if (missingRow) {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ id, ...updates })
        .select("*")
        .single();

      if (!insertError && insertedProfile) {
        saveProfileOverride(id, updates);
        return {
          ...(insertedProfile as Profile),
          ...updates,
        } as Profile;
      }
    }

    if (!schemaIssue) {
      throw error;
    }

    saveProfileOverride(id, updates);
    return {
      ...(currentProfile as Profile | null),
      ...updates,
      id,
    } as Profile;
  }

  saveProfileOverride(id, updates);
  return {
    ...(data as Profile),
    ...updates,
  } as Profile;
}

export async function createOrder(args: {
  userId: string;
  items: CartItem[];
  shippingAddress?: string;
  loyaltyPointsRedeemed?: number;
  couponCode?: string;
  paymentId?: string;
  paymentProvider?: "razorpay" | "cod";
}) {
  const discountTotal = args.loyaltyPointsRedeemed ? Math.min(999999, args.loyaltyPointsRedeemed / 10) : 0;
  const amounts = getCheckoutAmounts(args.items, discountTotal, args.shippingAddress);
  const total = amounts.total;
  const loyaltyPointsEarned = calculateLoyaltyPoints(total);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: args.userId,
      shipping_address: args.shippingAddress?.trim() || null,
      delivery_distance_km: amounts.deliveryDistanceKm,
      delivery_zone: amounts.deliveryZone,
      subtotal: amounts.subtotal,
      taxes: amounts.taxes,
      platform_fee: amounts.platformFee,
      delivery_fee: amounts.deliveryFee,
      discount_total: amounts.discount,
      loyalty_points_redeemed: args.loyaltyPointsRedeemed ?? 0,
      loyalty_points_earned: loyaltyPointsEarned,
      total,
      status: args.paymentProvider === "cod" ? "pending" : "paid",
      payment_provider: args.paymentProvider ?? "razorpay",
      payment_id: args.paymentId ?? null,
      currency: "INR",
    })
    .select("*")
    .single();

  if (error || !order) {
    throw error ?? new Error("Unable to create order.");
  }

  const orderItems = args.items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }));

  await supabase.from("order_items").insert(orderItems);

  await supabase.rpc("apply_loyalty_points", {
    p_user_id: args.userId,
    p_points_earned: loyaltyPointsEarned,
    p_points_redeemed: args.loyaltyPointsRedeemed ?? 0,
  });

  const subscriptionItems = args.items.filter(
    (item) => item.itemType === "subscription" && item.subscriptionPlanType,
  );

  for (const item of subscriptionItems) {
    await createSubscription({
      userId: args.userId,
      product: item.product,
      planType: item.subscriptionPlanType!,
    });
  }

  return order;
}

export async function createSubscription(args: { userId: string; product: Product; planType: string }) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error("Please sign in to manage subscriptions.");
  }

  if (session.user.id !== args.userId) {
    throw new Error("Your session has changed. Please sign in again.");
  }

  const start_date = new Date().toISOString();
  const renewalPrice =
    args.product.subscription_discount != null
      ? Number((args.product.price * (1 - args.product.subscription_discount / 100)).toFixed(2))
      : args.product.price;

  if (!isUuid(args.product.id)) {
    const fallbackSubscription: Subscription = {
      id: `local-${args.userId}-${args.product.id}-${args.planType}`,
      user_id: args.userId,
      product_id: args.product.id,
      plan_type: args.planType,
      start_date,
      renewal_price: renewalPrice,
      status: "active",
      product: args.product,
    };

    const existing = JSON.parse(localStorage.getItem(storageKeys.subscriptions) ?? "[]") as Subscription[];
    const filtered = existing.filter(
      (subscription) =>
        !(
          subscription.user_id === args.userId &&
          subscription.product_id === args.product.id &&
          subscription.plan_type === args.planType
        ),
    );
    localStorage.setItem(storageKeys.subscriptions, JSON.stringify([fallbackSubscription, ...filtered]));
    return fallbackSubscription;
  }

  const existing = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", args.userId)
    .eq("product_id", args.product.id)
    .eq("plan_type", args.planType)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  const payload = {
    user_id: args.userId,
    product_id: args.product.id,
    plan_type: args.planType,
    start_date,
    status: "active",
    renewal_price: renewalPrice,
  };

  const query = existing.data?.id
    ? supabase.from("subscriptions").update(payload).eq("id", existing.data.id)
    : supabase.from("subscriptions").insert(payload);

  const { data, error } = await query.select("*, product:products(*)").single();

  if (error) throw error;
  return data;
}

export async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  if (subscriptionId.startsWith("local-")) {
    const existing = JSON.parse(localStorage.getItem(storageKeys.subscriptions) ?? "[]") as Subscription[];
    const updated = existing.map((subscription) =>
      subscription.id === subscriptionId ? { ...subscription, status: status as Subscription["status"] } : subscription,
    );
    localStorage.setItem(storageKeys.subscriptions, JSON.stringify(updated));
    const match = updated.find((subscription) => subscription.id === subscriptionId);
    if (!match) {
      throw new Error("Subscription not found.");
    }
    return match;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", subscriptionId)
    .select("*, product:products(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function upsertProduct(product: Partial<Product>) {
  const { data, error } = await supabase.from("products").upsert(product).select("*").single();
  if (error) throw error;
  return data;
}

export async function logUsage(args: { userId: string; productId: string; notes?: string }) {
  const logged_on = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("usage_logs").upsert(
    {
      user_id: args.userId,
      product_id: args.productId,
      logged_on,
      notes: args.notes ?? null,
    },
    { onConflict: "user_id,product_id,logged_on" },
  );

  if (error) throw error;
  return { logged_on };
}

export async function generateStreakCoupon(userId: string) {
  const code = `STREAK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code,
      type: "flat",
      value: 500,
      active: true,
      expires_at,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
