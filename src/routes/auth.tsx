import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-hooks";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Beni Pett" }, { name: "description", content: "Sign in or create an account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.full_name, phone: form.phone },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setBusy(false); }
  }

  return (
    <main className="container-page pt-16 pb-24">
      <div className="max-w-md mx-auto bg-background rounded-3xl border border-border/60 p-8 shadow-[var(--shadow-soft)]">
        <h1 className="font-display text-3xl text-espresso">{mode === "login" ? t("auth_login_title") : t("auth_signup_title")}</h1>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          {mode === "signup" && (
            <>
              <label className="block">
                <span className="text-sm text-espresso mb-1 block">{t("auth_full_name")}</span>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-base" />
              </label>
              <label className="block">
                <span className="text-sm text-espresso mb-1 block">{t("auth_phone")}</span>
                <input dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" />
              </label>
            </>
          )}
          <label className="block">
            <span className="text-sm text-espresso mb-1 block">{t("auth_email")}</span>
            <input type="email" dir="ltr" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base" />
          </label>
          <label className="block">
            <span className="text-sm text-espresso mb-1 block">{t("auth_password")}</span>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-base" />
          </label>
          <button disabled={busy} className="btn-primary justify-center">{busy ? "…" : (mode === "login" ? t("auth_login_btn") : t("auth_signup_btn"))}</button>
        </form>

        <div className="mt-6 text-sm text-center text-muted-foreground">
          {mode === "login" ? t("auth_no_account") : t("auth_have_account")}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-espresso underline">
            {mode === "login" ? t("auth_signup_btn") : t("auth_login_btn")}
          </button>
        </div>
      </div>
    </main>
  );
}
