import { env } from "@/config/env";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadScript(src: string) {
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(args: {
  amount: number;
  email?: string;
  name?: string;
  onSuccess: (paymentId: string) => Promise<void> | void;
}) {
  const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
  if (!loaded || !window.Razorpay || !env.razorpayKeyId) {
    throw new Error("Razorpay is not configured.");
  }

  const razorpay = new window.Razorpay({
    key: env.razorpayKeyId,
    amount: Math.round(args.amount * 100),
    currency: "INR",
    name: "AthletIQ",
    description: "AthletIQ checkout",
    prefill: {
      email: args.email,
      name: args.name,
    },
    theme: {
      color: "#00e676",
    },
    handler: async (response: { razorpay_payment_id: string }) => {
      await args.onSuccess(response.razorpay_payment_id);
    },
  });

  razorpay.open();
}
