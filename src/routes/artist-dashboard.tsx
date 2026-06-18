import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Upload, TrendingUp, DollarSign, Music, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { getMyArtistOverview } from "@/lib/user.functions";

export const Route = createFileRoute("/artist-dashboard")({
  head: () => ({
    meta: [{ title: "Artist Dashboard — Wesu+" }],
  }),
  component: ArtistDashboardPage,
  errorComponent: ({ error }) => <div className="p-12 text-center">Failed: {error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function ArtistDashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchOverview = useServerFn(getMyArtistOverview);
  const [activeTab, setActiveTab] = useState<"overview" | "upload" | "analytics">("overview");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["artist-overview", user?.id],
    queryFn: () => fetchOverview(),
    enabled: !!user,
  });

  if (loading || !user) return null;
  if (isLoading || !data) return <div className="p-12 text-center text-muted-foreground">Loading…</div>;

  if (!data.artist) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center">
        <Music className="size-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">You're not an artist yet</h1>
        <p className="text-muted-foreground mb-6">
          Create an artist profile from the Admin panel or contact support to enable music uploads.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: `ZMW ${data.totalRevenueZmw.toFixed(2)}`, icon: DollarSign },
    { label: "Total Plays", value: data.totalPlays.toLocaleString(), icon: TrendingUp },
    { label: "Songs", value: String(data.totalSongs), icon: Music },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{data.artist.name}</h1>
            <p className="text-muted-foreground">Artist Dashboard</p>
          </div>
          <div className="flex gap-2">
            {(["overview", "upload", "analytics"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-obsidian"
                    : "bg-card border border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-white/5 rounded-2xl p-6">
                  <stat.icon className="size-5 text-primary mb-4" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="size-5" />
                Top Tracks
              </h2>
              {data.topSongs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tracks yet. Upload your first song from the Upload tab.</p>
              ) : (
                <div className="space-y-2">
                  {data.topSongs.map((track, i) => (
                    <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="w-6 text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{track.title}</p>
                        <p className="text-xs text-muted-foreground">{(track.play_count ?? 0).toLocaleString()} streams</p>
                      </div>
                      <span className="text-sm font-medium">ZMW {Number(track.price ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "upload" && (
          <div className="bg-card border border-white/5 rounded-2xl p-8 max-w-2xl">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Upload className="size-5 text-primary" />
              Upload Music
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Drag & drop your audio file. Files are uploaded directly to secure storage; metadata is saved to the database.
            </p>
            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center text-muted-foreground text-sm">
              Upload UI coming next. The backend storage bucket <code className="text-xs">song-audio</code> is ready and only you can write to your own folder.
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Detailed Analytics</h2>
            <p className="text-muted-foreground text-sm">Coming soon — listener demographics, geo data, and revenue breakdowns.</p>
          </div>
        )}
      </div>
    </div>
  );
}
