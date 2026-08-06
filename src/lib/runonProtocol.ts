/** RunON — motor determinístico que transforma o Perfil Hybrid em protocolo integrado. */
import { HybridProfile, WEEKDAYS, aegisTierFromProfile } from "@/lib/runonProfile";

export interface ProtocolDay {
  day: string;
  lift: string;
  cardio: string;
  note: string;
  color: string;
  isLeg: boolean;
}

export interface RunOnProtocol {
  generatedAt: string;
  athlete: string;
  phase: string;
  legPriority: string;
  days: ProtocolDay[];
  runMinutes: number;
  runSessions: number;
  interferenceRisk: number; // 0–10
  riskLabel: string;
  riskColor: string;
  legGuard: "ATIVO" | "ATENÇÃO";
  macros: { protein: string; carb: string; fat: string; kcal: string };
  stack: { name: string; goal: string; items: string[] };
  alerts: string[];
}

const CY = "#00D4FF";
const GOLD = "#B8922A";
const GR = "#22c55e";
const OR = "#f97316";
const RD = "#ef4444";
const PU = "#a855f7";

const num = (v: string, fallback = 0) => {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

/** Split → sequência de sessões de musculação por dia de treino. */
function liftSequence(split: string, dias: number): { name: string; isLeg: boolean }[] {
  const s = (split || "").toLowerCase();
  const PPL = [
    { name: "PUSH — peito/ombro/tríceps", isLeg: false },
    { name: "PULL — costas/bíceps", isLeg: false },
    { name: "LEGS — pernas completo", isLeg: true },
  ];
  const UL = [
    { name: "UPPER — torso completo", isLeg: false },
    { name: "LOWER — pernas completo", isLeg: true },
  ];
  const BRO = [
    { name: "PERNAS A — quad dominante", isLeg: true },
    { name: "PEITO + TRÍCEPS", isLeg: false },
    { name: "COSTAS + BÍCEPS", isLeg: false },
    { name: "PERNAS B — posterior/glúteo", isLeg: true },
    { name: "OMBROS + BRAÇOS", isLeg: false },
  ];
  const FB = [{ name: "FULLBODY — padrão completo", isLeg: true }];

  let base = BRO;
  if (s.includes("ppl") || s.includes("push")) base = PPL;
  else if (s.includes("upper") || s.includes("lower")) base = UL;
  else if (s.includes("full")) base = FB;

  const out: { name: string; isLeg: boolean }[] = [];
  for (let i = 0; i < Math.max(1, dias); i++) out.push(base[i % base.length]);
  return out;
}

function runVolumeMinutes(nivel: string, temProva: boolean, distancia: string): number {
  const n = (nivel || "").toLowerCase();
  let base = n.includes("avanç") ? 130 : n.includes("interm") ? 95 : 60;
  if (temProva) {
    const d = (distancia || "").toLowerCase();
    if (d.includes("42") || d.includes("marat")) base += 60;
    else if (d.includes("21") || d.includes("meia")) base += 40;
    else if (d.includes("10")) base += 20;
    else base += 10;
  }
  return base;
}

export function generateProtocol(p: HybridProfile): RunOnProtocol {
  const peso = num(p.peso, 80);
  const objetivo = (p.objetivo || "").toLowerCase();
  const cutting = objetivo.includes("cut") || objetivo.includes("defin") || objetivo.includes("emagre");
  const bulking = objetivo.includes("bulk") || objetivo.includes("massa") || objetivo.includes("hipertro");

  const phase = cutting ? "PRE-CONTEST / CUTTING" : bulking ? "OFF-SEASON / BULKING" : "RECOMPOSIÇÃO";
  const legPriority = bulking ? "VOLUME" : cutting ? "MANUTENÇÃO" : "INTENSIDADE";

  const liftDays = p.diasSemanaMusculacao.length
    ? p.diasSemanaMusculacao
    : WEEKDAYS.slice(0, Math.max(1, p.diasMusculacao));
  const seq = liftSequence(p.split, liftDays.length);
  const liftMap = new Map<string, { name: string; isLeg: boolean }>();
  liftDays.forEach((d, i) => liftMap.set(d, seq[i]));

  const cardioDays = (p.diasDisponiveisCorrida.length ? p.diasDisponiveisCorrida : p.diasCardio).filter(Boolean);
  const totalRun = runVolumeMinutes(p.nivelCorrida, p.temProva, p.distanciaAlvo);

  const legDays = new Set(liftDays.filter((d) => liftMap.get(d)?.isLeg));
  const idx = (d: string) => WEEKDAYS.indexOf(d);
  const nearLeg = (d: string) =>
    [...legDays].some((l) => {
      const diff = Math.abs(idx(d) - idx(l));
      return Math.min(diff, 7 - diff) <= 1;
    });

  const conflicts = cardioDays.filter((d) => legDays.has(d));
  const runDays = cardioDays.filter((d) => !legDays.has(d));
  const perSession = runDays.length ? Math.round(totalRun / runDays.length / 5) * 5 : 0;

  const days: ProtocolDay[] = WEEKDAYS.map((d) => {
    const lift = liftMap.get(d);
    const isRun = runDays.includes(d);
    const conflict = conflicts.includes(d);
    const soft = isRun && nearLeg(d);

    let cardio = "Sem cardio";
    let note = "";
    let color = PU;

    if (lift?.isLeg) {
      cardio = "Sem cardio — zona de exclusão";
      note = `Leg day (${legPriority}). Proteger mTOR: 48h sem corrida antes e depois.`;
      color = RD;
    } else if (conflict) {
      cardio = "Caminhada inclinada 20 min (opcional)";
      note = "Conflito detectado: corrida marcada no leg day foi realocada pelo Leg Guard.";
      color = OR;
    } else if (isRun) {
      cardio = soft
        ? `Ciclismo / caminhada inclinada Z2 · ${perSession} min`
        : `Corrida LISS Zona 2 · ${perSession} min`;
      note = soft
        ? "Dia adjacente ao leg day — modalidade de baixo dano excêntrico."
        : `${p.horarioPreferido || "Tarde"} · pace conversacional, FC 60–70% máx. Se no mesmo dia do peso: musculação primeiro, 6h+ de intervalo.`;
      color = soft ? GR : CY;
    } else if (lift) {
      note = "Sessão de musculação sem cardio — recuperação do SNC.";
      color = GOLD;
    } else {
      cardio = "—";
      note = "Rest / mobilidade, foam rolling e sono 8h+.";
      color = PU;
    }

    return { day: d, lift: lift?.name ?? "REST", cardio, note, color, isLeg: !!lift?.isLeg };
  });

  // ── Interference risk 0–10 ──
  let risk = 0;
  if (totalRun > 150) risk += 3;
  else if (totalRun > 100) risk += 1.5;
  risk += conflicts.length * 2;
  risk += runDays.filter(nearLeg).length * 0.8;
  if (cutting) risk += 1.5;
  if ((p.nivelCorrida || "").toLowerCase().includes("avanç") && liftDays.length >= 5) risk += 1;
  risk = Math.min(10, Math.round(risk * 10) / 10);
  const riskLabel = risk < 3 ? "BAIXO" : risk < 6 ? "MODERADO" : "ALTO";
  const riskColor = risk < 3 ? GR : risk < 6 ? OR : RD;

  // ── Macros ──
  const protG = totalRun > 150 ? 2.4 : 2.1;
  const carbG = cutting ? 3 : totalRun > 120 ? 5.5 : 4.5;
  const fatG = cutting ? 0.9 : 1.0;
  const macros = {
    protein: `${protG} g/kg · ${Math.round(protG * peso)} g/dia`,
    carb: `${carbG} g/kg · ${Math.round(carbG * peso)} g/dia`,
    fat: `${fatG} g/kg · ${Math.round(fatG * peso)} g/dia`,
    kcal: cutting ? "Déficit -300 a -500 kcal" : bulking ? "Superávit +250 a +400 kcal" : "Manutenção ±100 kcal",
  };

  // ── Stack (curado, sem prescrição individual) ──
  const tier = aegisTierFromProfile(p);
  const stack =
    p.historicoLesoes.trim().length > 3
      ? {
          name: "WOLVERINE RECOVERY",
          goal: "Reparo de tecido conectivo e retorno seguro ao volume duplo.",
          items: ["BPC-157 local", "TB-500 sistêmico", "GHK-Cu", "Suporte noturno de GH"],
        }
      : cutting
        ? {
            name: "STAGE READY",
            goal: "Lipólise com preservação muscular e proteção mitocondrial no déficit.",
            items: ["Tesamorelin", "CJC-1295 + Ipamorelin", "AOD-9604 pré-corrida", "SS-31 em dias intensos"],
          }
        : totalRun >= 120
          ? {
              name: "MITOCHONDRIAL UPGRADE",
              goal: "Biogênese mitocondrial e flexibilidade metabólica para volume aeróbico alto.",
              items: ["MOTS-c", "SS-31", "CJC-1295 + Ipamorelin"],
            }
          : {
              name: "IRON RUNNER",
              goal: "Recuperação entre sessões duplas, tendões protegidos e composição corporal.",
              items: ["CJC-1295 + Ipamorelin", "BPC-157", "MOTS-c em dias de corrida"],
            };

  // ── Alertas ──
  const alerts: string[] = [];
  if (conflicts.length)
    alerts.push(`${conflicts.length} corrida(s) coincidiam com leg day — realocadas para caminhada/ciclismo pelo Leg Guard.`);
  if (totalRun > 150) alerts.push("Volume acima de 150 min/semana: monitorar circunferência de coxa semanalmente.");
  if (cutting && totalRun > 120) alerts.push("Déficit calórico + volume alto de corrida = risco de catabolismo. Priorizar proteína e sono.");
  if (!p.diasDisponiveisCorrida.length && !p.diasCardio.length)
    alerts.push("Nenhum dia de corrida informado — o sistema alocou apenas dias livres de pernas.");
  if (tier === "cycle") alerts.push("Monitorar hematócrito a cada 45 dias e manter E2 em range fisiológico (cardioproteção).");
  if (tier === "trt") alerts.push("Cardio LISS regular mitiga efeitos cardiovasculares — manter lipidograma trimestral.");
  if (num(p.gordura as unknown as string, 15) > 20 && bulking)
    alerts.push("Percentual de gordura elevado para bulking — considerar recomposição antes do superávit.");
  alerts.push("Ferritina < 30 ng/mL = reduzir volume de corrida e suplementar ferro com vitamina C.");

  return {
    generatedAt: new Date().toISOString(),
    athlete: p.nome || "Atleta",
    phase,
    legPriority,
    days,
    runMinutes: perSession * runDays.length,
    runSessions: runDays.length,
    interferenceRisk: risk,
    riskLabel,
    riskColor,
    legGuard: conflicts.length ? "ATENÇÃO" : "ATIVO",
    macros,
    stack,
    alerts,
  };
}

export const RUNON_PROTOCOL_KEY = "runon_protocol_v1";

export function saveGeneratedProtocol(pr: RunOnProtocol) {
  try {
    localStorage.setItem(RUNON_PROTOCOL_KEY, JSON.stringify(pr));
  } catch {
    /* storage indisponível */
  }
}

export function loadGeneratedProtocol(): RunOnProtocol | null {
  try {
    const raw = localStorage.getItem(RUNON_PROTOCOL_KEY);
    return raw ? (JSON.parse(raw) as RunOnProtocol) : null;
  } catch {
    return null;
  }
}
