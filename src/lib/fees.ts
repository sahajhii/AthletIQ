import type { CartItem, CheckoutAmounts } from "@/types";
import { appConfig } from "@/config/env";
import { getShippingQuote } from "@/lib/shipping";

export function getCheckoutAmounts(items: CartItem[], discount = 0, shippingAddress?: string | null): CheckoutAmounts {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const taxes = Number((subtotal * appConfig.taxRate).toFixed(2));
  const platformFee = subtotal > 0 ? appConfig.platformFee : 0;
  const shippingQuote = getShippingQuote(shippingAddress, subtotal);
  const deliveryFee = shippingQuote.fee;
  const total = Math.max(0, subtotal + taxes + platformFee + deliveryFee - discount);

  return {
    subtotal,
    taxes,
    platformFee,
    deliveryFee,
    deliveryDistanceKm: shippingQuote.distanceKm,
    deliveryZone: shippingQuote.zoneLabel,
    deliveryEta: shippingQuote.etaLabel,
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
