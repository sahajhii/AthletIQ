import { AlertCircle } from "lucide-react";
import { useEffect, useId, useRef } from "react";
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

  useEffect(() => {
    mountedRef.current = true;

    if (!env.recaptchaSiteKey) {
      onValidated("", false);
      return () => {
        mountedRef.current = false;
      };
    }

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
            callback: (token) => onValidated(token, Boolean(token)),
            "expired-callback": () => onValidated("", false),
            "error-callback": () => onValidated("", false),
          });
        });
      })
      .catch(() => {
        onValidated("", false);
      });

    return () => {
      mountedRef.current = false;
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
      <div id={containerId} />
    </div>
  );
}
