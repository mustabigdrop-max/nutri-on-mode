/** RunON — Hybrid Performance Engine · base de conhecimento estática (frontend only). */

export const RUNON = {
  bg: "#0a0a0a",
  card: "#111111",
  border: "#222222",
  cyan: "#00D4FF",
  text: "#f5f5f5",
  muted: "#888888",
} as const;

export interface RunSession {
  id: string;
  name: string;
  aka: string;
  zone: string;
  hrRange: string;
  pace: string;
  duration: string;
  purpose: string;
  frequency: string;
  color: string;
  icon: string;
  tips: string[];
}

export const sessionTypes: RunSession[] = [
  {
    id: "easy",
    name: "EASY RUN",
    aka: "Corrida Regenerativa",
    zone: "Z1–Z2",
    hrRange: "60–70% FCmáx",
    pace: "Conversacional",
    duration: "25–50min",
    purpose: "Base aeróbica, capilarização, eficiência mitocondrial.",
    frequency: "2–3x/semana",
    color: "#22c55e",
    icon: "Footprints",
    tips: [
      "Deve conseguir falar frases completas durante toda a corrida",
      "Ideal pela manhã em jejum estratégico com BCAA",
      "Melhor dia = dia seguinte ao leg day",
      "Se não consegue conversar, está rápido demais",
    ],
  },
  {
    id: "long",
    name: "LONG RUN",
    aka: "Longão",
    zone: "Z2",
    hrRange: "65–75% FCmáx",
    pace: "Confortavelmente lento",
    duration: "60–120min",
    purpose: "Resistência aeróbica, queima de gordura, adaptação musculoesquelética.",
    frequency: "1x/semana (sáb/dom)",
    color: "#00D4FF",
    icon: "Route",
    tips: [
      "Aumentar no máximo 10% de distância por semana",
      "Hidratar a cada 20min com eletrólitos",
      "Carb loading 2–3h antes",
      "NÃO fazer no dia seguinte a leg day pesado",
    ],
  },
  {
    id: "tempo",
    name: "TEMPO RUN",
    aka: "Limiar / Threshold",
    zone: "Z3–Z4",
    hrRange: "80–88% FCmáx",
    pace: "Desconfortavelmente sustentável",
    duration: "20–40min contínuo",
    purpose: "Elevar limiar de lactato, economia de corrida.",
    frequency: "1x/semana",
    color: "#f97316",
    icon: "Gauge",
    tips: [
      "Aquecimento de 10min obrigatório",
      "Ritmo constante — sem acelerar no final",
      "Respiração 3:2 ou 2:2",
      "Ideal terça ou quarta-feira",
    ],
  },
  {
    id: "intervals",
    name: "TIROS / INTERVALS",
    aka: "Intervalado",
    zone: "Z4–Z5",
    hrRange: "88–95% FCmáx",
    pace: "Rápido controlado",
    duration: "Séries 200m–1000m",
    purpose: "VO2máx, potência aeróbica, recrutamento de fibras tipo II.",
    frequency: "1x/semana",
    color: "#ef4444",
    icon: "Zap",
    tips: [
      "Formatos: 8x400m, 5x800m, 10x200m, pirâmide",
      "Descanso ativo entre séries",
      "NUNCA em dia de pernas ou no dia seguinte",
      "Cooldown de 10min obrigatório",
    ],
  },
  {
    id: "incline",
    name: "CAMINHADA INCLINADA",
    aka: "Incline Walk",
    zone: "Z1–Z2",
    hrRange: "55–65% FCmáx",
    pace: "5.5–6.5 km/h a 8–15% inclinação",
    duration: "30–45min",
    purpose: "Cardio sem impacto, preserva massa muscular.",
    frequency: "2–4x/semana",
    color: "#B8922A",
    icon: "Mountain",
    tips: [
      "Perfeito pós-musculação",
      "Zero impacto articular",
      "Com colete de peso (rucking) = próximo nível",
      "Cardio favorito dos bodybuilders",
    ],
  },
  {
    id: "fartlek",
    name: "FARTLEK",
    aka: "Jogo de Velocidade",
    zone: "Z2–Z4 variável",
    hrRange: "70–90% FCmáx",
    pace: "Alternado livre",
    duration: "30–45min",
    purpose: "Adaptação neuromuscular, diversão, transição entre fases.",
    frequency: "1x/semana (opcional)",
    color: "#a855f7",
    icon: "Shuffle",
    tips: [
      "Sem estrutura rígida — correr por sensação",
      "Ex: 3min leve → 1min forte → 2min médio",
      "Usar postes/árvores como marcadores",
      "Ideal para iniciantes na transição para intervalados",
    ],
  },
];

