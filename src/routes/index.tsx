import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Play, TrendingUp, Upload, Crown, Headphones, ChevronRight } from "lucide-react";
import { getNewReleases, getTrendingSongs, getFeaturedAlbums } from "@/lib/music.functions";
import { usePlayer } from "@/stores/player";

const newReleasesQO = queryOptions({
  queryKey: ["new-releases"],
  queryFn: () => getNewReleases(),
});
const trendingQO = queryOptions({
  queryKey: ["trending"],
  queryFn: () => getTrendingSongs(),
});
const featuredQO = queryOptions({
  queryKey: ["featured-albums"],
  queryFn: () => getFeaturedAlbums(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wesu+ — Stream Zambian & African Music" },
      {
        name: "description",
        content:
          "Stream the best Zambian and African music. Free & Premium tiers. Pay with MTN MoMo, Airtel Money, Zamtel Kwacha, or card.",
      },
      { property: "og:title", content: "Wesu+ — Stream Zambian & African Music" },
      {
        property: "og:description",
        content: "Stream the best Zambian and African music. Free & Premium tiers.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(newReleasesQO);
    context.queryClient.ensureQueryData(trendingQO);
    context.queryClient.ensureQueryData(featuredQO);
  },
  component: HomePage,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center text-muted-foreground">Failed to load: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

const quickLinks = [
  { label: "Charts", desc: "Top 50 Zambia", icon: TrendingUp, href: "/browse" },
  { label: "MoMo Pay", desc: "Instant purchases", icon: Crown, href: "/checkout" },
  { label: "Upload", desc: "Artist Portal", icon: Upload, href: "/artist-dashboard" },
  { label: "Premium", desc: "Go Ad-Free", icon: Headphones, href: "/subscriptions" },
];

function formatDuration(s?: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function HomePage() {
  const { data: newReleases } = useSuspenseQuery(newReleasesQO);
  const { data: trending } = useSuspenseQuery(trendingQO);
  const { data: featured } = useSuspenseQuery(featuredQO);
  const setTrack = usePlayer((s) => s.setTrack);

  const heroAlbum = featured[0];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[550px] overflow-hidden bg-gradient-to-br from-primary/20 via-card to-obsidian">
        {heroAlbum?.cover_url && (
          <img
            src={heroAlbum.cover_url}
            alt={heroAlbum.title}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3">
            {heroAlbum ? "Featured Album" : "Welcome to Wesu+"}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tighter">
            {heroAlbum?.title ?? "Stream Zambia"}
            <br />
            <span className="text-white/60">
              {(heroAlbum?.artist as { name?: string } | null)?.name ?? "Listen. Buy. Support."}
            </span>
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/browse"
              className="px-8 py-3 bg-white text-obsidian font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="size-4" />
              Browse Music
            </Link>
            {heroAlbum && (
              <Link
                to="/albums"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 font-bold rounded-full hover:bg-white/20 transition-colors"
              >
                Buy Album — K{Number(heroAlbum.price ?? 0).toFixed(2)}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="p-6 bg-card border border-white/5 rounded-2xl hover:border-primary/30 transition-colors group cursor-pointer"
            >
              <link.icon className="size-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm">{link.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">New Releases</h2>
              <Link
                to="/browse"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="size-4" />
              </Link>
            </div>
            {newReleases.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-muted-foreground text-sm">
                No songs yet. Artists can upload from the Artist Dashboard.
              </div>
            ) : (
              <div className="space-y-1">
                {newReleases.map((song) => (
                  <button
                    key={song.id}
                    onClick={() =>
                      setTrack({
                        id: song.id,
                        title: song.title,
                        artistName: (song.artist as { name?: string } | null)?.name ?? "Unknown",
                        coverUrl: song.cover_url,
                        durationSeconds: song.duration,
                      })
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded bg-card overflow-hidden shrink-0 ring-1 ring-white/10 flex items-center justify-center">
                        {song.cover_url ? (
                          <img
                            src={song.cover_url}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Play className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(song.artist as { name?: string } | null)?.name ?? "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatDuration(song.duration)}
                      </span>
                      <span className="text-primary text-sm font-bold">
                        K{Number(song.price ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Trending Now
              </h3>
              {trending.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trending songs yet.</p>
              ) : (
                <div className="space-y-2">
                  {trending.slice(0, 5).map((t, i) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="w-5 text-sm text-muted-foreground text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(t.artist as { name?: string } | null)?.name ?? "Unknown"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{t.play_count ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="bg-card border border-white/5 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Go Premium</h2>
              <p className="text-muted-foreground mb-6">
                Ad-free listening, offline downloads, and high-fidelity audio. Support Zambian
                artists directly.
              </p>
              <Link
                to="/subscriptions"
                className="px-6 py-3 bg-primary text-obsidian font-bold rounded-full hover:brightness-110 transition-all inline-block"
              >
                View Plans
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <div className="aspect-video bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-end text-yellow-500">
                MTN MoMo
              </div>
              <div className="aspect-video bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-end text-red-500">
                Airtel Money
              </div>
              <div className="aspect-video bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-end text-green-500">
                Zamtel
              </div>
              <div className="aspect-video bg-white/5 border border-white/10 rounded-xl p-4 flex items-end">
                Visa / MC
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground uppercase tracking-widest">
          © 2025 Wesu+ Music Streaming · Lusaka, Zambia
        </div>
      </footer>
    </div>
  );
}
