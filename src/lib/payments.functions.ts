import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Initiate a payment via DPO Pay.
 *
 * This is currently a STUB. It records the transaction as `pending` in
 * `payment_transactions` and returns a placeholder. Once the DPO Pay
 * Company Token + Service Type secrets are added, the body of this handler
 * will call DPO's `createToken` endpoint and return the redirect URL.
 *
 * Required secrets (not yet configured):
 *   - DPO_COMPANY_TOKEN
 *   - DPO_SERVICE_TYPE
 */
export const initiatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      amount: number;
      method_code: string;
      item_type: "song" | "album" | "subscription";
      item_id?: string;
      phone?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Record the pending transaction (visible to the user).
    const { data: tx, error } = await supabase
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

    if (error) throw new Error(error.message);

    const companyToken = process.env.DPO_COMPANY_TOKEN;
    const serviceType = process.env.DPO_SERVICE_TYPE;

    if (!companyToken || !serviceType) {
      return {
        transactionId: tx.id,
        status: "pending" as const,
        configured: false,
        message:
          "DPO Pay is not yet configured. The transaction was recorded but no provider call was made.",
      };
    }

    // TODO: call DPO Pay /API/v6/ createToken here once secrets are added.
    return {
      transactionId: tx.id,
      status: "pending" as const,
      configured: true,
      message: "DPO Pay integration placeholder — wire createToken call here.",
    };
  });
