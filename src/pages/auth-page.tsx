import { useState } from "react";
import { AuthForm } from "@/components/account/auth-form";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <section className="section-shell py-16">
      <div className="mb-8 text-center">
        <Badge>Authentication</Badge>
        <h1 className="mt-4 text-4xl font-bold">Secure access to your performance account</h1>
      </div>
      <div className="mb-6 flex justify-center gap-3">
        <Button variant={mode === "signin" ? "default" : "secondary"} onClick={() => setMode("signin")}>
          Sign in
        </Button>
        <Button variant={mode === "signup" ? "default" : "secondary"} onClick={() => setMode("signup")}>
          Sign up
        </Button>
      </div>
      <AuthForm mode={mode} />
    </section>
  );
}
