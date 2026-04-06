import { useMemo } from "react";
import { useAdminOrders, useAdminUsers, useUpsertProduct } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-shop";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

export function AdminDashboard() {
  const { data: orders = [] } = useAdminOrders();
  const { data: users = [] } = useAdminUsers();
  const { products = [] } = useProducts();
  const upsertProduct = useUpsertProduct();

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Revenue</p>
          <h3 className="mt-3 text-3xl font-bold">{formatCurrency(revenue)}</h3>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Orders</p>
          <h3 className="mt-3 text-3xl font-bold">{orders.length}</h3>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Users</p>
          <h3 className="mt-3 text-3xl font-bold">{users.length}</h3>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold">Orders</h3>
          </div>
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <EmptyState title="No orders yet" description="Incoming customer orders will appear here." />
            ) : (
              orders.slice(0, 6).map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-primary">#{order.id.slice(0, 8)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{order.items?.length ?? 0} items</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold">Products</h3>
            <Button
              variant="secondary"
              onClick={() =>
                upsertProduct.mutate({
                  name: "New Admin Product",
                  slug: `new-admin-product-${Date.now()}`,
                  description: "Created from admin dashboard",
                  image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
                  price: 49,
                  category_id: "cat-supplements",
                  goal_tags: ["beginner"],
                  stock: 20,
                  rating: 4.5,
                  featured: false,
                })
              }
            >
              Add sample
            </Button>
          </div>
          <div className="mt-6 space-y-3">
            {products.slice(0, 7).map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-4">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                </div>
                <p className="font-semibold">{formatCurrency(product.price)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-2xl font-semibold">Users</h3>
        <div className="mt-6 grid gap-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-4">
              <div>
                <p className="font-medium">{user.display_name ?? "Unnamed user"}</p>
                <p className="text-sm text-muted-foreground">{user.email ?? user.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm capitalize text-primary">{user.role}</p>
                <p className="text-sm text-muted-foreground">{user.loyalty_points} points</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
