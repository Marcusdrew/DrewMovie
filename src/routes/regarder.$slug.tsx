import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { HLSPlayer } from "@/components/site/hls-player";
import { getPlayback } from "@/lib/bunny.functions";

export const Route = createFileRoute("/regarder/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Lecture — ${params.slug} — Lumière` }],
  }),
  component: Regarder,
});

function Regarder() {
  const { slug } = Route.useParams();
  const fetchPlayback = useServerFn(getPlayback);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["playback", slug],
    queryFn: () => fetchPlayback({ data: { slug } }),
  });

  return (
    <div className="min-h-dvh bg-black pt-20 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/titre/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la fiche
        </Link>

        <div className="mt-4">
          {isLoading && (
            <div className="grid aspect-video w-full place-items-center rounded-xl bg-white/5 text-sm text-white/60">
              Chargement…
            </div>
          )}
          {(isError || (data && !data.found)) && (
            <div className="grid aspect-video w-full place-items-center rounded-xl bg-white/5 text-center text-sm text-white/70">
              <div>
                <p className="font-medium text-white">Vidéo indisponible</p>
                <p className="mt-1">
                  Ce contenu n'existe pas ou n'a pas encore terminé son transcodage.
                </p>
              </div>
            </div>
          )}
          {data?.found && (
            <>
              <HLSPlayer
                src={data.hlsUrl}
                poster={data.content.backdrop_url ?? data.content.poster_url}
                adTagUrl={data.adTagUrl}
              />
              <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">{data.content.title}</h1>
              {data.content.synopsis && (
                <p className="mt-2 max-w-3xl text-sm text-white/70">{data.content.synopsis}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}