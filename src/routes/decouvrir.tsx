import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ContentCard } from "@/components/site/content-card";
import { MOCK_CATALOG, type ContentType } from "@/lib/mock-catalog";

export const Route = createFileRoute("/decouvrir")({
  head: () => ({
    meta: [
      { title: "Découvrir — Lumière" },
      { name: "description", content: "Parcourez le catalogue Lumière : films, séries et animation classés par genre, année et popularité." },
      { property: "og:title", content: "Découvrir le catalogue — Lumière" },
      { property: "og:description", content: "Parcourez tous les titres disponibles sur Lumière." },
    ],
  }),
  component: Decouvrir,
});

const TYPES: { value: ContentType | "all"; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "movie", label: "Films" },
  { value: "series", label: "Séries" },
  { value: "anime", label: "Animation" },
];

function Decouvrir() {
  const [type, setType] = useState<ContentType | "all">("all");
  const [genre, setGenre] = useState<string>("all");

  const genres = useMemo(() => {
    const set = new Set<string>();
    MOCK_CATALOG.forEach((c) => c.genres.forEach((g) => set.add(g)));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const items = useMemo(
    () =>
      MOCK_CATALOG.filter((c) => (type === "all" || c.type === type) && (genre === "all" || c.genres.includes(genre))),
    [type, genre],
  );

  return (
    <div className="relative pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Découvrir</h1>
          <p className="mt-3 text-muted-foreground">
            Parcourez tout le catalogue Lumière. Filtrez par type ou par genre pour trouver votre prochain coup de cœur.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
                type === t.value
                  ? "border-transparent bg-foreground text-background"
                  : "border-glass-border bg-glass text-foreground/80 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 text-sm">
            <label htmlFor="genre" className="text-muted-foreground">Genre</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="h-9 rounded-full border border-glass-border bg-glass px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {genres.map((g) => (
                <option key={g} value={g} className="bg-background">
                  {g === "all" ? "Tous" : g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6">
          {items.map((item) => (
            <ContentCard key={item.slug} item={item} />
          ))}
        </div>

        {items.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">Aucun résultat pour ces filtres.</p>
        )}
      </div>
    </div>
  );
}