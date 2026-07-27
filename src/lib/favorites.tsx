import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "lumiere.favoris";

interface FavoritesState {
  ready: boolean;
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
}

const FavoritesCtx = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavorites(parsed.filter((s): s is string => typeof s === "string"));
      }
    } catch {
      /* stockage indisponible */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      let added = false;
      setFavorites((prev) => {
        added = !prev.includes(slug);
        const next = added ? [slug, ...prev] : prev.filter((s) => s !== slug);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* stockage indisponible */
        }
        return next;
      });
      return added;
    },
    [],
  );

  const value = useMemo<FavoritesState>(
    () => ({
      ready,
      favorites,
      isFavorite: (slug) => favorites.includes(slug),
      toggle,
    }),
    [ready, favorites, toggle],
  );

  // `persist` conservé pour d'éventuels imports groupés futurs
  void persist;

  return <FavoritesCtx.Provider value={value}>{children}</FavoritesCtx.Provider>;
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesCtx);
  if (!ctx) throw new Error("useFavorites doit être utilisé dans FavoritesProvider");
  return ctx;
}
