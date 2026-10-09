// Regras do Gerador de Cortes (sem chamadas externas). Tipos A (dado), B (texto) e D (diagrama) são renderizados por código.
export type CutTipo = "dado" | "texto" | "ilustracao" | "diagrama";
export interface CutSuggestion { bloco: string; tempo: string; tipo: CutTipo; duracao: number; texto: string; fonte: string | null; descricao: string; itens: string[] }

const s = (v: any): string => typeof v === "string" ? v : v == null ? "" : typeof v === "object" ? String(v.texto ?? v.text ?? v.acao ?? "") : String(v);
const NUM = /(\d+[.,]?\d*\s*(%|x|kg|g|kcal|mg|h|horas|dias|semanas|vezes))|\b\d{2,}\b/i;
const DIAGRAM = /(passo|etapa|mecanismo|processo|ciclo|lista|compar|vs\.?|versus|→|->|primeiro|segundo)/i;
const ILLUS = /(ilustra|conceito|metáfora|analogia|imagine|imagem)/i;

export function blockStart(tempo: string): number { const m = String(tempo).match(/(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : 0; }

/** Fonte só existe se o roteiro trouxe uma — nunca inventamos autor, ano ou revista. */
export function blockSource(b: any): string | null {
  const f = s(b?.fonte ?? b?.referencia ?? b?.evidencia).trim();
  return f.length >= 4 ? f : null;
}

export function suggestCut(b: any): CutSuggestion {
  const texto = (s(b?.texto_tela) || s(b?.fala)).trim().slice(0, 90);
  const blob = `${s(b?.fala)} ${s(b?.texto_tela)} ${s(b?.estimulo_visual)} ${s(b?.funcao)}`;
  const fonte = blockSource(b);
  let tipo: CutTipo = "texto";
  if (NUM.test(blob) && fonte) tipo = "dado";
  else if (DIAGRAM.test(blob)) tipo = "diagrama";
  else if (ILLUS.test(s(b?.estimulo_visual))) tipo = "ilustracao";
  const itens = s(b?.fala).split(/[.;→]|->/).map(x => x.trim()).filter(x => x.length > 2).slice(0, 4);
  const funcao = s(b?.funcao).toLowerCase();
  const duracao = funcao.includes("parada") || funcao.includes("cta") ? 2 : 3;
  return { bloco: String(b?.id ?? ""), tempo: String(b?.tempo ?? ""), tipo, duracao, texto, fonte, descricao: s(b?.estimulo_visual) || texto, itens };
}

/** Blocos elegíveis: com texto aproveitável; CTA fica com o rosto do criador. Padrão 4 a 6 por reel. */
export function eligibleCuts(blocks: any[], max = 6): CutSuggestion[] {
  return blocks.filter(b => !/cta/i.test(s(b?.funcao))).map(suggestCut).filter(c => c.texto.length >= 3).slice(0, max);
}

export function cutFileName(index: number, tempo: string): string {
  const t = String(tempo).replace(/\s+/g, "").replace(/[–—]/g, "-").replace(/[^0-9.\-s]/g, "") || "0s";
  return `${String(index + 1).padStart(2, "0")}_${t.endsWith("s") ? t : t + "s"}.png`;
}

export function cutsCsv(rows: { file: string; bloco: string; tempo: string; tipo: string; duracao: number; texto: string }[]): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const head = ["arquivo", "bloco", "tempo_do_bloco", "inicio_seg", "duracao_seg", "tipo", "texto_na_tela"].join(",");
  return [head, ...rows.map(r => [r.file, r.bloco, r.tempo, blockStart(r.tempo), r.duracao, r.tipo, r.texto].map(esc).join(","))].join("\n");
}
