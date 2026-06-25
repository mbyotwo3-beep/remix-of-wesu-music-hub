import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mic2, CheckCircle2, Clock, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { applyAsArtist, getMyArtistApplication } from "@/lib/artist.functions";
import { useUserRoles } from "@/hooks/use-roles";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/become-artist")({
  head: () => ({ meta: [{ title: "Become an Artist — Wesu+" }] }),
  component: () => (
    <RoleGate require="user">
      <Page />
    </RoleGate>
  ),
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function Page() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isArtist, loading: rolesLoading } = useUserRoles();
  const fetchApplication = useServerFn(getMyArtistApplication);
  const apply = useServerFn(applyAsArtist);
  const [form, setForm] = useState({ name: "", bio: "", genre: "" });
  const [submitted, setSubmitted] = useState<{ status: string } | null>(null);

  // Check for existing application
  const { data: existingApp, isLoading: appLoading } = useQuery({
    queryKey: ["my-artist-application", user?.id],
    queryFn: () => fetchApplication(),
    enabled: !!user && !rolesLoading && !isArtist,
  });

  // Redirect if already an approved artist (has role)
  useEffect(() => {
    if (!rolesLoading && isArtist) {
      navigate({ to: "/artist-dashboard" });
    }
  }, [isArtist, rolesLoading, navigate]);

  const m = useMutation({
    mutationFn: apply,
    onSuccess: (result) => {
      setSubmitted({ status: result.status });
    },
  });

  // Loading states
  if (rolesLoading || appLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isArtist) return null; // redirecting via useEffect

  // Already has a pending application
  if (existingApp && existingApp.status === "pending") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-5">
          <div className="size-20 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="size-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold">Application Under Review</h1>
          <p className="text-muted-foreground leading-relaxed">
            You've already submitted an artist application. Our team is reviewing it and you'll be
            approved shortly. You'll gain access to your Artist Dashboard once approved.
          </p>
          <div className="bg-card border border-border rounded-2xl px-6 py-4 text-sm text-left w-full">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold">
                <Clock className="size-3.5" /> Pending Review
              </span>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-full bg-card border border-border text-sm font-semibold hover:bg-accent transition-colors"
          >
            Back to My Library
          </Link>
        </div>
      </div>
    );
  }

  // Already rejected — allow re-application with a notice
  if (existingApp && existingApp.status === "rejected") {
    // fall through to the form below, but show a banner
  }

  // Success state after fresh submission
  if (submitted) {
    const isPending = submitted.status === "pending";
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-5">
          {isPending ? (
            <div className="size-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="size-10 text-amber-500" />
            </div>
          ) : (
            <div className="size-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-green-500" />
            </div>
          )}
          <h1 className="text-3xl font-bold">
            {isPending ? "Application Submitted!" : "Welcome, Artist!"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isPending
              ? "Your application has been received and is under review. An admin will approve you shortly — you'll be able to upload music once approved."
              : "Your artist account is active. Head to your Artist Dashboard to start uploading music."}
          </p>
          <div className="flex gap-3 mt-2">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-full bg-card border border-border text-sm font-semibold hover:bg-accent transition-colors"
            >
              My Library
            </Link>
            {!isPending && (
              <Link
                to="/artist-dashboard"
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 hover:brightness-110 transition-all"
              >
                Artist Dashboard <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-6">
        <Mic2 className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">Become an Artist</h1>
      </div>

      {/* Rejection notice */}
      {existingApp?.status === "rejected" && (
        <div className="mb-6 flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
          <XCircle className="size-4 mt-0.5 shrink-0" />
          <span>
            Your previous application was not approved. You're welcome to submit a new application
            with updated information.
          </span>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-8">
        Submit your application. An admin will review and approve you to start uploading music.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate({ data: form });
        }}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <label className="block text-sm font-medium">
          Artist name
          <input
            required
            className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Genre
          <input
            className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            placeholder="Afrobeats, Hip-Hop…"
          />
        </label>
        <label className="block text-sm font-medium">
          Bio
          <textarea
            rows={4}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>
        {m.error ? <p className="text-sm text-destructive">{(m.error as Error).message}</p> : null}
        <button
          disabled={m.isPending}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 disabled:opacity-60"
        >
          {m.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </button>
      </form>
    </div>
  );
}
