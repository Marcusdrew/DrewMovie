import { createHash, createHmac, timingSafeEqual } from "crypto";

const BUNNY_API_BASE = "https://video.bunnycdn.com";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante: ${name}`);
  return v;
}

export function getBunnyConfig() {
  return {
    apiKey: env("BUNNY_STREAM_API_KEY"),
    libraryId: env("BUNNY_STREAM_LIBRARY_ID"),
    cdnHostname: env("BUNNY_CDN_HOSTNAME"),
    webhookSecret: env("BUNNY_WEBHOOK_SECRET"),
  };
}

export async function bunnyCreateVideo(title: string): Promise<{ guid: string }> {
  const { apiKey, libraryId } = getBunnyConfig();
  const res = await fetch(`${BUNNY_API_BASE}/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      AccessKey: apiKey,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Bunny createVideo a échoué (${res.status}): ${txt}`);
  }
  const data = (await res.json()) as { guid: string };
  return { guid: data.guid };
}

export async function bunnyDeleteVideo(guid: string): Promise<void> {
  const { apiKey, libraryId } = getBunnyConfig();
  await fetch(`${BUNNY_API_BASE}/library/${libraryId}/videos/${guid}`, {
    method: "DELETE",
    headers: { AccessKey: apiKey },
  });
}

export interface BunnyTusAuth {
  endpoint: string;
  videoId: string;
  libraryId: string;
  expire: number;
  signature: string;
}

export function bunnyTusAuth(videoGuid: string): BunnyTusAuth {
  const { apiKey, libraryId } = getBunnyConfig();
  // expire dans 24h
  const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const signature = createHash("sha256")
    .update(`${libraryId}${apiKey}${expire}${videoGuid}`)
    .digest("hex");
  return {
    endpoint: `${BUNNY_API_BASE}/tusupload`,
    videoId: videoGuid,
    libraryId,
    expire,
    signature,
  };
}

export function verifyBunnyWebhookSecret(provided: string | null): boolean {
  const { webhookSecret } = getBunnyConfig();
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(webhookSecret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Réservé pour usage futur (signature HMAC custom si Bunny l'expose).
export function hmacSha256(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}