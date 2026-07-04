import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/auth-hooks";
import { useI18n } from "@/lib/i18n";
import { formatToman } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import type { Product, Category } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Beni Pett" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useI18n();
  const { isAdmin, checking, user } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checking && !user) navigate({ to: "/auth" });
  }, [checking, user, navigate]);

  if (checking) return <main className="container-page py-24 text-center text-muted-foreground">…</main>;
  if (!user) return null;
  if (!isAdmin) return (
    <main className="container-page py-24 text-center">
      <h1 className="font-display text-2xl text-espresso">Access denied</h1>
      <p className="mt-2 text-muted-foreground">Your account doesn't have admin permissions.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
    </main>
  );

  return (
    <main className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-espresso">{t("admin_title")}</h1>
      </div>
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-8 flex-wrap h-auto">
          <TabsTrigger value="products">{t("admin_products")}</TabsTrigger>
          <TabsTrigger value="categories">{t("admin_categories")}</TabsTrigger>
          <TabsTrigger value="orders">{t("admin_orders")}</TabsTrigger>
          <TabsTrigger value="messages">{t("admin_messages")}</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsAdmin /></TabsContent>
        <TabsContent value="categories"><CategoriesAdmin /></TabsContent>
        <TabsContent value="orders"><OrdersAdmin /></TabsContent>
        <TabsContent value="messages"><MessagesAdmin /></TabsContent>
      </Tabs>
    </main>
  );
}

// -------------------- PRODUCTS --------------------
function ProductsAdmin() {
  const qc = useQueryClient();
  const { lang, t } = useI18n();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const { data: products = [], refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data as Product[];
    },
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error; return data as Category[];
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">{products.length} products</div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn-ghost text-sm !py-2 !px-4"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setEditing({})} className="btn-primary text-sm !py-2 !px-4"><Plus className="h-4 w-4" /> {t("add_new")}</button>
        </div>
      </div>
      <div className="border border-border/60 rounded-2xl overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-sand/60 text-espresso">
            <tr><th className="text-start p-3">Name</th><th className="text-start p-3">Brand</th><th className="text-start p-3">Price</th><th className="text-start p-3">Stock</th><th className="text-start p-3">Active</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border/60">
                <td className="p-3">{lang === "fa" ? p.name_fa : p.name_en}</td>
                <td className="p-3 text-muted-foreground">{p.brand ?? "—"}</td>
                <td className="p-3">{formatToman(p.price_toman, lang)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.is_active ? "✓" : "—"}</td>
                <td className="p-3 text-end">
                  <button onClick={() => setEditing(p)} className="p-2 hover:bg-sand rounded"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <ProductForm initial={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); setEditing(null); }} />}
    </div>
  );
}

