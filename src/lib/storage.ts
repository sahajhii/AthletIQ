export const storageKeys = {
  wishlist: "athletiq-wishlist",
  cartOpen: "athletiq-cart-open",
  subscriptions: "athletiq-subscriptions",
  profileOverrides: "athletiq-profile-overrides",
};

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
