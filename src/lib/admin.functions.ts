import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Accès réservé aux administrateurs");
}

/** Liste tous les contenus pour la file de modération. */
export const adminListContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("content")
      .select("id, slug, title, type, status, uploader_id, created_at, poster_url, view_count")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

/** Change le statut d'un contenu (publier / rejeter / repasser en draft). */
export const adminSetStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      contentId: z.string().uuid(),
      status: z.enum(["ready", "rejected", "draft", "processing"]),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "ready") patch.published_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("content").update(patch).eq("id", data.contentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Supprime un contenu (admin). */
export const adminDeleteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ contentId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("content").delete().eq("id", data.contentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });