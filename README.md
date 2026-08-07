# راه‌اندازی بنی‌پت روی Localhost — راهنمای کامل

این راهنما فرض می‌کنه شما با خط فرمان آشنایی کمی دارید ولی برنامه‌نویس حرفه‌ای نیستید.
هر دستور رو دقیقاً همون‌طور که نوشته شده کپی و اجرا کنید.

## پیش‌نیازها

نصب این سه مورد لازمه (اگه از قبل دارید، رد بشید):

1. **Node.js نسخه ۲۲** — از https://nodejs.org دانلود کنید (نسخه‌ی LTS).
2. **MySQL نسخه ۸ یا بالاتر** — از https://dev.mysql.com/downloads/mysql یا اگه راحت‌ترید، از طریق
   [XAMPP](https://www.apachefriends.org) (شامل MySQL + رابط گرافیکی phpMyAdmin) نصب کنید.
3. **Git** (اختیاری، فقط اگه پروژه رو از گیت‌هاب clone می‌کنید).

بررسی نصب صحیح Node:
```bash
node -v
# باید چیزی شبیه v22.x.x نشون بده
```

---

## گام ۱ — ساخت دیتابیس

وارد MySQL بشید (یا با خط فرمان یا با phpMyAdmin) و این دستور رو اجرا کنید:

```sql
CREATE DATABASE beni_pett CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'beni_pett_user'@'localhost' IDENTIFIED BY 'یک_رمز_قوی_انتخاب_کنید';
GRANT ALL PRIVILEGES ON beni_pett.* TO 'beni_pett_user'@'localhost';
FLUSH PRIVILEGES;
```

سپس جدول‌ها و داده‌ی نمونه رو وارد کنید:

```bash
mysql -u beni_pett_user -p beni_pett < sql/schema.sql
```

(رمزی که بالا انتخاب کردید رو موقع پرسیدن وارد کنید.)

اگه درست اجرا شده باشه، جدول‌هایی مثل `users`، `products`، `orders` و... ساخته شدن و چند محصول نمونه هم توش هست.

---

## گام ۲ — راه‌اندازی بک‌اند

```bash
cd beni-pett-backend
npm install
cp .env.example .env
```

فایل `.env` رو با ادیتور متنی (VS Code، Notepad و...) باز کنید و این مقادیر رو اصلاح کنید:

- `DB_USER` و `DB_PASSWORD` = همون یوزر/رمزی که در گام ۱ ساختید
- `JWT_SECRET` = یه رشته‌ی طولانی تصادفی. می‌تونید با این دستور بسازیدش:
```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
  خروجی رو کپی کنید و جلوی `JWT_SECRET=` بذارید.
- بقیه‌ی مقادیر (`SMS_MODE=dev`, `ZIBAL_MERCHANT=zibal`, `CAPTCHA_ENABLED=false`, آدرس‌های localhost) رو دست نزنید — برای تست لوکال همینطوری کار می‌کنن.

حالا بک‌اند رو اجرا کنید:

```bash
npm run dev
```

باید ببینید: `Beni Pett backend listening on port 4000`

برای تست سریع، این آدرس رو تو مرورگر باز کنید: `http://localhost:4000/health` — باید `{"ok":true}` ببینید.

**این ترمینال رو باز نگه دارید** — بک‌اند باید همیشه در حال اجرا باشه.

---

## گام ۳ — راه‌اندازی فرانت‌اند

یک ترمینال **جدید** باز کنید (بدون بستن ترمینال بک‌اند):

```bash
cd tanstack_start_ts   # یا هر اسمی که پوشه‌ی فرانت‌اند داره
npm install
cp .env.example .env
```

فایل `.env` فرانت رو باز کنید و مطمئن بشید:
