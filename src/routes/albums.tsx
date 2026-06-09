import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/albums")({
  head: () => ({
    meta: [
      { title: "Albums & Singles — Wesu+" },
      { name: "description", content: "Browse albums and singles on Wesu+ Music Streaming." },
      { property: "og:title", content: "Albums & Singles — Wesu+" },
      { property: "og:description", content: "Browse albums and singles on Wesu+ Music Streaming." },
    ],
  }),
  component: AlbumsPage,
});

function AlbumsPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Albums & Singles</h1>
        <p className="text-muted-foreground">Explore the latest releases and timeless classics.</p>
      </div>
    </div>
  );
}
