// Academia GRAVITAS (PROMPT N1): learning rules in code, shared by the app and edge functions. No model here.
import { verificarBloco, termoProibido } from "./reelVerifier.ts";

export const EIXOS_N1 = ["gancho", "figuras", "prova", "ritmo", "voz", "cta"] as const;
export type EixoN1 = typeof EIXOS_N1[number];

/** Axis each lesson trains (slug -> eixo). Unknown slugs fall back to keywords. */
export const EIXO_DA_AULA: Record<string, EixoN1> = {
  "t1-ethos-pathos-logos": "prova", "t1-cinco-canones": "voz", "t1-figuras": "figuras",
  "t2-lacuna": "gancho", "t2-narrativa": "prova", "t2-intencao-acao": "cta", "t2-porque": "cta",
  "t3-dois-segundos": "gancho", "t3-loop-aberto": "gancho", "t3-ritmo": "ritmo",
  "t4-voz": "voz", "t4-presenca": "voz", "t4-lote": "ritmo",
};
export function eixoDaAula(slug: string, titulo = ""): EixoN1 {
  if (EIXO_DA_AULA[slug]) return EIXO_DA_AULA[slug];
  const t = `${slug} ${titulo}`.toLowerCase();
  if (/gancho|abertura|segundo|lacuna/.test(t)) return "gancho";
  if (/figura|antitese|anafora/.test(t)) return "figuras";
  if (/ritmo|corte|lote/.test(t)) return "ritmo";
  if (/voz|camera|presenca/.test(t)) return "voz";
  if (/cta|acao|porque/.test(t)) return "cta";
  return "prova";
}

/** Minutes: 2 per 300 words of reading + 3 per exercise + 2 per quiz. */
export function tempoEstimado(l: { conceito?: string; no_reel?: string; fraco?: string; forte?: string; exercicio?: string }) {
  const w = [l.conceito, l.no_reel, l.fraco, l.forte, l.exercicio].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil((w / 300) * 2)) + (l.exercicio ? 3 : 0) + 2;
}

/** Error categories shown in "Meus erros", with the lesson that fixes each one. */
export const REGRAS = ["saudação", "abertura longa", "frase longa", "termo proibido", "siga antes do valor", "regra universal sem fonte", "CTA sem motivo"] as const;
export type Regra = typeof REGRAS[number];
export const AULA_DA_REGRA: Record<Regra, string> = {
  "saudação": "t3-dois-segundos", "abertura longa": "t3-dois-segundos", "frase longa": "t3-ritmo", "termo proibido": "t1-figuras",
  "siga antes do valor": "t2-intencao-acao", "regra universal sem fonte": "t1-ethos-pathos-logos", "CTA sem motivo": "t2-porque",
};
export function regraDoMotivo(m: string): Regra | null {
  const t = m.toLowerCase();
  if (/sauda/.test(t)) return "saudação";
  if (/abertura com|abertura proibida/.test(t)) return /proibida/.test(t) ? "saudação" : "abertura longa";
  if (/frase com \d+ palavras/.test(t)) return "frase longa";
  if (/termo proibido/.test(t)) return "termo proibido";
  if (/pedido de seguir/.test(t)) return "siga antes do valor";
  if (/regra universal/.test(t)) return "regra universal sem fonte";
  if (/cta sem entrega/.test(t)) return "CTA sem motivo";
  return null;
}

/** Practice check in code: 0-100 plus what is good and what to fix. */
export function verificarPratica(texto: string, proibidas: string[] = []) {
  const v = verificarBloco({ id: 1, tempo: "0-2s", fala: texto }, 0, { proibidas, temFonte: false });
  const regras = [...new Set(v.motivos.map(regraDoMotivo).filter((r): r is Regra => !!r))];
  const bons: string[] = [];
  if (!regras.includes("saudação")) bons.push("Sem saudação na abertura.");
  if (!regras.includes("abertura longa")) bons.push("Abertura com até 12 palavras.");
  if (!regras.includes("frase longa")) bons.push("Frases com até 14 palavras.");
  if (!regras.includes("termo proibido")) bons.push("Sem termo proibido.");
  const nota = texto.trim() ? Math.max(0, Math.min(100, v.teto * 10)) : 0;
  return { nota, bons, corrigir: v.motivos, regras, verificador: v };
}

/** Mastered only with practice >= 70 on 2 different days. */
export function dominada(scores: { dia: string; nota: number }[]) {
  return new Set(scores.filter(s => s.nota >= 70).map(s => s.dia)).size >= 2;
}
export function addScore(scores: { dia: string; nota: number }[], dia: string, nota: number) {
  return [...scores, { dia, nota }].slice(-20);
}

