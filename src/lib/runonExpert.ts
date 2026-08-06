/** RunON — Adendo Expert: motores determinísticos (cadência, impacto, tênis, HRV, clima, RPE). */
import { shoeTiers, type ShoeTier } from "@/data/runonExpertData";

export const toNum = (v: unknown, fallback = 0) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

/* ─────────── 1.1 Cadência inteligente ─────────── */
export interface CadenceResult {
  target: number;
  range: [number, number];
  current: number;
  gainPct: number;
  note: string;
}

export function cadenceTarget(pesoKg: number, alturaCm: number, nivel: string): CadenceResult {
  const n = (nivel || "").toLowerCase();
  // base por nível
  let base = n.includes("avanç") ? 180 : n.includes("interm") ? 174 : 168;
  // penalidade por massa: cada 10 kg acima de 80 reduz ~3 spm
  base -= Math.max(0, (pesoKg - 80) / 10) * 3;
  // altura: cada 10 cm acima de 175 reduz ~2 spm (alavancas longas)
  base -= Math.max(0, (alturaCm - 175) / 10) * 2;
  const target = Math.round(Math.min(186, Math.max(158, base)));
  const current = Math.round(target * 0.94); // cadência típica pré-intervenção
  return {
    target,
    range: [target - 4, target + 4],
    current,
    gainPct: 6,
    note:
      pesoKg >= 90
        ? "Atleta pesado: cadência mais alta com passada curta reduz o pico de força vertical por passo."
        : "Aumentar a cadência em 5–10% reduz overstriding sem elevar o custo cardiovascular.",
  };
}

/* ─────────── 5.1 Impacto articular ─────────── */
export interface ImpactResult {
  perStride: number;
  strides5k: number;
  tons5k: number;
  tons10k: number;
  vsLight: number; // % a mais que atleta de 70kg
}

export function impactMath(pesoKg: number, alturaPasso = 1.19): ImpactResult {
  const perStride = pesoKg * 2.5;
  const strides5k = Math.round(5000 / alturaPasso);
  const tons5k = Math.round((perStride * strides5k) / 1000);
  const tons10k = tons5k * 2;
  const light = 70 * 2.5 * strides5k / 1000;
  return {
    perStride: Math.round(perStride),
    strides5k,
    tons5k,
    tons10k,
    vsLight: Math.round(((tons5k - light) / light) * 100),
  };
}

/* ─────────── 2. Shoe selector ─────────── */
export function recommendShoe(pesoKg: number): ShoeTier {
  return shoeTiers.find((t) => pesoKg >= t.min && pesoKg < t.max) ?? shoeTiers[shoeTiers.length - 1];
}

export interface ShoeWear {
  limitKm: number;
  usedPct: number;
  lostCushionPct: number;
  status: "OK" | "ATENÇÃO" | "TROCAR";
  color: string;
  message: string;
}

export function shoeWear(pesoKg: number, kmRodados: number): ShoeWear {
  const limitKm = pesoKg >= 100 ? 380 : pesoKg >= 90 ? 420 : pesoKg >= 80 ? 470 : 550;
  const usedPct = Math.min(150, Math.round((kmRodados / limitKm) * 100));
  const lostCushionPct = Math.min(70, Math.round(usedPct * 0.35));
  const status = usedPct >= 100 ? "TROCAR" : usedPct >= 75 ? "ATENÇÃO" : "OK";
  const color = status === "TROCAR" ? "#ef4444" : status === "ATENÇÃO" ? "#f97316" : "#22c55e";
  const message =
    status === "TROCAR"
      ? `Seus tênis passaram de ~${limitKm} km. Para um atleta de ${Math.round(pesoKg)} kg, a espuma já perdeu ~${lostCushionPct}% da capacidade de amortecimento. Hora de trocar.`
      : status === "ATENÇÃO"
        ? `Você está em ${usedPct}% da vida útil estimada (${limitKm} km). Comece a planejar o par novo e inicie a rotação.`
        : `Vida útil saudável: ${usedPct}% de ~${limitKm} km. Mantenha dois pares em rotação.`;
  return { limitKm, usedPct, lostCushionPct, status, color, message };
}

/* ─────────── 3. HRV readiness ─────────── */
export type ReadinessLevel = "VERDE" | "AMARELO" | "LARANJA" | "VERMELHO";

export interface Readiness {
  level: ReadinessLevel;
  color: string;
  z: number;
  headline: string;
  action: string;
}

