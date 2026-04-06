import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

function getCartItemId(productId: string, itemType: CartItem["itemType"] = "product", subscriptionPlanType?: string | null) {
  return `${itemType}:${productId}:${subscriptionPlanType ?? "one-time"}`;
}

function normalizeCartItem(item: Partial<CartItem> & { product: Product; quantity: number }): CartItem {
  const itemType = item.itemType ?? "product";
  const subscriptionPlanType = item.subscriptionPlanType ?? null;
  return {
    ...item,
    id: item.id ?? getCartItemId(item.product.id, itemType, subscriptionPlanType),
    itemType,
    subscriptionPlanType,
    quantity: itemType === "subscription" ? 1 : item.quantity,
  };
}

interface CartState {
  isOpen: boolean;
  currentUserId: string | null;
  cartsByUser: Record<string, CartItem[]>;
  items: CartItem[];
  setUser: (userId: string | null) => void;
  open: () => void;
  close: () => void;
  addItem: (product: Product, quantity?: number) => void;
  addSubscriptionItem: (product: Product, planType: string) => void;
  addBundle: (products: Array<{ product: Product; quantity: number }>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      currentUserId: null,
      cartsByUser: {},
      items: [],
      setUser: (userId) => {
        const cartKey = userId ?? "guest";
        const cartsByUser = get().cartsByUser;
        set({
          currentUserId: userId,
          items: cartsByUser[cartKey] ?? [],
        });
      },
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (product, quantity = 1) => {
        const current = get().items;
        const itemId = getCartItemId(product.id);
        const existing = current.find((item) => item.id === itemId);
        const cartKey = get().currentUserId ?? "guest";

        if (existing) {
          const items = current.map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item));
          set({
            items,
            cartsByUser: {
              ...get().cartsByUser,
              [cartKey]: items,
            },
            isOpen: true,
          });
          return;
        }

        const items: CartItem[] = [
          ...current,
          { id: itemId, product, quantity, itemType: "product", subscriptionPlanType: null },
        ];
        set({
          items,
          cartsByUser: {
            ...get().cartsByUser,
            [cartKey]: items,
          },
          isOpen: true,
        });
      },
      addSubscriptionItem: (product, planType) => {
        const current = get().items;
        const itemId = getCartItemId(product.id, "subscription", planType);
        const existing = current.find((item) => item.id === itemId);
        const cartKey = get().currentUserId ?? "guest";

        if (existing) {
          set({ items: current, isOpen: true });
          return;
        }

        const items: CartItem[] = [
          ...current,
          {
            id: itemId,
            product,
            quantity: 1,
            itemType: "subscription",
            subscriptionPlanType: planType,
          },
        ];
        set({
          items,
          cartsByUser: {
            ...get().cartsByUser,
            [cartKey]: items,
          },
          isOpen: true,
        });
      },
      addBundle: (bundleProducts) => {
        bundleProducts.forEach(({ product, quantity }) => get().addItem(product, quantity));
        set({ isOpen: true });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        const cartKey = get().currentUserId ?? "guest";
        const items = get().items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.itemType === "subscription" ? 1 : quantity }
            : item,
        );
        set({
          items,
          cartsByUser: {
            ...get().cartsByUser,
            [cartKey]: items,
          },
        });
      },
      removeItem: (itemId) => {
        const cartKey = get().currentUserId ?? "guest";
        const items = get().items.filter((item) => item.id !== itemId);
        set({
          items,
          cartsByUser: {
            ...get().cartsByUser,
            [cartKey]: items,
          },
        });
      },
      clear: () => {
        const cartKey = get().currentUserId ?? "guest";
        set({
          items: [],
          cartsByUser: {
            ...get().cartsByUser,
            [cartKey]: [],
          },
        });
      },
    }),
    {
      name: "athletiq-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cartsByUser: state.cartsByUser }),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<CartState> | undefined;
        const cartsByUser = Object.fromEntries(
          Object.entries(typedState?.cartsByUser ?? {}).map(([key, items]) => [
            key,
            (items ?? []).map((item) => normalizeCartItem(item as CartItem)),
          ]),
        );
        return {
          ...currentState,
          ...typedState,
          cartsByUser,
          items: [],
        };
      },
    },
  ),
);
