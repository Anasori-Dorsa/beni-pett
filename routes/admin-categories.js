// routes/admin-categories.js
const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const { query } = require("../config/db");
const { requireAuth, verifyOrigin } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const router = express.Router();
router.use(verifyOrigin, requireAuth, requireAdmin);

// GET /api/admin/categories
router.get("/", async (_req, res) => {
  const rows = await query("SELECT * FROM categories ORDER BY sort_order ASC, id ASC");
  res.json(rows);
});

const schema = z.object({
  slug: z.string().trim().min(1).max(100),
  name_fa: z.string().trim().min(1).max(150),
  name_en: z.string().trim().min(1).max(150),
  sort_order: z.number().int().default(0),
});

// POST /api/admin/categories
router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const d = parsed.data;
  const dupe = await query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [d.slug]);
  if (dupe.length > 0) return res.status(409).json({ message: "این slug قبلاً استفاده شده است." });

  const id = crypto.randomUUID();
  await query(
    "INSERT INTO categories (id, slug, name_fa, name_en, sort_order) VALUES (?, ?, ?, ?, ?)",
    [id, d.slug, d.name_fa, d.name_en, d.sort_order],
  );
  res.status(201).json({ id });
});

// PUT /api/admin/categories/:id
router.put("/:id", async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const d = parsed.data;
  const existing = await query("SELECT id FROM categories WHERE id = ? LIMIT 1", [req.params.id]);
  if (existing.length === 0) return res.status(404).json({ message: "دسته‌بندی یافت نشد." });

  const fields = [];
  const values = [];
  for (const key of ["slug", "name_fa", "name_en", "sort_order"]) {
    if (Object.prototype.hasOwnProperty.call(d, key)) {
      fields.push(`${key} = ?`);
      values.push(d[key]);
    }
  }
  if (fields.length === 0) return res.json({ ok: true });
  values.push(req.params.id);
  await query(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`, values);
  res.json({ ok: true });
});

// DELETE /api/admin/categories/:id  — محصولات مرتبط unlink می‌شوند نه حذف
router.delete("/:id", async (req, res) => {
  await query("UPDATE products SET category_id = NULL WHERE category_id = ?", [req.params.id]);
  await query("DELETE FROM categories WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
