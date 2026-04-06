import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/shared/button";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, close, items, updateQuantity, removeItem, clear } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l p-6 text-foreground shadow-2xl"
          style={{
            borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
            backgroundColor: "hsl(var(--background))",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary">Cart</p>
              <h2 className="mt-2 text-2xl font-semibold">Your stack</h2>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div
                className="rounded-full border p-4 text-primary"
                style={{ borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))" }}
              >
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Cart is empty</h3>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Add supplements, equipment, or a full performance bundle to get started.
              </p>
              <Dialog.Close asChild>
                <Button asChild className="mt-6">
                  <Link to="/shop">Browse products</Link>
                </Button>
              </Dialog.Close>
            </div>
          ) : (
            <>
              <div className="mt-8 flex-1 space-y-4 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="glass-panel flex gap-4 rounded-[1.5rem] p-4">
                    <img src={item.product.image_url} alt={item.product.name} className="h-24 w-24 rounded-2xl object-cover" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold">{item.product.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.product.price)}</p>
                          {item.itemType === "subscription" ? (
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary">
                              Subscription • {item.subscriptionPlanType}
                            </p>
                          ) : null}
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div
                          className="mt-4 flex items-center gap-3 rounded-full border px-3 py-2"
                          style={{ borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))" }}
                        >
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.itemType === "subscription"}>
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="border-t pt-6"
                style={{ borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))" }}
              >
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mt-4 grid gap-3">
                  <Button variant="ghost" onClick={clear}>
                    Clear cart
                  </Button>
                  <Dialog.Close asChild>
                    <Button asChild>
                      <Link to="/account?tab=checkout">Secure checkout</Link>
                    </Button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <Button asChild variant="secondary">
                      <Link to="/shop">Continue shopping</Link>
                    </Button>
                  </Dialog.Close>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
