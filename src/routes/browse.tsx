import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Music — Wesu+" },
      { name: "description", content: "Discover and stream the best Zambian and African music on Wesu+." },
      { property: "og:title", content: "Browse Music — Wesu+" },
      { property: "og:description", content: "Discover and stream the best Zambian and African music on Wesu+." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Browse Music</h1>
        <p className="text-muted-foreground">Explore genres, new releases, and trending tracks.</p>
      </div>
    </div>
  );
}
