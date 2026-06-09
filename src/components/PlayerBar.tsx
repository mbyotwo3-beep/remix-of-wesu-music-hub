import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";
import { useState } from "react";

export function PlayerBar() {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const progress = 35;

  return (
    <div className="fixed bottom-0 inset-x-0 h-20 bg-obsidian/95 backdrop-blur-xl border-t border-white/10 z-50 px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className="size-12 rounded-md overflow-hidden bg-card shrink-0 ring-1 ring-white/10">
            <img src="/images/album-cover-1.jpg" alt="Album" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-medium truncate">Kalindula Night</p>
            <p className="text-xs text-muted-foreground truncate">Yo Maps</p>
          </div>
          <button onClick={() => setLiked(!liked)} className="hidden sm:block">
            <Heart className={`size-4 ${liked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 w-1/3">
          <div className="flex items-center gap-6">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipBack className="size-4" />
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="bg-foreground text-obsidian p-2.5 rounded-full hover:scale-105 transition-transform"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="size-4" />
            </button>
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">1:24</span>
            <div className="flex-1 h-1 bg-muted rounded-full relative overflow-hidden cursor-pointer">
              <div className="absolute left-0 top-0 h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">3:45</span>
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex gap-0.5 items-end h-3">
              <div className="w-0.5 bg-primary animate-pulse" style={{ height: "40%", animationDuration: "0.8s" }} />
              <div className="w-0.5 bg-primary animate-pulse" style={{ height: "80%", animationDuration: "1.2s" }} />
              <div className="w-0.5 bg-primary animate-pulse" style={{ height: "60%", animationDuration: "0.6s" }} />
              <div className="w-0.5 bg-primary animate-pulse" style={{ height: "90%", animationDuration: "1.0s" }} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Hi-Fi</span>
          </div>
          <Volume2 className="size-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
