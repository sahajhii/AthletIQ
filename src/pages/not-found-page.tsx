import { Link } from "react-router-dom";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";

export function NotFoundPage() {
  return (
    <section className="section-shell py-24">
      <Card className="mx-auto max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-muted-foreground">The page you requested does not exist or has moved.</p>
        <Button asChild className="mt-8">
          <Link to="/">Back to home</Link>
        </Button>
      </Card>
    </section>
  );
}
