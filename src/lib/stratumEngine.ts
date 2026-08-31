// STRATUM — motor de periodização invisível do TrainingON
// Aplica automaticamente os pilares científicos (EMG, MEV/MAV/MRV, progressão)
// a partir do objetivo, nível, frequência, sexo, pontos fracos e dados do APEX.
// Nenhuma configuração manual: o profissional vê apenas o resultado.

export type StratumLevelKey = "iniciante" | "intermediario" | "avancado";

export interface StratumContext {
  phase?: string;
  level?: string;
  days?: string | number;
  weeks?: string | number;
  muscles?: string[];
  weakPoints?: string;
  specificGoal?: string;
  correctiveText?: string;
  sex?: "F" | "M" | null;
  systemName?: string;
}

export interface StratumDecision {
  id: string;
  label: string;
  detail: string;
  ref?: string;
}

export interface StratumVolume {
  muscle: string;
  mev: number;
  mav: [number, number];
  mrv: number;
  weeklySets: number;
  priority: "prioritário" | "manutenção" | "padrão";
}

export interface StratumResult {
  levelKey: StratumLevelKey;
  split: string;
  progression: { model: string; detail: string };
  volume: StratumVolume[];
  feminino: boolean;
  athlete: boolean;
  corretivo: boolean;
  decisions: StratumDecision[];
}

// MEV / MAV / MRV por grupo (séries semanais) — Israetel/RP + literatura EMG
const LANDMARKS: Record<string, { mev: number; mav: [number, number]; mrv: number }> = {
  "Peitoral": { mev: 8, mav: [12, 18], mrv: 22 },
  "Costas (Dorsal)": { mev: 10, mav: [14, 20], mrv: 25 },
  "Ombros": { mev: 8, mav: [16, 22], mrv: 26 },
  "Braços": { mev: 6, mav: [12, 18], mrv: 22 },
  "Pernas": { mev: 8, mav: [12, 18], mrv: 22 },
  "Posterior de Coxa": { mev: 6, mav: [10, 16], mrv: 20 },
  "Glúteos": { mev: 6, mav: [12, 16], mrv: 20 },
  "Panturrilha": { mev: 8, mav: [12, 16], mrv: 20 },
  "Core": { mev: 4, mav: [8, 14], mrv: 16 },
};

const MUSCLE_ALIASES: Record<string, string[]> = {
  "Peitoral": ["peito", "peitor", "chest", "pec"],
  "Costas (Dorsal)": ["costas", "dorsal", "lat", "back", "puxada", "trapez", "trapéz"],
  "Ombros": ["ombro", "delt", "shoulder"],
  "Braços": ["biceps", "bíceps", "triceps", "tríceps", "braço", "braco", "antebra"],
  "Pernas": ["quadr", "quad", "perna", "coxa anterior", "legs"],
  "Posterior de Coxa": ["posterior", "isquio", "ísquio", "hamstring", "femoral"],
  "Glúteos": ["glut", "glúte", "bumbum"],
  "Panturrilha": ["panturr", "calf", "gemeo", "gêmeo"],
  "Core": ["core", "abdom", "abs", "lombar"],
};

function canonicalMuscle(raw: string): string | null {
  const s = raw.toLowerCase();
  for (const [canon, keys] of Object.entries(MUSCLE_ALIASES)) {
    if (keys.some((k) => s.includes(k))) return canon;
  }
  return null;
}

export function detectLevel(level?: string): StratumLevelKey {
  const s = (level || "").toLowerCase();
  if (s.includes("inici") || s.includes("begin")) return "iniciante";
  if (s.includes("avanç") || s.includes("avanc") || s.includes("elite") || s.includes("adv")) return "avancado";
  return "intermediario";
}

export function detectSplit(days: number, phase?: string): string {
  if (days <= 2) return "Full Body";
  if (days === 3) return "Full Body alternado / Push-Pull-Legs";
  if (days === 4) return "Upper / Lower ×2";
  if (days === 5) return "Push / Pull / Legs + Upper / Lower";
  if (days === 6) return "Push / Pull / Legs ×2";
  return "Push / Pull / Legs ×2 + sessão de pontos fracos";
}

const SPLIT_GROUPS: Record<string, string[]> = {
  "Full Body": ["Peitoral", "Costas (Dorsal)", "Ombros", "Pernas", "Posterior de Coxa", "Core"],
  "Push": ["Peitoral", "Ombros", "Braços"],
  "Pull": ["Costas (Dorsal)", "Braços"],
  "Legs": ["Pernas", "Posterior de Coxa", "Glúteos", "Panturrilha"],
};

