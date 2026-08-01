import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PawScatter } from "@/components/pet-decorations";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "حریم خصوصی — بنی‌پت" },
      { name: "description", content: "سیاست حفظ حریم خصوصی فروشگاه بنی‌پت." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang } = useI18n();
  const fa = lang === "fa";
  return (
    <main>
      <section className="container-page pt-16 pb-6 relative overflow-hidden">
        <PawScatter paws={[{ top: "10%", left: "3%", rot: -20, size: 22 }]} />
        <div className="max-w-2xl relative">
          <div className="text-xs uppercase tracking-widest text-clay">
            {fa ? "حریم خصوصی" : "Privacy"}
          </div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-espresso">
            {fa ? "سیاست حفظ حریم خصوصی" : "Privacy Policy"}
          </h1>
        </div>
      </section>
      <section className="container-page pb-24 max-w-3xl text-espresso leading-relaxed space-y-6">
        {fa ? (
          <>
            <p>آخرین به‌روزرسانی: {new Date().toLocaleDateString("fa-IR")}</p>
            <p>
              بنی‌پت («ما») به حریم خصوصی مشتریان خود احترام می‌گذارد. این سند توضیح می‌دهد
              چه اطلاعاتی از شما جمع‌آوری می‌کنیم، چگونه از آن‌ها استفاده می‌کنیم و چگونه
              از آن‌ها محافظت می‌کنیم.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۱. اطلاعاتی که جمع‌آوری می‌کنیم</h2>
            <p>
              نام، شماره تماس، آدرس پستی، ایمیل (در صورت ورود با گوگل)، و اطلاعات سفارش
              (محصولات خریداری‌شده، مبلغ پرداختی) هنگام ثبت‌نام یا ثبت سفارش جمع‌آوری می‌شود.
              ما هرگز اطلاعات کارت بانکی شما را ذخیره نمی‌کنیم؛ پرداخت مستقیماً از طریق درگاه
              زیبال انجام می‌شود.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۲. استفاده از اطلاعات</h2>
            <p>
              اطلاعات شما صرفاً برای پردازش سفارش، ارسال کالا، پاسخ‌گویی به پیام‌های شما، و
              بهبود خدمات استفاده می‌شود. اطلاعات شما به هیچ شخص ثالثی جز درگاه پرداخت و
              شرکت‌های پستی (برای ارسال کالا) منتقل نمی‌شود.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۳. امنیت</h2>
            <p>
              اطلاعات شما روی سرورهای امن نگهداری می‌شود و دسترسی به آن‌ها محدود به کارکنان
              مجاز فروشگاه است.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">۴. تماس با ما</h2>
            <p>برای هرگونه سوال درباره‌ی این سیاست، از طریق صفحه‌ی تماس با ما در ارتباط باشید.</p>
          </>
        ) : (
          <>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              Beni Pett ("we") respects your privacy. This document explains what information
              we collect, how we use it, and how we protect it.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">1. Information we collect</h2>
            <p>
              Name, phone number, mailing address, email (if you sign in with Google), and order
              details are collected when you register or place an order. We never store your
              card details; payment is processed directly through the Zibal gateway.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">2. How we use it</h2>
            <p>
              Your information is used only to process orders, arrange delivery, respond to your
              messages, and improve our service. We never share it with third parties other than
              the payment gateway and shipping companies.
            </p>
            <h2 className="font-display text-2xl text-espresso mt-8">3. Security</h2>
            <p>Your data is stored on secure servers, accessible only to authorized staff.</p>
            <h2 className="font-display text-2xl text-espresso mt-8">4. Contact us</h2>
            <p>For any questions about this policy, please reach out via our contact page.</p>
          </>
        )}
      </section>
    </main>
  );
}
