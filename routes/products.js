// routes/products.js
const express = require("express");
const { query } = require("../config/db");

const router = express.Router();

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    category_id: row.category_id,
    category_slug: row.category_slug ?? null,
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
  };
}

function safeJsonArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string") return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeJsonObject(v) {
  if (v && typeof v === "object" && !Array.isArray(v)) return v;
  if (typeof v !== "string") return {};
  try {
    const parsed = JSON.parse(v);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const BASE_SELECT = `
  SELECT p.*, c.slug AS category_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

// GET /api/products
router.get("/", async (_req, res) => {
  const rows = await query(`${BASE_SELECT} WHERE p.is_active = 1 ORDER BY p.created_at DESC`);
  res.json(rows.map(mapProduct));
});

// GET /api/products/featured
router.get("/featured", async (_req, res) => {
  const rows = await query(
    `${BASE_SELECT} WHERE p.is_active = 1 AND p.is_featured = 1 ORDER BY p.created_at DESC LIMIT 12`,
  );
  res.json(rows.map(mapProduct));
});

// GET /api/products/offers?limit=4
router.get("/offers", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const rows = await query(
    `${BASE_SELECT} WHERE p.is_active = 1 AND p.is_on_sale = 1 ORDER BY p.created_at DESC LIMIT ?`,
    [limit],
  );
  res.json(rows.map(mapProduct));
});

// GET /api/products/:slug  (برای صفحه‌ی جزئیات محصول در آینده — فرانت فعلاً از مودال با دیتای لیست استفاده می‌کند)
router.get("/:slug", async (req, res) => {
  const rows = await query(`${BASE_SELECT} WHERE p.slug = ? AND p.is_active = 1 LIMIT 1`, [req.params.slug]);
  if (rows.length === 0) return res.status(404).json({ message: "محصول یافت نشد." });
  res.json(mapProduct(rows[0]));
});

module.exports = router;
