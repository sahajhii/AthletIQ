export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY ?? "",
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "",
};

export const appConfig = {
  currency: "INR",
  rewardTargetDays: 15,
  taxRate: 0.18,
  platformFee: 39,
  freeDeliveryThreshold: 2999,
  deliveryFee: 99,
};
