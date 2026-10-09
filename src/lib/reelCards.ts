// PROMPT P3 — Cards do reel no padrão Pro. Sem modelo: blocos do roteiro → templates A–F do P2.
// Anti-invenção: número/estudo/autor/organização/periódico/ano só vêm de script_sources do reel ou de prova do tema.
import { FORMATOS, type Formato } from "./cardStudio";
import {
  acharTema, corte, contem, iconePara, norm, palavras, textoVisivel, parsePassos, autoresCurto, BLOQUEIO_FIXO, NUMERO_OU_ESTUDO, ORG_NAO_INFORMADA,
  type Achado, type KitCard, type Papel, type Prova, type Subtema, type Topic, type Nivel,
} from "./cardKits";

export interface Bloco { id?: number; fala?: string; texto_tela?: string; tempo?: string; funcao?: string; gatilho?: string }
export interface FonteReel { tipo: string; referencia: string | null; rotulo_card?: string | null; autores?: string | null; organizacao?: string | null; periodico?: string | null; ano?: number | null; tipo_estudo?: string | null; n_participantes?: number | null }
export interface ReelIn { tema: string; titulo?: string | null; fonte_status?: string | null; roteiro: any }
export interface ReelCardP3 extends KitCard { blocoRef: number | null; tempo: string; template: string; rotulo: string; bloqueadoCta?: boolean }

export const MAX_CARDS = 7;
export const CHIP_METODO = "POSIÇÃO DO MÉTODO";
export const MSG_SEM_PALAVRA = "Defina a palavra-chave do reel";
export const AVISO_FORA_DO_TEMA = "A afirmação não está no tema. Conferir.";
export const RESSALVA_PADRAO = "Suplemento não substitui orientação profissional. Converse com seu nutricionista antes de usar.";
const STATUS_SEM_PROVA = ["sem_fonte_primaria", "posicao_do_metodo"];
const NOME: Record<string, string> = { capa: "Capa", mecanismo: "Mecanismo", prova: "Prova", ha_falta: "Há × Falta", ressalva: "Ressalva", cta: "CTA", fontes: "Fontes" };

/** Remove marcações de direção ([PAUSA 0,4s], [ÊNFASE], {{x}}) — nunca vão para a tela. */
export const limpar = (s: unknown) => String(s ?? "").replace(/\[[^\]]*\]/g, " ").replace(/\{\{[^}]*\}\}/g, " ").replace(/\s+/g, " ").trim();
const frases = (s: string) => s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
const semDado = (s: string) => s.split(/\s+/).filter(w => !/\d|%/.test(w)).join(" ");
const blocosDe = (r: any): Bloco[] => Array.isArray(r?.blocos) ? r.blocos : Array.isArray(r) ? r : [];

