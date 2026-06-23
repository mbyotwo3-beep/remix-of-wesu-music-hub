import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fulfillTransaction } from "@/lib/payments.server";

/**
 * DPO Pay webhook callback.
 * POST /api/public/dpo-webhook
 *
 * DPO Pay sends a form-encoded POST when a payment is confirmed or cancelled.
 * This handler is intentionally public (no auth) — DPO does not sign payloads,
 * so we authenticate by matching CompanyToken from the body against our env var.
 *
 * Always returns HTTP 200 to prevent DPO retry storms.
 */
export const Route = createFileRoute("/api/public/dpo-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") ?? "";
          let body: Record<string, string> = {};

          if (contentType.includes("application/x-www-form-urlencoded")) {
            const text = await request.text();
            const params = new URLSearchParams(text);
            params.forEach((v, k) => { body[k] = v; });
          } else {
            // DPO may also send JSON or XML in some integrations; parse what we can
            const text = await request.text();
            try { body = JSON.parse(text); } catch {
              // Try form parse as fallback
              new URLSearchParams(text).forEach((v, k) => { body[k] = v; });
            }
          }

          const envToken = process.env.DPO_COMPANY_TOKEN ?? "";
          const bodyToken = body.CompanyToken ?? "";

          // In simulation mode (no env token) still allow processing for testing
          const simulationMode = !envToken;
          if (!simulationMode && bodyToken !== envToken) {
            console.warn("[DPO webhook] CompanyToken mismatch — rejecting");
            return new Response("Unauthorized", { status: 401 });
          }

          // TransactionToken is how DPO refers to the token in callbacks
          const providerToken = body.TransactionToken ?? body.TransToken ?? "";
          const ccdApproval = body.CCDapproval ?? body.ccdApproval ?? "";

          if (!providerToken) {
            console.warn("[DPO webhook] No provider_token in payload");
            return new Response("OK", { status: 200 });
          }

          // Look up transaction
          const { data: tx, error: findErr } = await supabaseAdmin
            .from("payment_transactions")
            .select("*")
            .eq("provider_token", providerToken)
            .maybeSingle();

          if (findErr || !tx) {
            console.warn("[DPO webhook] Unknown provider_token:", providerToken);
            return new Response("OK", { status: 200 });
          }

          if (ccdApproval === "000") {
            // Payment approved
            const { error: updateErr } = await supabaseAdmin
              .from("payment_transactions")
              .update({ status: "completed" } as any)
              .eq("id", tx.id);
            if (updateErr) throw new Error(updateErr.message);
            await fulfillTransaction(tx as any);
          } else {
            // Payment failed or cancelled
            const newStatus = ccdApproval === "904" ? "cancelled" : "failed";
            await supabaseAdmin
              .from("payment_transactions")
              .update({ status: newStatus } as any)
              .eq("id", tx.id);
          }

          return new Response("OK", { status: 200 });
        } catch (err) {
          // Always 200 — DPO will retry on non-200
          console.error("[DPO webhook] Error:", err);
          return new Response("OK", { status: 200 });
        }
      },

      GET: async () => new Response("DPO webhook endpoint active"),
    },
  },
});
