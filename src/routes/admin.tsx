import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, Music, CreditCard, Shield, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { getPlatformStats, getRecentActivity } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — Wesu+" }],
  }),
  component: AdminPage,
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const statsFn = useServerFn(getPlatformStats);
  const activityFn = useServerFn(getRecentActivity);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const statsQ = useQuery({
    queryKey: ["admin-stats", user?.id],
    queryFn: () => statsFn(),
    enabled: !!user,
    retry: false,
  });

  const activityQ = useQuery({
    queryKey: ["admin-activity", user?.id],
    queryFn: () => activityFn(),
    enabled: !!user,
    retry: false,
  });

  if (loading || !user) return null;

  if (statsQ.error) {
    return (
      <div className="max-w-md mx-auto p-12 text-center">
        <Shield className="size-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-xl font-bold mb-2">Admin access required</h1>
        <p className="text-sm text-muted-foreground">Only users with the admin role can view this page.</p>
      </div>
    );
  }

  const stats = statsQ.data
    ? [
        { label: "Total Users", value: statsQ.data.totalUsers.toLocaleString(), icon: Users, color: "text-blue-400" },
        { label: "Total Songs", value: statsQ.data.totalSongs.toLocaleString(), icon: Music, color: "text-purple-400" },
        { label: "Premium Subs", value: statsQ.data.premiumSubscribers.toLocaleString(), icon: CreditCard, color: "text-green-400" },
        { label: "Revenue (30d)", value: `ZMW ${statsQ.data.monthlyRevenueZmw.toFixed(2)}`, icon: BarChart3, color: "text-primary" },
      ]
    : null;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card border border-white/5 rounded-2xl p-6">
                <stat.icon className={`size-5 ${stat.color} mb-3`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
            {!activityQ.data || activityQ.data.recentSongs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No uploads yet.</p>
            ) : (
              <div className="space-y-3">
                {activityQ.data.recentSongs.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <Music className="size-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(s.artist as { name?: string } | null)?.name ?? "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            {!activityQ.data || activityQ.data.recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {activityQ.data.recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div>
                      <p className="text-sm font-medium">ZMW {Number(t.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{t.method_code}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        t.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : t.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
