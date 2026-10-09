// Verificador em código (PROMPT K1, Passo 3): no model, applies score ceilings per block and records why.
export type VerifyBlock = { id: number; tempo: string; fala: string; texto_tela?: string };
export type VerifyOpts = { proibidas: string[]; tipoAfirmacao?: string | null; temFonte: boolean };
export type VerifyResult = { id: number; teto: number; motivos: string[]; riscos: string[]; avisos: string[]; forcar_reescrita: boolean };

export const VERIFICADOR_REGRAS = [
  "Saudação no início (oi, olá, e aí, fala, bom dia, boa noite, galera, pessoal): teto 3",
  "'hoje eu vou', 'você sabia', 'vou te mostrar', 'nesse vídeo': teto 3",
  "Abertura (bloco de 0 a 2s) com mais de 12 palavras: teto 5",
  "Qualquer frase com mais de 14 palavras: teto 7",
  "Termo da lista de palavras proibidas: teto 5",
  "'siga', 'segue o perfil', 'me segue': teto 3, exceto se o bloco citar a próxima parte de uma série",
  "Número, percentual, 'estudo', 'pesquisa' ou 'meta-análise' sem achado científico com fonte: risco 'dado sem fonte' e reescrita obrigatória",
  "'prova', 'garante', 'nunca', 'sempre', 'todo mundo': aviso 'linguagem absoluta'",
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const words = (s: string) => s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));
const stripMarks = (s: string) => s.replace(/\[[^\]]*\]/g, " ");
const has = (text: string, terms: string[]) => terms.find(t => new RegExp(`(^|[^\\p{L}])${norm(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}]|$)`, "u").test(text));

const SAUDACAO = /^\s*(oi|ola|e ai|fala|bom dia|boa noite|boa tarde|galera|pessoal)\b/;
const CLICHE = ["hoje eu vou", "voce sabia", "vou te mostrar", "nesse video", "neste video"];
const SIGA = ["siga", "segue o perfil", "me segue", "me siga", "sigam"];
const SERIE = /(parte\s*\d|proxima parte|amanha tem|episodio\s*\d|continua amanha)/;
const DADO = /(\d|%|\bestudos?\b|\bpesquisas?\b|meta-?analise)/;
const ABSOLUTA = ["prova", "garante", "nunca", "sempre", "todo mundo"];

const startsAtZero = (tempo: string) => /^\s*0(?:[.,]0+)?\s*(s|[-–])/.test(tempo);

export function verificarBloco(b: VerifyBlock, idx: number, o: VerifyOpts): VerifyResult {
  const raw = stripMarks(`${b.fala}`);
  const t = norm(raw);
  const r: VerifyResult = { id: b.id, teto: 10, motivos: [], riscos: [], avisos: [], forcar_reescrita: false };
  const cap = (n: number, m: string) => { r.teto = Math.min(r.teto, n); r.motivos.push(`${m} (teto ${n})`); };
  const abertura = idx === 0 || startsAtZero(b.tempo);
  if (abertura && SAUDACAO.test(t)) cap(3, "Saudação no início");
  const c = has(t, CLICHE); if (c) cap(3, `Abertura proibida: "${c}"`);
  if (abertura && words(raw).length > 12) cap(5, `Abertura com ${words(raw).length} palavras (máx. 12)`);
  const longa = raw.split(/[.!?…]+/).map(s => words(s).length).find(n => n > 14);
  if (longa) cap(7, `Frase com ${longa} palavras (máx. 14)`);
  const p = has(t, o.proibidas.filter(Boolean)); if (p) cap(5, `Termo proibido: "${p}"`);
  const s = has(t, SIGA); if (s && !SERIE.test(t)) cap(3, `Pedido de seguir: "${s}"`);
  if (DADO.test(t) && !(o.tipoAfirmacao === "achado_cientifico" && o.temFonte)) { r.riscos.push("dado sem fonte"); r.forcar_reescrita = true; r.motivos.push("Dado sem fonte: reescrever sem número ou como posição do Método"); }
  const a = has(t, ABSOLUTA); if (a) r.avisos.push(`linguagem absoluta: "${a}"`);
  return r;
}

export const verificarReel = (blocks: VerifyBlock[], o: VerifyOpts) => blocks.map((b, i) => verificarBloco(b, i, o));

/** Broad theme: equals a pillar name, under 4 words, or no verb-like word. */
export function temaAmplo(tema: string, pilares: string[] = []): boolean {
  const t = norm(tema.trim());
  if (pilares.some(p => norm(p.trim()) === t)) return true;
  const w = words(t);
  if (w.length < 4) return true;
  const verbo = w.some(x => /(ar|er|ir|or|am|em|ou|ei|ia|ava|ando|endo|indo|ado|ido|a|e)$/.test(x) && x.length > 3 && !/(cao|dade|mento)$/.test(x));
  return !verbo;
}

export const parseProibidas = (txt: string) => txt.split("\n").map(s => s.trim()).filter(Boolean);
