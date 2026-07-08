import { createFileRoute } from "@tanstack/react-router";
import { ReviewsSection } from "@/components/reviews-section";
import { useI18n } from "@/lib/i18n";
import { PawScatter } from "@/components/pet-decorations";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Beni Pett" },
      { name: "description", content: "Read what pet parents say about Beni Pett and share your own experience with our products and service." },
      { property: "og:title", content: "Customer Reviews — Beni Pett" },
      { property: "og:description", content: "Real reviews from Beni Pett customers." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { lang } = useI18n();
  return (
    <main>
      <section className="container-page pt-16 pb-6 relative overflow-hidden">
        <PawScatter paws={[{ top: "10%", left: "3%", rot: -20, size: 22 }, { bottom: "10%", right: "5%", rot: 25, size: 24 }]} />
        <div className="max-w-2xl relative">
          <div className="text-xs uppercase tracking-widest text-clay">
            {lang === "fa" ? "دیدگاه‌ها" : "Reviews"}
          </div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-espresso">
            {lang === "fa" ? "نظرات مشتریان بنی‌پت" : "What our customers say"}
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            {lang === "fa"
              ? "تجربه خود از خرید و مشاوره را با ما و دیگر پت‌پرنت‌ها در میان بگذارید."
              : "Share your experience with Beni Pett and read reviews from other pet parents."}
          </p>
        </div>
      </section>
      <ReviewsSection productId={null} title={lang === "fa" ? "دیدگاه‌ها" : "All reviews"} compact />
      <div className="h-16" />
    </main>
  );
}