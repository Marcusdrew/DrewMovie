import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/hero";
import { ContentRow } from "@/components/site/content-row";
import { FEATURED, RAILS } from "@/lib/mock-catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumière — Streaming premium pour créateurs et cinéphiles" },
      { name: "description", content: "Films, séries et animation portés par des créateurs indépendants. Découvrez une nouvelle façon de regarder." },
      { property: "og:title", content: "Lumière — Streaming premium" },
      { property: "og:description", content: "Films, séries et animation portés par des créateurs indépendants." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      <Hero item={FEATURED} />
      <div className="relative space-y-14 pt-4">
        {RAILS.map((rail) => (
          <ContentRow key={rail.title} title={rail.title} items={rail.items} />
        ))}
      </div>
    </div>
  );
}
