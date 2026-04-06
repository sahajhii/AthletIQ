import { toast } from "sonner";
import { useGenerateCoupon, useLogUsage } from "@/hooks/use-orders";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Select } from "@/components/shared/select";
import type { Product, RewardProgress } from "@/types";
import { useEffect, useState } from "react";

export function RewardTracker({
  userId,
  progress,
  products,
}: {
  userId: string;
  progress: RewardProgress;
  products: Product[];
}) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const logUsage = useLogUsage();
  const generateCoupon = useGenerateCoupon();

  useEffect(() => {
    if (!selectedProductId && products[0]?.id) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  async function handleLog() {
    try {
      await logUsage.mutateAsync({ userId, productId: selectedProductId });
      toast.success("Usage logged.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log usage.");
    }
  }

  async function handleGenerateCoupon() {
    try {
      const coupon = await generateCoupon.mutateAsync(userId);
      toast.success(`Coupon created: ${coupon.code}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate coupon.");
    }
  }

  const progressPercent = Math.min(100, (progress.streak / progress.target) * 100);

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold">Reward tracker</h3>
          <p className="mt-2 text-sm text-muted-foreground">Log daily product usage to build a {progress.target}-day streak.</p>
        </div>
        <div className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">{progress.streak} day streak</div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr,auto]">
        <Select
          value={selectedProductId}
          onValueChange={setSelectedProductId}
          placeholder="Select product"
          options={products.map((product) => ({ label: product.name, value: product.id }))}
        />
        <Button onClick={() => void handleLog()} disabled={!selectedProductId || logUsage.isPending}>
          Log today
        </Button>
      </div>
      {progress.completed ? (
        <div className="mt-6 rounded-[1.25rem] border border-primary/20 bg-primary/10 p-4">
          <p className="font-medium">Streak complete</p>
          <p className="mt-2 text-sm text-muted-foreground">Generate a coupon reward for your completed streak.</p>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={() => void handleGenerateCoupon()} disabled={generateCoupon.isPending}>
              Generate coupon
            </Button>
            {progress.couponCode ? <span className="text-sm text-primary">{progress.couponCode}</span> : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
