export type CategoryKey =
  | "supplements"
  | "equipment"
  | "accessories"
  | "wellness";

export type GoalKey =
  | "weight-loss"
  | "muscle-gain"
  | "home-workout"
  | "beginner"
  | "advanced";

export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";
export type CouponType = "flat" | "percentage";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type ThemeMode = "dark" | "light";

export interface Profile {
  id: string;
  email?: string;
  display_name: string | null;
  avatar_url: string | null;
  address: string | null;
  role: "customer" | "admin";
  loyalty_points: number;
  goal_preference: GoalKey | null;
  activity_level: "low" | "moderate" | "high" | null;
  reward_streak: number;
  terms_accepted_at?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  compare_at_price?: number | null;
  category_id: string;
  category?: Category;
  goal_tags: GoalKey[];
  stock: number;
  rating: number;
  featured: boolean;
  plan_type?: "monthly" | "quarterly" | "bi-monthly" | null;
  subscription_discount?: number | null;
  tags?: string[];
}

export interface BundleItem {
  product_id: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  goal: GoalKey;
  experience_level?: ExperienceLevel;
  budget_tier?: "budget" | "balanced" | "premium";
  image_url: string;
  discount_percentage: number;
  items: BundleItem[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  itemType?: "product" | "subscription";
  subscriptionPlanType?: string | null;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  shipping_address?: string | null;
  subtotal: number;
  taxes: number;
  platform_fee: number;
  delivery_fee: number;
  discount_total: number;
  loyalty_points_redeemed: number;
  loyalty_points_earned: number;
  total: number;
  payment_provider?: "razorpay" | "cod" | null;
  payment_id?: string | null;
  currency?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  plan_type: string;
  start_date: string;
  renewal_price?: number;
  status: SubscriptionStatus;
  product?: Product;
}

export interface LoyaltyLedger {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  active: boolean;
  expires_at?: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
}

export interface ProductFilters {
  search: string;
  category: string;
  goal: string;
  priceRange: [number, number];
}

export interface BundlePreferences {
  fitnessGoal: GoalKey;
  experienceLevel: ExperienceLevel;
  activityLevel: "low" | "moderate" | "high";
  budget: number;
  heightCm: number;
  weightKg: number;
}

export interface BundleSuggestion {
  title: string;
  description: string;
  products: Product[];
  estimatedTotal: number;
  reason: string;
  image_url: string;
}

export interface DailyUsageLog {
  id: string;
  user_id: string;
  product_id: string;
  logged_on: string;
  notes?: string | null;
}

export interface RewardProgress {
  streak: number;
  target: number;
  completed: boolean;
  couponCode?: string | null;
  recentLogs: DailyUsageLog[];
}

export interface CheckoutAmounts {
  subtotal: number;
  taxes: number;
  platformFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
}
