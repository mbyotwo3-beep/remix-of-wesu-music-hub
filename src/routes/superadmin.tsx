import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Shield, Users, Settings as SettingsIcon, CreditCard, FileText, Wallet, Check, X, Star, Building2 } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import {
  listUsers, grantRole, revokeRole,
  upsertPlan, togglePaymentMethod, updateSettings, listAudit,
  listPayouts, decidePayout, getSettings, markTransactionPaid, setPlatformCommission,
} from "@/lib/superadmin.functions";
import { getPlatformStats } from "@/lib/admin.functions";
import { listAllFeaturedAdmin, upsertFeaturedSlot, removeFeaturedSlot } from "@/lib/features.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/superadmin")({
  head: () => ({ meta: [{ title: "Superadmin — Wesu+" }] }),
  component: () => <RoleGate require="superadmin"><SuperadminPage /></RoleGate>,
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

type Tab = "overview" | "users" | "plans" | "payments" | "settings" | "payouts" | "labels" | "featured" | "audit";

function SuperadminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "plans", label: "Plans", icon: CreditCard },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "labels", label: "Labels", icon: Building2 },
    { id: "featured", label: "Featured", icon: Star },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "audit", label: "Audit Log", icon: FileText },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Superadmin</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab />}
        {tab === "users" && <UsersTab />}
        {tab === "plans" && <PlansTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "payouts" && <PayoutsTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "audit" && <AuditTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const fn = useServerFn(getPlatformStats);
  const { data } = useQuery({ queryKey: ["super-stats"], queryFn: () => fn(), retry: false });
  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  const cards = [
    { label: "Total Users", value: data.totalUsers },
    { label: "Total Songs", value: data.totalSongs },
    { label: "Premium Subscribers", value: data.premiumSubscribers },
    { label: "Revenue 30d (ZMW)", value: data.monthlyRevenueZmw.toFixed(2) },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border border-border rounded-2xl p-6">
          <p className="text-2xl font-bold">{c.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const list = useServerFn(listUsers);
  const grant = useServerFn(grantRole);
  const revoke = useServerFn(revokeRole);
  const { data: users } = useQuery({ queryKey: ["super-users"], queryFn: () => list(), retry: false });

  const grantM = useMutation({ mutationFn: grant, onSuccess: () => qc.invalidateQueries({ queryKey: ["super-users"] }) });
  const revokeM = useMutation({ mutationFn: revoke, onSuccess: () => qc.invalidateQueries({ queryKey: ["super-users"] }) });

  if (!users) return <div className="text-muted-foreground">Loading…</div>;
  const roles: Array<"user" | "artist" | "admin" | "superadmin"> = ["artist", "admin", "superadmin"];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-muted-foreground">
          <tr><th className="text-left p-3">User</th><th className="text-left p-3">Roles</th><th className="text-left p-3">Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.user_id} className="border-t border-border">
              <td className="p-3">
                <p className="font-medium">{u.full_name || "(no name)"}</p>
                <p className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}…</p>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {u.roles.length === 0 && <span className="text-xs text-muted-foreground">user</span>}
                  {u.roles.map((r: string) => (
                    <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{r}</span>
                  ))}
                </div>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => {
                    const has = u.roles.includes(r);
                    return (
                      <button
                        key={r}
                        disabled={grantM.isPending || revokeM.isPending}
                        onClick={() => has
                          ? revokeM.mutate({ data: { user_id: u.user_id, role: r } })
                          : grantM.mutate({ data: { user_id: u.user_id, role: r } })}
                        className={`text-xs px-2 py-1 rounded-md border ${
                          has ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-border text-foreground hover:bg-accent"
                        }`}
                      >
                        {has ? `Revoke ${r}` : `Grant ${r}`}
                      </button>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlansTab() {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertPlan);
  const [plans, setPlans] = useState<any[]>([]);
  const { isFetching } = useQuery({
    queryKey: ["super-plans"],
    queryFn: async () => {
      const { data } = await supabase.from("subscription_plans").select("*").order("price_zmw");
      setPlans(data ?? []);
      return data ?? [];
    },
  });
  const upsertM = useMutation({
    mutationFn: upsert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["super-plans"] }),
  });

  const [draft, setDraft] = useState({ name: "", price_zmw: 0, description: "" });

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-3">New plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="px-3 py-2 rounded-lg bg-secondary border border-border" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input type="number" className="px-3 py-2 rounded-lg bg-secondary border border-border" placeholder="Price ZMW" value={draft.price_zmw} onChange={(e) => setDraft({ ...draft, price_zmw: Number(e.target.value) })} />
          <input className="px-3 py-2 rounded-lg bg-secondary border border-border md:col-span-2" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </div>
        <button
          disabled={!draft.name || upsertM.isPending}
          onClick={() => upsertM.mutate({ data: draft })}
          className="mt-3 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
        >
          Create plan
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isFetching && <p className="p-4 text-muted-foreground text-sm">Loading…</p>}
        <table className="w-full text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Price</th><th className="text-left p-3">Active</th></tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">ZMW {Number(p.price_zmw).toFixed(2)}</td>
                <td className="p-3">{p.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const qc = useQueryClient();
  const toggle = useServerFn(togglePaymentMethod);
  const [methods, setMethods] = useState<any[]>([]);
  useQuery({
    queryKey: ["super-methods"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_methods").select("*").order("sort_order");
      setMethods(data ?? []);
      return data ?? [];
    },
  });
  const m = useMutation({ mutationFn: toggle, onSuccess: () => qc.invalidateQueries({ queryKey: ["super-methods"] }) });

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-muted-foreground">
          <tr><th className="text-left p-3">Method</th><th className="text-left p-3">Category</th><th className="text-left p-3">Status</th></tr>
        </thead>
        <tbody>
          {methods.map((p) => (
            <tr key={p.code} className="border-t border-border">
              <td className="p-3 font-medium">{p.label}</td>
              <td className="p-3 text-muted-foreground">{p.category}</td>
              <td className="p-3">
                <button
                  disabled={m.isPending}
                  onClick={() => m.mutate({ data: { code: p.code, is_enabled: !p.is_enabled } })}
                  className={`text-xs px-3 py-1 rounded-full ${p.is_enabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {p.is_enabled ? "Enabled" : "Disabled"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayoutsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listPayouts);
  const decide = useServerFn(decidePayout);
  const { data } = useQuery({ queryKey: ["super-payouts"], queryFn: () => list(), retry: false });
  const m = useMutation({ mutationFn: decide, onSuccess: () => qc.invalidateQueries({ queryKey: ["super-payouts"] }) });

  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-muted-foreground">
          <tr><th className="text-left p-3">Artist</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Method</th><th className="text-left p-3">Status</th><th className="text-left p-3">Action</th></tr>
        </thead>
        <tbody>
          {data.map((p: any) => (
            <tr key={p.id} className="border-t border-border">
              <td className="p-3">{p.artist?.name ?? "—"}</td>
              <td className="p-3">ZMW {Number(p.amount).toFixed(2)}</td>
              <td className="p-3 text-muted-foreground">{p.method_code} → {p.destination}</td>
              <td className="p-3"><span className="text-xs">{p.status}</span></td>
              <td className="p-3">
                {p.status === "pending" && (
                  <div className="flex gap-2">
                    <button disabled={m.isPending} onClick={() => m.mutate({ data: { id: p.id, decision: "approved" } })} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/15 text-primary"><Check className="size-3" /> Approve</button>
                    <button disabled={m.isPending} onClick={() => m.mutate({ data: { id: p.id, decision: "rejected" } })} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-destructive/15 text-destructive"><X className="size-3" /> Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No payout requests yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function SettingsTab() {
  const qc = useQueryClient();
  const get = useServerFn(getSettings);
  const update = useServerFn(updateSettings);
  const { data } = useQuery({ queryKey: ["super-settings"], queryFn: () => get() });
  const m = useMutation({ mutationFn: update, onSuccess: () => qc.invalidateQueries({ queryKey: ["super-settings"] }) });
  const [site, setSite] = useState<any>(null);
  const [pay, setPay] = useState<any>(null);
  if (data && site === null) { setSite(data.site ?? {}); setPay(data.payments ?? {}); }

  if (!data || site === null) return <div className="text-muted-foreground">Loading…</div>;
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold">Site</h3>
        <label className="block text-sm">Site name<input className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={site.name ?? ""} onChange={(e) => setSite({ ...site, name: e.target.value })} /></label>
        <label className="block text-sm">Support email<input className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={site.support_email ?? ""} onChange={(e) => setSite({ ...site, support_email: e.target.value })} /></label>
        <label className="block text-sm">Commission %<input type="number" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={site.commission_pct ?? 0} onChange={(e) => setSite({ ...site, commission_pct: Number(e.target.value) })} /></label>
        <button onClick={() => m.mutate({ data: { key: "site", value: site } })} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Save site</button>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold">Payments</h3>
        <label className="block text-sm">DPO mode
          <select className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={pay.dpo_mode ?? "sandbox"} onChange={(e) => setPay({ ...pay, dpo_mode: e.target.value })}>
            <option value="sandbox">Sandbox</option>
            <option value="live">Live</option>
          </select>
        </label>
        <button onClick={() => m.mutate({ data: { key: "payments", value: pay } })} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Save payments</button>
      </div>
    </div>
  );
}

function AuditTab() {
  const fn = useServerFn(listAudit);
  const { data } = useQuery({ queryKey: ["super-audit"], queryFn: () => fn(), retry: false });
  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-muted-foreground">
          <tr><th className="text-left p-3">When</th><th className="text-left p-3">Actor</th><th className="text-left p-3">Action</th><th className="text-left p-3">Target</th></tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.id} className="border-t border-border">
              <td className="p-3 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</td>
              <td className="p-3 text-xs">{row.actor_id?.slice(0, 8) ?? "—"}</td>
              <td className="p-3 font-medium">{row.action}</td>
              <td className="p-3 text-muted-foreground">{row.target_type}:{row.target_id?.slice(0, 8) ?? ""}</td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No audit entries yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
