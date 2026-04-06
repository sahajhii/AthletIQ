import type { CartItem, CheckoutAmounts } from "@/types";
import { appConfig } from "@/config/env";

export function getCheckoutAmounts(items: CartItem[], discount = 0): CheckoutAmounts {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const taxes = Number((subtotal * appConfig.taxRate).toFixed(2));
  const platformFee = subtotal > 0 ? appConfig.platformFee : 0;
  const deliveryFee = subtotal >= appConfig.freeDeliveryThreshold || subtotal === 0 ? 0 : appConfig.deliveryFee;
  const total = Math.max(0, subtotal + taxes + platformFee + deliveryFee - discount);

  return {
    subtotal,
    taxes,
    platformFee,
    deliveryFee,
    discount,
    total,
  };
}

export function getFrequentlyBoughtTogether(items: CartItem[], catalog: CartItem["product"][]) {
  const categories = new Set(items.map((item) => item.product.category_id));
  const currentIds = new Set(items.map((item) => item.product.id));

  return catalog
    .filter((product) => !currentIds.has(product.id) && (categories.has(product.category_id) || product.featured))
    .slice(0, 3);
}
