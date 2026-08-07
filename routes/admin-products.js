// routes/admin-products.js
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const { z } = require("zod");
const { query } = require("../config/db");
const { requireAuth, verifyOrigin } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const router = express.Router();
router.use(verifyOrigin, requireAuth, requireAdmin);

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("فرمت فایل مجاز نیست. فقط JPG، PNG، WebP یا AVIF."));
    }
    cb(null, true);
  },
});

// POST /api/admin/upload  (multipart/form-data, field name: "file")
router.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "فایلی ارسال نشد." });
    const base = (process.env.UPLOAD_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
    res.json({ url: `${base}/uploads/${req.file.filename}` });
  });
});

function safeJsonArray(v) {
  if (Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v || "[]");
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
function safeJsonObject(v) {
  if (v && typeof v === "object" && !Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v || "{}");
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    category_id: row.category_id,
    name_fa: row.name_fa,
    name_en: row.name_en,
    brand: row.brand,
    description_fa: row.description_fa,
    description_en: row.description_en,
    price_toman: Number(row.price_toman),
    compare_at_price_toman: row.compare_at_price_toman == null ? null : Number(row.compare_at_price_toman),
    stock: Number(row.stock),
    images: safeJsonArray(row.images),
    features: safeJsonObject(row.features),
    is_active: !!row.is_active,
    is_featured: !!row.is_featured,
    is_on_sale: !!row.is_on_sale,
    discount_percent: row.discount_percent == null ? null : Number(row.discount_percent),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET /api/admin/products  (همه، فعال و غیرفعال)
router.get("/", async (_req, res) => {
  const rows = await query("SELECT * FROM products ORDER BY created_at DESC");
  res.json(rows.map(mapProduct));
});

const productSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  category_id: z.string().min(1).nullable().optional(),
  name_fa: z.string().trim().min(1).max(255),
  name_en: z.string().trim().min(1).max(255),
  brand: z.string().trim().max(120).nullable().optional(),
  description_fa: z.string().max(5000).nullable().optional(),
  description_en: z.string().max(5000).nullable().optional(),
  price_toman: z.number().min(0),
  compare_at_price_toman: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(20).default([]),
  features: z.record(z.string(), z.any()).default({}),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_on_sale: z.boolean().default(false),
  discount_percent: z.number().min(0).max(99).nullable().optional(),
});

// POST /api/admin/products
router.post("/", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const d = parsed.data;

  const dupe = await query("SELECT id FROM products WHERE slug = ? LIMIT 1", [d.slug]);
  if (dupe.length > 0) return res.status(409).json({ message: "این slug قبلاً استفاده شده است." });

  const id = crypto.randomUUID();
  await query(
    `INSERT INTO products
       (id, slug, category_id, name_fa, name_en, brand, description_fa, description_en,
        price_toman, compare_at_price_toman, stock, images, features,
        is_active, is_featured, is_on_sale, discount_percent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, d.slug, d.category_id || null, d.name_fa, d.name_en, d.brand || null,
      d.description_fa || null, d.description_en || null,
      d.price_toman, d.compare_at_price_toman || null, d.stock,
      JSON.stringify(d.images), JSON.stringify(d.features),
      d.is_active, d.is_featured, d.is_on_sale, d.discount_percent || null,
    ],
  );

  res.status(201).json({ id });
});

const productUpdateSchema = productSchema.partial();

// PUT /api/admin/products/:id
router.put("/:id", async (req, res) => {
  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const d = parsed.data;

  const existing = await query("SELECT id FROM products WHERE id = ? LIMIT 1", [req.params.id]);
  if (existing.length === 0) return res.status(404).json({ message: "محصول یافت نشد." });

  if (d.slug) {
    const dupe = await query("SELECT id FROM products WHERE slug = ? AND id <> ? LIMIT 1", [d.slug, req.params.id]);
    if (dupe.length > 0) return res.status(409).json({ message: "این slug قبلاً استفاده شده است." });
  }

  const fields = [];
  const values = [];
  const columnMap = {
    slug: "slug", category_id: "category_id", name_fa: "name_fa", name_en: "name_en",
    brand: "brand", description_fa: "description_fa", description_en: "description_en",
    price_toman: "price_toman", compare_at_price_toman: "compare_at_price_toman", stock: "stock",
    is_active: "is_active", is_featured: "is_featured", is_on_sale: "is_on_sale",
    discount_percent: "discount_percent",
  };
  for (const [key, column] of Object.entries(columnMap)) {
    if (Object.prototype.hasOwnProperty.call(d, key)) {
      fields.push(`${column} = ?`);
      values.push(d[key] === undefined ? null : d[key]);
    }
  }
  if (Object.prototype.hasOwnProperty.call(d, "images")) {
    fields.push("images = ?");
    values.push(JSON.stringify(d.images));
  }
  if (Object.prototype.hasOwnProperty.call(d, "features")) {
    fields.push("features = ?");
    values.push(JSON.stringify(d.features));
  }
  if (fields.length === 0) return res.json({ ok: true });

  values.push(req.params.id);
  await query(`UPDATE products SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`, values);
  res.json({ ok: true });
});

// DELETE /api/admin/products/:id
router.delete("/:id", async (req, res) => {
  await query("DELETE FROM products WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
