import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function audit(actorId: string, action: string, target_type?: string, target_id?: string, meta: any = {}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_log").insert({ actor_id: actorId, action, target_type, target_id, meta });
}

// ---------- Artist application & profile ----------

export const applyAsArtist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; bio?: string; genre?: string }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("artists").select("id, status").eq("user_id", userId).maybeSingle();
    if (existing) return { ok: true, status: existing.status, id: existing.id };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("artists")
      .insert({ user_id: userId, name: data.name, bio: data.bio ?? null, genre: data.genre ?? null, status: "pending" } as any)
      .select("id, status")
      .single();
    if (error) throw new Error(error.message);
    await audit(userId, "artist.apply", "artist", row!.id);
    return { ok: true, status: row!.status, id: row!.id };
  });

export const updateArtistProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name?: string; bio?: string; genre?: string; avatar_url?: string; social_links?: Record<string, string> }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const patch: any = {};
    for (const k of ["name", "bio", "genre", "avatar_url"] as const) {
      if (data[k] !== undefined) patch[k] = data[k];
    }
    if (data.social_links) patch.social_links = data.social_links;
    const { error } = await supabase.from("artists").update(patch).eq("user_id", userId);
    if (error) throw new Error(error.message);
    await audit(userId, "artist.profile.update", "artist", userId, patch);
    return { ok: true };
  });

// ---------- Upload song ----------

export const uploadSong = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    title: string;
    audio_url: string;     // path inside song-audio bucket
    cover_url?: string;    // path inside album-art bucket (optional)
    duration?: number;
    genre?: string;
    price?: number;
    album_id?: string | null;
  }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase.from("artists").select("id, status").eq("user_id", userId).maybeSingle();
    if (!artist) throw new Error("You must be an approved artist to upload");
    if ((artist as any).status === "pending") throw new Error("Your artist application is pending approval");

    const { data: song, error } = await supabase.from("songs").insert({
      title: data.title,
      audio_url: data.audio_url,
      cover_url: data.cover_url ?? null,
      duration: data.duration ?? null,
      genre: data.genre ?? null,
      price: data.price ?? 0,
      album_id: data.album_id ?? null,
      artist_id: (artist as any).id,
      status: "pending",
    } as any).select("id").single();
    if (error) throw new Error(error.message);
    await audit(userId, "song.upload", "song", song!.id, { title: data.title });
    return { ok: true, id: song!.id };
  });

// ---------- Albums ----------

export const createAlbum = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; cover_url?: string; release_date?: string; genre?: string; description?: string; price?: number }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase.from("artists").select("id").eq("user_id", userId).maybeSingle();
    if (!artist) throw new Error("Artist profile required");
    const { data: album, error } = await supabase.from("albums").insert({
      title: data.title,
      cover_url: data.cover_url ?? null,
      release_date: data.release_date ?? null,
      genre: data.genre ?? null,
      description: data.description ?? null,
      price: data.price ?? 0,
      artist_id: (artist as any).id,
    } as any).select("id").single();
    if (error) throw new Error(error.message);
    await audit(userId, "album.create", "album", album!.id, { title: data.title });
    return { ok: true, id: album!.id };
  });

export const listMyAlbums = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: artist } = await context.supabase.from("artists").select("id").eq("user_id", context.userId).maybeSingle();
    if (!artist) return [];
    const { data } = await context.supabase.from("albums").select("id, title, cover_url, release_date").eq("artist_id", (artist as any).id).order("created_at", { ascending: false });
    return data ?? [];
  });

// ---------- Payouts ----------

export const requestPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number; method_code: string; destination: string }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase.from("artists").select("id").eq("user_id", userId).maybeSingle();
    if (!artist) throw new Error("Artist profile required");
    const { error } = await supabase.from("payouts").insert({
      artist_id: (artist as any).id,
      amount: data.amount,
      method_code: data.method_code,
      destination: data.destination,
    } as any);
    if (error) throw new Error(error.message);
    await audit(userId, "payout.request", "artist", (artist as any).id, { amount: data.amount });
    return { ok: true };
  });

export const listMyPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: artist } = await context.supabase.from("artists").select("id").eq("user_id", context.userId).maybeSingle();
    if (!artist) return [];
    const { data } = await context.supabase.from("payouts").select("*").eq("artist_id", (artist as any).id).order("requested_at", { ascending: false });
    return data ?? [];
  });

// ---------- Storage signing ----------

export const signUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: "song-audio" | "album-art" | "artist-images" | "user-avatars"; path: string }) => d)
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: signed, error } = await supabase.storage.from(data.bucket).createSignedUploadUrl(data.path);
    if (error) throw new Error(error.message);
    return signed;
  });
