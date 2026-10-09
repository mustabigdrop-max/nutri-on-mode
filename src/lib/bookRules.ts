// Regras do Livro da Academia (PROMPT N2). Sem modelo: tudo é calculado em código.

export type NivelFonte = "verificada" | "tradicao" | "tecnica_de_producao";
export const SELO_FONTE: Record<NivelFonte, { label: string; aviso?: string; cor: string }> = {
  verificada: { label: "Fonte verificada", cor: "#5DCAA5" },
  tradicao: { label: "Tradição", aviso: "Obras clássicas. O texto parafraseia, não reproduz.", cor: "#AFA9EC" },
  tecnica_de_producao: { label: "Técnica de produção", aviso: "Teste com os seus dados na Calibração", cor: "#EF9F27" },
};

export const DIA = 86400e3;
export const LEITNER_DIAS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 21, 5: 60 };
export type Auto = "lembrei" | "quase" | "nao";

/** Acerto sobe uma caixa; erro volta à 1; "Quase" mantém. */
export function avaliarCartao(caixa: number, r: Auto, agora = Date.now()) {
  const c = Math.min(5, Math.max(1, caixa));
  const nova = r === "lembrei" ? Math.min(5, c + 1) : r === "nao" ? 1 : c;
  return { caixa: nova, due_at: new Date(agora + LEITNER_DIAS[nova] * DIA).toISOString() };
}

export const palavras = (s: string | null | undefined) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
export const PAUSA_MIN = 5;
export const RECALL_MIN = 20;
export const podeVerResposta = (s: string) => palavras(s) >= PAUSA_MIN;
export const recallValido = (s: string) => palavras(s) >= RECALL_MIN;

export function textoDosBlocos(blocos: any[]): string {
  return (blocos ?? []).map(b => [b.texto, b.fraco, b.forte, b.porque, b.titulo, b.pergunta, b.resposta,
    ...(b.colunas ?? []), ...((b.linhas ?? []).flat()), ...((b.trecho ?? []).flatMap((t: any) => [t.texto, t.nota]))].filter(Boolean).join(" ")).join(" ");
}
/** Tempo de leitura = palavras ÷ 200, arredondado para cima. */
export const tempoLeitura = (blocos: any[]) => Math.max(1, Math.ceil(palavras(textoDosBlocos(blocos)) / 200));

/** Lido: 90% de rolagem e ao menos 50% do tempo estimado. */
export const capituloLido = (pct: number, tempoSeg: number, tempoMin: number) => pct >= 90 && tempoSeg >= tempoMin * 60 * 0.5;

export const QUIZ_MIN = 0.75;
export const quizPassou = (acertos: number, total: number) => total > 0 && acertos / total >= QUIZ_MIN;

/** Flashcards criados na conclusão: caixa 1, vencendo em +1 dia. */
export function cartoesIniciais(n: number, agora = Date.now()) {
  return Array.from({ length: n }, (_, i) => ({ card_idx: i, caixa: 1, due_at: new Date(agora + DIA).toISOString() }));
}

type Card = { caixa: number; ultimo_resultado?: string | null };
/** Dominado: ≥80% dos cartões nas caixas 4–5 e o aplique feito. */
export function capituloDominado(cards: Card[], apliqueFeito: boolean) {
  if (!cards.length || !apliqueFeito) return false;
  return cards.filter(c => c.caixa >= 4).length / cards.length >= 0.8;
}

export type EstadoCap = "não iniciado" | "lendo" | "concluído" | "dominado" | "revisar";
export function estadoCapitulo(p: { concluido?: boolean; aplique_feito?: boolean } | undefined, cards: Card[]): EstadoCap {
  if (!p) return "não iniciado";
  if (!p.concluido) return "lendo";
  if (cards.some(c => c.caixa === 1 && c.ultimo_resultado === "nao")) return "revisar";
  return capituloDominado(cards, !!p.aplique_feito) ? "dominado" : "concluído";
}

export const MOTIVO_RITMO = "O espaçamento é parte do método: leia amanhã, depois de revisar hoje";
/** Trava do ritmo para abrir um capítulo NOVO (releitura nunca é bloqueada). */
export function ritmo(o: { jaIniciado: boolean; novosHoje: number; limite: number; revisoesVencidas: number }) {
  if (o.jaIniciado) return { liberado: true, motivo: null as string | null };
  const lim = Math.min(2, Math.max(1, o.limite));
  if (o.novosHoje >= lim) return { liberado: false, motivo: MOTIVO_RITMO };
  if (o.revisoesVencidas > 0) return { liberado: false, motivo: MOTIVO_RITMO };
  return { liberado: true, motivo: null };
}

/** Prova visível com todos concluídos; "pronta" 2 dias após o último. */
export function estadoProva(todosConcluidos: boolean, ultimoConcluido: string | null, agora = Date.now()) {
  if (!todosConcluidos || !ultimoConcluido) return { visivel: false, pronta: false };
  return { visivel: true, pronta: agora - new Date(ultimoConcluido).getTime() >= 2 * DIA };
}
export const PROVA_MIN = 70;
export const provaAprovada = (nota: number) => nota >= PROVA_MIN;
export const podeRefazerProva = (ultima: string | null, agora = Date.now()) => !ultima || agora - new Date(ultima).getTime() >= DIA;

