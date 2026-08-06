// routes/auth.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const { query, pool } = require("../config/db");
const { hashPassword, verifyPassword, hashOtp, generateOtp } = require("../utils/hash");
const { signAuthToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");
const { sendOtpSms } = require("../utils/sms");
const { requireAuth, attachUserIfPresent, verifyOrigin } = require("../middleware/auth");

const router = express.Router();

const PHONE_RE = /^09\d{9}$/;
const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "تعداد تلاش‌ها زیاد بود. کمی بعد دوباره امتحان کنید." },
});

const registerSchema = z.object({
  phone: z.string().regex(PHONE_RE, "شماره موبایل نامعتبر است."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد.").max(100),
});

const loginSchema = registerSchema;

const verifyOtpSchema = z.object({
  phone: z.string().regex(PHONE_RE),
  code: z.string().length(6),
});

const forgotSchema = z.object({
  phone: z.string().regex(PHONE_RE, "شماره موبایل نامعتبر است."),
});

const resetSchema = z.object({
  phone: z.string().regex(PHONE_RE),
  code: z.string().length(6),
  newPassword: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد.").max(100),
});

async function isAdminPhone(phone) {
  const rows = await query("SELECT phone FROM admin_phones WHERE phone = ? LIMIT 1", [phone]);
  return rows.length > 0;
}

async function issueOtp(phone, purpose) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  // یک شماره برای یک purpose فقط یک کد فعال دارد
  await query("DELETE FROM otp_codes WHERE phone = ? AND purpose = ?", [phone, purpose]);
  await query(
    "INSERT INTO otp_codes (phone, purpose, code_hash, expires_at, attempts) VALUES (?, ?, ?, ?, 0)",
    [phone, purpose, hashOtp(code), expiresAt],
  );
  await sendOtpSms(phone, code);
}

async function consumeOtp(phone, purpose, code) {
  const rows = await query(
    "SELECT id, code_hash, expires_at, attempts FROM otp_codes WHERE phone = ? AND purpose = ? ORDER BY id DESC LIMIT 1",
    [phone, purpose],
  );
  if (rows.length === 0) return { ok: false, reason: "کد یافت نشد. دوباره درخواست بدهید." };
  const row = rows[0];

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await query("DELETE FROM otp_codes WHERE id = ?", [row.id]);
    return { ok: false, reason: "کد منقضی شده است. دوباره درخواست بدهید." };
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await query("DELETE FROM otp_codes WHERE id = ?", [row.id]);
    return { ok: false, reason: "تعداد تلاش‌های مجاز تمام شد. دوباره درخواست بدهید." };
  }
  if (row.code_hash !== hashOtp(code)) {
    await query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
    return { ok: false, reason: "کد وارد‌شده نادرست است." };
  }

  await query("DELETE FROM otp_codes WHERE id = ?", [row.id]);
  return { ok: true };
}

// POST /api/auth/register
router.post("/register", authLimiter, verifyOrigin, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const { phone, password } = parsed.data;

  const existing = await query(
    "SELECT id, status FROM users WHERE phone = ? LIMIT 1",
    [phone],
  );
  if (existing.length > 0 && existing[0].status === "active") {
    return res.status(409).json({ message: "این شماره قبلاً ثبت‌نام کرده است." });
  }

  const passwordHash = hashPassword(password);

  if (existing.length > 0) {
    // ثبت‌نام قبلی ناتمام مانده — رمز را به‌روز و OTP جدید بفرست
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, existing[0].id]);
  } else {
    await query(
      "INSERT INTO users (phone, password_hash, status) VALUES (?, ?, 'pending')",
      [phone, passwordHash],
    );
  }

  try {
    await issueOtp(phone, "register");
  } catch (err) {
    console.error("sendOtpSms error", err);
    return res.status(502).json({ message: "ارسال پیامک ناموفق بود، دوباره تلاش کنید." });
  }

  res.status(201).json({ ok: true });
});

// POST /api/auth/verify-otp
router.post("/verify-otp", authLimiter, verifyOrigin, async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "ورودی نامعتبر است." });
  }
  const { phone, code } = parsed.data;

  const result = await consumeOtp(phone, "register", code);
  if (!result.ok) {
    return res.status(400).json({ message: result.reason });
  }

  const rows = await query("SELECT id, phone FROM users WHERE phone = ? LIMIT 1", [phone]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "کاربر یافت نشد." });
  }
  await query("UPDATE users SET status = 'active' WHERE id = ?", [rows[0].id]);

  const admin = await isAdminPhone(phone);
  const token = signAuthToken({ id: rows[0].id, phone, is_admin: admin });
  setAuthCookie(res, token);

  res.json({ ok: true, user: { id: rows[0].id, phone, is_admin: admin } });
});

// POST /api/auth/login
router.post("/login", authLimiter, verifyOrigin, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "شماره موبایل یا رمز عبور نامعتبر است." });
  }
  const { phone, password } = parsed.data;

  const rows = await query(
    "SELECT id, phone, password_hash, status FROM users WHERE phone = ? LIMIT 1",
    [phone],
  );
  if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
    return res.status(401).json({ message: "شماره موبایل یا رمز عبور اشتباه است." });
  }
  if (rows[0].status !== "active") {
    return res.status(403).json({ message: "حساب شما هنوز تایید نشده است." });
  }

  const admin = await isAdminPhone(phone);
  const token = signAuthToken({ id: rows[0].id, phone, is_admin: admin });
  setAuthCookie(res, token);

  res.json({ ok: true, user: { id: rows[0].id, phone, is_admin: admin } });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", authLimiter, verifyOrigin, async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const { phone } = parsed.data;

  const rows = await query("SELECT id FROM users WHERE phone = ? AND status = 'active' LIMIT 1", [phone]);
  // برای جلوگیری از فاش‌شدن وجود/عدم‌وجود شماره، همیشه پاسخ موفق برمی‌گردانیم؛
  // فقط در صورت وجود کاربر واقعاً پیامک ارسال می‌شود.
  if (rows.length > 0) {
    try {
      await issueOtp(phone, "reset");
    } catch (err) {
      console.error("sendOtpSms error", err);
    }
  }

  res.json({ ok: true });
});

// POST /api/auth/reset-password
router.post("/reset-password", authLimiter, verifyOrigin, async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." });
  }
  const { phone, code, newPassword } = parsed.data;

  const result = await consumeOtp(phone, "reset", code);
  if (!result.ok) {
    return res.status(400).json({ message: result.reason });
  }

  const rows = await query("SELECT id FROM users WHERE phone = ? LIMIT 1", [phone]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "کاربر یافت نشد." });
  }
  await query("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(newPassword), rows[0].id]);

  res.json({ ok: true });
});

// POST /api/auth/logout
router.post("/logout", verifyOrigin, (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", attachUserIfPresent, async (req, res) => {
  if (!req.user) return res.json({ user: null });

  const rows = await query(
    "SELECT id, phone, full_name FROM users WHERE id = ? LIMIT 1",
    [req.user.id],
  );
  if (rows.length === 0) return res.json({ user: null });

  res.json({
    user: {
      id: rows[0].id,
      phone: rows[0].phone,
      full_name: rows[0].full_name,
      is_admin: req.user.is_admin,
    },
  });
});

module.exports = router;
