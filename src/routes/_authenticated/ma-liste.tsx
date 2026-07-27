import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
import { MOCK_CATALOG } from "@/lib/mock-catalog";
import { ContentCard } from "@/components/site/content-card";

export const Route = createFileRoute("/_authenticated/ma-liste")({
  head: () => ({
    meta: [{ title: "Ma liste — Lumière" }],
  }),
  component: MyList,
});

function MyList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { favorites, ready } = useFavorites();
  const favoriteItems = ready
    ? favorites
        .map((slug) => MOCK_CATALOG.find((c) => c.slug === slug))
        .filter((c): c is (typeof MOCK_CATALOG)[number] => Boolean(c))
    : [];

  const { data, isLoading } = useQuery({
    queryKey: ["watchlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watchlist")
        .select("added_at, content:content_id (id, slug, title, type, year, poster_url, duration)")
        .order("added_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const removeMut = useMutation({
    mutationFn: async (contentId: string) => {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user!.id)
        .eq("content_id", contentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Retiré de votre liste");
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight">Ma liste</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vos titres mis de côté pour plus tard.
        </p>
      </header>

      <section className="mb-14">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Coups de cœur</h2>
          <span className="text-xs text-muted-foreground">
            {favoriteItems.length} titre{favoriteItems.length > 1 ? "s" : ""}
          </span>
        </div>
        {favoriteItems.length === 0 ? (
          <div className="rounded-2xl border border-glass-border bg-glass p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun coup de cœur pour l'instant. Touchez le cœur sur un titre pour le retrouver ici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {favoriteItems.map((c) => (
              <ContentCard key={c.slug} item={c} />
            ))}
          </div>
        )}
      </section>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-glass p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Votre liste est vide.{" "}
            <Link to="/decouvrir" className="font-medium text-foreground underline-offset-4 hover:underline">
              Explorer le catalogue
            </Link>
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {data.map((row) => {
            const c = row.content as unknown as {
              id: string;
              slug: string;
              title: string;
              type: string;
              year: number | null;
              poster_url: string | null;
              duration: string | null;
            } | null;
            if (!c) return null;
            return (
              <li key={c.id} className="group relative overflow-hidden rounded-xl">
                <Link
                  to="/titre/$slug"
                  params={{ slug: c.slug }}
                  className="block aspect-[2/3] w-full overflow-hidden rounded-xl ring-1 ring-glass-border"
                  style={c.poster_url ? undefined : { background: "oklch(0.25 0 0)" }}
                >
                  {c.poster_url && (
                    <img src={c.poster_url} alt={c.title} className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.year ?? ""}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMut.mutate(c.id)}
                    aria-label="Retirer"
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}