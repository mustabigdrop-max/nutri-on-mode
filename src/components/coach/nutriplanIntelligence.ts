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
export type FaseCiclo = "" | "folicular" | "ovulatoria" | "lutea" | "menstrual" | "anticoncepcional" | "amenorreia" | "menopausa";
export type FreqComerFora = "" | "raro" | "1_2" | "3_5" | "diario";

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
  // ─── Fase 3 ───
  labs: Record<string, string>;
  faseCiclo: FaseCiclo;
  cicloSincronizado: boolean;
  duracaoCiclo: string;
  tpmIntensa: boolean;
  comerFora: FreqComerFora;
  contextosComerFora: string[];
  alcoolSemanal: string;
  calorimetriaKcal: string;
  metodoCalorimetria: string;
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
  labs: {},
  faseCiclo: "",
  cicloSincronizado: false,
  duracaoCiclo: "28",
  tpmIntensa: false,
  comerFora: "",
  contextosComerFora: [],
  alcoolSemanal: "",
  calorimetriaKcal: "",
  metodoCalorimetria: "",
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

// ═══ FASE 3.1 — EXAMES LABORATORIAIS ════════════════════════════════════════
export type LabMarker = {
  k: string; l: string; unit: string;
  min?: number; max?: number;
  otimo?: string;
  baixoAcao?: string;
  altoAcao?: string;
};

export const LAB_MARKERS: { grupo: string; cor: string; itens: LabMarker[] }[] = [
  {
    grupo: "Metabólico / Glicemia", cor: "#00C896",
    itens: [
      { k: "glicemia", l: "Glicemia jejum", unit: "mg/dL", min: 70, max: 99, otimo: "75–90",
        altoAcao: "Reduzir CHO refinado, priorizar CHO periworkout, fibra ≥35g, canela/vinagre, caminhada pós-refeição" },
      { k: "insulina", l: "Insulina jejum", unit: "µUI/mL", min: 2, max: 8, otimo: "< 6",
        altoAcao: "Resistência insulínica — CHO 30–35% VET, cromo/magnésio, jejum noturno de 12h" },
      { k: "hba1c", l: "HbA1c", unit: "%", min: 4, max: 5.6, otimo: "< 5.3",
        altoAcao: "Controle glicêmico crônico — reduzir carga glicêmica total" },
      { k: "hdl", l: "HDL", unit: "mg/dL", min: 45, max: 90, otimo: "> 55",
        baixoAcao: "Azeite, abacate, ômega-3, oleaginosas; reduzir açúcar" },
      { k: "triglicerides", l: "Triglicerídeos", unit: "mg/dL", min: 40, max: 149, otimo: "< 100",
        altoAcao: "Cortar frutose líquida e álcool, ômega-3 2–3g/dia" },
    ],
  },
  {
    grupo: "Hormonal", cor: "#B8922A",
    itens: [
      { k: "tsh", l: "TSH", unit: "µUI/mL", min: 0.5, max: 4.0, otimo: "1.0–2.0",
        altoAcao: "Suspeita de hipotireoidismo — evitar déficit agressivo, garantir iodo, selênio e zinco, CHO ≥100g/dia" },
      { k: "t3", l: "T3 livre", unit: "pg/mL", min: 2.3, max: 4.2,
        baixoAcao: "T3 baixo sugere adaptação metabólica — refeed/diet break antes de novo déficit" },
      { k: "testosterona", l: "Testosterona total", unit: "ng/dL", min: 300, max: 1000, otimo: "> 550",
        baixoAcao: "Gordura ≥25% VET, zinco, vitamina D, colesterol dietético, sono ≥7h" },
      { k: "cortisol", l: "Cortisol matinal", unit: "µg/dL", min: 6, max: 18,
        altoAcao: "Reduzir déficit, CHO na última refeição, magnésio bisglicinato, ashwagandha, cafeína < 200mg" },
    ],
  },
  {
    grupo: "Micronutrientes / Hematologia", cor: "#7890ff",
    itens: [
      { k: "vitd", l: "Vitamina D (25-OH)", unit: "ng/mL", min: 30, max: 60, otimo: "40–60",
        baixoAcao: "Peixes gordos, gema, exposição solar; suplementação com K2 e magnésio (avaliação médica)" },
      { k: "b12", l: "Vitamina B12", unit: "pg/mL", min: 400, max: 900,
        baixoAcao: "Carnes, ovos, laticínios; avaliar má absorção (uso de metformina/IBP)" },
      { k: "ferritina", l: "Ferritina", unit: "ng/mL", min: 30, max: 300,
        baixoAcao: "Ferro heme + vitamina C, evitar café/chá junto às refeições",
        altoAcao: "Reduzir ferro heme e álcool; investigar inflamação" },
      { k: "hemoglobina", l: "Hemoglobina", unit: "g/dL", min: 12, max: 17.5 },
      { k: "zinco", l: "Zinco", unit: "µg/dL", min: 70, max: 120,
        baixoAcao: "Carne vermelha, ostras, sementes de abóbora" },
      { k: "magnesio", l: "Magnésio", unit: "mg/dL", min: 1.8, max: 2.6,
        baixoAcao: "Folhas verdes, cacau, oleaginosas; bisglicinato à noite" },
    ],
  },
  {
    grupo: "Renal / Hepático / Inflamação", cor: "#FF8C42",
    itens: [
      { k: "creatinina", l: "Creatinina", unit: "mg/dL", min: 0.6, max: 1.3,
        altoAcao: "Ajustar proteína para 1.6–1.8 g/kg e água ≥40 ml/kg; encaminhamento médico" },
      { k: "tgo", l: "TGO/AST", unit: "U/L", min: 10, max: 40,
        altoAcao: "Retirar álcool, priorizar colina, taurina, cardo mariano e vegetais crucíferos" },
      { k: "tgp", l: "TGP/ALT", unit: "U/L", min: 10, max: 41,
        altoAcao: "Suspeita de esteatose — cortar frutose industrial, ômega-3, café sem açúcar" },
      { k: "pcr", l: "PCR ultrassensível", unit: "mg/L", min: 0, max: 1,
        altoAcao: "Padrão anti-inflamatório: ômega-3 3g, cúrcuma+piperina, frutas vermelhas, reduzir ultraprocessados" },
      { k: "acidourico", l: "Ácido úrico", unit: "mg/dL", min: 2.5, max: 6.5,
        altoAcao: "Reduzir frutose, álcool e vísceras; aumentar água e cereja" },
    ],
  },
];

