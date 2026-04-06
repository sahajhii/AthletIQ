import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { AccountPage } from "@/pages/account-page";
import { AboutPage } from "@/pages/about-page";
import { AuthPage } from "@/pages/auth-page";
import { BundlesPage } from "@/pages/bundles-page";
import { ContactPage } from "@/pages/contact-page";
import { FaqPage } from "@/pages/faq-page";
import { HomePage } from "@/pages/home-page";
import { LegalPage } from "@/pages/legal-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProductPage } from "@/pages/product-page";
import { RewardsPage } from "@/pages/rewards-page";
import { ShopPage } from "@/pages/shop-page";
import { SubscriptionsPage } from "@/pages/subscriptions-page";
import { WishlistPage } from "@/pages/wishlist-page";
import { ProtectedRoute } from "@/routes/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "shop/:slug", element: <ProductPage /> },
      { path: "bundles", element: <BundlesPage /> },
      { path: "subscriptions", element: <SubscriptionsPage /> },
      { path: "rewards", element: <RewardsPage /> },
      { path: "wishlist", element: <WishlistPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "faq", element: <FaqPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "account", element: <AccountPage /> }],
      },
      {
        path: "terms",
        element: <LegalPage title="Terms & Conditions" description={[
          "By accessing AthletIQ, you agree to use the platform lawfully, maintain accurate account information, and take responsibility for activity performed under your login credentials.",
          "Orders, subscriptions, loyalty rewards, coupon redemption, and digital experiences are subject to availability, pricing accuracy, fraud checks, and operational review before fulfillment.",
          "Users must ensure that payment information, shipping details, and profile data submitted through the platform are accurate, complete, and kept current for fulfillment and support purposes.",
          "Product images, descriptions, pricing, and health-oriented guidance are provided for convenience and may be revised as catalog availability, formulation details, or compliance requirements change.",
          "Use of AthletIQ does not create a coaching, medical, or therapeutic relationship, and any educational content presented through the site should be interpreted as general guidance only.",
          "Promotional pricing, coupon campaigns, loyalty points, bundle offers, and subscription savings may carry separate eligibility rules, redemption limits, expiry conditions, and anti-abuse restrictions.",
          "AthletIQ may suspend, reject, or reverse transactions where misuse, chargeback risk, policy evasion, duplicate accounts, or suspicious automation is detected.",
          "Users are responsible for reviewing ingredient details, sizing information, training suitability, and shipping limitations before placing an order.",
          "Any dispute arising from use of the platform will be handled under applicable law and subject to the platform's internal support and escalation procedures before formal proceedings are pursued.",
          "AthletIQ reserves the right to suspend accounts, cancel suspicious orders, modify promotions, and update platform terms where necessary to protect users, partners, and the integrity of the service."
        ]} />,
      },
      {
        path: "privacy",
        element: <LegalPage title="Privacy Policy" description={[
          "AthletIQ collects account details, order records, subscription preferences, usage logs, and support interactions to operate the storefront, improve personalization, and maintain secure commerce workflows.",
          "We use Supabase and approved service providers to process authentication, data storage, notifications, analytics, and payment-related events in accordance with applicable privacy and security standards.",
          "Personalization features may use declared goals, experience level, body metrics, and prior interactions to generate product or bundle suggestions designed to improve relevance and shopping clarity.",
          "Sensitive data is handled on a need-to-know basis with access controls, but no online service can guarantee absolute security against all technical or operational risks.",
          "We may retain transaction records, customer support exchanges, subscription history, and anti-fraud metadata for audit, tax, chargeback, and compliance purposes even after account closure where legally required.",
          "AthletIQ may use de-identified or aggregated behavioral data to improve product discovery, inventory planning, pricing analysis, customer support efficiency, and recommendation quality.",
          "Third-party processors involved in payments, hosting, analytics, messaging, and fraud prevention may process limited data strictly in connection with their assigned operational role.",
          "Users are responsible for maintaining the confidentiality of account credentials and should notify AthletIQ immediately if they suspect unauthorized access or account compromise.",
          "Where local law grants additional privacy rights, AthletIQ will review and respond to valid requests within a commercially reasonable period, subject to identity verification.",
          "Users may request access, correction, or deletion of eligible personal information, subject to legal retention obligations, fraud-prevention requirements, and legitimate business needs."
        ]} />,
      },
      {
        path: "refund-policy",
        element: <LegalPage title="Refund Policy" description={[
          "Refund requests must be submitted within the stated return window and may require proof of purchase, product photos, and confirmation that sealed items remain unused where applicable.",
          "Opened nutrition products, hygiene-sensitive wellness items, and personalized or promotional bundles may be ineligible for return unless damaged, defective, or delivered incorrectly.",
          "Where a package arrives damaged, incomplete, or materially different from the order confirmation, customers should contact support promptly with clear evidence so resolution can begin without delay.",
          "Replacement, store credit, or refund outcomes may depend on product category, warehouse verification, and courier claim timelines.",
          "Return shipping instructions, pickup coordination, and packaging requirements may vary based on the original fulfillment method, warehouse region, and item classification.",
          "If a refund request is approved for a subscription order, only eligible billed amounts may be reversed; future renewals can still require separate cancellation confirmation where applicable.",
          "Refund processing times depend on banking systems, payment gateways, and card issuer timelines, and AthletIQ cannot accelerate settlement once a reversal is released to the payment processor.",
          "Orders refused at delivery, returned due to incorrect customer details, or cancelled after dispatch may incur handling, restocking, or logistics charges where permitted by law.",
          "Approved refunds are processed back to the original payment method after inspection and may exclude non-refundable convenience charges where legally permitted."
        ]} />,
      },
      {
        path: "shipping-policy",
        element: <LegalPage title="Shipping Policy" description={[
          "Orders are typically processed within one to three business days, subject to payment confirmation, inventory checks, regional restrictions, and public holiday schedules.",
          "Estimated delivery timelines vary by destination, shipping partner coverage, weather conditions, and service disruptions outside AthletIQ's direct control.",
          "Bulk equipment orders, remote pin codes, and subscription deliveries may be subject to separate handling timelines, packaging rules, or fulfillment partners.",
          "Shipping charges, platform fees, and promotional delivery waivers are shown at checkout before payment confirmation.",
          "Customers are responsible for providing a deliverable address, reachable contact number, and any access details needed for successful handoff by the courier.",
          "If a shipment is delayed due to customs, severe weather, labor disruptions, address disputes, regional restrictions, or customer unavailability, delivery timelines may extend without creating automatic refund eligibility.",
          "Subscription shipments may be scheduled on rolling cycles and can be adjusted, paused, or resumed based on the user's active subscription settings and successful payment status.",
          "AthletIQ may split orders into multiple consignments when products ship from different inventory pools, warehouses, or partner facilities.",
          "Customers receive shipment updates when available and should report lost, delayed, or damaged packages promptly so our support team can investigate and assist."
        ]} />,
      },
      {
        path: "cookie-policy",
        element: <LegalPage title="Cookie Policy" description={[
          "AthletIQ uses essential cookies and local storage to maintain sign-in state, preserve cart and wishlist activity, remember interface preferences, and protect account sessions.",
          "Performance and analytics technologies may be used to understand site behavior, improve recommendation quality, measure conversion paths, and optimize product discovery.",
          "Functional cookies may also support chatbot continuity, theme preferences, subscription flow stability, and secure checkout interactions across browser sessions.",
          "Third-party scripts related to payments, analytics, or embedded tools may set their own technical identifiers in accordance with their policies and applicable regulations.",
          "Some browser storage mechanisms are also used to preserve local fallback data such as carts, wishlists, or subscriptions when remote systems are temporarily unavailable.",
          "Disabling storage or blocking embedded payment and analytics scripts may reduce site functionality, disrupt sign-in persistence, or prevent checkout flows from completing as intended.",
          "AthletIQ may update its use of cookies and related technologies as new features are introduced, vendors change, or compliance obligations evolve.",
          "Continued use of the website after such updates may constitute acceptance of the revised cookie practices to the extent permitted by applicable law.",
          "Users can manage browser-level cookie preferences, but disabling certain technologies may limit personalization, authentication continuity, or checkout reliability."
        ]} />,
      },
      {
        path: "medical-disclaimer",
        element: <LegalPage title="Medical Disclaimer" description={[
          "Content on AthletIQ is provided for general informational purposes only and does not constitute medical, nutritional, or therapeutic advice.",
          "Supplements, wellness products, and training accessories sold through the platform are not intended to diagnose, treat, cure, or prevent disease unless explicitly stated by the manufacturer under applicable law.",
          "Customers should consult a qualified healthcare professional before starting supplements, changing routines, or using any product while pregnant, nursing, medicated, or managing a medical condition."
        ]} />,
      },
      {
        path: "refund",
        element: <LegalPage title="Refund Policy" description={[
          "Refund requests must be submitted within the stated return window and may require proof of purchase, product photos, and confirmation that sealed items remain unused where applicable.",
          "Opened nutrition products, hygiene-sensitive wellness items, and personalized or promotional bundles may be ineligible for return unless damaged, defective, or delivered incorrectly.",
          "Where a package arrives damaged, incomplete, or materially different from the order confirmation, customers should contact support promptly with clear evidence so resolution can begin without delay.",
          "Replacement, store credit, or refund outcomes may depend on product category, warehouse verification, and courier claim timelines.",
          "Approved refunds are processed back to the original payment method after inspection and may exclude non-refundable convenience charges where legally permitted."
        ]} />,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
