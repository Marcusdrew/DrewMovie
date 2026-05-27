import { Link } from "@tanstack/react-router";
import { Play, Info, Star } from "lucide-react";
import { motion } from "motion/react";
import type { MockContent } from "@/lib/mock-catalog";

export function Hero({ item }: { item: MockContent }) {
  return (
    <section className="relative isolate -mt-16 flex min-h-[88vh] items-end overflow-hidden pb-20 pt-32">
      {/* Backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(60% 80% at 70% 30%, oklch(0.55 0.25 ${item.backdropHue} / 0.6), transparent 70%), linear-gradient(180deg, oklch(0.18 0.05 ${item.backdropHue}) 0%, var(--background) 90%)`,
        }}
      />
      <div className="aurora -z-10" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium uppercase tracking-wider text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
            À l'affiche cette semaine
          </span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {item.title}
          </h1>

          <p className="mt-3 font-display text-lg italic text-gradient-brand">
            {item.tagline}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current text-[oklch(0.85_0.18_85)]" />
              <span className="text-foreground">{item.rating.toFixed(1)}</span>
            </span>
            <span aria-hidden>·</span>
            <span>{item.year}</span>
            <span aria-hidden>·</span>
            <span>{item.duration}</span>
            <span aria-hidden>·</span>
            <span>{item.genres.join(", ")}</span>
          </div>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/85">
            {item.synopsis}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/regarder/$slug"
              params={{ slug: item.slug }}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-current" />
              Regarder maintenant
            </Link>
            <Link
              to="/titre/$slug"
              params={{ slug: item.slug }}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-glass-border bg-glass px-6 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:bg-glass/80"
            >
              <Info className="h-4 w-4" />
              Plus d'infos
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}