import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/shared/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const wishlist = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const wished = wishlist.includes(product.id);

  return (
    <Card className="group overflow-hidden p-0">
      <div className="relative">
        <motion.img
          whileHover={{ scale: 1.04 }}
          src={product.image_url}
          alt={product.name}
          className="h-64 w-full object-cover transition duration-500"
        />
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge>{product.category?.name ?? "Fitness"}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {product.rating.toFixed(1)}
          </div>
        </div>
        <div>
          <Link to={`/shop/${product.slug}`} className="text-xl font-semibold hover:text-primary">
            {product.name}
          </Link>
          <p className="mt-2 min-h-10 text-sm text-muted-foreground">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
            {product.compare_at_price ? (
              <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.compare_at_price)}</p>
            ) : null}
          </div>
          <Button onClick={() => addItem(product)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
