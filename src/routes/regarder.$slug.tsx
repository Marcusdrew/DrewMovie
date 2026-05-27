import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findBySlug } from "@/lib/mock-catalog";

export const Route = createFileRoute("/regarder/$slug")({
  loader: ({ params }) => {
    const item = findBySlug(params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.item ? `Lecture — ${loaderData.item.title}` : "Lecture — Lumière" }],
  }),
  component: Regarder,
});

function Regarder() {
  const { item } = Route.useLoaderData();
  return (
    <div className="grid min-h-dvh place-items-center bg-black px-4 pt-20 text-center text-white">
      <div>
        <p className="text-xs uppercase tracking-wider text-white/60">Aperçu lecteur</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{item.title}</h1>
        <p className="mt-3 max-w-md text-sm text-white/70">
          Le lecteur HLS Bunny Stream avec pré-roll Google IMA sera activé en phase 3.
        </p>
        <Link to="/titre/$slug" params={{ slug: item.slug }} className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black">
          Retour à la fiche
        </Link>
      </div>
    </div>
  );
}