import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProducts, fetchOffers } from "@/lib/products";
import { formatToman } from "@/lib/format";
import heroPets from "@/assets/hero-pets.jpg";
import productDog from "@/assets/product-dog.jpg";
import productCat from "@/assets/product-cat.jpg";
import productTreats from "@/assets/product-treats.jpg";
import { PawScatter } from "@/components/pet-decorations";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const { data: featured = [] } = useQuery({ queryKey: ["featured"], queryFn: fetchFeaturedProducts });
  const { data: offers = [] } = useQuery({ queryKey: ["offers", 4], queryFn: () => fetchOffers(4) });

  function fallback(slug?: string | null) {
    const s = (slug ?? "").toLowerCase();
    if (s.includes("cat")) return productCat;
    if (s.includes("treat")) return productTreats;
    return productDog;
  }

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
      <section className="container-page pt-10 md:pt-16 pb-24 relative overflow-hidden">
        <PawScatter
          paws={[
            { top: "8%", left: "2%", rot: -25, size: 22, trail: true, tx: 220, ty: -40 },
            { top: "40%", left: "-1%", rot: 10, size: 18 },
            { bottom: "10%", left: "10%", rot: -15, size: 20, trail: true, tx: 160, ty: -80 },
            { top: "18%", right: "3%", rot: 25, size: 24 },
            { bottom: "20%", right: "1%", rot: -20, size: 20, trail: true, tx: -180, ty: -50 },
          ]}
        />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-clay/40 bg-cream px-4 py-1.5 text-xs uppercase tracking-widest text-espresso/80">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
              {t("hero_eyebrow")}
            </div>
            <div className="relative mt-6">
              <h1 className="relative font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-espresso whitespace-pre-line">
                {t("hero_title")}
              </h1>
            </div>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              {t("hero_sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">{t("cta_shop")}</Link>
              <Link to="/offers" className="btn-ghost">{t("nav_offers")}</Link>
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

      {/* OFFERS STRIP */}
      {offers.length > 0 && (
        <section className="bg-cream/60 border-y border-clay/20 py-16 relative overflow-hidden">
          <PawScatter
            paws={[
              { top: "10%", left: "6%", rot: -30, size: 22 },
              { bottom: "12%", right: "8%", rot: 20, size: 24, trail: true, tx: -160, ty: -40 },
            ]}
          />
          <div className="container-page relative">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-clay">{t("offers_eye")}</div>
                <h2 className="font-display text-4xl md:text-5xl mt-3 text-espresso">{t("offers_title")}</h2>
                <p className="mt-2 text-muted-foreground">{t("offers_sub")}</p>
              </div>
              <Link to="/offers" className="btn-ghost text-sm">{t("view_offers")} →</Link>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offers.map((p) => {
                const img = p.images?.[0] || fallback(p.slug);
                const name = lang === "fa" ? p.name_fa : p.name_en;
                const pct = p.discount_percent
                  ?? (p.compare_at_price_toman ? Math.round(100 - (p.price_toman / p.compare_at_price_toman) * 100) : null);
                return (
                  <div key={p.id} className="group bg-background rounded-3xl overflow-hidden border border-border/60 hover:shadow-[var(--shadow-card)] transition-all">
                    <Link to="/offers" className="relative block aspect-square bg-sand overflow-hidden">
                      {pct !== null && pct > 0 && <span className="sale-badge">−{pct}%</span>}
                      <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </Link>
                    <div className="p-4">
                      <h3 className="font-display text-base text-espresso line-clamp-2 min-h-[3rem]">{name}</h3>
                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <div className="text-espresso">
                          <span className="font-medium">{formatToman(p.price_toman, lang)}</span>
                          {p.compare_at_price_toman && (
                            <span className="ms-2 text-xs text-muted-foreground line-through">{formatToman(p.compare_at_price_toman, lang)}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => add({ id: p.id, name, price_toman: p.price_toman, image: img })} className="mt-3 w-full btn-ghost !py-2 text-xs">
                        {t("add_to_cart")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
          {(featured.length > 0 ? featured : []).slice(0, 3).map((p) => {
            const img = p.images?.[0] || fallback(p.slug);
            const name = lang === "fa" ? p.name_fa : p.name_en;
            return (
              <div key={p.id} className="group block">
                <Link to="/shop" className="relative overflow-hidden rounded-3xl bg-sand aspect-square block">
                  <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </Link>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg text-espresso">{name}</h3>
                  <div className="text-espresso whitespace-nowrap">
                    <span className="font-medium">{formatToman(p.price_toman, lang).replace(/\s*تومان|\s*Toman/g, "")}</span>
                    <span className="text-xs text-muted-foreground ms-1">{t("price_currency")}</span>
                  </div>
                </div>
                <button onClick={() => add({ id: p.id, name, price_toman: p.price_toman, image: img }, 1)} className="btn-ghost mt-3 text-xs !py-2 !px-4">{t("add_to_cart")}</button>
              </div>
            );
          })}
          {featured.length === 0 && [productDog, productCat, productTreats].map((img, i) => (
            <Link to="/shop" key={i} className="group block">
              <div className="relative overflow-hidden rounded-3xl bg-sand aspect-square">
                <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
