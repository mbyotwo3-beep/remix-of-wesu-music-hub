import { createFileRoute } from "@tanstack/react-router";

/**
 * DPO Pay webhook callback.
 *
 * This endpoint is public (no auth) and bypasses the published-site auth
 * because it lives under /api/public/*. It is a placeholder until the DPO
 * Company Token and webhook secret are configured.
 *
 * Stable URL for DPO callback configuration:
 *   https://project--3d992fed-0a4b-4613-aa6b-368907935324.lovable.app/api/public/dpo-webhook
 */
export const Route = createFileRoute("/api/public/dpo-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const companyToken = process.env.DPO_COMPANY_TOKEN;
        if (!companyToken) {
          return new Response("DPO Pay not configured", { status: 503 });
        }

        const body = await request.text();
        // TODO: verify DPO callback signature here, then look up the
        // transaction by provider_ref / provider_token and update its
        // status to `completed` or `failed`.
        console.log("DPO webhook received:", body.slice(0, 500));

        return new Response("ok");
      },
      GET: async () => new Response("DPO webhook endpoint"),
    },
  },
});
