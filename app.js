// app.js
require("express-async-errors"); // خطاهای async در روت‌ها را خودکار به error handler پایین فایل می‌رساند
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const ordersRoutes = require("./routes/orders");
const publicZibalRoutes = require("./routes/public-zibal");
const reviewsRoutes = require("./routes/reviews");
const contactRoutes = require("./routes/contact");
const adminProductsRoutes = require("./routes/admin-products");
const adminCategoriesRoutes = require("./routes/admin-categories");
const adminOrdersRoutes = require("./routes/admin-orders");
const adminMessagesRoutes = require("./routes/admin-messages");
const adminAdminsRoutes = require("./routes/admin-admins");

const app = express();

// پشت هر ریورس‌پروکسی (Nginx و امثالش) اجرا می‌شود؛ برای اینکه IP واقعی کاربر
// به express-rate-limit برسد نه IP خود پروکسی.
app.set("trust proxy", 1);

const allowedOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: allowedOrigin || false, // اگر تنظیم نشده باشد، هیچ originی مجاز نیست (fail-closed)
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// فایل‌های آپلودشده (عکس محصولات) به‌صورت استاتیک سرو می‌شوند
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/public/zibal", publicZibalRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/admin/categories", adminCategoriesRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/messages", adminMessagesRoutes);
app.use("/api/admin/admins", adminAdminsRoutes);

// 404 برای هر مسیر تعریف‌نشده
app.use((_req, res) => {
  res.status(404).json({ message: "مسیر یافت نشد." });
});

// error handler نهایی — چه خطای همزمان چه async (به‌لطف express-async-errors) اینجا می‌رسد
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return;
  res.status(500).json({ message: "خطای غیرمنتظره‌ی سرور." });
});

module.exports = app;
