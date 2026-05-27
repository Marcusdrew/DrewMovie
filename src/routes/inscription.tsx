import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Créer un compte — Lumière" },
      { name: "description", content: "Créez votre compte Lumière en moins d'une minute." },
      { property: "og:title", content: "Créer un compte — Lumière" },
      { property: "og:description", content: "Rejoignez Lumière gratuitement." },
    ],
  }),
  component: Inscription,
});

function Inscription() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/", replace: true });
  }, [isAuthenticated, navigate]);

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Inscription Google impossible", { description: result.error.message });
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Inscription impossible", { description: error.message });
      return;
    }
    toast.success("Compte créé", {
      description: "Vérifiez votre boîte mail pour confirmer votre adresse.",
    });
    navigate({ to: "/connexion", replace: true });
  };

  return (
    <div className="relative grid min-h-dvh place-items-center px-4 pt-28">
      <div className="aurora -z-10" aria-hidden />
      <div className="w-full max-w-md rounded-3xl border border-glass-border bg-glass p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Rejoindre Lumière</h1>
        <p className="mt-2 text-sm text-muted-foreground">Gratuit, sans engagement.</p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-glass-border bg-background/40 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
        >
          Continuer avec Google
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nom d'affichage"
            aria-label="Nom"
            autoComplete="name"
            className="h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            aria-label="E-mail"
            autoComplete="email"
            className="h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe (8 caractères min.)"
            aria-label="Mot de passe"
            autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background disabled:opacity-60"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte ? <Link to="/connexion" className="font-medium text-foreground underline-offset-4 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}