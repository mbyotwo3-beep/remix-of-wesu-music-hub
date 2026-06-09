import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/artists/$id")({
  head: () => ({
    meta: [
      { title: "Artist — Wesu+" },
      { name: "description", content: "Artist profile on Wesu+ Music Streaming." },
    ],
  }),
  component: ArtistDetailPage,
});

function ArtistDetailPage() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Artist Profile</h1>
        <p className="text-muted-foreground">Artist ID: {id}</p>
      </div>
    </div>
  );
}
