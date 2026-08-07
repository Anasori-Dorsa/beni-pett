// routes/admin-orders.js
const express = require("express");
const { z } = require("zod");
const { pool } = require("../config/db");
const { requireAuth, verifyOrigin } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const router = express.Router();
router.use(verifyOrigin, requireAuth, requireAdmin);

const VALID_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

// GET /api/admin/orders
router.get("/", async (_req, res) => {
  const conn = await pool.getConnection();
  try {
    const [orders] = await conn.query("SELECT * FROM orders ORDER BY created_at DESC");
    for (const o of orders) {
      const [items] = await conn.query("SELECT * FROM order_items WHERE order_id = ?", [o.id]);
      o.order_items = items;
    }
    res.json(orders);
  } finally {
    conn.release();
  }
});

const statusSchema = z.object({ status: z.enum(VALID_STATUSES) });

// PUT /api/admin/orders/:id
router.put("/:id", async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "وضعیت نامعتبر است." });
  }
  const existing = await pool.query("SELECT id FROM orders WHERE id = ? LIMIT 1", [req.params.id]);
  if (existing[0].length === 0) return res.status(404).json({ message: "سفارش یافت نشد." });

  await pool.query("UPDATE orders SET status = ? WHERE id = ?", [parsed.data.status, req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
