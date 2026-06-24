import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function audit(
  actorId: string,
  action: string,
  target_type?: string,
  target_id?: string,
  meta: any = {},
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("audit_log")
    .insert({ actor_id: actorId, action, target_type, target_id, meta });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const applyForLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { name: string; bio?: string; contact_email?: string; logo_url?: string }) => d,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const slug = slugify(data.name) + "-" + Math.random().toString(36).slice(2, 6);
    const { data: row, error } = await supabase
      .from("labels")
      .insert({
        name: data.name,
        slug,
        owner_user_id: userId,
        bio: data.bio ?? null,
        contact_email: data.contact_email ?? null,
        logo_url: data.logo_url ?? null,
      } as any)
      .select("id, slug, status")
      .single();
    if (error) throw new Error(error.message);
    await audit(userId, "label.apply", "label", row!.id);
    return row;
  });

export const updateLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { id: string; name?: string; bio?: string; contact_email?: string; logo_url?: string }) =>
      d,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const patch: any = {};
    for (const k of ["name", "bio", "contact_email", "logo_url"] as const) {
      if (data[k] !== undefined) patch[k] = data[k];
    }
    const { error } = await supabase.from("labels").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(userId, "label.update", "label", data.id, patch);
    return { ok: true };
  });

export const getMyLabel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("labels")
      .select("*")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    return data;
  });

export const getLabelBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: label } = await sb
      .from("labels")
      .select("id, name, slug, bio, logo_url, status")
      .eq("slug", data.slug)
      .eq("status", "approved")
      .maybeSingle();
    if (!label) return null;
    const { data: roster } = await sb
      .from("artists")
      .select("id, name, avatar_url, monthly_listeners")
      .eq("label_id", (label as any).id)
      .eq("status", "approved");
    return { label, roster: roster ?? [] };
  });

export const listApprovedLabels = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await sb
    .from("labels")
    .select("id, name, slug, bio, logo_url")
    .eq("status", "approved")
    .order("name");
  return data ?? [];
});

export const inviteArtistToLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { label_id: string; artist_id: string; royalty_pct?: number }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("label_artists").insert({
      label_id: data.label_id,
      artist_id: data.artist_id,
      royalty_pct: data.royalty_pct ?? 80,
      status: "invited",
    } as any);
    if (error) throw new Error(error.message);
    await audit(userId, "label.invite_artist", "label", data.label_id, {
      artist_id: data.artist_id,
    });
    return { ok: true };
  });

export const respondToLabelInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; accept: boolean }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.accept) {
      const { data: row, error } = await supabase
        .from("label_artists")
        .update({ status: "active", joined_at: new Date().toISOString() } as any)
        .eq("id", data.id)
        .select("label_id, artist_id")
        .single();
      if (error) throw new Error(error.message);
      // attach label to artist
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("artists")
        .update({ label_id: (row as any).label_id })
        .eq("id", (row as any).artist_id);
      await audit(userId, "label.invite.accept", "label_artists", data.id);
    } else {
      await supabase
        .from("label_artists")
        .update({ status: "removed" } as any)
        .eq("id", data.id);
      await audit(userId, "label.invite.decline", "label_artists", data.id);
    }
    return { ok: true };
  });

export const setArtistRoyalty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; royalty_pct: number }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("label_artists")
      .update({ royalty_pct: data.royalty_pct } as any)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context.userId, "label.royalty.set", "label_artists", data.id, {
      royalty_pct: data.royalty_pct,
    });
    return { ok: true };
  });

export const removeArtistFromLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: row } = await context.supabase
      .from("label_artists")
      .select("artist_id")
      .eq("id", data.id)
      .maybeSingle();
    await context.supabase
      .from("label_artists")
      .update({ status: "removed" } as any)
      .eq("id", data.id);
    if (row) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("artists")
        .update({ label_id: null })
        .eq("id", (row as any).artist_id);
    }
    await audit(context.userId, "label.remove_artist", "label_artists", data.id);
    return { ok: true };
  });

export const listLabelRoster = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { label_id: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: rows } = await context.supabase
      .from("label_artists")
      .select(
        "id, status, royalty_pct, joined_at, artists!inner(id, name, avatar_url, monthly_listeners)",
      )
      .eq("label_id", data.label_id);
    return rows ?? [];
  });

export const listLabelRevenue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { label_id: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: splits } = await context.supabase
      .from("revenue_splits")
      .select("amount, created_at, payee_role, artist_id")
      .eq("label_id", data.label_id)
      .order("created_at", { ascending: false })
      .limit(200);
    const total = (splits ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
    return { total, splits: splits ?? [] };
  });

export const requestLabelPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { label_id: string; amount: number; method_code: string; destination: string }) => d,
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("payouts").insert({
      label_id: data.label_id,
      amount: data.amount,
      method_code: data.method_code,
      destination: data.destination,
      net_amount: data.amount,
    } as any);
    if (error) throw new Error(error.message);
    await audit(context.userId, "label.payout.request", "label", data.label_id, {
      amount: data.amount,
    });
    return { ok: true };
  });
