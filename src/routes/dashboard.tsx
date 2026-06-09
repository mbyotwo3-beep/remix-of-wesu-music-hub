import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Headphones, Heart, ListMusic, Clock } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Wesu+" },
      { name: "description", content: "Your personal music dashboard on Wesu+." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const stats = [
    { label: "Songs Played", value: "1,248", icon: Headphones },
    { label: "Favorites", value: "86", icon: Heart },
    { label: "Playlists", value: "12", icon: ListMusic },
    { label: "Hours Listened", value: "142h", icon: Clock },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back to your music hub.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-white/5 rounded-2xl p-6">
              <stat.icon className="size-5 text-primary mb-3" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recently Played</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="size-10 rounded bg-secondary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Track Title {i}</p>
                    <p className="text-xs text-muted-foreground">Artist Name</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3:2{i}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">My Playlists</h2>
            <div className="space-y-3">
              {["Zed Vibes", "Late Night", "Workout Mix", "Sunday Chill", "Road Trip"].map((name) => (
                <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="size-10 rounded bg-secondary shrink-0 flex items-center justify-center">
                    <ListMusic className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">24 songs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
