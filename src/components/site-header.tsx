import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
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
          <a href="#about" className="text-foreground/80 hover:text-foreground transition">{t("nav_about")}</a>
          <a href="#contact" className="text-foreground/80 hover:text-foreground transition">{t("nav_contact")}</a>
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
          <Link to="/shop" className="btn-primary text-sm hidden sm:inline-flex">{t("cta_shop")}</Link>
        </div>
      </div>
    </header>
  );
}