/** Palavra-chave REAL: campo do roteiro, senão "Comenta/Comente PALAVRA" na fala, tela ou legenda. */
export function palavraChave(roteiro: any): string | null {
  const campo = roteiro?.palavra_chave ?? roteiro?.cta_palavra ?? roteiro?.cta?.palavra_chave;
  if (typeof campo === "string" && campo.trim() && !/palavra-?chave/i.test(campo)) return campo.trim().toUpperCase();
  const txt = [...blocosDe(roteiro).map(b => `${limpar(b.fala)} ${limpar(b.texto_tela)}`), String(roteiro?.legenda ?? "")].join(" ");
  for (const m of txt.matchAll(/\bcoment[ae]\s+["“']?([A-Za-zÀ-ÿ0-9]{3,})/gi)) {
    const w = m[1]; if (w === w.toUpperCase() && !/^PALAVRA/.test(w)) return w;
  }
  return null;
}
export function entregaDoCta(texto: string): string | null {
  const m = limpar(texto).match(/(?:para receber|pra receber|que eu te mando|e receba|e eu te mando)\s+([^.!?]+)/i);
  return m ? m[1].trim() : null;
}

/** Subtema do tema que mais combina com o reel (palavras em comum). */
export function subtemaDoReel(t: Topic, reel: ReelIn): Subtema | null {
  const base = new Set(norm(`${reel.tema} ${reel.titulo ?? ""} ${blocosDe(reel.roteiro).map(b => limpar(b.fala)).join(" ")}`).split(/\W+/).filter(w => w.length > 3));
  let best: Subtema | null = null, score = 0;
  for (const s of t.subtemas) {
    const n = norm(`${s.slug.replace(/-/g, " ")} ${s.titulo}`).split(/\W+/).filter(w => w.length > 3 && w !== norm(t.titulo)).filter(w => base.has(w)).length;
    if (n > score) { score = n; best = s; }
  }
  return best;
}
export const temaDoReel = (reel: ReelIn, temas: Topic[]) => acharTema(reel.tema, temas) ?? (reel.titulo ? acharTema(reel.titulo, temas) : null);

const provaDaFonte = (f: FonteReel): Prova => ({
  selo: f.tipo_estudo || f.rotulo_card || f.tipo, referencia: f.referencia ?? "", tipo_fonte: f.tipo, nivel: /prim|estudo|ensaio|meta/i.test(f.tipo) ? "primaria" : "secundaria",
  autores: f.autores ?? null, organizacao: f.organizacao ?? null, periodico: f.periodico ?? null, ano: f.ano ?? null, tipo_estudo: f.tipo_estudo ?? null, n_participantes: f.n_participantes ?? null,
});
/** Linha do selo com o que existir: tipo · n · ano · periódico. Nada é preenchido. */
export function seloTexto(p: Prova) {
  return [p.tipo_estudo || p.selo, p.n_participantes != null ? `n=${p.n_participantes}` : null, p.ano, p.periodico].filter(Boolean).join(" · ");
}

export interface Opcoes { fontes: FonteReel[]; subtema?: Subtema | null; formato?: Formato }

export function cardsProDoReel(reel: ReelIn, o: Opcoes): ReelCardP3[] {
  const blocos = blocosDe(reel.roteiro); const sub = o.subtema ?? null;
  const provasTema = sub?.provas ?? [];
  const provasReel = o.fontes.filter(f => f.referencia).map(provaDaFonte);
  const provas = provasTema.length ? provasTema : provasReel; // tema aceito substitui as do reel
  const semProva = STATUS_SEM_PROVA.includes(String(reel.fonte_status ?? "")) && !provasTema.length || !provas.length;
  const ic = (t: string) => iconePara(t, sub?.ilustracao_chave);
  const passosTema = parsePassos(sub?.passos);
  const out: ReelCardP3[] = [];
  const mk = (papel: Papel, b: Bloco | null, c: Partial<ReelCardP3>): ReelCardP3 => {
    const ref = b ? Number(b.id) || blocos.indexOf(b) + 1 : null; const tempo = b?.tempo ?? "";
    return { idx: 0, papel, principal: "", icone: "nenhum", alt: "", dica: "", bloco: ref ? `Bloco ${ref}` : "Fecho", segundos: tempo, mostrarSelo: true, mostrarHandle: true,
      blocoRef: ref, tempo, template: NOME[papel] ?? papel, rotulo: "", ...c };
  };
  const ult = blocos.length - 1;
  blocos.forEach((b, i) => {
    const fala = limpar(b.fala), tela = limpar(b.texto_tela), txt = `${fala} ${tela}`;
    if (!fala && !tela) return;
    if (i === ult || /cta/i.test(b.funcao ?? "")) {
      const kw = palavraChave(reel.roteiro); const ent = entregaDoCta(fala);
      out.push(kw
        ? mk("cta", b, { principal: `Comenta ${kw}`, secundario: ent ? `que eu te mando ${ent}` : null, alt: `Convite para comentar ${kw}.` })
        : mk("cta", b, { principal: MSG_SEM_PALAVRA, bloqueadoCta: true, alt: "CTA sem palavra-chave." }));
      return;
    }
    if (i === 0) { out.push(mk("capa", b, { principal: corte(fala || tela, 12), icone: ic(txt), alt: corte(fala || tela, 20) })); return; }
    const ehDado = /\d/.test(txt) || NUMERO_OU_ESTUDO.test(txt) || /achado|cientific|estudo/i.test(b.gatilho ?? "");
    if (ehDado) {
      const p = provas[0];
      if (semProva || !p) out.push(mk("capa", b, { principal: corte(semDado(tela || fala), 12), secundario: corte(semDado(fala), 25) || null, chip: CHIP_METODO, icone: ic(txt), alt: corte(semDado(fala), 20) }));
      else out.push(mk("prova", b, { principal: corte(tela || fala, 12), prova: p, selo: seloTexto(p), icone: ic(txt), alt: corte(fala, 20) }));
      return;
    }
    const fs = frases(fala); const neg = fs.find(f => /\bn[aã]o\b|\bmito\b|m[aá]gica|errad/i.test(f)); const pos = fs.find(f => f !== neg);
    if (neg && pos) { out.push(mk("ha_falta", b, { principal: corte(tela || fala, 12), esquerda: corte(pos, 25), direita: corte(neg, 25), icone: ic(txt), alt: corte(fala, 20) })); return; }
    const passosBloco = fala.split(/→|->/).map(x => x.trim()).filter(Boolean);
    const passos = passosBloco.length >= 3 ? passosBloco.map(n => ({ nome: corte(n, 3).toUpperCase(), detalhe: "" })) : /mecanis|como funciona|ressintese|caminho/i.test(norm(txt)) && passosTema.length ? passosTema : [];
    if (passos.length) { out.push(mk("mecanismo", b, { principal: corte(tela || fala, 12), passos, prova: provas[0] ?? null, selo: provas[0] ? seloTexto(provas[0]) : null, icone: ic(txt), alt: corte(fala, 20) })); return; }
    out.push(mk("capa", b, { principal: corte(tela || fala, 12), secundario: tela ? corte(fala, 25) : null, icone: "nenhum", alt: corte(fala, 20) }));
  });
  // Ressalva obrigatória em reel de saúde, dor, lesão ou suplemento.
  const precisa = /suplement|creatina|whey|cafeina|dor|lesa|saude|rim|figado|remedio/.test(norm(`${reel.tema} ${reel.titulo ?? ""} ${blocos.map(b => limpar(b.fala)).join(" ")}`));
  const ress = sub?.ressalva_obrigatoria ?? (precisa ? RESSALVA_PADRAO : null);
  const cta = out.findIndex(c => c.papel === "cta"); const cards = cta >= 0 ? out.splice(cta, 1) : [];
  const fontesCard = provas.length && !semProva ? [mk("fontes", null, { principal: "Fontes", provas, itens: provas.map(p => [autoresCurto(p.autores), p.ano, p.periodico].filter(Boolean).join(", ") || p.referencia), alt: "Referências do reel." })] : [];
  const fixos = [...(ress ? [mk("ressalva", null, { principal: corte(frases(ress)[0] ?? ress, 12), secundario: frases(ress).slice(1).join(" ") || null, alt: ress })] : []), ...cards, ...fontesCard];
  const corpo = out.slice(0, Math.max(1, MAX_CARDS - fixos.length));
  return [...corpo, ...fixos].map((c, i) => ({ ...c, idx: i, rotulo: `${c.blocoRef ? `Bloco ${c.blocoRef}` : "Fecho"}${c.tempo ? ` · ${c.tempo}` : ""} · ${c.template}` }));
}

/* ─────────── título nunca cortado ─────────── */
const BASE: Partial<Record<Papel, number>> = { capa: 120, gancho: 120, mecanismo: 96, prova: 84, ha_falta: 84, ressalva: 110, fontes: 100, cta: 110 };
/** Simula quebra de linha com largura média de caractere; true se cabe com até 15% de redução. */
export function tituloCabe(texto: string, papel: Papel, formato: Formato = "9:16") {
  const { w, h } = FORMATOS[formato]; const alto = formato === "9:16"; const k = h / 1920;
  const largura = w - 140 - (papel === "ressalva" ? 96 : 0);
  const areaAlt = (alto ? 1920 - 250 - 340 : h - Math.round(590 * k * 0.6)) * 0.42;
  const size = (BASE[papel] ?? 110) * 0.85 * (alto ? 1 : 0.8); const cw = size * 0.56;
  let linhas = 1, atual = 0;
  for (const p of String(texto).toUpperCase().split(/\s+/).filter(Boolean)) {
    const lw = p.length * cw; if (lw > largura) return false; // palavra seria partida no meio
    const add = atual ? atual + cw + lw : lw;
    if (add > largura) { linhas++; atual = lw; } else atual = add;
  }
  return linhas * size * 1.02 <= areaAlt;
}

/* ─────────── verificador P3 ─────────── */
export function verificarReelCards(cards: ReelCardP3[], sub: Subtema | null, formato: Formato = "9:16") {
  const vistos = new Map<string, number>();
  const porCard = cards.map(c => {
    const out: Achado[] = []; const txt = textoVisivel(c);
    if (c.bloqueadoCta) out.push({ nivel: "bloqueio", motivo: MSG_SEM_PALAVRA });
    else if (/palavra-?chave/i.test(txt)) out.push({ nivel: "bloqueio", motivo: "Texto com \"palavra-chave\" literal." });
    if (/[[\]]|\{\{/.test(txt)) out.push({ nivel: "bloqueio", motivo: "Marcação visível no texto ([ ] ou {{)." });
    if (/\b(IA|AI)\b/.test(txt)) out.push({ nivel: "bloqueio", motivo: "Texto com termo proibido na interface." });
    if (!tituloCabe(c.principal, c.papel, formato)) out.push({ nivel: "bloqueio", motivo: "Texto grande demais" });
    if (c.papel === "prova" && !c.prova) out.push({ nivel: "bloqueio", motivo: "Card de prova sem selo de prova ligado." });
    if (c.papel !== "fontes" && NUMERO_OU_ESTUDO.test(txt) && !c.prova) out.push({ nivel: "bloqueio", motivo: "Número ou estudo sem prova ligada." });
    for (const b of BLOQUEIO_FIXO) if (contem(txt, b)) out.push({ nivel: "bloqueio", motivo: `Frase bloqueada: "${b}"` });
    if (c.prova && !c.prova.organizacao) out.push({ nivel: "aviso", motivo: ORG_NAO_INFORMADA });
    if (sub && c.papel !== "fontes" && sub.nao_dizer.some(n => contem(txt, n))) out.push({ nivel: "aviso", motivo: AVISO_FORA_DO_TEMA });
    const chave = norm(txt); if (chave) { if (vistos.has(chave)) out.push({ nivel: "aviso", motivo: `Mesmo texto do card ${vistos.get(chave)! + 1}.` }); else vistos.set(chave, c.idx); }
    return out;
  });
  const nivel = (a: Achado[]): Nivel => a.some(x => x.nivel === "bloqueio") ? "bloqueio" : a.length ? "aviso" : "ok";
  return { porCard, nivelCard: porCard.map(nivel), geral: nivel(porCard.flat()) };
}

/* ─────────── duplicados e substituição ─────────── */
export interface CardSalvo { id: string; script_id: string | null; bloco_ref: number | null; tipo: string; template: string; nome?: string | null; conteudo: any }
export const textoDoCard = (r: CardSalvo) => norm(r.conteudo?.kit ? textoVisivel(r.conteudo.card) : [r.conteudo?.titulo, r.conteudo?.apoio, r.conteudo?.esquerda, r.conteudo?.direita, ...(r.conteudo?.itens ?? [])].filter(Boolean).join(" "));
/** Grupos idênticos (mesmo reel, bloco, tipo e texto). Mantém o mais antigo (último da lista ordenada desc). */
export function acharDuplicados(rows: CardSalvo[]) {
  const g = new Map<string, CardSalvo[]>();
  for (const r of rows) { const k = [r.script_id, r.bloco_ref, r.tipo, r.template, textoDoCard(r)].join("|"); g.set(k, [...(g.get(k) ?? []), r]); }
  return [...g.values()].filter(x => x.length > 1).map(x => ({ manter: x[x.length - 1], apagar: x.slice(0, -1) }));
}
/** Cards da geração automática do reel: novos (origem reel_auto) e os do caminho antigo; nunca editados nem cópias (DUP). */
export const ehAutoDoReel = (r: CardSalvo, reelId: string) => r.script_id === reelId && !r.conteudo?.editado && !/\(cópia\)/.test(r.nome ?? "")
  && (r.conteudo?.origem === "reel_auto" || (!r.conteudo?.kit && /^(capa|cta|bloco_\d+)$/.test(r.nome ?? "")));
export const tipoColuna = (p: Papel) => p === "prova" ? "A" : p === "mecanismo" ? "D" : "B";