/** Axis mastery = last 10 notes, weighted by recency (newest weight 10 ... oldest 1). null = no practice. */
export function dominioEixos(items: { eixo: string; nota: number; created_at: string }[]): Record<EixoN1, number | null> {
  const out = {} as Record<EixoN1, number | null>;
  for (const e of EIXOS_N1) {
    const v = items.filter(i => i.eixo === e && Number.isFinite(i.nota)).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
    if (!v.length) { out[e] = null; continue; }
    let s = 0, w = 0; v.forEach((x, i) => { const k = 10 - i; s += x.nota * k; w += k; });
    out[e] = Math.round(s / w);
  }
  return out;
}
export function dominioGeral(d: Record<string, number | null>) {
  const v = Object.values(d).filter((x): x is number => x != null);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}
/** Levels by overall mastery; Retor and Mestre also need 8 mastered lessons. */
export function nivelPorDominio(geral: number | null, dominadas: number) {
  const g = geral ?? 0;
  if (g >= 80 && dominadas >= 8) return "Mestre";
  if (g >= 60 && dominadas >= 8) return "Retor";
  if (g >= 30) return "Orador";
  return "Ouvinte";
}
export const xpN1 = (aulas: number, tentativas70: number, revisoes: number) => aulas * 10 + tentativas70 * 5 + revisoes * 3;

/** 14-day plan: 1 lesson + 1 practice per day, weakest axis first, rest day after every 5 days (days 6 and 12). */
export function plano14(eixoFraco: EixoN1, lessons: { slug: string; trilha: string; ordem: number; titulo: string }[], inicio: string) {
  const ord = [...lessons].sort((a, b) => Number(eixoDaAula(b.slug, b.titulo) === eixoFraco) - Number(eixoDaAula(a.slug, a.titulo) === eixoFraco) || a.trilha.localeCompare(b.trilha) || a.ordem - b.ordem);
  const dias: { dia: number; data: string; descanso: boolean; aula: string | null; treino: string | null }[] = [];
  let k = 0;
  for (let d = 1; d <= 14; d++) {
    const data = new Date(new Date(`${inicio}T12:00:00Z`).getTime() + (d - 1) * 864e5).toISOString().slice(0, 10);
    if (d % 6 === 0) { dias.push({ dia: d, data, descanso: true, aula: null, treino: null }); continue; }
    const l = ord[k % Math.max(1, ord.length)]; k++;
    dias.push({ dia: d, data, descanso: false, aula: l?.slug ?? null, treino: l ? eixoDaAula(l.slug, l.titulo) : eixoFraco });
  }
  return dias;
}
export function eixoMaisFraco(acertos: Record<string, { ok: number; total: number }>): EixoN1 {
  let best: EixoN1 = "gancho", min = Infinity;
  for (const e of EIXOS_N1) { const a = acertos[e]; if (!a?.total) continue; const r = a.ok / a.total; if (r < min) { min = r; best = e; } }
  return best;
}
export const TRILHA_DO_EIXO: Record<EixoN1, string> = { gancho: "Atenção e retenção", figuras: "Retórica clássica", prova: "Persuasão com ciência", ritmo: "Atenção e retenção", voz: "Oratória na câmera", cta: "Persuasão com ciência" };

/** Spaced review: 1, 3, 7, 21 days. Error resets to 1 day. */
export const INTERVALOS = [1, 3, 7, 21] as const;
export const revisoesDaAula = (slug: string, now = new Date()) => INTERVALOS.map(d => ({ lesson_slug: slug, intervalo_dias: d, due_at: new Date(now.getTime() + d * 864e5).toISOString(), feita: false }));
export const revisaoAposErro = (slug: string, now = new Date()) => ({ lesson_slug: slug, intervalo_dias: 1, due_at: new Date(now.getTime() + 864e5).toISOString(), feita: false, acerto: null });

/** Error notebook: 2 correct rewrites in a row -> 'superado'. */
export function treinarErro(e: { acertos_seguidos: number }, acertou: boolean) {
  const n = acertou ? e.acertos_seguidos + 1 : 0;
  return { acertos_seguidos: n, status: n >= 2 ? "superado" : "aberto" };
}
/** Up to 3 notebook items per reel from verifier/critic reasons. */
export function errosDoReel(motivos: { id: number; regras?: string[] }[], blocos: { id: number; fala: string }[], max = 3) {
  const out: { frase: string; regra: Regra; correcao_sugerida: string; lesson_slug: string }[] = [];
  for (const m of motivos) for (const r of m.regras ?? []) {
    const regra = regraDoMotivo(r); const b = blocos.find(x => x.id === m.id);
    if (!regra || !b?.fala || out.some(o => o.regra === regra && o.frase === b.fala)) continue;
    out.push({ frase: b.fala.slice(0, 400), regra, correcao_sugerida: r, lesson_slug: AULA_DA_REGRA[regra] });
    if (out.length >= max) return out;
  }
  return out;
}