export function groupsForSplit(split: string): string[] {
  if (split.startsWith("Full Body") && !split.includes("Push")) return SPLIT_GROUPS["Full Body"];
  return Array.from(
    new Set([...SPLIT_GROUPS["Push"], ...SPLIT_GROUPS["Pull"], ...SPLIT_GROUPS["Legs"], "Core"])
  );
}

export function runStratum(ctx: StratumContext): StratumResult {
  const days = Math.max(1, parseInt(String(ctx.days ?? 5)) || 5);
  const weeks = Math.max(1, parseInt(String(ctx.weeks ?? 8)) || 8);
  const levelKey = detectLevel(ctx.level);
  const split = detectSplit(days, ctx.phase);
  const goalBlob = `${ctx.phase || ""} ${ctx.specificGoal || ""}`.toLowerCase();

  const athlete = /comp|palco|prep|show|bodybuild|atlet/.test(goalBlob);
  const feminino = ctx.sex === "F" || /feminin|glúte|glute|bumbum|wellness|bikini/.test(goalBlob);
  const corretivo = !!(ctx.correctiveText && ctx.correctiveText.trim().length > 30);

  const cutting = /cut|defini|emagre|deficit|déficit/.test(goalBlob);
  const forca = /for[cç]a|strength|powerlift/.test(goalBlob);

  // Grupos: definidos pelo split + grupos citados na prescrição/pontos fracos
  const fromSplit = groupsForSplit(split);
  const cited = new Set<string>();
  [...(ctx.muscles || []), ctx.weakPoints || "", ctx.specificGoal || ""].forEach((t) => {
    const c = canonicalMuscle(String(t));
    if (c) cited.add(c);
  });
  const weakSet = new Set<string>();
  `${ctx.weakPoints || ""}`.split(/[,;/]/).forEach((t) => {
    const c = canonicalMuscle(t);
    if (c) weakSet.add(c);
  });

  const groups = Array.from(new Set([...fromSplit, ...cited]));

  const volume: StratumVolume[] = groups.map((muscle) => {
    const lm = LANDMARKS[muscle] || { mev: 8, mav: [12, 16] as [number, number], mrv: 20 };
    const isWeak = weakSet.has(muscle);
    // Base = topo do MAV para prioritários, meio do MAV para os demais
    let sets = isWeak ? lm.mav[1] : Math.round((lm.mav[0] + lm.mav[1]) / 2);
    if (levelKey === "iniciante") sets = Math.max(lm.mev, Math.round(lm.mav[0] * 0.85));
    if (levelKey === "avancado" && isWeak) sets = Math.min(lm.mrv, lm.mav[1] + 2);
    if (cutting) sets = Math.max(lm.mev, Math.round(sets * 0.85));
    if (forca) sets = Math.max(lm.mev, Math.round(sets * 0.9));
    if (feminino && (muscle === "Glúteos" || muscle === "Posterior de Coxa")) sets = Math.min(lm.mrv, sets + 2);
    if (days <= 3) sets = Math.max(lm.mev, Math.round(sets * 0.8));
    return {
      muscle,
      mev: lm.mev,
      mav: lm.mav,
      mrv: lm.mrv,
      weeklySets: sets,
      priority: isWeak ? "prioritário" : cutting ? "manutenção" : "padrão",
    };
  });

  const progression =
    levelKey === "iniciante"
      ? {
          model: "Progressão linear",
          detail:
            "Iniciante responde a incrementos simples: +2,5kg (superiores) / +5kg (inferiores) ou +1 rep por sessão, mantendo RIR 2-3. Deload a cada 6-8 semanas.",
        }
      : {
          model: "Progressão ondulatória (DUP)",
          detail:
            `Intermediário/avançado satura na linearidade. Ondulação semanal de zonas (pesada 4-6, moderada 8-12, metabólica 15-20) com RIR descendo de 3 → 1 ao longo do mesociclo de ${weeks} semanas. Deload na semana ${Math.max(4, Math.round(weeks * 0.75))}.`,
        };

  const decisions: StratumDecision[] = [
    {
      id: "volume",
      label: "Volume baseado em MAV",
      detail:
        `Séries semanais calculadas dentro da faixa MEV → MAV → MRV de cada grupo, ajustadas por nível (${levelKey}), frequência (${days}x/sem) e objetivo. Pontos fracos recebem o topo do MAV; grupos em manutenção ficam próximos do MEV.`,
      ref: "Israetel et al. — Volume Landmarks (RP)",
    },
    {
      id: "progressao",
      label: progression.model === "Progressão linear" ? "Progressão linear aplicada" : "Progressão ondulatória aplicada",
      detail: progression.detail,
      ref: "Rhea 2002; Zourdos 2016 (RIR)",
    },
    {
      id: "split",
      label: `Split automático: ${split}`,
      detail: `Divisão derivada da frequência de ${days} dias/semana e do objetivo — nenhum grupo é selecionado manualmente. Frequência mínima de 2x/semana por grupo sempre que a divisão permitir.`,
      ref: "Schoenfeld 2016 — frequência 2x > 1x",
    },
    {
      id: "selecao",
      label: "Seleção por EMG validado",
      detail:
        "Cada grupo recebe pelo menos um exercício de tensão no alongado, um de tensão constante e, quando o volume permitir, um no encurtado — priorizando os exercícios com maior ativação eletromiográfica documentada.",
      ref: "Kassiano 2023; Pedrosa 2022",
    },
  ];

  if (corretivo) {
    decisions.push({
      id: "apex",
      label: "Corretivo APEX integrado no warm-up",
      detail:
        "As recomendações importadas do APEX viram ativações e mobilidade no aquecimento e ajustes de volume/ângulo nos exercícios dos grupos envolvidos. Corretivos nunca recebem RIR 0.",
    });
  }
  if (feminino) {
    decisions.push({
      id: "feminino",
      label: "Regras STRATUM Feminino ativas",
      detail:
        "Fisiologia feminina aplicada automaticamente: volume modulado por fase do ciclo (folicular = carga alta, lútea = volume reduzido), prioridade em cadeia posterior/glúteo, atenção à laxidão ligamentar na ovulação e travas de segurança RED-S.",
    });
  }
  if (athlete) {
    decisions.push({
      id: "athlete",
      label: "Regras STRATUM Athlete ativas",
      detail:
        "Objetivo de competição detectado: periodização com deload obrigatório, redução progressiva de volume na aproximação do palco, peak week e trabalho de posing integrado ao condicionamento.",
    });
  }

  return { levelKey, split, progression, volume, feminino, athlete, corretivo, decisions };
}

