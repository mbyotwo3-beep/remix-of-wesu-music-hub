import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { searchSongs } from "@/lib/music.functions";
import { usePlayer } from "@/stores/player";
import { Play } from "lucide-react";
import { usePlatform } from "@/hooks/use-platform";
import { MobileBrowse } from "@/components/mobile/screens/MobileBrowse";

const browseQO = queryOptions({
  queryKey: ["browse-songs"],
  queryFn: () => searchSongs({ data: {} }),
});

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Music — Wesu+" },
      { name: "description", content: "Discover and stream the best Zambian and African music on Wesu+." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(browseQO),
  component: BrowseRoute,
  errorComponent: ({ error }) => <div className="p-12 text-center">Failed: {error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function BrowseRoute() {
  const platform = usePlatform();
  return platform === "native" ? <MobileBrowse /> : <BrowsePage />;
}

function BrowsePage() {
  const { data: songs } = useSuspenseQuery(browseQO);
  const setTrack = usePlayer((s) => s.setTrack);

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Browse Music</h1>
        <p className="text-muted-foreground mb-8">Every track on Wesu+.</p>

        {songs.length === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-2xl text-center">
            <p className="text-muted-foreground mb-2">No music has been uploaded yet.</p>
            <Link to="/artist-dashboard" className="text-primary text-sm hover:underline">
              Are you an artist? Upload your first track →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {songs.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  setTrack({
                    id: s.id,
                    title: s.title,
                    artistName: (s.artist as { name?: string } | null)?.name ?? "Unknown",
                    coverUrl: s.cover_url,
                    durationSeconds: s.duration,
                  })
                }
                className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors text-left"
              >
                <div className="size-14 rounded bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                  {s.cover_url ? (
                    <img src={s.cover_url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <Play className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {(s.artist as { name?: string } | null)?.name ?? "Unknown"} · {s.genre ?? "—"}
                  </p>
                </div>
                <span className="text-primary text-sm font-bold">K{Number(s.price ?? 0).toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