export interface WeekDay {
  day: string;
  am: string;
  pm: string;
  color?: string;
}

export interface WeeklyPlan {
  id: string;
  name: string;
  weeks: string;
  color: string;
  volume: { km: string; strength: string; cardio: string };
  days: WeekDay[];
}

export const weeklyPlans: WeeklyPlan[] = [
  {
    id: "fundacao",
    name: "FASE 1 — FUNDAÇÃO",
    weeks: "Semanas 1–6",
    color: "#22c55e",
    volume: { km: "15–22 km/sem", strength: "5 sessões musculação", cardio: "4 sessões cardio" },
    days: [
      { day: "SEG", am: "Peito + Tríceps", pm: "—" },
      { day: "TER", am: "Easy Run 25–30min", pm: "—", color: "#22c55e" },
      { day: "QUA", am: "Costas + Bíceps", pm: "Caminhada Inclinada 30min", color: "#B8922A" },
      { day: "QUI", am: "Easy Run 25–30min", pm: "—", color: "#22c55e" },
      { day: "SEX", am: "Pernas (Quad-dominant)", pm: "—" },
      { day: "SÁB", am: "Ombros + Abs", pm: "Long Run 40–50min", color: "#00D4FF" },
      { day: "DOM", am: "REST / Caminhada leve", pm: "—" },
    ],
  },
  {
    id: "construcao",
    name: "FASE 2 — CONSTRUÇÃO",
    weeks: "Semanas 7–14",
    color: "#00D4FF",
    volume: { km: "25–35 km/sem", strength: "4–5 sessões musculação", cardio: "5 sessões cardio" },
    days: [
      { day: "SEG", am: "Peito + Tríceps", pm: "Easy Run 30min", color: "#22c55e" },
      { day: "TER", am: "Tempo Run 25–35min", pm: "—", color: "#f97316" },
      { day: "QUA", am: "Costas + Bíceps", pm: "Caminhada Inclinada 35min", color: "#B8922A" },
      { day: "QUI", am: "Pernas (Posterior)", pm: "—" },
      { day: "SEX", am: "Ombros + Bíceps", pm: "Easy Run 30min", color: "#22c55e" },
      { day: "SÁB", am: "Long Run 60–75min", pm: "—", color: "#00D4FF" },
      { day: "DOM", am: "REST", pm: "—" },
    ],
  },
  {
    id: "pico",
    name: "FASE 3 — PICO / RACE READY",
    weeks: "Semanas 15–20",
    color: "#f97316",
    volume: { km: "35–50 km/sem", strength: "3–4 sessões (manutenção)", cardio: "6 sessões cardio" },
    days: [
      { day: "SEG", am: "Upper Body (manutenção)", pm: "Easy Run 30min", color: "#22c55e" },
      { day: "TER", am: "Tiros / Intervals", pm: "—", color: "#ef4444" },
      { day: "QUA", am: "Lower Body (manutenção)", pm: "Caminhada 30min", color: "#B8922A" },
      { day: "QUI", am: "Tempo Run 30–40min", pm: "—", color: "#f97316" },
      { day: "SEX", am: "Upper Body (pump)", pm: "Easy Run 25min", color: "#22c55e" },
      { day: "SÁB", am: "Long Run 75–100min", pm: "—", color: "#00D4FF" },
      { day: "DOM", am: "REST TOTAL", pm: "—" },
    ],
  },
];

export interface RacePhase {
  name: string;
  weeks: string;
  focus: string;
  volume: string;
}

export interface RacePrep {
  id: string;
  distance: string;
  weeks: string;
  level: string;
  targetPace: string;
  color: string;
  phases: RacePhase[];
}

