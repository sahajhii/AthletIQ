import { Chrome } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/integrations/supabase/mutations";
import { Button } from "@/components/shared/button";
import { CaptchaField } from "@/components/shared/captcha-field";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { PasswordInput } from "@/components/shared/password-input";

interface AuthFormValues {
  email: string;
  password: string;
  displayName: string;
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { register, handleSubmit, formState } = useForm<AuthFormValues>();
  const navigate = useNavigate();
  const location = useLocation();
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaValid, setCaptchaValid] = useState(mode === "signin");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleCaptcha = useCallback((token: string, isValid: boolean) => {
    setCaptchaToken(token);
    setCaptchaValid(isValid);
  }, []);

  useEffect(() => {
    setCaptchaToken("");
    setCaptchaValid(mode === "signin");
    setAcceptedTerms(false);
  }, [mode]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === "signin") {
        const { error } = await signInWithEmail(values.email, values.password);
        if (error) throw error;
        toast.success("Signed in successfully.");
        navigate("/account");
      } else {
        const { error } = await signUpWithEmail(values.email, values.password, values.displayName, captchaToken, acceptedTerms);
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        navigate("/auth");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  });

  async function handleGoogleSignIn() {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in with Google.");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <h2 className="text-3xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Access orders, rewards, subscriptions, and personalized recommendations."
          : "Start shopping with bundles, rewards, and secure checkout."}
      </p>
      {mode === "signin" ? (
        <>
          <Button type="button" variant="secondary" className="mt-8 w-full" onClick={() => void handleGoogleSignIn()}>
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>Or sign in with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        {mode === "signup" ? <Input placeholder="Display name" {...register("displayName", { required: true })} /> : null}
        <Input type="email" placeholder="Email" {...register("email", { required: true })} />
        <PasswordInput placeholder="Password" {...register("password", { required: true, minLength: 6 })} />
        {mode === "signup" ? (
          <>
            <CaptchaField onValidated={handleCaptcha} />
            <label
              className="flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 text-sm text-muted-foreground"
              style={{
                borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
                backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha-soft))",
              }}
            >
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
              <span>
                I accept the{" "}
                <Link
                  to="/terms"
                  state={{ from: location.pathname }}
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Terms & Conditions
                </Link>{" "}
                and consent to AthletIQ processing my account data.
              </span>
            </label>
          </>
        ) : null}
        <Button type="submit" className="w-full" disabled={formState.isSubmitting || (mode === "signup" && (!captchaValid || !acceptedTerms))}>
          {formState.isSubmitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
