// ═══════════════════════════════════════════════════════════════════════════
// NUTRIPLAN INTELLIGENCE SYSTEM — Fase 1
// Quick Client presets, Smart Defaults, Somatotipo, Perfil Digestivo e Autonômico
// ═══════════════════════════════════════════════════════════════════════════

export type Somatotipo = "" | "ectomorfo" | "mesomorfo" | "endomorfo" | "ecto_meso" | "endo_meso";
export type ToleranciaCho = "" | "alta" | "moderada" | "baixa";
export type VelocidadeDigestiva = "" | "rapida" | "normal" | "lenta";
export type NivelEstresseIntel = "" | "baixo" | "moderado" | "alto" | "burnout";
export type Overtraining = "" | "nao" | "alguns" | "sim";

export type IntelState = {
  somatotipo: Somatotipo;
  toleranciaCho: ToleranciaCho;
  velocidadeDigestiva: VelocidadeDigestiva;
  sintomasDigestivos: string[];
  nivelEstresse: NivelEstresseIntel;
  overtraining: Overtraining;
  hrv: string;
  recoveryScore: string;
};

export const INTEL_DEFAULT: IntelState = {
  somatotipo: "",
  toleranciaCho: "",
  velocidadeDigestiva: "",
  sintomasDigestivos: [],
  nivelEstresse: "",
  overtraining: "",
  hrv: "",
  recoveryScore: "",
};

// ─── 1.1 QUICK CLIENT ────────────────────────────────────────────────────────
export type QuickProfile = {
  id: string;
  label: string;
  emoji: string;
  form: Record<string, any>;
  categoriaEsporte?: string;
  intel?: Partial<IntelState>;
};

