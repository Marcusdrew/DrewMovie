import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lumière" },
      { name: "description", content: "Contactez l'équipe Lumière pour toute question, suggestion ou demande de partenariat." },
      { property: "og:title", content: "Contact — Lumière" },
      { property: "og:description", content: "Écrivez à l'équipe Lumière." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="relative pt-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Nous écrire</h1>
        <p className="mt-3 text-muted-foreground">
          Une question, une remarque, un projet ? Nous répondons sous 48 heures.
        </p>

        <form
          className="mt-10 space-y-5 rounded-2xl border border-glass-border bg-glass p-8"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <label htmlFor="nom" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nom</label>
            <input id="nom" type="text" required className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">E-mail</label>
            <input id="email" type="email" required className="mt-2 h-11 w-full rounded-xl border border-glass-border bg-background/40 px-4 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label htmlFor="message" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</label>
            <textarea id="message" required rows={5} className="mt-2 w-full rounded-xl border border-glass-border bg-background/40 px-4 py-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-transform hover:scale-[1.01]">
            Envoyer le message
          </button>
          <p className="text-center text-xs text-muted-foreground">
            (L'envoi sera connecté à la messagerie en phase 2.)
          </p>
        </form>
      </div>
    </div>
  );
}