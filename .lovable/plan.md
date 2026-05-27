
# Plateforme de streaming « Lumière » — Plan de construction

Toute l'interface sera en français. Stack : TanStack Start (équivalent Next.js dans Lovable) + Lovable Cloud (Supabase managé) + Bunny Stream (transcodage/HLS) + Google IMA (pubs pré-roll).

## Architecture

```text
Navigateur ──► TanStack Start (SSR + routes)
                  │
                  ├─► Lovable Cloud (Postgres + Auth + Storage posters)
                  │
                  ├─► Bunny Stream API  (upload, transcodage HLS, lecteur)
                  │
                  └─► Google IMA SDK    (VAST pré-roll dans le lecteur)
```

- **Pas de FFmpeg côté Lovable** : impossible dans le runtime serveur. Bunny Stream reçoit l'upload, transcode automatiquement en HLS multi-bitrate, et sert via son CDN.
- **Secrets requis** (demandés en début de phase 2) : `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_CDN_HOSTNAME`, plus `GOOGLE_IMA_AD_TAG_URL` (publique mais centralisée).

## Direction visuelle (appliquée partout)

- Mode sombre par défaut, mode clair disponible (toggle).
- Palette : fond `oklch(0.12 0.02 270)`, surfaces verre `oklch(0.18 0.03 270 / 0.6)`, gradient hero `linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.65 0.25 340))` (bleu-violet → magenta).
- Typographie : **Geist Sans** (titres), **Inter** (corps), via `@fontsource`.
- Glassmorphism (blur + bordure blanche 1px à 8 % d'opacité), grain SVG subtil sur le fond, ombres diffuses, micro-transitions `ease-[cubic-bezier(0.22,1,0.36,1)]`, framer-motion pour entrées/hover.
- Grille 8pt, icônes lucide line, posters cinématographiques.

## Modèle de données (Lovable Cloud)

- `profiles` (id ↔ auth.users, display_name, avatar_url, locale, theme)
- `user_roles` (user_id, role enum: viewer | creator | admin) + fonction `has_role` security definer
- `content` (id, type enum: movie|series|anime, slug, title, synopsis, year, duration_min, poster_path, backdrop_path, bunny_video_id, status enum: processing|ready|rejected, uploader_id, created_at, published_at, view_count)
- `genres` (id, name) + `content_genres` (n-m)
- `seasons` (content_id, number, title), `episodes` (season_id, number, title, bunny_video_id, duration_min)
- `cast_members` (content_id, name, role enum: actor|director|writer)
- `watchlist` (user_id, content_id, added_at) — unique
- `viewing_history` (user_id, content_id, episode_id null, position_sec, duration_sec, updated_at)
- `ratings` (user_id, content_id, score 1-5, review nullable)
- `ad_impressions` (user_id, content_id, ad_tag, served_at)

RLS sur tout, policies scopées à `auth.uid()`, GRANTs explicites, `user_roles` lue via `has_role()`. Catalogue public lisible via server fn admin-elevated (pas de policy `anon`).

## Pages et routes (toutes en français, SEO par route)

Sous `src/routes/` :

- `index.tsx` — Accueil : hero plein écran (contenu vedette), rails « Continuer à regarder », « Tendances », « Nouveautés », « Films », « Séries », « Animation ».
- `decouvrir.tsx` — Catalogue filtrable (type, genre, année, tri).
- `recherche.tsx` — Recherche temps réel avec debounce + filtres.
- `titre.$slug.tsx` — Fiche : backdrop cinéma, synopsis, casting, note moyenne, CTA Lecture/Watchlist/Partager, saisons & épisodes si série, « À découvrir aussi ».
- `regarder.$slug.tsx` (et `.$episodeId`) — Lecteur plein écran avec pré-roll IMA puis lecture Bunny HLS, reprise auto, sauvegarde position, sous-titres, vitesse, skip intro.
- `_authenticated/ma-liste.tsx` — Watchlist.
- `_authenticated/historique.tsx` — Historique de visionnage.
- `_authenticated/profil.tsx` — Profil & préférences (langue, thème, sous-titres par défaut).
- `_authenticated/televerser.tsx` — Upload créateur : drag-drop, formulaire métadonnées, poster, statut transcodage live.
- `_authenticated/mes-contenus.tsx` — Dashboard créateur (liste, stats vues, suppression).
- `_admin/moderation.tsx` — File de modération (rôle admin).
- `connexion.tsx`, `inscription.tsx`, `mot-de-passe-oublie.tsx`, `reinitialiser-mot-de-passe.tsx`.
- `tarifs.tsx` — Présentation publicité gratuite / Premium sans pub (page vitrine V1).
- `aide.tsx` — FAQ. `contact.tsx` — formulaire support.

Layouts : `_authenticated.tsx` (garde route + hydrate session), `_admin.tsx` (vérifie `has_role('admin')`), sidebar mini-collapse persistante côté app, top-nav transparente côté pages publiques.

## Flux vidéo

1. **Upload créateur** : server fn `createBunnyVideo({title})` → renvoie `videoId` + URL d'upload signée Bunny → le navigateur PUT le fichier directement vers Bunny (tus-js-client pour les gros fichiers) → row `content` créée en `status='processing'`.
2. **Webhook Bunny** : route publique `src/routes/api/public/bunny-webhook.ts` vérifie la signature, met `status='ready'`, enregistre durée + thumbnail.
3. **Lecture** : composant `<HLSPlayer>` (hls.js) charge `https://{BUNNY_CDN_HOSTNAME}/{videoId}/playlist.m3u8` ; pré-roll IMA chargé avant `play()` ; sauvegarde `viewing_history` toutes les 10 s ; reprise depuis dernière position.

## Pubs Google IMA

- Wrapper léger autour de `google-ima-sdk` chargé dynamiquement.
- Tag VAST configurable (env), désactivable par rôle « premium » (stub V1 — branchement Stripe ultérieur).
- Tracking des impressions dans `ad_impressions`.

## Phases de livraison

**Phase 1 — Fondations & design system**
- Tokens couleur/typo dans `src/styles.css`, polices Geist/Inter, composant `<GlassCard>`, fond grain, gradient hero, toggle thème, layout sidebar + top-nav, pages publiques squelettes (accueil avec données fictives, FAQ, contact, tarifs).

**Phase 2 — Auth, DB & catalogue**
- Activer Lovable Cloud, migrations (tables + RLS + GRANTs), seed de démo (10 titres mockés avec posters générés).
- Auth email/password + Google (broker Lovable + `configure_social_auth`), pages login/signup/reset, garde `_authenticated`.
- Pages Découvrir, Recherche, Fiche titre, Ma liste, Historique, Profil — toutes câblées sur la vraie DB.

**Phase 3 — Vidéo & upload**
- Demander les secrets Bunny.
- Server fns upload + statut + webhook public signé.
- Page « Téléverser » avec drag-drop tus + progression + statut transcodage temps réel.
- Lecteur `<HLSPlayer>` avec reprise, sous-titres, vitesse, plein écran, skip intro.
- Dashboard créateur + modération admin.

**Phase 4 — Pubs, polish & SEO**
- Intégration Google IMA pré-roll + tracking impressions.
- Sitemap dynamique, JSON-LD `VideoObject` sur fiches, og:image dérivé du backdrop.
- Accessibilité WCAG 2.1 AA : focus visibles, ARIA, contraste, navigation clavier complète.
- Skeletons élégants, spinners, animations d'entrée framer-motion sur hero et rails.
- Suggestion publication.

## Détails techniques (section dédiée)

- Lecture catalogue publique via `createServerFn` + `supabaseAdmin` avec projection colonnes sûres (jamais de policy `anon`).
- Reads utilisateur via `requireSupabaseAuth` middleware + `attachSupabaseAuth` côté client.
- TanStack Query : `queryOptions` + `ensureQueryData` dans loaders + `useSuspenseQuery` dans composants ; `onAuthStateChange` au root pour invalidation.
- Recherche : RPC Postgres `search_content(q text)` avec `ILIKE` + index trigram (`pg_trgm`).
- Upload Bunny : `tus-js-client` côté navigateur, URL d'upload signée renvoyée par server fn (clé Bunny jamais exposée).
- Webhook Bunny : HMAC vérifié avec `timingSafeEqual`, idempotence sur `bunny_video_id`.
- HLS : `hls.js` sauf Safari (natif). Pré-roll IMA s'insère sur `BeforePlay`.
- Sous-titres : Bunny gère les pistes, exposées via le manifeste HLS ; UI permet sélection.
- Storage Lovable Cloud pour posters/backdrops (bucket `posters` public en lecture, écriture par créateur authentifié, transformation à la volée si dispo).
- Mode clair/sombre : variable `data-theme` sur `<html>`, persistée dans `profiles.theme`.

## Hors périmètre V1 (à confirmer après)

- Paiement Stripe pour le tier Premium (page vitrine seulement en V1, branchement plus tard).
- Notifications email transactionnelles (Lovable Email peut être ajouté).
- Recommandations personnalisées par ML (heuristique « plus regardés du même genre » en V1).
- Application mobile native.

À l'approbation, je commence la **Phase 1** (design system + pages publiques squelettes), puis je propose d'enchaîner sur la Phase 2.
