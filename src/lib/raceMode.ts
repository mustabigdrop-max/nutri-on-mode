/**
 * RunON — RACE MODE
 * Motor determinístico que ajusta o Stride Planner e a Fuel Matrix
 * conforme a distância da prova (5K, 10K, 21K, 42K) e a semana de competição.
 */

export type RaceDistanceId = "5k" | "10k" | "21k" | "42k";

export interface RaceModeConfig {
  enabled: boolean;
  distance: RaceDistanceId;
  /** Semanas restantes até a prova (0 = semana da prova). */
  weeksOut: number;
  /** Pace alvo em segundos por km. */
  targetPaceSec: number;
  /** Peso corporal em kg (usado na Fuel Matrix). */
  weightKg: number;
}

export interface RaceDistanceMeta {
  id: RaceDistanceId;
  label: string;
  km: number;
  color: string;
  defaultPaceSec: number;
  /** Carboidrato intra-prova (g/h). */
  intraCarbs: [number, number];
  fluidMlH: [number, number];
  sodiumMgH: [number, number];
  /** Carb load nos dias anteriores (g/kg/dia). */
  carbLoad: [number, number];
  cadenceTarget: [number, number];
  strategy: string;
}

export const RACE_DISTANCES: RaceDistanceMeta[] = [
  {
    id: "5k", label: "5K", km: 5, color: "#22c55e", defaultPaceSec: 300,
    intraCarbs: [0, 0], fluidMlH: [0, 250], sodiumMgH: [0, 200], carbLoad: [4, 5],
    cadenceTarget: [178, 186],
    strategy: "Saída controlada nos primeiros 800m, cruzeiro no pace alvo, negative split nos últimos 1.000m.",
  },
  {
    id: "10k", label: "10K", km: 10, color: "#00D4FF", defaultPaceSec: 315,
    intraCarbs: [0, 30], fluidMlH: [250, 400], sodiumMgH: [200, 400], carbLoad: [5, 6],
    cadenceTarget: [176, 184],
    strategy: "Primeiros 2 km 3–5s/km mais lentos que o alvo, estabiliza até o km 8 e ataca os 2 finais.",
  },
  {
    id: "21k", label: "21K", km: 21.1, color: "#f97316", defaultPaceSec: 330,
    intraCarbs: [30, 60], fluidMlH: [400, 600], sodiumMgH: [400, 700], carbLoad: [7, 8],
    cadenceTarget: [172, 180],
    strategy: "Metade inicial no pace alvo +2s/km, gel a cada 35–40min, progressão real após o km 15.",
  },
  {
    id: "42k", label: "42K", km: 42.2, color: "#ef4444", defaultPaceSec: 360,
    intraCarbs: [60, 90], fluidMlH: [500, 750], sodiumMgH: [500, 900], carbLoad: [8, 10],
    cadenceTarget: [170, 178],
    strategy: "Disciplina absoluta até o km 30 no pace alvo, fueling a cada 30min, gestão do muro no km 32.",
  },
];

export type RacePhaseId = "base" | "build" | "peak" | "taper" | "raceweek";

export interface RacePhaseInfo {
  id: RacePhaseId;
  label: string;
  color: string;
  /** Multiplicador de volume de corrida da semana. */
  volumeFactor: number;
  /** Multiplicador de volume de musculação. */
  strengthFactor: number;
  carbGPerKg: [number, number];
  focus: string;
}

export function racePhase(weeksOut: number, distance: RaceDistanceId): RacePhaseInfo {
  const meta = RACE_DISTANCES.find((d) => d.id === distance)!;
  const w = Math.max(0, Math.round(weeksOut));
  if (w <= 0) {
    return {
      id: "raceweek", label: "SEMANA DA PROVA", color: "#ef4444",
      volumeFactor: 0.35, strengthFactor: 0.25,
      carbGPerKg: meta.carbLoad,
      focus: "Pernas frescas. Apenas ativações curtas no pace de prova, zero falha na musculação e carb load nas 48h finais.",
    };
  }
  if (w <= 2) {
    return {
      id: "taper", label: "TAPER", color: "#f97316",
      volumeFactor: 0.6, strengthFactor: 0.5,
      carbGPerKg: [meta.carbLoad[0] - 1, meta.carbLoad[1] - 1],
      focus: "Volume −40%, intensidade mantida. Musculação em manutenção (sem excêntricos pesados de perna).",
    };
  }
  if (w <= 5) {
    return {
      id: "peak", label: "PICO / RACE READY", color: "#00D4FF",
      volumeFactor: 1, strengthFactor: 0.7,
      carbGPerKg: [5, 6],
      focus: "Maior volume da preparação, simulados no pace alvo e longão específico da distância.",
    };
  }
  if (w <= 10) {
    return {
      id: "build", label: "BUILD", color: "#B8922A",
      volumeFactor: 0.85, strengthFactor: 0.9,
      carbGPerKg: [4.5, 5.5],
      focus: "Tempo runs e intervalados progressivos com musculação ainda em carga de hipertrofia.",
    };
  }
  return {
    id: "base", label: "BASE", color: "#22c55e",
    volumeFactor: 0.7, strengthFactor: 1,
    carbGPerKg: [4, 5],
    focus: "Construção aeróbica em Z2, força máxima preservada, sem estresse de alta intensidade.",
  };
}

