-- sql/schema.sql
-- Beni Pett — MySQL 8+ recommended (InnoDB, utf8mb4)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================================
-- کاربران
-- ==========================================================
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  phone         VARCHAR(11)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  full_name     VARCHAR(150)  NULL,
  avatar_url    VARCHAR(500)  NULL,
  status        ENUM('pending','active') NOT NULL DEFAULT 'pending',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- کدهای OTP (ثبت‌نام و بازیابی رمز)
CREATE TABLE IF NOT EXISTS otp_codes (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone       VARCHAR(11)  NOT NULL,
  purpose     ENUM('register','reset') NOT NULL,
  code_hash   CHAR(64)     NOT NULL,
  expires_at  DATETIME     NOT NULL,
  attempts    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_phone_purpose (phone, purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- شماره‌های ادمین
CREATE TABLE IF NOT EXISTS admin_phones (
  phone      VARCHAR(11) NOT NULL PRIMARY KEY,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- دسته‌بندی‌ها و محصولات
-- ==========================================================
CREATE TABLE IF NOT EXISTS categories (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  name_fa    VARCHAR(150) NOT NULL,
  name_en    VARCHAR(150) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id                      CHAR(36)      NOT NULL PRIMARY KEY,
  slug                    VARCHAR(200)  NOT NULL UNIQUE,
  category_id             CHAR(36)      NULL,
  name_fa                 VARCHAR(255)  NOT NULL,
  name_en                 VARCHAR(255)  NOT NULL,
  brand                   VARCHAR(120)  NULL,
  description_fa          TEXT          NULL,
  description_en          TEXT          NULL,
  price_toman             DECIMAL(12,0) NOT NULL,
  compare_at_price_toman  DECIMAL(12,0) NULL,
  stock                   INT           NOT NULL DEFAULT 0,
  images                  JSON          NULL,
  features                JSON          NULL,
  is_active               TINYINT(1)    NOT NULL DEFAULT 1,
  is_featured             TINYINT(1)    NOT NULL DEFAULT 0,
  is_on_sale              TINYINT(1)    NOT NULL DEFAULT 0,
  discount_percent        INT           NULL,
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- سفارش‌ها
-- ==========================================================
CREATE TABLE IF NOT EXISTS orders (
  id                CHAR(36)      NOT NULL PRIMARY KEY,
  user_id           CHAR(36)      NOT NULL,
  full_name         VARCHAR(100)  NOT NULL,
  phone             VARCHAR(30)   NOT NULL,
  address           VARCHAR(500)  NOT NULL,
  city              VARCHAR(100)  NOT NULL,
  postal_code       VARCHAR(20)   NULL,
  notes             VARCHAR(500)  NULL,
  status            ENUM('pending','paid','processing','shipped','delivered','cancelled')
                    NOT NULL DEFAULT 'pending',
  subtotal_toman    DECIMAL(12,0) NOT NULL,
  shipping_toman    DECIMAL(12,0) NOT NULL,
  total_toman       DECIMAL(12,0) NOT NULL,
  zibal_track_id    VARCHAR(50)   NULL,
  zibal_ref_number  VARCHAR(50)   NULL,
  paid_at           DATETIME      NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_track (zibal_track_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id                CHAR(36)      NOT NULL PRIMARY KEY,
  order_id          CHAR(36)      NOT NULL,
  product_id        CHAR(36)      NULL,
  product_name      VARCHAR(255)  NOT NULL,
  quantity          INT           NOT NULL,
  unit_price_toman  DECIMAL(12,0) NOT NULL,
  INDEX idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- نظرات
-- ==========================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          CHAR(36)  NOT NULL PRIMARY KEY,
  user_id     CHAR(36)  NOT NULL,
  product_id  CHAR(36)  NULL,   -- NULL = نظر سراسری سایت (نه مربوط به یک محصول خاص)
  parent_id   CHAR(36)  NULL,   -- برای پاسخ به یک نظر
  content     TEXT      NOT NULL,
  rating      TINYINT   NULL,   -- فقط برای نظرات ریشه معنا دارد
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_product (product_id),
  INDEX idx_reviews_parent (parent_id),
  INDEX idx_reviews_status (status),
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_parent FOREIGN KEY (parent_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- پیام‌های تماس
-- ==========================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NULL,
  phone       VARCHAR(30)  NULL,
  subject     VARCHAR(200) NULL,
  message     TEXT         NOT NULL,
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- SEED DATA
-- ==========================================================

-- ادمین اولیه
INSERT INTO admin_phones (phone) VALUES ('09397194643')
  ON DUPLICATE KEY UPDATE phone = phone;

-- دسته‌بندی‌ها
INSERT INTO categories (id, slug, name_fa, name_en, sort_order) VALUES
  ('c1a1a1a1-0000-0000-0000-000000000001', 'dog-food',  'غذای سگ',   'Dog Food', 1),
  ('c1a1a1a1-0000-0000-0000-000000000002', 'cat-food',  'غذای گربه', 'Cat Food', 2),
  ('c1a1a1a1-0000-0000-0000-000000000003', 'treats',    'تشویقی',    'Treats',   3)
  ON DUPLICATE KEY UPDATE slug = slug;

-- محصولات
-- توجه: فیلد images عمداً خالی (NULL) گذاشته شده. فرانت‌اند از قبل یک fallback محلی
-- بر اساس category_slug/slug دارد (product-dog.jpg / product-cat.jpg / product-treats.jpg
-- در src/assets)، پس تا وقتی از پنل ادمین عکس واقعی آپلود نکرده‌اید، محصولات خالی نمی‌مانند.
INSERT INTO products
  (id, slug, category_id, name_fa, name_en, brand, description_fa, description_en,
   price_toman, compare_at_price_toman, stock, images, features,
   is_active, is_featured, is_on_sale, discount_percent)
VALUES
  ('p1000000-0000-0000-0000-000000000001', 'royal-canin-adult-dog',
   'c1a1a1a1-0000-0000-0000-000000000001',
   'غذای خشک سگ بزرگسال رویال کنین', 'Royal Canin Adult Dog Food', 'Royal Canin',
   'غذای خشک کامل و متعادل برای سگ‌های بزرگسال نژاد متوسط.',
   'Complete and balanced dry food for adult medium-breed dogs.',
   1250000, NULL, 24, NULL, JSON_OBJECT('weight', '3kg', 'age', 'Adult'),
   1, 1, 0, NULL),

  ('p1000000-0000-0000-0000-000000000002', 'purina-puppy-chow',
   'c1a1a1a1-0000-0000-0000-000000000001',
   'غذای خشک توله‌سگ پیورینا', 'Purina Puppy Chow', 'Purina',
   'فرمول ویژه‌ی رشد برای توله‌سگ‌های زیر یک سال.',
   'Special growth formula for puppies under one year.',
   890000, 990000, 15, NULL, JSON_OBJECT('weight', '2kg', 'age', 'Puppy'),
   1, 0, 1, 10),

  ('p1000000-0000-0000-0000-000000000003', 'whiskas-adult-cat',
   'c1a1a1a1-0000-0000-0000-000000000002',
   'غذای خشک گربه بزرگسال ویسکاس', 'Whiskas Adult Cat Food', 'Whiskas',
   'طعم ماهی، مناسب گربه‌های بالای یک سال.',
   'Fish flavor, suitable for cats over one year.',
   650000, NULL, 30, NULL, JSON_OBJECT('weight', '1.5kg', 'flavor', 'Fish'),
   1, 1, 0, NULL),

  ('p1000000-0000-0000-0000-000000000004', 'felix-salmon-wet-food',
   'c1a1a1a1-0000-0000-0000-000000000002',
   'کنسرو گربه فلیکس طعم سالمون', 'Felix Salmon Wet Food', 'Felix',
   'کنسرو مرطوب با تکه‌های واقعی سالمون در سس.',
   'Wet food with real salmon chunks in gravy.',
   180000, 220000, 40, NULL, JSON_OBJECT('weight', '85g', 'flavor', 'Salmon'),
   1, 0, 1, 18),

  ('p1000000-0000-0000-0000-000000000005', 'pedigree-dentastix',
   'c1a1a1a1-0000-0000-0000-000000000003',
   'تشویقی دندانی سگ پدیگری', 'Pedigree Dentastix', 'Pedigree',
   'به کاهش جرم دندان و بوی بد دهان سگ کمک می‌کند.',
   'Helps reduce tartar buildup and bad breath.',
   320000, NULL, 50, NULL, JSON_OBJECT('count', '7 pcs'),
   1, 0, 0, NULL),

  ('p1000000-0000-0000-0000-000000000006', 'catit-cat-treats',
   'c1a1a1a1-0000-0000-0000-000000000003',
   'تشویقی کریمی گربه کتیت', 'Catit Creamy Cat Treats', 'Catit',
   'تشویقی کریمی مکمل، سرشار از تورین.',
   'Creamy supplement treat, rich in taurine.',
   150000, NULL, 60, NULL, JSON_OBJECT('count', '4 tubes'),
   1, 1, 0, NULL)
  ON DUPLICATE KEY UPDATE slug = slug;
