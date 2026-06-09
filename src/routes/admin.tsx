import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Music, CreditCard, Shield, BarChart3, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Wesu+" },
      { name: "description", content: "Wesu+ admin management panel." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const stats = [
    { label: "Total Users", value: "12,450", icon: Users, color: "text-blue-400" },
    { label: "Total Songs", value: "8,230", icon: Music, color: "text-purple-400" },
    { label: "Premium Subscribers", value: "3,120", icon: CreditCard, color: "text-green-400" },
    { label: "Revenue (Monthly)", value: "ZMW 140,400", icon: BarChart3, color: "text-primary" },
  ];

  const pendingApprovals = [
    { id: 1, artist: "New Artist A", type: "Track Upload", title: "Summer Vibes", date: "2024-06-08" },
    { id: 2, artist: "DJ Zed", type: "Album Upload", title: "Club Hits 2024", date: "2024-06-07" },
    { id: 3, artist: "Gospel Star", type: "Track Upload", title: "Hallelujah", date: "2024-06-07" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-white/5 rounded-2xl p-6">
              <stat.icon className={`size-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-5 text-yellow-400" />
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                  <div className="size-10 rounded bg-secondary shrink-0 flex items-center justify-center">
                    <Music className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.artist} — {item.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Activity</h2>
            <div className="space-y-4">
              {[
                { event: "New user registered", detail: "user@email.com", time: "2 min ago" },
                { event: "Track uploaded", detail: "Copperbelt Dreams by Z-Star", time: "15 min ago" },
                { event: "Premium subscription", detail: "Monthly plan — MTN MoMo", time: "32 min ago" },
                { event: "Playlist created", detail: "Zed Vibes by user123", time: "1 hr ago" },
                { event: "Artist verification", detail: "New Artist A approved", time: "2 hrs ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
