import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Upload as UploadIcon, FileVideo, CheckCircle2, AlertCircle } from "lucide-react";
import * as tus from "tus-js-client";
import { createUploadSession } from "@/lib/bunny.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/televerser")({
  head: () => ({ meta: [{ title: "Téléverser — Lumière" }] }),
  component: TeleverserPage,
});

type Status = "idle" | "preparing" | "uploading" | "processing" | "done" | "error";

function TeleverserPage() {
  const navigate = useNavigate();
  const startSession = useServerFn(createUploadSession);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [type, setType] = useState<"movie" | "series" | "anime">("movie");
  const [genres, setGenres] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Sélectionnez un fichier et saisissez un titre.");
      return;
    }
    setStatus("preparing");
    setErrorMsg(null);
    try {
      const session = await startSession({
        data: {
          title: title.trim(),
          synopsis: synopsis.trim() || undefined,
          type,
          genres: genres.split(",").map((g) => g.trim()).filter(Boolean),
          year,
        },
      });
      setSlug(session.slug);

      const upload = new tus.Upload(file, {
        endpoint: session.tus.endpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: 50 * 1024 * 1024,
        headers: {
          AuthorizationSignature: session.tus.signature,
          AuthorizationExpire: String(session.tus.expire),
          VideoId: session.tus.videoId,
          LibraryId: session.tus.libraryId,
        },
        metadata: {
          filetype: file.type,
          title: title.trim(),
        },
        onError: (err) => {
          console.error(err);
          setStatus("error");
          setErrorMsg(err.message);
        },
        onProgress: (sent, total) => {
          setProgress(Math.round((sent / total) * 100));
        },
        onSuccess: () => {
          setStatus("processing");
          toast.success("Upload terminé. Bunny transcode votre vidéo…");
        },
      });

      setStatus("uploading");
      upload.start();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Téléverser un contenu</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Le fichier est envoyé directement à notre CDN. Le transcodage HLS multi-bitrate démarre automatiquement.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6 rounded-2xl border border-glass-border bg-glass p-6">
        <label className="block">
          <span className="text-sm font-medium">Fichier vidéo</span>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-glass-border bg-background/40 px-4 py-6">
            <FileVideo className="h-6 w-6 text-muted-foreground" />
            <input
              type="file"
              accept="video/*"
              required
              disabled={status === "uploading" || status === "preparing"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
            />
          </div>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Titre</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm outline-none focus:border-foreground/40"
              placeholder="Le Dernier Rivage"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm outline-none focus:border-foreground/40"
            >
              <option value="movie">Film</option>
              <option value="series">Série</option>
              <option value="anime">Animation</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Année</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={1900}
              max={2100}
              className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm outline-none focus:border-foreground/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Genres (séparés par des virgules)</span>
            <input
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Drame, Thriller"
              className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm outline-none focus:border-foreground/40"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Synopsis</span>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-foreground/40"
            placeholder="Quelques lignes pour donner envie de regarder…"
          />
        </label>

        {status === "uploading" || status === "preparing" ? (
          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {status === "preparing" ? "Préparation…" : `Envoi en cours · ${progress}%`}
            </p>
          </div>
        ) : null}

        {status === "processing" && (
          <div className="flex items-start gap-3 rounded-xl border border-glass-border bg-background/40 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-foreground" />
            <div className="text-sm">
              <p className="font-medium">Upload terminé.</p>
              <p className="text-muted-foreground">
                Le transcodage HLS prend généralement quelques minutes. Vous pouvez fermer cette page et suivre le statut dans
                « Mes contenus ».
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/mes-contenus" })}
                className="mt-3 inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-semibold text-background"
              >
                Voir mes contenus
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-3 rounded-xl border border-glass-border bg-background/40 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-medium">Échec de l'upload</p>
              <p className="text-muted-foreground">{errorMsg}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "uploading" || status === "preparing" || status === "processing"}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          <UploadIcon className="h-4 w-4" />
          {status === "idle" || status === "error" ? "Démarrer l'upload" : "Upload en cours…"}
        </button>
        {slug && status === "processing" && (
          <p className="text-xs text-muted-foreground">Slug attribué : <code>{slug}</code></p>
        )}
      </form>
    </div>
  );
}