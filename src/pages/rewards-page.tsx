import { Gift, Trophy } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-shop";
import { useOrderHistory, useRewardProgress } from "@/hooks/use-orders";
import { getRedeemableDiscount } from "@/lib/personalization";
import { RewardTracker } from "@/components/account/reward-tracker";

export function RewardsPage() {
  const { profile, user } = useAuth();
  const { data: rewardProgress } = useRewardProgress(user?.id);
  const { data: orders = [] } = useOrderHistory(user?.id);
  const { products = [] } = useProducts();
  const points = profile?.loyalty_points ?? 0;
  const discount = getRedeemableDiscount(points);
  const deliveredOrders = orders.filter((order) => order.status === "fulfilled");
  const purchaseCoupon = deliveredOrders[0] ? `ATHLETIQ-${deliveredOrders[0].id.slice(0, 6).toUpperCase()}` : null;

  return (
    <section className="section-shell py-16">
      <Badge>Rewards</Badge>
      <h1 className="mt-4 text-4xl font-bold">Loyalty engineered for consistency</h1>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <Trophy className="h-9 w-9 text-primary" />
          <h2 className="mt-5 text-3xl font-semibold">{points} points</h2>
          <p className="mt-3 text-sm text-muted-foreground">Earn one point for every INR 100 spent on delivered orders.</p>
        </Card>
        <Card>
          <Gift className="h-9 w-9 text-primary" />
          <h2 className="mt-5 text-3xl font-semibold">₹{discount} redeemable</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every 50 points unlocks ₹100 off at checkout. Rewards stack with bundles.
          </p>
        </Card>
      </div>
      {purchaseCoupon ? (
        <div className="mt-10">
          <Card>
            <h3 className="text-2xl font-semibold">Purchase reward coupon</h3>
            <p className="mt-3 text-sm text-muted-foreground">Your delivered order unlocked a next-purchase coupon code.</p>
            <div className="mt-5 inline-flex rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-semibold tracking-[0.18em] text-primary">
              {purchaseCoupon}
            </div>
          </Card>
        </div>
      ) : null}
      {user && rewardProgress && deliveredOrders.length > 0 ? (
        <div className="mt-10">
          <RewardTracker userId={user.id} progress={rewardProgress} products={products} />
        </div>
      ) : (
        <div className="mt-10">
          <Card>
            <h3 className="text-2xl font-semibold">Rewards start after your first delivered order</h3>
            <p className="mt-3 text-sm text-muted-foreground">Get an order delivered to unlock the daily usage streak tracker and purchase coupon.</p>
          </Card>
        </div>
      )}
    </section>
  );
}
