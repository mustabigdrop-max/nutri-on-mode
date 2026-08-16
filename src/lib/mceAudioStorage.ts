import { supabase } from "@/integrations/supabase/client";

export const MCE_AUDIO_BUCKET = "mce-audio";

/**
 * audio_url pode guardar:
 *  - uma URL http(s) externa
 *  - um caminho dentro do bucket privado "mce-audio" (ex: "mindset/ep-1.mp3")
 * Resolve para uma URL tocável (signed URL de 2h quando for caminho do bucket).
 */
export async function resolveAudioSrc(audioUrl: string): Promise<string | null> {
  if (!audioUrl) return null;
  if (/^(https?:|data:|blob:)/.test(audioUrl)) return audioUrl;

  const { data, error } = await supabase.storage
    .from(MCE_AUDIO_BUCKET)
    .createSignedUrl(audioUrl.replace(/^\/+/, ""), 60 * 120);

  if (error) return null;
  return data?.signedUrl ?? null;
}

export function buildAudioPath(series: string, episodeNumber: number | null, fileName: string) {
  const ext = (fileName.split(".").pop() || "mp3").toLowerCase();
  const stamp = Date.now();
  return `${series}/ep-${episodeNumber ?? "x"}-${stamp}.${ext}`;
}
