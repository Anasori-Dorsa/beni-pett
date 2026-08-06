import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-hooks";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Beni Pett" }, { name: "description", content: "Sign in or create an account." }] }),
  component: AuthPage,
});

const PHONE_RE = /^09\d{9}$/;

type Mode = "login" | "signup" | "otp" | "forgot" | "reset";

function AuthPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  function validatePhone(): boolean {
    if (!PHONE_RE.test(phone)) {
      toast.error(lang === "fa" ? "شماره موبایل باید به شکل 09xxxxxxxxx باشد." : "Phone must be in the form 09xxxxxxxxx.");
      return false;
    }
    return true;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePhone()) return;
    setBusy(true);
    try {
      await apiFetch("/api/auth/login", { method: "POST", body: { phone, password } });
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (lang === "fa" ? "ورود ناموفق بود" : "Login failed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePhone()) return;
    if (password.length < 6) {
      toast.error(lang === "fa" ? "رمز عبور باید حداقل ۶ کاراکتر باشد." : "Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/auth/register", { method: "POST", body: { phone, password } });
      toast.success(lang === "fa" ? "کد تایید برای شما پیامک شد." : "A verification code was sent to you.");
      setMode("otp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (lang === "fa" ? "ثبت‌نام ناموفق بود" : "Registration failed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error(lang === "fa" ? "کد باید ۶ رقم باشد." : "Code must be 6 digits.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/auth/verify-otp", { method: "POST", body: { phone, code: code.trim() } });
      toast.success(lang === "fa" ? "حساب شما فعال شد." : "Your account is now active.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (lang === "fa" ? "کد نامعتبر است" : "Invalid code"));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePhone()) return;
    setBusy(true);
    try {
      await apiFetch("/api/auth/forgot-password", { method: "POST", body: { phone } });
      toast.success(lang === "fa" ? "کد بازیابی برای شما پیامک شد." : "A reset code was sent to you.");
      setMode("reset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (lang === "fa" ? "درخواست ناموفق بود" : "Request failed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error(lang === "fa" ? "کد باید ۶ رقم باشد." : "Code must be 6 digits.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error(lang === "fa" ? "رمز عبور جدید باید حداقل ۶ کاراکتر باشد." : "New password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: { phone, code: code.trim(), newPassword },
      });
      toast.success(lang === "fa" ? "رمز عبور با موفقیت تغییر کرد. حالا وارد شوید." : "Password changed. Please sign in.");
      setPassword("");
      setNewPassword("");
      setCode("");
      setMode("login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (lang === "fa" ? "بازیابی ناموفق بود" : "Reset failed"));
    } finally {
      setBusy(false);
    }
  }

  const phoneLabel = lang === "fa" ? "شماره موبایل" : "Mobile number";
  const passwordLabel = lang === "fa" ? "رمز عبور" : "Password";
  const newPasswordLabel = lang === "fa" ? "رمز عبور جدید" : "New password";
  const codeLabel = lang === "fa" ? "کد تایید ۶ رقمی" : "6-digit verification code";

  return (
    <main className="container-page pt-16 pb-24">
      <div className="max-w-md mx-auto bg-background rounded-3xl border border-border/60 p-8 shadow-[var(--shadow-soft)]">
        <h1 className="font-display text-3xl text-espresso">
          {mode === "login" && t("auth_login_title")}
          {mode === "signup" && t("auth_signup_title")}
          {mode === "otp" && (lang === "fa" ? "تایید شماره موبایل" : "Verify your phone")}
          {mode === "forgot" && (lang === "fa" ? "بازیابی رمز عبور" : "Forgot password")}
          {mode === "reset" && (lang === "fa" ? "تعیین رمز عبور جدید" : "Set a new password")}
        </h1>

        {(mode === "login" || mode === "signup") && (
          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="mt-8 grid gap-4">
            <label className="block">
              <span className="text-sm text-espresso mb-1 block">{phoneLabel}</span>
              <input
                dir="ltr"
                inputMode="numeric"
                placeholder="09xxxxxxxxx"
                maxLength={11}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                className="input-base"
              />
            </label>
            <label className="block">
              <span className="text-sm text-espresso mb-1 block">{passwordLabel}</span>
              <input
                type="password"
                dir="ltr"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
              />
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-clay hover:text-espresso text-start w-fit"
              >
                {lang === "fa" ? "رمز عبور را فراموش کرده‌ام" : "I forgot my password"}
              </button>
            )}
            <button disabled={busy} className="btn-primary justify-center">
              {busy ? "…" : (mode === "login" ? t("auth_login_btn") : t("auth_signup_btn"))}
            </button>
          </form>
        )}

        {mode === "otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-8 grid gap-4">
            <p className="text-sm text-muted-foreground">
              {lang === "fa"
                ? `کد ۶ رقمی ارسال‌شده به ${phone} را وارد کنید.`
                : `Enter the 6-digit code sent to ${phone}.`}
            </p>
            <label className="block">
              <span className="text-sm text-espresso mb-1 block">{codeLabel}</span>
              <input
                dir="ltr"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
                className="input-base text-center tracking-[0.5em]"
              />
            </label>
            <button disabled={busy} className="btn-primary justify-center">
              {busy ? "…" : (lang === "fa" ? "تایید کد" : "Verify code")}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="mt-8 grid gap-4">
            <label className="block">
              <span className="text-sm text-espresso mb-1 block">{phoneLabel}</span>
              <input
                dir="ltr"
                inputMode="numeric"
                placeholder="09xxxxxxxxx"
                maxLength={11}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                className="input-base"
              />
            </label>
            <button disabled={busy} className="btn-primary justify-center">
              {busy ? "…" : (lang === "fa" ? "ارسال کد بازیابی" : "Send reset code")}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleReset} className="mt-8 grid gap-4">
            <p className="text-sm text-muted-foreground">
              {lang === "fa"
                ? `کد ارسال‌شده به ${phone} و رمز عبور جدید را وارد کنید.`
                : `Enter the code sent to ${phone} and your new password.`}
            </p>
            <label className="block">
              <span className="text-sm text-espresso mb-1 block">{codeLabel}</span>
              <input
                dir="ltr"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
                className="input-base text-center tracking-[0.5em]"
              />
            </label>
            <label className="block">
              <span className="text-sm text-espresso mb-1 block">{newPasswordLabel}</span>
              <input
                type="password"
                dir="ltr"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-base"
              />
            </label>
            <button disabled={busy} className="btn-primary justify-center">
              {busy ? "…" : (lang === "fa" ? "تغییر رمز عبور" : "Change password")}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-center text-muted-foreground">
          {mode === "login" && (
            <>
              {t("auth_no_account")}{" "}
              <button onClick={() => setMode("signup")} className="text-espresso underline">
                {t("auth_signup_btn")}
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              {t("auth_have_account")}{" "}
              <button onClick={() => setMode("login")} className="text-espresso underline">
                {t("auth_login_btn")}
              </button>
            </>
          )}
          {(mode === "otp" || mode === "forgot" || mode === "reset") && (
            <button onClick={() => setMode("login")} className="text-espresso underline">
              {lang === "fa" ? "بازگشت به ورود" : "Back to sign in"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
