import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Star, Trash2, MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth, useIsAdmin } from "@/lib/auth-hooks";
import { useI18n } from "@/lib/i18n";

export type Review = {
  id: string;
  user_id: string;
  product_id: string | null;
  parent_id: string | null;
  content: string;
  rating: number | null;
  author_name: string;
  author_avatar: string | null;
  created_at: string;
};

type Props = {
  productId?: string | null; // null → نظرات سراسری
  title?: string;
  compact?: boolean;
};

function timeAgo(iso: string, lang: "fa" | "en") {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [number, string, string][] = [
    [60, "ثانیه", "s"],
    [3600, "دقیقه", "m"],
    [86400, "ساعت", "h"],
    [604800, "روز", "d"],
    [2629800, "هفته", "w"],
    [31557600, "ماه", "mo"],
    [Infinity, "سال", "y"],
  ];
  let prev = 1;
  for (const [limit, fa, en] of units) {
    if (diff < limit) {
      const n = Math.max(1, Math.floor(diff / prev));
      return lang === "fa" ? `${n} ${fa} پیش` : `${n}${en} ago`;
    }
    prev = limit;
  }
  return iso;
}

function Stars({ value, onChange, size = 18, readOnly }: { value: number; onChange?: (n: number) => void; size?: number; readOnly?: boolean }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onClick={() => !readOnly && onChange?.(value === n ? 0 : n)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer"} p-0.5`}
          aria-label={`${n} star`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= active ? "fill-clay text-clay" : "text-clay/40"}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ productId = null, title, compact }: Props) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const qc = useQueryClient();
  const scopeKey = productId ?? "site";

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", scopeKey],
    queryFn: async (): Promise<Review[]> => {
      const qs = productId ? `?productId=${encodeURIComponent(productId)}` : "";
      return apiFetch<Review[]>(`/api/reviews${qs}`);
    },
  });

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { roots, childrenOf } = useMemo(() => {
    const roots: Review[] = [];
    const map = new Map<string, Review[]>();
    for (const r of reviews) {
      if (r.parent_id) {
        if (!map.has(r.parent_id)) map.set(r.parent_id, []);
        map.get(r.parent_id)!.push(r);
      } else roots.push(r);
    }
    // replies oldest-first inside a thread for readability
    for (const arr of map.values()) arr.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return { roots, childrenOf: map };
  }, [reviews]);

  async function submit(parentId: string | null, text: string, stars: number) {
    if (!user) return;
    const body = text.trim();
    if (body.length < 1) { toast.error(lang === "fa" ? "متن پیام خالی است" : "Message is empty"); return; }
    if (body.length > 2000) { toast.error(lang === "fa" ? "حداکثر ۲۰۰۰ کاراکتر" : "Max 2000 chars"); return; }
    setSubmitting(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: {
          product_id: productId,
          parent_id: parentId,
          content: body,
          rating: parentId ? null : (stars >= 1 && stars <= 5 ? stars : null),
        },
      });
      toast.success(lang === "fa" ? "ثبت شد" : "Posted");
      if (parentId) { setReplyTo(null); setReplyText(""); }
      else { setContent(""); setRating(0); }
      qc.invalidateQueries({ queryKey: ["reviews", scopeKey] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(lang === "fa" ? "این پیام حذف شود؟" : "Delete this message?")) return;
    try {
      await apiFetch(`/api/reviews/${id}`, { method: "DELETE" });
      qc.invalidateQueries({ queryKey: ["reviews", scopeKey] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  const avgRating = useMemo(() => {
    const rated = roots.filter((r) => r.rating && r.rating > 0);
    if (!rated.length) return null;
    return rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length;
  }, [roots]);

  return (
    <section className={compact ? "" : "container-page py-16"}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-clay">
            {lang === "fa" ? "نظرات مشتریان" : "Customer reviews"}
          </div>
          <h2 className={`font-display ${compact ? "text-2xl" : "text-3xl md:text-4xl"} text-espresso mt-2`}>
            {title ?? (lang === "fa" ? "دیدگاه شما مهم است" : "Share your experience")}
          </h2>
          {avgRating !== null && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={Math.round(avgRating)} readOnly size={14} />
              <span>{avgRating.toFixed(1)} / 5 · {roots.filter((r) => r.rating).length}{lang === "fa" ? " رأی" : " ratings"}</span>
            </div>
          )}
        </div>
      </div>

      {user ? (
        <form
          onSubmit={(e) => { e.preventDefault(); submit(null, content, rating); }}
          className="rounded-2xl border border-border/60 bg-background p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="text-sm text-espresso">
              {lang === "fa" ? "امتیاز شما (اختیاری):" : "Your rating (optional):"}
            </div>
            <Stars value={rating} onChange={setRating} />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={lang === "fa" ? "دیدگاه خود را بنویسید…" : "Write your review…"}
            className="input-base w-full resize-y"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.length}/2000</span>
            <button disabled={submitting || !content.trim()} className="btn-primary disabled:opacity-50">
              {submitting ? "…" : (lang === "fa" ? "ثبت نظر" : "Post review")}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-dashed border-clay/40 bg-cream/50 p-5 text-sm text-espresso flex flex-wrap items-center justify-between gap-3">
          <span>{lang === "fa" ? "برای ثبت نظر ابتدا وارد حساب خود شوید." : "Please sign in to leave a review."}</span>
          <Link to="/auth" className="btn-primary !py-2 text-xs">{t("nav_login")}</Link>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {isLoading && <div className="text-sm text-muted-foreground">…</div>}
        {!isLoading && roots.length === 0 && (
          <div className="text-sm text-muted-foreground">
            {lang === "fa" ? "هنوز نظری ثبت نشده. اولین نفر باشید!" : "No reviews yet. Be the first!"}
          </div>
        )}
        {roots.map((r) => {
          const canDelete = !!user && (user.id === r.user_id || isAdmin);
          const kids = childrenOf.get(r.id) ?? [];
          return (
            <article key={r.id} className="rounded-2xl border border-border/60 bg-background p-5">
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {r.author_avatar
                    ? <img src={r.author_avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                    : <div className="h-9 w-9 rounded-full bg-sand grid place-items-center text-espresso text-sm font-medium">{r.author_name.charAt(0).toUpperCase()}</div>}
                  <div>
                    <div className="text-sm font-medium text-espresso">{r.author_name}</div>
                    <div className="text-[11px] text-muted-foreground">{timeAgo(r.created_at, lang)}</div>
                  </div>
                </div>
                {r.rating ? <Stars value={r.rating} readOnly size={14} /> : null}
              </header>
              <p className="mt-3 text-sm text-espresso whitespace-pre-wrap leading-relaxed">{r.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {user && (
                  <button onClick={() => { setReplyTo(replyTo === r.id ? null : r.id); setReplyText(""); }} className="inline-flex items-center gap-1 hover:text-espresso">
                    <MessageSquare className="h-3.5 w-3.5" /> {lang === "fa" ? "پاسخ" : "Reply"}
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" /> {t("delete")}
                  </button>
                )}
              </div>

              {replyTo === r.id && user && (
                <form
                  onSubmit={(e) => { e.preventDefault(); submit(r.id, replyText, 0); }}
                  className="mt-4 ms-6 rounded-xl border border-border/60 bg-sand/30 p-3"
                >
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    placeholder={lang === "fa" ? "پاسخ خود را بنویسید…" : "Write a reply…"}
                    className="input-base w-full resize-y text-sm"
                  />
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-muted-foreground hover:text-espresso">{t("cancel")}</button>
                    <button disabled={submitting || !replyText.trim()} className="btn-primary !py-1.5 !px-4 text-xs disabled:opacity-50">
                      {lang === "fa" ? "ارسال پاسخ" : "Send reply"}
                    </button>
                  </div>
                </form>
              )}

              {kids.length > 0 && (
                <div className="mt-4 ms-6 space-y-3 border-s-2 border-clay/20 ps-4">
                  {kids.map((k) => {
                    const canDelK = !!user && (user.id === k.user_id || isAdmin);
                    return (
                      <div key={k.id} className="rounded-xl bg-sand/40 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {k.author_avatar
                              ? <img src={k.author_avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                              : <div className="h-7 w-7 rounded-full bg-background grid place-items-center text-espresso text-xs font-medium">{k.author_name.charAt(0).toUpperCase()}</div>}
                            <div>
                              <div className="text-xs font-medium text-espresso">{k.author_name}</div>
                              <div className="text-[10px] text-muted-foreground">{timeAgo(k.created_at, lang)}</div>
                            </div>
                          </div>
                          {canDelK && (
                            <button onClick={() => remove(k.id)} className="text-muted-foreground hover:text-red-600" aria-label="delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-espresso whitespace-pre-wrap leading-relaxed">{k.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
