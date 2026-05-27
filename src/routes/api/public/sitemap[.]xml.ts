import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STATIC_PATHS = ["/", "/decouvrir", "/recherche", "/tarifs", "/aide", "/contact", "/connexion", "/inscription"];

export const Route = createFileRoute("/api/public/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { data } = await supabaseAdmin
          .from("content")
          .select("slug, updated_at")
          .eq("status", "ready")
          .order("updated_at", { ascending: false })
          .limit(5000);

        const urls: string[] = [];
        for (const p of STATIC_PATHS) {
          urls.push(`<url><loc>${origin}${p}</loc><changefreq>weekly</changefreq></url>`);
        }
        for (const row of data ?? []) {
          urls.push(
            `<url><loc>${origin}/titre/${encodeURIComponent(row.slug)}</loc><lastmod>${row.updated_at}</lastmod></url>`,
          );
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});