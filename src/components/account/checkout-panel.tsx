import { Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCheckout } from "@/hooks/use-orders";
import { useUpdateProfile } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { getRedeemableDiscount } from "@/lib/personalization";
import { getCheckoutAmounts, getFrequentlyBoughtTogether } from "@/lib/fees";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { useProducts } from "@/hooks/use-shop";
import { openRazorpayCheckout } from "@/integrations/razorpay/client";
import type { Profile } from "@/types";

export function CheckoutPanel({ userId, profile }: { userId: string; profile: Profile | null }) {
  const { applyProfile } = useAuth();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const addItem = useCartStore((state) => state.addItem);
  const checkout = useCheckout();
  const updateProfile = useUpdateProfile();
  const { products = [] } = useProducts();
  const [couponCode, setCouponCode] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [addressMode, setAddressMode] = useState<"saved" | "new">(profile?.address ? "saved" : "new");
  const [newAddress, setNewAddress] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);

  const loyaltyDiscount = redeemPoints && profile ? getRedeemableDiscount(profile.loyalty_points) : 0;
  const selectedAddress = addressMode === "saved" ? profile?.address?.trim() ?? "" : newAddress.trim();
  const amounts = useMemo(() => getCheckoutAmounts(items, loyaltyDiscount, selectedAddress), [items, loyaltyDiscount, selectedAddress]);
  const frequentlyBoughtTogether = useMemo(() => getFrequentlyBoughtTogether(items, products), [items, products]);

  useEffect(() => {
    setAddressMode(profile?.address ? "saved" : "new");
  }, [profile?.address]);

  async function handleCheckout() {
    if (!items.length) {
      toast.error("Add products before checkout.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select or add a delivery address.");
      return;
    }
    try {
      const persistAddress = async () => {
        if (addressMode === "new" && saveAddress && profile) {
          const savedProfile = await updateProfile.mutateAsync({
            id: profile.id,
            address: selectedAddress,
          });
          applyProfile(savedProfile);
        }
      };

      if (paymentMethod === "cod") {
        await persistAddress();
        await checkout.mutateAsync({
          userId,
          items,
          shippingAddress: selectedAddress,
          loyaltyPointsRedeemed: redeemPoints ? loyaltyDiscount * 10 : 0,
          couponCode,
          paymentProvider: "cod",
        });
        clear();
        if (addressMode === "new") {
          setNewAddress("");
        }
        toast.success("Order placed with Cash on Delivery.");
        return;
      }

      await openRazorpayCheckout({
        amount: amounts.total,
        email: profile?.email,
        name: profile?.display_name ?? undefined,
        onSuccess: async (paymentId) => {
          await persistAddress();
          await checkout.mutateAsync({
            userId,
            items,
            shippingAddress: selectedAddress,
            loyaltyPointsRedeemed: redeemPoints ? loyaltyDiscount * 10 : 0,
            couponCode,
            paymentId,
            paymentProvider: "razorpay",
          });
          clear();
          if (addressMode === "new") {
            setNewAddress("");
          }
          toast.success("Order placed successfully.");
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
    }
  }

  return (
    <Card>
      <h3 className="text-2xl font-semibold">Secure checkout</h3>
      <p className="mt-2 text-sm text-muted-foreground">Orders are stored in Supabase with reward redemption support.</p>
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
            <div>
              <h4 className="font-medium">{item.product.name}</h4>
              {item.itemType === "subscription" ? (
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-primary">
                  Subscription • {item.subscriptionPlanType}
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-3 rounded-full border border-white/10 px-3 py-2 text-sm">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.itemType === "subscription"}>
                  <Plus className="h-4 w-4" />
                </button>
                <button onClick={() => removeItem(item.id)} className="ml-2 text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[1fr,auto]">
        <Input placeholder="Coupon code" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} />
        <label className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-3 text-sm text-muted-foreground">
          <input type="checkbox" checked={redeemPoints} onChange={(event) => setRedeemPoints(event.target.checked)} />
          Redeem rewards ({profile?.loyalty_points ?? 0} pts)
        </label>
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <h4 className="font-medium">Payment method</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("razorpay")}
            className={[
              "rounded-[1.25rem] border px-4 py-4 text-left transition-all",
              paymentMethod === "razorpay"
                ? "border-primary/60 bg-primary/[0.14]"
                : "border-white/10 bg-transparent hover:border-primary/30",
            ].join(" ")}
          >
            <p className="font-medium">Pay online</p>
            <p className="mt-2 text-sm text-muted-foreground">Complete checkout instantly with Razorpay.</p>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("cod")}
            className={[
              "rounded-[1.25rem] border px-4 py-4 text-left transition-all",
              paymentMethod === "cod"
                ? "border-primary/60 bg-primary/[0.14]"
                : "border-white/10 bg-transparent hover:border-primary/30",
            ].join(" ")}
          >
            <p className="font-medium">Cash on Delivery</p>
            <p className="mt-2 text-sm text-muted-foreground">Pay when your order arrives at your address.</p>
          </button>
        </div>
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-medium">Delivery address</h4>
            <p className="mt-1 text-sm text-muted-foreground">Choose your saved address or add a new one for this order.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[220px,1fr]">
          <Select
            value={addressMode}
            onValueChange={(value) => setAddressMode(value === "new" ? "new" : "saved")}
            placeholder="Choose address"
            options={[
              ...(profile?.address ? [{ label: "Use saved address", value: "saved" }] : []),
              { label: "Add new address", value: "new" },
            ]}
          />
          {addressMode === "saved" && profile?.address ? (
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
              {profile.address}
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Add your full delivery address"
                value={newAddress}
                onChange={(event) => setNewAddress(event.target.value)}
                className="min-h-[112px]"
              />
              <label className="flex items-center gap-3 rounded-full border border-white/10 px-4 py-3 text-sm text-muted-foreground">
                <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
                Save this address to my account
              </label>
            </div>
          )}
        </div>
        <div className="mt-4 rounded-[1.25rem] border border-primary/20 bg-primary/[0.08] px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-foreground">Shipping from Mira Road hub</span>
            <span className="font-medium text-primary">
              {amounts.deliveryDistanceKm} km • {amounts.deliveryZone}
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">Estimated delivery window: {amounts.deliveryEta}</p>
        </div>
      </div>
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(amounts.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Taxes</span>
          <span>{formatCurrency(amounts.taxes)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Platform fee</span>
          <span>{formatCurrency(amounts.platformFee)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery charges</span>
          <span>{formatCurrency(amounts.deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Loyalty discount</span>
          <span>-{formatCurrency(amounts.discount)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(amounts.total)}</span>
        </div>
      </div>
      {frequentlyBoughtTogether.length > 0 ? (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Frequently bought together</h4>
          </div>
          <div className="grid gap-3">
            {frequentlyBoughtTogether.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                </div>
                <Button variant="secondary" onClick={() => addItem(product)}>
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <Button
        className="mt-6"
        onClick={handleCheckout}
        disabled={checkout.isPending || updateProfile.isPending || items.length === 0}
      >
        {checkout.isPending || updateProfile.isPending
          ? "Processing..."
          : paymentMethod === "cod"
            ? "Place COD order"
            : "Pay with Razorpay"}
      </Button>
    </Card>
  );
}
