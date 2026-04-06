import { toast } from "sonner";
import { useUpdateSubscription } from "@/hooks/use-orders";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import type { Subscription } from "@/types";

export function SubscriptionManager({ subscriptions }: { subscriptions: Subscription[] }) {
  const updateSubscription = useUpdateSubscription();

  async function handleChange(subscriptionId: string, status: string) {
    try {
      await updateSubscription.mutateAsync({ subscriptionId, status });
      toast.success("Subscription updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update subscription.");
    }
  }

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        title="No subscriptions yet"
        description="Monthly protein and vitamin subscriptions will appear here once activated."
      />
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm text-primary">{subscription.plan_type}</p>
              <h4 className="mt-2 text-xl font-semibold">{subscription.product?.name ?? "Subscription product"}</h4>
              <p className="mt-2 text-sm text-muted-foreground">Started {formatDate(subscription.start_date)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => handleChange(subscription.id, "paused")}>
                Pause
              </Button>
              <Button variant="outline" onClick={() => handleChange(subscription.id, "active")}>
                Reactivate
              </Button>
              <Button variant="destructive" onClick={() => handleChange(subscription.id, "cancelled")}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
