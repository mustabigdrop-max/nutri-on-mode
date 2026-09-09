/**
 * Tipos do conteúdo pós-slides (legenda, self-comment, hashtags, CTA).
 * As regras por tipo de carrossel vivem na função `social-on-generate`
 * (supabase/functions/_shared/carouselConfigs.ts) — aqui só o contrato
 * que a interface consome.
 */

export type TipoCarrossel =
  | "MCE"
  | "NEXUS_PEPTIDEO"
  | "NEXUS_MICROBIOTA"
  | "NEXUS_ESTEROIDE"
  | "RESULTADO_PROTOCOLO"
  | "REFEICAO"
  | "NUTRION_FEATURE"
  | "MITO_METODO";

export type PosSlidesResult = {
  legenda: string;
  self_comment: string;
  hashtags_top5: string[];
  hashtags_15: string[];
  cta: string;
  cta_save: string;
  disclaimer?: string | null;
  tema_emojis?: string;
  melhor_horario?: string;
  dica_engajamento?: string;
};

export const TIPO_CARROSSEL_LABEL: Record<TipoCarrossel, string> = {
  MCE: "Carrossel MCE",
  NEXUS_PEPTIDEO: "NEXUS · Peptídeo",
  NEXUS_MICROBIOTA: "NEXUS · Microbiota",
  NEXUS_ESTEROIDE: "NEXUS · Esteroides & PEDs",
  RESULTADO_PROTOCOLO: "Resultado + Protocolo",
  REFEICAO: "Refeição",
  NUTRION_FEATURE: "Funcionalidade nutriON",
  MITO_METODO: "Mito ou Método",
};
