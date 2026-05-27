import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListContent, adminSetStatus, adminDeleteContent } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/moderation")({
  head: () => ({ meta: [{ title: "Modération — Lumière" }, { name: "robots", content: "noindex" }] }),
  component: ModerationPage,
});

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  processing: "Transcodage",
  ready: "Publié",
  rejected: "Rejeté",
};

function ModerationPage() {
  const list = useServerFn(adminListContent);
  const setStatus = useServerFn(adminSetStatus);
  const del = useServerFn(adminDeleteContent);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "content"],
    queryFn: () => list(),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "content"] });

  const change = async (id: string, status: "ready" | "rejected" | "draft") => {
    try {
      await setStatus({ data: { contentId: id, status } });
      toast.success("Statut mis à jour");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer définitivement ce contenu ?")) return;
    try {
      await del({ data: { contentId: id } });
      toast.success("Contenu supprimé");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  return (
    <div className="relative pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-glass-border bg-glass px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
            Administration
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Modération</h1>
          <p className="mt-3 text-muted-foreground">
            Publiez, rejetez ou supprimez les contenus envoyés par les créateurs.
          </p>
        </header>

        <div className="mt-10 overflow-hidden rounded-2xl border border-glass-border bg-glass">
          <table className="w-full text-sm">
            <thead className="border-b border-glass-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Vues</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Chargement…</td></tr>
              )}
              {data?.items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Aucun contenu pour le moment.</td></tr>
              )}
              {data?.items.map((item) => (
                <tr key={item.id} className="border-t border-glass-border/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">/{item.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.type}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-glass-border bg-background/40 px-2.5 py-0.5 text-xs">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{item.view_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {item.status !== "ready" && (
                        <button
                          type="button"
                          onClick={() => change(item.id, "ready")}
                          className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
                        >
                          Publier
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => change(item.id, "rejected")}
                          className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs"
                        >
                          Rejeter
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-destructive"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}