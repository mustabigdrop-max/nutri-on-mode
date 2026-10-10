// Verificador em código (PROMPT K1, Passo 3): no model, applies score ceilings per block and records why.
export type VerifyBlock = { id: number; tempo: string; fala: string; texto_tela?: string };
export type VerifyOpts = { proibidas: string[]; tipoAfirmacao?: string | null; temFonte: boolean; ultimo?: boolean; fatores?: string[]; numerosFonte?: string[]; naoDizer?: string[] };
export type Gravidade = "critico" | "moderado" | "leve";
export type Pendencia = { bloco: number; regra: string; gravidade: Gravidade; trecho: string; origem: "verificador" | "critico1" | "critico2" };
export type VerifyResult = { id: number; teto: number; motivos: string[]; riscos: string[]; avisos: string[]; forcar_reescrita: boolean; pendencias: Pendencia[] };

export const VERIFICADOR_REGRAS = [
  "Saudação no início (oi, olá, e aí, fala, bom dia, boa noite, galera, pessoal): teto 3",
  "'hoje eu vou', 'você sabia', 'vou te mostrar', 'nesse vídeo': teto 3",
  "Abertura (bloco de 0 a 2s) com mais de 12 palavras: teto 5",
  "Qualquer frase com mais de 14 palavras: teto 7",
  "Termo da lista de palavras proibidas: teto 5",
  "'siga', 'segue o perfil', 'me segue': teto 3, exceto se o bloco citar a próxima parte de uma série",
  "Número, percentual, 'estudo', 'pesquisa' ou 'meta-análise' sem achado científico com fonte: risco 'dado sem fonte' e reescrita obrigatória",
  "Linguagem absoluta (nunca mais, jamais, sempre, garante, garantido, 100%, ninguém, comprovado, 'prova que', 'todo mundo', 'toda a', 'todo o', 'todas as', 'todos os', '(nunca|não) + até 2 palavras + mais'): teto 7 e pendência crítica. Frequência ('toda segunda', 'todo dia', 'toda semana', 'todo treino') não conta",
  "Dizer que um erro 'causa' lesão ou que algo 'garante' segurança: teto 7 e pendência crítica",
  "Dor, lesão, hérnia, inflamação ou risco sem bloco de Ressalva (até 12 palavras, antes do CTA): teto 7 e pendência crítica 'sem_ressalva'",
  "'Não é (sobre) X. É Y.' com X sendo fator central (carga, dieta, treino, proteína, calorias, sono): aviso de antítese",
  "Último bloco (CTA) sem motivo ('pra', 'para', 'porque', 'que eu te mando'): teto 6",
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
/** Words after "toda/todo" that make it a frequency, not an absolute. */
const PERIODO = /^(segundas?|tercas?|quartas?|quintas?|sextas?|sabados?|domingos?|dias?|semanas?|mes|meses|manhas?|tardes?|noites?|treinos?|anos?|horas?|refeic\w*|vez|vezes|fim|final)$/;
const ABS_FIXAS: [RegExp, string][] = [
  [/\bnunca mais\b/g, "nunca mais"], [/\bjamais\b/g, "jamais"], [/\bsempre\b/g, "sempre"],
  [/\bgarant(e|em|ido|ida|idos|idas|ia)\b/g, "garante"], [/100\s?%/g, "100%"], [/\bninguem\b/g, "ninguém"],
  [/\bcomprovad[oa]s?\b/g, "comprovado"], [/\bprova que\b/g, "prova que"], [/\btodo mundo\b/g, "todo mundo"],
];
/** Absolute-language hits (normalized text). Frequency phrases like "toda segunda" are exempt. */
export function linguagemAbsoluta(textoNorm: string): string[] {
  const t = textoNorm, out: string[] = [];
  for (const [re, nome] of ABS_FIXAS) for (const _ of t.matchAll(re)) out.push(nome);
  for (const m of t.matchAll(/\b(toda|todo|todas|todos)\s+(a|o|as|os)\s+([\p{L}]+)/gu)) if (!PERIODO.test(m[3])) out.push(`${m[1]} ${m[2]} ${m[3]}`);
  for (const m of t.matchAll(/\b(nunca|nao)\s+((?:[\p{L}]+\s+){0,2})mais\b/gu)) if (!(m[1] === "nunca" && !m[2])) out.push(m[0]);
  return out;
}
const CAUSA_LESAO = /\b(causa|causam|causar|provoca|provocam)\s+(uma\s+|a\s+)?(lesao|lesoes|hernia|dor|dores|machucado)|\bgarant\w*\s+(a\s+)?seguranca/;
export const DOR = /\b(dor|dores|doi|doem|doer|doendo|lesao|lesoes|lesion\w*|machuca\w*|hernia\w*|inflama\w*|rim|rins|renal|doenca\w*)\b/;
const RESSALVA = /\b(procure|procura|consulte|fale com|busque|converse com)\b[^.!?]*\b(profissional|medic\w*|fisioterapeuta|nutricionista|especialista)\b/;
const CTA_MOTIVO = /\b(pra|para|porque|que eu te mando|que eu mando)\b/;
export const FATORES_PADRAO = ["carga", "dieta", "treino", "proteina", "calorias", "sono"];

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
  const r: VerifyResult = { id: b.id, teto: 10, motivos: [], riscos: [], avisos: [], forcar_reescrita: false, pendencias: [] };
  const cap = (n: number, m: string) => { r.teto = Math.min(r.teto, n); r.motivos.push(`${m} (teto ${n})`); };
  const pend = (regra: string, gravidade: Gravidade, trecho: string) => r.pendencias.push({ bloco: b.id, regra, gravidade, trecho, origem: "verificador" });
  const abertura = idx === 0 || startsAtZero(b.tempo);
  if (abertura && SAUDACAO.test(t)) cap(3, "Saudação no início");
  const c = has(t, CLICHE); if (c) cap(3, `Abertura proibida: "${c}"`);
  if (abertura && words(raw).length > 12) cap(5, `Abertura com ${words(raw).length} palavras (máx. 12)`);
  const longa = raw.split(/[.!?…]+/).map(s => words(s).length).find(n => n > 14);
  if (longa) cap(7, `Frase com ${longa} palavras (máx. 14)`);
  const p = termoProibido(raw, o.proibidas); if (p) cap(5, `Termo proibido: "${p}"`);
  const u = t.match(REGRA_UNIVERSAL);
  if (u && !o.temFonte) { cap(5, `Regra universal sem fonte: "${u[0]}". Use linguagem condicional ou pesquise antes`); r.riscos.push("regra universal sem fonte"); r.forcar_reescrita = true; pend("regra_universal_sem_fonte", "critico", u[0]); }
  for (const a of linguagemAbsoluta(t)) { cap(7, `Linguagem absoluta: "${a}"`); pend("linguagem_absoluta", "critico", a); }
  const cl = t.match(CAUSA_LESAO); if (cl) { cap(7, `Causalidade de lesão ou garantia de segurança: "${cl[0]}". Use "pode sobrecarregar", "costuma"`); pend("causalidade_lesao", "critico", cl[0]); }
  const nd = (o.naoDizer ?? []).map(x => norm(x).replace(/[.!?]+$/, "").trim()).find(x => x.length > 5 && t.includes(x));
  if (nd) { cap(5, `Frase da lista "não dizer" do tema: "${nd}"`); pend("nao_dizer", "critico", nd); }
  const fat = (o.fatores?.length ? o.fatores : FATORES_PADRAO).map(norm);
  const an = t.match(/\bnao e (sobre )?(a |o |as |os )?([\p{L}]+)[^.!?]*[.!?]\s*e\b/u);
  if (an && fat.includes(an[3])) { r.avisos.push(`antítese com fator central: "${an[0]}"`); pend("antitese_fator_central", "leve", an[0]); }
  if (o.ultimo && !CTA_MOTIVO.test(t)) { cap(6, "CTA sem motivo: diga pra quê (pra, para, porque, que eu te mando)"); pend("cta_sem_motivo", "moderado", raw.slice(0, 80)); }
  if (CTA_COMENTA.test(t) && !CTA_ENTREGA.test(t)) cap(6, "CTA sem entrega: use 'Comenta X que eu mando/mostro Y'");
  const s = has(t, SIGA); if (s && !SERIE.test(t)) { cap(3, `Pedido de seguir: "${s}"`); pend("cta_siga", "moderado", s); }
  // Técnica de execução is a method position: bare numbers (reps, seconds) are allowed, studies and % are not.
  const dado = o.tipoAfirmacao === "tecnica_de_execucao" ? /(%|\bestudos?\b|\bpesquisas?\b|meta-?analise)/ : DADO;
  // Q2: with verified sources, every number in the block must exist in a prova field.
  const numsOk = !o.numerosFonte || (t.match(/\d+(?:[.,]\d+)?/g) ?? []).every(d => o.numerosFonte!.includes(d));
  if (dado.test(t) && !(o.tipoAfirmacao === "achado_cientifico" && o.temFonte && numsOk)) { r.riscos.push("dado sem fonte"); r.forcar_reescrita = true; r.motivos.push("Dado sem fonte: reescrever sem número ou como posição do Método"); pend("dado_sem_fonte", "critico", (t.match(dado) ?? [""])[0]); }
  if (r.teto === 10 && !(/\d/.test(t) && o.temFonte && numsOk)) r.teto = 9; // 10 only with sourced concrete number
  const a = has(t, ABSOLUTA); if (a) r.avisos.push(`linguagem absoluta: "${a}"`);
  return r;
}

