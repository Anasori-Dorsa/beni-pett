import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fa" | "en";

type I18nCtx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: <K extends keyof typeof dict.fa>(key: K) => string;
};

const dict = {
  fa: {
    brand: "Beni Pett",
    tagline: "پت‌شاپ تخصصی سگ و گربه",
    nav_home: "خانه",
    nav_shop: "فروشگاه",
    nav_about: "درباره ما",
    nav_contact: "تماس",
    cta_shop: "مشاهده محصولات",
    cta_contact: "تماس با ما",
    hero_eyebrow: "برند تخصصی تغذیه حیوانات خانگی",
    hero_title: "غذایی درخور\nعزیزترین‌های شما",
    hero_sub: "در بنی‌پت، غذای سگ و گربه را با دقت انتخاب می‌کنیم؛ برندهای معتبر جهانی، بسته‌بندی سالم و مشاوره تخصصی — همه در یک جا.",
    stat_1: "برند معتبر",
    stat_2: "سال تجربه",
    stat_3: "مشتری راضی",
    about_eye: "درباره بنی‌پت",
    about_title: "پت‌شاپی که با عشق کار می‌کند",
    about_body: "بنی‌پت با تمرکز بر تغذیه‌ی سالم سگ و گربه راه‌اندازی شده است. ما محصولاتی را انتخاب می‌کنیم که خودمان برای حیوان خانگی خود می‌خریم؛ اصل، تازه و متناسب با نیاز واقعی حیوان شما.",
    feature_1_t: "برندهای اصل",
    feature_1_d: "تنها نمایندگی مستقیم برندهای معتبر جهانی و داخلی.",
    feature_2_t: "مشاوره تخصصی",
    feature_2_d: "تیم ما قبل از خرید نیاز حیوان شما را بررسی می‌کند.",
    feature_3_t: "ارسال سریع",
    feature_3_d: "ارسال یک‌روزه در تهران و ۲ تا ۳ روزه به تمام ایران.",
    products_eye: "پرفروش‌های بنی‌پت",
    products_title: "منتخب غذاهای سگ و گربه",
    products_sub: "کیفیت پرمیوم، قیمت منصفانه.",
    view_all: "مشاهده همه محصولات",
    testi_eye: "نظر مشتریان",
    testi_title: "چیزی که پت‌پرنت‌ها می‌گویند",
    cta_title: "حیوان خانگی شما شایسته‌ی بهترین است",
    cta_sub: "همین حالا وارد فروشگاه شوید یا با ما تماس بگیرید تا بهترین انتخاب را داشته باشید.",
    footer_rights: "تمامی حقوق محفوظ است.",
    shop_title: "فروشگاه بنی‌پت",
    shop_sub: "غذای خشک، غذای مرطوب و تشویقی برای سگ و گربه.",
    filter_all: "همه",
    filter_dog: "سگ",
    filter_cat: "گربه",
    filter_treats: "تشویقی",
    add_to_cart: "افزودن به سبد",
    price_currency: "تومان",
  },
  en: {
    brand: "Beni Pett",
    tagline: "Premium Dog & Cat Food Boutique",
    nav_home: "Home",
    nav_shop: "Shop",
    nav_about: "About",
    nav_contact: "Contact",
    cta_shop: "Browse Shop",
    cta_contact: "Contact us",
    hero_eyebrow: "Specialty pet nutrition",
    hero_title: "Food worthy of\nyour dearest ones",
    hero_sub: "At Beni Pett we hand-pick premium dog and cat food from trusted global brands — with clean packaging and expert advice, all in one place.",
    stat_1: "Trusted brands",
    stat_2: "Years of care",
    stat_3: "Happy pet parents",
    about_eye: "About Beni Pett",
    about_title: "A pet shop run with love",
    about_body: "Beni Pett was built around one idea: feed pets what we'd feed our own. We stock only what we've researched, tasted (well, sniffed) and would trust for our own dog and cat.",
    feature_1_t: "Authentic brands",
    feature_1_d: "Direct distributors of world-class pet nutrition brands.",
    feature_2_t: "Expert advice",
    feature_2_d: "Our team helps you pick the right food for your pet's needs.",
    feature_3_t: "Fast delivery",
    feature_3_d: "Same-day delivery in the city, 2–3 days nationwide.",
    products_eye: "Bestsellers",
    products_title: "Curated food for dogs & cats",
    products_sub: "Premium quality, fair pricing.",
    view_all: "See all products",
    testi_eye: "Testimonials",
    testi_title: "What pet parents say",
    cta_title: "Your pet deserves the very best",
    cta_sub: "Visit our shop or reach out — we'll help you find the perfect match.",
    footer_rights: "All rights reserved.",
    shop_title: "Beni Pett Shop",
    shop_sub: "Dry food, wet food and treats for dogs and cats.",
    filter_all: "All",
    filter_dog: "Dogs",
    filter_cat: "Cats",
    filter_treats: "Treats",
    add_to_cart: "Add to cart",
    price_currency: "T",
  },
} as const;

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fa");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored === "fa" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const value: I18nCtx = {
    lang,
    dir: lang === "fa" ? "rtl" : "ltr",
    setLang,
    t: (key) => dict[lang][key] ?? dict.fa[key],
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be inside I18nProvider");
  return c;
}