export type LabFinding = { marker: LabMarker; valor: number; status: "baixo" | "alto"; acao: string };

export function analisarLabs(labs: Record<string, string>): LabFinding[] {
  const out: LabFinding[] = [];
  for (const g of LAB_MARKERS) {
    for (const m of g.itens) {
      const raw = labs?.[m.k];
      if (raw === undefined || raw === null || String(raw).trim() === "") continue;
      const v = Number(String(raw).replace(",", "."));
      if (!Number.isFinite(v)) continue;
      if (m.min !== undefined && v < m.min) {
        out.push({ marker: m, valor: v, status: "baixo", acao: m.baixoAcao || "Valor abaixo da referência — avaliar com o médico responsável." });
      } else if (m.max !== undefined && v > m.max) {
        out.push({ marker: m, valor: v, status: "alto", acao: m.altoAcao || "Valor acima da referência — avaliar com o médico responsável." });
      }
    }
  }
  return out;
}

// ═══ FASE 3.2 — NUTRIENT INTELLIGENCE (sinergias e antagonismos) ════════════
export type NutrientRule = { tipo: "sinergia" | "antagonismo"; titulo: string; detalhe: string };

export const NUTRIENT_RULES: NutrientRule[] = [
  { tipo: "sinergia", titulo: "Ferro + Vitamina C", detalhe: "Combinar carne/feijão com limão, laranja ou pimentão aumenta a absorção do ferro em até 3x." },
  { tipo: "sinergia", titulo: "Vitamina D + K2 + Magnésio", detalhe: "Direciona o cálcio para o osso e ativa a vitamina D." },
  { tipo: "sinergia", titulo: "Cúrcuma + Piperina", detalhe: "Pimenta-do-reino aumenta a biodisponibilidade da curcumina em ~2000%." },
  { tipo: "sinergia", titulo: "Zinco + Vitamina A", detalhe: "Necessários mutuamente para testosterona, imunidade e visão." },
  { tipo: "sinergia", titulo: "Gordura + Carotenoides", detalhe: "Azeite na salada aumenta a absorção de licopeno, luteína e betacaroteno." },
  { tipo: "sinergia", titulo: "Creatina + Carboidrato", detalhe: "A insulina melhora a captação muscular de creatina." },
  { tipo: "antagonismo", titulo: "Café/chá + Ferro", detalhe: "Taninos e polifenóis reduzem a absorção de ferro — espaçar 1h das refeições principais." },
  { tipo: "antagonismo", titulo: "Cálcio + Ferro / Zinco", detalhe: "Competem pelo mesmo transportador — separar laticínios da refeição rica em ferro." },
  { tipo: "antagonismo", titulo: "Fibra em excesso + minerais", detalhe: "Fitatos reduzem zinco e ferro — demolhar leguminosas e grãos." },
  { tipo: "antagonismo", titulo: "Álcool + B12 / Zinco / Magnésio", detalhe: "Aumenta a excreção e prejudica a absorção." },
];

