import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — Lumière" },
      { name: "description", content: "Lumière Gratuit avec publicités ou Lumière Premium sans interruption. Choisissez votre formule." },
      { property: "og:title", content: "Tarifs — Lumière" },
      { property: "og:description", content: "Deux formules simples pour profiter de Lumière." },
    ],
  }),
  component: Tarifs,
});

const PLANS = [
  {
    name: "Lumière Gratuit",
    price: "0",
    period: "/ mois",
    description: "Tout le catalogue, financé par une publicité avant chaque lecture.",
    features: [
      "Catalogue complet en HD",
      "Une pub avant chaque visionnage",
      "1 écran à la fois",
      "Sous-titres et qualité adaptative",
    ],
    cta: "Créer mon compte",
    to: "/inscription" as const,
    featured: false,
  },
  {
    name: "Lumière Premium",
    price: "8,99",
    period: "€ / mois",
    description: "Aucune publicité, qualité maximale, jusqu'à 4 écrans.",
    features: [
      "Sans aucune publicité",
      "Qualité 4K HDR quand disponible",
      "4 écrans simultanés",
      "Téléchargements hors-ligne",
      "Accès anticipé aux sorties",
    ],
    cta: "Bientôt disponible",
    to: "/inscription" as const,
    featured: true,
  },
];

function Tarifs() {
  return (
    <div className="relative pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Une formule simple,{" "}
            <span className="text-gradient-brand">à votre rythme</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Démarrez gratuitement avec un peu de publicité, ou passez en Premium pour une expérience sans interruption.
          </p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative overflow-hidden rounded-3xl border p-8 ${
                p.featured
                  ? "border-transparent bg-gradient-brand"
                  : "border-glass-border bg-glass"
              }`}
            >
              {p.featured && (
                <div className="absolute inset-px rounded-[calc(1.5rem-1px)] bg-background" />
              )}
              <div className="relative">
                <h2 className="font-display text-xl font-semibold">{p.name}</h2>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold tracking-tight">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>

                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-brand">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={p.to}
                  className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-transform hover:scale-[1.01] ${
                    p.featured
                      ? "bg-gradient-brand text-white"
                      : "bg-foreground text-background"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          La facturation Premium sera activée à l'ouverture des inscriptions payantes. Sans engagement, résiliable à tout moment.
        </p>
      </div>
    </div>
  );
}