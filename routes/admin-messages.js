// routes/admin-messages.js
const express = require("express");
const { z } = require("zod");
const { query } = require("../config/db");
const { requireAuth, verifyOrigin } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const router = express.Router();
router.use(verifyOrigin, requireAuth, requireAdmin);

// GET /api/admin/messages
router.get("/", async (_req, res) => {
  const rows = await query("SELECT * FROM contact_messages ORDER BY created_at DESC");
  res.json(rows);
});

const schema = z.object({ is_read: z.boolean() });

// PUT /api/admin/messages/:id
router.put("/:id", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "ورودی نامعتبر است." });
  await query("UPDATE contact_messages SET is_read = ? WHERE id = ?", [parsed.data.is_read ? 1 : 0, req.params.id]);
  res.json({ ok: true });
});

// DELETE /api/admin/messages/:id
router.delete("/:id", async (req, res) => {
  await query("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
