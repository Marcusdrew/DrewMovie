import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface Props {
  slug: string;
  title?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
  withLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: "h-8 w-8", icon: "h-3.5 w-3.5" },
  md: { box: "h-10 w-10", icon: "h-4 w-4" },
  lg: { box: "h-12 w-12", icon: "h-5 w-5" },
} as const;

export function FavoriteButton({
  slug,
  title,
  size = "md",
  variant = "ghost",
  withLabel = false,
  className,
}: Props) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = isFavorite(slug);
  const s = SIZES[size];

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(slug);
    toast.success(
      added
        ? `${title ?? "Ce titre"} ajouté à vos coups de cœur`
        : `${title ?? "Ce titre"} retiré de vos coups de cœur`,
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Retirer des coups de cœur" : "Ajouter aux coups de cœur"}
      title={active ? "Retirer des coups de cœur" : "Ajouter aux coups de cœur"}
      className={cn(
        "group/fav inline-flex items-center justify-center gap-2 rounded-full border transition-all duration-300 active:scale-90",
        withLabel ? "h-12 px-5 text-sm font-medium" : s.box,
        variant === "solid"
          ? "border-transparent bg-foreground text-background hover:opacity-90"
          : "border-glass-border bg-glass text-foreground backdrop-blur-md hover:border-foreground/40",
        !ready && "opacity-60",
        className,
      )}
    >
      <Heart
        className={cn(
          s.icon,
          "transition-transform duration-300 group-hover/fav:scale-110",
          active && "fill-current",
        )}
      />
      {withLabel && <span>{active ? "Coup de cœur" : "Coup de cœur"}</span>}
    </button>
  );
}
