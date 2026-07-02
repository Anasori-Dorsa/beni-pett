import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth-hooks";
import { formatToman } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Beni Pett" }] }),
  component: CheckoutPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(1).max(100),
  postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

function CheckoutPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", postal_code: "", notes: "" });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && items.length === 0) navigate({ to: "/shop" });
  }, [items.length, loading, navigate]);

  const shipping = subtotal >= 1000000 ? 0 : 80000;
  const total = subtotal + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid"); return; }
    setBusy(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      postal_code: parsed.data.postal_code || null,
      notes: parsed.data.notes || null,
      subtotal_toman: subtotal,
      shipping_toman: shipping,
      total_toman: total,
      currency: "irr",
      status: "pending",
    }).select().single();
    if (error || !order) { setBusy(false); toast.error(error?.message ?? "Failed"); return; }

    const rows = items.map((it) => ({
      order_id: order.id,
      product_id: it.id,
      product_name: it.name,
      unit_price_toman: it.price_toman,
      quantity: it.quantity,
      image_url: it.image ?? null,
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) { setBusy(false); toast.error(itemsErr.message); return; }

    clear();
    navigate({ to: "/order-success", search: { id: order.id } });
  }

  return (
    <main className="container-page pt-12 pb-24">
      <h1 className="font-display text-4xl md:text-5xl text-espresso">{t("checkout_title")}</h1>

      <div className="mt-10 grid lg:grid-cols-3 gap-10">
        <form onSubmit={submit} className="lg:col-span-2 grid gap-5 bg-background rounded-3xl border border-border/60 p-8">
          <h2 className="font-display text-xl text-espresso">{t("checkout_shipping")}</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <F label={t("contact_name")}><input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-base" /></F>
            <F label={t("contact_phone")}><input dir="ltr" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" /></F>
            <F label={t("checkout_city")}><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-base" /></F>
            <F label={t("checkout_postal")}><input dir="ltr" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="input-base" /></F>
          </div>
          <F label={t("checkout_address")}><textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-base resize-y" /></F>
          <F label={t("checkout_notes")}><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-base resize-y" /></F>
          <button disabled={busy} className="btn-primary justify-center sm:w-fit">{busy ? "…" : t("checkout_pay")}</button>
        </form>

        <aside className="bg-sand/60 rounded-3xl p-6 h-fit">
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span className="text-espresso">{it.name} <span className="text-muted-foreground">×{it.quantity}</span></span>
                <span className="text-espresso">{formatToman(it.price_toman * it.quantity, lang)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/60 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("cart_subtotal")}</span><span>{formatToman(subtotal, lang)}</span></div>
            <div className="flex justify-between"><span>{t("checkout_shipping_fee")}</span><span>{shipping === 0 ? t("checkout_free") : formatToman(shipping, lang)}</span></div>
            <div className="flex justify-between font-display text-xl text-espresso pt-2 border-t border-border/60"><span>{t("checkout_total")}</span><span>{formatToman(total, lang)} <span className="text-xs text-muted-foreground">{t("price_currency")}</span></span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm text-espresso mb-1.5 block">{label}</span>{children}</label>;
}