const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function formatToman(value: number | string | null | undefined, lang: "fa" | "en" = "fa"): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  const withSeparators = Math.round(n).toLocaleString("en-US");
  if (lang === "fa") {
    return withSeparators
      .replace(/,/g, "٬")
      .replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
  }
  return withSeparators;
}

export function tomanToUsd(toman: number, rate = 60000): number {
  return Math.max(1, Math.round((toman / rate) * 100) / 100);
}