export type QItem = { id: string; chapter_slug: string; pergunta: string; opcoes: string[]; correta: number; explicacao?: string };
function rng(seed: number) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
function embaralhar<T>(a: T[], r: () => number) { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

/** Questões do checkpoint do capítulo: exclui as marcadas com uso "prova". */
export const questoesCheckpoint = <T extends { uso?: string }>(quiz: T[]) => (quiz ?? []).filter(q => q.uso !== "prova");
/** Tamanho da prova: mínimo entre 12 e o total disponível (checkpoint + uso "prova"). */
export const tamanhoProva = (disponiveis: number) => Math.min(12, Math.max(0, disponiveis));
/** Acertos exigidos: 70% arredondado para cima. */
export const acertosParaAprovar = (n: number) => Math.ceil(n * PROVA_MIN / 100);

/** min(12, total) questões do módulo, em ordem misturada; prefere questões não usadas
 *  na última tentativa e nunca repete a mesma ordem de uma tentativa anterior. */
export function montarProva(doModulo: QItem[], tentativas: string[][], seed = Date.now()) {
  const r = rng(seed);
  const ultima = new Set(tentativas[tentativas.length - 1] ?? []);
  const novas = embaralhar(doModulo.filter(q => !ultima.has(q.id)), r), velhas = embaralhar(doModulo.filter(q => ultima.has(q.id)), r);
  const base = [...novas, ...velhas].slice(0, tamanhoProva(doModulo.length));
  const vistas = new Set(tentativas.map(t => t.join("|")));
  let out = embaralhar(base, r);
  for (let i = 0; i < 20 && base.length > 1 && vistas.has(out.map(q => q.id).join("|")); i++) out = embaralhar(base, r);
  return out;
}
export const notaProva = (acertos: number, total: number) => (total ? Math.round((acertos / total) * 100) : 0);
export const provaPassouAcertos = (acertos: number, total: number) => total > 0 && acertos >= acertosParaAprovar(total);

/** Projeto: "Entregar" exige plano e balanço escritos e a rubrica toda avaliada.
 *  Se houver medição de dias de revisão, exige também 3 dias distintos. */
export function podeEntregarProjeto(o: { plano: string; balanco: string; rubrica: string[]; av: Record<string, number>; diasRevisao: number | null }) {
  if (!o.plano.trim() || !o.balanco.trim()) return false;
  if (!o.rubrica.every(r => typeof o.av[r] === "number")) return false;
  return o.diasRevisao == null || o.diasRevisao >= 3;
}

/** Recursos futuros: cada botão só aparece quando o recurso existir. */
export const RECURSOS = { revisaoProjeto: false, mentor: false, salaPesquisa: false };

/** Selo interno: prova aprovada + projeto entregue. */
export const seloModulo = (melhorNota: number | null, projetoEntregue: boolean) => melhorNota != null && provaAprovada(melhorNota) && projetoEntregue;
export const SELO_TEXTO = "Selo interno de progresso. Não é certificação formal.";

/** Leitura ativa: só conta com a aba visível e com interação nos últimos 60s. */
export const leituraAtiva = (visivel: boolean, ultimaInteracao: number, agora = Date.now()) => visivel && agora - ultimaInteracao <= 60e3;

export function diasSeguidosEstudo(datas: string[], hoje: string) {
  const s = new Set(datas); let n = 0; let d = new Date(hoje + "T12:00:00Z");
  if (!s.has(hoje)) d = new Date(d.getTime() - DIA);
  while (s.has(d.toISOString().slice(0, 10))) { n++; d = new Date(d.getTime() - DIA); }
  return n;
}

export type Nota = { chapter_slug: string; bloco_idx: number; tipo: string; trecho: string | null; texto: string | null; created_at: string };
export function notasMarkdown(notas: Nota[], titulos: Record<string, string>) {
  const g: Record<string, Nota[]> = {};
  for (const n of notas) (g[n.chapter_slug] ??= []).push(n);
  const rot: Record<string, string> = { nota: "Nota", destaque: "Marcação", duvida: "Dúvida" };
  return "# Minhas notas\n\n" + Object.entries(g).map(([slug, ns]) => `## ${titulos[slug] ?? slug}\n\n` + ns
    .sort((a, b) => a.bloco_idx - b.bloco_idx || a.created_at.localeCompare(b.created_at))
    .map(n => `- **${rot[n.tipo] ?? n.tipo}**${n.trecho ? `: > ${n.trecho.replace(/\n/g, " ")}` : ""}${n.texto ? `\n  ${n.texto}` : ""}`).join("\n")).join("\n\n") + "\n";
}

/** Capítulo que explica uma aula curta (para o Caderno de erros). */
export const capituloDaAula = (lessonSlug: string | null, caps: { slug: string; titulo: string; relacionadas?: string[] }[]) =>
  lessonSlug ? caps.find(c => (c.relacionadas ?? []).includes(lessonSlug)) ?? null : null;
