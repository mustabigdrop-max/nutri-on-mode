// Agente de Cards 2.0 (PROMPT P1): temas, kits, provas, dicas e verificador. Sem modelo.
// Regra anti-invenção: todo número/estudo vem de uma prova cadastrada no subtema.
import { contraste, corTextoAA } from "./cardStudio";

export type Veredito = "sustentado" | "sustentado_com_ressalva" | "misto" | "sem_evidencia" | "bloqueado";
export type MelhorPara = "alcance" | "autoridade" | "conversao";
export interface Prova { selo: string; referencia: string; link?: string | null; tipo_fonte: string; nivel: "primaria" | "secundaria"; limites?: string | null }
export interface Subtema {
  slug: string; titulo: string; veredito: Veredito; melhor_para: MelhorPara; mito: string | null; verdade: string | null; fala_segura: string;
  nao_dizer: string[]; ressalva_obrigatoria: string | null; dado_card: { rotulo: string; selo: string } | null; provas: Prova[]; dicas: string[];
  ilustracao_chave: string; alt_texto: string; bloqueio_prova: string | null; sem_pesquisa?: boolean;
}
export interface Topic { slug: string; titulo: string; aliases: string[]; aviso_tema: string | null; subtemas: Subtema[] }

export const VEREDITO: Record<Veredito, { label: string; cor: string; ordem: number }> = {
  sustentado: { label: "Sustentado", cor: "#5DCAA5", ordem: 0 },
  sustentado_com_ressalva: { label: "Com ressalva", cor: "#EF9F27", ordem: 1 },
  misto: { label: "Misto", cor: "#F97316", ordem: 2 },
  sem_evidencia: { label: "Sem evidência", cor: "#888888", ordem: 3 },
  bloqueado: { label: "Bloqueado", cor: "#EF4444", ordem: 4 },
};
export const MELHOR_LABEL: Record<MelhorPara, string> = { alcance: "alcance", autoridade: "autoridade", conversao: "conversão" };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
export const palavras = (s: string | null | undefined) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
export const corte = (s: string | null | undefined, n: number) => String(s ?? "").trim().split(/\s+/).filter(Boolean).slice(0, n).join(" ");
const primeiraFrase = (s: string | null | undefined) => String(s ?? "").split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";

/** a) tema por título ou alias. */
export function acharTema(assunto: string, temas: Topic[]): Topic | null {
  const q = norm(assunto); if (!q) return null;
  return temas.find(t => [t.titulo, t.slug, ...(t.aliases ?? [])].some(a => { const n = norm(a); return n === q || q.includes(n) || n.includes(q); })) ?? null;
}

/** Ordem: força da evidência, depois encaixe (mais provas primárias primeiro). */
export function ordenarSubtemas(s: Subtema[]) {
  return [...s].sort((a, b) => VEREDITO[a.veredito].ordem - VEREDITO[b.veredito].ordem || nPrim(b) - nPrim(a) || b.provas.length - a.provas.length);
}
export const nPrim = (s: Subtema) => s.provas.filter(p => p.nivel === "primaria").length;
export const contagemFontes = (s: Subtema) => `${s.provas.length} ${s.provas.length === 1 ? "fonte" : "fontes"} (${nPrim(s)} ${nPrim(s) === 1 ? "primária" : "primárias"})`;
export const temCardDado = (s: Subtema) => !!s.dado_card && s.provas.length > 0 && s.veredito !== "bloqueado";

