import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMyContent, listMyContent } from "@/lib/bunny.functions";

const myContentQuery = (fn: () => ReturnType<typeof listMyContent>) =>
  queryOptions({
    queryKey: ["my-content"],
    queryFn: fn,
    refetchInterval: (q) => {
      const items = q.state.data?.items ?? [];
      return items.some((i) => i.status === "processing") ? 8000 : false;
    },
  });

export const Route = createFileRoute("/_authenticated/mes-contenus")({
  head: () => ({ meta: [{ title: "Mes contenus — Lumière" }] }),
  component: MesContenus,
});

function MesContenus() {
  const fetchList = useServerFn(listMyContent);
  const removeFn = useServerFn(deleteMyContent);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(myContentQuery(() => fetchList()));

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) return;
    try {
      await removeFn({ data: { contentId: id } });
      toast.success("Contenu supprimé");
      qc.invalidateQueries({ queryKey: ["my-content"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Mes contenus</h1>
          <p className="mt-2 text-sm text-muted-foreground">Suivez le statut de transcodage et gérez votre catalogue.</p>
        </div>
        <Link
          to="/televerser"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background"
        >
          <Plus className="h-4 w-4" /> Téléverser
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-glass-border bg-glass p-10 text-center">
          <p className="text-sm text-muted-foreground">Aucun contenu pour l'instant.</p>
          <Link
            to="/televerser"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background"
          >
            <Plus className="h-4 w-4" /> Téléverser votre première vidéo
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-glass-border overflow-hidden rounded-2xl border border-glass-border bg-glass">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-4 p-4">
              <div className="grid h-14 w-10 place-items-center overflow-hidden rounded-md bg-secondary">
                {it.poster_url ? (
                  <img src={it.poster_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Sans poster</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{it.title}</p>
                <p className="text-xs text-muted-foreground">
                  {it.type === "movie" ? "Film" : it.type === "series" ? "Série" : "Animation"} ·{" "}
                  <StatusBadge status={it.status} /> · {it.view_count} vues
                </p>
              </div>
              {it.status === "ready" && (
                <Link
                  to="/titre/$slug"
                  params={{ slug: it.slug }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-glass-border bg-background/40 text-muted-foreground hover:text-foreground"
                  aria-label="Voir la fiche"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => onDelete(it.id, it.title)}
                className="grid h-9 w-9 place-items-center rounded-full border border-glass-border bg-background/40 text-muted-foreground hover:text-foreground"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "ready"
      ? "Publié"
      : status === "processing"
        ? "Transcodage…"
        : status === "rejected"
          ? "Échec"
          : "Brouillon";
  return <span className="font-medium text-foreground/80">{label}</span>;
}