function ProductForm({ initial, categories, onClose, onSaved }: { initial: Partial<Product>; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    id: initial.id,
    slug: initial.slug ?? "",
    category_id: initial.category_id ?? categories[0]?.id ?? "",
    name_fa: initial.name_fa ?? "",
    name_en: initial.name_en ?? "",
    brand: initial.brand ?? "",
    description_fa: initial.description_fa ?? "",
    description_en: initial.description_en ?? "",
    price_toman: initial.price_toman ?? 0,
    compare_at_price_toman: initial.compare_at_price_toman ?? 0,
    stock: initial.stock ?? 0,
    images: (initial.images ?? []).join("\n"),
    features: JSON.stringify(initial.features ?? {}, null, 2),
    is_active: initial.is_active ?? true,
    is_featured: initial.is_featured ?? false,
    is_on_sale: initial.is_on_sale ?? false,
    discount_percent: initial.discount_percent ?? 0,
  });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    let features = {};
    try { features = JSON.parse(f.features || "{}"); } catch { toast.error("Features must be valid JSON"); setBusy(false); return; }
    const payload = {
      slug: f.slug || f.name_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      category_id: f.category_id || null,
      name_fa: f.name_fa, name_en: f.name_en, brand: f.brand || null,
      description_fa: f.description_fa || null, description_en: f.description_en || null,
      price_toman: Number(f.price_toman), stock: Number(f.stock),
      compare_at_price_toman: Number(f.compare_at_price_toman) > 0 ? Number(f.compare_at_price_toman) : null,
      is_on_sale: !!f.is_on_sale,
      discount_percent: Number(f.discount_percent) > 0 ? Number(f.discount_percent) : null,
      images: f.images.split("\n").map((s) => s.trim()).filter(Boolean),
      features, is_active: f.is_active, is_featured: f.is_featured,
    };
    const { error } = f.id
      ? await supabase.from("products").update(payload).eq("id", f.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{f.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <L label="Slug"><input required value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="input-base" /></L>
            <L label="Category">
              <select value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })} className="input-base">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </L>
            <L label="Name (FA)"><input required value={f.name_fa} onChange={(e) => setF({ ...f, name_fa: e.target.value })} className="input-base" /></L>
            <L label="Name (EN)"><input required value={f.name_en} onChange={(e) => setF({ ...f, name_en: e.target.value })} className="input-base" /></L>
            <L label="Brand"><input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} className="input-base" /></L>
            <L label="Price (Toman)"><input type="number" required value={f.price_toman} onChange={(e) => setF({ ...f, price_toman: Number(e.target.value) })} className="input-base" /></L>
            <L label="Stock"><input type="number" required value={f.stock} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} className="input-base" /></L>
            <L label="Compare-at price (was, Toman)"><input type="number" value={f.compare_at_price_toman} onChange={(e) => setF({ ...f, compare_at_price_toman: Number(e.target.value) })} className="input-base" placeholder="0 = none" /></L>
            <L label="Discount %"><input type="number" min={0} max={99} value={f.discount_percent} onChange={(e) => setF({ ...f, discount_percent: Number(e.target.value) })} className="input-base" placeholder="0 = auto from prices" /></L>
          </div>
          <L label="Description (FA)"><textarea rows={3} value={f.description_fa} onChange={(e) => setF({ ...f, description_fa: e.target.value })} className="input-base" /></L>
          <L label="Description (EN)"><textarea rows={3} value={f.description_en} onChange={(e) => setF({ ...f, description_en: e.target.value })} className="input-base" /></L>
          <L label="Image URLs (one per line)"><textarea rows={3} value={f.images} onChange={(e) => setF({ ...f, images: e.target.value })} className="input-base font-mono text-xs" placeholder="https://..." /></L>
          <L label='Features (JSON, e.g. {"weight":"3kg"})'><textarea rows={3} value={f.features} onChange={(e) => setF({ ...f, features: e.target.value })} className="input-base font-mono text-xs" /></L>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_on_sale} onChange={(e) => setF({ ...f, is_on_sale: e.target.checked })} /> On sale (offers)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost !py-2 !px-5 text-sm">Cancel</button>
            <button disabled={busy} className="btn-primary !py-2 !px-5 text-sm">{busy ? "…" : "Save"}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground mb-1 block">{label}</span>{children}</label>;
}

// -------------------- CATEGORIES --------------------
function CategoriesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const { data: cats = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error; return data as Category[];
    },
  });
  async function remove(id: string) {
    if (!confirm("Delete category? Products will be unlinked.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); }
  }
  return (
    <div>
      <div className="flex justify-end mb-4"><button onClick={() => setEditing({})} className="btn-primary text-sm !py-2 !px-4"><Plus className="h-4 w-4" /> New</button></div>
      <div className="border border-border/60 rounded-2xl overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-sand/60"><tr><th className="text-start p-3">Slug</th><th className="text-start p-3">FA</th><th className="text-start p-3">EN</th><th className="text-start p-3">Order</th><th></th></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="p-3 font-mono text-xs">{c.slug}</td>
                <td className="p-3">{c.name_fa}</td>
                <td className="p-3">{c.name_en}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3 text-end">
                  <button onClick={() => setEditing(c)} className="p-2 hover:bg-sand rounded"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(c.id)} className="p-2 hover:bg-red-50 text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <CategoryForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); }} />}
    </div>
  );
}

