import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reinitialiser-mot-de-passe")({
  head: () => ({
    meta: [{ title: "Nouveau mot de passe — Lumière" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Mise à jour impossible", { description: error.message });
      return;
    }
    toast.success("Mot de passe modifié");
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="relative grid min-h-dvh place-items-center px-4 pt-28">
      <div className="w-full max-w-md rounded-3xl border border-glass-border bg-glass p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choisissez un mot de passe d'au moins 8 caractères.</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            aria-label="Nouveau mot de passe"
            autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background disabled:opacity-60"
          >
            {loading ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </form>
      </div>
    </div>
  );
}