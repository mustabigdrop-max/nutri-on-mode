// ARSENAL VIRAL — TRANSFORMATION TIMELINE
// Roteiro visual mês a mês montado SOMENTE com avaliações reais salvas em
// apex_muscle_scores. Nenhum score, delta ou data é estimado: se faltam
// avaliações, o roteiro não é gerado.

import { apexScoreGeral, zonasDaAvaliacao, type MuscleScoreRow } from "./apexMuscleScore";
import { rankForScore, type Rank } from "./apexRanks";

export type TimelineFormato = "9:16" | "4:5";

export interface TimelinePonto {
  data: string;            // ISO (AAAA-MM-DD)
  rotulo: string;          // "Mar 2026"
  score: number;
  rank: Rank;
  delta: number | null;    // vs ponto anterior
  fortes: string[];        // grupos acima de 70 nesta avaliação
  fracos: string[];        // grupos abaixo de 50 nesta avaliação
  fotoUrl?: string | null;
  promocao: boolean;
}

export interface TimelineFrame {
  ordem: number;
  segundos: number;
  tipo: "abertura" | "transicao" | "mes" | "split" | "fecho";
  titulo: string;
  legenda: string;
  dados: string[];
  direcao: string;         // instrução visual para o editor
}

export interface TimelineRoteiro {
  nome: string;
  formato: TimelineFormato;
  duracaoSegundos: number;
  periodo: string;
  scoreInicial: number;
  scoreFinal: number;
  deltaTotal: number;
  promocoes: string[];
  pontos: TimelinePonto[];
  frames: TimelineFrame[];
  trilhaSugerida: string;
  legendaPost: string;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function dataDaLinha(row: MuscleScoreRow): string | null {
  const raw = (row.assessment_date as string) || (row.created_at as string) || null;
  return raw ? raw.slice(0, 10) : null;
}

function rotulo(iso: string): string {
  const [ano, mes] = iso.split("-");
  return `${MESES[Number(mes) - 1] || mes} ${ano}`;
}

/** Converte as avaliações salvas (qualquer ordem) em pontos da timeline. */
export function pontosDaTimeline(
  rows: MuscleScoreRow[],
  fotos: Record<string, string | null> = {},
): TimelinePonto[] {
  const base = rows
    .map((r) => ({ row: r, data: dataDaLinha(r), score: apexScoreGeral(r) }))
    .filter((x): x is { row: MuscleScoreRow; data: string; score: number } => !!x.data && x.score !== null)
    .sort((a, b) => a.data.localeCompare(b.data));

  return base.map((item, i) => {
    const anterior = i > 0 ? base[i - 1] : null;
    const zonas = zonasDaAvaliacao(item.row);
    const score = Math.round(item.score);
    const rank = rankForScore(score)!;
    const rankAnterior = anterior ? rankForScore(Math.round(anterior.score)) : null;
    return {
      data: item.data,
      rotulo: rotulo(item.data),
      score,
      rank,
      delta: anterior ? score - Math.round(anterior.score) : null,
      fortes: zonas.filter((z) => z.score >= 70).map((z) => z.grupo).slice(0, 3),
      fracos: zonas.filter((z) => z.score < 50).map((z) => z.grupo).slice(0, 3),
      fotoUrl: fotos[item.data] ?? null,
      promocao: !!rankAnterior && rankAnterior.key !== rank.key && score > Math.round(anterior!.score),
    };
  });
}

/**
 * Monta o roteiro frame a frame. Retorna null quando há menos de 2 avaliações
 * reais — sem duas medições não existe evolução para mostrar.
 */
export function gerarTimeline(params: {
  nome: string;
  rows: MuscleScoreRow[];
  fotos?: Record<string, string | null>;
  formato?: TimelineFormato;
}): TimelineRoteiro | null {
  const pontos = pontosDaTimeline(params.rows, params.fotos);
  if (pontos.length < 2) return null;

  const formato = params.formato || "9:16";
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const deltaTotal = ultimo.score - primeiro.score;
  const promocoes = pontos.filter((p) => p.promocao).map((p) => `${p.rotulo} → ${p.rank.nome}`);

  const frames: TimelineFrame[] = [];
  let ordem = 1;
  const push = (f: Omit<TimelineFrame, "ordem">) => frames.push({ ordem: ordem++, ...f });
  const pontosIntermediarios = pontos.length <= 4
    ? pontos.slice(1)
    : [
        pontos[1],
        pontos[Math.floor((pontos.length - 1) / 2)],
        ultimo,
      ].filter((p, i, arr) => arr.findIndex((x) => x.data === p.data) === i);

  push({
    segundos: 2.5,
    tipo: "abertura",
    titulo: `${primeiro.rotulo} — PONTO ZERO`,
    legenda: `APEX SCORE ${primeiro.score} · ${primeiro.rank.nome}`,
    dados: [
      `Score geral: ${primeiro.score}`,
      primeiro.fracos.length ? `Grupos em atraso: ${primeiro.fracos.join(", ")}` : "Sem grupos abaixo de 50 registrados",
    ],
    direcao: primeiro.fotoUrl
      ? "Foto da primeira avaliação em tela cheia, mapa muscular sobreposto em vermelho/cinza nos grupos em atraso"
      : "Mapa muscular em vermelho/cinza nos grupos em atraso (sem foto registrada nesta data)",
  });

  pontosIntermediarios.forEach((p, i) => {
    push({
      segundos: 0.4,
      tipo: "transicao",
      titulo: "TRANSIÇÃO",
      legenda: `${i === 0 ? primeiro.rotulo : pontosIntermediarios[i - 1].rotulo} → ${p.rotulo}`,
      dados: [],
      direcao: i % 2 === 0 ? "Morphing rápido entre as fotos" : "Corte glitch de 3 frames com flash do accent ciano",
    });
    push({
      segundos: 2.2,
      tipo: "mes",
      titulo: p.rotulo,
      legenda: `APEX SCORE ${p.score}${p.delta !== null ? ` (${p.delta >= 0 ? "+" : ""}${p.delta})` : ""}`,
      dados: [
        `Patente: ${p.rank.nome}`,
        p.fortes.length ? `Acima de 70: ${p.fortes.join(", ")}` : "Nenhum grupo acima de 70 nesta avaliação",
        p.fracos.length ? `Ainda em atraso: ${p.fracos.join(", ")}` : "Nenhum grupo abaixo de 50",
      ],
      direcao: p.promocao
        ? `Badge de promoção ${p.rank.nome} entra com glow dourado; grupos que subiram acendem em verde`
        : "Grupos que subiram acendem em verde; número do score contando para cima",
    });
  });

  push({
    segundos: 4,
    tipo: "split",
    titulo: "ANTES × DEPOIS",
    legenda: `${primeiro.rotulo} × ${ultimo.rotulo}`,
    dados: [
      `Score: ${primeiro.score} → ${ultimo.score} (${deltaTotal >= 0 ? "+" : ""}${deltaTotal})`,
      `Patente: ${primeiro.rank.nome} → ${ultimo.rank.nome}`,
      `Avaliações registradas: ${pontos.length}`,
    ],
    direcao: "Split screen vertical, números em Rajdhani 700 e rótulos em Space Mono",
  });

  push({
    segundos: 3,
    tipo: "fecho",
    titulo: "nutriON",
    legenda: "Transformação é sistema.",
    dados: ["Coach Diogo Mello", "Link na bio"],
    direcao: "Logo centralizado sobre fundo #020205, CTA no rodapé",
  });

  const duracaoSegundos = Math.round(frames.reduce((a, f) => a + f.segundos, 0));

  return {
    nome: params.nome,
    formato,
    duracaoSegundos,
    periodo: `${primeiro.rotulo} — ${ultimo.rotulo}`,
    scoreInicial: primeiro.score,
    scoreFinal: ultimo.score,
    deltaTotal,
    promocoes,
    pontos,
    frames,
    trilhaSugerida: "Faixa instrumental com build-up até o split screen (defina no CapCut/InShot)",
    legendaPost:
      `${params.nome} — ${primeiro.rotulo} a ${ultimo.rotulo}.\n` +
      `APEX Score ${primeiro.score} → ${ultimo.score} (${deltaTotal >= 0 ? "+" : ""}${deltaTotal}).\n` +
      (promocoes.length ? `Patentes: ${promocoes.join(" · ")}.\n` : "") +
      "Cada número aqui saiu de avaliação registrada, não de achismo.\n\nTransformação é sistema.",
  };
}

/** Roteiro em texto puro para colar no CapCut/InShot. */
export function timelineComoTexto(r: TimelineRoteiro): string {
  const linhas: string[] = [
    `TRANSFORMATION TIMELINE — ${r.nome}`,
    `Período: ${r.periodo} · Formato ${r.formato} · ~${r.duracaoSegundos}s`,
    `APEX Score ${r.scoreInicial} → ${r.scoreFinal} (${r.deltaTotal >= 0 ? "+" : ""}${r.deltaTotal})`,
    r.promocoes.length ? `Promoções: ${r.promocoes.join(" · ")}` : "Promoções: nenhuma no período",
    "",
  ];
  r.frames.forEach((f) => {
    linhas.push(`FRAME ${f.ordem} — ${f.segundos}s — ${f.titulo}`);
    linhas.push(`  Texto na tela: ${f.legenda}`);
    f.dados.forEach((d) => linhas.push(`  • ${d}`));
    linhas.push(`  Direção: ${f.direcao}`);
    linhas.push("");
  });
  linhas.push(`Trilha: ${r.trilhaSugerida}`, "", "LEGENDA DO POST:", r.legendaPost);
  return linhas.join("\n");
}
