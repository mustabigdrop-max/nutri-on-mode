/**
 * Config fixa de hashtags/legenda do gerador "Ciência do Exercício" —
 * conteúdo social cruzando o treino real do dia com a BiomechanicsVault.
 */

export const CONFIG_BIOMECH = {
  hashtags_top5: ["#biomecanica", "#nutrion", "#treinointeligente", "#execucaocorreta", "#cienciadotreino"],

  hashtags_por_grupo: {
    costas: ["#treinodecostas", "#pullday", "#backday", "#dorsais"],
    pernas: ["#legday", "#treinodepernas", "#agachamento"],
    peito: ["#chestday", "#supino", "#treinodepeito"],
    ombros: ["#shoulderday", "#deltoides", "#desenvolvimento"],
    biceps: ["#biceps", "#armday", "#rosca"],
    triceps: ["#triceps", "#treinodebracos"],
  } as Record<string, string[]>,

  cta: "Análise biomecânica completa de cada exercício no nutriON — link na bio.",
  cta_save: "Salva — manda pro amigo que faz esse exercício errado.",
  disclaimer: null as string | null,
  tema_emojis: "🔬⚙️💪",
};

/** Grupos que têm hashtags dedicadas — chave usada em hashtags_por_grupo. */
type GrupoKey = keyof typeof CONFIG_BIOMECH.hashtags_por_grupo;

const GRUPO_TERMOS: Record<GrupoKey, string[]> = {
  costas: ["costas", "dorsal", "trapezio", "latissimo"],
  pernas: ["quadriceps", "gluteo", "posterior", "panturrilha", "perna"],
  peito: ["peitoral", "peito"],
  ombros: ["ombro", "deltoide"],
  biceps: ["biceps"],
  triceps: ["triceps"],
};

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");

/** Casa os grupos musculares do treino (ou o alvo do exercício) com uma chave de hashtag. */
export function grupoKeyFromTags(grupos: string[], alvo?: string): GrupoKey | null {
  const texto = norm(`${(grupos || []).join(" ")} ${alvo || ""}`);
  for (const [key, termos] of Object.entries(GRUPO_TERMOS) as [GrupoKey, string[]][]) {
    if (termos.some((t) => texto.includes(t))) return key;
  }
  return null;
}

/** Monta a lista final de hashtags: top5 fixas + as do grupo, sem repetir. */
export function hashtagsBiomech(grupos: string[], alvo?: string): string[] {
  const key = grupoKeyFromTags(grupos, alvo);
  const doGrupo = key ? CONFIG_BIOMECH.hashtags_por_grupo[key] : [];
  return Array.from(new Set([...CONFIG_BIOMECH.hashtags_top5, ...doGrupo]));
}
