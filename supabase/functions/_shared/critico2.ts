// Crítico 2 (adversário): separate call that sees ONLY the final script and the rubric — never the Writer's
// reasoning or Crítico 1's notes. Final per-block note = min(Crítico 1, Crítico 2, Verifier ceiling).
export const CRITICO2_PROMPT = `Você é um editor severo. Encontre os 3 pontos mais fracos do roteiro. Dê nota de 0 a 10 por bloco. Nota 9 ou 10 só para bloco com elemento concreto (situação nomeada, objeto, ação ou número com fonte). Afirmação factual sem fonte listada: máximo 6. Regra universal de alimentação, treino ou suplemento sem fonte: máximo 5. CTA sem entrega concreta: máximo 6.
Para cada ponto fraco informe bloco, trecho exato, regra quebrada e gravidade: 'critico' para afirmação factual sem fonte, linguagem absoluta, promessa de resultado garantido, tema de dor ou lesão sem ressalva ou risco à segurança; 'moderado' para falha que derruba atenção ou clareza; 'leve' para ajuste fino. Avalie também a antítese 'Não é X. É Y.' quando X for um fator central: decida a gravidade.
Responda SOMENTE JSON: {"pontos_fracos":[{"bloco":0,"frase":"","regra":"","gravidade":"critico|moderado|leve","problema":""}],"notas_por_bloco":[{"bloco":0,"nota":0}]}`;
export const CRITICO2_LENIENTE = "\n\nO Crítico 1 foi leniente. Seja mais duro.";
/** Share of blocks at 9-10 that triggers the inflation detector (Crítico 1) and the hard cap on the final notes. */
export const INFLACAO_GATILHO = 0.5, INFLACAO_MAX = 0.4;

export type C2Block = { id: number; tempo: string; fala: string; texto_tela?: string };
export type PontoFraco = { bloco: number; frase: string; problema: string; regra: string; gravidade: "critico" | "moderado" | "leve" };
export type Critico2 = { pontos_fracos: PontoFraco[]; notas: Map<number, number>; leniente: boolean; nota_geral: number | null };
const GRAV = ["critico", "moderado", "leve"];

const s = (v: unknown, n = 300) => typeof v === "string" ? v.trim().slice(0, n) : "";

export function parseCritico2(raw: any, blocks: C2Block[], leniente = false): Critico2 {
  const ids = new Set(blocks.map(b => b.id));
  const notas = new Map<number, number>();
  for (const n of Array.isArray(raw?.notas_por_bloco) ? raw.notas_por_bloco : []) {
    const id = Number(n?.bloco ?? n?.id), v = Number(n?.nota);
    if (ids.has(id) && Number.isFinite(v)) notas.set(id, Math.max(0, Math.min(10, v)));
  }
  const pontos_fracos = (Array.isArray(raw?.pontos_fracos) ? raw.pontos_fracos : [])
    .map((p: any) => { const g = s(p?.gravidade, 20).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return { bloco: Number(p?.bloco ?? p?.id), frase: s(p?.frase ?? p?.trecho), problema: s(p?.problema), regra: s(p?.regra, 120), gravidade: (GRAV.includes(g) ? g : "moderado") as PontoFraco["gravidade"] }; })
    .filter((p: any) => ids.has(p.bloco) && (p.frase || p.problema)).slice(0, 3);
  const vals = [...notas.values()];
  const nota_geral = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null;
  return { pontos_fracos, notas, leniente, nota_geral };
}

export const inflado = (notas: number[]) => notas.length > 0 && notas.filter(n => n >= 9).length / notas.length >= INFLACAO_GATILHO;

/** Runs Crítico 2; reruns harder when Crítico 1 inflated (>=50% of blocks at 9-10). */
export async function rodarCritico2(call: (system: string, input: unknown) => Promise<Record<string, unknown>>, blocks: C2Block[], rubrica: string, notasC1: number[]) {
  const input = { rubrica, roteiro: blocks.map(b => ({ bloco: b.id, tempo: b.tempo, fala: b.fala, texto_tela: b.texto_tela ?? "" })) };
  const leniente = inflado(notasC1);
  const raw = await call(CRITICO2_PROMPT + (leniente ? CRITICO2_LENIENTE : ""), input);
  return parseCritico2(raw, blocks, leniente);
}

/** Final cap: at most 40% of blocks may stay at 9-10; the extra ones (lowest first) drop to 8. Returns ids changed. */
export function limitarInflacao<T extends { id: number; nota: number }>(notas: T[]): number[] {
  const altos = notas.filter(n => n.nota >= 9).sort((a, b) => b.nota - a.nota);
  const max = Math.floor(notas.length * INFLACAO_MAX);
  const cortar = altos.slice(max);
  for (const n of cortar) n.nota = 8;
  return cortar.map(n => n.id);
}
