-- Add discount/sale fields to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER;

-- Add payment tracking fields to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_track_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_ref_number TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Seed additional sample products (4 per category, some on sale)
INSERT INTO public.products (slug, category_id, name_fa, name_en, brand, description_fa, description_en, price_toman, compare_at_price_toman, stock, images, features, is_active, is_featured, is_on_sale, discount_percent)
SELECT * FROM (VALUES
  -- Dog
  ('dog-royal-adult-3kg', (SELECT id FROM public.categories WHERE slug='dog'), 'غذای خشک سگ بالغ رویال کنین ۳ کیلوگرم', 'Royal Canin Adult Dry Dog Food 3kg', 'Royal Canin', 'مناسب سگ‌های بالغ نژاد متوسط، غنی از پروتئین با کیفیت.', 'For medium adult dogs, high-quality protein.', 1450000, NULL, 20, ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800']::text[], '{"weight":"3kg","age":"adult"}'::jsonb, true, true, false, NULL),
  ('dog-puppy-pedigree-2kg', (SELECT id FROM public.categories WHERE slug='dog'), 'غذای توله سگ پدیگری ۲ کیلوگرم', 'Pedigree Puppy Food 2kg', 'Pedigree', 'مخصوص توله‌ها با کلسیم بالا برای رشد استخوان.', 'For puppies, high calcium for bone growth.', 780000, 950000, 30, ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800']::text[], '{"weight":"2kg","age":"puppy"}'::jsonb, true, false, true, 18),
  ('dog-wet-cesar-100g', (SELECT id FROM public.categories WHERE slug='dog'), 'کنسرو سگ سزار ۱۰۰ گرم', 'Cesar Wet Dog Food 100g', 'Cesar', 'وعده تر خوشمزه برای سگ‌های کوچک.', 'Delicious wet meal for small dogs.', 95000, NULL, 100, ARRAY['https://images.unsplash.com/photo-1585499583264-d55c0e12eae1?w=800']::text[], '{"weight":"100g"}'::jsonb, true, false, false, NULL),
  ('dog-bone-toy', (SELECT id FROM public.categories WHERE slug='dog'), 'اسباب‌بازی استخوانی سگ', 'Rubber Bone Dog Toy', 'PetPlay', 'اسباب‌بازی مقاوم برای جویدن.', 'Durable chew toy for dogs.', 320000, 420000, 40, ARRAY['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800']::text[], '{"material":"rubber"}'::jsonb, true, false, true, 24),
  -- Cat
  ('cat-whiskas-adult-2kg', (SELECT id FROM public.categories WHERE slug='cat'), 'غذای خشک گربه ویسکاس ۲ کیلوگرم', 'Whiskas Adult Cat Food 2kg', 'Whiskas', 'با طعم ماهی و مرغ برای گربه‌های بالغ.', 'Fish and chicken flavor for adult cats.', 620000, NULL, 50, ARRAY['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800']::text[], '{"weight":"2kg","flavor":"fish"}'::jsonb, true, true, false, NULL),
  ('cat-royal-kitten-1kg', (SELECT id FROM public.categories WHERE slug='cat'), 'غذای بچه گربه رویال کنین ۱ کیلوگرم', 'Royal Canin Kitten 1kg', 'Royal Canin', 'برای بچه گربه‌های ۴ تا ۱۲ ماه.', 'For kittens 4-12 months.', 890000, 1100000, 25, ARRAY['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800']::text[], '{"weight":"1kg","age":"kitten"}'::jsonb, true, false, true, 19),
  ('cat-litter-crystal-5l', (SELECT id FROM public.categories WHERE slug='cat'), 'خاک گربه کریستالی ۵ لیتری', 'Crystal Cat Litter 5L', 'CleanPaws', 'جذب بالا و بدون بو.', 'High absorption, odor-free.', 380000, NULL, 60, ARRAY['https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800']::text[], '{"volume":"5L"}'::jsonb, true, false, false, NULL),
  ('cat-scratcher-post', (SELECT id FROM public.categories WHERE slug='cat'), 'ستون خراش گربه', 'Cat Scratching Post', 'PurrHome', 'ستون خراش پارچه‌ای با پایه محکم.', 'Sisal scratching post with sturdy base.', 720000, 900000, 15, ARRAY['https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800']::text[], '{"height":"60cm"}'::jsonb, true, false, true, 20),
  -- Treats
  ('treat-dental-stick', (SELECT id FROM public.categories WHERE slug='treats'), 'استیک دندانی سگ', 'Dental Sticks for Dogs', 'DentaBite', 'برای بهداشت دهان و دندان سگ.', 'For dog dental hygiene.', 220000, NULL, 80, ARRAY['https://images.unsplash.com/photo-1585846888147-3fe14c130048?w=800']::text[], '{"pack":"7pcs"}'::jsonb, true, true, false, NULL),
  ('treat-cat-crunchy', (SELECT id FROM public.categories WHERE slug='treats'), 'تشویقی ترد گربه با طعم ماهی', 'Crunchy Cat Treats — Fish', 'MeowSnack', 'خوش‌طعم و کم‌کالری.', 'Tasty low-calorie cat treats.', 140000, 180000, 120, ARRAY['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800']::text[], '{"weight":"60g"}'::jsonb, true, false, true, 22),
  ('treat-jerky-chicken', (SELECT id FROM public.categories WHERE slug='treats'), 'ژرکی مرغ سگ', 'Chicken Jerky Dog Treats', 'PawJerky', 'گوشت مرغ خشک شده طبیعی.', 'Natural dried chicken jerky.', 340000, NULL, 45, ARRAY['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800']::text[], '{"weight":"150g"}'::jsonb, true, false, false, NULL),
  ('treat-training-bites', (SELECT id FROM public.categories WHERE slug='treats'), 'تشویقی آموزشی کوچک', 'Small Training Bites', 'ClickTreat', 'ایده‌آل برای تربیت سگ و گربه.', 'Ideal for training dogs and cats.', 165000, 210000, 100, ARRAY['https://images.unsplash.com/photo-1601758124331-63a2828697d0?w=800']::text[], '{"weight":"100g"}'::jsonb, true, false, true, 21)
) AS v(slug, category_id, name_fa, name_en, brand, description_fa, description_en, price_toman, compare_at_price_toman, stock, images, features, is_active, is_featured, is_on_sale, discount_percent)
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE products.slug = v.slug);