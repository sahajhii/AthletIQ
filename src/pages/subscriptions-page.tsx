import { toast } from "sonner";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { useAuth } from "@/hooks/use-auth";
import { useSubscriptions } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-shop";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export function SubscriptionsPage() {
  const { user, loading } = useAuth();
  const { products = [] } = useProducts();
  const subscriptionProducts = products.filter((product) => product.plan_type);
  const { data: subscriptions = [] } = useSubscriptions(user?.id);
  const addSubscriptionItem = useCartStore((state) => state.addSubscriptionItem);

  async function handleSubscribe(productId: string, planType: string) {
    if (loading) {
      toast.info("Checking your session...");
      return;
    }
    if (!user) {
      toast.error("Please sign in to create a subscription.");
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product) return;

    try {
      addSubscriptionItem(product, planType);
      toast.success("Subscription added to cart. Complete payment to activate it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add subscription.");
    }
  }

  return (
    <section className="section-shell py-16">
      <Badge>Subscriptions</Badge>
      <h1 className="mt-4 text-4xl font-bold">Monthly fuel, managed your way</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Set recurring protein and wellness essentials, then pause or cancel anytime from your account.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {subscriptionProducts.map((product) => (
          <Card key={product.id}>
            <img src={product.image_url} alt={product.name} className="h-52 w-full rounded-[1.25rem] object-cover" />
            <h3 className="mt-5 text-2xl font-semibold">{product.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-lg font-semibold">
                {formatCurrency(product.price)}
                <span className="text-sm text-muted-foreground"> / {product.plan_type}</span>
              </p>
              <Button onClick={() => void handleSubscribe(product.id, product.plan_type ?? "monthly")}>
                Add to cart
              </Button>
            </div>
            {product.subscription_discount ? (
              <p className="mt-2 text-sm text-primary">{product.subscription_discount}% subscription savings</p>
            ) : null}
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold">Your active plans</h2>
        {subscriptions.length > 0 ? (
          <div className="mt-8 grid gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{subscription.product?.name}</p>
                    <p className="text-sm capitalize text-muted-foreground">{subscription.status}</p>
                  </div>
                  <p className="text-sm text-primary">{subscription.plan_type}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-8">
            <p className="text-lg font-medium">None</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You do not have any active subscription plans yet.
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}
