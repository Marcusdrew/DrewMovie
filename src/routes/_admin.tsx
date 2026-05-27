import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_admin")({
  component: AdminGate,
});

function AdminGate() {
  const { loading, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate({ to: "/connexion", replace: true });
    else if (!hasRole("admin")) navigate({ to: "/", replace: true });
  }, [loading, isAuthenticated, hasRole, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center pt-28">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }
  if (!isAuthenticated || !hasRole("admin")) return null;
  return <Outlet />;
}