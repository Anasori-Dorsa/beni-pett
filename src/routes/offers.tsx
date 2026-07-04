import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { fetchOffers, type Product } from "@/lib/products";
import { formatToman } from "@/lib/format";
import { ProductModal } from "@/components/product-modal";
import { PawScatter } from "@/components/pet-decorations";
import productDog from "@/assets/product-dog.jpg";
import productCat from "@/assets/product-cat.jpg";
import productTreats from "@/assets/product-treats.jpg";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers — Beni Pett" },
      { name: "description", content: "Special discounts on premium dog, cat and treat products at Beni Pett." },
      { property: "og:title", content: "Beni Pett — Special Offers" },
      { property: "og:description", content: "Hand-picked deals — while stocks last." },
    ],
  }),
  component: OffersPage,
});

function fallback(slug?: string | null) {
  const s = (slug ?? "").toLowerCase();
  if (s.includes("cat")) return productCat;
  if (s.includes("treat")) return productTreats;
  return productDog;
}

function OffersPage() {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const [selected, setSelected] = useState<Product | null>(null);
  const { data: offers = [] } = useQuery({ queryKey: ["offers"], queryFn: () => fetchOffers() });

  return (
    <main>
      <section className="container-page pt-16 pb-10 relative overflow-hidden">
        <PawScatter
          paws={[
            { top: "20%", left: "5%", rot: -20, size: 26, trail: true, tx: 200, ty: -30 },
            { top: "60%", left: "12%", rot: 15, size: 20 },
            { top: "30%", right: "8%", rot: 30, size: 24, trail: true, tx: -180, ty: 50 },
            { top: "70%", right: "15%", rot: -10, size: 18 },
          ]}
        />
        <div className="max-w-2xl relative">
          <div className="text-xs uppercase tracking-widest text-clay">{t("offers_eye")}</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-espresso">{t("offers_title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg">{t("offers_sub")}</p>
        </div>
      </section>

      <section className="container-page pb-24">
        {offers.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">{t("offers_empty")}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((p) => {
              const img = p.images?.[0] ?? fallback(p.category_slug ?? p.slug);
              const name = lang === "fa" ? p.name_fa : p.name_en;
              const pct = p.discount_percent
                ?? (p.compare_at_price_toman ? Math.round(100 - (p.price_toman / p.compare_at_price_toman) * 100) : null);
              return (
                <article key={p.id} className="group">
                  <button onClick={() => setSelected(p)} className="block w-full relative overflow-hidden rounded-3xl bg-sand aspect-square">
                    {pct !== null && pct > 0 && <span className="sale-badge">−{pct}%</span>}
                    <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </button>
                  <div className="mt-5">
                    {p.brand && <div className="text-xs uppercase tracking-widest text-clay">{p.brand}</div>}
                    <h3 className="mt-1 font-display text-lg text-espresso">{name}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-espresso">
                        <span className="font-medium">{formatToman(p.price_toman, lang)}</span>
                        {p.compare_at_price_toman && (
                          <span className="ms-2 text-xs text-muted-foreground line-through">{formatToman(p.compare_at_price_toman, lang)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => add({ id: p.id, name, price_toman: p.price_toman, image: img })}
                        className="text-sm font-medium text-espresso hover:text-clay transition"
                      >{t("add_to_cart")} →</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      </section>
    </main>
  );
}