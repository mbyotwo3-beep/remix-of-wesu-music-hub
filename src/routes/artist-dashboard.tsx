import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Upload, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";

export const Route = createFileRoute("/artist-dashboard")({
  head: () => ({
    meta: [
      { title: "Artist Dashboard — Wesu+" },
      { name: "description", content: "Upload music and track your revenue on Wesu+." },
    ],
  }),
  component: ArtistDashboardPage,
});

function ArtistDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "upload" | "analytics">("overview");

  const revenueStats = [
    { label: "Total Revenue", value: "ZMW 4,820.00", icon: DollarSign, change: "+12%" },
    { label: "Monthly Streams", value: "12,450", icon: TrendingUp, change: "+8%" },
    { label: "Followers", value: "3,280", icon: Users, change: "+24%" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Artist Dashboard</h1>
            <p className="text-muted-foreground">Manage your music and track performance.</p>
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
              {revenueStats.map((stat) => (
                <div key={stat.label} className="bg-card border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="size-5 text-primary" />
                    <span className="text-xs font-medium text-green-400">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="size-5" />
                Revenue Analytics
              </h2>
              <div className="h-48 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div
                      className="w-full bg-primary/40 rounded-t-sm hover:bg-primary transition-colors"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </div>

            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Top Tracks</h2>
              <div className="space-y-2">
                {["Lusaka Heatwave", "Copperbelt Dreams", "Kwacha Vibes", "Zambezi Echoes", "Midnight Rituals"].map(
                  (track, i) => (
                    <div key={track} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="w-6 text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <div className="size-10 rounded bg-secondary shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{track}</p>
                        <p className="text-xs text-muted-foreground">{(5 - i) * 1240} streams</p>
                      </div>
                      <span className="text-sm font-medium">ZMW {(5 - i) * 156}.00</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "upload" && (
          <div className="bg-card border border-white/5 rounded-2xl p-8 max-w-2xl">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Upload className="size-5 text-primary" />
              Upload Music
            </h2>
            <p className="text-muted-foreground mb-6">Upload your tracks, albums, and artwork.</p>

            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-primary/30 transition-colors cursor-pointer">
              <Upload className="size-8 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-1">Drag & drop your audio files</p>
              <p className="text-sm text-muted-foreground">MP3, WAV, FLAC up to 50MB</p>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Track Title</label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Album (optional)</label>
                <input
                  type="text"
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground">
                  <option>Zamrock</option>
                  <option>Kalindula</option>
                  <option>Amapiano</option>
                  <option>Hip Hop</option>
                  <option>Gospel</option>
                  <option>R&B</option>
                  <option>Pop</option>
                </select>
              </div>
              <button className="w-full py-3 bg-primary text-obsidian rounded-xl font-bold hover:brightness-110 transition-all">
                Upload Track
              </button>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Detailed Analytics</h2>
            <p className="text-muted-foreground">Coming soon — detailed listener demographics, geographic data, and revenue breakdowns.</p>
          </div>
        )}
      </div>
    </div>
  );
}
