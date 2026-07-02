import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatToman } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartDrawer() {
  const { t, lang } = useI18n();
  const { items, isOpen, close, setQty, remove, subtotal } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent side={lang === "fa" ? "left" : "right"} className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-border/60">
          <SheetTitle className="font-display text-2xl text-espresso">{t("cart_title")}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-16">{t("cart_empty")}</div>
          )}
          {items.map((it) => (
            <div key={it.id} className="flex gap-4 border-b border-border/40 pb-4">
              <div className="h-20 w-20 rounded-xl bg-sand overflow-hidden shrink-0">
                {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-espresso text-sm line-clamp-2">{it.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatToman(it.price_toman, lang)} <span className="text-xs">{t("price_currency")}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setQty(it.id, it.quantity - 1)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-sand"><Minus className="h-3 w-3" /></button>
                  <span className="text-sm min-w-6 text-center">{it.quantity}</span>
                  <button onClick={() => setQty(it.id, it.quantity + 1)} className="h-7 w-7 grid place-items-center rounded border border-border hover:bg-sand"><Plus className="h-3 w-3" /></button>
                  <button onClick={() => remove(it.id)} className="ms-auto text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/60 p-6 space-y-4">
            <div className="flex justify-between text-espresso">
              <span>{t("cart_subtotal")}</span>
              <span className="font-display text-xl">
                {formatToman(subtotal, lang)} <span className="text-xs text-muted-foreground">{t("price_currency")}</span>
              </span>
            </div>
            <Link to="/checkout" onClick={close} className="btn-primary w-full justify-center">{t("cart_checkout")}</Link>
            <button onClick={close} className="btn-ghost w-full justify-center">{t("cart_continue")}</button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}