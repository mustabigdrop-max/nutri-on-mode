// ARSENAL VIRAL — MOTOR DE PATENTES DO nutriON
// A patente vem do APEX Score geral (média das zonas da última avaliação salva).
// Sem avaliação salva não existe patente — nada é estimado aqui.

export interface Rank {
  key: string;
  nome: string;
  icone: string;
  cor: string;
  corSecundaria?: string;
  glow: boolean;
  min: number;
  max: number;
  descricao: string;
}

export const RANKS: Rank[] = [
  { key: "spark", nome: "SPARK", icone: "⚡", cor: "#555566", glow: false, min: 0, max: 30, descricao: "A faísca acendeu. O sistema começou." },
  { key: "foundation", nome: "FOUNDATION", icone: "🧱", cor: "#8B6914", glow: false, min: 31, max: 50, descricao: "A base está sendo construída. Consistência inicial." },
  { key: "rising", nome: "RISING", icone: "📈", cor: "#A0A0B0", glow: false, min: 51, max: 65, descricao: "Em ascensão. Resultados aparecendo." },
  { key: "force", nome: "FORCE", icone: "💪", cor: "#B8922A", glow: false, min: 66, max: 75, descricao: "Força consolidada. Acima da média." },
  { key: "prime", nome: "PRIME", icone: "🔥", cor: "#00D4FF", glow: true, min: 76, max: 85, descricao: "No auge. Poucos chegam aqui." },
  { key: "titan", nome: "TITAN", icone: "👑", cor: "#00D4FF", corSecundaria: "#B8922A", glow: true, min: 86, max: 95, descricao: "Excepcional. Referência." },
  { key: "apex_elite", nome: "APEX ELITE", icone: "💎", cor: "#FFFFFF", corSecundaria: "#00D4FF", glow: true, min: 96, max: 100, descricao: "O topo absoluto." },
];

export function rankForScore(score: number | null | undefined): Rank | null {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return RANKS.find((r) => s >= r.min && s <= r.max) ?? null;
}

export function rankByKey(key: string | null | undefined): Rank | null {
  if (!key) return null;
  return RANKS.find((r) => r.key === key) ?? null;
}

export function nextRank(rank: Rank | null): Rank | null {
  if (!rank) return null;
  const i = RANKS.findIndex((r) => r.key === rank.key);
  return i >= 0 && i < RANKS.length - 1 ? RANKS[i + 1] : null;
}

export type RankChange = { direction: "promotion" | "demotion"; from: Rank; to: Rank } | null;

export function detectRankChange(scoreAnterior: number | null, scoreAtual: number | null): RankChange {
  const antes = rankForScore(scoreAnterior);
  const agora = rankForScore(scoreAtual);
  if (!antes || !agora || antes.key === agora.key) return null;
  return { direction: agora.min > antes.min ? "promotion" : "demotion", from: antes, to: agora };
}

export interface DestaqueGrupo {
  grupo: string;
  delta: number;
  status: "elite" | "good" | "moderate" | "deficit" | "neutral";
  nota?: string;
}

export const STATUS_CORES: Record<DestaqueGrupo["status"], string> = {
  elite: "#00D4FF",
  good: "#00FF88",
  moderate: "#B8922A",
  deficit: "#FF4444",
  neutral: "#555566",
};

export function statusDoDelta(delta: number, emDeficit: boolean): DestaqueGrupo["status"] {
  if (emDeficit) return "deficit";
  if (delta >= 15) return "elite";
  if (delta >= 8) return "good";
  if (delta >= 1) return "moderate";
  return "neutral";
}

/** Cor da barra do APEX Score: vermelho (0) → dourado (50) → ciano (100). */
export function corDoScore(score: number): string {
  if (score >= 76) return "#00D4FF";
  if (score >= 51) return "#B8922A";
  if (score >= 31) return "#8B6914";
  return "#FF4444";
}

/** Mensagem PRAXIS de promoção — voz do Coach Diogo Mello. */
export function mensagemPromocao(params: {
  nome: string;
  de: Rank;
  para: Rank;
  scoreAnterior: number;
  scoreAtual: number;
  destaques: DestaqueGrupo[];
}): string {
  const { nome, de, para, scoreAnterior, scoreAtual, destaques } = params;
  const alvo = nextRank(para);
  const linhas = [
    `${para.icone} PROMOÇÃO!`,
    "",
    `${nome}, você foi promovido de ${de.nome} para ${para.nome}.`,
    "",
    `Seu APEX Score subiu de ${Math.round(scoreAnterior)} para ${Math.round(scoreAtual)}. ${para.descricao}`,
  ];
  if (destaques.length) {
    linhas.push("", "Seus destaques deste ciclo:");
    destaques.forEach((d) => {
      const sinal = d.delta > 0 ? `+${d.delta}` : `${d.delta}`;
      linhas.push(`• ${d.grupo}: ${sinal} pontos${d.status === "deficit" ? " (em correção)" : ""}`);
    });
  }
  if (alvo) {
    const pontosRestantes = Math.max(1, alvo.min - Math.round(scoreAtual));
    const ganho = Math.max(1, Math.round(scoreAtual - scoreAnterior));
    const mesociclos = Math.max(1, Math.ceil(pontosRestantes / ganho));
    linhas.push("", `Novo objetivo: chegar a ${alvo.nome} (score ${alvo.min}+).`);
    linhas.push(`Com o ritmo da última reavaliação, estimativa: ${mesociclos} mesociclo${mesociclos > 1 ? "s" : ""}.`);
  }
  linhas.push("", "Compartilhe sua promoção.", "[Botão: Gerar Card de Promoção]", "", "Coach Diogo Mello", "Transformação é sistema. 💪");
  return linhas.join("\n");
}

/** Mensagem PRAXIS de rebaixamento — tom de apoio, nunca punitivo. */
export function mensagemRebaixamento(params: {
  nome: string;
  de: Rank;
  para: Rank;
  scoreAnterior: number;
  scoreAtual: number;
}): string {
  const { nome, de, para, scoreAnterior, scoreAtual } = params;
  return [
    `${nome}, seu APEX Score ajustou de ${Math.round(scoreAnterior)} para ${Math.round(scoreAtual)}. Isso acontece — fases de vida, lesões, rotina mudando.`,
    "",
    "O importante: você ainda está no sistema, e o sistema funciona quando você volta.",
    "",
    `Seu rank atual: ${para.nome}. O caminho de volta a ${de.nome} está mapeado.`,
    "Quer ativar o Protocolo de Retomada? Um bloco de cada vez.",
    "",
    "Estou aqui. 💪",
    "Coach Diogo Mello",
  ].join("\n");
}
