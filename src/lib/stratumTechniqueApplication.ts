/**
 * STRATUM — Addendum: aplicação de técnicas avançadas por set.
 * Toda técnica prescrita precisa dizer EM QUAL SET, COMO executar e POR QUÊ.
 * Protocolos conforme o addendum do Coach Diogo Mello (sem valores inventados).
 */

export type AddendumTechnique =
  | "REST_PAUSE" | "DROP_SET" | "MYOREPS" | "BACK_OFF"
  | "PAUSA_ISOMETRICA" | "EXCENTRICO_LENTO" | "PRE_EXAUSTAO" | "TEMPO_CONTROLADO" | "CLUSTER_SET" | "BISET";

export interface TechniqueApplication {
  label: string;
  onde: string;
  quantas: string;
  protocolo: string[];
  quando: string[];
  quandoNao: string[];
}

export const TECHNIQUE_APPLICATION: Record<AddendumTechnique, TechniqueApplication> = {
  REST_PAUSE: {
    label: "REST-PAUSE",
    onde: "ÚLTIMA série de trabalho",
    quantas: "1 (com 2-3 mini-sets dentro)",
    protocolo: ["Série normal até RIR 1", "Soltar o peso, 15-20s de descanso", "Mesma carga até RIR 1", "15-20s de descanso", "Mesma carga até RIR 0-1 → fim"],
    quando: ["Deficit de VOLUME", "Isoladores", "Último exercício do grupo"],
    quandoNao: ["Compostos pesados (agachamento, supino barra, RDL)", "Primeiro exercício da sessão", "Deficit BIOMECÂNICO"],
  },
  DROP_SET: {
    label: "DROP-SET",
    onde: "ÚLTIMA série (ou últimas 2)",
    quantas: "1-2",
    protocolo: ["Série normal até RIR 1", "Sem descanso, reduzir 20-25% da carga até RIR 1", "Sem descanso, reduzir mais 20-25% até RIR 0 → fim"],
    quando: ["Deficit de VOLUME", "Máquina ou cabo", "Penúltimo ou último exercício do grupo"],
    quandoNao: ["Barra livre", "Compostos pesados", "Deficit BIOMECÂNICO", "Primeiro exercício da sessão"],
  },
  MYOREPS: {
    label: "MYO-REPS",
    onde: "O EXERCÍCIO INTEIRO (substitui as séries normais)",
    quantas: "1 ativadora + 3-5 mini-sets",
    protocolo: ["Ativadora: 12-20 reps até RIR 1-2", "10-15s de descanso (3-5 respirações)", "Mini-sets de 3-5 reps com a mesma carga", "Parar quando cair abaixo de 3 reps ou após 5 mini-sets"],
    quando: ["Deficit de VOLUME", "Isoladores", "Sessão com tempo limitado", "Último exercício do grupo"],
    quandoNao: ["Compostos pesados", "Exercícios com setup (remada curvada, RDL)", "Deficit BIOMECÂNICO"],
  },
  BACK_OFF: {
    label: "BACK-OFF SET",
    onde: "IMEDIATAMENTE APÓS o top set",
    quantas: "1-2",
    protocolo: ["Top set: carga máxima do dia × 8-10, RPE 9", "Back-off: -10-15% do top set × 10-12, RPE 8", "Segundo back-off opcional"],
    quando: ["Compostos principais (supino, agachamento, remada)", "Exercício com TOP SET", "Qualquer fase exceto deload"],
    quandoNao: ["Deload"],
  },
  PAUSA_ISOMETRICA: {
    label: "PAUSA ISOMÉTRICA",
    onde: "TODAS as séries",
    quantas: "Todas",
    protocolo: ["Tempo 3-0-2-2 ou 3-0-2-3", "Segurar 2-3s no pico de cada rep", "Carga -20% do normal"],
    quando: ["Deficit de ATIVAÇÃO", "Conexão mente-músculo ruim", "Isoladores do grupo deficitário"],
    quandoNao: [],
  },
  EXCENTRICO_LENTO: {
    label: "EXCÊNTRICO LENTO",
    onde: "TODAS as séries",
    quantas: "Todas",
    protocolo: ["Tempo 5-0-1-0 ou 4-1-2-0", "Descida controlada em 4-5s", "Carga -30-40% do normal", "Parar com 2-3 RIR, sem falha"],
    quando: ["Deficit BIOMECÂNICO", "Exercícios de correção", "Grupo com flag postural"],
    quandoNao: [],
  },
  PRE_EXAUSTAO: {
    label: "PRÉ-EXAUSTÃO",
    onde: "PRIMEIRO exercício (isolador) pareado com o composto",
    quantas: "2-3 rounds",
    protocolo: ["A1 isolador × 12-15, RIR 2", "15-30s de descanso", "A2 composto × 8-10, RIR 2", "90-120s entre rounds"],
    quando: ["Deficit de ATIVAÇÃO", "Aluno sente mais o sinergista que o alvo no composto"],
    quandoNao: [],
  },
  TEMPO_CONTROLADO: {
    label: "TEMPO CONTROLADO",
    onde: "TODAS as séries",
    quantas: "Todas",
    protocolo: ["3-0-2-1 / 3-0-2-2: ativação", "4-0-1-0 / 5-0-1-0: biomecânico", "1-0-X-0: potência", "3-1-2-2: posição alongada"],
    quando: ["Conforme o deficit do grupo"],
    quandoNao: [],
  },
  CLUSTER_SET: {
    label: "CLUSTER SET",
    onde: "Séries de trabalho do composto",
    quantas: "Conforme prescrito",
    protocolo: ["Blocos de 2-3 reps", "15-25s entre blocos", "Somar até o total prescrito"],
    quando: ["Força em compostos"],
    quandoNao: ["Deload"],
  },
  BISET: {
    label: "BISET",
    onde: "Todas as rodadas do par",
    quantas: "Todas",
    protocolo: ["Exercício 1 normal", "Sem descanso, exercício 2 do mesmo grupo", "Descansar ao fim da rodada"],
    quando: ["Isoladores do mesmo grupo"],
    quandoNao: ["Compostos pesados"],
  },
};

