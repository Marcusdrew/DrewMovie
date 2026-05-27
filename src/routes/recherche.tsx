import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ContentCard } from "@/components/site/content-card";
import { MOCK_CATALOG } from "@/lib/mock-catalog";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Rechercher — Lumière" },
      { name: "description", content: "Trouvez instantanément un film, une série ou une animation sur Lumière." },
      { property: "og:title", content: "Rechercher — Lumière" },
      { property: "og:description", content: "Recherche temps réel dans le catalogue Lumière." },
    ],
  }),
  component: Recherche,
});

function Recherche() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return MOCK_CATALOG;
    return MOCK_CATALOG.filter((c) =>
      [c.title, c.synopsis, c.genres.join(" ")].join(" ").toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <div className="relative pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Rechercher</h1>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-glass-border bg-glass px-5 py-4 focus-within:border-primary/40 focus-within:shadow-[0_0_30px_-10px_oklch(0.7_0.22_320/0.5)]">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Titre, genre, ambiance…"
            aria-label="Recherche"
            className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {q && (
            <span className="text-xs text-muted-foreground">{results.length} résultat{results.length > 1 ? "s" : ""}</span>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {results.map((item) => (
            <ContentCard key={item.slug} item={item} />
          ))}
        </div>

        {results.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">Aucun résultat pour « {q} ».</p>
        )}
      </div>
    </div>
  );
}