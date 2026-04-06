import { BrainCircuit, Gift, ShieldCheck, Truck } from "lucide-react";
import { Card } from "@/components/shared/card";

const features = [
  {
    icon: BrainCircuit,
    title: "Rule-based personalization",
    description: "Goal + activity-based recommendations that update your shop experience.",
  },
  {
    icon: Gift,
    title: "Loyalty rewards",
    description: "Earn points on every purchase and redeem them during checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Supabase checkout",
    description: "Protected flows for orders, profiles, subscriptions, and account access.",
  },
  {
    icon: Truck,
    title: "Subscription management",
    description: "Pause, reactivate, and track recurring wellness or protein essentials.",
  },
];

export function FeatureGrid() {
  return (
    <section className="section-shell py-16">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title}>
            <feature.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
