// SOCIAL ON — sobe foto/vídeo pro Storage e devolve uma URL pública https,
// que é o formato que a Graph API do Instagram exige pra publicar.
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "social-posts";

export type UploadableMedia = File | Blob;

function extFor(kind: "image" | "video", source: UploadableMedia): string {
  const name = source instanceof File ? source.name : "";
  const fromName = name.match(/\.[a-z0-9]+$/i)?.[0];
  if (fromName) return fromName.toLowerCase();
  const type = source.type || "";
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  if (type.includes("quicktime")) return ".mov";
  if (kind === "video") return ".mp4";
  return ".jpg";
}

/**
 * Sobe uma foto ou vídeo pro bucket público `social-posts`, dentro da pasta
 * do coach logado, e devolve a URL pública (https) pronta pra publicar no
 * Instagram ou usar em qualquer outro lugar do app.
 */
export async function uploadSocialMedia(
  file: UploadableMedia,
  opts: { coachId: string; kind: "image" | "video" },
): Promise<string> {
  const ext = extFor(opts.kind, file);
  const path = `${opts.coachId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const contentType = file.type || (opts.kind === "video" ? "video/mp4" : "image/jpeg");

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw new Error(`Falha ao subir o arquivo: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Não consegui gerar a URL pública do arquivo.");
  return data.publicUrl;
}

/** Converte um data URL (ex: canvas.toDataURL) em Blob, pra poder subir pro Storage. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
