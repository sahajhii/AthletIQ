import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBundles, getCategories, getProductBySlug, getProducts } from "@/integrations/supabase/queries";
import type { ProductFilters } from "@/types";

export function useProducts(filters?: ProductFilters) {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const products = useMemo(() => {
    if (!filters) return query.data ?? [];
    return (query.data ?? []).filter((product) => {
      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = !filters.category || product.category?.slug === filters.category;
      const matchesGoal = !filters.goal || product.goal_tags.includes(filters.goal as never);
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      return matchesSearch && matchesCategory && matchesGoal && matchesPrice;
    });
  }, [filters, query.data]);

  return { ...query, products };
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function useBundles() {
  return useQuery({
    queryKey: ["bundles"],
    queryFn: getBundles,
  });
}