export const QUICK_PROFILES: QuickProfile[] = [
  {
    id: "homem_cut", label: "Homem Cut", emoji: "👨",
    form: {
      sexo: "masculino", objetivo: "emagrecimento", fasePeriodizacao: "cutting",
      nivelAtividade: "moderado", neat: "medio", qualidadeSono: "boa",
      refeicoes: "5", treino: "musculacao", perfilPCA: "executor",
      cyclingCarbo: true, cronobiologiaAtiva: true, glut4Enabled: true, medidasCaseiras: true,
    },
    intel: { somatotipo: "mesomorfo", toleranciaCho: "moderada" },
  },
  {
    id: "homem_bulk", label: "Homem Bulk", emoji: "👨",
    form: {
      sexo: "masculino", objetivo: "hipertrofia", fasePeriodizacao: "bulking",
      nivelAtividade: "ativo", neat: "medio", qualidadeSono: "boa",
      refeicoes: "6", treino: "musculacao", perfilPCA: "executor",
      cyclingCarbo: false, cronobiologiaAtiva: true, glut4Enabled: true, protocoloMicrobiota: true,
    },
    intel: { somatotipo: "ectomorfo", toleranciaCho: "alta" },
  },
  {
    id: "mulher_shape", label: "Mulher Shape", emoji: "👩",
    form: {
      sexo: "feminino", objetivo: "recomposicao", fasePeriodizacao: "manutencao_offseason",
      nivelAtividade: "moderado", neat: "medio", qualidadeSono: "boa",
      refeicoes: "5", treino: "musculacao", cronobiologiaAtiva: true, medidasCaseiras: true,
    },
    categoriaEsporte: "shape_estetico_fem",
    intel: { somatotipo: "meso" as any, toleranciaCho: "moderada" },
  },
  {
    id: "atleta_comp", label: "Atleta Comp", emoji: "🏋️",
    form: {
      sexo: "masculino", objetivo: "emagrecimento", fasePeriodizacao: "cutting",
      nivelAtividade: "muito_ativo", neat: "medio", qualidadeSono: "boa",
      refeicoes: "6", treino: "musculacao", atletaCompetitivo: true,
      cyclingCarbo: true, cronobiologiaAtiva: true, glut4Enabled: true, hidratacaoFarmacologica: true,
    },
    categoriaEsporte: "bodybuilding",
    intel: { somatotipo: "mesomorfo", toleranciaCho: "moderada" },
  },
  {
    id: "endurance", label: "Endurance", emoji: "🏃",
    form: {
      sexo: "masculino", objetivo: "performance", fasePeriodizacao: "manutencao_offseason",
      nivelAtividade: "muito_ativo", neat: "alto", qualidadeSono: "boa",
      refeicoes: "6", treino: "corrida", cyclingCarbo: false, cronobiologiaAtiva: true,
    },
    intel: { somatotipo: "ectomorfo", toleranciaCho: "alta" },
  },
  {
    id: "longevidade", label: "Longevidade", emoji: "🧓",
    form: {
      objetivo: "saude", fasePeriodizacao: "manutencao_offseason",
      nivelAtividade: "leve", neat: "medio", qualidadeSono: "regular",
      refeicoes: "4", treino: "musculacao", protocoloMicrobiota: true, diversidadeAlimentarElite: true,
    },
    categoriaEsporte: "longevidade_saude",
  },
  {
    id: "trt_lifestyle", label: "TRT Lifestyle", emoji: "💉",
    form: {
      sexo: "masculino", objetivo: "recomposicao", fasePeriodizacao: "manutencao_offseason",
      nivelAtividade: "moderado", neat: "medio", qualidadeSono: "boa",
      refeicoes: "5", treino: "musculacao", cronobiologiaAtiva: true, glut4Enabled: true,
    },
    categoriaEsporte: "shape_estetico_masc",
    intel: { somatotipo: "endo_meso", toleranciaCho: "moderada" },
  },
  {
    id: "recomp", label: "Recomp", emoji: "🔄",
    form: {
      objetivo: "recomposicao", fasePeriodizacao: "manutencao_offseason",
      nivelAtividade: "moderado", neat: "medio", qualidadeSono: "boa",
      refeicoes: "5", treino: "musculacao", cyclingCarbo: true, cronobiologiaAtiva: true, glut4Enabled: true,
    },
    categoriaEsporte: "recomposicao_corporal",
    intel: { somatotipo: "mesomorfo", toleranciaCho: "moderada" },
  },
];

// ─── 1.3 SMART DEFAULTS por objetivo ────────────────────────────────────────
export const SMART_DEFAULTS: Record<string, Record<string, any>> = {
  emagrecimento: {
    fasePeriodizacao: "cutting", cyclingCarbo: true, cronobiologiaAtiva: true,
    glut4Enabled: true, hidratacaoFarmacologica: true, medidasCaseiras: true,
  },
  hipertrofia: {
    fasePeriodizacao: "bulking", cyclingCarbo: false, cronobiologiaAtiva: true,
    glut4Enabled: true, protocoloMicrobiota: true,
  },
  recomposicao: {
    fasePeriodizacao: "manutencao_offseason", cyclingCarbo: true,
    cronobiologiaAtiva: true, glut4Enabled: true,
  },
  performance: {
    cronobiologiaAtiva: true, glut4Enabled: true, hidratacaoFarmacologica: true,
  },
  saude: {
    fasePeriodizacao: "manutencao_offseason", protocoloMicrobiota: true,
    diversidadeAlimentarElite: true, medidasCaseiras: true,
  },
};

// ─── 3.2 Somatotipo ─────────────────────────────────────────────────────────
export const SOMATOTIPOS: { v: Somatotipo; l: string; d: string }[] = [
  { v: "ectomorfo", l: "Ectomorfo", d: "Metabolismo rápido, dificuldade de ganhar" },
  { v: "mesomorfo", l: "Mesomorfo", d: "Responde bem a treino, ganha/perde fácil" },
  { v: "endomorfo", l: "Endomorfo", d: "Tende a acumular gordura, insulina alta" },
  { v: "ecto_meso", l: "Ecto-Meso", d: "Misto — magro com boa resposta ao treino" },
  { v: "endo_meso", l: "Endo-Meso", d: "Misto — forte com tendência a reter gordura" },
];