/** Descreve em qual set aplicar, dado o total de séries de trabalho. */
export function setPlacement(tech: AddendumTechnique, totalSeries: number, hasFeeder = false): string {
  const n = Math.max(1, Math.floor(totalSeries || 0));
  const f = hasFeeder ? "F1: 50% × 12-15 (feeder); " : "";
  switch (tech) {
    case "REST_PAUSE":
      return n > 1 ? `${f}S1-S${n - 1} normais; S${n} — REST-PAUSE` : `${f}S1 — REST-PAUSE`;
    case "DROP_SET":
      return n > 1 ? `${f}S1-S${n - 1} normais; S${n} — DROP-SET` : `${f}S1 — DROP-SET`;
    case "MYOREPS":
      return "Exercício inteiro em MYO-REPS: 1 ativadora + 3-5 mini-sets";
    case "BACK_OFF":
      return n >= 3 ? `${f}S1-S${n - 2} progressivas; S${n - 1} — TOP SET; S${n} — BACK-OFF` : `${f}S1 — TOP SET; S2 — BACK-OFF`;
    case "PRE_EXAUSTAO":
      return "A1 isolador → A2 composto, 2-3 rounds";
    default:
      return `Todas as ${n} séries`;
  }
}

/** Bloco de regra injetado no prompt do STRATUM. */
export function buildTechniqueAddendumRule(): string {
  const linhas = [
    "REGRA DE TÉCNICAS AVANÇADAS (obrigatória):",
    "Ao prescrever qualquer técnica, SEMPRE informar: 1) EM QUAL SET (ex.: \"REST-PAUSE na S6, última série\"); 2) PROTOCOLO passo a passo; 3) CONTEXTO das demais séries (ex.: \"S1-S5 normais, RPE 8, descanso 60s\"); 4) POR QUÊ em 1 frase ligada ao deficit.",
    "NUNCA escrever apenas a tag (REST-PAUSE, DROP-SET) sem dizer em qual set e como executar.",
    "MAPA:",
  ];
  for (const t of Object.values(TECHNIQUE_APPLICATION)) {
    linhas.push(`  - ${t.label}: ${t.onde} (${t.quantas}). Protocolo: ${t.protocolo.join(" → ")}.${t.quandoNao.length ? ` Não usar: ${t.quandoNao.join("; ")}.` : ""}`);
  }
  return linhas.join("\n");
}
