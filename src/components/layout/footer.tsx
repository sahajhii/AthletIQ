import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";

const legalLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Medical Disclaimer", href: "/medical-disclaimer" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="section-shell grid gap-10 md:grid-cols-[1.6fr,1fr,1fr]">
        <div>
          <h3 className="text-xl font-semibold">{siteConfig.name}</h3>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Explore</h4>
          <div className="mt-4 grid gap-2">
            {siteConfig.nav.map((link) => (
              <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Legal</h4>
          <div className="mt-4 grid gap-2">
            {legalLinks.map((link) => (
              <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
