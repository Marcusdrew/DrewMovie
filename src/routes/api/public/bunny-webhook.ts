import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyBunnyWebhookSecret, getBunnyConfig } from "@/lib/bunny.server";

// Bunny Stream POST le statut de transcodage ici.
// Configurer dans Bunny → Library → Webhook URL :
//   https://project--<id>.lovable.app/api/public/bunny-webhook?secret=<BUNNY_WEBHOOK_SECRET>
// Payload exemple: { VideoLibraryId, VideoGuid, Status }
// Status: 0 Created · 1 Uploaded · 2 Processing · 3 Transcoding · 4 Finished · 5 Error

export const Route = createFileRoute("/api/public/bunny-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const secret = url.searchParams.get("secret");
        if (!verifyBunnyWebhookSecret(secret)) {
          return new Response("Forbidden", { status: 403 });
        }

        let body: { VideoGuid?: string; VideoLibraryId?: number | string; Status?: number };
        try {
          body = await request.json();
        } catch {
          return new Response("Bad Request", { status: 400 });
        }

        const guid = body.VideoGuid;
        const status = body.Status;
        if (!guid || typeof status !== "number") {
          return new Response("Missing fields", { status: 400 });
        }

        const { libraryId } = getBunnyConfig();
        if (body.VideoLibraryId !== undefined && String(body.VideoLibraryId) !== libraryId) {
          return new Response("Library mismatch", { status: 400 });
        }

        let newStatus: "processing" | "ready" | "rejected" | null = null;
        if (status === 4) newStatus = "ready";
        else if (status === 5) newStatus = "rejected";
        else if (status === 2 || status === 3) newStatus = "processing";

        if (newStatus) {
          const update =
            newStatus === "ready"
              ? { status: newStatus, published_at: new Date().toISOString() }
              : { status: newStatus };
          const { error } = await supabaseAdmin
            .from("content")
            .update(update)
            .eq("bunny_video_id", guid);
          if (error) {
            console.error("[bunny-webhook] update error:", error.message);
            return new Response("DB error", { status: 500 });
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});