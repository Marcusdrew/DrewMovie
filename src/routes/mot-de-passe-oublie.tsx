import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mot-de-passe-oublie")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — Lumière" },
      { name: "description", content: "Réinitialisez votre mot de passe Lumière." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    setLoading(false);
    if (error) {
      toast.error("Envoi impossible", { description: error.message });
      return;
    }
    setSent(true);
  };

  return (
    <div className="relative grid min-h-dvh place-items-center px-4 pt-28">
      <div className="w-full max-w-md rounded-3xl border border-glass-border bg-glass p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nous vous enverrons un lien pour le réinitialiser.
        </p>
        {sent ? (
          <p className="mt-8 rounded-xl border border-glass-border bg-background/40 p-4 text-sm">
            Si un compte existe pour <strong>{email}</strong>, un e-mail vient d'être envoyé.
          </p>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background disabled:opacity-60"
            >
              {loading ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/connexion" className="font-medium text-foreground underline-offset-4 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}