export const racePreps: RacePrep[] = [
  {
    id: "5k",
    distance: "5K",
    weeks: "8 semanas",
    level: "Iniciante Hybrid",
    targetPace: "5:00–6:30/km",
    color: "#22c55e",
    phases: [
      { name: "Base", weeks: "Sem 1–3", focus: "Easy runs 3x/sem + musculação normal", volume: "12–18 km/sem" },
      { name: "Build", weeks: "Sem 4–6", focus: "Adiciona 1 tempo run + tiros curtos 200m", volume: "18–25 km/sem" },
      { name: "Peak", weeks: "Sem 7", focus: "Simulado 5K no pace alvo, musculação reduzida", volume: "20–22 km/sem" },
      { name: "Taper", weeks: "Sem 8", focus: "Volume -40%, intensidade mantida, carb load D-2", volume: "12–15 km/sem" },
    ],
  },
  {
    id: "10k",
    distance: "10K",
    weeks: "12 semanas",
    level: "Intermediário Hybrid",
    targetPace: "4:30–6:00/km",
    color: "#00D4FF",
    phases: [
      { name: "Base", weeks: "Sem 1–4", focus: "Construir base 25+ km/sem", volume: "20–28 km/sem" },
      { name: "Build I", weeks: "Sem 5–8", focus: "Tempo runs, intervalados 400–800m", volume: "28–38 km/sem" },
      { name: "Build II", weeks: "Sem 9–10", focus: "Longão 12–14km, race pace practice", volume: "35–42 km/sem" },
      { name: "Taper", weeks: "Sem 11–12", focus: "Volume -30/50%, 2 sessões de qualidade", volume: "22–28 km/sem" },
    ],
  },
  {
    id: "21k",
    distance: "21K",
    weeks: "16 semanas",
    level: "Avançado Hybrid",
    targetPace: "4:45–6:00/km",
    color: "#f97316",
    phases: [
      { name: "Base", weeks: "Sem 1–5", focus: "Base 30+ km/sem, longão até 12km", volume: "25–35 km/sem" },
      { name: "Build I", weeks: "Sem 6–10", focus: "Longão até 16km, tempo runs longos", volume: "35–48 km/sem" },
      { name: "Build II", weeks: "Sem 11–13", focus: "Longão 18–20km, simulados parciais", volume: "45–55 km/sem" },
      { name: "Peak", weeks: "Sem 14", focus: "Último longão forte 18km", volume: "48–52 km/sem" },
      { name: "Taper", weeks: "Sem 15–16", focus: "Reduz 30–50%, carb load, mentalização", volume: "28–35 km/sem" },
    ],
  },
  {
    id: "42k",
    distance: "42K",
    weeks: "20 semanas",
    level: "Elite Hybrid",
    targetPace: "5:00–6:30/km",
    color: "#ef4444",
    phases: [
      { name: "Base", weeks: "Sem 1–6", focus: "Base 35+ km/sem, longão até 16km", volume: "30–40 km/sem" },
      { name: "Build I", weeks: "Sem 7–11", focus: "Longão até 25km, progressivos longos", volume: "40–55 km/sem" },
      { name: "Build II", weeks: "Sem 12–16", focus: "Longão 28–32km, race pace 10km+", volume: "55–70 km/sem" },
      { name: "Peak", weeks: "Sem 17–18", focus: "Último longão 30km, tune-up race 10K", volume: "60–65 km/sem" },
      { name: "Taper", weeks: "Sem 19–20", focus: "Volume -40/60%, legs fresh, mental game", volume: "30–40 km/sem" },
    ],
  },
];

export const nutritionPrinciples = [
  {
    name: "Regra dos 3 Tanques",
    desc: "Glicogênio muscular + glicogênio hepático + gordura corporal. Cada tanque tem função e janela própria.",
  },
  {
    name: "Periodização Nutricional",
    desc: "Macros mudam conforme o tipo de dia — não existe dieta fixa para atleta híbrido.",
  },
  {
    name: "Fueling Window",
    desc: "Pré: 1–1.5g/kg de carb 2–3h antes · Intra (>60min): 30–60g carb/h · Pós: proteína + carb 2:1 em até 30min.",
  },
];

export interface DayMacro {
  type: string;
  protein: string;
  carb: string;
  fat: string;
  kcal: string;
  color: string;
}

export const dayMacros: DayMacro[] = [
  { type: "Musculação", protein: "2.2–2.5g/kg", carb: "3–4g/kg", fat: "0.8–1g/kg", kcal: "Superávit +200–300", color: "#B8922A" },
  { type: "Corrida Leve", protein: "2.0–2.2g/kg", carb: "4–5g/kg", fat: "0.8–1g/kg", kcal: "Manutenção", color: "#22c55e" },
  { type: "Corrida Longa / Tiros", protein: "2.0–2.2g/kg", carb: "5–7g/kg", fat: "0.7–0.9g/kg", kcal: "Superávit +300–500", color: "#00D4FF" },
  { type: "Musculação + Corrida", protein: "2.3–2.5g/kg", carb: "5–6g/kg", fat: "0.8–1g/kg", kcal: "Superávit +300–400", color: "#f97316" },
  { type: "Rest", protein: "2.0g/kg", carb: "2–3g/kg", fat: "1–1.2g/kg", kcal: "Manutenção ou déficit -100–200", color: "#a855f7" },
];

export const hybridStack = [
  { name: "Creatina", dose: "5g/dia", note: "Sempre — não prejudica a corrida" },
  { name: "Cafeína", dose: "3–6mg/kg pré-treino", note: "Ciclar a cada 8 semanas" },
  { name: "Beta-Alanina", dose: "3.2–6.4g/dia", note: "Buffer de lactato — essencial hybrid" },
  { name: "Eletrólitos", dose: "Sódio + potássio + magnésio", note: "Toda corrida > 45min" },
  { name: "Whey + Dextrose", dose: "30g + 40–60g pós-longão", note: "Janela anabólica real" },
  { name: "Ômega-3", dose: "2–3g EPA+DHA/dia", note: "Anti-inflamatório, articulações" },
];