const isRessalva = (b: VerifyBlock & { funcao?: string }) => /ressalva/i.test(b.funcao ?? "") || (RESSALVA.test(norm(stripMarks(b.fala))) && words(stripMarks(b.fala)).length <= 12);

/** Per-block checks plus reel-level ones: last block is the CTA; pain/injury needs a Ressalva block before it. */
export function verificarReel(blocks: (VerifyBlock & { funcao?: string })[], o: VerifyOpts): VerifyResult[] {
  const out = blocks.map((b, i) => verificarBloco(b, i, { ...o, ultimo: i === blocks.length - 1 && blocks.length > 1 }));
  const comDor = blocks.findIndex(b => DOR.test(norm(stripMarks(`${b.fala} ${b.texto_tela ?? ""}`))));
  const ress = blocks.findIndex(isRessalva);
  if (comDor >= 0 && (ress < 0 || (blocks.length > 1 && ress === blocks.length - 1))) {
    const r = out[comDor];
    r.teto = Math.min(r.teto, 7); r.motivos.push("Tema de dor, lesão ou risco sem bloco de Ressalva antes do CTA (teto 7)");
    r.pendencias.push({ bloco: r.id, regra: "sem_ressalva", gravidade: "critico", trecho: (norm(blocks[comDor].fala).match(DOR) ?? [""])[0], origem: "verificador" });
  }
  return out;
}

/** Verifier ceiling for the gate: lowest rule-based ceiling (10 when no rule fired). */
export const tetoVerificador = (v: VerifyResult[]) => v.reduce((m, r) => r.motivos.some(x => /teto \d/.test(x)) ? Math.min(m, r.teto) : m, 10);

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
