import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getArtistById } from "@/lib/music.functions";
import { CheckCircle2, User, Play, Clock, Music, MoreHorizontal, Award } from "lucide-react";
import { usePlayer } from "@/stores/player";
import { useState } from "react";

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
      {
        name: "description",
        content: loaderData?.artist?.bio?.slice(0, 160) ?? "Artist profile on Wesu+",
      },
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
  const [isFollowing, setIsFollowing] = useState(false);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Spotify-style Hero Header Banner */}
        <div className="relative w-full h-[280px] md:h-[380px] overflow-hidden rounded-3xl mb-8 shadow-xl group bg-card border border-border">
          {/* Background blurred image */}
          {a.avatar_url ? (
            <img
              src={a.avatar_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-110 opacity-35 dark:opacity-20 transition-all duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-brand/10 to-transparent" />
          )}

          {/* Deep glassmorphic mesh gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden md:block" />

          {/* Banner Content */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col md:flex-row items-end gap-6 md:gap-8 justify-end md:justify-start">
            {/* Massive Circular Avatar */}
            <div className="relative size-28 md:size-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl shrink-0 group/avatar bg-secondary flex items-center justify-center">
              {a.avatar_url ? (
                <img
                  src={a.avatar_url}
                  alt={a.name}
                  className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-500"
                />
              ) : (
                <User className="size-14 text-muted-foreground" />
              )}
            </div>

            {/* Artist Info */}
            <div className="flex flex-col justify-end text-foreground md:text-white dark:text-white pb-2">
              <div className="flex items-center gap-1.5 bg-primary/15 md:bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase text-primary md:text-white/90 border border-primary/20 md:border-white/15 w-fit mb-2 md:mb-3">
                <CheckCircle2 className="size-3.5 fill-current text-primary md:text-white" />
                Verified Artist
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 drop-shadow-sm leading-none font-display text-foreground md:text-white dark:text-white">
                {a.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm font-medium text-muted-foreground md:text-white/80">
                <span className="bg-secondary md:bg-white/15 px-2 py-0.5 rounded text-xs">
                  {a.genre ?? "Artist"}
                </span>
                <span className="hidden md:inline">•</span>
                <span>{Number(a.monthly_listeners ?? 0).toLocaleString()} monthly listeners</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spotify-style Action Bar */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 bg-card border border-border rounded-2xl p-4 shadow-sm">
          {/* Play Button */}
          {data.topSongs.length > 0 && (
            <button
              onClick={() => {
                const first = data.topSongs[0];
                setTrack({
                  id: first.id,
                  title: first.title,
                  artistName: a.name,
                  coverUrl: first.cover_url,
                  durationSeconds: first.duration,
                });
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full size-12 md:size-14 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group/play cursor-pointer"
              title="Play Popular"
            >
              <Play className="size-5 md:size-6 fill-current translate-x-0.5 group-hover/play:scale-110 transition-transform" />
            </button>
          )}

          {/* Follow Button */}
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all border shadow-sm cursor-pointer ${
              isFollowing
                ? "bg-foreground text-background border-transparent"
                : "bg-transparent border-border text-foreground hover:border-foreground"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>

          {/* More actions */}
          <button className="p-2.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-all hover:bg-secondary cursor-pointer">
            <MoreHorizontal className="size-5" />
          </button>

          {/* About / Bio preview on the right */}
          <div className="hidden lg:flex items-center gap-2 ml-auto text-xs text-muted-foreground max-w-xs truncate">
            <Award className="size-4 text-primary shrink-0" />
            <span>Top artist in {a.genre ?? "African Music"}</span>
          </div>
        </div>

        {/* Popular Songs Section */}
        <section className="mb-12 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight font-display text-foreground">
              Popular Songs
            </h2>
            <span className="text-xs text-muted-foreground">Click any song to play</span>
          </div>

          {data.topSongs.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No songs available.</p>
          ) : (
            <div className="space-y-1">
              {/* Table header */}
              <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border mb-2">
                <span className="w-8 text-center">#</span>
                <span className="flex-1 ml-4">Title</span>
                <span className="w-24 hidden md:block text-right">Plays</span>
                <span className="w-24 text-right">Price</span>
                <span className="w-16 text-right flex justify-end pr-2">
                  <Clock className="size-4" />
                </span>
              </div>

              {data.topSongs.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setTrack({
                      id: s.id,
                      title: s.title,
                      artistName: a.name,
                      coverUrl: s.cover_url,
                      durationSeconds: s.duration,
                    })
                  }
                  className="w-full flex items-center p-3 rounded-xl hover:bg-secondary/50 dark:hover:bg-white/5 transition-all text-left group cursor-pointer"
                >
                  {/* Song index or play icon */}
                  <div className="w-8 flex items-center justify-center text-sm font-semibold text-muted-foreground">
                    <span className="group-hover:hidden">{i + 1}</span>
                    <Play className="size-4 text-primary fill-current hidden group-hover:block" />
                  </div>

                  {/* Album art & title */}
                  <div className="flex-1 flex items-center ml-4 min-w-0">
                    <div className="size-10 rounded-lg overflow-hidden bg-secondary border border-border shrink-0 mr-3 shadow-sm relative group-hover:scale-95 transition-transform">
                      {s.cover_url ? (
                        <img src={s.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="size-5 text-muted-foreground absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {s.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground md:hidden mt-0.5">
                        {Number(s.play_count ?? 0).toLocaleString()} plays
                      </p>
                    </div>
                  </div>

                  {/* Play count */}
                  <span className="w-24 hidden md:block text-right text-sm text-muted-foreground font-medium">
                    {Number(s.play_count ?? 0).toLocaleString()}
                  </span>

                  {/* Price */}
                  <span className="w-24 text-right text-sm font-bold text-primary">
                    {Number(s.price ?? 0) === 0 ? "Free" : `K${Number(s.price ?? 0).toFixed(2)}`}
                  </span>

                  {/* Duration */}
                  <span className="w-16 text-right text-sm text-muted-foreground font-medium pr-2">
                    {formatDuration(s.duration)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Albums Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight font-display text-foreground">
              Albums & Singles
            </h2>
            <span className="text-xs text-muted-foreground">Discography</span>
          </div>

          {data.albums.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No albums or singles released yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {data.albums.map((al) => (
                <Link
                  key={al.id}
                  to="/albums"
                  className="bg-card border border-border rounded-2xl p-4 hover:shadow-xl hover:scale-[1.02] hover:border-primary/20 transition-all group flex flex-col cursor-pointer shadow-sm"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary mb-3 shadow-md border border-border relative">
                    {al.cover_url ? (
                      <img
                        src={al.cover_url}
                        alt={al.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Music className="size-12 text-muted-foreground absolute inset-0 m-auto" />
                    )}
                    {/* Play button overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-primary text-white rounded-full p-3 shadow-lg hover:scale-110 active:scale-95 transition-transform">
                        <Play className="size-5 fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {al.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      {al.release_date ? new Date(al.release_date).getFullYear() : "Album"}
                    </p>
                    <p className="text-xs font-black text-primary">
                      {Number(al.price ?? 0) === 0
                        ? "Free"
                        : `K${Number(al.price ?? 0).toFixed(2)}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* About Section */}
        {a.bio && (
          <section>
            <h2 className="text-xl font-bold tracking-tight font-display text-foreground mb-6">
              About the Artist
            </h2>
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm flex flex-col justify-end min-h-[280px] group">
              {/* Background gradient graphics/mesh */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 via-primary/5 to-transparent pointer-events-none" />
              {a.avatar_url && (
                <img
                  src={a.avatar_url}
                  alt=""
                  className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-10 dark:opacity-5 hidden md:block pointer-events-none"
                  style={{
                    maskImage: "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))",
                    WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))",
                  }}
                />
              )}

              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Biography
                  </span>
                </div>
                <p className="text-base md:text-lg text-foreground/95 leading-relaxed font-medium">
                  {a.bio}
                </p>

                {/* Extended info grid */}
                <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-border/60">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      Genre
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {a.genre ?? "General"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      Monthly Reach
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {Number(a.monthly_listeners ?? 0).toLocaleString()} Listeners
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      WESU+ Member Since
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                          })
                        : "Recently"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