/** c) modo Sem fonte: subtemas conceituais, sem fatos. */
export const SEM_FONTE_AVISO = "Sem fonte verificada para este assunto. Posso gerar cards conceituais, sem números, ou você pode pesquisar antes.";
export function temaSemFonte(assunto: string): Topic {
  const a = assunto.trim();
  const base = (slug: string, titulo: string, ic: string): Subtema => ({
    slug, titulo, veredito: "sem_evidencia", melhor_para: "alcance", mito: null, verdade: null,
    fala_segura: "", nao_dizer: [], ressalva_obrigatoria: null, dado_card: null, provas: [], dicas: ["Card conceitual: sem números, sem estudos e sem promessa."],
    ilustracao_chave: ic, alt_texto: `Card conceitual sobre ${a}: ${titulo.toLowerCase()}.`, bloqueio_prova: "Sem pesquisa: cards de dado ficam bloqueados.", sem_pesquisa: true,
  });
  return { slug: `sem-fonte-${norm(a).replace(/\W+/g, "-")}`, titulo: a, aliases: [], aviso_tema: SEM_FONTE_AVISO, subtemas: [
    base("pergunta", `A pergunta sobre ${a}`, "lupa"), base("como-comecar", `Como começar com ${a}`, "escada"),
    base("erros-comuns", `Erros comuns sobre ${a}`, "alerta"), base("o-que-observar", `O que observar em ${a}`, "bussola"),
    base("constancia", `${a} e constância`, "calendario"),
  ] };
}

/** Ícones: biblioteca mínima e mapeamento por significado (nunca sorteio). */
export const ICONES = ["haltere", "bateria", "folha", "lua", "cerebro", "rim", "colher", "escudo", "balanca", "calendario", "relogio", "funil", "lupa", "cadeado", "semente", "escada", "ponte", "interruptor", "engrenagem", "bussola", "check", "alerta"] as const;
export type Icone = typeof ICONES[number];
const MAPA: [RegExp, Icone][] = [
  [/forca|treino|musculo|hipertrofia/, "haltere"], [/energia|atp|cansa/, "bateria"], [/sono|dormi|noite/, "lua"],
  [/cerebro|foco|memoria|cogni|humor|dopamina/, "cerebro"], [/seguranca|risco|seguro/, "escudo"], [/rim|figado|orgao|renal/, "rim"],
  [/dose|quantidade|medida|grama/, "colher"], [/mito|verdade/, "balanca"], [/habito|constancia|rotina/, "calendario"], [/tempo|hora|minuto/, "relogio"],
  [/vegetal|vegetarian|carne|planta/, "folha"], [/crescimento|cresce/, "semente"],
];
export function iconePara(texto: string, chave?: string | null): Icone {
  if (chave && (ICONES as readonly string[]).includes(chave)) return chave as Icone;
  const t = norm(texto); return MAPA.find(([r]) => r.test(t))?.[1] ?? "lupa";
}
export function alternativasIcone(principal: Icone, texto: string): Icone[] {
  const t = norm(texto); const porSentido = MAPA.filter(([r]) => r.test(t)).map(([, i]) => i);
  return [...new Set([...porSentido, "balanca", "lupa", "check", "alerta", "escudo", "bussola"] as Icone[])].filter(i => i !== principal).slice(0, 5);
}

/* ─────────── KITS ─────────── */
export type Papel = "gancho" | "mito_verdade" | "prova" | "prova_bloqueada" | "dizer" | "ressalva" | "cta" | "capa" | "dizem_estudos" | "limites" | "fechamento" | "fontes";
export interface KitCard {
  idx: number; papel: Papel; principal: string; secundario?: string | null; esquerda?: string | null; direita?: string | null; itens?: string[];
  selo?: string | null; prova?: Prova | null; provas?: Prova[]; fonte?: string | null; icone: Icone; alt: string; dica: string; bloco: string; segundos: string;
  mostrarSelo?: boolean; mostrarHandle?: boolean;
}
export type Pacote = "reel" | "carrossel";

/** "Fonte: autor, ano, periódico" a partir da referência cadastrada (sem acrescentar nada). */
export const rodapeFonte = (p: Prova) => `Fonte: ${p.referencia}`;
const provaPrincipal = (s: Subtema) => s.provas.find(p => p.nivel === "primaria") ?? s.provas[0] ?? null;
const ganchoDe = (s: Subtema) => corte(s.mito ?? s.titulo, 12);
const verdadeCurta = (s: Subtema) => corte(primeiraFrase(s.fala_segura) || primeiraFrase(s.verdade), 12);
const ctaPalavra = (s: Subtema) => s.titulo.split(/\s+/)[0].toUpperCase();

