import { supabase } from "@/integrations/supabase/client";

export const MCE_AUDIO_BUCKET = "mce-audio";

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const pendingUrls = new Map<string, Promise<string | null>>();

/**
 * audio_url pode guardar:
 *  - uma URL http(s) externa
 *  - um caminho dentro do bucket privado "mce-audio" (ex: "mindset/ep-1.mp3")
 * Resolve para uma URL tocável (signed URL de 2h quando for caminho do bucket).
 */
export async function resolveAudioSrc(audioUrl: string): Promise<string | null> {
  if (!audioUrl) return null;
  if (/^(https?:|data:|blob:)/.test(audioUrl)) return audioUrl;

  const key = audioUrl.replace(/^\/+/, "");
  const cached = signedUrlCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  const pending = pendingUrls.get(key);
  if (pending) return pending;

  const request = (async () => {
    const { data, error } = await supabase.storage
      .from(MCE_AUDIO_BUCKET)
      .createSignedUrl(key, 60 * 120);

    if (error || !data?.signedUrl) return null;
    signedUrlCache.set(key, { url: data.signedUrl, expiresAt: Date.now() + 110 * 60 * 1000 });
    return data.signedUrl;
  })();
  pendingUrls.set(key, request);
  try {
    return await request;
  } finally {
    pendingUrls.delete(key);
  }
}

/** Aquece a URL assinada e o cache HTTP sem iniciar reprodução. */
export async function preloadAudioSrc(audioUrl: string): Promise<string | null> {
  const src = await resolveAudioSrc(audioUrl);
  if (!src || typeof document === "undefined") return src;
  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.src = src;
  audio.load();
  return src;
}

export function buildAudioPath(series: string, episodeNumber: number | null, fileName: string) {
  const ext = (fileName.split(".").pop() || "mp3").toLowerCase();
  const stamp = Date.now();
  return `${series}/ep-${episodeNumber ?? "x"}-${stamp}.${ext}`;
}
