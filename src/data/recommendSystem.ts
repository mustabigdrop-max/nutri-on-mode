// ============================================================
// RECOMENDADOR DE SISTEMA DE TREINAMENTO
// Score baseado em fase + nível + dias/sem + objetivo + fibras
// ============================================================
import { TRAINING_SYSTEMS, TrainingSystem } from "./trainingSystems";

export interface RecommendationContext {
  phase: string;            // bulking | cutting | manutencao | recomposicao | emagrecimento | performance
  level: string;            // iniciante | intermediario | avancado | atleta
  days: string;             // "3" | "4" | "5" | "6"
  weeks: string;            // "4" | "6" | "8" | "12" | "16"
  fiberType?: string;       // tipo_i | tipo_iia | tipo_iix | misto
  weakPoints?: string;      // texto livre
  specificGoal?: string;    // texto livre
}

const LEVEL_RANK: Record<string, number> = { iniciante: 1, intermediario: 2, avancado: 3, atleta: 4 };

/**
 * Retorna o sistema com maior score + ranking dos top 5 candidatos.
 */
export function recommendSystem(ctx: RecommendationContext): {
  best: TrainingSystem;
  scores: { system: TrainingSystem; score: number; reasons: string[] }[];
} {
  const lvl = LEVEL_RANK[ctx.level] ?? 2;
  const days = parseInt(ctx.days || "4");
  const weeks = parseInt(ctx.weeks || "8");
  const isWeak = !!(ctx.weakPoints && ctx.weakPoints.trim().length > 3);

  const scored = TRAINING_SYSTEMS.map((s) => {
    let score = 0;
    const reasons: string[] = [];

    // ── COMPATIBILIDADE NÍVEL ↔ COMPLEXIDADE ──
    const diff = Math.abs(s.complexidade - lvl);
    if (diff === 0) { score += 30; reasons.push("Complexidade ideal para o nível"); }
    else if (diff === 1) score += 15;
    else if (diff >= 3) score -= 20;

    // Iniciante NUNCA pega Smolov, Bulgarian, Westside, French Contrast
    if (lvl === 1 && s.complexidade >= 4) score -= 50;

    // ── FASE ──
    switch (ctx.phase) {
      case "bulking":
        if (["gvt", "gvt-poliquin", "rp", "mountain-dog", "weider", "531-monolith"].includes(s.id)) { score += 25; reasons.push("Excelente para bulking (volume/hipertrofia)"); }
        if (["smolov", "bulgarian", "vbt"].includes(s.id)) score -= 10;
        break;
      case "cutting":
        if (["doggcrapp", "edt", "heavy-duty", "flushing", "dup", "rp"].includes(s.id)) { score += 25; reasons.push("Mantém massa em déficit calórico"); }
        if (["gvt", "smolov", "531-monolith"].includes(s.id)) score -= 15;
        break;
      case "manutencao":
        if (["531", "wup", "weider", "texas-method"].includes(s.id)) { score += 20; reasons.push("Ótimo para manutenção sustentável"); }
        break;
      case "recomposicao":
        if (["dup", "apre", "rp", "mountain-dog"].includes(s.id)) { score += 22; reasons.push("Equilíbrio força + hipertrofia"); }
        break;
      case "emagrecimento":
        if (["edt", "flushing", "heavy-duty", "weider"].includes(s.id)) { score += 20; reasons.push("Densidade alta, gasto calórico"); }
        if (["smolov", "bulgarian"].includes(s.id)) score -= 20;
        break;
      case "performance":
        if (["531", "conjugada", "block", "triphasic", "french-contrast", "vbt", "cube", "texas-method"].includes(s.id)) { score += 30; reasons.push("Foco em força/potência atlética"); }
        if (["gvt", "weider", "flushing"].includes(s.id)) score -= 15;
        break;
    }

    // ── DIAS POR SEMANA ──
    if (s.id === "doggcrapp" && days >= 3 && days <= 4) { score += 10; reasons.push(`${days} dias é perfeito para DC`); }
    if (s.id === "weider" && days >= 5) { score += 10; reasons.push("Bro split exige 5+ dias"); }
    if (s.id === "conjugada" && days === 4) { score += 10; reasons.push("4 dias = formato Westside clássico"); }
    if (s.id === "531" && (days === 3 || days === 4)) { score += 8; reasons.push(`${days} dias compatível com 5/3/1`); }
    if (s.id === "texas-method" && days === 3) { score += 12; reasons.push("Texas Method = exatamente 3x/sem"); }
    if (s.id === "bulgarian" && days >= 5) score += 8;

    // ── DURAÇÃO ──
    if (s.id === "smolov" && weeks < 13) score -= 30; // exige 13 sem
    if (s.id === "gvt" && weeks > 6) score -= 15;
    if (s.id === "531-monolith" && weeks !== 6) score -= 10;
    if (s.id === "block" && weeks >= 12) { score += 10; reasons.push("Duração ideal para Block"); }

    // ── PONTOS FRACOS ──
    if (isWeak) {
      if (["mountain-dog", "rp", "gvt"].includes(s.id)) { score += 12; reasons.push("Permite especialização em ponto fraco"); }
    }

    // ── FIBRAS ──
    if (ctx.fiberType === "tipo_i") {
      if (["gvt", "edt", "flushing", "rp"].includes(s.id)) { score += 10; reasons.push("Sinergia com fibras Tipo I (volume/reps altas)"); }
    } else if (ctx.fiberType === "tipo_iix") {
      if (["531", "conjugada", "vbt", "triphasic", "heavy-duty", "cube"].includes(s.id)) { score += 12; reasons.push("Sinergia com fibras Tipo IIx (força/potência)"); }
    } else if (ctx.fiberType === "tipo_iia") {
      if (["dup", "rp", "mountain-dog", "531", "doggcrapp"].includes(s.id)) { score += 10; reasons.push("Sinergia com Tipo IIa (hipertrofia mecânica)"); }
    } else if (ctx.fiberType === "misto") {
      if (["dup", "block", "apre"].includes(s.id)) { score += 8; reasons.push("Modelos ondulatórios cobrem perfil misto"); }
    }

    return { system: s, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return { best: scored[0].system, scores: scored.slice(0, 5) };
}

/**
 * Retorna parâmetros prescritivos do sistema (reps, sets, RIR, descanso, técnicas, cardio, nutrição).
 * Injetado no prompt da edge function para "trazer tudo pronto".
 */
export function buildSystemPrescription(systemId: string, phase: string): string {
  const sys = TRAINING_SYSTEMS.find((s) => s.id === systemId);
  if (!sys) return "";

  const PRESCRIPTIONS: Record<string, { sets: string; reps: string; rir: string; rest: string; tempo: string; tecnicas: string; cardio: string; nutricao: string }> = {
    "linear-simples": { sets: "3-4", reps: "Sem 1-2: 12-15 / Sem 3-4: 8-10 / Sem 5-6: 5-6", rir: "2-3 → 1-2 → 0-1", rest: "60-120s", tempo: "2-0-1-0", tecnicas: "Drop set no último set da semana 5-6", cardio: "Manter padrão da fase", nutricao: "Padrão da fase" },
    "dup": { sets: "3-5", reps: "Seg: 4-6 (força) / Qua: 8-12 (hipertrofia) / Sex: 15-20 (metabólico)", rir: "1-2 (força) / 1 (hip) / 0 (metab)", rest: "3min força · 90s hip · 45s metab", tempo: "3-1-1-0 (força) / 2-0-1-0 (hip)", tecnicas: "Rest-pause no metabólico", cardio: "Conforme fase", nutricao: "Padrão da fase" },
    "wup": { sets: "3-4", reps: "Sem A volume (12-15) · Sem B intensidade (5-8) · Sem C técnica (10-12)", rir: "2 / 0-1 / 1", rest: "60-90s · 2-3min · 75s", tempo: "2-0-1-0", tecnicas: "Pausa no Sem C", cardio: "Conforme fase", nutricao: "Padrão da fase" },
    "conjugada": { sets: "Max Effort: 1RM-3RM · Dynamic Effort: 8-12x2-3", rir: "0 (ME) · velocidade alta (DE)", rest: "ME 5min · DE 45-60s", reps: "ME 1-3 · DE 2-3 explosivas", tempo: "ME 1-0-X-0 · DE 1-0-X-0", tecnicas: "Bandas + correntes + box squat", cardio: "Sled drag 2x/sem", nutricao: "Superávit moderado" },
    "block": { sets: "Acumulação 4-5 · Transmutação 3-4 · Realização 2-3", reps: "Acum 10-15 · Transm 6-10 · Real 3-6", rir: "2 → 1 → 0", rest: "60-90s · 2min · 3-5min", tempo: "2-0-1-0", tecnicas: "Variar por bloco", cardio: "Reduz no Realização", nutricao: "Cíclica por bloco" },
    "apre": { sets: "4 sets fixos", reps: "Sets 1-2 fixos · Set 3 AMRAP determina carga do Set 4", rir: "0 no AMRAP", rest: "2-3min", tempo: "2-0-1-0", tecnicas: "Auto-regulação por feedback do AMRAP", cardio: "Conforme fase", nutricao: "Padrão da fase" },
    "531": { sets: "3 work sets + acessórios 5x10 ou 3x10 (BBB/FSL)", reps: "5/3/1 com AMRAP no top", rir: "0 (AMRAP)", rest: "3-5min compostos · 60-90s acessórios", tempo: "2-0-X-0", tecnicas: "AMRAP no 3º set + Joker sets opcionais", cardio: "2-3x/sem 30min LISS", nutricao: "Manutenção/leve superávit, proteína 2.0g/kg" },
    "531-monolith": { sets: "5/3/1 + 5x10 acessórios + Pendlay row 100 reps", reps: "Top set AMRAP + 5x10 BBB", rir: "0 AMRAP / 1-2 acessórios", rest: "3min compostos · 60s acessórios", tempo: "2-0-X-0", tecnicas: "AMRAP + 100 reps row + farmer carry", cardio: "1-2x/sem leve", nutricao: "Hipercalórica +500-700 kcal, 2.4g/kg proteína" },
    "smolov": { sets: "Base mesocycle: 4x9, 5x7, 7x5, 10x3", reps: "Conforme cronograma", rir: "0-1 (brutal)", rest: "3-5min", tempo: "3-1-X-0", tecnicas: "Apenas back squat + acessórios mínimos", cardio: "ZERO durante o ciclo", nutricao: "Superávit forte +600 kcal, proteína 2.5g/kg, recuperação prioritária" },
    "texas-method": { sets: "Volume Day 5x5 · Intensity Day 1x5 PR", reps: "5x5 · 5RM", rir: "1-2 / 0", rest: "3-5min", tempo: "2-0-X-0", tecnicas: "Recovery Day leve no meio", cardio: "Caminhada nos off days", nutricao: "Superávit leve, proteína 2.0g/kg" },
    "cube": { sets: "Heavy 5-1 · Explosive 6-8x2-3 · Volume 4-5x6-8", reps: "Variável por dia", rir: "0 / vel alta / 1-2", rest: "3-5min · 60s · 2min", tempo: "2-0-X-0", tecnicas: "Rotação semanal estrita", cardio: "2x/sem 20min", nutricao: "Manutenção/superávit" },
    "gvt": { sets: "10x10 no exercício principal + 3x10 acessório", reps: "10 fixas (mesma carga)", rir: "Inicia com 3, termina com 0", rest: "60-90s estrito", tempo: "4-0-2-0 (4s excêntrica)", tecnicas: "10x10 + isolador antagonista 3x10-12", cardio: "2x/sem leve (recuperação)", nutricao: "Superávit +400 kcal, proteína 2.4g/kg, carbo alto" },
    "gvt-poliquin": { sets: "10x6 no principal + 3x6-8 acessório", reps: "6 fixas com 70% 1RM", rir: "1-2", rest: "90s", tempo: "4-0-2-0", tecnicas: "Pré-exaustão isolador → composto", cardio: "2x/sem", nutricao: "Superávit moderado" },
    "doggcrapp": { sets: "1 set straight + 2 mini-sets rest-pause", reps: "8-12 + 3-5 + 2-3 (rest-pause)", rir: "0 absoluto em todos", rest: "10-15 respirações entre rest-pauses", tempo: "Excêntrica controlada 3-4s + concêntrica explosiva", tecnicas: "Rest-pause OBRIGATÓRIO + Extreme Stretching 60s pós", cardio: "3-4x/sem 30-45min LISS", nutricao: "Bulking: +300 kcal · Cutting: -300 kcal, sempre proteína 2.6g/kg" },
    "mountain-dog": { sets: "Pump 3x12-15 → Stretch 3x10-12 → Contraction 3x8-10", reps: "Pyramid down em séries finais", rir: "1-2 nas técnicas, 0 no contraction", rest: "60-75s", tempo: "Pump 2-0-1-0 / Stretch 4-0-1-0 / Contraction 2-2-1-2", tecnicas: "Drop set no último contraction + ROM total + squeeze 2s", cardio: "2-3x/sem", nutricao: "Conforme fase, proteína 2.4g/kg" },
    "rp": { sets: "MEV → MAV → MRV (sets/sem por grupo)", reps: "5-30 conforme grupo", rir: "Sem 1: 3 · Sem 2: 2 · Sem 3: 1 · Sem 4: 0 · Sem 5: deload", rest: "2-3min compostos · 60-90s isoladores", tempo: "2-0-1-0", tecnicas: "Progressão de volume calculada por mesociclo", cardio: "Conforme fase", nutricao: "Macros baseado em RP Diet App, 1.8-2.6g/kg proteína" },
    "edt": { sets: "PR Zone 15min: máx reps em 2 ex antagonistas alternados", reps: "Iniciar com ~50% capacidade, bater PR/sessão", rir: "Distribuir fadiga", rest: "Auto-regulado dentro da janela", tempo: "Rápido e controlado", tecnicas: "Densidade > carga; supinar séries", cardio: "2x/sem opcional", nutricao: "Manutenção/déficit leve" },
    "heavy-duty": { sets: "1 set work até falha", reps: "6-10 reps", rir: "0 absoluto + forçadas/negativas", rest: "5-7 dias entre sessões do mesmo grupo", tempo: "4-2-2-0 controlado", tecnicas: "Forçadas + negativas + estática pós-falha", cardio: "Mínimo (preserva recuperação)", nutricao: "Manutenção, proteína 2.0g/kg" },
    "triphasic": { sets: "Bloco Excêntrico 4x3-5 · Isométrico 4x3 · Concêntrico 4x3-5", reps: "Conforme bloco", rir: "1 / 0 / explosivo", rest: "3-5min", tempo: "Bloco 1: 6-8s excêntrica · Bloco 2: 5s pausa · Bloco 3: 1-0-X-0", tecnicas: "Isolar fase muscular específica", cardio: "Esporte específico", nutricao: "Manutenção, foco recuperação" },
    "french-contrast": { sets: "Complexo de 4: heavy → plyo → light dynamic → plyo assistido", reps: "3 + 5 + 5 + 3-5", rir: "1 / explosivo / vel alta / explosivo", rest: "10-15s entre + 3-4min entre complexos", tempo: "Tudo explosivo", tecnicas: "PAP máximo · 4-6 complexos/sessão", cardio: "Específico do esporte", nutricao: "Performance: superávit leve" },
    "vbt": { sets: "Auto-regulado por velocidade", reps: "Encerrar quando velocidade cair 10-20%", rir: "Conforme zona alvo (ver tabela VBT)", rest: "2-3min para manter velocidade", tempo: "Concêntrica máxima velocidade", tecnicas: "Encoder/app + biofeedback objetivo", cardio: "Específico", nutricao: "Manutenção" },
    "bulgarian": { sets: "Daily max 1RM + back-off 80% 5x2", reps: "1 + 2x5", rir: "0 (max diário)", rest: "5-10min", tempo: "1-0-X-0", tecnicas: "Frequência diária no mesmo padrão", cardio: "Mínimo absoluto", nutricao: "Superávit forte + recuperação extrema" },
    "weider": { sets: "4-5 ex/grupo · 3-4 sets cada", reps: "8-15", rir: "1-2", rest: "60-90s", tempo: "2-0-1-0", tecnicas: "Múltiplas técnicas: drop, super, pré-exaustão, pico contração", cardio: "3x/sem moderado", nutricao: "Conforme fase, proteína 2.0-2.4g/kg" },
    "flushing": { sets: "3-4 ex em sequência mesmo grupo · 3-4 sets cada", reps: "10-15", rir: "1", rest: "30-60s entre ex · 2min entre rounds", tempo: "2-0-1-0", tecnicas: "Pump máximo · finalizar com isolador", cardio: "Conforme fase", nutricao: "Conforme fase" },
    "staggered": { sets: "Inserir 2-3 sets de grupo lagging entre sets do principal", reps: "10-20 no inserido", rir: "2", rest: "Tempo de descanso do principal", tempo: "Controlado", tecnicas: "Aproveita descanso sem fadiga sistêmica", cardio: "Conforme fase", nutricao: "Conforme fase" },
    "super-comp": { sets: "Sem 1-3: overreach (sets +30%) · Sem 4: deload (sets -50%)", reps: "Conforme fase do meso", rir: "0-1 no overreach · 3 no deload", rest: "Conforme exercício", tempo: "2-0-1-0", tecnicas: "Volume escalado intencional + descarga", cardio: "Reduz no deload", nutricao: "Superávit no overreach, manutenção no deload" },
  };

  const p = PRESCRIPTIONS[systemId];
  if (!p) return "";

  return `
━━━ SISTEMA DE TREINAMENTO BASE: ${sys.nome} ━━━
${sys.emoji} Categoria: ${sys.category} | Complexidade: ${sys.complexidade}/5
Origem: ${sys.origem || "—"} | Duração ideal: ${sys.duracaoIdeal}
Filosofia: ${sys.resumo}

PRESCRIÇÃO OBRIGATÓRIA (aplicar a TODOS os exercícios principais):
• Sets: ${p.sets}
• Reps: ${p.reps}
• RIR/RPE: ${p.rir}
• Descanso: ${p.rest}
• Tempo (cadência): ${p.tempo}
• Técnicas obrigatórias do sistema: ${p.tecnicas}

CARDIO RECOMENDADO PELO SISTEMA: ${p.cardio}
NUTRIÇÃO RECOMENDADA PELO SISTEMA: ${p.nutricao}

REGRA CRÍTICA: Todo exercício prescrito DEVE seguir os parâmetros acima. Não invente outros valores. Adapte apenas o nome do exercício ao equipamento/lesão do cliente.
${sys.alerta ? `\n⚠️ ALERTA: ${sys.alerta}` : ""}
`.trim();
}
