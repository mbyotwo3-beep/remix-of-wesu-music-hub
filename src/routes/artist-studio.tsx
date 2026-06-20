import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Wallet, FolderPlus } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { useAuth } from "@/hooks/use-auth";
import { uploadFileToBucket } from "@/lib/storage";
import { uploadSong, createAlbum, listMyAlbums, requestPayout, listMyPayouts } from "@/lib/artist.functions";
import { getMyArtistOverview } from "@/lib/user.functions";

export const Route = createFileRoute("/artist-studio")({
  head: () => ({ meta: [{ title: "Artist Studio — Wesu+" }] }),
  component: () => <RoleGate require="artist"><Page /></RoleGate>,
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

type Tab = "upload" | "album" | "payouts";

function Page() {
  const [tab, setTab] = useState<Tab>("upload");
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "upload", label: "Upload Song", icon: Upload },
    { id: "album", label: "Albums", icon: FolderPlus },
    { id: "payouts", label: "Payouts", icon: Wallet },
  ];
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Artist Studio</h1>
      <div className="flex gap-2 mb-8 border-b border-border pb-3">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>
      {tab === "upload" && <UploadTab />}
      {tab === "album" && <AlbumTab />}
      {tab === "payouts" && <PayoutTab />}
    </div>
  );
}

function UploadTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const upload = useServerFn(uploadSong);
  const albumsFn = useServerFn(listMyAlbums);
  const { data: albums } = useQuery({ queryKey: ["my-albums"], queryFn: () => albumsFn(), retry: false });
  const [form, setForm] = useState({ title: "", genre: "", price: 0, album_id: "" as string });
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: upload,
    onSuccess: () => { setMsg("Submitted! Awaiting moderation."); qc.invalidateQueries({ queryKey: ["my-songs"] }); },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!user || !audio) return;
        setBusy(true); setMsg(null);
        try {
          const audio_url = await uploadFileToBucket("song-audio", user.id, audio);
          const cover_url = cover ? await uploadFileToBucket("album-art", user.id, cover) : undefined;
          await m.mutateAsync({ data: { ...form, audio_url, cover_url, album_id: form.album_id || null } });
        } catch (err) { setMsg((err as Error).message); }
        finally { setBusy(false); }
      }}
      className="bg-card border border-border rounded-2xl p-6 space-y-4"
    >
      <label className="block text-sm">Title<input required className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">Genre<input className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></label>
        <label className="block text-sm">Price (ZMW, 0 = free)<input type="number" min="0" step="0.01" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
      </div>
      <label className="block text-sm">Album (optional)
        <select className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.album_id} onChange={(e) => setForm({ ...form, album_id: e.target.value })}>
          <option value="">— Single —</option>
          {(albums ?? []).map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </label>
      <label className="block text-sm">Audio file (mp3/m4a/wav)
        <input required type="file" accept="audio/*" className="mt-1 block" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} />
      </label>
      <label className="block text-sm">Cover art (optional)
        <input type="file" accept="image/*" className="mt-1 block" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
      </label>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <button disabled={busy} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold">
        {busy ? "Uploading…" : "Upload song"}
      </button>
    </form>
  );
}

function AlbumTab() {
  const qc = useQueryClient();
  const create = useServerFn(createAlbum);
  const list = useServerFn(listMyAlbums);
  const { data: albums } = useQuery({ queryKey: ["my-albums"], queryFn: () => list(), retry: false });
  const m = useMutation({ mutationFn: create, onSuccess: () => qc.invalidateQueries({ queryKey: ["my-albums"] }) });
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", price: 0 });
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!user) return;
          setBusy(true);
          try {
            const cover_url = cover ? await uploadFileToBucket("album-art", user.id, cover) : undefined;
            await m.mutateAsync({ data: { ...form, cover_url } });
            setForm({ title: "", description: "", price: 0 }); setCover(null);
          } finally { setBusy(false); }
        }}
        className="bg-card border border-border rounded-2xl p-6 space-y-3"
      >
        <h3 className="font-semibold">New album</h3>
        <input required placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" placeholder="Price ZMW" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
        <button disabled={busy} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Create</button>
      </form>
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-semibold mb-3">Your albums</h3>
        {(albums ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No albums yet.</p> : (
          <ul className="space-y-2">
            {(albums ?? []).map((a: any) => (<li key={a.id} className="text-sm">• {a.title}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PayoutTab() {
  const qc = useQueryClient();
  const overviewFn = useServerFn(getMyArtistOverview);
  const requestFn = useServerFn(requestPayout);
  const listFn = useServerFn(listMyPayouts);
  const { data: overview } = useQuery({ queryKey: ["artist-overview"], queryFn: () => overviewFn(), retry: false });
  const { data: payouts } = useQuery({ queryKey: ["my-payouts"], queryFn: () => listFn(), retry: false });
  const m = useMutation({ mutationFn: requestFn, onSuccess: () => qc.invalidateQueries({ queryKey: ["my-payouts"] }) });
  const [form, setForm] = useState({ amount: 0, method_code: "MTN_MOMO", destination: "" });

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-sm text-muted-foreground">Available earnings</p>
        <p className="text-3xl font-bold mt-1">ZMW {Number(overview?.totalRevenueZmw ?? 0).toFixed(2)}</p>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); m.mutate({ data: form }); }}
        className="bg-card border border-border rounded-2xl p-6 space-y-3"
      >
        <h3 className="font-semibold">Request payout</h3>
        <input required type="number" min="1" step="0.01" placeholder="Amount" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        <select className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.method_code} onChange={(e) => setForm({ ...form, method_code: e.target.value })}>
          <option value="MTN_MOMO">MTN Mobile Money</option>
          <option value="AIRTEL_MONEY">Airtel Money</option>
          <option value="ZAMTEL_KWACHA">Zamtel Kwacha</option>
          <option value="BANK">Bank transfer</option>
        </select>
        <input required placeholder="Destination (phone / account number)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
        {m.error ? <p className="text-sm text-destructive">{(m.error as Error).message}</p> : null}
        <button disabled={m.isPending} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Request</button>
      </form>
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-semibold mb-3">History</h3>
        {(payouts ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No requests yet.</p> : (
          <ul className="space-y-2 text-sm">
            {(payouts ?? []).map((p: any) => (
              <li key={p.id} className="flex justify-between">
                <span>ZMW {Number(p.amount).toFixed(2)} • {p.method_code}</span>
                <span className="text-xs text-muted-foreground">{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
