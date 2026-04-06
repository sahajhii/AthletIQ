import { useState } from "react";
import { FilterBar } from "@/components/shop/filter-bar";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/shared/badge";
import { useCategories, useProducts } from "@/hooks/use-shop";
import type { ProductFilters } from "@/types";

const initialFilters: ProductFilters = {
  search: "",
  category: "",
  goal: "",
  priceRange: [0, 20000],
};

export function ShopPage() {
  const [filters, setFilters] = useState(initialFilters);
  const { data: categories = [] } = useCategories();
  const { products } = useProducts(filters);

  return (
    <section className="section-shell py-16">
      <Badge>Shop</Badge>
      <h1 className="mt-4 text-4xl font-bold">Performance catalog</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Search and filter across supplements, equipment, accessories, and wellness.
      </p>

      <div className="mt-10">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          categories={categories.map((category) => ({ label: category.name, value: category.slug }))}
        />
      </div>

      <div className="catalog-grid mt-10 grid gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
