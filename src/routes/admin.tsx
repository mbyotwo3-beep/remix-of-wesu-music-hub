import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, Music, CreditCard, Shield, BarChart3, Check, X, Building2 } from "lucide-react";
import { useState } from "react";
import { RoleGate } from "@/components/RoleGate";
import {
  getPlatformStats,
  getRecentActivity,
  listPendingSongs,
  moderateSong,
  listPendingArtists,
  moderateArtist,
  listPendingLabels,
  moderateLabel,
} from "@/lib/admin.functions";
import { usePlatform } from "@/hooks/use-platform";
import { MobileAdmin } from "@/components/mobile/screens/MobileAdmin";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Wesu+" }] }),
  component: () => (
    <RoleGate require="admin">
      <AdminRoute />
    </RoleGate>
  ),
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function AdminRoute() {
  const platform = usePlatform();
  return platform === "native" ? <MobileAdmin /> : <AdminPage />;
}

type Tab = "overview" | "songs" | "artists" | "labels";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin</h1>
        </div>
        <div className="flex gap-2 mb-8 border-b border-border pb-3">
          {(["overview", "songs", "artists", "labels"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "overview" && <Overview />}
        {tab === "songs" && <SongMod />}
        {tab === "artists" && <ArtistMod />}
        {tab === "labels" && <LabelMod />}
      </div>
    </div>
  );
}

function LabelMod() {
  const qc = useQueryClient();
  const listFn = useServerFn(listPendingLabels);
  const modFn = useServerFn(moderateLabel);
  const { data } = useQuery({
    queryKey: ["pending-labels"],
    queryFn: () => listFn(),
    retry: false,
  });
  const m = useMutation({
    mutationFn: modFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-labels"] }),
  });
  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  if (data.length === 0) return <p className="text-muted-foreground">No label applications.</p>;
  return (
    <div className="space-y-3">
      {data.map((l: any) => (
        <div
          key={l.id}
          className="bg-card border border-border rounded-xl p-4 flex justify-between items-start gap-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4" />
              <p className="font-medium">{l.name}</p>
            </div>
            <p className="text-xs text-muted-foreground">{l.contact_email ?? "—"}</p>
            {l.bio && <p className="text-sm mt-2 text-muted-foreground max-w-2xl">{l.bio}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              disabled={m.isPending}
              onClick={() => m.mutate({ data: { id: l.id, status: "approved" } })}
              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/15 text-primary"
            >
              <Check className="size-3" /> Approve
            </button>
            <button
              disabled={m.isPending}
              onClick={() => m.mutate({ data: { id: l.id, status: "rejected" } })}
              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-destructive/15 text-destructive"
            >
              <X className="size-3" /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Overview() {
  const statsFn = useServerFn(getPlatformStats);
  const activityFn = useServerFn(getRecentActivity);
  const statsQ = useQuery({ queryKey: ["admin-stats"], queryFn: () => statsFn(), retry: false });
  const activityQ = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => activityFn(),
    retry: false,
  });

  const stats = statsQ.data
    ? [
        { label: "Total Users", value: statsQ.data.totalUsers.toLocaleString(), icon: Users },
        { label: "Total Songs", value: statsQ.data.totalSongs.toLocaleString(), icon: Music },
        {
          label: "Premium Subs",
          value: statsQ.data.premiumSubscribers.toLocaleString(),
          icon: CreditCard,
        },
        {
          label: "Revenue 30d",
          value: `ZMW ${statsQ.data.monthlyRevenueZmw.toFixed(2)}`,
          icon: BarChart3,
        },
      ]
    : null;

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-6">
              <s.icon className="size-5 text-primary mb-3" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
          {!activityQ.data || activityQ.data.recentSongs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <ul className="space-y-3">
              {activityQ.data.recentSongs.map((s) => (
                <li key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent">
                  <Music className="size-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(s.artist as { name?: string } | null)?.name ?? "Unknown"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {!activityQ.data || activityQ.data.recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <ul className="space-y-3">
              {activityQ.data.recentTransactions.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-accent"
                >
                  <div>
                    <p className="text-sm font-medium">ZMW {Number(t.amount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{t.method_code}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-primary/15 text-primary">
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function SongMod() {
  const qc = useQueryClient();
  const list = useServerFn(listPendingSongs);
  const mod = useServerFn(moderateSong);
  const { data } = useQuery({ queryKey: ["pending-songs"], queryFn: () => list(), retry: false });
  const m = useMutation({
    mutationFn: mod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-songs"] }),
  });
  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  if (data.length === 0)
    return <p className="text-muted-foreground">No songs awaiting moderation.</p>;
  return (
    <div className="space-y-3">
      {data.map((s: any) => (
        <div
          key={s.id}
          className="bg-card border border-border rounded-xl p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.artist?.name ?? "Unknown"}</p>
          </div>
          <div className="flex gap-2">
            <button
              disabled={m.isPending}
              onClick={() => m.mutate({ data: { id: s.id, status: "approved" } })}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary"
            >
              <Check className="size-3" /> Approve
            </button>
            <button
              disabled={m.isPending}
              onClick={() => m.mutate({ data: { id: s.id, status: "rejected" } })}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-destructive/15 text-destructive"
            >
              <X className="size-3" /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ArtistMod() {
  const qc = useQueryClient();
  const list = useServerFn(listPendingArtists);
  const mod = useServerFn(moderateArtist);
  const { data } = useQuery({ queryKey: ["pending-artists"], queryFn: () => list(), retry: false });
  const m = useMutation({
    mutationFn: mod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-artists"] }),
  });
  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  if (data.length === 0)
    return <p className="text-muted-foreground">No artist applications awaiting review.</p>;
  return (
    <div className="space-y-3">
      {data.map((a: any) => (
        <div key={a.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.genre ?? "—"}</p>
              {a.bio && <p className="text-sm mt-2 text-muted-foreground">{a.bio}</p>}
            </div>
            <div className="flex gap-2">
              <button
                disabled={m.isPending}
                onClick={() => m.mutate({ data: { id: a.id, status: "approved", verified: true } })}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary"
              >
                <Check className="size-3" /> Approve
              </button>
              <button
                disabled={m.isPending}
                onClick={() => m.mutate({ data: { id: a.id, status: "rejected" } })}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-destructive/15 text-destructive"
              >
                <X className="size-3" /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
