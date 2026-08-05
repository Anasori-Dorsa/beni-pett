import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { useIsAdmin } from "@/lib/auth-hooks";
import { useI18n } from "@/lib/i18n";
import { formatToman } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, RefreshCw, Copy, Upload, X, ArrowUp, ArrowDown, Search } from "lucide-react";
import type { Product, Category } from "@/lib/products";

async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await apiFetch<{ url: string }>("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  return result.url;
}

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
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "sale" | "featured">("all");

  const { data: products = [], refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiFetch<Product[]>("/api/admin/products"),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => apiFetch<Category[]>("/api/admin/categories"),
  });

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function quickToggle(p: Product, field: "is_active" | "is_featured" | "is_on_sale") {
    const patch: Partial<Product> = { [field]: !p[field] } as Partial<Product>;
    try {
      await apiFetch(`/api/admin/products/${p.id}`, { method: "PUT", body: patch });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["offers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function duplicate(p: Product) {
    const { id, ...rest } = p as any;
    delete rest.created_at; delete rest.updated_at; delete (rest as any).categories;
    rest.slug = `${p.slug}-copy-${Date.now().toString(36).slice(-4)}`;
    rest.name_fa = `${p.name_fa} (کپی)`;
    rest.name_en = `${p.name_en} (copy)`;
    try {
      await apiFetch("/api/admin/products", { method: "POST", body: rest });
      toast.success("Duplicated");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  const filtered = products.filter((p) => {
    if (catFilter !== "all" && p.category_id !== catFilter) return false;
    if (statusFilter === "active" && !p.is_active) return false;
    if (statusFilter === "inactive" && p.is_active) return false;
    if (statusFilter === "sale" && !p.is_on_sale) return false;
    if (statusFilter === "featured" && !p.is_featured) return false;
    if (q) {
      const s = q.toLowerCase();
      if (![p.name_fa, p.name_en, p.brand ?? "", p.slug].some((v) => v.toLowerCase().includes(s))) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input-base !py-2 ps-9 text-sm w-56" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-base !py-2 text-sm">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="input-base !py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="sale">On sale</option>
            <option value="featured">Featured</option>
          </select>
          <div className="text-xs text-muted-foreground ms-1">{filtered.length}/{products.length}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn-ghost text-sm !py-2 !px-4"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setEditing({})} className="btn-primary text-sm !py-2 !px-4"><Plus className="h-4 w-4" /> {t("add_new")}</button>
        </div>
      </div>
      <div className="border border-border/60 rounded-2xl overflow-x-auto bg-background">
        <table className="w-full text-sm">
          <thead className="bg-sand/60 text-espresso">
            <tr>
              <th className="text-start p-3 w-16">Image</th>
              <th className="text-start p-3">Name</th>
              <th className="text-start p-3">Brand</th>
              <th className="text-start p-3">Price</th>
              <th className="text-start p-3">Stock</th>
              <th className="text-start p-3">Flags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border/60">
                <td className="p-3">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-sand" />
                  )}
                </td>
                <td className="p-3">{lang === "fa" ? p.name_fa : p.name_en}</td>
                <td className="p-3 text-muted-foreground">{p.brand ?? "—"}</td>
                <td className="p-3">{formatToman(p.price_toman, lang)}</td>
                <td className="p-3">
                  <span className={p.stock <= 0 ? "text-red-600" : p.stock < 5 ? "text-amber-600" : ""}>{p.stock}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <FlagChip label="A" title="Active" on={p.is_active} onClick={() => quickToggle(p, "is_active")} />
                    <FlagChip label="★" title="Featured" on={p.is_featured} onClick={() => quickToggle(p, "is_featured")} />
                    <FlagChip label="%" title="On sale" on={p.is_on_sale} onClick={() => quickToggle(p, "is_on_sale")} />
                  </div>
                </td>
                <td className="p-3 text-end">
                  <button onClick={() => setEditing(p)} className="p-2 hover:bg-sand rounded"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => duplicate(p)} className="p-2 hover:bg-sand rounded" title="Duplicate"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {editing && <ProductForm initial={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); setEditing(null); }} />}
    </div>
  );
}

