import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export function OrderHistory({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your completed orders will appear here after checkout." />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-primary">Order #{order.id.slice(0, 8)}</p>
              <h4 className="mt-2 text-xl font-semibold">{formatDate(order.created_at)}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{order.items?.length ?? 0} items</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-lg font-semibold">{formatCurrency(order.total)}</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">{order.status}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
