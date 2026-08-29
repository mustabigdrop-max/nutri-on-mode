// SOCIAL ON — Kit de Mídia: helpers compartilhados entre o painel privado
// (gera o link) e a página pública (mostra o kit pra quem recebe o link).

const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Gera um token curto e não-sequencial pro link público (mesmo padrão usado no link de anamnese). */
export function generateMediaKitToken(len = 10): string {
  let out = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) out += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length];
  return out;
}

export type MediaKitMedia = {
  id?: string; caption?: string | null; media_type?: string | null; media_url?: string | null;
  permalink?: string | null; like_count?: number | null; comments_count?: number | null;
};

export type MediaKitData = {
  professional_name?: string | null;
  crn?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  specialties?: string[] | null;
  niches?: string[] | null;
  products?: string[] | null;
  differentials?: string[] | null;
  instagram_handle?: string | null;
  followers_count?: number | null;
  media_count?: number | null;
  profile_picture_url?: string | null;
  recent_media?: MediaKitMedia[] | null;
};

/** Os N posts com mais engajamento (curtidas + comentários), do mais forte pro mais fraco. */
export function topEngagedMedia(media: MediaKitMedia[] | null | undefined, n = 3): MediaKitMedia[] {
  const list = media ?? [];
  const score = (m: MediaKitMedia) => (m.like_count ?? 0) + (m.comments_count ?? 0);
  return [...list].sort((a, b) => score(b) - score(a)).slice(0, n);
}

export const mediaKitUrl = (token: string) => `${window.location.origin}/kit/${token}`;