// ═══ FASE 3.3 — CICLO MENSTRUAL ═════════════════════════════════════════════
export const FASES_CICLO: { v: FaseCiclo; l: string; d: string }[] = [
  { v: "folicular", l: "Folicular", d: "Melhor sensibilidade insulínica — CHO mais alto, treinos pesados, déficit tolerado" },
  { v: "ovulatoria", l: "Ovulatória", d: "Pico de performance — priorizar CHO periworkout e PRs" },
  { v: "lutea", l: "Lútea", d: "TMB +5–10%, mais fome — subir kcal 100–200, mais gordura, magnésio e chocolate 85%" },
  { v: "menstrual", l: "Menstrual", d: "Repor ferro (heme + vitamina C), anti-inflamatórios, reduzir volume de treino" },
  { v: "anticoncepcional", l: "Anticoncepcional hormonal", d: "Sem fases naturais — atenção a B6, B12, folato, magnésio e zinco" },
  { v: "amenorreia", l: "Amenorreia (>3 meses)", d: "🚨 RED-S — proibido déficit. Aumentar disponibilidade energética e encaminhar" },
  { v: "menopausa", l: "Peri/Pós-menopausa", d: "Proteína ≥2g/kg, cálcio+D+K2, isoflavonas, resistência à insulina aumentada" },
];

// ═══ FASE 3.4 — COMER FORA / VIDA REAL ══════════════════════════════════════
export const FREQ_COMER_FORA: { v: FreqComerFora; l: string }[] = [
  { v: "raro", l: "Raro (< 1x/semana)" },
  { v: "1_2", l: "1 a 2x por semana" },
  { v: "3_5", l: "3 a 5x por semana" },
  { v: "diario", l: "Diário (almoço fora)" },
];

export const CONTEXTOS_COMER_FORA = [
  "Restaurante por quilo",
  "Marmita / delivery fitness",
  "Churrascaria",
  "Jantar de negócios",
  "Viagens frequentes",
  "Fast food inevitável",
  "Padaria (café da manhã)",
  "Happy hour / social",
];

// ═══ FASE 3.5 — CALORIMETRIA ════════════════════════════════════════════════
export const METODOS_CALORIMETRIA = [
  "Calorimetria indireta",
  "Bioimpedância (TMB estimada)",
  "Smartwatch / wearable",
  "Diário alimentar (manutenção real)",
];

// ─── Contexto para o sistema ─────────────────────────────────────────────────────
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
  // ─── Fase 3 ───
  const findings = analisarLabs(i.labs || {});
  const labsPreenchidos = Object.entries(i.labs || {}).filter(([, v]) => String(v).trim() !== "");
  if (labsPreenchidos.length) {
    const nomes: Record<string, LabMarker> = {};
    LAB_MARKERS.forEach(g => g.itens.forEach(m => { nomes[m.k] = m; }));
    parts.push(`EXAMES LABORATORIAIS: ${labsPreenchidos.map(([k, v]) => `${nomes[k]?.l || k} ${v}${nomes[k]?.unit || ""}`).join(" | ")}`);
  }
  if (findings.length) {
    parts.push(`ALTERAÇÕES LABORATORIAIS: ${findings.map(f => `${f.marker.l} ${f.status.toUpperCase()} (${f.valor}${f.marker.unit}) → ${f.acao}`).join(" ;; ")}`);
  }
  if (i.calorimetriaKcal) parts.push(`GASTO ENERGÉTICO MEDIDO: ${i.calorimetriaKcal} kcal${i.metodoCalorimetria ? ` (${i.metodoCalorimetria})` : ""} — USAR ESTE VALOR NO LUGAR DA FÓRMULA PREDITIVA`);
  if (i.faseCiclo) {
    const f = FASES_CICLO.find(x => x.v === i.faseCiclo);
    parts.push(`FASE DO CICLO MENSTRUAL: ${f?.l || i.faseCiclo} — ${f?.d || ""}`);
  }
  if (i.cicloSincronizado) parts.push(`PLANO SINCRONIZADO COM O CICLO: sim — ciclo de ${i.duracaoCiclo || 28} dias, entregar ajustes por fase (folicular, ovulatória, lútea, menstrual)`);
  if (i.tpmIntensa) parts.push("TPM INTENSA: sim — reforçar magnésio, B6, cálcio, ômega-3 e chocolate 85% na fase lútea");
  if (i.comerFora) parts.push(`FREQUÊNCIA DE REFEIÇÕES FORA DE CASA: ${FREQ_COMER_FORA.find(f => f.v === i.comerFora)?.l || i.comerFora}`);
  if (i.contextosComerFora.length) parts.push(`CONTEXTOS SOCIAIS/FORA DE CASA: ${i.contextosComerFora.join(", ")} — incluir orientações práticas de escolha para cada contexto`);
  if (i.alcoolSemanal) parts.push(`CONSUMO DE ÁLCOOL: ${i.alcoolSemanal} doses/semana — descontar as kcal do orçamento e orientar dias de consumo`);

  if (i.diaOnOff) parts.push(`DIA ON/OFF: sim — no dia OFF (sem treino) reduzir carboidrato em ${i.deltaChoOff || 25}% e redistribuir parte em gordura, mantendo a proteína`);

  return parts;
}
