// utils/sms.js
// لایه‌ی abstraction پیامک. در حالت dev فقط در کنسول چاپ می‌کند (برای تست بدون هزینه‌ی واقعی پیامک).
// در حالت kavenegar از سرویس واقعی Kavenegar استفاده می‌کند.

async function sendOtpSms(phone, code) {
  const mode = process.env.SMS_MODE || "dev";

  if (mode === "dev") {
    console.log(`\n[SMS_MODE=dev] کد تایید برای ${phone}: ${code}\n`);
    return { ok: true, provider: "dev" };
  }

  if (mode === "kavenegar") {
    const apiKey = process.env.KAVENEGAR_API_KEY;
    if (!apiKey) throw new Error("KAVENEGAR_API_KEY تنظیم نشده است.");

    const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
    const params = new URLSearchParams({
      receptor: phone,
      message: `کد تایید بنی‌پت: ${code}`,
      sender: process.env.KAVENEGAR_SENDER || "",
    });

    const resp = await fetch(`${url}?${params.toString()}`);
    const data = await resp.json();
    if (!resp.ok || data?.return?.status !== 200) {
      console.error("Kavenegar error:", data);
      throw new Error("ارسال پیامک ناموفق بود.");
    }
    return { ok: true, provider: "kavenegar" };
  }

  throw new Error(`SMS_MODE نامعتبر: ${mode}`);
}

module.exports = { sendOtpSms };
