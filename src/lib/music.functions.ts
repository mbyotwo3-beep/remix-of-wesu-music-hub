import { createServerFn } from "@tanstack/react-start";
import { getPublicSupabase } from "./supabase-public.server";

// ---------- Featured / Trending / New releases ----------

export const getFeaturedAlbums = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("albums")
    .select("id,title,cover_url,price,release_date,artist:artists(id,name)")
    .eq("featured", true)
    .order("release_date", { ascending: false })
    .limit(12);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getNewReleases = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("songs")
    .select("id,title,duration,price,cover_url,artist:artists(id,name)")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getTrendingSongs = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("songs")
    .select("id,title,play_count,cover_url,artist:artists(id,name)")
    .order("play_count", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ---------- Browse / Search ----------

export const searchSongs = createServerFn({ method: "GET" })
  .validator((d: { q?: string; genre?: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    let q = supabase
      .from("songs")
      .select("id,title,duration,price,cover_url,genre,artist:artists(id,name)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.q) q = q.ilike("title", `%${data.q}%`);
    if (data.genre) q = q.eq("genre", data.genre);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listAlbums = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("albums")
    .select("id,title,cover_url,price,release_date,genre,artist:artists(id,name)")
    .order("release_date", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listArtists = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("artists")
    .select("id,name,genre,avatar_url,verified,monthly_listeners")
    .order("monthly_listeners", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ---------- Artist & Album detail ----------

export const getArtistById = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    const [artist, albums, songs] = await Promise.all([
      supabase.from("artists").select("*").eq("id", data.id).maybeSingle(),
      supabase
        .from("albums")
        .select("id,title,cover_url,release_date,price")
        .eq("artist_id", data.id)
        .order("release_date", { ascending: false }),
      supabase
        .from("songs")
        .select("id,title,duration,price,cover_url,play_count")
        .eq("artist_id", data.id)
        .order("play_count", { ascending: false })
        .limit(20),
    ]);
    if (artist.error) throw new Error(artist.error.message);
    return {
      artist: artist.data,
      albums: albums.data ?? [],
      topSongs: songs.data ?? [],
    };
  });

export const getAlbumWithSongs = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    const [album, songs] = await Promise.all([
      supabase
        .from("albums")
        .select("*, artist:artists(id,name,avatar_url)")
        .eq("id", data.id)
        .maybeSingle(),
      supabase
        .from("songs")
        .select("id,title,duration,price")
        .eq("album_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (album.error) throw new Error(album.error.message);
    return { album: album.data, songs: songs.data ?? [] };
  });

// ---------- Subscription Plans & Payment Methods ----------

export const getSubscriptionPlans = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPaymentMethods = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});
