import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PawScatter } from "@/components/pet-decorations";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "شرایط بازگشت کالا — بنی‌پت" },
      { name: "description", content: "شرایط و نحوه‌ی بازگشت کالا در فروشگاه بنی‌پت." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  const { lang } = useI18n();
  const fa = lang === "fa";
  return (
    <main>
      <section className="container-page pt-16 pb-6 relative overflow-hidden">
        <PawScatter paws={[{ bottom: "10%", left: "5%", rot: -15, size: 22 }]} />
        <div className="max-w-2xl relative">
          <div className="text-xs uppercase tracking-widest text-clay">
            {fa ? "بازگشت کالا" : "Returns"}
          </div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-espresso">
            {fa ? "شرایط بازگشت کالا" : "Refund & Return Policy"}
          </h1>
        </div>
      </section>
      <section className="container-page pb-24 max-w-3xl text-espresso leading-relaxed space-y-6">
        {fa ? (
          <>
            <p>
              رضایت شما و سلامت حیوان خانگی‌تان برای ما در اولویت است. شرایط بازگشت کالا به
              شرح زیر است:
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۱. مهلت بازگشت</h2>
            <p>
              در صورت وجود ایراد در کالا (آسیب‌دیدگی، ارسال اشتباه، یا انقضا) تا ۷۲ ساعت پس از
              دریافت مرسوله، امکان درخواست بازگشت یا تعویض کالا وجود دارد.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۲. شرایط کالای قابل بازگشت</h2>
            <p>
              کالا باید بسته‌بندی اصلی و دست‌نخورده داشته باشد. به دلایل بهداشتی، کالاهای غذایی
              بازشده یا استفاده‌شده قابل بازگشت نیستند مگر در صورت اثبات ایراد از سمت فروشنده.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۳. نحوه‌ی درخواست</h2>
            <p>
              برای ثبت درخواست بازگشت، از طریق صفحه‌ی تماس با ما، شماره سفارش و توضیح مشکل را
              ارسال کنید. تیم ما حداکثر تا ۴۸ ساعت پاسخ می‌دهد.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۴. بازگشت وجه</h2>
            <p>
              پس از تایید درخواست، وجه پرداختی حداکثر تا ۷ روز کاری به همان شماره کارتی که با
              آن پرداخت انجام شده بازگردانده می‌شود.
            </p>
          </>
        ) : (
          <>
            <p>Your satisfaction and your pet's wellbeing are our priority. Our return policy:</p>
            <h2 className="font-display text-2xl text-espresso mt-8">1. Return window</h2>
            <p>If an item arrives damaged, incorrect, or expired, you may request a return or exchange within 72 hours of delivery.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">2. Eligible items</h2>
            <p>Items must be in original, unopened packaging. For hygiene reasons, opened or used food items cannot be returned unless a fault by the seller is confirmed.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">3. How to request</h2>
            <p>Contact us via our contact page with your order number and a description of the issue. Our team responds within 48 hours.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">4. Refunds</h2>
            <p>Once approved, refunds are issued to the original payment card within 7 business days.</p>
          </>
        )}
      </section>
    </main>
  );
}
