import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t, lang } = useI18n();
  return (
    <footer id="contact" className="mt-32 border-t border-border/60 bg-sand/40">
      <div className="container-page py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <div className="font-display text-2xl">{t("brand")}</div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {lang === "fa"
              ? "بنی‌پت، پت‌شاپی تخصصی برای دوستداران سگ و گربه. غذاهای اصل، مشاوره‌ی دلسوزانه، ارسال سریع."
              : "Beni Pett — a specialty pet shop for dog and cat lovers. Authentic food, caring advice, fast delivery."}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            {lang === "fa" ? "دسترسی سریع" : "Quick links"}
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-espresso">{t("nav_home")}</a></li>
            <li><a href="/shop" className="hover:text-espresso">{t("nav_shop")}</a></li>
            <li><a href="#about" className="hover:text-espresso">{t("nav_about")}</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            {lang === "fa" ? "تماس" : "Contact"}
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>hello@benipett.com</li>
            <li dir="ltr">+98 21 000 0000</li>
            <li>{lang === "fa" ? "تهران، ایران" : "Tehran, Iran"}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-page py-6 text-xs text-muted-foreground flex flex-wrap gap-2 justify-between">
          <span>© {new Date().getFullYear()} Beni Pett. {t("footer_rights")}</span>
          <span dir="ltr">Made with care for good pets</span>
        </div>
      </div>
    </footer>
  );
}