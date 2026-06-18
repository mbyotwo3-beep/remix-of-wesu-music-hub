import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Music2 } from "lucide-react";
import { usePlayer } from "@/stores/player";

export function PlayerBar() {
  const track = usePlayer((s) => s.track);
  const playing = usePlayer((s) => s.playing);
  const liked = usePlayer((s) => s.liked);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const toggleLike = usePlayer((s) => s.toggleLike);

  if (!track) return null;

  const dur = track.durationSeconds ?? 0;
  const durLabel = dur ? `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, "0")}` : "—";

  return (
    <div className="fixed bottom-0 inset-x-0 h-20 bg-obsidian/95 backdrop-blur-xl border-t border-white/10 z-50 px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className="size-12 rounded-md overflow-hidden bg-card shrink-0 ring-1 ring-white/10 flex items-center justify-center">
            {track.coverUrl ? (
              <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <Music2 className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-medium truncate">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
          </div>
          <button onClick={toggleLike} className="hidden sm:block">
            <Heart className={`size-4 ${liked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 w-1/3">
          <div className="flex items-center gap-6">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipBack className="size-4" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-foreground text-obsidian p-2.5 rounded-full hover:scale-105 transition-transform"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="size-4" />
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">0:00</span>
            <div className="flex-1 h-1 bg-muted rounded-full relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full rounded-full bg-primary" style={{ width: "0%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">{durLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3">
          <Volume2 className="size-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
