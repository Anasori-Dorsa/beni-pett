// routes/reviews.js
const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const { query, pool } = require("../config/db");
const { requireAuth, attachUserIfPresent, verifyOrigin } = require("../middleware/auth");

const router = express.Router();

function maskPhone(phone) {
  if (!phone || phone.length < 4) return "کاربر";
  return `کاربر ${phone.slice(-4)}`;
}

function mapReview(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    parent_id: row.parent_id,
    content: row.content,
    rating: row.rating == null ? null : Number(row.rating),
    author_name: row.full_name || maskPhone(row.phone),
    author_avatar: row.avatar_url || null,
    created_at: row.created_at,
  };
}

const BASE_SELECT = `
  SELECT r.*, u.full_name, u.phone, u.avatar_url
  FROM reviews r
  JOIN users u ON u.id = r.user_id
`;

// GET /api/reviews?productId=...            -> نظرات یک محصول خاص
// GET /api/reviews                          -> نظرات سراسری سایت (product_id IS NULL)
// GET /api/reviews?rootsOnly=1&limit=4       -> فقط نظرات ریشه (بدون پاسخ)، برای بخش تستیمونیال صفحه‌ی اصلی
router.get("/", attachUserIfPresent, async (req, res) => {
  const { productId, rootsOnly, limit } = req.query;

  const where = ["r.status = 'approved'"];
  const params = [];

  if (productId) {
    where.push("r.product_id = ?");
    params.push(String(productId));
  } else if (rootsOnly) {
    // برای تستیمونیال صفحه‌ی اصلی: نظرات سراسری (product_id IS NULL) با امتیاز
    where.push("r.product_id IS NULL");
  } else {
    where.push("r.product_id IS NULL");
  }

  if (rootsOnly) {
    where.push("r.parent_id IS NULL");
  }

  let sql = `${BASE_SELECT} WHERE ${where.join(" AND ")} ORDER BY r.created_at DESC`;
  if (rootsOnly) {
    const lim = Math.min(Math.max(Number(limit) || 10, 1), 50);
    sql += ` LIMIT ${lim}`;
  }

  const rows = await query(sql, params);
  res.json(rows.map(mapReview));
});

const postSchema = z.object({
  product_id: z.string().min(1).nullable().optional(),
  parent_id: z.string().min(1).nullable().optional(),
  content: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
});

// POST /api/reviews
router.post("/", verifyOrigin, requireAuth, async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const { product_id, parent_id, content, rating } = parsed.data;

  if (parent_id) {
    const parentRows = await query("SELECT id FROM reviews WHERE id = ? LIMIT 1", [parent_id]);
    if (parentRows.length === 0) {
      return res.status(400).json({ message: "نظر مرجع یافت نشد." });
    }
  }

  const id = crypto.randomUUID();
  await query(
    `INSERT INTO reviews (id, user_id, product_id, parent_id, content, rating, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [id, req.user.id, product_id || null, parent_id || null, content, parent_id ? null : (rating || null)],
  );

  res.status(201).json({ ok: true, id, status: "pending" });
});

// DELETE /api/reviews/:id  — فقط صاحب نظر یا ادمین
router.delete("/:id", verifyOrigin, requireAuth, async (req, res) => {
  const rows = await query("SELECT user_id FROM reviews WHERE id = ? LIMIT 1", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: "نظر یافت نشد." });
  if (rows[0].user_id !== req.user.id && !req.user.is_admin) {
    return res.status(403).json({ message: "اجازه‌ی حذف این نظر را ندارید." });
  }
  // حذف زنجیره‌ای پاسخ‌های زیرمجموعه هم انجام می‌شود
  await query("DELETE FROM reviews WHERE id = ? OR parent_id = ?", [req.params.id, req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
