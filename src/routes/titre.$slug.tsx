import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Play, Plus, Share2, Star } from "lucide-react";
import { ContentCard } from "@/components/site/content-card";
import { findBySlug, MOCK_CATALOG } from "@/lib/mock-catalog";

export const Route = createFileRoute("/titre/$slug")({
  loader: ({ params }) => {
    const item = findBySlug(params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    const item = loaderData?.item;
    if (!item) return { meta: [{ title: "Titre introuvable — Lumière" }] };
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": item.type === "series" ? "TVSeries" : "Movie",
      name: item.title,
      description: item.synopsis,
      datePublished: String(item.year),
      genre: item.genres,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: item.rating,
        bestRating: 5,
        ratingCount: Math.max(10, Math.round(item.rating * 23)),
      },
    };
    return {
      meta: [
        { title: `${item.title} — Lumière` },
        { name: "description", content: item.synopsis },
        { property: "og:title", content: `${item.title} — Lumière` },
        { property: "og:description", content: item.synopsis },
        { property: "og:type", content: "video.movie" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: TitrePage,
});

function TitrePage() {
  const { item } = Route.useLoaderData();
  const similar = MOCK_CATALOG.filter((c) => c.slug !== item.slug && c.genres.some((g) => item.genres.includes(g))).slice(0, 6);

  return (
    <div>
      {/* Cinematic backdrop */}
      <section className="relative isolate -mt-16 flex min-h-[70vh] items-end overflow-hidden pt-32">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(70% 90% at 60% 30%, oklch(0.55 0.25 ${item.backdropHue} / 0.7), transparent 70%), linear-gradient(180deg, oklch(0.18 0.05 ${item.backdropHue}) 0%, var(--background) 95%)`,
          }}
        />
        <div className="aurora -z-10" aria-hidden />

        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 sm:px-6 md:grid-cols-[260px_1fr] lg:px-8">
          {/* Poster */}
          <div
            className="aspect-[2/3] w-full max-w-[260px] overflow-hidden rounded-2xl ring-1 ring-glass-border shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"
            style={{ background: item.poster }}
          />

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium uppercase tracking-wider text-foreground/80">
              {item.type === "movie" ? "Film" : item.type === "series" ? "Série" : "Animation"} · {item.year}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {item.title}
            </h1>
            <p className="mt-3 font-display text-lg italic text-gradient-brand">{item.tagline}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-foreground">
                <Star className="h-3.5 w-3.5 fill-current text-[oklch(0.85_0.18_85)]" />
                {item.rating.toFixed(1)}
              </span>
              <span aria-hidden>·</span>
              <span>{item.duration}</span>
              <span aria-hidden>·</span>
              <span>{item.genres.join(", ")}</span>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/85">{item.synopsis}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/regarder/$slug"
                params={{ slug: item.slug }}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
              >
                <Play className="h-4 w-4 fill-current" />
                Lecture
              </Link>
              <button
                type="button"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-glass-border bg-glass px-5 text-sm font-medium text-foreground"
              >
                <Plus className="h-4 w-4" />
                Ma liste
              </button>
              <button
                type="button"
                aria-label="Partager"
                className="grid h-12 w-12 place-items-center rounded-full border border-glass-border bg-glass text-foreground"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight">À découvrir aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {similar.map((c) => (
              <ContentCard key={c.slug} item={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}