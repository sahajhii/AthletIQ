import { Link } from "react-router-dom";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/shared/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useProducts } from "@/hooks/use-shop";
import { useWishlistStore } from "@/stores/wishlist-store";

export function WishlistPage() {
  const wishlist = useWishlistStore((state) => state.items);
  const { products = [] } = useProducts();
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  return (
    <section className="section-shell py-16">
      <h1 className="text-4xl font-bold">Wishlist</h1>
      <p className="mt-3 text-muted-foreground">Saved items stay synced in local storage for fast access.</p>

      {wishlistProducts.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your wishlist is empty"
            description="Save products to compare stacks, gear, and wellness picks later."
            action={
              <Button asChild>
                <Link to="/shop">Browse shop</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