export const TOLERANCIA_CHO: { v: ToleranciaCho; l: string }[] = [
  { v: "alta", l: "Alta — come carbo e fica seco" },
  { v: "moderada", l: "Moderada — normal" },
  { v: "baixa", l: "Baixa — incha / retém com carbo" },
];

// ─── 3.5 Perfil digestivo ───────────────────────────────────────────────────
export const VELOCIDADE_DIGESTIVA: { v: VelocidadeDigestiva; l: string }[] = [
  { v: "rapida", l: "Rápida" },
  { v: "normal", l: "Normal" },
  { v: "lenta", l: "Lenta — empachamento frequente" },
];

export const SINTOMAS_DIGESTIVOS = [
  "Distensão abdominal / inchaço",
  "Gases excessivos",
  "Refluxo / azia",
  "Constipação (< 1 evacuação/dia)",
  "Diarreia frequente",
  "Desconforto após laticínios",
  "Desconforto após glúten",
  "Desconforto após leguminosas",
  "Má digestão de carne vermelha",
];

// ─── 2.4 Perfil autonômico ──────────────────────────────────────────────────
export const NIVEIS_ESTRESSE_INTEL: { v: NivelEstresseIntel; l: string }[] = [
  { v: "baixo", l: "Baixo" },
  { v: "moderado", l: "Moderado" },
  { v: "alto", l: "Alto" },
  { v: "burnout", l: "Muito alto / Burnout" },
];

export const OVERTRAINING_OPTS: { v: Overtraining; l: string }[] = [
  { v: "nao", l: "Não" },
  { v: "alguns", l: "Alguns (sono ruim, irritabilidade)" },
  { v: "sim", l: "Sim (queda de performance, dores, libido baixa)" },
];

// ─── 7 Tags rápidas novas ───────────────────────────────────────────────────
export const ELITE_CHIPS = [
  "Engenharia de saciedade",
  "Nutrient Intelligence (sinergia)",
  "Reverse diet ativo",
  "Diet break programado",
  "Termogênese otimizada",
  "Fibra ≥35g/dia",
  "Anti-inflamatório",
  "Protocolo de sono",
  "Alimentos pró-testosterona",
  "Sensibilidade insulínica",
];

export const FEMININO_CHIPS = [
  "Fase folicular",
  "Fase lútea",
  "Amenorreia — investigar",
  "Anticoncepcional hormonal",
  "Menopausa — isoflavonas",
  "Ferro menstrual",
];

// ─── Contexto para a IA ─────────────────────────────────────────────────────
export function buildIntelContext(i: IntelState): string[] {
  const parts: string[] = [];
  if (i.somatotipo) parts.push(`SOMATOTIPO: ${i.somatotipo}`);
  if (i.toleranciaCho) parts.push(`TOLERÂNCIA A CARBOIDRATOS: ${i.toleranciaCho}`);
  if (i.velocidadeDigestiva) parts.push(`VELOCIDADE DIGESTIVA: ${i.velocidadeDigestiva}`);
  if (i.sintomasDigestivos.length) parts.push(`SINTOMAS DIGESTIVOS: ${i.sintomasDigestivos.join(", ")}`);
  if (i.nivelEstresse) parts.push(`ESTADO AUTONÔMICO / ESTRESSE: ${i.nivelEstresse}`);
  if (i.overtraining) parts.push(`SINAIS DE OVERTRAINING: ${i.overtraining}`);
  if (i.hrv) parts.push(`HRV MÉDIO: ${i.hrv} ms`);
  if (i.recoveryScore) parts.push(`RECOVERY SCORE (wearable): ${i.recoveryScore}%`);
  return parts;
}
