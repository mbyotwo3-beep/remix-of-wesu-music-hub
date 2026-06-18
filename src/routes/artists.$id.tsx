import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getArtistById } from "@/lib/music.functions";
import { CheckCircle2, User } from "lucide-react";
import { usePlayer } from "@/stores/player";

const artistQO = (id: string) =>
  queryOptions({
    queryKey: ["artist", id],
    queryFn: () => getArtistById({ data: { id } }),
  });

export const Route = createFileRoute("/artists/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(artistQO(params.id));
    if (!data.artist) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.artist?.name ?? "Artist"} — Wesu+` },
      { name: "description", content: loaderData?.artist?.bio?.slice(0, 160) ?? "Artist profile on Wesu+" },
    ],
  }),
  component: ArtistPage,
  errorComponent: ({ error }) => <div className="p-12 text-center">Failed: {error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Artist not found.</div>,
});

function ArtistPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(artistQO(id));
  const setTrack = usePlayer((s) => s.setTrack);
  const a = data.artist!;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="size-48 rounded-2xl overflow-hidden bg-card ring-1 ring-white/5 shrink-0 flex items-center justify-center">
            {a.avatar_url ? (
              <img src={a.avatar_url} alt={a.name} className="w-full h-full object-cover" />
            ) : (
              <User className="size-16 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              {a.name}
              {a.verified && <CheckCircle2 className="size-6 text-primary" />}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{a.genre ?? "—"} · {a.monthly_listeners ?? 0} monthly listeners</p>
            {a.bio && <p className="text-sm mt-4 max-w-2xl">{a.bio}</p>}
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Top Songs</h2>
          {data.topSongs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No songs yet.</p>
          ) : (
            <div className="space-y-1">
              {data.topSongs.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setTrack({ id: s.id, title: s.title, artistName: a.name, coverUrl: s.cover_url, durationSeconds: s.duration })}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <span className="w-6 text-sm text-muted-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.play_count ?? 0} plays</p>
                  </div>
                  <span className="text-primary text-sm font-bold">K{Number(s.price ?? 0).toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          {data.albums.length === 0 ? (
            <p className="text-muted-foreground text-sm">No albums yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {data.albums.map((al) => (
                <Link key={al.id} to="/albums" className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-card ring-1 ring-white/5 mb-2">
                    {al.cover_url && <img src={al.cover_url} alt={al.title} className="w-full h-full object-cover" />}
                  </div>
                  <p className="font-semibold text-sm truncate">{al.title}</p>
                  <p className="text-xs text-muted-foreground">K{Number(al.price ?? 0).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
