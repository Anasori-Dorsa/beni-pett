// utils/hash.js
// رمزهای عبور با scrypt داخلی Node هش می‌شوند (بدون نیاز به پکیج native جدا مثل bcrypt).
const crypto = require("crypto");

const KEY_LEN = 64;

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(plain, salt, KEY_LEN).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const derived = crypto.scryptSync(plain, salt, KEY_LEN);
  const stored_buf = Buffer.from(hash, "hex");
  if (stored_buf.length !== derived.length) return false;
  return crypto.timingSafeEqual(stored_buf, derived);
}

// برای کد OTP فقط هش ساده (نیازی به scrypt سنگین نیست، عمر کد چند دقیقه‌ست)
function hashOtp(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000)); // 6 رقمی
}

module.exports = { hashPassword, verifyPassword, hashOtp, generateOtp };
