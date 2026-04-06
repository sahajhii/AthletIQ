import type { ReactNode } from "react";
import { Card } from "@/components/shared/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
