import { createFileRoute } from "@tanstack/react-router";

/**
 * Zibal payment callback. Verifies the payment via /v1/verify and updates the
 * order status, then redirects the user to /order-success (or checkout on failure).
 */
export const Route = createFileRoute("/api/public/zibal/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const success = url.searchParams.get("success"); // "1" = paid at gateway
        const trackId = url.searchParams.get("trackId");
        const orderId = url.searchParams.get("orderId");
        const origin = url.origin;

        if (!orderId) {
          return Response.redirect(`${origin}/checkout?err=missing_order`, 302);
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          if (success !== "1" || !trackId) {
            await supabaseAdmin
              .from("orders")
              .update({ status: "cancelled" })
              .eq("id", orderId);
            return Response.redirect(`${origin}/order-success?id=${orderId}&paid=0`, 302);
          }

          const merchant = process.env.ZIBAL_MERCHANT || "zibal";
          const resp = await fetch("https://gateway.zibal.ir/v1/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ merchant, trackId: Number(trackId) }),
          });
          const payload = (await resp.json()) as { result?: number; refNumber?: string | number; message?: string };

          // result 100 = success, 201 = already verified
          if (payload.result === 100 || payload.result === 201) {
            await supabaseAdmin
              .from("orders")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                payment_ref_number: payload.refNumber ? String(payload.refNumber) : null,
              })
              .eq("id", orderId);
            return Response.redirect(`${origin}/order-success?id=${orderId}&paid=1`, 302);
          }

          await supabaseAdmin
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId);
          return Response.redirect(`${origin}/order-success?id=${orderId}&paid=0`, 302);
        } catch (e) {
          console.error("zibal callback error", e);
          return Response.redirect(`${origin}/order-success?id=${orderId}&paid=0`, 302);
        }
      },
    },
  },
});