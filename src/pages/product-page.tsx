import { Heart, ShoppingBag, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { useProduct, useProducts } from "@/hooks/use-shop";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export function ProductPage() {
  const params = useParams();
  const { data: product } = useProduct(params.slug ?? "");
  const addItem = useCartStore((state) => state.addItem);
  const wishlist = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const { products = [] } = useProducts();

  if (!product) {
    return <section className="section-shell py-20 text-muted-foreground">Product not found.</section>;
  }

  const related = products
    .filter((item) => item.id !== product.id && item.goal_tags.some((goal) => product.goal_tags.includes(goal)))
    .slice(0, 4);

  return (
    <section className="section-shell py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr,0.9fr]">
        <img src={product.image_url} alt={product.name} className="h-[520px] w-full rounded-[2rem] object-cover" />
        <div>
          <Badge>{product.category?.name ?? "Fitness"}</Badge>
          <h1 className="mt-4 text-4xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {product.rating.toFixed(1)} rating
          </div>
          <p className="mt-6 text-lg text-muted-foreground">{product.description}</p>
          <div className="mt-8 flex items-center gap-4">
            <p className="text-3xl font-semibold">{formatCurrency(product.price)}</p>
            {product.compare_at_price ? (
              <p className="text-muted-foreground line-through">{formatCurrency(product.compare_at_price)}</p>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" onClick={() => addItem(product)}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to cart
            </Button>
            <Button variant="secondary" size="lg" onClick={() => toggleWishlist(product.id)}>
              <Heart className={`mr-2 h-4 w-4 ${wishlist.includes(product.id) ? "fill-primary text-primary" : ""}`} />
              Wishlist
            </Button>
          </div>
          <Card className="mt-8">
            <h3 className="text-xl font-semibold">Goal match</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.goal_tags.map((goal) => (
                <Badge key={goal}>{goal.replace("-", " ")}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold">You may also like</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
