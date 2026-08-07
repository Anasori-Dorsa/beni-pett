// routes/admin-admins.js
// مدیریت شماره‌های ادمین (admin_phones). فرانت‌اند فعلی UI برای این بخش نداره،
// اما طبق مشخصات اولیه اضافه شده — از طریق ابزارهایی مثل curl/Postman هم قابل استفاده‌ست
// تا ادمین‌های بعدی رو بدون دسترسی مستقیم به دیتابیس اضافه/حذف کنید.
const express = require("express");
const { z } = require("zod");
const { query } = require("../config/db");
const { requireAuth, verifyOrigin } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

const router = express.Router();
router.use(verifyOrigin, requireAuth, requireAdmin);

const PHONE_RE = /^09\d{9}$/;

// GET /api/admin/admins
router.get("/", async (_req, res) => {
  const rows = await query("SELECT phone, created_at FROM admin_phones ORDER BY created_at ASC");
  res.json(rows);
});

const schema = z.object({ phone: z.string().regex(PHONE_RE, "شماره موبایل نامعتبر است.") });

// POST /api/admin/admins
router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message });
  const existing = await query("SELECT phone FROM admin_phones WHERE phone = ? LIMIT 1", [parsed.data.phone]);
  if (existing.length > 0) return res.status(409).json({ message: "این شماره از قبل ادمین است." });
  await query("INSERT INTO admin_phones (phone) VALUES (?)", [parsed.data.phone]);
  res.status(201).json({ ok: true });
});

// DELETE /api/admin/admins/:phone
router.delete("/:phone", async (req, res) => {
  if (req.params.phone === req.user.phone) {
    return res.status(400).json({ message: "نمی‌توانید دسترسی ادمین خودتان را حذف کنید." });
  }
  await query("DELETE FROM admin_phones WHERE phone = ?", [req.params.phone]);
  res.json({ ok: true });
});

module.exports = router;
