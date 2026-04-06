import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { Button } from "@/components/shared/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/layout/logo";

export function Navbar() {
  const { profile, isAuthenticated } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.open);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="section-shell flex h-20 items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {siteConfig.nav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `text-sm ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button onClick={openCart} className="text-sm text-muted-foreground hover:text-foreground">
            Cart
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/wishlist" className="relative hidden rounded-full border border-white/10 p-3 text-muted-foreground hover:text-foreground sm:flex">
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-black">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <Button variant="secondary" size="icon" onClick={openCart}>
            <ShoppingBag className="h-4 w-4" />
            {cartItems.length > 0 ? (
              <span className="absolute ml-5 mt-[-20px] flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-black">
                {cartItems.length}
              </span>
            ) : null}
          </Button>
          <Link
            to="/account"
            className="hidden items-center gap-3 rounded-full border border-white/10 px-4 py-3 text-muted-foreground hover:text-foreground sm:flex"
          >
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate text-sm text-foreground">
              {isAuthenticated ? profile?.display_name || "My Account" : "Account"}
            </span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="section-shell pb-5 lg:hidden">
          <div className="glass-panel rounded-[1.5rem] p-4">
            <div className="flex flex-col gap-3">
              {siteConfig.nav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                Wishlist
              </NavLink>
              <NavLink
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                {isAuthenticated ? profile?.display_name || "Account" : "Account"}
              </NavLink>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
