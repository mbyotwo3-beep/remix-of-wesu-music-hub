import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildCreateTokenXml, extractXmlTag } from "./payments.utils";

// Re-export so existing consumers can import from either path.
export { buildCreateTokenXml, extractXmlTag } from "./payments.utils";

const MOBILE_MONEY_METHODS = ["MTN_MOMO", "AIRTEL_MONEY", "ZAMTEL_KWACHA"];
const DPO_API_URL = "https://secure.3gdirectpay.com/API/v6/";
const DPO_PAY_URL = "https://secure.3gdirectpay.com/payv2.php?ID=";

/**
 * Initiate a payment via DPO Pay.
 *
 * Calls the DPO Pay `createToken` endpoint, stores the provider_token on the
 * transaction, and returns a redirect URL for the user to complete payment.
 *
 * Required env vars:
 *   - DPO_COMPANY_TOKEN
 *   - DPO_SERVICE_TYPE
 *   - APP_URL
 */
export const initiatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (d: {
      method_code: string;
      item_type: "song" | "album" | "subscription";
      item_id?: string;
      phone?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const companyToken = process.env.DPO_COMPANY_TOKEN ?? "";
    const serviceType = process.env.DPO_SERVICE_TYPE ?? "";
    const appUrl = process.env.APP_URL;

    const simulationMode =
      process.env.ENABLE_PAYMENT_SIMULATION === "true" &&
      process.env.NODE_ENV !== "production";

    if (!simulationMode && (!companyToken || !serviceType)) {
      throw new Error(
        "Payment gateway not configured. DPO_COMPANY_TOKEN and DPO_SERVICE_TYPE must be set.",
      );
    }

    if (simulationMode) {
      console.warn(
        "[DPO Pay] Simulation mode active — ENABLE_PAYMENT_SIMULATION=true in non-production env",
      );
    }

    // === Authoritative price lookup (never trust client-supplied amount) ===
    if (!data.item_id) throw new Error("item_id is required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let authoritativeAmount: number | null = null;
    if (data.item_type === "song") {
      const { data: row } = await supabaseAdmin
        .from("songs")
        .select("price")
        .eq("id", data.item_id)
        .maybeSingle();
      authoritativeAmount = row?.price != null ? Number(row.price) : null;
    } else if (data.item_type === "album") {
      const { data: row } = await supabaseAdmin
        .from("albums")
        .select("price")
        .eq("id", data.item_id)
        .maybeSingle();
      authoritativeAmount = row?.price != null ? Number(row.price) : null;
    } else if (data.item_type === "subscription") {
      const { data: row } = await supabaseAdmin
        .from("subscription_plans")
        .select("price_zmw, is_active")
        .eq("id", data.item_id)
        .maybeSingle();
      if (row && (row as any).is_active === false) throw new Error("Plan is not active");
      authoritativeAmount = row?.price_zmw != null ? Number(row.price_zmw) : null;
    }
    if (authoritativeAmount == null || !Number.isFinite(authoritativeAmount) || authoritativeAmount < 0) {
      throw new Error("Unable to determine price for the requested item");
    }
    const amount = authoritativeAmount;


    // Record the pending transaction (visible to the user).
    const { data: tx, error: insertError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: userId,
        amount: data.amount,
        currency: "ZMW",
        method_code: data.method_code,
        provider: "dpo",
        status: "pending",
        item_type: data.item_type,
        item_id: data.item_id,
        metadata: { phone: data.phone ?? null },
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    // Include phone number for mobile money methods.
    const phone = MOBILE_MONEY_METHODS.includes(data.method_code) && data.phone ? data.phone : null;

    // --- SIMULATION MODE: skip the real DPO API call ---
    if (simulationMode) {
      const fakeToken = `SIM_${Date.now()}_${tx.id.slice(0, 8)}`;
      await supabase
        .from("payment_transactions")
        .update({ provider_token: fakeToken, status: "completed" })
        .eq("id", tx.id);
      return {
        transactionId: tx.id,
        paymentUrl: `/checkout/success?sim=1&ref=${tx.id}`,
        simulated: true,
        message:
          "⚠️ Simulation mode: payment is pre-approved. Configure DPO_COMPANY_TOKEN and DPO_SERVICE_TYPE for real payments.",
      };
    }

    const baseUrl = appUrl ?? "https://wesu.music";
    const xmlPayload = buildCreateTokenXml({
      companyToken: companyToken!,
      serviceType: serviceType!,
      amount: data.amount,
      companyRef: tx.id,
      redirectUrl: `${baseUrl}/checkout/success`,
      backUrl: `${baseUrl}/checkout/cancel`,
      itemType: data.item_type,
      phone,
    });

    // Call DPO Pay createToken endpoint.
    const response = await fetch(DPO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlPayload,
    });

    if (!response.ok) {
      throw new Error(
        `DPO Pay request failed with HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const responseText = await response.text();

    const result = extractXmlTag(responseText, "Result");
    const resultExplanation = extractXmlTag(responseText, "ResultExplanation") ?? "Unknown error";

    if (result !== "000") {
      // Non-success result: leave transaction as pending, surface DPO error.
      throw new Error(`DPO Pay error (${result ?? "unknown"}): ${resultExplanation}`);
    }

    const transToken = extractXmlTag(responseText, "TransToken");
    if (!transToken) {
      throw new Error("DPO Pay returned success but no TransToken was found");
    }

    // Persist the provider token for webhook reconciliation.
    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update({ provider_token: transToken })
      .eq("id", tx.id);

    if (updateError) throw new Error(updateError.message);

    return {
      transactionId: tx.id,
      paymentUrl: `${DPO_PAY_URL}${transToken}`,
    };
  });
