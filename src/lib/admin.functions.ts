import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("is_staff", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

async function audit(actorId: string, action: string, target_type?: string, target_id?: string, meta: any = {}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_log").insert({ actor_id: actorId, action, target_type, target_id, meta });
}

// Back-compat: admin functions previously used assertAdmin checking 'admin'. Now allow staff (admin OR superadmin).
async function assertAdmin(supabase: any, userId: string) { await assertStaff(supabase, userId); }

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [users, songs, subs, revenue] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("songs").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabaseAdmin
        .from("payment_transactions")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const monthlyRevenue = (revenue.data ?? []).reduce(
      (s, r: { amount: number }) => s + Number(r.amount ?? 0),
      0,
    );

    return {
      totalUsers: users.count ?? 0,
      totalSongs: songs.count ?? 0,
      premiumSubscribers: subs.count ?? 0,
      monthlyRevenueZmw: monthlyRevenue,
    };
  });

export const getRecentActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [songs, tx] = await Promise.all([
      supabaseAdmin
        .from("songs")
        .select("id,title,created_at,artist:artists(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin
        .from("payment_transactions")
        .select("id,amount,method_code,status,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    return {
      recentSongs: songs.data ?? [],
      recentTransactions: tx.data ?? [],
    };
  });
