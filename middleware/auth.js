// middleware/auth.js
const { verifyAuthToken, COOKIE_NAME } = require("../utils/jwt");

// درخواست‌های تغییردهنده‌ی وضعیت باید از همون Origin مجاز بیایند (CSRF ساده مبتنی بر Origin).
function verifyOrigin(req, res, next) {
  const allowed = process.env.CORS_ORIGIN;
  const origin = req.headers.origin;
  // برای درخواست‌های same-site بدون هدر Origin (مثل curl تست دستی سمت سرور) عبور می‌دیم،
  // اما هر درخواست مرورگری cross-origin باید Origin مطابق را داشته باشد.
  if (origin && allowed && origin !== allowed) {
    return res.status(403).json({ message: "درخواست نامعتبر (Origin)." });
  }
  next();
}

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyAuthToken(token) : null;
  if (!payload) {
    return res.status(401).json({ message: "ابتدا وارد حساب خود شوید." });
  }
  req.user = { id: payload.sub, phone: payload.phone, is_admin: !!payload.is_admin };
  next();
}

// برای مسیرهایی مثل /me یا نظرات که هم کاربر مهمان هم لاگین‌شده مجازند
function attachUserIfPresent(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyAuthToken(token) : null;
  req.user = payload
    ? { id: payload.sub, phone: payload.phone, is_admin: !!payload.is_admin }
    : null;
  next();
}

module.exports = { requireAuth, attachUserIfPresent, verifyOrigin };
