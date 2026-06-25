import { useNavigate } from "@tanstack/react-router";
import { Loader2, Music2, Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "@/stores/player";

/**
 * Persistent mini player rendered above BottomTabBar when a track is loaded.
 * Feature: wesu-plus-completion
 */
export function MiniPlayer() {
  const track = usePlayer((s) => s.track);
  const playing = usePlayer((s) => s.playing);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const navigate = useNavigate();

  if (!track) return null;

  // Show loading when track is set but audioUrl is not resolved yet
  const isLoading = track.audioUrl === undefined;

  return (
    <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] inset-x-0 h-16 bg-foreground/10 backdrop-blur-xl border-t border-border z-40 flex items-center px-4 gap-3">
      {/* Tappable info area → navigate to /now-playing */}
      <button
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={() => navigate({ to: "/now-playing" as any })}
        aria-label="Open now playing"
      >
        <div className="size-10 rounded-md overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <Music2 className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate leading-tight">{track.title}</p>
          <p className="text-xs text-muted-foreground truncate leading-tight">{track.artistName}</p>
        </div>
      </button>

      {/* Controls */}
      <div className="flex items-center shrink-0">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground disabled:opacity-50"
          aria-label={playing ? "Pause" : "Play"}
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : playing ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5" />
          )}
        </button>
        <button
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground"
          aria-label="Next"
        >
          <SkipForward className="size-5" />
        </button>
      </div>
    </div>
  );
}
