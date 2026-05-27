export type ContentType = "movie" | "series" | "anime";

export interface MockContent {
  slug: string;
  title: string;
  type: ContentType;
  year: number;
  duration: string;
  genres: string[];
  synopsis: string;
  tagline: string;
  rating: number;
  poster: string; // gradient seed for placeholder
  backdropHue: number;
}

// Posters générés via gradients déterministes (Phase 1, sans appels image).
// Remplacés par de vraies images en Phase 2 (imagegen ou TMDB).
function poster(seed: number) {
  // Posters neutres : nuances de gris déterministes, pas d'effet arc-en-ciel.
  const l1 = 0.22 + ((seed * 13) % 15) / 100; // 0.22 - 0.37
  const l2 = 0.4 + ((seed * 17) % 18) / 100; // 0.40 - 0.58
  return `linear-gradient(135deg, oklch(${l1.toFixed(2)} 0 0), oklch(${l2.toFixed(2)} 0 0))`;
}

export const MOCK_CATALOG: MockContent[] = [
  {
    slug: "echos-de-lumiere",
    title: "Échos de Lumière",
    type: "movie",
    year: 2025,
    duration: "2h 14",
    genres: ["Science-fiction", "Drame"],
    synopsis:
      "Dans une ville où la lumière a appris à parler, une archiviste découvre un signal venu d'une autre époque.",
    tagline: "La lumière n'oublie rien.",
    rating: 4.7,
    poster: poster(1),
    backdropHue: 280,
  },
  {
    slug: "la-derniere-saison",
    title: "La Dernière Saison",
    type: "series",
    year: 2024,
    duration: "3 saisons",
    genres: ["Thriller", "Mystère"],
    synopsis:
      "Quatre amis reviennent dans le village qu'ils ont fui vingt ans plus tôt. Quelque chose les attendait.",
    tagline: "Personne ne revient indemne.",
    rating: 4.5,
    poster: poster(2),
    backdropHue: 320,
  },
  {
    slug: "kintsugi",
    title: "Kintsugi",
    type: "anime",
    year: 2025,
    duration: "12 épisodes",
    genres: ["Animation", "Aventure"],
    synopsis:
      "Une jeune potière apprend à réparer le monde, fragment par fragment, avec de l'or et du courage.",
    tagline: "Ce qui est brisé peut briller plus fort.",
    rating: 4.8,
    poster: poster(3),
    backdropHue: 40,
  },
  {
    slug: "horizon-nord",
    title: "Horizon Nord",
    type: "movie",
    year: 2023,
    duration: "1h 58",
    genres: ["Aventure", "Drame"],
    synopsis: "Un cartographe traverse le cercle polaire pour cartographier une côte qui n'existe plus.",
    tagline: "Le monde finit là où le silence commence.",
    rating: 4.3,
    poster: poster(4),
    backdropHue: 220,
  },
  {
    slug: "verre-brise",
    title: "Verre Brisé",
    type: "series",
    year: 2025,
    duration: "8 épisodes",
    genres: ["Polar", "Drame"],
    synopsis: "Une avocate défend l'homme accusé du meurtre de sa sœur. Elle ne sait pas encore pourquoi.",
    tagline: "La vérité a plusieurs visages.",
    rating: 4.6,
    poster: poster(5),
    backdropHue: 0,
  },
  {
    slug: "saisons-rouges",
    title: "Saisons Rouges",
    type: "anime",
    year: 2024,
    duration: "24 épisodes",
    genres: ["Animation", "Fantastique"],
    synopsis: "Dans un royaume où les saisons sont des créatures vivantes, l'automne refuse de s'éteindre.",
    tagline: "Quand les feuilles refusent de tomber.",
    rating: 4.4,
    poster: poster(6),
    backdropHue: 25,
  },
  {
    slug: "le-protocole",
    title: "Le Protocole",
    type: "movie",
    year: 2024,
    duration: "2h 06",
    genres: ["Thriller", "Science-fiction"],
    synopsis: "Une cryptographe découvre que tous ses souvenirs sont des copies de sauvegarde.",
    tagline: "Êtes-vous toujours vous-même ?",
    rating: 4.2,
    poster: poster(7),
    backdropHue: 260,
  },
  {
    slug: "marees-basses",
    title: "Marées Basses",
    type: "series",
    year: 2023,
    duration: "2 saisons",
    genres: ["Drame", "Romance"],
    synopsis: "Un village de pêcheurs au bord de l'effondrement. Deux familles qui ne se parlent plus.",
    tagline: "L'océan se souvient.",
    rating: 4.1,
    poster: poster(8),
    backdropHue: 200,
  },
  {
    slug: "neon-pluie",
    title: "Néon & Pluie",
    type: "movie",
    year: 2025,
    duration: "1h 47",
    genres: ["Polar", "Néo-noir"],
    synopsis: "Tokyo, 2049. Une détective traque un tueur qui n'existe que sous la pluie.",
    tagline: "Sous chaque néon, une ombre.",
    rating: 4.5,
    poster: poster(9),
    backdropHue: 340,
  },
  {
    slug: "la-mecanique-des-reves",
    title: "La Mécanique des Rêves",
    type: "anime",
    year: 2024,
    duration: "1 film",
    genres: ["Animation", "Poésie"],
    synopsis: "Une horlogère répare les rêves des autres pour ne plus avoir à faire les siens.",
    tagline: "Chaque rêve est un engrenage.",
    rating: 4.9,
    poster: poster(10),
    backdropHue: 300,
  },
  {
    slug: "ciel-de-cendres",
    title: "Ciel de Cendres",
    type: "movie",
    year: 2023,
    duration: "2h 22",
    genres: ["Guerre", "Drame"],
    synopsis: "Trois soldats traversent l'Europe en ruines à la recherche d'un message à délivrer.",
    tagline: "Le silence après la tempête.",
    rating: 4.3,
    poster: poster(11),
    backdropHue: 60,
  },
  {
    slug: "les-jardins-suspendus",
    title: "Les Jardins Suspendus",
    type: "series",
    year: 2025,
    duration: "6 épisodes",
    genres: ["Drame", "Historique"],
    synopsis: "Une famille reconstruit un domaine viticole abandonné depuis la guerre.",
    tagline: "Tout pousse, même les secrets.",
    rating: 4.6,
    poster: poster(12),
    backdropHue: 130,
  },
];

export const FEATURED = MOCK_CATALOG[0];

export function byType(type: ContentType) {
  return MOCK_CATALOG.filter((c) => c.type === type);
}

export function findBySlug(slug: string) {
  return MOCK_CATALOG.find((c) => c.slug === slug);
}

export const RAILS: { title: string; items: MockContent[] }[] = [
  { title: "Tendances cette semaine", items: [MOCK_CATALOG[0], MOCK_CATALOG[8], MOCK_CATALOG[2], MOCK_CATALOG[4], MOCK_CATALOG[6], MOCK_CATALOG[9]] },
  { title: "Nouveautés", items: [MOCK_CATALOG[11], MOCK_CATALOG[8], MOCK_CATALOG[2], MOCK_CATALOG[0], MOCK_CATALOG[6]] },
  { title: "Films", items: byType("movie") },
  { title: "Séries", items: byType("series") },
  { title: "Animation", items: byType("anime") },
];