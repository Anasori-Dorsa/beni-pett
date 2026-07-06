-- Enrich Persian/English descriptions and add images for the 6 legacy products that were missing them
UPDATE public.products SET
  description_fa = 'غذای کامل و متعادل مخصوص توله‌سگ‌های در حال رشد، سرشار از پروتئین تازه مرغ، DHA برای رشد مغز و کلسیم برای استخوان‌های قوی. بدون غلات و طعم‌دهنده مصنوعی.',
  description_en = 'Complete puppy food packed with fresh chicken protein, DHA for brain development and calcium for strong bones. Grain-free, no artificial flavours.',
  images = ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800']
WHERE slug = 'origen-puppy';

UPDATE public.products SET
  description_fa = 'غذای خشک گربه بالغ با ترکیب متعادل پروتئین و فیبر، مناسب برای گربه‌های خانگی. حاوی تورین برای سلامت قلب و بینایی، همراه با اسیدهای چرب امگا-۳ برای درخشش موها.',
  description_en = 'Balanced adult cat kibble with taurine for heart & vision health, plus omega-3 fatty acids for a shiny coat.',
  images = ARRAY['https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800']
WHERE slug = 'feline-adult';

UPDATE public.products SET
  description_fa = 'فرمول ویژه برای گربه‌های عقیم‌شده با کالری کنترل‌شده، ال-کارنیتین برای سوزاندن چربی و PH متعادل برای پیشگیری از سنگ ادراری.',
  description_en = 'Special formula for sterilised cats with controlled calories, L-carnitine for fat burn and balanced urinary pH.',
  images = ARRAY['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800']
WHERE slug = 'purely-sterilized';

UPDATE public.products SET
  description_fa = 'تشویقی نرم و خوش‌طعم با گوشت گاو تازه، بدون رنگ و طعم‌دهنده مصنوعی. مناسب برای آموزش و پاداش سگ در هر سنی.',
  description_en = 'Soft, tasty training treats with real beef. No artificial colours or flavours. Perfect for reward-based training.',
  images = ARRAY['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800']
WHERE slug = 'beni-bites-beef';

UPDATE public.products SET
  description_fa = 'تشویقی گربه با سالمون خالص اقیانوس اطلس، غنی از امگا-۳ برای پوست و موی سالم. ترد و ملایم برای معده حساس.',
  description_en = 'Cat treats made with pure Atlantic salmon, rich in omega-3 for skin and coat health. Crunchy yet gentle on sensitive tummies.',
  images = ARRAY['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800']
WHERE slug = 'beni-bites-salmon';

UPDATE public.products SET
  description_fa = 'غذای پرمیوم سگ بالغ نژاد متوسط، با مرغ تازه، برنج قهوه‌ای و سبزیجات. تقویت‌کننده سیستم ایمنی و گوارش، مناسب سگ‌های ۱۱ تا ۲۵ کیلوگرم.',
  description_en = 'Premium adult dog food for medium breeds (11-25kg) with fresh chicken, brown rice and vegetables. Supports digestion and immunity.',
  images = ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800']
WHERE slug = 'royal-adult-medium';

-- Also lengthen the shorter descriptions from the seeded batch
UPDATE public.products SET description_fa = 'تشویقی کوچک و کم‌کالری، ایده‌آل برای جلسات آموزشی طولانی. طعم مرغ و جگر که هیچ سگی نمی‌تواند در برابرش مقاومت کند.' WHERE slug = 'treat-training-bites' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'غذای مخصوص بچه‌گربه‌های ۲ تا ۱۲ ماه، سرشار از پروتئین حیوانی، DHA و آنتی‌اکسیدان‌ها برای رشد سالم و سیستم ایمنی قوی.' WHERE slug = 'cat-royal-kitten-1kg' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'خاک کریستالی سیلیکاژل با جذب فوق‌العاده رطوبت و بو، بدون گرد و غبار و کاملا بهداشتی. ماندگاری تا ۳۰ روز.' WHERE slug = 'cat-litter-crystal-5l' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'ستون خراش با پایه چوبی محکم و روکش طنابی طبیعی. مناسب برای حفظ سلامت پنجه‌های گربه و جلوگیری از خراش مبلمان.' WHERE slug = 'cat-scratcher-post' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'استیک دندانی روزانه برای پیشگیری از پلاک و جرم دندان سگ. با بافت مخصوص که هنگام جویدن دندان‌ها را تمیز می‌کند.' WHERE slug = 'treat-dental-stick' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'ژرکی نرم با گوشت خالص مرغ، بدون گلوتن و شکر. تشویقی سالم و پرپروتئین برای سگ‌های فعال.' WHERE slug = 'treat-jerky-chicken' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'کنسرو نرم و آبدار با تکه‌های گوشت گاو در سس مخصوص. ایده‌آل برای سگ‌های بدغذا و بزرگسال.' WHERE slug = 'dog-wet-cesar-100g' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'اسباب‌بازی طبیعی از جنس نایلون مقاوم به شکل استخوان، مناسب برای جویدن طولانی و کاهش استرس سگ.' WHERE slug = 'dog-bone-toy' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'غذای خشک متعادل برای گربه‌های بزرگسال با گوشت مرغ و غلات کامل. تقویت گوارش و مناسب مصرف روزانه.' WHERE slug = 'cat-whiskas-adult-2kg' AND length(description_fa) < 50;
UPDATE public.products SET description_fa = 'تشویقی ترد با طعم ماهی سالمون و ویتامین‌های مورد نیاز گربه، ایده‌آل برای پاداش و آموزش.' WHERE slug = 'treat-cat-crunchy' AND length(description_fa) < 50;