function CategoryForm({ initial, onClose, onSaved }: { initial: Partial<Category>; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ id: initial.id, slug: initial.slug ?? "", name_fa: initial.name_fa ?? "", name_en: initial.name_en ?? "", sort_order: initial.sort_order ?? 0 });
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const payload = { slug: f.slug, name_fa: f.name_fa, name_en: f.name_en, sort_order: Number(f.sort_order) };
    const { error } = f.id ? await supabase.from("categories").update(payload).eq("id", f.id) : await supabase.from("categories").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); onSaved();
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>{f.id ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-4">
          <L label="Slug"><input required value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="input-base" /></L>
          <L label="Name (FA)"><input required value={f.name_fa} onChange={(e) => setF({ ...f, name_fa: e.target.value })} className="input-base" /></L>
          <L label="Name (EN)"><input required value={f.name_en} onChange={(e) => setF({ ...f, name_en: e.target.value })} className="input-base" /></L>
          <L label="Order"><input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} className="input-base" /></L>
          <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-ghost !py-2 !px-5 text-sm">Cancel</button><button disabled={busy} className="btn-primary !py-2 !px-5 text-sm">Save</button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// -------------------- ORDERS --------------------
function OrdersAdmin() {
  const qc = useQueryClient();
  const { lang } = useI18n();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error; return data as any[];
    },
  });
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); }
  }
  return (
    <div className="grid gap-4">
      {orders.length === 0 && <div className="text-center py-16 text-muted-foreground">No orders yet.</div>}
      {orders.map((o) => (
        <div key={o.id} className="border border-border/60 rounded-2xl bg-background p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <div className="font-medium text-espresso">{o.full_name} <span className="text-xs text-muted-foreground ms-2" dir="ltr">{o.phone}</span></div>
              <div className="text-xs text-muted-foreground mt-1" dir="ltr">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">{o.city} — {o.address}</div>
            </div>
            <div className="text-end">
              <div className="font-display text-xl text-espresso">{formatToman(o.total_toman, lang)}</div>
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="input-base text-xs mt-2 !py-1">
                {["pending","paid","processing","shipped","delivered","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 grid gap-1 text-sm">
            {o.order_items?.map((it: any) => (
              <div key={it.id} className="flex justify-between text-muted-foreground">
                <span>{it.product_name} <span className="text-xs">×{it.quantity}</span></span>
                <span>{formatToman(it.unit_price_toman * it.quantity, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------- MESSAGES --------------------
function MessagesAdmin() {
  const qc = useQueryClient();
  const { data: msgs = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data as any[];
    },
  });
  async function toggleRead(id: string, is_read: boolean) {
    await supabase.from("contact_messages").update({ is_read: !is_read }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }
  return (
    <div className="grid gap-3">
      {msgs.length === 0 && <div className="text-center py-16 text-muted-foreground">No messages.</div>}
      {msgs.map((m) => (
        <div key={m.id} className={`border rounded-2xl p-5 bg-background ${m.is_read ? "border-border/40 opacity-70" : "border-clay/60"}`}>
          <div className="flex justify-between gap-3">
            <div>
              <div className="font-medium text-espresso">{m.name} {m.subject && <span className="text-muted-foreground">— {m.subject}</span>}</div>
              <div className="text-xs text-muted-foreground" dir="ltr">{m.email ?? ""} {m.phone ?? ""} · {new Date(m.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => toggleRead(m.id, m.is_read)} className="text-xs px-3 py-1 rounded border border-border hover:bg-sand">{m.is_read ? "Unread" : "Read"}</button>
              <button onClick={() => remove(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="mt-3 text-sm text-espresso whitespace-pre-wrap">{m.message}</p>
        </div>
      ))}
    </div>
  );
}