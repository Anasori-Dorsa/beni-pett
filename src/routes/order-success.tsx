import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  validateSearch: (s) => z.object({ id: z.string().optional() }).parse(s),
  head: () => ({ meta: [{ title: "Order placed — Beni Pett" }] }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { t } = useI18n();
  const { id } = Route.useSearch();
  return (
    <main className="container-page pt-20 pb-24">
      <div className="max-w-lg mx-auto text-center bg-background rounded-3xl border border-border/60 p-10 shadow-[var(--shadow-soft)]">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="mt-6 font-display text-3xl text-espresso">{t("order_success_title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("order_success_sub")}</p>
        {id && <div className="mt-6 text-sm text-muted-foreground">{t("order_number")}<span dir="ltr" className="font-mono ms-2 text-espresso">{id.slice(0, 8)}</span></div>}
        <div className="mt-8"><Link to="/shop" className="btn-primary">{t("cart_continue")}</Link></div>
      </div>
    </main>
  );
}