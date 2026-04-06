import { Sparkles } from "lucide-react";
import { useState } from "react";
import { BundleCard } from "@/components/shop/bundle-card";
import { BundlePersonalizer } from "@/components/shop/bundle-personalizer";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { useBundles } from "@/hooks/use-shop";

export function BundlesPage() {
  const { data: bundles = [] } = useBundles();
  const [showPersonalizer, setShowPersonalizer] = useState(false);

  return (
    <section className="section-shell py-16">
      <Badge>Bundles</Badge>
      <h1 className="mt-4 text-4xl font-bold">Goal-based performance systems</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Weight loss, muscle gain, home workout, beginner, and advanced stacks in one tap.
      </p>
      <div className="mt-8">
        <Button variant={showPersonalizer ? "secondary" : "default"} onClick={() => setShowPersonalizer((value) => !value)}>
          <Sparkles className="mr-2 h-4 w-4" />
          {showPersonalizer ? "Hide personalized bundle form" : "Get personalized bundles"}
        </Button>
      </div>
      {showPersonalizer ? (
        <div className="mt-10">
          <BundlePersonalizer />
        </div>
      ) : null}
      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </section>
  );
}
