import { Link } from "@tanstack/react-router";

const SECTIONS = [
  {
    title: "Plateforme",
    links: [
      { to: "/decouvrir", label: "Découvrir" },
      { to: "/recherche", label: "Recherche" },
      { to: "/tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Compte",
    links: [
      { to: "/connexion", label: "Se connecter" },
      { to: "/inscription", label: "Créer un compte" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/aide", label: "Centre d'aide" },
      { to: "/contact", label: "Nous contacter" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-32 border-t border-border/60 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand">
                <span className="font-display text-base font-bold text-white">L</span>
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">Lumière</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              La plateforme française de streaming pour les créateurs et les passionnés de cinéma indépendant.
            </p>
          </div>

          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Lumière. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Fabriqué avec attention en France
            <span className="text-gradient-brand">●</span>
          </p>
        </div>
      </div>
    </footer>
  );
}