// SOCIAL ON — sobe foto/vídeo pro Storage e devolve uma URL https temporária
// (signed URL), que é o formato que a Graph API do Instagram exige pra
// publicar. O bucket é privado (política de segurança do workspace não
// permite bucket público), então usamos URL assinada em vez de URL pública —
// funciona igual pra quem recebe (é um link https normal), mas expira depois
// de um tempo e só é gerada por quem tem permissão de ler o próprio arquivo.
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "social-posts";
/** Tempo de validade da URL assinada — dá folga de sobra pro Instagram baixar e processar o vídeo. */
const SIGNED_URL_TTL_SECONDS = 3600;

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
 * Sobe uma foto ou vídeo pro bucket privado `social-posts`, dentro da pasta
 * do coach logado, e devolve uma URL assinada (https, temporária) pronta pra
 * publicar no Instagram ou usar em qualquer outro lugar do app.
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

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signError || !data?.signedUrl) {
    throw new Error(`Não consegui gerar o link temporário do arquivo: ${signError?.message ?? "erro desconhecido"}`);
  }
  return data.signedUrl;
}

/** Converte um data URL (ex: canvas.toDataURL) em Blob, pra poder subir pro Storage. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
