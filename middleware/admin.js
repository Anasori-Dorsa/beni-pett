// middleware/admin.js
// همیشه بعد از requireAuth استفاده شود.
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "ابتدا وارد حساب خود شوید." });
  }
  if (!req.user.is_admin) {
    return res.status(403).json({ message: "دسترسی ادمین لازم است." });
  }
  next();
}

module.exports = { requireAdmin };
