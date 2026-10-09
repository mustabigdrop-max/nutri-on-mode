// PROMPT Q1 — porta de qualidade (pure, no model). Shared by gerar_reel and the app.
import type { Pendencia, Gravidade } from "./reelVerifier.ts";

export const GATE = { aprovado: 9.0, elite: 9.5, maxRodadasPorAngulo: 3, maxAngulos: 3, maxChamadas: 14 } as const;
export type Estado = "elite" | "aprovado" | "rascunho";

const r1 = (n: number) => Math.round(n * 10) / 10;

/** nota_final = min(Crítico 1 geral, Crítico 2 geral, teto do Verificador). Missing critic notes count as 0. */
export function notaFinal(c1: number | null, c2: number | null, teto: number): number {
  return r1(Math.min(c1 ?? 0, c2 ?? 0, teto));
}

export function estadoQualidade(nota: number, pendencias: { gravidade: Gravidade; origem?: string }[]): Estado {
  const criticas = pendencias.filter(p => p.gravidade === "critico").length;
  const bloqueio = pendencias.some(p => p.origem === "verificador" && p.gravidade === "critico");
  if (nota >= GATE.elite && pendencias.length === 0) return "elite";
  if (nota >= GATE.aprovado && criticas === 0 && !bloqueio) return "aprovado";
  return "rascunho";
}

/** Crítico 1 content risks become pendências; graves (source, absolute, promise, pain, safety) are critical. */
export function riscoGravidade(risco: string): Gravidade {
  return /fonte|absolut|promess|garant|ressalva|segur|lesao|lesão|dor\b|risco/i.test(risco) ? "critico" : "moderado";
}

export function juntarPendencias(ver: Pendencia[], c1Riscos: { id: number; risco: string }[], c2: { bloco: number; frase: string; regra: string; gravidade: Gravidade; problema: string }[]): Pendencia[] {
  const out: Pendencia[] = [...ver];
  const seen = new Set(ver.map(p => `${p.bloco}|${p.regra}`));
  for (const r of c1Riscos) {
    const regra = String(r.risco).slice(0, 120);
    if (!regra || [...seen].some(k => k.startsWith(`${r.id}|`) && /fonte/.test(regra) && /fonte/.test(k))) continue;
    if (seen.has(`${r.id}|${regra}`)) continue; seen.add(`${r.id}|${regra}`);
    out.push({ bloco: r.id, regra, gravidade: riscoGravidade(regra), trecho: "", origem: "critico1" });
  }
  for (const p of c2) out.push({ bloco: p.bloco, regra: p.regra || p.problema || "ponto fraco", gravidade: p.gravidade, trecho: p.frase, origem: "critico2" });
  return out;
}

/** Blocks the Revisor may touch: any pendência or final block note below 9. */
export function blocosParaRevisar(notas: { id: number; nota: number }[], pend: Pendencia[]): number[] {
  const ids = new Set(pend.map(p => p.bloco));
  for (const n of notas) if (n.nota < 9) ids.add(n.id);
  return [...ids].sort((a, b) => a - b);
}

type RevBlock = { id: number; tempo: string; funcao: string; fala: string; texto_tela: string; estimulo_visual: string; gatilho: string };
const digits = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []);

/**
 * Applies the Revisor output in code: only allowed ids change, no new numbers may appear,
 * an optional Ressalva block is inserted before the given id, and ids are renumbered 1..n.
 */
export function aplicarRevisao(blocks: RevBlock[], out: any, permitidos: number[]) {
  const mudancas: { id: number; antes: string; depois: string; regra: string; motivo: string }[] = [];
  const rejeitadas: { id: number; motivo: string }[] = [];
  for (const a of Array.isArray(out?.blocos_alterados) ? out.blocos_alterados : []) {
    const id = Number(a?.id); const b = blocks.find(x => x.id === id);
    const depois = typeof a?.depois === "string" ? a.depois.trim().slice(0, 1000) : "";
    if (!b || !depois || depois === b.fala) continue;
    if (!permitidos.includes(id)) { rejeitadas.push({ id, motivo: "bloco sem pendência: mantido igual" }); continue; }
    const novos = digits(depois).filter(d => !digits(b.fala).includes(d));
    if (novos.length) { rejeitadas.push({ id, motivo: `número novo (${novos.join(", ")}) não permitido` }); continue; }
    mudancas.push({ id, antes: b.fala, depois, regra: String(a?.regra ?? "").slice(0, 120), motivo: String(a?.motivo ?? "").slice(0, 300) });
    b.fala = depois;
  }
  for (const t of Array.isArray(out?.tempos) ? out.tempos : []) {
    const b = blocks.find(x => x.id === Number(t?.id)); const tempo = typeof t?.tempo === "string" ? t.tempo.trim().slice(0, 20) : "";
    if (b && tempo) b.tempo = tempo;
  }
  let inserido = false;
  for (const n of (Array.isArray(out?.blocos_novos) ? out.blocos_novos : []).slice(0, 1)) {
    const fala = typeof n?.fala === "string" ? n.fala.trim().slice(0, 300) : "";
    if (!fala || fala.split(/\s+/).length > 12 || digits(fala).length) continue;
    const idx = blocks.findIndex(x => x.id === Number(n?.antes_de));
    const at = idx >= 0 ? idx : Math.max(0, blocks.length - 1);
    blocks.splice(at, 0, { id: -1, tempo: String(n?.tempo ?? "").slice(0, 20), funcao: "ressalva", fala, texto_tela: String(n?.texto_tela ?? "").slice(0, 200), estimulo_visual: "", gatilho: "" });
    mudancas.push({ id: at + 1, antes: "", depois: fala, regra: "sem_ressalva", motivo: "Bloco de Ressalva criado antes do CTA" });
    inserido = true;
  }
  if (inserido) blocks.forEach((b, i) => { b.id = i + 1; });
  return { mudancas, rejeitadas };
}
