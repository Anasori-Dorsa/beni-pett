import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PawScatter } from "@/components/pet-decorations";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "قوانین و مقررات — بنی‌پت" },
      { name: "description", content: "قوانین و مقررات استفاده از فروشگاه بنی‌پت." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { lang } = useI18n();
  const fa = lang === "fa";
  return (
    <main>
      <section className="container-page pt-16 pb-6 relative overflow-hidden">
        <PawScatter paws={[{ top: "10%", right: "3%", rot: 20, size: 22 }]} />
        <div className="max-w-2xl relative">
          <div className="text-xs uppercase tracking-widest text-clay">
            {fa ? "قوانین" : "Terms"}
          </div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-espresso">
            {fa ? "قوانین و مقررات" : "Terms & Conditions"}
          </h1>
        </div>
      </section>
      <section className="container-page pb-24 max-w-3xl text-espresso leading-relaxed space-y-6">
        {fa ? (
          <>
            <h2 className="font-display text-2xl text-espresso mt-4">۱. پذیرش قوانین</h2>
            <p>
              با ثبت سفارش در بنی‌پت، شما این قوانین و مقررات را می‌پذیرید. لطفاً پیش از خرید
              این صفحه را مطالعه کنید.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۲. ثبت سفارش و پرداخت</h2>
            <p>
              سفارش شما پس از تایید پرداخت موفق از طریق درگاه زیبال ثبت نهایی می‌شود. قیمت‌ها
              به تومان و شامل مالیات بر ارزش افزوده (در صورت وجود) هستند.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۳. ارسال کالا</h2>
            <p>
              زمان تحویل بسته به شهر مقصد متفاوت است و پس از ثبت سفارش به شما اطلاع داده می‌شود.
              هزینه‌ی ارسال برای سفارش‌های بالای ۱٬۰۰۰٬۰۰۰ تومان رایگان است.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۴. مسئولیت محصول</h2>
            <p>
              بنی‌پت تلاش می‌کند اطلاعات محصولات (ترکیبات، وزن، تاریخ انقضا) را دقیق نمایش دهد،
              اما مسئولیت نهایی بررسی مناسب بودن محصول برای حیوان خانگی شما بر عهده‌ی خریدار است.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۵. تغییر قوانین</h2>
            <p>بنی‌پت حق تغییر این قوانین را در هر زمان برای خود محفوظ می‌دارد.</p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl text-espresso mt-4">1. Acceptance of terms</h2>
            <p>By placing an order with Beni Pett, you agree to these terms. Please read this page before purchasing.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">2. Orders & payment</h2>
            <p>Your order is finalized once payment is confirmed via the Zibal gateway. Prices are in Toman and include applicable taxes.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">3. Shipping</h2>
            <p>Delivery time varies by destination city and is shown after checkout. Orders over 1,000,000 Toman ship free.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">4. Product responsibility</h2>
            <p>Beni Pett strives to display accurate product info (ingredients, weight, expiry), but the buyer is responsible for confirming suitability for their pet.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">5. Changes</h2>
            <p>Beni Pett reserves the right to change these terms at any time.</p>
          </>
        )}
      </section>
    </main>
  );
}
