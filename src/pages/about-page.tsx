import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";

export function AboutPage() {
  return (
    <section className="section-shell py-16">
      <Badge>About</Badge>
      <h1 className="mt-4 text-4xl font-bold">Built for guided fitness commerce in India</h1>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-xl font-semibold">Mission</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            AthletIQ helps people buy smarter training products with guidance rooted in goals, consistency, and sustainable progress.
          </p>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold">Vision</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            We envision a fitness retail experience where every user gets personalized stacks, trusted education, and meaningful long-term engagement.
          </p>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold">Working Model</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            AthletIQ combines curated catalog management, subscriptions, AI guidance, loyalty rewards, and seamless checkout into one modular platform.
          </p>
        </Card>
      </div>
    </section>
  );
}
