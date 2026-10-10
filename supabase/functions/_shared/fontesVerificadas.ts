// PROMPT Q2 — {{fontes_verificadas}} for the Diretor: card_topics (fala_segura, nao_dizer, ressalva, provas)
// + script_sources of same-pillar reels with fonte_status verificada/parcial. Pure helpers are tested in the app.
export type ProvaFV = { autores?: string | null; ano?: number | null; tipo_estudo?: string | null; periodico?: string | null; n_participantes?: number | null; desenho_resumo?: string | null; nivel?: string | null; limites?: string | null; selo?: string | null };
export type FonteUsada = { autor: string; ano: number | null; tipo: string };
export type FontesVerificadas = { texto: string; provas: ProvaFV[]; numeros: string[]; nao_dizer: string[]; falas_seguras: string[]; alem_do_limite: string[] };

export const norm = (s: string) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const palavras = (s: string) => norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 3);
const digits = (s: string): string[] => String(s ?? "").match(/\d+(?:[.,]\d+)?/g) ?? [];

/** Topic matches when its title, slug or an alias appears in the theme. */
export function topicoCasa(t: { titulo: string; slug: string; aliases?: unknown }, tema: string): boolean {
  const n = ` ${norm(tema)} `;
  const al = Array.isArray(t.aliases) ? t.aliases.map(String) : [];
  return [t.titulo, t.slug.replace(/-/g, " "), ...al].some(x => { const k = norm(x).trim(); return k.length > 2 && n.includes(k); });
}

/** Subtemas ordered by word overlap with the theme; all kept (the topic already matched). */
export function subtemasRelevantes(subs: any[], tema: string): any[] {
  const w = new Set(palavras(tema));
  const score = (s: any) => palavras(`${s.titulo} ${s.mito ?? ""} ${s.slug}`).filter(x => w.has(x)).length;
  return [...subs].sort((a, b) => score(b) - score(a)).slice(0, 10);
}

export function montarFontes(topicos: any[], tema: string, fontesReels: any[]): FontesVerificadas {
  const linhas: string[] = []; const provas: ProvaFV[] = []; const nums = new Set<string>(); const nao: string[] = []; const falas: string[] = []; const alem: string[] = [];
  for (const t of topicos.filter(t => topicoCasa(t, tema))) {
    linhas.push(`TEMA: ${t.titulo}${t.aviso_tema ? ` (aviso: ${t.aviso_tema})` : ""}`);
    for (const s of subtemasRelevantes(Array.isArray(t.subtemas) ? t.subtemas : [], tema)) {
      linhas.push(`- Subtema: ${s.titulo}`);
      if (s.fala_segura) { linhas.push(`  fala_segura: ${s.fala_segura}`); falas.push(s.fala_segura); digits(s.fala_segura).forEach(d => nums.add(d)); }
      const nd = (Array.isArray(s.nao_dizer) ? s.nao_dizer : []).map(String).filter(Boolean);
      if (nd.length) { linhas.push(`  nao_dizer (nunca use): ${nd.join(" | ")}`); nao.push(...nd); }
      if (s.ressalva_obrigatoria) linhas.push(`  ressalva_obrigatoria: ${s.ressalva_obrigatoria}`);
      for (const p of Array.isArray(s.provas) ? s.provas : []) {
        const campos = [p.selo, p.autores, p.periodico, p.ano, p.tipo_estudo, p.n_participantes != null ? `${p.n_participantes} participantes` : null, p.desenho_resumo, p.nivel ? `nível ${p.nivel}` : null, p.limites ? `limites: ${p.limites}` : null].filter(v => v != null && v !== "");
        linhas.push(`  prova: ${campos.join(" · ")}`);
        provas.push(p);
        // "não mede X": the reel may not state anything about X (last word, unless it is part of the theme).
        for (const m of String(p.limites ?? "").matchAll(/n[aã]o mede ([^.]+)/gi)) {
          const w = palavras(m[1]).pop(); if (w && !palavras(tema).some(x => x.slice(0, 5) === w.slice(0, 5)) && !alem.includes(w)) alem.push(w);
        }
        for (const v of [p.selo, p.ano, p.n_participantes, p.desenho_resumo, p.limites, p.periodico]) digits(String(v ?? "")).forEach(d => nums.add(d));
      }
      if (s.dado_card?.rotulo) digits(s.dado_card.rotulo).forEach(d => nums.add(d));
    }
  }
  if (fontesReels.length) linhas.push("FONTES DE REELS DO MESMO PILAR:");
  for (const f of fontesReels) {
    const campos = [f.autores, f.periodico, f.ano, f.tipo_estudo, f.n_participantes != null ? `${f.n_participantes} participantes` : null, f.referencia, f.rotulo_card, f.link].filter(v => v != null && v !== "");
    if (!campos.length) continue;
    linhas.push(`- ${campos.join(" · ")} (${f.tipo})`);
    provas.push({ autores: f.autores, ano: f.ano, tipo_estudo: f.tipo_estudo ?? f.tipo, periodico: f.periodico, n_participantes: f.n_participantes });
    for (const v of [f.ano, f.n_participantes, f.rotulo_card]) digits(String(v ?? "")).forEach(d => nums.add(d));
  }
  return { texto: linhas.join("\n"), provas, numeros: [...nums], nao_dizer: nao, falas_seguras: falas, alem_do_limite: alem };
}

