import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api-client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Beni Pett" },
      { name: "description", content: "Reach Beni Pett for expert pet-nutrition advice, orders, or partnership." },
      { property: "og:title", content: "Contact — Beni Pett" },
      { property: "og:description", content: "Get in touch for pet-nutrition advice or orders." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

function ContactPage() {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [website, setWebsite] = useState(""); // honeypot — humans never fill this
  const [formOpenedAt] = useState(() => Date.now());

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot: real users never see/fill this field. If it has any value, silently drop.
    if (website.trim() !== "") return;

    // Bots typically submit instantly; humans take at least a couple of seconds.
    if (Date.now() - formOpenedAt < 2000) {
      toast.error(lang === "fa" ? "لطفاً کمی صبر کنید و دوباره تلاش کنید." : "Please wait a moment and try again.");
      return;
    }

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid");
      return;
    }
    setLoading(true);
    const payload = {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    };
    try {
      await apiFetch("/api/contact", { method: "POST", body: payload });
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Failed");
      return;
    }
    setLoading(false);
    toast.success(t("contact_success"));
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <main>
      <section className="container-page pt-16 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-clay">{t("nav_contact")}</div>
          <h1 className="font-display text-5xl md:text-6xl mt-3 text-espresso">{t("contact_title")}</h1>
          <p className="mt-4 text-muted-foreground text-lg">{t("contact_sub")}</p>

          <form onSubmit={submit} className="mt-12 grid gap-5 bg-background rounded-3xl border border-border/60 p-8 shadow-[var(--shadow-soft)]">
            <div className="grid md:grid-cols-2 gap-5">
              <Field label={t("contact_name")} required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" />
              </Field>
              <Field label={t("contact_phone")}>
                <input dir={lang === "fa" ? "ltr" : undefined} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" />
              </Field>
              <Field label={t("contact_email")}>
                <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base" />
              </Field>
              <Field label={t("contact_subject")}>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-base" />
              </Field>
            </div>
            <Field label={t("contact_message")} required>
              <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-base resize-y" />
            </Field>

            {/* honeypot field — hidden from real users via CSS, bots often fill every input */}
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="absolute opacity-0 pointer-events-none h-0 w-0"
              aria-hidden="true"
            />

            <button disabled={loading} className="btn-primary justify-center sm:w-fit">{loading ? "…" : t("contact_send")}</button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-espresso mb-1.5 block">{label}{required && <span className="text-clay ms-1">*</span>}</span>
      {children}
    </label>
  );
}
