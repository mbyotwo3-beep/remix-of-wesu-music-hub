import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, TrendingUp, Upload, Crown, Headphones, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wesu+ — Stream Zambian & African Music" },
      { name: "description", content: "Stream the best Zambian and African music. Free & Premium tiers. Pay with MTN MoMo, Airtel Money, Zamtel Kwacha, or card." },
      { property: "og:title", content: "Wesu+ — Stream Zambian & African Music" },
      { property: "og:description", content: "Stream the best Zambian and African music. Free & Premium tiers. Pay with MTN MoMo, Airtel Money, Zamtel Kwacha, or card." },
    ],
  }),
  component: HomePage,
});

const quickLinks = [
  { label: "Charts", desc: "Top 50 Zambia", icon: TrendingUp, href: "/browse" },
  { label: "MoMo Pay", desc: "Instant purchases", icon: Crown, href: "/checkout" },
  { label: "Upload", desc: "Artist Portal", icon: Upload, href: "/artist-dashboard" },
  { label: "Premium", desc: "Go Ad-Free", icon: Headphones, href: "/subscriptions" },
];

const recentReleases = [
  { title: "Midnight Rituals", artist: "Luminous Soul", duration: "3:42", price: "5.00", cover: "/images/album-cover-1.jpg" },
  { title: "Copperbelt Dreams", artist: "Z-Star", duration: "4:15", price: "5.00", cover: "/images/album-cover-2.jpg" },
  { title: "Mwana Wamene", artist: "Aunty Rose", duration: "2:58", price: "5.00", cover: "/images/album-cover-3.jpg" },
  { title: "Kalindula Night", artist: "Yo Maps", duration: "3:30", price: "5.00", cover: "/images/album-cover-4.jpg" },
  { title: "Zambezi Flow", artist: "Pompi", duration: "3:55", price: "5.00", cover: "/images/album-cover-1.jpg" },
];

const trending = [
  { rank: 1, title: "Lusaka Heatwave", artist: "Sampa the Great", change: "up" },
  { rank: 2, title: "Zambezi Echoes", artist: "Mumba Yachi", change: "same" },
  { rank: 3, title: "Kwacha Vibes", artist: "Chef 187", change: "down" },
  { rank: 4, title: "Copper Gold", artist: "Slapdee", change: "up" },
  { rank: 5, title: "Mother Tongue", artist: "Cleo Ice Queen", change: "up" },
];

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[550px] overflow-hidden">
        <img
          src="/images/hero-artist.jpg"
          alt="Featured artist"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3">Trending Now</span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tighter">
            KALAMBA<br />
            <span className="text-white/60">SUMMER VIBES</span>
          </h1>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-white text-obsidian font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2">
              <Play className="size-4" />
              Play Now
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 font-bold rounded-full hover:bg-white/20 transition-colors">
              Buy Album — K150
            </button>
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
        {/* Two Column: Recently Released + Featured Album */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Recently Released */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently Released</h2>
              <Link to="/browse" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="space-y-1">
              {recentReleases.map((song) => (
                <div
                  key={song.title}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded bg-card overflow-hidden shrink-0 ring-1 ring-white/10">
                      <img src={song.cover} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{song.title}</p>
                      <p className="text-xs text-muted-foreground">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-muted-foreground hidden sm:block">{song.duration}</span>
                    <button className="text-primary text-sm font-bold hover:brightness-110">K{song.price}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Album */}
          <div className="space-y-6">
            <div className="relative group rounded-2xl overflow-hidden ring-1 ring-white/5 cursor-pointer">
              <img
                src="/images/album-cover-2.jpg"
                alt="Featured album"
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent p-6 flex flex-col justify-end">
                <span className="bg-primary text-obsidian text-[10px] font-bold px-2 py-0.5 rounded uppercase w-fit mb-2">
                  Buy Track: ZMW 15.00
                </span>
                <h3 className="text-xl font-bold">The Copperbelt Session</h3>
                <p className="text-sm text-muted-foreground">Amapiano vs Kalindula — 12 Tracks</p>
              </div>
            </div>

            {/* Trending Mini */}
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                Trending Now
              </h3>
              <div className="space-y-2">
                {trending.map((t) => (
                  <div key={t.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <span className="w-5 text-sm text-muted-foreground text-right">{t.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.artist}</p>
                    </div>
                    <span className={`text-xs font-medium ${
                      t.change === "up" ? "text-green-400" : t.change === "down" ? "text-red-400" : "text-muted-foreground"
                    }`}>
                      {t.change === "up" ? "▲" : t.change === "down" ? "▼" : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Teaser */}
        <section className="bg-card border border-white/5 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Go Premium</h2>
              <p className="text-muted-foreground mb-6">
                Ad-free listening, offline downloads, and high-fidelity audio. Support Zambian artists directly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/subscriptions"
                  className="px-6 py-3 bg-primary text-obsidian font-bold rounded-full hover:brightness-110 transition-all"
                >
                  View Plans
                </Link>
                <span className="px-6 py-3 text-muted-foreground font-medium">
                  From ZMW 45 / month
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-video bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex flex-col justify-between">
                <div className="size-6 bg-yellow-500 rounded" />
                <p className="text-xs font-bold text-yellow-500">MTN MoMo</p>
              </div>
              <div className="aspect-video bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col justify-between">
                <div className="size-6 bg-red-500 rounded" />
                <p className="text-xs font-bold text-red-500">Airtel Money</p>
              </div>
              <div className="aspect-video bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col justify-between">
                <div className="size-6 bg-green-500 rounded" />
                <p className="text-xs font-bold text-green-500">Zamtel</p>
              </div>
              <div className="aspect-video bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                <div className="size-6 bg-white/20 rounded" />
                <p className="text-xs font-bold">Visa / MC</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Company</h4>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/contact" className="hover:text-foreground transition-colors">About</Link>
                <Link to="/contact" className="hover:text-foreground transition-colors">Careers</Link>
                <Link to="/contact" className="hover:text-foreground transition-colors">Support</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Artists</h4>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/artist-dashboard" className="hover:text-foreground transition-colors">Artist Portal</Link>
                <Link to="/artist-dashboard" className="hover:text-foreground transition-colors">Upload Center</Link>
                <Link to="/subscriptions" className="hover:text-foreground transition-colors">Monetization</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Listeners</h4>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/browse" className="hover:text-foreground transition-colors">Browse</Link>
                <Link to="/subscriptions" className="hover:text-foreground transition-colors">Premium</Link>
                <Link to="/dashboard" className="hover:text-foreground transition-colors">My Library</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Legal</h4>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
                <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
              </nav>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">© 2025 Wesu+ Music Streaming</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Lusaka, Zambia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
