import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "Centre d'aide — Lumière" },
      { name: "description", content: "Réponses aux questions fréquentes sur Lumière : compte, lecture, paiement, créateurs." },
      { property: "og:title", content: "Centre d'aide — Lumière" },
      { property: "og:description", content: "Réponses aux questions fréquentes sur Lumière." },
    ],
  }),
  component: Aide,
});

const FAQS = [
  {
    q: "Comment créer un compte ?",
    a: "Cliquez sur « Se connecter » puis « Créer un compte ». Vous pouvez utiliser votre adresse e-mail ou votre compte Google. La création est gratuite et prend moins d'une minute.",
  },
  {
    q: "Quelle est la différence entre Gratuit et Premium ?",
    a: "Le tier Gratuit donne accès à tout le catalogue avec une publicité avant chaque lecture. Premium supprime toutes les pubs, débloque le 4K HDR et permet jusqu'à 4 écrans simultanés.",
  },
  {
    q: "Puis-je publier mes propres contenus ?",
    a: "Oui. Connectez-vous, accédez à « Téléverser » dans votre profil et déposez votre fichier vidéo. Notre infrastructure transcode automatiquement pour une lecture fluide sur tous les appareils.",
  },
  {
    q: "Sur quels appareils puis-je regarder ?",
    a: "Lumière fonctionne sur tout navigateur moderne (ordinateur, tablette, smartphone) et prend en charge la lecture plein écran et la Chromecast.",
  },
  {
    q: "Comment résilier mon abonnement ?",
    a: "Depuis votre profil, rubrique « Abonnement », un clic suffit. Aucun engagement, aucune justification demandée.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Vos données sont stockées en Europe et chiffrées. Nous ne vendons jamais vos informations à des tiers. Voir notre charte de confidentialité pour le détail.",
  },
];

function Aide() {
  return (
    <div className="relative pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Centre d'aide</h1>
        <p className="mt-3 text-muted-foreground">Les réponses aux questions les plus fréquentes.</p>

        <div className="mt-12 divide-y divide-border/60 rounded-2xl border border-glass-border bg-glass">
          {FAQS.map((f, i) => (
            <details key={i} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-glass-border text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}