export type Severity = "critical" | "high" | "medium";

export const severityColors: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#B8922A",
};

export interface MuscleGuardRule {
  id: number;
  title: string;
  severity: Severity;
  desc: string;
}

export const muscleGuardRules: MuscleGuardRule[] = [
  { id: 1, title: "REGRA DAS 6 HORAS", severity: "critical", desc: "Separar musculação e corrida por no mínimo 6h. Se não for possível, SEMPRE musculação primeiro. Nunca o contrário se o objetivo inclui hipertrofia." },
  { id: 2, title: "PERNAS = ZONA DE EXCLUSÃO CARDIO", severity: "critical", desc: "48h sem corrida de alta intensidade antes E depois do leg day. Easy run ou caminhada são permitidos no dia seguinte." },
  { id: 3, title: "PROTEÍNA BLINDAGEM", severity: "high", desc: "Mínimo 2.0g/kg/dia. Volume alto de corrida (>40km/sem) subir para 2.3–2.5g/kg. Distribuir em 4–5 refeições com mínimo 30g por refeição." },
  { id: 4, title: "INTERFERENCE MANAGEMENT", severity: "high", desc: "O efeito interferência (mTOR vs AMPK) é REAL mas GERENCIÁVEL. Não fazer endurance de alta intensidade 24h antes/depois de hipertrofia pesada." },
  { id: 5, title: "VOLUME INTELIGENTE", severity: "medium", desc: "Alto volume de corrida → reduzir séries de musculação 20–30%, mas MANTER a intensidade (carga). Volume pode cair, intensidade não." },
  { id: 6, title: "SLEEP = VARIÁVEL #1", severity: "critical", desc: "7–9h obrigatórias. O atleta híbrido tem demanda de recuperação 30–40% maior. Sem sono não há adaptação." },
  { id: 7, title: "DELOAD SINCRONIZADO", severity: "medium", desc: "A cada 4 semanas, deload TANTO na musculação quanto na corrida simultaneamente. Reduzir volume 40–50% mantendo a frequência." },
  { id: 8, title: "MONITORAMENTO DE SINAIS", severity: "high", desc: "FC de repouso subiu 5+ bpm? Sono piorou? Força caiu? Pace caiu? → Overreaching. Cortar volume de corrida 30% por 1 semana." },
];

export interface AnnualBlock {
  id: string;
  name: string;
  months: string;
  strength: string;
  running: string;
  color: string;
}

export const annualPeriodization: AnnualBlock[] = [
  { id: "b1", name: "BLOCO 1: HYPERTROPHY + BASE", months: "Jan–Mar", strength: "Hipertrofia clássica, alto volume", running: "Easy runs + caminhadas", color: "#22c55e" },
  { id: "b2", name: "BLOCO 2: STRENGTH + BUILD", months: "Abr–Jun", strength: "Força, cargas altas", running: "Adiciona tempo runs + longão progressivo", color: "#00D4FF" },
  { id: "b3", name: "BLOCO 3: POWER + PEAK", months: "Jul–Set", strength: "Manutenção, volume reduzido", running: "Tiros + race pace + longão máximo", color: "#f97316" },
  { id: "b4", name: "BLOCO 4: COMPETITION + RECOVERY", months: "Out–Dez", strength: "Transição, volta ao volume", running: "Provas alvo + detraining controlado", color: "#ef4444" },
];

export const transitionRules = [
  "Semana de transição entre blocos = deload em ambas as modalidades",
  "Nunca aumentar volume de corrida E musculação ao mesmo tempo",
  "Prioridade de bloco: o que está em BUILD recebe mais energia",
  "Teste de composição corporal a cada 4 semanas",
  "Perder >1kg de massa magra em 4 semanas → reduzir volume de corrida 20%",
  "FC de repouso matinal = termômetro diário",
];

export const overviewPillars = [
  { name: "PERIODIZAÇÃO INTEGRADA", desc: "Corrida e musculação na mesma linha do tempo, nunca competindo pelo mesmo dia." },
  { name: "MUSCLE GUARD", desc: "8 regras que protegem hipertrofia enquanto o volume aeróbico sobe." },
  { name: "NUTRITION BRIDGE", desc: "Macros que mudam por tipo de dia — o combustível segue a demanda." },
  { name: "RACE READY", desc: "Timelines de 5K a 42K com taper e carb load estruturados." },
];
