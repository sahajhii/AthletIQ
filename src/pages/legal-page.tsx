import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";

export function LegalPage({
  title,
  description,
}: {
  title: string;
  description: string[];
}) {
  return (
    <section className="section-shell py-16">
      <Badge>Legal</Badge>
      <h1 className="mt-4 text-4xl font-bold">{title}</h1>
      <Card className="mt-10 max-w-4xl">
        <div className="space-y-5">
          {description.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="leading-8 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>
    </section>
  );
}
