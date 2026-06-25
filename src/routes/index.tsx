import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Play, TrendingUp, Upload, Crown, Headphones, ChevronRight, LogIn } from "lucide-react";
import { getNewReleases, getTrendingSongs, getFeaturedAlbums } from "@/lib/music.functions";
import { usePlayer } from "@/stores/player";
import { usePlatform } from "@/hooks/use-platform";
import { MobileHome } from "@/components/mobile/screens/MobileHome";
import { useAuth } from "@/hooks/use-auth";

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
  component: IndexRoute,
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

function IndexRoute() {
  const platform = usePlatform();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, navigate]);

  // Show nothing while checking auth (avoids flash of landing page)
  if (loading || user) return null;

  return platform === "native" ? <MobileHome /> : <HomePage />;
}

function HomePage() {
  const { data: newReleases } = useSuspenseQuery(newReleasesQO);
  const { data: trending } = useSuspenseQuery(trendingQO);
  const { data: featured } = useSuspenseQuery(featuredQO);
  const setTrack = usePlayer((s) => s.setTrack);

  const heroAlbum = featured[0];

  return (
    <div className="min-h-screen pb-24">
      {/* Mockup-Style Hero Row */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discover New Sounds Hero Card */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm min-h-[340px]">
            {/* Decorative background gradients */}
            <div className="absolute -right-24 -bottom-24 size-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute -left-24 -top-24 size-96 bg-brand/5 rounded-full filter blur-3xl pointer-events-none" />

            {/* Left text column */}
            <div className="flex-1 space-y-4 z-10 text-left">
              <span className="text-primary font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                <span className="inline-block w-6 h-px bg-primary" />
                Featured Spotlight
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight font-display">
                Discover <br />
                <span className="text-primary">New Sounds</span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Stream the best Zambian and African music, free & premium. Experience high-fidelity
                audio and support local artists directly with instant mobile money payments.
              </p>
              <div className="pt-2">
                <Link
                  to="/auth"
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
                >
                  <LogIn className="size-4" />
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right column (Stylized Vector SVG of a person with headphones and soundwaves) */}
            <div className="w-full md:w-[260px] h-[220px] shrink-0 relative flex items-center justify-center z-10">
              <svg
                viewBox="0 0 300 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-contain"
              >
                <defs>
                  <linearGradient id="bgCircleGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--color-secondary)" />
                    <stop offset="100%" stopColor="var(--color-muted)" stopOpacity="0.2" />
                  </linearGradient>
                  <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Glowing radial background */}
                <circle cx="150" cy="120" r="100" fill="url(#glowGrad)" />

                {/* Background circular frame */}
                <circle
                  cx="160"
                  cy="120"
                  r="80"
                  fill="url(#bgCircleGrad)"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                />

                {/* Decorative red soundwaves on the left side of the face */}
                <g opacity="0.85">
                  <rect x="75" y="105" width="4" height="30" rx="2" fill="var(--color-primary)" />
                  <rect x="83" y="90" width="4" height="60" rx="2" fill="var(--color-primary)" />
                  <rect x="91" y="75" width="4" height="90" rx="2" fill="var(--color-primary)" />
                  <rect x="99" y="95" width="4" height="50" rx="2" fill="var(--color-primary)" />
                  <rect x="107" y="110" width="4" height="20" rx="2" fill="var(--color-primary)" />
                </g>

                {/* Stylized face/bust looking left */}
                <path
                  d="M 180,180 
                     C 170,180 160,175 155,168 
                     C 150,161 145,150 144,142 
                     C 143,134 145,128 143,122
                     C 141,116 135,114 133,110
                     C 131,106 133,103 135,100
                     C 137,97 144,97 145,94
                     C 146,91 144,85 147,80
                     C 150,75 156,70 165,68
                     C 175,66 185,69 192,75
                     C 199,81 204,90 205,100
                     C 206,110 203,125 204,135
                     C 205,145 208,160 215,168
                     C 220,174 225,178 230,180
                     Z"
                  fill="var(--color-foreground)"
                  opacity="0.95"
                />

                {/* Stylized high-tech headphones in red and white/gray */}
                {/* Headband arch */}
                <path
                  d="M 155,72
                     C 150,55 165,40 185,42
                     C 200,43 212,54 210,72"
                  stroke="var(--color-primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 155,72
                     C 150,55 165,40 185,42
                     C 200,43 212,54 210,72"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.8"
                />

                {/* Left Ear Cup */}
                <g transform="translate(180, 95)">
                  <rect x="0" y="0" width="22" height="36" rx="11" fill="var(--color-primary)" />
                  <rect x="4" y="4" width="14" height="28" rx="7" fill="#e2e8f0" />
                  <rect x="8" y="8" width="8" height="20" rx="4" fill="var(--color-foreground)" />
                  <circle cx="12" cy="18" r="2.5" fill="var(--color-primary)" />
                </g>

                {/* Small glowing soundwave lines behind the head */}
                <g
                  opacity="0.5"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="215" y1="100" x2="230" y2="95" />
                  <line x1="220" y1="115" x2="240" y2="115" />
                  <line x1="215" y1="130" x2="230" y2="135" />
                </g>

                {/* Waveform graphic accent at the bottom */}
                <path
                  d="M10,210 Q40,195 70,210 T130,210 T190,210 T250,210 T290,200"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.4"
                />
              </svg>
            </div>
          </div>

          {/* Featured / Mini Player Card (Synthwave Dreams) */}
          <div className="bg-gradient-to-br from-brand via-brand/95 to-[#4c0000] rounded-3xl p-6 flex flex-col justify-between text-white shadow-md shadow-brand/10 relative overflow-hidden min-h-[340px] group">
            {/* Soundwave background line decorations */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />

            {/* Top Header info */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                Featured Release
              </span>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                WESU+ Special
              </span>
            </div>

            {/* Album Art / Styled circular visual in the center */}
            <div className="my-4 flex flex-col items-center justify-center z-10">
              <div className="relative size-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl group-hover:scale-105 transition-all duration-500 bg-black/40 flex items-center justify-center">
                {heroAlbum?.cover_url ? (
                  <img
                    src={heroAlbum.cover_url}
                    alt={heroAlbum.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand flex items-center justify-center">
                    <Headphones className="size-10 text-white" />
                  </div>
                )}
                {/* Spinning ring on hover */}
                <div className="absolute inset-0 border border-primary rounded-full animate-pulse opacity-60 pointer-events-none" />
              </div>
              <div className="text-center mt-3 max-w-xs px-2">
                <h4 className="font-bold text-base truncate drop-shadow-sm">
                  {heroAlbum?.title ?? "Synthwave Dreams"}
                </h4>
                <p className="text-xs text-white/70 truncate mt-0.5">
                  {(heroAlbum?.artist as { name?: string } | null)?.name ?? "Echo Pulse"}
                </p>
              </div>
            </div>

            {/* Audio controls card style at the bottom */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-3 z-10">
              {/* Progress bar */}
              <div className="w-full flex flex-col gap-1">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/3 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[9px] text-white/50 font-semibold uppercase tracking-wider">
                  <span>0:45</span>
                  <span>2:30</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (heroAlbum) {
                      setTrack({
                        id: heroAlbum.id,
                        title: heroAlbum.title,
                        artistName:
                          (heroAlbum.artist as { name?: string } | null)?.name ?? "Echo Pulse",
                        coverUrl: heroAlbum.cover_url,
                        durationSeconds: 180,
                      });
                    }
                  }}
                  className="bg-white text-brand hover:bg-white/90 rounded-full p-2.5 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="size-4 fill-current translate-x-0.5 text-brand" />
                </button>
                <button className="text-white/60 hover:text-white transition-colors cursor-pointer">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-6 mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors group cursor-pointer"
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
              <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
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
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-foreground/5 transition-colors group cursor-pointer text-left"
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
            <div className="bg-card border border-border rounded-2xl p-6">
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
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
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

        <section className="bg-card border border-border rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Go Premium</h2>
              <p className="text-muted-foreground mb-6">
                Ad-free listening, offline downloads, and high-fidelity audio. Support Zambian
                artists directly.
              </p>
              <Link
                to="/subscriptions"
                className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:brightness-110 transition-all inline-block shadow-md"
              >
                View Plans
              </Link>
            </div>

            {/* Payment provider logos */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Pay with
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* MTN MoMo */}
                <div className="bg-white rounded-2xl border border-yellow-200 p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-yellow-400 transition-all group cursor-pointer min-h-[96px]">
                  <img
                    src="/images/logo-mtn-momo-official.png"
                    alt="MTN MoMo"
                    className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Airtel Money */}
                <div className="bg-white rounded-2xl border border-red-200 p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-red-400 transition-all group cursor-pointer min-h-[96px]">
                  <img
                    src="/images/logo-airtel-money-official.png"
                    alt="Airtel Money"
                    className="h-14 w-auto object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Zamtel */}
                <div className="bg-white rounded-2xl border border-green-200 p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-green-400 transition-all group cursor-pointer min-h-[96px]">
                  <img
                    src="/images/logo-zamtel-money-official.png"
                    alt="Zamtel Money"
                    className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Visa & Mastercard */}
                <div className="bg-white rounded-2xl border border-blue-100 p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer min-h-[96px]">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/logo-visa.png"
                      alt="Visa"
                      className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
                    />
                    <img
                      src="/images/logo-mastercard.png"
                      alt="Mastercard"
                      className="h-7 w-auto object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Visa / Mastercard
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground uppercase tracking-widest">
          © 2025 Wesu+ Music Streaming · Lusaka, Zambia
        </div>
      </footer>
    </div>
  );
}
