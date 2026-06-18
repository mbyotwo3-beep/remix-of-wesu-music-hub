import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [playlists, purchases, subscription, profile] = await Promise.all([
      supabase
        .from("playlists")
        .select("id,name,cover_url,is_public,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("purchases")
        .select("id,amount,created_at,song:songs(id,title),album:albums(id,title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    return {
      playlists: playlists.data ?? [],
      recentPurchases: purchases.data ?? [],
      subscription: subscription.data,
      profile: profile.data,
      stats: {
        playlists: playlists.data?.length ?? 0,
        purchases: purchases.data?.length ?? 0,
      },
    };
  });

export const getMyArtistOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: artist } = await supabase
      .from("artists")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!artist) {
      return { artist: null, topSongs: [], totalSongs: 0, totalPlays: 0, totalRevenueZmw: 0 };
    }

    const [songs, sales] = await Promise.all([
      supabase
        .from("songs")
        .select("id,title,play_count,price,created_at")
        .eq("artist_id", artist.id)
        .order("play_count", { ascending: false }),
      supabase
        .from("purchases")
        .select("amount,song_id,album_id")
        .or(`song_id.in.(select id from songs where artist_id.eq.${artist.id}),album_id.in.(select id from albums where artist_id.eq.${artist.id})`),
    ]);

    const songRows = songs.data ?? [];
    const totalPlays = songRows.reduce((s, r) => s + (r.play_count ?? 0), 0);
    const totalRevenueZmw = (sales.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);

    return {
      artist,
      topSongs: songRows.slice(0, 10),
      totalSongs: songRows.length,
      totalPlays,
      totalRevenueZmw,
    };
  });
