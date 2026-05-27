import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/historique")({
  head: () => ({ meta: [{ title: "Historique — Lumière" }] }),
  component: History,
});

function History() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viewing_history")
        .select("progress_seconds, duration_seconds, completed, last_watched_at, content:content_id (id, slug, title, poster_url, duration)")
        .order("last_watched_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight">Historique</h1>
        <p className="mt-2 text-sm text-muted-foreground">Reprenez là où vous vous êtes arrêté.</p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-glass p-10 text-center">
          <p className="text-sm text-muted-foreground">Aucun visionnage récent.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((row, i) => {
            const c = row.content as unknown as {
              id: string;
              slug: string;
              title: string;
              poster_url: string | null;
              duration: string | null;
            } | null;
            if (!c) return null;
            const pct = row.duration_seconds
              ? Math.min(100, Math.round((row.progress_seconds / row.duration_seconds) * 100))
              : 0;
            return (
              <li
                key={`${c.id}-${i}`}
                className="flex items-center gap-4 rounded-2xl border border-glass-border bg-glass p-3"
              >
                <div
                  className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-secondary"
                  style={c.poster_url ? undefined : { background: "oklch(0.25 0 0)" }}
                >
                  {c.poster_url && (
                    <img src={c.poster_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.completed ? "Terminé" : `Vu à ${pct}%`}
                  </p>
                  <div className="mt-2 h-1 w-full rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <Link
                  to="/regarder/$slug"
                  params={{ slug: c.slug }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-semibold text-background"
                >
                  <Play className="h-3 w-3 fill-current" /> Reprendre
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}