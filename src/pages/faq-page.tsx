import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";

const faqItems = [
  [
    "How does AthletIQ choose recommended products and bundles?",
    "AthletIQ uses your bundle form inputs, browsing context, and catalog metadata to surface relevant products and bundle ideas. Recommendations are designed to be helpful guidance, not medical or coaching prescriptions.",
  ],
  [
    "How do subscriptions work?",
    "Subscriptions are added to your cart first. Once you complete payment successfully, the subscription is activated and appears inside your account under the subscriptions section, where you can monitor status and manage it.",
  ],
  [
    "Can I pause or cancel a subscription later?",
    "Yes. Active subscriptions can be paused, reactivated, or cancelled from your account, subject to billing timing and any already-processed renewal orders.",
  ],
  [
    "When do loyalty points appear?",
    "Loyalty points are awarded after successful paid orders. They can then be redeemed during checkout according to the reward rules currently configured in the app.",
  ],
  [
    "When does the reward tracker unlock?",
    "The reward tracker becomes available after you have at least one completed order. Once unlocked, you can log product usage daily and work toward streak rewards.",
  ],
  [
    "Do subscriptions and one-time products check out together?",
    "Yes. Subscription items can sit in the same cart as regular products. After payment, one-time items are stored as an order and subscription items are activated in your account.",
  ],
  [
    "What payment method is used in checkout?",
    "The app currently uses Razorpay for checkout. Taxes, platform fees, delivery charges, and any eligible discounts are shown before you complete payment.",
  ],
  [
    "Why might a product or subscription not appear from the database?",
    "If your Supabase tables are still empty, the app can fall back to local mock catalog data for browsing. That helps the storefront work during setup, but you should seed the database for full production behavior.",
  ],
  [
    "Can I edit my profile after signing up?",
    "Yes. Your profile is editable from the account page, and changes like display name updates should reflect in the navbar after saving.",
  ],
  [
    "Does the chatbot replace professional advice?",
    "No. The chatbot is meant for general education and product guidance. For injuries, medical conditions, medications, or therapeutic advice, consult a qualified professional.",
  ],
];

export function FaqPage() {
  return (
    <section className="section-shell py-16">
      <Badge>FAQ</Badge>
      <h1 className="mt-4 text-4xl font-bold">Frequently asked questions</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Answers about shopping, subscriptions, checkout, rewards, bundles, and account management across AthletIQ.
      </p>
      <div className="mt-10 grid gap-4">
        {faqItems.map(([title, content]) => (
          <Card key={title}>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{content}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
