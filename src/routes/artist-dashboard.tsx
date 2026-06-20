import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Upload, TrendingUp, DollarSign, Music, BarChart3 } from "lucide-react";
import { useEffect } from "react";
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
          Apply for an artist account to start uploading music. An admin will review your application.
        </p>
        <a href="/become-artist" className="inline-block px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold">Apply now</a>
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
            <a href="/artist-studio" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground inline-flex items-center gap-2">
              <Upload className="size-4" /> Open Studio
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-6">
              <stat.icon className="size-5 text-primary mb-4" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="size-5" />
            Top Tracks
          </h2>
          {data.topSongs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracks yet. Open Studio to upload your first song.</p>
          ) : (
            <div className="space-y-2">
              {data.topSongs.map((track, i) => (
                <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
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
      </div>
    </div>
  );
}