function FlagChip({ label, title, on, onClick }: { label: string; title: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-full text-xs font-medium transition ${on ? "bg-espresso text-cream" : "bg-sand/60 text-muted-foreground hover:bg-sand"}`}
    >{label}</button>
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
    features: JSON.stringify(initial.features ?? {}, null, 2),
    is_active: initial.is_active ?? true,
    is_featured: initial.is_featured ?? false,
    is_on_sale: initial.is_on_sale ?? false,
    discount_percent: initial.discount_percent ?? 0,
  });
  const [images, setImages] = useState<string[]>(initial.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(arr.map((file) => uploadProductImage(file)));
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) { setImages((arr) => arr.filter((_, idx) => idx !== i)); }
  function moveImage(i: number, dir: -1 | 1) {
    setImages((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const copy = [...arr]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
    });
  }

  function autoSlug() {
    const base = (f.name_en || f.name_fa).toLowerCase().trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/(^-|-$)/g, "");
    setF({ ...f, slug: base });
  }

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
      images,
      features, is_active: f.is_active, is_featured: f.is_featured,
    };
    try {
      if (f.id) {
        await apiFetch(`/api/admin/products/${f.id}`, { method: "PUT", body: payload });
      } else {
        await apiFetch("/api/admin/products", { method: "POST", body: payload });
      }
      toast.success("Saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{f.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <L label="Slug">
              <div className="flex gap-2">
                <input required value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className="input-base flex-1" />
                <button type="button" onClick={autoSlug} className="btn-ghost !py-2 !px-3 text-xs">Auto</button>
              </div>
            </L>
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
          <L label="Images">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-xl p-4 transition ${dragOver ? "border-espresso bg-sand/50" : "border-border/60"}`}
            >
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                  {images.map((url, i) => (
                    <div key={url + i} className="relative group rounded-lg overflow-hidden bg-sand aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute top-1 start-1 text-[10px] px-1.5 py-0.5 rounded bg-espresso text-cream">Cover</span>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                        <button type="button" onClick={() => moveImage(i, -1)} className="p-1.5 bg-white rounded-full disabled:opacity-30" disabled={i === 0}><ArrowUp className="h-3 w-3" /></button>
                        <button type="button" onClick={() => moveImage(i, 1)} className="p-1.5 bg-white rounded-full disabled:opacity-30" disabled={i === images.length - 1}><ArrowDown className="h-3 w-3" /></button>
                        <button type="button" onClick={() => removeImage(i)} className="p-1.5 bg-red-600 text-white rounded-full"><X className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex flex-col items-center justify-center gap-2 py-6 cursor-pointer text-muted-foreground hover:text-espresso transition">
                <Upload className="h-6 w-6" />
                <span className="text-sm">{uploading ? "Uploading…" : "Drop images or click to upload"}</span>
                <span className="text-xs">JPG · PNG · WebP · AVIF (max 5MB)</span>
                <input
                  type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
                />
              </label>
            </div>
          </L>
          <L label='Features (JSON, e.g. {"weight":"3kg"})'><textarea rows={3} value={f.features} onChange={(e) => setF({ ...f, features: e.target.value })} className="input-base font-mono text-xs" /></L>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_on_sale} onChange={(e) => setF({ ...f, is_on_sale: e.target.checked })} /> On sale (offers)</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost !py-2 !px-5 text-sm">Cancel</button>
            <button disabled={busy || uploading} className="btn-primary !py-2 !px-5 text-sm">{busy ? "…" : "Save"}</button>
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
    queryFn: () => apiFetch<Category[]>("/api/admin/categories"),
  });
  async function remove(id: string) {
    if (!confirm("Delete category? Products will be unlinked.")) return;
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
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
    try {
      if (f.id) {
        await apiFetch(`/api/admin/categories/${f.id}`, { method: "PUT", body: payload });
      } else {
        await apiFetch("/api/admin/categories", { method: "POST", body: payload });
      }
      toast.success("Saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
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
    queryFn: () => apiFetch<any[]>("/api/admin/orders"),
  });
  async function setStatus(id: string, status: string) {
    try {
      await apiFetch(`/api/admin/orders/${id}`, { method: "PUT", body: { status } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
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
    queryFn: () => apiFetch<any[]>("/api/admin/messages"),
  });
  async function toggleRead(id: string, is_read: boolean) {
    try {
      await apiFetch(`/api/admin/messages/${id}`, { method: "PUT", body: { is_read: !is_read } });
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete message?")) return;
    try {
      await apiFetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
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
