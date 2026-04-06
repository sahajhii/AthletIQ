import { AlertCircle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { env } from "@/config/env";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = "cloudflare-turnstile-script";

function loadTurnstileScript() {
  const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Cloudflare Turnstile."));
    document.body.appendChild(script);
  });
}

export function CaptchaField({
  onValidated,
}: {
  onValidated: (token: string, isValid: boolean) => void;
}) {
  const widgetIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const containerId = useId().replace(/:/g, "");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    mountedRef.current = true;

    if (!env.turnstileSiteKey) {
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

    loadTurnstileScript()
      .then(() => {
        if (!window.turnstile || !mountedRef.current || widgetIdRef.current !== null) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerId, {
          sitekey: env.turnstileSiteKey,
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

        if (widgetIdRef.current) {
          setStatus("ready");
        }
      })
      .catch(() => {
        setStatus("error");
        onValidated("", false);
      });

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timeoutId);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [containerId, onValidated]);

  if (!env.turnstileSiteKey) {
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
          Add `VITE_TURNSTILE_SITE_KEY` to enable Cloudflare Turnstile for signup.
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
      <div id={containerId} className="min-h-[70px]" />
      {status === "loading" ? (
        <p className="mt-3 text-xs text-muted-foreground">Loading verification...</p>
      ) : null}
      {status === "error" ? (
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-primary" />
          <span>Verification failed to load. Disable blockers, confirm the site key hostname, and refresh the page.</span>
        </div>
      ) : null}
    </div>
  );
}
