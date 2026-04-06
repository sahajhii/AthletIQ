import { Link } from "react-router-dom";
import { FeatureGrid } from "@/components/home/feature-grid";
import { HeroSection } from "@/components/home/hero-section";
import { BundleCard } from "@/components/shop/bundle-card";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/shared/button";
import { Badge } from "@/components/shared/badge";
import { bundles } from "@/data/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { getRecommendedProducts } from "@/lib/personalization";
import { useProducts } from "@/hooks/use-shop";

export function HomePage() {
  const { profile } = useAuth();
  const { products = [] } = useProducts();
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const recommendedProducts = getRecommendedProducts(profile);

  return (
    <>
      <HeroSection />
      <FeatureGrid />

      <section className="section-shell py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge>Featured shop</Badge>
            <h2 className="mt-4 text-3xl font-bold">Top-performing essentials</h2>
          </div>
          <Button asChild variant="secondary">
            <Link to="/shop">View all products</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="mb-8">
          <Badge>Recommended for you</Badge>
          <h2 className="mt-4 text-3xl font-bold">Personalized by goal and activity</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge>Bundles</Badge>
            <h2 className="mt-4 text-3xl font-bold">Shop by outcome, not guesswork</h2>
          </div>
          <Button asChild variant="secondary">
            <Link to="/bundles">See all bundles</Link>
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {bundles.slice(0, 3).map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </section>
    </>
  );
}
