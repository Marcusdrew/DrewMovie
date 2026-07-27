import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import type { MockContent } from "@/lib/mock-catalog";
import { FavoriteButton } from "@/components/site/favorite-button";

const TYPE_LABEL: Record<MockContent["type"], string> = {
  movie: "Film",
  series: "Série",
  anime: "Animation",
};

export function ContentCard({ item, size = "md" }: { item: MockContent; size?: "sm" | "md" | "lg" }) {
  const aspect = size === "lg" ? "aspect-[16/10]" : "aspect-[2/3]";

  return (
    <Link
      to="/titre/$slug"
      params={{ slug: item.slug }}
      className="group relative block overflow-hidden rounded-xl"
    >
      <div
        className={`${aspect} w-full relative overflow-hidden rounded-xl ring-1 ring-glass-border transition-transform duration-500 group-hover:scale-[1.03]`}
        style={{ background: item.poster }}
      >
        {/* Coup de cœur */}
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
          <FavoriteButton slug={item.slug} title={item.title} size="sm" />
        </div>

        {/* Title overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">
            {TYPE_LABEL[item.type]} · {item.year}
          </span>
          <h3 className="font-display text-base font-semibold leading-tight text-white">
            {item.title}
          </h3>
        </div>

        {/* Hover detail overlay */}
        <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-gradient-to-t from-black/95 via-black/70 to-black/20 p-4 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <Star className="h-3 w-3 fill-current text-[oklch(0.85_0.18_85)]" />
            <span>{item.rating.toFixed(1)}</span>
            <span aria-hidden>·</span>
            <span>{item.duration}</span>
          </div>
          <p className="line-clamp-3 text-xs text-white/85">{item.synopsis}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-black">
              <Play className="h-3 w-3 fill-current" /> Lecture
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}