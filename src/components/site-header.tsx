import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useAuth, useIsAdmin } from "@/lib/auth-hooks";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, User as UserIcon } from "lucide-react";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { count, open } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="container-page flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-10 w-10 rounded-full bg-espresso text-cream text-lg font-display">B</span>
          <div className="leading-tight">
            <div className="font-display text-xl">{t("brand")}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground hidden sm:block">{t("tagline")}</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>{t("nav_home")}</Link>
          <Link to="/shop" className="text-foreground/80 hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>{t("nav_shop")}</Link>
          <Link to="/offers" className="text-foreground/80 hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>{t("nav_offers")}</Link>
          <Link to="/reviews" className="text-foreground/80 hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>{lang === "fa" ? "نظرات" : "Reviews"}</Link>
          <a href="#about" className="text-foreground/80 hover:text-foreground transition">{t("nav_about")}</a>
          <Link to="/contact" className="text-foreground/80 hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>{t("nav_contact")}</Link>
          {isAdmin && (
            <Link to="/admin" className="text-clay hover:text-espresso transition font-medium">{t("nav_admin")}</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center rounded-full border border-border p-1 text-xs">
            <button
              onClick={() => setLang("fa")}
              className={`px-3 py-1 rounded-full transition ${lang === "fa" ? "bg-espresso text-cream" : "text-foreground/70"}`}
            >FA</button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full transition ${lang === "en" ? "bg-espresso text-cream" : "text-foreground/70"}`}
            >EN</button>
          </div>
          <button
            onClick={open}
            aria-label={t("cart_title")}
            className="relative grid place-items-center h-10 w-10 rounded-full border border-border hover:bg-sand transition"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -end-1 bg-espresso text-cream text-[10px] rounded-full min-w-5 h-5 px-1 grid place-items-center">
                {count}
              </span>
            )}
          </button>
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-foreground/70 hover:text-foreground hidden sm:inline"
            >{t("nav_logout")}</button>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground">
              <UserIcon className="h-4 w-4" /> {t("nav_login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}