const sobrenome = (a: string) => norm(String(a ?? "").split(/[,;]| e /)[0]).trim();

/** A prova counts as used when its participant count or first author appears in the script. */
export function fontesUsadas(fv: FontesVerificadas, texto: string): FonteUsada[] {
  const t = norm(texto); const out: FonteUsada[] = [];
  for (const p of fv.provas) {
    const n = p.n_participantes != null && new RegExp(`\\b${p.n_participantes}\\b`).test(t);
    const s = sobrenome(p.autores ?? ""); const autor = s.length > 3 && t.includes(s);
    if (!n && !autor) continue;
    const item = { autor: String(p.autores ?? "").split(/[,;]/)[0].trim() || "Autor não informado", ano: p.ano ?? null, tipo: String(p.tipo_estudo ?? "—") };
    if (!out.some(o => o.autor === item.autor && o.ano === item.ano)) out.push(item);
  }
  return out;
}

/** Pendência de falta de fonte (Q2 parada inteligente). */
export const FALTA_FONTE = /dado_sem_fonte|afirmacao_sem_prova|regra_universal_sem_fonte|sem fonte|sem prova/i;
export function chavesFaltaFonte(pend: { bloco: number; regra: string; gravidade: string }[]): string[] {
  return pend.filter(p => p.gravidade === "critico" && FALTA_FONTE.test(p.regra)).map(p => `${p.bloco}|${/dado/.test(p.regra) ? "dado" : "afirmacao"}`);
}
/** Stop when the same no-source critical pendência repeats in two consecutive rounds. */
export function deveParar(anterior: string[], atual: string[]): string | null {
  return atual.find(k => anterior.includes(k)) ?? null;
}

/** Text in a block uses only numbers present in the verified sources. */
export const numerosCobertos = (texto: string, numeros: string[]) => digits(texto).every(d => numeros.includes(d));

export async function carregarFontes(db: any, uid: string, tema: string, pilar?: number | null): Promise<FontesVerificadas> {
  const [{ data: topicos }, reels] = await Promise.all([
    db.from("card_topics").select("slug, titulo, aliases, aviso_tema, subtemas").eq("user_id", uid),
    pilar != null ? db.from("retention_scripts").select("id").eq("user_id", uid).eq("pilar", pilar).in("fonte_status", ["verificada", "parcial"]).limit(30) : Promise.resolve({ data: [] }),
  ]);
  const ids = (reels.data ?? []).map((r: any) => r.id);
  const { data: fr } = ids.length ? await db.from("script_sources").select("autores, periodico, ano, tipo_estudo, n_participantes, referencia, rotulo_card, link, tipo").eq("user_id", uid).in("script_id", ids).limit(30) : { data: [] };
  return montarFontes(topicos ?? [], tema, fr ?? []);
}

/** The reel's own sources only (Revalidar Banco). */
export async function fontesDoReel(db: any, uid: string, scriptId: string): Promise<FontesVerificadas> {
  const { data } = await db.from("script_sources").select("autores, periodico, ano, tipo_estudo, n_participantes, referencia, rotulo_card, link, tipo").eq("user_id", uid).eq("script_id", scriptId).order("ordem").limit(20);
  return montarFontes([], "", data ?? []);
}