export function hrvReadiness(hrv: number, baseline: number, sd: number, diasAbaixo: number): Readiness {
  const safeSd = sd > 0 ? sd : 1;
  const z = Math.round(((hrv - baseline) / safeSd) * 100) / 100;
  if (z >= 1) {
    return {
      level: "VERDE", color: "#22c55e", z,
      headline: "Super-recuperado",
      action: "Dia de sessão intensa: treino pesado + corrida tempo/intervalado se programado.",
    };
  }
  if (z > -1) {
    return {
      level: "AMARELO", color: "#eab308", z,
      headline: "Recuperação normal",
      action: "Seguir a programação padrão do RunON sem alterações.",
    };
  }
  if (diasAbaixo >= 3) {
    return {
      level: "VERMELHO", color: "#ef4444", z,
      headline: "Overreaching provável",
      action: "Cancelar corrida. Reduzir volume de peso em 30%. Priorizar sono, nutrição e recuperação ativa.",
    };
  }
  return {
    level: "LARANJA", color: "#f97316", z,
    headline: "Estresse detectado",
    action: "Reduzir a corrida para caminhada ou LISS ultra-leve. Manter musculação com cargas reduzidas.",
  };
}

/* ─────────── 7. Weather shield ─────────── */
export interface WeatherAdvice {
  band: string;
  color: string;
  paceAdj: string;
  volumeAdj: string;
  hydration: string;
  action: string;
  heatIndex: number;
}

export function weatherAdvice(tempC: number, umidade: number, pesoKg: number): WeatherAdvice {
  const heatIndex = Math.round(tempC + (umidade - 50) * 0.08 + Math.max(0, pesoKg - 85) * 0.05);
  if (heatIndex > 35 || tempC > 33) {
    return {
      band: "CRÍTICO", color: "#ef4444", paceAdj: "—", volumeAdj: "Corrida suspensa",
      hydration: "500 ml/h + eletrólitos",
      action: "Substituir corrida por esteira climatizada ou ciclismo indoor. Atleta de 90 kg+ tem risco elevado de heat stroke.",
      heatIndex,
    };
  }
  if (tempC >= 28 || umidade > 75) {
    return {
      band: "ALTO", color: "#f97316", paceAdj: "−15 a −20%", volumeAdj: "−20%",
      hydration: "+750 ml · eletrólitos obrigatórios acima de 30 min",
      action: "Correr somente antes das 07:00 ou após as 18:00. Monitorar sinais de hipertermia.",
      heatIndex,
    };
  }
  if (tempC >= 20 || umidade >= 60) {
    return {
      band: "MODERADO", color: "#00D4FF", paceAdj: "−5 a −10%", volumeAdj: "Normal",
      hydration: "+500 ml",
      action: "Preferir 05:30–07:00 ou 18:00+. Roupa leve e boné.",
      heatIndex,
    };
  }
  return {
    band: "IDEAL", color: "#22c55e", paceAdj: "Normal", volumeAdj: "Normal",
    hydration: "Padrão", action: "Condições ideais. Executar a programação normal.",
    heatIndex,
  };
}

/* ─────────── 8.3 RPE dual system ─────────── */
export interface DualRpe {
  total: number;
  color: string;
  label: string;
  message: string;
}

export function dualRpe(rpeLift: number, rpeRun: number): DualRpe {
  const total = rpeLift + rpeRun;
  if (total > 16) {
    return {
      total, color: "#ef4444", label: "OVERLOAD",
      message: "Carga dupla acima do threshold. Reduzir intensidade da próxima sessão e priorizar sono.",
    };
  }
  if (total >= 14) {
    return {
      total, color: "#f97316", label: "ALTO",
      message: "Dia exigente. Aceitável pontualmente — não repetir em dias consecutivos.",
    };
  }
  return {
    total, color: "#22c55e", label: "SUSTENTÁVEL",
    message: "Carga dupla dentro da faixa sustentável para o atleta híbrido.",
  };
}

/* ─────────── 13. Tendon Load Score ─────────── */
export function tendonLoad(pesoKg: number, kmSemana: number, superficie: number, shoeUsedPct: number): { score: number; color: string; label: string } {
  const raw = (pesoKg / 80) * (kmSemana / 20) * superficie * (1 + shoeUsedPct / 200);
  const score = Math.min(10, Math.round(raw * 10) / 10);
  const label = score < 3.5 ? "BAIXO" : score < 6.5 ? "MODERADO" : "ALTO";
  const color = score < 3.5 ? "#22c55e" : score < 6.5 ? "#f97316" : "#ef4444";
  return { score, color, label };
}
