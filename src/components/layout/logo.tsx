import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow">
        <Dumbbell className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-[0.2em] text-foreground">ATHLETIQ</span>
    </Link>
  );
}
