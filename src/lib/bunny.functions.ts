import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  bunnyCreateVideo,
  bunnyDeleteVideo,
  bunnyTusAuth,
  getBunnyConfig,
} from "./bunny.server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Auto-promotion en créateur lors du premier upload (pas d'étape de validation V1). */
export const becomeCreator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "creator")
      .maybeSingle();
    if (existing) return { ok: true, already: true };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "creator" });
    if (error) throw new Error(error.message);
    return { ok: true, already: false };
  });

/** Crée la vidéo Bunny + ligne content, renvoie les credentials d'upload TUS. */
export const createUploadSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      title: z.string().trim().min(1).max(200),
      synopsis: z.string().trim().max(2000).optional().default(""),
      type: z.enum(["movie", "series", "anime"]),
      genres: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
      year: z.number().int().min(1900).max(2100).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // S'assurer que l'utilisateur a le rôle creator
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["creator", "admin"])
      .limit(1)
      .maybeSingle();
    if (!roleRow) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "creator" });
    }

    // 1. Création de la vidéo côté Bunny
    const { guid } = await bunnyCreateVideo(data.title);

    // 2. Slug unique
    const baseSlug = slugify(data.title) || guid.slice(0, 8);
    let slug = baseSlug;
    for (let i = 2; i < 30; i++) {
      const { data: clash } = await supabaseAdmin
        .from("content")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      slug = `${baseSlug}-${i}`;
    }

    // 3. Insertion de la ligne content (status = processing)
    const { data: inserted, error } = await supabaseAdmin
      .from("content")
      .insert({
        slug,
        title: data.title,
        synopsis: data.synopsis || null,
        type: data.type,
        genres: data.genres,
        year: data.year ?? new Date().getFullYear(),
        bunny_video_id: guid,
        status: "processing",
        uploader_id: userId,
      })
      .select("id, slug")
      .single();
    if (error) {
      await bunnyDeleteVideo(guid).catch(() => {});
      throw new Error(error.message);
    }

    // 4. Credentials TUS
    const tus = bunnyTusAuth(guid);

    return {
      contentId: inserted.id,
      slug: inserted.slug,
      videoGuid: guid,
      tus,
    };
  });

/** Liste les contenus de l'utilisateur courant (créateur). */
export const listMyContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data, error } = await supabaseAdmin
      .from("content")
      .select("id, slug, title, type, status, view_count, created_at, poster_url, bunny_video_id")
      .eq("uploader_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

/** Supprime un contenu (créateur uniquement, sur ses propres contenus). */
export const deleteMyContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ contentId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row } = await supabaseAdmin
      .from("content")
      .select("id, uploader_id, bunny_video_id")
      .eq("id", data.contentId)
      .maybeSingle();
    if (!row || row.uploader_id !== userId) {
      throw new Error("Contenu introuvable ou accès refusé");
    }
    if (row.bunny_video_id) await bunnyDeleteVideo(row.bunny_video_id).catch(() => {});
    const { error } = await supabaseAdmin.from("content").delete().eq("id", row.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Renvoie les infos de lecture pour un slug publié (public). */
export const getPlayback = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().trim().min(1).max(120) }))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("content")
      .select("id, slug, title, synopsis, type, year, duration, genres, poster_url, backdrop_url, bunny_video_id, status")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.status !== "ready" || !row.bunny_video_id) {
      return { found: false as const };
    }
    const { cdnHostname } = getBunnyConfig();
    const host = cdnHostname.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return {
      found: true as const,
      content: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        synopsis: row.synopsis,
        type: row.type,
        year: row.year,
        duration: row.duration,
        genres: row.genres,
        poster_url: row.poster_url,
        backdrop_url: row.backdrop_url,
      },
      hlsUrl: `https://${host}/${row.bunny_video_id}/playlist.m3u8`,
      adTagUrl: process.env.GOOGLE_IMA_AD_TAG_URL ?? null,
    };
  });

/** Rafraîchit le statut d'un contenu (utilisé par le polling du dashboard). */
export const getMyContentStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ contentId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row } = await supabaseAdmin
      .from("content")
      .select("status, uploader_id")
      .eq("id", data.contentId)
      .maybeSingle();
    if (!row || row.uploader_id !== userId) throw new Error("Accès refusé");
    return { status: row.status };
  });