import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Sun, Moon, User, LogOut, ListVideo, History, Upload, Film } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/decouvrir", label: "Découvrir" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/aide", label: "Aide" },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { isAuthenticated, profile, user, signOut, hasRole } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass shadow-[0_8px_30px_-12px_oklch(0_0_0/0.4)]" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-foreground">
            <span className="font-display text-base font-bold text-background">L</span>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Lumière</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <span className="mx-auto mt-1 block h-px w-6 bg-gradient-brand" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to="/recherche"
            aria-label="Rechercher"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Mon compte"
                className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-xs font-semibold text-background"
              >
                {(profile?.display_name?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {profile?.display_name ?? user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/ma-liste">
                    <ListVideo className="mr-2 h-4 w-4" /> Ma liste
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/historique">
                    <History className="mr-2 h-4 w-4" /> Historique
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profil">
                    <User className="mr-2 h-4 w-4" /> Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/televerser">
                    <Upload className="mr-2 h-4 w-4" /> Téléverser
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mes-contenus">
                    <Film className="mr-2 h-4 w-4" /> Mes contenus
                  </Link>
                </DropdownMenuItem>
                {hasRole("admin") && (
                  <DropdownMenuItem asChild>
                    <Link to="/moderation">
                      <Film className="mr-2 h-4 w-4" /> Modération
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/connexion"
              className="hidden h-9 items-center gap-2 rounded-full border border-glass-border bg-glass px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"
            >
              <User className="h-3.5 w-3.5" />
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}