export function montarKit(t: Topic, s: Subtema, pacote: Pacote): KitCard[] {
  const ic = iconePara(`${s.titulo} ${s.mito ?? ""}`, s.ilustracao_chave);
  const pv = provaPrincipal(s); const dado = temCardDado(s) && pv;
  const conceitual = !!s.sem_pesquisa;
  const mk = (papel: Papel, c: Partial<KitCard>): KitCard => ({ idx: 0, papel, principal: "", icone: ic, alt: s.alt_texto, dica: "", bloco: "", segundos: "", mostrarSelo: true, mostrarHandle: true, ...c });
  const provaCard = (): KitCard => dado
    ? mk("prova", { principal: corte(s.dado_card!.rotulo, 12), selo: pv!.selo, prova: pv, fonte: rodapeFonte(pv!), dica: `Mostre por 2 a 3 segundos enquanto fala: ${corte(s.fala_segura, 14)}`, bloco: "Corpo (prova)", segundos: "2 a 3 s" })
    : mk("prova_bloqueada", { principal: "Prova bloqueada", secundario: corte(s.bloqueio_prova ?? "Sem prova cadastrada para este tema.", 25), dica: "Sem prova cadastrada: este card não entra no vídeo.", bloco: "—", segundos: "—" });
  const dizer = mk("dizer", { principal: "O que dizer × o que não dizer", esquerda: corte(s.fala_segura, 25), itens: s.nao_dizer, dica: "Use como roteiro de fala, não precisa ir para a tela.", bloco: "Corpo", segundos: "3 s" });
  const ressalva = s.ressalva_obrigatoria ? mk("ressalva", { principal: corte(s.ressalva_obrigatoria, 12), secundario: s.ressalva_obrigatoria.split(/\s+/).length > 12 ? corte(s.ressalva_obrigatoria, 25) : null, dica: "Card próprio, texto grande, por 3 segundos.", bloco: "Fecho (ressalva)", segundos: "3 s" }) : null;
  const cta = mk("cta", { principal: `Comenta ${ctaPalavra(s)}`, secundario: "e eu te mando o resumo das fontes deste tema.", icone: "check", dica: "Diga o que a pessoa recebe ao comentar.", bloco: "CTA", segundos: "2 s" });
  let list: KitCard[];
  if (conceitual) {
    list = [
      mk("capa", { principal: corte(s.titulo, 12), dica: "Capa conceitual, sem números.", bloco: "Gancho", segundos: "2 s" }),
      mk("gancho", { principal: corte(`O que você quer saber sobre ${t.titulo}?`, 12), dica: "Pergunta aberta para comentário.", bloco: "Gancho", segundos: "2 s" }),
      mk("fechamento", { principal: "Passo a passo", itens: ["Pergunte qual é a dúvida", "Pesquise numa fonte confiável", "Fale só o que a fonte mostra"], dica: "Passos conceituais, sem dado.", bloco: "Corpo", segundos: "3 s" }),
      cta,
    ];
  } else if (pacote === "reel") {
    list = [
      mk("gancho", { principal: ganchoDe(s), dica: "Abra com o mito em até 2 segundos.", bloco: "Gancho (0–2 s)", segundos: "2 s" }),
      mk("mito_verdade", { principal: "Mito × verdade", esquerda: corte(s.mito ?? s.titulo, 12), direita: verdadeCurta(s), dica: "Leia o mito e corrija com a fala segura.", bloco: "Promessa", segundos: "3 s" }),
      provaCard(), dizer, ressalva ?? cta,
    ];
  } else {
    const lim = s.provas.filter(p => p.limites).map(p => p.limites!) ;
    list = [
      mk("capa", { principal: ganchoDe(s), dica: "Capa: o mito como pergunta implícita.", bloco: "Slide 1", segundos: "—" }),
      mk("dizem_estudos", { principal: "O que dizem × o que os estudos mostram", esquerda: corte(s.mito ?? s.titulo, 12), direita: corte(primeiraFrase(s.verdade) || s.fala_segura, 25), dica: "Contraste direto.", bloco: "Slide 2", segundos: "—" }),
      { ...provaCard(), bloco: "Slide 3" },
      mk("limites", { principal: "Limites da prova", itens: lim.length ? lim.map(l => corte(l, 25)) : ["Sem prova cadastrada."], dica: "Mostrar os limites gera confiança.", bloco: "Slide 4", segundos: "—" }),
      { ...dizer, bloco: "Slide 5" },
      ressalva ? { ...ressalva, bloco: "Slide 6" } : mk("fechamento", { principal: corte(primeiraFrase(s.fala_segura), 12), dica: "Fechamento com a fala segura.", bloco: "Slide 6", segundos: "—" }),
      mk("fontes", { principal: "Fontes", provas: s.provas, itens: s.provas.map(p => corte(p.referencia, 14)), secundario: `Comenta ${ctaPalavra(s)} para receber o resumo.`, dica: "Referências curtas, sem links clicáveis.", bloco: "Slide 7", segundos: "—" }),
    ];
  }
  return list.map((c, i) => ({ ...c, idx: i }));
}

