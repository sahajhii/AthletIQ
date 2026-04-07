import { MapPin, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderTrackingSteps, getShippingQuote } from "@/lib/shipping";
import type { Order } from "@/types";

export function OrderHistory({ orders }: { orders: Order[] }) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your completed orders will appear here after checkout." />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const shippingQuote = getShippingQuote(order.shipping_address, order.subtotal);
        const trackingSteps = getOrderTrackingSteps(order.created_at, order.status);
        const isExpanded = expandedOrderId === order.id;

        return (
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

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
              >
                {isExpanded ? "Hide tracking" : "Track order"}
              </button>
            </div>

            {isExpanded ? (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">Shipping route</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Mira Road hub to {order.delivery_zone ?? shippingQuote.zoneLabel}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{order.delivery_distance_km ?? shippingQuote.distanceKm} km</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <PackageCheck className="h-4 w-4" />
                      <span className="text-sm font-medium">Estimated arrival</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold">{shippingQuote.etaLabel}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Updated based on your delivery location.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Delivery address</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{order.shipping_address || "Address not captured"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {trackingSteps.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                            step.done ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < trackingSteps.length - 1 ? (
                          <div className={`mt-2 h-12 w-px ${step.done ? "bg-primary/40" : "bg-white/10"}`} />
                        ) : null}
                      </div>
                      <div className="pb-4">
                        <p className={`font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{formatDate(step.at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
