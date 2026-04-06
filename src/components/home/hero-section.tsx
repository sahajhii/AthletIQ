import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/shared/button";
import { Badge } from "@/components/shared/badge";

export function HeroSection() {
  return (
    <section className="section-shell py-14 md:py-20">
      <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-hero-grid bg-hero-grid bg-top px-6 py-16 shadow-glow md:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div>
            <Badge className="mb-6">
              <Sparkles className="mr-2 h-3 w-3" />
              Performance commerce
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Gear, supplements, and subscriptions tuned to your goals.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">{siteConfig.description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/shop">
                  Shop now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/bundles">Explore bundles</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["50+", "Performance products"],
              ["5", "Goal-based bundles"],
              ["24/7", "Subscription control"],
              ["1 click", "Bundle to cart"],
            ].map(([value, label]) => (
              <div key={label} className="glass-panel rounded-[1.5rem] p-6">
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
