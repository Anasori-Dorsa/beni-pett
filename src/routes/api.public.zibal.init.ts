import { createFileRoute } from "@tanstack/react-router";

/**
 * Initiate a Zibal payment.
 * Body: { orderId: string }
 * Response: { ok: true, redirectUrl: string } | { ok: false, error: string }
 *
 * Uses the sandbox merchant code "zibal" by default. To go live, set the
 * ZIBAL_MERCHANT env var (Cloud → Secrets) to the real merchant ID.
 */
export const Route = createFileRoute("/api/public/zibal/init")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { orderId?: string };
          const orderId = body?.orderId;
          if (!orderId || typeof orderId !== "string") {
            return Response.json({ ok: false, error: "orderId required" }, { status: 400 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: order, error } = await supabaseAdmin
            .from("orders")
            .select("id, total_toman, full_name, phone, status")
            .eq("id", orderId)
            .maybeSingle();
          if (error || !order) {
            return Response.json({ ok: false, error: "Order not found" }, { status: 404 });
          }
          if (order.status !== "pending") {
            return Response.json({ ok: false, error: "Order is not pending" }, { status: 400 });
          }

          const origin = new URL(request.url).origin;
          const merchant = process.env.ZIBAL_MERCHANT || "zibal"; // "zibal" = sandbox
          const amountRial = Math.round(order.total_toman * 10); // Zibal expects Rials

          const resp = await fetch("https://gateway.zibal.ir/v1/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              merchant,
              amount: amountRial,
              callbackUrl: `${origin}/api/public/zibal/callback?orderId=${orderId}`,
              description: `Beni Pett — Order ${orderId.slice(0, 8)}`,
              orderId,
              mobile: order.phone ?? undefined,
            }),
          });

          const payload = (await resp.json()) as { result?: number; trackId?: number; message?: string };
          if (payload.result !== 100 || !payload.trackId) {
            return Response.json(
              { ok: false, error: `Zibal error: ${payload.message ?? payload.result}` },
              { status: 502 },
            );
          }

          await supabaseAdmin
            .from("orders")
            .update({
              payment_provider: "zibal",
              payment_track_id: String(payload.trackId),
            })
            .eq("id", orderId);

          return Response.json({
            ok: true,
            redirectUrl: `https://gateway.zibal.ir/start/${payload.trackId}`,
          });
        } catch (e) {
          console.error("zibal init error", e);
          return Response.json({ ok: false, error: "Internal error" }, { status: 500 });
        }
      },
    },
  },
});