/* ─────────── VERIFICADOR ─────────── */
export type Nivel = "ok" | "aviso" | "bloqueio";
export interface Achado { nivel: Exclude<Nivel, "ok">; motivo: string }
export const ABSOLUTAS = ["prova", "garante", "nunca", "sempre", "todo mundo", "100%"];
export const PROIBIDAS_PADRAO = ["crucial", "muda tudo", "o segredo", "segredo"];
const NUMERO_OU_ESTUDO = /\d|por\s*cento|\bestudos?\b|\bpesquisas?\b|meta-?an[aá]lise|\bensaio\b|\brevis[aã]o\b/i;
const contem = (texto: string, termo: string) => { const t = ` ${norm(texto)} `, q = norm(termo); return q.length > 0 && new RegExp(`(^|[^a-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(t); };
const textoVisivel = (c: KitCard) => [c.principal, c.secundario, c.esquerda, c.direita, ...(c.papel === "dizer" || c.papel === "fontes" || c.papel === "limites" ? [] : c.itens ?? [])].filter(Boolean).join(" ");

export function verificarCard(c: KitCard, s: Subtema, proibidas: string[] = []): Achado[] {
  const out: Achado[] = []; const txt = textoVisivel(c);
  const temProva = !!c.prova || (c.papel === "fontes" && (c.provas?.length ?? 0) > 0) || c.papel === "limites" || c.papel === "prova_bloqueada";
  if (NUMERO_OU_ESTUDO.test(txt) && !temProva) out.push({ nivel: "bloqueio", motivo: "Número ou estudo sem prova ligada." });
  for (const n of s.nao_dizer) if (contem(txt, n)) out.push({ nivel: "bloqueio", motivo: `Frase da lista "não dizer": ${n}` });
  for (const a of ABSOLUTAS) if (contem(txt, a) && !(a === "prova" && (c.papel === "prova" || c.papel === "prova_bloqueada" || c.papel === "limites"))) out.push({ nivel: "aviso", motivo: `Linguagem absoluta: "${a}"` });
  for (const p of [...new Set([...PROIBIDAS_PADRAO, ...proibidas])]) if (p && contem(txt, p)) out.push({ nivel: "aviso", motivo: `Termo proibido: "${p}"` });
  if (palavras(c.principal) > 12) out.push({ nivel: "aviso", motivo: "Texto principal com mais de 12 palavras." });
  if (palavras(c.secundario) > 25) out.push({ nivel: "aviso", motivo: "Texto secundário com mais de 25 palavras." });
  return out;
}
export const FALTA_RESSALVA = "Kit incompleto: falta o card de ressalva";
export function verificarKit(cards: KitCard[], s: Subtema, proibidas: string[] = []) {
  const porCard = cards.map(c => verificarCard(c, s, proibidas));
  const kit: Achado[] = [];
  if (s.ressalva_obrigatoria && !cards.some(c => c.papel === "ressalva")) kit.push({ nivel: "bloqueio", motivo: FALTA_RESSALVA });
  const nivel = (a: Achado[]): Nivel => a.some(x => x.nivel === "bloqueio") ? "bloqueio" : a.length ? "aviso" : "ok";
  const geral: Nivel = nivel([...kit, ...porCard.flat()]);
  return { porCard, kit, geral, nivelCard: porCard.map(nivel), exporta: geral !== "bloqueio" };
}
export const precisaAvisoSecundaria = (cards: KitCard[]) => cards.some(c => c.prova?.nivel === "secundaria");
export const AVISO_SECUNDARIA = "Esta prova é um resumo de terceiros. Confira no original antes de postar.";

/** Gaveta "Ver prova": provas contra/ressalvas primeiro (secundárias ou com limites que negam). */
export function ordenarProvas(p: Prova[]) {
  const peso = (x: Prova) => /igua|nao |não |inconclus|corre|coment|resumo|secund/i.test(`${x.limites ?? ""} ${x.tipo_fonte}`) ? 0 : 1;
  return [...p].sort((a, b) => peso(a) - peso(b));
}

/* ─────────── CHECKLIST ─────────── */
export function checklist(c: KitCard, kit: KitCard[], s: Subtema, brand: { cor_fundo: string; cor_primaria: string; handle: string | null; margem_topo: number; margem_base: number }, formato: string) {
  const txt = corTextoAA(brand.cor_fundo, "#F5F0E8");
  return [
    { ok: palavras(c.principal) <= 12, item: "Texto principal com até 12 palavras" },
    { ok: contraste(brand.cor_fundo, txt) >= 4.5, item: "Contraste AA" },
    { ok: formato !== "9:16" || (brand.margem_topo >= 250 && brand.margem_base >= 340), item: "Margens seguras" },
    { ok: c.papel !== "prova" || !!(c.mostrarSelo && c.selo), item: "Selo de prova visível" },
    { ok: !!brand.handle && c.mostrarHandle !== false, item: "@ presente" },
    { ok: !!c.alt.trim(), item: "Texto alternativo preenchido" },
    { ok: !s.ressalva_obrigatoria || kit.some(k => k.papel === "ressalva"), item: "Ressalva presente se obrigatória" },
  ];
}

/* ─────────── DICAS ─────────── */
export function dicasDoSubtema(s: Subtema, kit: KitCard[]) {
  return {
    proprias: s.dicas,
    quando: s.melhor_para === "conversao" ? "Use para conversão: feche com convite claro." : `Use para ${MELHOR_LABEL[s.melhor_para]}.`,
    blocos: kit.filter(c => c.bloco && c.bloco !== "—").map(c => `${c.bloco}: card ${c.idx + 1}${c.segundos && c.segundos !== "—" ? `, ${c.segundos}` : ""}`),
    falar: s.fala_segura, naoDizer: s.nao_dizer,
  };
}

/** Fotos: recusar físico ou embalagem. */
export const ROTULOS_FOTO = [["ambiente", "Ambiente"], ["eu", "Eu falando"], ["objeto", "Objeto"], ["fisico", "Físico"], ["embalagem", "Embalagem"]] as const;
export const AVISO_FOTO = "Use fotos suas, sem físico como resultado, sem antes e depois, sem marcas e sem embalagens.";
export const fotoPermitida = (rotulo: string) => rotulo !== "fisico" && rotulo !== "embalagem";
export const RECUSA_FOTO = "Essa foto não entra: físico ou embalagem não podem aparecer no card.";
