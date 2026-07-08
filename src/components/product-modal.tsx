import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { formatToman } from "@/lib/format";
import { useState } from "react";
import type { Product } from "@/lib/products";
import fallbackDog from "@/assets/product-dog.jpg";
import fallbackCat from "@/assets/product-cat.jpg";
import fallbackTreats from "@/assets/product-treats.jpg";
import { ReviewsSection } from "@/components/reviews-section";

function fallbackImage(slug?: string) {
  if (!slug) return fallbackDog;
  if (slug.includes("cat") || slug.includes("feline") || slug.includes("salmon")) return fallbackCat;
  if (slug.includes("treat") || slug.includes("bite")) return fallbackTreats;
  return fallbackDog;
}

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const [active, setActive] = useState(0);

  if (!product) return null;
  const images = product.images && product.images.length > 0 ? product.images : [fallbackImage(product.category_slug ?? product.slug)];
  const name = lang === "fa" ? product.name_fa : product.name_en;
  const description = lang === "fa" ? product.description_fa : product.description_en;
  const features = product.features && typeof product.features === "object" ? product.features as Record<string, string> : {};

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="bg-sand">
            <div className="aspect-square overflow-hidden">
              <img src={images[active]} alt={name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 ${active === i ? "border-espresso" : "border-transparent"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-8 flex flex-col">
            {product.brand && <div className="text-xs uppercase tracking-widest text-clay">{product.brand}</div>}
            <h3 className="font-display text-2xl md:text-3xl text-espresso mt-2">{name}</h3>
            <div className="mt-3 text-espresso">
              <span className="font-display text-2xl">{formatToman(product.price_toman, lang)}</span>
              <span className="text-sm text-muted-foreground ms-2">{t("price_currency")}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{description}</p>
            {Object.keys(features).length > 0 && (
              <div className="mt-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("product_features")}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(features).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-sand/60 px-3 py-2">
                      <div className="text-[11px] text-muted-foreground uppercase">{k}</div>
                      <div className="text-espresso">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 text-xs">
              {product.stock > 0
                ? <span className="text-emerald-700">● {t("in_stock")}</span>
                : <span className="text-red-600">● {t("out_of_stock")}</span>}
            </div>
            <div className="mt-auto pt-6 flex gap-3">
              <button
                disabled={product.stock <= 0}
                onClick={() => { add({ id: product.id, name, price_toman: product.price_toman, image: images[0] }); onClose(); }}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >{t("add_to_cart")}</button>
            </div>
          </div>
        </div>
        <div className="border-t border-border/60 p-6 bg-cream/30">
          <ReviewsSection productId={product.id} compact />
        </div>
      </DialogContent>
    </Dialog>
  );
}