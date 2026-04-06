import { AlertCircle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { env } from "@/config/env";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: string | HTMLElement,
        parameters: {
          sitekey: string;
          theme?: "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => number;
      reset: (widgetId?: number) => void;
      ready: (callback: () => void) => void;
    };
  }
}

const SCRIPT_ID = "google-recaptcha-script";

function loadRecaptchaScript() {
  const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Google reCAPTCHA."));
    document.body.appendChild(script);
  });
}

export function CaptchaField({
  onValidated,
}: {
  onValidated: (token: string, isValid: boolean) => void;
}) {
  const widgetIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const containerId = useId().replace(/:/g, "");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    mountedRef.current = true;

    if (!env.recaptchaSiteKey) {
      onValidated("", false);
      setStatus("error");
      return () => {
        mountedRef.current = false;
      };
    }

    setStatus("loading");
    const timeoutId = window.setTimeout(() => {
      if (mountedRef.current && widgetIdRef.current === null) {
        setStatus("error");
      }
    }, 5000);

    loadRecaptchaScript()
      .then(() => {
        if (!window.grecaptcha || !mountedRef.current || widgetIdRef.current !== null) {
          return;
        }

        window.grecaptcha.ready(() => {
          if (!mountedRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
            return;
          }

          widgetIdRef.current = window.grecaptcha.render(containerId, {
            sitekey: env.recaptchaSiteKey,
            theme: document.documentElement.classList.contains("light") ? "light" : "dark",
            callback: (token) => {
              setStatus("ready");
              onValidated(token, Boolean(token));
            },
            "expired-callback": () => {
              setStatus("ready");
              onValidated("", false);
            },
            "error-callback": () => {
              setStatus("error");
              onValidated("", false);
            },
          });

          if (widgetIdRef.current !== null) {
            setStatus("ready");
          }
        });
      })
      .catch(() => {
        setStatus("error");
        onValidated("", false);
      });

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timeoutId);
      if (widgetIdRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [containerId, onValidated]);

  if (!env.recaptchaSiteKey) {
    return (
      <div
        className="flex items-start gap-3 rounded-[1.25rem] border p-4 text-sm"
        style={{
          borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
          backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha-soft))",
        }}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 text-primary" />
        <div className="text-muted-foreground">
          Add `VITE_RECAPTCHA_SITE_KEY` to enable Google reCAPTCHA for signup.
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[1.25rem] border p-4"
      style={{
        borderColor: "rgba(var(--surface-tint), var(--surface-border-alpha))",
        backgroundColor: "rgba(var(--surface-tint), var(--surface-alpha-soft))",
      }}
    >
      <div id={containerId} className="min-h-[78px]" />
      {status === "loading" ? <p className="mt-3 text-xs text-muted-foreground">Loading verification...</p> : null}
      {status === "error" ? (
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-primary" />
          <span>Verification failed to load. Check the site key type, hostname, and blockers, then refresh.</span>
        </div>
      ) : null}
    </div>
  );
}
