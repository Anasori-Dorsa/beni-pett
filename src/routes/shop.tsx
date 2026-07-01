import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import productDog from "@/assets/product-dog.jpg";
import productCat from "@/assets/product-cat.jpg";
import productTreats from "@/assets/product-treats.jpg";

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

type Category = "all" | "dog" | "cat" | "treats";

function Shop() {
  const { t, lang } = useI18n();
  const [cat, setCat] = useState<Category>("all");

  const products = useMemo(
    () => [
      { id: 1, img: productDog, category: "dog" as Category,
        name: lang === "fa" ? "غذای خشک سگ بالغ — نژاد متوسط" : "Adult Dog Dry Food — Medium Breed",
        brand: "Royal Nature", price: "۸۹۰,۰۰۰" },
      { id: 2, img: productDog, category: "dog" as Category,
        name: lang === "fa" ? "غذای توله سگ — پاپی" : "Puppy Formula",
        brand: "Origen", price: "۱,۱۲۰,۰۰۰" },
      { id: 3, img: productCat, category: "cat" as Category,
        name: lang === "fa" ? "غذای خشک گربه بالغ" : "Adult Cat Dry Food",
        brand: "Feline Care", price: "۶۵۰,۰۰۰" },
      { id: 4, img: productCat, category: "cat" as Category,
        name: lang === "fa" ? "غذای گربه‌ی عقیم" : "Sterilized Cat Formula",
        brand: "Purely", price: "۷۲۰,۰۰۰" },
      { id: 5, img: productTreats, category: "treats" as Category,
        name: lang === "fa" ? "تشویقی سگ — طعم گوشت" : "Dog Treats — Beef",
        brand: "Beni Bites", price: "۱۹۵,۰�000" },
      { id: 6, img: productTreats, category: "treats" as Category,
        name: lang === "fa" ? "تشویقی گربه — سالمون" : "Cat Treats — Salmon",
        brand: "Beni Bites", price: "۲۱۰,۰۰۰" },
    ],
    [lang],
  );

  const filtered = cat === "all" ? products : products.filter((p) => p.category === cat);

  const filters: { id: Category; label: string }[] = [
    { id: "all", label: t("filter_all") },
    { id: "dog", label: t("filter_dog") },
    { id: "cat", label: t("filter_cat") },
    { id: "treats", label: t("filter_treats") },
  ];

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
            <article key={p.id} className="group">
              <div className="relative overflow-hidden rounded-3xl bg-sand aspect-square">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-5">
                <div className="text-xs uppercase tracking-widest text-clay">{p.brand}</div>
                <h3 className="mt-1 font-display text-lg text-espresso leading-snug">{p.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-espresso">
                    <span className="font-medium">{p.price}</span>
                    <span className="text-xs text-muted-foreground ms-1">{t("price_currency")}</span>
                  </div>
                  <button className="text-sm font-medium text-espresso hover:text-clay transition">
                    {t("add_to_cart")} →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}