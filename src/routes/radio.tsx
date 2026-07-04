import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Volume2, Search, Globe, Music, Loader2, Radio } from "lucide-react";
import { usePlayer } from "@/stores/player";

interface RadioStation {
  id: string;
  name: string;
  country: string;
  genre: string;
  url: string;
  favicon?: string;
}

export const Route = createFileRoute("/radio")({
  component: RadioPage,
});

function parseM3U(text: string): RadioStation[] {
  const lines = text.split("\n");
  const stations: RadioStation[] = [];
  let currentStation: Partial<RadioStation> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXTINF:")) {
      // tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const logo = logoMatch ? logoMatch[1] : undefined;

      // group-title
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const genre = groupMatch ? groupMatch[1] : "General";

      // station name
      const nameParts = line.split(",");
      const name = nameParts[nameParts.length - 1].trim();

      currentStation = {
        name,
        favicon: logo,
        genre: genre || "General",
        country: "Global",
      };
    } else if (line && !line.startsWith("#")) {
      if (currentStation.name) {
        currentStation.url = line;
        currentStation.id = `radio-${stations.length + 1}`;
        stations.push(currentStation as RadioStation);
        currentStation = {};
      }
    }
  }
  return stations;
}

function RadioPage() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [visibleCount, setVisibleCount] = useState(100);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const exitSong = usePlayer((s) => s.exitSong);

  useEffect(() => {
    async function loadStations() {
      try {
        setLoading(true);
        const res = await fetch("https://iprd-org.github.io/iprd/site_data/all_stations.m3u");
        if (!res.ok) throw new Error("Failed to load radio playlist");
        const text = await res.text();
        const parsed = parseM3U(text);
        setStations(parsed);
        setError(null);
      } catch (err: any) {
        setError(err.message || "An error occurred while loading stations");
      } finally {
        setLoading(false);
      }
    }
    loadStations();
  }, []);

  const filteredStations = useMemo(() => {
    if (!searchQuery) return stations;
    const query = searchQuery.toLowerCase();
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.genre.toLowerCase().includes(query)
    );
  }, [stations, searchQuery]);

  const displayedStations = useMemo(() => {
    return filteredStations.slice(0, visibleCount);
  }, [filteredStations, visibleCount]);

  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    stations.forEach((s) => {
      s.genre.split(",").forEach((g) => {
        const trimmed = g.trim();
        if (trimmed && trimmed !== "General") genres.add(trimmed);
      });
    });
    return Array.from(genres).slice(0, 12);
  }, [stations]);

  const playStation = (station: RadioStation) => {
    // Exit global music player so they do not overlap
    exitSong();

    if (audioRef.current) {
      audioRef.current.src = station.url;
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
      });
      setSelectedStation(station);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Playback failed:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Radio className="size-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              World Radio
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Stream free IP radio stations dynamically from around the globe.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by station name, genre, or query..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(100); // reset visible stations count
              }}
              className="w-full bg-card border border-border rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground placeholder:text-muted-foreground shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching radio playlist...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Filter Tags */}
            {uniqueGenres.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setVisibleCount(100);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors ${
                      searchQuery === ""
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    All Stations
                  </button>
                  {uniqueGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        setSearchQuery(genre);
                        setVisibleCount(100);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors ${
                        searchQuery.toLowerCase() === genre.toLowerCase()
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedStations.map((station) => (
                <div
                  key={station.id}
                  className={`bg-card border border-border/60 rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between ${
                    selectedStation?.id === station.id ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                  onClick={() => playStation(station)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                        {station.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="size-3.5" />
                        {station.country}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedStation?.id === station.id) {
                          togglePlay();
                        } else {
                          playStation(station);
                        }
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        selectedStation?.id === station.id && isPlaying
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      {selectedStation?.id === station.id && isPlaying ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="size-4 ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {station.favicon ? (
                      <img
                        src={station.favicon}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        className="size-5 rounded-md object-cover"
                      />
                    ) : (
                      <Music className="size-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground truncate">{station.genre}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {filteredStations.length > visibleCount && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 100)}
                  className="px-6 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-full text-sm font-semibold transition-colors"
                >
                  Load More Stations
                </button>
              </div>
            )}

            {filteredStations.length === 0 && (
              <div className="text-center py-12">
                <Music className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No stations found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Now Playing Bar */}
      {selectedStation && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40 shadow-lg">
          <div className="container mx-auto flex items-center justify-between max-w-4xl gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                {selectedStation.favicon ? (
                  <img
                    src={selectedStation.favicon}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Music className="size-6 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{selectedStation.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedStation.genre}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-1" />}
              </button>
              <div className="flex items-center gap-2">
                <Volume2 className="size-5 text-muted-foreground shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 sm:w-28 accent-primary h-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  );
}
