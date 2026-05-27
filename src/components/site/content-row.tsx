import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MockContent } from "@/lib/mock-catalog";
import { ContentCard } from "./content-card";

export function ContentRow({ title, items }: { title: string; items: MockContent[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="mb-4 flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Défiler vers la gauche"
            className="grid h-9 w-9 place-items-center rounded-full border border-glass-border bg-glass text-foreground/80 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Défiler vers la droite"
            className="grid h-9 w-9 place-items-center rounded-full border border-glass-border bg-glass text-foreground/80 transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.slug} className="w-40 shrink-0 sm:w-48 lg:w-56">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}