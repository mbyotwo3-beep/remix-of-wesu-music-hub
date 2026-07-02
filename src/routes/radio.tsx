import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Search, Globe, Music } from "lucide-react";

interface RadioStation {
  id: string;
  name: string;
  country: string;
  genre: string;
  url: string;
  favicon?: string;
}

const radioStations: RadioStation[] = [
  // US Stations
  { id: "1", name: "BBC Radio 1", country: "UK", genre: "Pop", url: "http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one" },
  { id: "2", name: "BBC Radio 2", country: "UK", genre: "Adult Contemporary", url: "http://stream.live.vc.bbcmedia.co.uk/bbc_radio_two" },
  { id: "3", name: "KCRW", country: "USA", genre: "Eclectic", url: "https://stream.kcrw.com/kcrw_192k_aac" },
  { id: "4", name: "WNYC", country: "USA", genre: "Talk", url: "https://fm939.wnyc.org/wnyc-fm939" },
  { id: "5", name: "KEXP", country: "USA", genre: "Alternative", url: "https://live-mp3-128.kexp.org/kexp128.mp3" },
  // Europe Stations
  { id: "6", name: "FIP", country: "France", genre: "Eclectic", url: "http://direct.fipmeta.live/fip.mp3" },
  { id: "7", name: "Radio Paradise", country: "USA", genre: "Eclectic", url: "http://stream.radioparadise.com/mp3-192" },
  { id: "8", name: "NPO Radio 2", country: "Netherlands", genre: "Pop", url: "https://stream.npo.nl/radio2-bb-mp3" },
  { id: "9", name: "DR P3", country: "Denmark", genre: "Pop", url: "https://dr-lyd-01.akamaihd.net/p3_128.mp3" },
  { id: "10", name: "SRF 3", country: "Switzerland", genre: "Pop", url: "https://stream.srg-ssr.ch/m/drs3/mp3_128" },
  // Asia Stations
  { id: "11", name: "J-Wave", country: "Japan", genre: "Pop", url: "https://mtls.fmsrv.org/j-wave" },
  { id: "12", name: "InterFM", country: "Japan", genre: "International", url: "https://fm-inter.ice.infomaniak.ch/fm-inter-128.mp3" },
  { id: "13", name: "Radio Singapore", country: "Singapore", genre: "Pop", url: "https://mediaworks-singapore-ssl.akamaized.net/hls/live/2038530/radio1/master.m3u8" },
  // Latin America Stations
  { id: "14", name: "Radio Disney", country: "Argentina", genre: "Pop", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/DISNEY_LATINO.mp3" },
  { id: "15", name: "Radio Nacional", country: "Argentina", genre: "Various", url: "http://radios.rtva.ar/radio-nacional-896" },
  // Africa Stations
  { id: "16", name: "Radio France Internationale", country: "France", genre: "News", url: "http://rfk64k-128k-mp3.rfi.fr/live" },
  { id: "17", name: "BBC World Service", country: "UK", genre: "News", url: "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  // Electronic/Dance Stations
  { id: "18", name: "Ibiza Global Radio", country: "Spain", genre: "Electronic", url: "http://ibizaglobalradio.streaming-pro.com:8024/ibizaglobalradio.mp3" },
  { id: "19", name: "Deep House Lounge", country: "USA", genre: "Deep House", url: "http://198.15.94.34:8000/stream" },
  { id: "20", name: "Chillout Lounge", country: "USA", genre: "Chillout", url: "http://stream.zeno.fm/7340y065y18uv" },
  // Jazz Stations
  { id: "21", name: "WBGO", country: "USA", genre: "Jazz", url: "http://wbgo.streamguys1.com/live" },
  { id: "22", name: "Jazz FM", country: "UK", genre: "Jazz", url: "http://tx.sharp-stream.com/icecast.php?mount=jazzfm.mp3" },
  // Classical Stations
  { id: "23", name: "BBC Radio 3", country: "UK", genre: "Classical", url: "http://stream.live.vc.bbcmedia.co.uk/bbc_radio_three" },
  { id: "24", name: "Classic FM", country: "UK", genre: "Classical", url: "http://media-ice.musicradio.com/ClassicFMMP3" },
];

export function Route() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredStations = radioStations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueCountries = Array.from(new Set(radioStations.map((s) => s.country)));
  const uniqueGenres = Array.from(new Set(radioStations.map((s) => s.genre)));

  const playStation = (station: RadioStation) => {
    if (audioRef.current) {
      audioRef.current.src = station.url;
      audioRef.current.play();
      setSelectedStation(station);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="size-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              World Radio
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Listen to free IP radio stations from around the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stations, countries, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-input rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Now Playing Bar */}
        {selectedStation && (
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40">
            <div className="container mx-auto flex items-center justify-between max-w-4xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Music className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedStation.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStation.country} • {selectedStation.genre}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 ml-1" />}
                </button>
                <div className="flex items-center gap-2">
                  <Volume2 className="size-5 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tags */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSearchQuery("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchQuery === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {uniqueCountries.slice(0, 5).map((country) => (
              <button
                key={country}
                onClick={() => setSearchQuery(country)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchQuery === country
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {uniqueGenres.slice(0, 6).map((genre) => (
              <button
                key={genre}
                onClick={() => setSearchQuery(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchQuery === genre
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => (
            <div
              key={station.id}
              className={`bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer group ${
                selectedStation?.id === station.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => playStation(station)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {station.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="size-4" />
                    {station.country}
                  </div>
                </div>
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
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
              <div className="flex items-center gap-2">
                <Music className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{station.genre}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <Music className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stations found matching your search.</p>
          </div>
        )}
      </div>

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
