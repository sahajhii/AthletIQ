import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { products } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Bundle } from "@/types";

export function BundleCard({ bundle }: { bundle: Bundle }) {
  const addBundle = useCartStore((state) => state.addBundle);

  const bundleProducts = bundle.items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.product_id);
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter(Boolean) as Array<{ product: (typeof products)[number]; quantity: number }>;

  const total = bundleProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountedTotal = total * (1 - bundle.discount_percentage / 100);

  return (
    <Card className="overflow-hidden p-0">
      <motion.img whileHover={{ scale: 1.03 }} src={bundle.image_url} alt={bundle.name} className="h-56 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <Badge>{bundle.goal.replace("-", " ")}</Badge>
          <span className="text-sm text-primary">{bundle.discount_percentage}% off</span>
        </div>
        <div>
          <h3 className="text-2xl font-semibold">{bundle.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{bundle.description}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {bundle.experience_level ?? "all levels"} • {bundle.budget_tier ?? "balanced"}
          </p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {bundleProducts.map((item) => (
            <li key={item.product.id} className="flex items-center justify-between">
              <span>{item.product.name}</span>
              <span>x{item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{formatCurrency(discountedTotal)}</p>
            <p className="text-sm text-muted-foreground line-through">{formatCurrency(total)}</p>
          </div>
          <Button onClick={() => addBundle(bundleProducts)}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add full bundle
          </Button>
        </div>
      </div>
    </Card>
  );
}
