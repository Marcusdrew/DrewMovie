import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Se connecter — Lumière" },
      { name: "description", content: "Connectez-vous à votre compte Lumière." },
      { property: "og:title", content: "Se connecter — Lumière" },
      { property: "og:description", content: "Accédez à votre compte Lumière." },
    ],
  }),
  component: Connexion,
});

function Connexion() {
  return (
    <div className="relative grid min-h-dvh place-items-center px-4 pt-28">
      <div className="aurora -z-10" aria-hidden />
      <div className="w-full max-w-md rounded-3xl border border-glass-border bg-glass p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Bon retour</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connectez-vous pour reprendre votre visionnage.</p>

        <button type="button" className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-glass-border bg-background/40 text-sm font-medium">
          Continuer avec Google
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="E-mail" aria-label="E-mail" className="h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input type="password" placeholder="Mot de passe" aria-label="Mot de passe" className="h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ? <Link to="/inscription" className="font-medium text-foreground underline-offset-4 hover:underline">Créer un compte</Link>
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          (Authentification activée en phase 2.)
        </p>
      </div>
    </div>
  );
}