export function buildStratumInstruction(r: StratumResult): string {
  const vol = r.volume
    .map((v) => `- ${v.muscle}: ${v.weeklySets} séries/sem (MEV ${v.mev} · MAV ${v.mav[0]}-${v.mav[1]} · MRV ${v.mrv}) — ${v.priority}`)
    .join("\n");

  return `━━━ MOTOR STRATUM (aplicação automática — obrigatório) ━━━
SPLIT DEFINIDO: ${r.split}
NÍVEL DETECTADO: ${r.levelKey}
MODELO DE PROGRESSÃO: ${r.progression.model} — ${r.progression.detail}

VOLUME SEMANAL POR GRUPO (respeitar as faixas):
${vol}

PILARES OBRIGATÓRIOS:
1. VOLUME — nunca ultrapassar o MRV nem ficar abaixo do MEV de cada grupo.
2. TENSÃO MECÂNICA — exercício principal em zona de força com RIR controlado.
3. ESPECIFICIDADE — seleção coerente com o objetivo e os pontos fracos.
4. FREQUÊNCIA — mínimo 2x/semana por grupo quando a divisão permitir.
5. SELEÇÃO POR EMG — exercícios com maior ativação documentada, cobrindo alongado / constante / encurtado.
${r.corretivo ? "\nCORRETIVO APEX: integrar como ativação e mobilidade no aquecimento; ajustar ângulos e volume dos grupos envolvidos; RIR mínimo 1." : ""}
${r.feminino ? "\nSTRATUM FEMININO ATIVO: modular volume por fase do ciclo, priorizar cadeia posterior/glúteo, atenção à laxidão ligamentar na ovulação, travas RED-S." : ""}
${r.athlete ? "\nSTRATUM ATHLETE ATIVO: deload obrigatório, taper de volume próximo ao palco, peak week e posing integrados." : ""}
━━━ FIM MOTOR STRATUM ━━━`;
}