/** Techniques detected by rules (user confirms). */
export const TECNICAS = ["fórmula do Atlas", "antítese", "anáfora", "regra de três", "pergunta retórica", "prolepse", "se-então no CTA", "CTA com motivo", "pausa de ênfase"] as const;
const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export function detectarTecnicas(blocos: { fala: string }[], formulaNome?: string | null) {
  const out = new Set<string>();
  if (formulaNome) out.add("fórmula do Atlas");
  const falas = blocos.map(b => n(b.fala ?? ""));
  const all = falas.join(" \n ");
  const frs = all.split(/[.!?\n]+/).map(s => s.trim()).filter(Boolean);
  if (/\bnao (e|eh) [^,.]+[,.]? (e|mas) /.test(all) || /\bnao [^.]{2,40}\. (e|mas) /.test(all)) out.add("antítese");
  for (let i = 1; i < frs.length; i++) { const a = frs[i - 1].split(" ")[0], b = frs[i].split(" ")[0]; if (a && a.length > 2 && a === b) { out.add("anáfora"); break; } }
  if (/\b\w+, \w+ e \w+\b/.test(all)) out.add("regra de três");
  if (/\?/.test(blocos.map(b => b.fala).join(" "))) out.add("pergunta retórica");
  if (/(voce (vai|pode) (pensar|dizer)|eu sei que|mas e se)/.test(all)) out.add("prolepse");
  const ult = falas[falas.length - 1] ?? "";
  if (/\bse\b.*\b(comenta|salva|manda|compartilha)/.test(ult)) out.add("se-então no CTA");
  if (/comenta.*que (eu )?(te )?(mando|mostro|envio)|salva (pra|para) /.test(ult)) out.add("CTA com motivo");
  if (/\[(pausa|enfase)/i.test(blocos.map(b => b.fala).join(" "))) out.add("pausa de ênfase");
  return [...out];
}

/** "Nos seus dados": simple comparison, no causal claim. */
export function comparativoTecnica(tecnica: string, scripts: { id: string; tecnicas?: string[] | null }[], results: { script_id: string; pct_3s: number | null }[]) {
  const r3 = new Map(results.filter(r => Number.isFinite(Number(r.pct_3s))).map(r => [r.script_id, Number(r.pct_3s)]));
  const com: number[] = [], sem: number[] = [];
  for (const s of scripts) { const v = r3.get(s.id); if (v == null) continue; (Array.isArray(s.tecnicas) && s.tecnicas.includes(tecnica) ? com : sem).push(v); }
  const avg = (a: number[]) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10 : null;
  return { reels: com.length, com: avg(com), sem: avg(sem), selo: com.length === 0 ? null : com.length < 3 ? "Indício" : "Confirmado nos seus dados" };
}
export const TECNICA_DA_AULA: Record<string, string> = { "t1-figuras": "antítese", "t3-dois-segundos": "fórmula do Atlas", "t3-ritmo": "pausa de ênfase", "t4-voz": "pausa de ênfase", "t2-porque": "CTA com motivo", "t2-intencao-acao": "se-então no CTA" };

/** 60s drill source: an open notebook error, else weakest axis, else random. */
export function origemTreino(erros: { id: string; frase: string; regra: string; status: string }[], dominio: Record<string, number | null>, rnd = Math.random) {
  const e = erros.find(x => x.status === "aberto");
  if (e) return { tipo: "erro" as const, erro: e, texto: `Reescreva sem "${e.regra}": "${e.frase}"` };
  const med = EIXOS_N1.filter(x => dominio[x] != null).sort((a, b) => (dominio[a] as number) - (dominio[b] as number))[0];
  if (med) return { tipo: "eixo" as const, eixo: med, texto: `Treine ${med}: escreva uma abertura de até 12 palavras sem saudação.` };
  const lista = ["Transforme \"dicas de sono\" em uma abertura com lacuna específica.", "Reescreva sem saudação e em até 12 palavras: \"Oi, gente, hoje eu vou falar sobre proteína.\"", "Escreva uma frase com regra de três sobre rotina de treino."];
  return { tipo: "sorteio" as const, texto: lista[Math.floor(rnd() * lista.length)] };
}
export function diasSeguidos(dias: string[], hoje: string) {
  const s = new Set(dias); let n = 0; let d = new Date(`${hoje}T12:00:00Z`);
  if (!s.has(hoje)) d = new Date(d.getTime() - 864e5);
  while (s.has(d.toISOString().slice(0, 10))) { n++; d = new Date(d.getTime() - 864e5); }
  return n;
}
export { termoProibido };
