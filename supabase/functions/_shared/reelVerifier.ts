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
  "Regra universal ('compre apenas', 'fuja de', 'nunca coma', 'elimine', 'o vilão'...) sem fonte verificada: teto 5 e risco 'regra universal sem fonte'",
  "Variações de frases proibidas ('ninguém te conta/contou/fala', 'o que ninguém', 'segredo', 'milagre', 'truque infalível'): teto 5",
  "CTA 'comenta X' sem entrega ('que eu mando/mostro Y'): teto 6",
  "Nota 10 só com número que tenha fonte verificada; sem isso, máximo 9",
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

const REGRA_UNIVERSAL = /\b(compre (apenas|somente|so)|fuja d[eoa]s?|nunca coma|nunca beba|evite sempre|corte completamente|elimine|eliminar|proibid[oa]s?|regra de ouro|o vilao|a vila|armadilha)\b/;
/** Forbidden phrases matched by stem after normalizing (lowercase, no accents). */
export const PROIBIDAS_RADICAL: [RegExp, string][] = [
  [/ninguem (te |lhe |nunca )?(cont|fal|diz|diss)\w*/, "ninguém te conta"],
  [/o que ninguem/, "o que ninguém"],
  [/\bsegred\w*/, "segredo"],
  [/\bmilagr\w*/, "milagre"],
  [/\btruques? infaliv\w*/, "truque infalível"],
];
export function termoProibido(texto: string, proibidas: string[] = []): string | null {
  const t = norm(stripMarks(texto));
  for (const [re, nome] of PROIBIDAS_RADICAL) if (re.test(t)) return nome;
  return has(t, proibidas.filter(Boolean)) ?? null;
}
const CTA_COMENTA = /\bcomenta(r|m)?\s+["'“]?[\p{L}\p{N}]+/u;
const CTA_ENTREGA = /\bque (eu )?(te )?(mando|mostro|envio|passo|entrego|mando no direct)\b/;

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
  const p = termoProibido(raw, o.proibidas); if (p) cap(5, `Termo proibido: "${p}"`);
  const u = t.match(REGRA_UNIVERSAL);
  if (u && !o.temFonte) { cap(5, `Regra universal sem fonte: "${u[0]}". Use linguagem condicional ou pesquise antes`); r.riscos.push("regra universal sem fonte"); r.forcar_reescrita = true; }
  if (CTA_COMENTA.test(t) && !CTA_ENTREGA.test(t)) cap(6, "CTA sem entrega: use 'Comenta X que eu mando/mostro Y'");
  const s = has(t, SIGA); if (s && !SERIE.test(t)) cap(3, `Pedido de seguir: "${s}"`);
  if (DADO.test(t) && !(o.tipoAfirmacao === "achado_cientifico" && o.temFonte)) { r.riscos.push("dado sem fonte"); r.forcar_reescrita = true; r.motivos.push("Dado sem fonte: reescrever sem número ou como posição do Método"); }
  if (r.teto === 10 && !(/\d/.test(t) && o.temFonte)) r.teto = 9; // 10 only with sourced concrete number
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
