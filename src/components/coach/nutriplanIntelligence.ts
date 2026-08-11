// ═══════════════════════════════════════════════════════════════════════════
// NUTRIPLAN INTELLIGENCE SYSTEM — Fase 1
// Quick Client presets, Smart Defaults, Somatotipo, Perfil Digestivo e Autonômico
// ═══════════════════════════════════════════════════════════════════════════

export type Somatotipo = "" | "ectomorfo" | "mesomorfo" | "endomorfo" | "ecto_meso" | "endo_meso";
export type ToleranciaCho = "" | "alta" | "moderada" | "baixa";
export type VelocidadeDigestiva = "" | "rapida" | "normal" | "lenta";
export type NivelEstresseIntel = "" | "baixo" | "moderado" | "alto" | "burnout";
export type Overtraining = "" | "nao" | "alguns" | "sim";
export type DietasAnteriores = "" | "0" | "1_2" | "3_5" | "6_mais";
export type ModoDieta = "" | "normal" | "reverse" | "diet_break";
export type PrioridadeSaciedade = "" | "baixa" | "media" | "alta";

export type IntelState = {
  somatotipo: Somatotipo;
  toleranciaCho: ToleranciaCho;
  velocidadeDigestiva: VelocidadeDigestiva;
  sintomasDigestivos: string[];
  nivelEstresse: NivelEstresseIntel;
  overtraining: Overtraining;
  hrv: string;
  recoveryScore: string;
  // ─── Fase 2 ───
  dietasAnteriores: DietasAnteriores;
  menorKcal: string;
  mesesEmDeficit: string;
  efeitoSanfona: boolean;
  kgRecuperado: string;
  usoTermogenicos: boolean;
  jejumFrequente: boolean;
  semanasSemRefeed: string;
  modoDieta: ModoDieta;
  reverseIncremento: string;
  reverseSemanas: string;
  prioridadeSaciedade: PrioridadeSaciedade;
  estrategiasSaciedade: string[];
  diaOnOff: boolean;
  deltaChoOff: string;
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
  dietasAnteriores: "",
  menorKcal: "",
  mesesEmDeficit: "",
  efeitoSanfona: false,
  kgRecuperado: "",
  usoTermogenicos: false,
  jejumFrequente: false,
  semanasSemRefeed: "",
  modoDieta: "",
  reverseIncremento: "100",
  reverseSemanas: "8",
  prioridadeSaciedade: "",
  estrategiasSaciedade: [],
  diaOnOff: false,
  deltaChoOff: "25",
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
      sexo: "masculino", objetivo: "ganho_massa", fasePeriodizacao: "bulk_limpo",
      nivelAtividade: "ativo", neat: "medio", qualidadeSono: "boa",
      refeicoes: "6", treino: "musculacao", perfilPCA: "executor",
      cyclingCarbo: false, cronobiologiaAtiva: true, glut4Enabled: true, protocoloMicrobiota: true,
    },
    intel: { somatotipo: "ectomorfo", toleranciaCho: "alta" },
  },
  {
    id: "mulher_shape", label: "Mulher Shape", emoji: "👩",
    form: {
      sexo: "feminino", objetivo: "recomposicao", fasePeriodizacao: "recomposicao",
      nivelAtividade: "moderado", neat: "medio", qualidadeSono: "boa",
      refeicoes: "5", treino: "musculacao", cronobiologiaAtiva: true, medidasCaseiras: true,
    },
    categoriaEsporte: "shape_estetico_fem",
    intel: { somatotipo: "mesomorfo", toleranciaCho: "moderada" },
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
      sexo: "masculino", objetivo: "recomposicao", fasePeriodizacao: "recomposicao",
      nivelAtividade: "moderado", neat: "medio", qualidadeSono: "boa",
      refeicoes: "5", treino: "musculacao", cronobiologiaAtiva: true, glut4Enabled: true,
    },
    categoriaEsporte: "shape_estetico_masc",
    intel: { somatotipo: "endo_meso", toleranciaCho: "moderada" },
  },
  {
    id: "recomp", label: "Recomp", emoji: "🔄",
    form: {
      objetivo: "recomposicao", fasePeriodizacao: "recomposicao",
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
  ganho_massa: {
    fasePeriodizacao: "bulk_limpo", cyclingCarbo: false, cronobiologiaAtiva: true,
    glut4Enabled: true, protocoloMicrobiota: true,
  },
  recomposicao: {
    fasePeriodizacao: "recomposicao", cyclingCarbo: true,
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

// ═══ FASE 2.1 — HISTÓRICO METABÓLICO + SCORE ════════════════════════════════
export const DIETAS_ANTERIORES: { v: DietasAnteriores; l: string }[] = [
  { v: "0", l: "Nenhuma dieta estruturada" },
  { v: "1_2", l: "1 a 2 dietas" },
  { v: "3_5", l: "3 a 5 dietas" },
  { v: "6_mais", l: "6 ou mais (dieta crônica)" },
];

export type MetabolicScore = {
  score: number;
  nivel: "otimo" | "bom" | "atencao" | "suprimido";
  label: string;
  cor: string;
  riscos: string[];
  recomendacao: string;
};

export function computeMetabolicScore(i: IntelState, pesoKg?: number): MetabolicScore | null {
  const preenchido = i.dietasAnteriores || i.menorKcal || i.mesesEmDeficit ||
    i.efeitoSanfona || i.usoTermogenicos || i.jejumFrequente || i.semanasSemRefeed;
  if (!preenchido) return null;

  let score = 100;
  const riscos: string[] = [];

  if (i.dietasAnteriores === "1_2") score -= 5;
  if (i.dietasAnteriores === "3_5") { score -= 12; riscos.push("Histórico de múltiplas dietas restritivas"); }
  if (i.dietasAnteriores === "6_mais") { score -= 22; riscos.push("Dieta crônica — adaptação metabólica provável"); }

  const meses = Number(i.mesesEmDeficit) || 0;
  if (meses >= 3 && meses < 6) score -= 8;
  if (meses >= 6 && meses < 12) { score -= 16; riscos.push(`${meses} meses em déficit contínuo`); }
  if (meses >= 12) { score -= 25; riscos.push(`Déficit prolongado (${meses} meses) — eixo tireoidiano/leptina comprometido`); }

  const menor = Number(i.menorKcal) || 0;
  if (menor > 0 && pesoKg && pesoKg > 0) {
    const kcalKg = menor / pesoKg;
    if (kcalKg < 18) { score -= 20; riscos.push(`Já sustentou ${menor} kcal (${kcalKg.toFixed(1)} kcal/kg) — muito baixo`); }
    else if (kcalKg < 22) { score -= 10; riscos.push(`Piso calórico baixo (${kcalKg.toFixed(1)} kcal/kg)`); }
  } else if (menor > 0 && menor < 1200) {
    score -= 15; riscos.push(`Piso calórico muito baixo (${menor} kcal)`);
  }

  if (i.efeitoSanfona) { score -= 12; riscos.push("Efeito sanfona relatado"); }
  const kgRec = Number(i.kgRecuperado) || 0;
  if (kgRec >= 8) { score -= 8; riscos.push(`Reganho de ${kgRec} kg pós-dieta`); }

  if (i.usoTermogenicos) { score -= 6; riscos.push("Uso recorrente de termogênicos"); }
  if (i.jejumFrequente) { score -= 5; riscos.push("Jejum prolongado frequente"); }

  const semRefeed = Number(i.semanasSemRefeed) || 0;
  if (semRefeed >= 8) { score -= 10; riscos.push(`${semRefeed} semanas sem refeed / diet break`); }
  else if (semRefeed >= 4) score -= 4;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let nivel: MetabolicScore["nivel"] = "otimo";
  let label = "Metabolismo responsivo";
  let cor = "#00C896";
  let recomendacao = "Pode iniciar déficit padrão (-15 a -20%) com segurança. Refeed a cada 10–14 dias.";
  if (score < 80 && score >= 60) {
    nivel = "bom"; label = "Levemente adaptado"; cor = "#B8922A";
    recomendacao = "Déficit moderado (-12 a -15%). Refeed semanal e diet break a cada 8–10 semanas.";
  } else if (score < 60 && score >= 40) {
    nivel = "atencao"; label = "Adaptação metabólica"; cor = "#FF8C42";
    recomendacao = "Iniciar com diet break de 2 semanas em manutenção ANTES do déficit. Depois -10% no máximo, com refeeds 2x/semana.";
  } else if (score < 40) {
    nivel = "suprimido"; label = "Metabolismo suprimido"; cor = "#FF5C5C";
    recomendacao = "NÃO iniciar déficit. Indicar REVERSE DIET de 8–12 semanas (+50 a +100 kcal/semana) até recuperar manutenção real. Priorizar sono, força e volume alimentar.";
  }

  return { score, nivel, label, cor, riscos, recomendacao };
}

// ═══ FASE 2.2 — REVERSE DIET / DIET BREAK ═══════════════════════════════════
export const MODOS_DIETA: { v: ModoDieta; l: string; d: string }[] = [
  { v: "normal", l: "Padrão", d: "Déficit / superávit conforme o objetivo" },
  { v: "reverse", l: "Reverse Diet", d: "Aumento gradual de kcal para recuperar a manutenção" },
  { v: "diet_break", l: "Diet Break", d: "Pausa em manutenção por 1–2 semanas antes de retomar" },
];

// ═══ FASE 2.3 — ENGENHARIA DE SACIEDADE ═════════════════════════════════════
export const PRIORIDADE_SACIEDADE: { v: PrioridadeSaciedade; l: string }[] = [
  { v: "baixa", l: "Baixa — pouca fome relatada" },
  { v: "media", l: "Média" },
  { v: "alta", l: "Alta — fome é o principal obstáculo" },
];

export const ESTRATEGIAS_SACIEDADE = [
  "Alto volume (vegetais folhosos + água)",
  "Proteína ≥40g por refeição",
  "Fibra viscosa (psyllium, aveia, chia)",
  "Sopas e caldos pré-refeição",
  "Batata / arroz resfriados (amido resistente)",
  "Proteína magra sólida (evitar shakes)",
  "Café / chá entre refeições",
  "Refeição maior à noite (compliance)",
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

  // ─── Fase 2 ───
  if (i.dietasAnteriores) parts.push(`DIETAS RESTRITIVAS ANTERIORES: ${i.dietasAnteriores.replace("_mais", "+").replace("_", " a ")}`);
  if (i.menorKcal) parts.push(`MENOR CALORIA JÁ SUSTENTADA: ${i.menorKcal} kcal`);
  if (i.mesesEmDeficit) parts.push(`MESES CONTÍNUOS EM DÉFICIT: ${i.mesesEmDeficit}`);
  if (i.efeitoSanfona) parts.push(`EFEITO SANFONA: sim${i.kgRecuperado ? ` (reganho de ${i.kgRecuperado} kg)` : ""}`);
  if (i.usoTermogenicos) parts.push("USO RECORRENTE DE TERMOGÊNICOS: sim");
  if (i.jejumFrequente) parts.push("JEJUM PROLONGADO FREQUENTE: sim");
  if (i.semanasSemRefeed) parts.push(`SEMANAS SEM REFEED/DIET BREAK: ${i.semanasSemRefeed}`);

  const ms = computeMetabolicScore(i);
  if (ms) {
    parts.push(`METABOLIC SCORE: ${ms.score}/100 (${ms.label})`);
    if (ms.riscos.length) parts.push(`RISCOS METABÓLICOS: ${ms.riscos.join("; ")}`);
    parts.push(`CONDUTA SUGERIDA PELO SCORE: ${ms.recomendacao}`);
  }

  if (i.modoDieta === "reverse") {
    parts.push(`MODO DO PLANO: REVERSE DIET — incremento de ${i.reverseIncremento || 100} kcal por semana durante ${i.reverseSemanas || 8} semanas`);
  } else if (i.modoDieta === "diet_break") {
    parts.push("MODO DO PLANO: DIET BREAK — calorias em manutenção real (sem déficit) por 1–2 semanas");
  } else if (i.modoDieta === "normal") {
    parts.push("MODO DO PLANO: padrão conforme objetivo");
  }

  if (i.prioridadeSaciedade) parts.push(`PRIORIDADE DE SACIEDADE: ${i.prioridadeSaciedade}`);
  if (i.estrategiasSaciedade.length) parts.push(`ESTRATÉGIAS DE SACIEDADE: ${i.estrategiasSaciedade.join(", ")}`);
  if (i.diaOnOff) parts.push(`DIA ON/OFF: sim — no dia OFF (sem treino) reduzir carboidrato em ${i.deltaChoOff || 25}% e redistribuir parte em gordura, mantendo a proteína`);

  return parts;
}