/* ─────────── Stride Planner ─────────── */

export interface PaceZone {
  name: string;
  pace: string;
  color: string;
  note: string;
}

export interface SplitRow {
  km: string;
  pace: string;
  cumulative: string;
  note: string;
}

export interface StridePlan {
  distance: RaceDistanceMeta;
  phase: RacePhaseInfo;
  targetPace: string;
  finishTime: string;
  cadence: string;
  strideLengthCm: number;
  speedKmh: string;
  weeklyKm: number;
  longRunKm: number;
  qualitySessions: number;
  zones: PaceZone[];
  splits: SplitRow[];
  cues: string[];
}

export function fmtPace(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}/km`;
}

export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

const BASE_WEEKLY_KM: Record<RaceDistanceId, number> = { "5k": 25, "10k": 40, "21k": 55, "42k": 70 };
const LONG_RUN_KM: Record<RaceDistanceId, number> = { "5k": 10, "10k": 14, "21k": 22, "42k": 32 };

export function buildStridePlan(cfg: RaceModeConfig): StridePlan {
  const distance = RACE_DISTANCES.find((d) => d.id === cfg.distance) ?? RACE_DISTANCES[1];
  const phase = racePhase(cfg.weeksOut, distance.id);
  const p = cfg.targetPaceSec;

  const speedMs = 1000 / p;
  const cadence = Math.round((distance.cadenceTarget[0] + distance.cadenceTarget[1]) / 2);
  const strideLengthCm = Math.round((speedMs * 60) / cadence * 100);

  const zones: PaceZone[] = [
    { name: "EASY / Z2", pace: fmtPace(p + 80), color: "#22c55e", note: "60–75% do volume semanal. Conversa possível." },
    { name: "LONGÃO", pace: fmtPace(p + 60), color: "#00D4FF", note: `Até ${Math.round(LONG_RUN_KM[distance.id] * phase.volumeFactor)} km nesta fase.` },
    { name: "TEMPO / LIMIAR", pace: fmtPace(p + 15), color: "#B8922A", note: "20–40min contínuos ou blocos de 10min." },
    { name: "PACE DE PROVA", pace: fmtPace(p), color: distance.color, note: distance.strategy },
    { name: "INTERVALADO / VO2", pace: fmtPace(p - 15), color: "#f97316", note: "400–1.000m com recuperação 1:1." },
    { name: "TIROS CURTOS", pace: fmtPace(p - 30), color: "#ef4444", note: "Strides 100m para recrutamento neural." },
  ];

  const segs: [string, number, string][] =
    distance.id === "5k"
      ? [["KM 1", p + 5, "Controle. Não estoure na largada."], ["KM 2–3", p, "Cruzeiro no pace alvo."], ["KM 4", p - 2, "Pressiona o limiar."], ["KM 5", p - 8, "Tudo que sobrou."]]
      : distance.id === "10k"
      ? [["KM 1–2", p + 4, "Aquecimento em movimento."], ["KM 3–6", p, "Cruzeiro."], ["KM 7–8", p - 2, "Segura a cadência."], ["KM 9–10", p - 8, "Negative split."]]
      : distance.id === "21k"
      ? [["KM 1–5", p + 3, "Contenção. Fuel no km 5."], ["KM 6–12", p, "Pace alvo + gel a cada 35min."], ["KM 13–17", p - 1, "Progressão leve."], ["KM 18–21", p - 6, "Final forte."]]
      : [["KM 1–10", p + 5, "Muito controle. Fuel desde o km 8."], ["KM 11–25", p, "Pace alvo, 60–90g carb/h."], ["KM 26–32", p, "Gestão do muro. Cafeína no km 28."], ["KM 33–42", p - 3, "Cadência alta, passada curta."]];

  let cum = 0;
  const perSegKm = distance.km / segs.length;
  const splits: SplitRow[] = segs.map(([km, pace, note]) => {
    cum += pace * perSegKm;
    return { km, pace: fmtPace(pace), cumulative: fmtClock(cum), note };
  });

  return {
    distance,
    phase,
    targetPace: fmtPace(p),
    finishTime: fmtClock(p * distance.km),
    cadence: `${distance.cadenceTarget[0]}–${distance.cadenceTarget[1]} ppm`,
    strideLengthCm,
    speedKmh: (3600 / p).toFixed(1),
    weeklyKm: Math.round(BASE_WEEKLY_KM[distance.id] * phase.volumeFactor),
    longRunKm: Math.round(LONG_RUN_KM[distance.id] * phase.volumeFactor),
    qualitySessions: phase.id === "raceweek" ? 1 : phase.id === "taper" ? 2 : 3,
    zones,
    cues: [
      `Cadência alvo ${distance.cadenceTarget[0]}–${distance.cadenceTarget[1]} ppm — passada estimada ${strideLengthCm} cm.`,
      "Pé aterrissa sob o quadril: overstriding aumenta força de frenagem no joelho.",
      phase.id === "raceweek"
        ? "Semana da prova: apenas 2–3 blocos de 1 km no pace alvo, nada além disso."
        : `Fase ${phase.label}: ${phase.focus}`,
      phase.strengthFactor <= 0.5
        ? "Musculação de perna sem falha e sem excêntrico lento — preservar tecido."
        : "Musculação de perna mantida, respeitando 6h de janela entre sessões.",
    ],
  };
}

/* ─────────── Fuel Matrix ─────────── */

export interface FuelRow {
  label: string;
  value: string;
  note: string;
  color: string;
}

export interface RaceFuelPlan {
  distance: RaceDistanceMeta;
  phase: RacePhaseInfo;
  dailyCarbs: string;
  dailyCarbsGkg: string;
  protein: string;
  fat: string;
  fluid: string;
  rows: FuelRow[];
  timeline: { time: string; action: string }[];
  alerts: string[];
}

export function buildFuelPlan(cfg: RaceModeConfig): RaceFuelPlan {
  const distance = RACE_DISTANCES.find((d) => d.id === cfg.distance) ?? RACE_DISTANCES[1];
  const phase = racePhase(cfg.weeksOut, distance.id);
  const kg = cfg.weightKg > 0 ? cfg.weightKg : 75;
  const [cLo, cHi] = phase.carbGPerKg;
  const durationH = (cfg.targetPaceSec * distance.km) / 3600;

  const proteinGkg = phase.id === "raceweek" ? 1.8 : 2.0;
  const preRaceCarb = Math.round(kg * (distance.km >= 21 ? 2 : 1.5));

  const rows: FuelRow[] = [
    {
      label: "CARB LOAD (D-2 / D-1)", color: distance.color,
      value: `${distance.carbLoad[0]}–${distance.carbLoad[1]} g/kg/dia`,
      note: `${Math.round(kg * distance.carbLoad[0])}–${Math.round(kg * distance.carbLoad[1])} g/dia · baixo resíduo nas 24h finais.`,
    },
    {
      label: "PRÉ-PROVA (3h antes)", color: "#B8922A",
      value: `${preRaceCarb} g carb`,
      note: "Baixa fibra e baixa gordura. 5–7 ml/kg de líquido 3h antes.",
    },
    {
      label: "INTRA-PROVA", color: "#f97316",
      value: distance.intraCarbs[1] === 0 ? "Não necessário" : `${distance.intraCarbs[0]}–${distance.intraCarbs[1]} g carb/h`,
      note: distance.intraCarbs[1] === 0
        ? "Prova curta: glicogênio muscular cobre o esforço. Apenas bochecho de carb se quiser."
        : `~${Math.round(((distance.intraCarbs[0] + distance.intraCarbs[1]) / 2) * durationH)} g no total estimado (${durationH.toFixed(1)}h de prova).`,
    },
    {
      label: "HIDRATAÇÃO", color: "#00D4FF",
      value: `${distance.fluidMlH[0]}–${distance.fluidMlH[1]} ml/h`,
      note: `Sódio ${distance.sodiumMgH[0]}–${distance.sodiumMgH[1]} mg/h. Ajuste para cima em calor > 26 °C.`,
    },
    {
      label: "CAFEÍNA", color: "#a855f7",
      value: `${(kg * 3).toFixed(0)}–${(kg * 6).toFixed(0)} mg`,
      note: distance.km >= 21 ? "Fracionar: metade 45min antes, metade após 2/3 da prova." : "Dose única 45–60min antes da largada.",
    },
    {
      label: "PÓS-PROVA (30min)", color: "#22c55e",
      value: `${Math.round(kg * 1.0)} g carb + ${Math.round(kg * 0.4)} g proteína`,
      note: "Repor 150% da perda hídrica nas 4h seguintes.",
    },
  ];

  const timeline =
    phase.id === "raceweek"
      ? [
          { time: "D-3", action: `Reduzir fibra, iniciar carb load em ${distance.carbLoad[0]} g/kg.` },
          { time: "D-2", action: `Pico de carb load: ${Math.round(kg * distance.carbLoad[1])} g de carboidrato, treino apenas ativação.` },
          { time: "D-1", action: "Refeições pequenas e frequentes, sódio elevado, hidratação constante. Nada de novidade." },
          { time: "D-0 -3h", action: `${preRaceCarb} g de carb de fácil digestão + 500 ml de líquido.` },
          { time: "D-0 -45min", action: `Cafeína ${(kg * 3).toFixed(0)} mg + 200 ml de água. Última ida ao banheiro.` },
          { time: "LARGADA", action: distance.strategy },
        ]
      : [
          { time: "MANHÃ", action: `Carb ${cLo}–${cHi} g/kg no dia (${Math.round(kg * cLo)}–${Math.round(kg * cHi)} g) distribuídos em torno das sessões.` },
          { time: "PRÉ-CORRIDA", action: "1–1.5 g/kg de carb 2h antes das sessões de qualidade." },
          { time: "INTRA (>60min)", action: `${Math.max(30, distance.intraCarbs[0])} g carb/h nos longões — treinar o intestino para a prova.` },
          { time: "PÓS", action: `Proteína ${Math.round(kg * 0.4)} g + carb 2:1 em até 30min.` },
          { time: "NOITE", action: "Caseína/proteína lenta + magnésio para recuperação neuromuscular." },
        ];

  const alerts: string[] = [];
  if (phase.id === "raceweek") alerts.push("Semana da prova: NENHUM alimento ou suplemento novo. Só o que já foi testado em treino.");
  if (phase.id === "taper") alerts.push("No taper o gasto cai — reduzir gordura, manter carboidrato para saturar o glicogênio.");
  if (distance.km >= 21) alerts.push("Treine o fueling nos longões: intestino precisa de 6–8 semanas para tolerar 60–90 g carb/h.");
  if (phase.strengthFactor <= 0.5) alerts.push(`Proteína mantida em ${proteinGkg} g/kg para proteger massa magra durante a redução de volume.`);

  return {
    distance,
    phase,
    dailyCarbs: `${Math.round(kg * cLo)}–${Math.round(kg * cHi)} g`,
    dailyCarbsGkg: `${cLo}–${cHi} g/kg`,
    protein: `${Math.round(kg * proteinGkg)} g (${proteinGkg} g/kg)`,
    fat: `${Math.round(kg * 0.8)}–${Math.round(kg * 1.0)} g`,
    fluid: `${(kg * 0.04).toFixed(1)}–${(kg * 0.05).toFixed(1)} L/dia`,
    rows,
    timeline,
    alerts,
  };
}

/* ─────────── Persistência ─────────── */

const KEY = "runon_race_mode_v1";

export function defaultRaceMode(distance: RaceDistanceId = "10k", weightKg = 75): RaceModeConfig {
  const meta = RACE_DISTANCES.find((d) => d.id === distance)!;
  return { enabled: false, distance, weeksOut: 8, targetPaceSec: meta.defaultPaceSec, weightKg };
}

export function loadRaceMode(): RaceModeConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as RaceModeConfig;
    if (!p || !RACE_DISTANCES.some((d) => d.id === p.distance)) return null;
    return p;
  } catch {
    return null;
  }
}

export function saveRaceMode(cfg: RaceModeConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}
