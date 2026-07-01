import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import heroPets from "@/assets/hero-pets.jpg";
import productDog from "@/assets/product-dog.jpg";
import productCat from "@/assets/product-cat.jpg";
import productTreats from "@/assets/product-treats.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();

  const products = [
    { img: productDog, name: lang === "fa" ? "غذای خشک سگ بالغ" : "Adult Dog Dry Food", price: "۸۹۰,۰۰۰", tag: lang === "fa" ? "سگ" : "Dog" },
    { img: productCat, name: lang === "fa" ? "غذای خشک گربه" : "Premium Cat Dry Food", price: "۶۵۰,۰۰۰", tag: lang === "fa" ? "گربه" : "Cat" },
    { img: productTreats, name: lang === "fa" ? "تشویقی مخصوص" : "Signature Treats", price: "۱۹۵,۰۰۰", tag: lang === "fa" ? "تشویقی" : "Treats" },
  ];

  const testimonials = lang === "fa"
    ? [
        { name: "نگار م.", text: "کیفیت غذاها واقعا فرق داره. گربه‌ام از وقتی از بنی‌پت می‌خرم شادتره." },
        { name: "امیر ک.", text: "مشاوره‌ی تیمشون عالی بود. برای سگ آلرژی‌داری من دقیقا چیزی که لازم داشت پیدا کردن." },
        { name: "سارا ح.", text: "بسته‌بندی تمیز، ارسال سریع، قیمت منصفانه. دیگه جای دیگه‌ای نمی‌خرم." },
      ]
    : [
        { name: "Negar M.", text: "The quality really is different. My cat is visibly happier since I switched to Beni Pett." },
        { name: "Amir K.", text: "Their advice was spot on — they found the exact food my allergic dog needed." },
        { name: "Sara H.", text: "Clean packaging, fast delivery, fair prices. I don't shop anywhere else now." },
      ];

  return (
    <main>
      {/* HERO */}
      <section className="container-page pt-10 md:pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-clay/40 bg-cream px-4 py-1.5 text-xs uppercase tracking-widest text-espresso/80">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              {t("hero_eyebrow")}
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] mt-6 text-espresso whitespace-pre-line">
              {t("hero_title")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              {t("hero_sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">{t("cta_shop")}</Link>
              <a href="#about" className="btn-ghost">{t("nav_about")}</a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "+۲۰", l: t("stat_1") },
                { n: "+۸", l: t("stat_2") },
                { n: "+۵K", l: t("stat_3") },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-display text-3xl text-espresso">{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-6 bg-clay/20 rounded-[2.5rem] -rotate-2" />
            <img
              src={heroPets}
              alt="Dog and cat"
              width={1536}
              height={1280}
              className="relative rounded-[2rem] object-cover w-full aspect-[4/5] shadow-[var(--shadow-soft)]"
            />
            <div className="absolute -bottom-6 start-6 bg-background rounded-2xl px-5 py-4 shadow-[var(--shadow-card)] border border-border/60">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  <div className="h-9 w-9 rounded-full bg-clay border-2 border-background" />
                  <div className="h-9 w-9 rounded-full bg-espresso border-2 border-background" />
                  <div className="h-9 w-9 rounded-full bg-sand border-2 border-background" />
                </div>
                <div>
                  <div className="text-sm font-medium text-espresso">★★★★★</div>
                  <div className="text-xs text-muted-foreground">{lang === "fa" ? "۴٫۹ از ۵٬۰۰۰+ نظر" : "4.9 from 5,000+ reviews"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT / FEATURES */}
      <section id="about" className="bg-sand/50 py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-clay">{t("about_eye")}</div>
            <h2 className="font-display text-4xl md:text-5xl mt-3 text-espresso">{t("about_title")}</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">{t("about_body")}</p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { t: t("feature_1_t"), d: t("feature_1_d") },
              { t: t("feature_2_t"), d: t("feature_2_d") },
              { t: t("feature_3_t"), d: t("feature_3_d") },
            ].map((f, i) => (
              <div key={i} className="bg-background rounded-3xl p-8 border border-border/60 hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 rounded-2xl bg-espresso text-cream grid place-items-center font-display text-xl">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-6 font-display text-xl text-espresso">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="container-page py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-clay">{t("products_eye")}</div>
            <h2 className="font-display text-4xl md:text-5xl mt-3 text-espresso">{t("products_title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("products_sub")}</p>
          </div>
          <Link to="/shop" className="btn-ghost text-sm">{t("view_all")} →</Link>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <Link to="/shop" key={i} className="group block">
              <div className="relative overflow-hidden rounded-3xl bg-sand aspect-square">
                <img src={p.img} alt={p.name} loading="lazy" width={1024} height={1024} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute top-4 start-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs text-espresso">{p.tag}</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <h3 className="font-display text-lg text-espresso">{p.name}</h3>
                <div className="text-espresso whitespace-nowrap">
                  <span className="font-medium">{p.price}</span>
                  <span className="text-xs text-muted-foreground ms-1">{t("price_currency")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-espresso text-cream py-24">
        <div className="container-page">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-widest text-clay">{t("testi_eye")}</div>
            <h2 className="font-display text-4xl md:text-5xl mt-3">{t("testi_title")}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {testimonials.map((tst, i) => (
              <div key={i} className="rounded-3xl border border-cream/10 bg-cream/5 p-8">
                <div className="text-clay text-lg">★★★★★</div>
                <p className="mt-4 text-cream/90 leading-relaxed">"{tst.text}"</p>
                <div className="mt-6 text-sm text-cream/70">— {tst.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-sand p-10 md:p-16">
          <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(circle at 80% 20%, var(--clay), transparent 50%)" }} />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl text-espresso leading-tight">{t("cta_title")}</h2>
            <p className="mt-4 text-muted-foreground">{t("cta_sub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">{t("cta_shop")}</Link>
              <a href="#contact" className="btn-ghost">{t("cta_contact")}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
