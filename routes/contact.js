// routes/contact.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const { z } = require("zod");
const { query } = require("../config/db");
const { verifyOrigin } = require("../middleware/auth");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "تعداد پیام‌های ارسالی زیاد بود. کمی بعد دوباره تلاش کنید." },
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).nullable().optional().or(z.literal("")),
  phone: z.string().trim().max(30).nullable().optional().or(z.literal("")),
  subject: z.string().trim().max(200).nullable().optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

// POST /api/contact
// نکته: هانی‌پات و تاخیر زمانی سمت فرانت (contact.tsx) چک می‌شود؛ اینجا فقط
// rate-limit سمت IP و جلوگیری از ارسال کاملاً تکراری (ضد اسپم دوم، مستقل از فرانت) هست.
router.post("/", contactLimiter, verifyOrigin, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const { name, email, phone, subject, message } = parsed.data;

  // ضد تکرار: اگه دقیقاً همین پیام از همین ایمیل/تلفن در ۲ دقیقه‌ی اخیر ثبت شده، رد کن
  const dupeCheckValue = email || phone;
  if (dupeCheckValue) {
    const recent = await query(
      `SELECT id FROM contact_messages
       WHERE (email = ? OR phone = ?) AND message = ? AND created_at > (NOW() - INTERVAL 2 MINUTE)
       LIMIT 1`,
      [email || null, phone || null, message],
    );
    if (recent.length > 0) {
      return res.status(429).json({ message: "این پیام قبلاً ثبت شده است." });
    }
  }

  const id = crypto.randomUUID();
  await query(
    `INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [id, name, email || null, phone || null, subject || null, message],
  );

  res.status(201).json({ ok: true });
});

module.exports = router;
