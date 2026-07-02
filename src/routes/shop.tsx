import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import productDog from "@/assets/product-dog.jpg";
import productCat from "@/assets/product-cat.jpg";
import productTreats from "@/assets/product-treats.jpg";
import { fetchCategories, fetchProducts, type Product } from "@/lib/products";
import { ProductModal } from "@/components/product-modal";
import { useCart } from "@/lib/cart";
import { formatToman } from "@/lib/format";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Beni Pett" },
      { name: "description", content: "Browse Beni Pett's curated selection of premium dog and cat food, wet food and treats." },
      { property: "og:title", content: "Shop — Beni Pett" },
      { property: "og:description", content: "Premium dog & cat food, wet food and treats." },
    ],
  }),
  component: Shop,
});

function fallbackImage(slug?: string | null) {
  const s = (slug ?? "").toLowerCase();
  if (s.includes("cat")) return productCat;
  if (s.includes("treat")) return productTreats;
  return productDog;
}

function Shop() {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const [cat, setCat] = useState<string>("all");
  const [selected, setSelected] = useState<Product | null>(null);

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const filtered = useMemo(
    () => cat === "all" ? products : products.filter((p) => p.category_slug === cat),
    [products, cat],
  );

  const filters = [{ id: "all", label: t("filter_all") }, ...categories.map((c) => ({ id: c.slug, label: lang === "fa" ? c.name_fa : c.name_en }))];

  return (
    <main>
      <section className="container-page pt-16 pb-10">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-clay">{t("nav_shop")}</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-espresso">{t("shop_title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg">{t("shop_sub")}</p>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="flex flex-wrap gap-2 mb-10 border-b border-border/60 pb-6">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setCat(f.id)}
              className={`px-5 py-2 rounded-full text-sm transition ${
                cat === f.id
                  ? "bg-espresso text-cream"
                  : "bg-sand/60 text-espresso hover:bg-sand"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={() => setSelected(p)} onAdd={() => {
              const img = p.images[0] ?? fallbackImage(p.category_slug ?? p.slug);
              add({ id: p.id, name: lang === "fa" ? p.name_fa : p.name_en, price_toman: p.price_toman, image: img });
            }} lang={lang} tAdd={t("add_to_cart")} tCurrency={t("price_currency")} />
          ))}
        </div>
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      </section>
    </main>
  );
}

function ProductCard({ p, onOpen, onAdd, lang, tAdd, tCurrency }: {
  p: Product; onOpen: () => void; onAdd: () => void; lang: "fa" | "en"; tAdd: string; tCurrency: string;
}) {
  const img = p.images[0] ?? fallbackImage(p.category_slug ?? p.slug);
  const name = lang === "fa" ? p.name_fa : p.name_en;
  return (
    <article className="group">
      <button onClick={onOpen} className="block w-full relative overflow-hidden rounded-3xl bg-sand aspect-square">
        <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </button>
      <div className="mt-5">
        {p.brand && <div className="text-xs uppercase tracking-widest text-clay">{p.brand}</div>}
        <button onClick={onOpen} className="text-start"><h3 className="mt-1 font-display text-lg text-espresso leading-snug">{name}</h3></button>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-espresso">
            <span className="font-medium">{formatToman(p.price_toman, lang)}</span>
            <span className="text-xs text-muted-foreground ms-1">{tCurrency}</span>
          </div>
          <button onClick={onAdd} className="text-sm font-medium text-espresso hover:text-clay transition">
            {tAdd} →
          </button>
        </div>
      </div>
    </article>
  );
}