import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/artists/")({
  head: () => ({
    meta: [
      { title: "Artists — Wesu+" },
      { name: "description", content: "Discover talented artists on Wesu+ Music Streaming." },
      { property: "og:title", content: "Artists — Wesu+" },
      { property: "og:description", content: "Discover talented artists on Wesu+ Music Streaming." },
    ],
  }),
  component: ArtistsPage,
});

function ArtistsPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Artist Profiles</h1>
        <p className="text-muted-foreground">Follow your favorite artists and discover new talent.</p>
      </div>
    </div>
  );
}
