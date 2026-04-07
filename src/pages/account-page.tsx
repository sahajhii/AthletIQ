import { useSearchParams } from "react-router-dom";
import { CheckoutPanel } from "@/components/account/checkout-panel";
import { OrderHistory } from "@/components/account/order-history";
import { ProfilePanel } from "@/components/account/profile-panel";
import { SubscriptionManager } from "@/components/account/subscription-manager";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { RewardTracker } from "@/components/account/reward-tracker";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { useAuth } from "@/hooks/use-auth";
import { useOrderHistory, useRewardProgress, useSubscriptions } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-shop";
import { signOut } from "@/integrations/supabase/mutations";

const tabs = ["profile", "orders", "subscriptions", "rewards", "checkout", "admin"] as const;

export function AccountPage() {
  const { user, profile, isAdmin } = useAuth();
  const { data: orders = [] } = useOrderHistory(user?.id);
  const { data: subscriptions = [] } = useSubscriptions(user?.id);
  const { data: rewardProgress } = useRewardProgress(user?.id);
  const { products = [] } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = tabs.includes(searchParams.get("tab") as never) ? (searchParams.get("tab") as (typeof tabs)[number]) : "profile";
  const deliveredOrders = orders.filter((order) => order.status === "fulfilled");
  const purchaseCoupon = deliveredOrders[0] ? `ATHLETIQ-${deliveredOrders[0].id.slice(0, 6).toUpperCase()}` : null;

  return (
    <section className="section-shell py-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge>Account</Badge>
          <h1 className="mt-4 text-4xl font-bold">Your AthletIQ hub</h1>
        </div>
        <Button variant="secondary" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {tabs.filter((item) => (item === "admin" ? isAdmin : true)).map((item) => (
          <Button
            key={item}
            variant={tab === item ? "default" : "secondary"}
            onClick={() => setSearchParams({ tab: item })}
          >
            {item}
          </Button>
        ))}
      </div>

      {purchaseCoupon ? (
        <Card className="mt-10">
          <h3 className="text-2xl font-semibold">Purchase reward coupon</h3>
          <p className="mt-3 text-sm text-muted-foreground">Available in your account after your delivered purchase. Use it on your next order.</p>
          <div className="mt-5 inline-flex rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-semibold tracking-[0.18em] text-primary">
            {purchaseCoupon}
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Suggested reward: flat ₹150 off your next order above ₹999</p>
        </Card>
      ) : null}

      <div className="mt-10">
        {tab === "profile" && profile ? <ProfilePanel profile={profile} /> : null}
        {tab === "orders" ? <OrderHistory orders={orders} /> : null}
        {tab === "subscriptions" ? <SubscriptionManager subscriptions={subscriptions} /> : null}
        {tab === "rewards" ? (
          <div className="space-y-8">
            <Card>
              <h3 className="text-2xl font-semibold">Loyalty points</h3>
              <p className="mt-3 text-4xl font-bold text-primary">{profile?.loyalty_points ?? 0}</p>
              <p className="mt-2 text-sm text-muted-foreground">Earn points on delivered orders and redeem them at checkout.</p>
            </Card>
            {user && rewardProgress && deliveredOrders.length > 0 ? (
              <RewardTracker userId={user.id} progress={rewardProgress} products={products} />
            ) : (
              <Card>
                <h3 className="text-2xl font-semibold">Rewards unlock after your first delivered order</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Once an order is delivered, you can track usage, build streak rewards, and unlock purchase coupons.
                </p>
              </Card>
            )}
          </div>
        ) : null}
        {tab === "checkout" && user ? <CheckoutPanel userId={user.id} profile={profile} /> : null}
        {tab === "admin" && isAdmin ? <AdminDashboard /> : null}
      </div>
    </section>
  );
}
