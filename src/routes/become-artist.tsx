import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mic2 } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { applyAsArtist } from "@/lib/artist.functions";

export const Route = createFileRoute("/become-artist")({
  head: () => ({ meta: [{ title: "Become an Artist — Wesu+" }] }),
  component: () => <RoleGate require="user"><Page /></RoleGate>,
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function Page() {
  const navigate = useNavigate();
  const apply = useServerFn(applyAsArtist);
  const m = useMutation({
    mutationFn: apply,
    onSuccess: () => navigate({ to: "/dashboard" }),
  });
  const [form, setForm] = useState({ name: "", bio: "", genre: "" });

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-6">
        <Mic2 className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">Become an Artist</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Submit your application. An admin will review and approve you to start uploading music.
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); m.mutate({ data: form }); }}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <label className="block text-sm">Artist name
          <input required className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block text-sm">Genre
          <input className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Afrobeats, Hip-Hop…" />
        </label>
        <label className="block text-sm">Bio
          <textarea rows={4} className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
        {m.error ? <p className="text-sm text-destructive">{(m.error as Error).message}</p> : null}
        <button disabled={m.isPending} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold">
          {m.isPending ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
