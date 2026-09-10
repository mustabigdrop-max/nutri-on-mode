/**
 * Máquina de crescimento do SOCIAL ON — funil rastreado, ranking de
 * performance por tipo de post, highlights do perfil, gatilhos de DM e
 * links da bio.
 *
 * Regra: nada é inventado. Toda métrica vem do que o coach registrou
 * (social_posts_tracked) ou do banco real (mce_leads / mce_clients).
 */

import { supabase } from "@/integrations/supabase/client";

export const GROWTH_COLORS = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
  muted: "#888888",
} as const;

/* ─────────────── 1. Rastreamento por post ─────────────── */

export type PostRastreado = {
  id: string;
  data: string;
  tipo: string;
  tema: string | null;
  modulo_origem: string | null;
  formato: string | null;
  curtidas: number | null;
  comentarios: number | null;
  salvamentos: number | null;
  compartilhamentos: number | null;
  alcance: number | null;
  leads_gerados: number;
  score_performance: number | null;
};

export const TIPOS_POST = [
  "React Coach (Reels)",
  "Mito ou Método (Carrossel)",
  "NEXUS-BIO Ciência",
  "MCE Drop",
  "Resultado + Protocolo",
  "Refeição + Ciência",
  "nutriON Feature",
  "Treino do dia",
  "Bastidor / Lifestyle",
] as const;

/** Salvamentos 3x · compartilhamento 4x · comentário 2x · curtida 1x. */
export const calcularScore = (p: Partial<PostRastreado>) =>
  (p.curtidas || 0) * 1 +
  (p.comentarios || 0) * 2 +
  (p.salvamentos || 0) * 3 +
  (p.compartilhamentos || 0) * 4;

export const listarPosts = async (limite = 200): Promise<PostRastreado[]> => {
  const { data, error } = await supabase
    .from("social_posts_tracked")
    .select("*")
    .order("data", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return (data || []) as PostRastreado[];
};

export const registrarPost = async (p: Partial<PostRastreado> & { tipo: string }) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Faça login para registrar o post.");
  const payload = { ...p, user_id: auth.user.id, score_performance: calcularScore(p) };
  const { error } = await supabase.from("social_posts_tracked").insert(payload as never);
  if (error) throw new Error(error.message);
};

export const atualizarMetricas = async (id: string, m: Partial<PostRastreado>) => {
  const { error } = await supabase
    .from("social_posts_tracked")
    .update({ ...m, score_performance: calcularScore(m), updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
};

export const removerPost = async (id: string) => {
  const { error } = await supabase.from("social_posts_tracked").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

/* ─────────────── 2. Funil ─────────────── */

export type Funil = {
  seguidores: number | null;
  interacoesSemana: number;
  leadsMes: number;
  clientesMes: number;
  postsMes: number;
  taxaEngajamento: number | null;
  taxaLead: number | null;
  taxaCliente: number | null;
  gargalo: { etapa: string; acao: string };
};

const inicioMes = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const seteDiasAtras = () => new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);

export const carregarFunil = async (seguidores: number | null): Promise<Funil> => {
  const mes = inicioMes();
  const [posts, leads, clientes] = await Promise.all([
    supabase.from("social_posts_tracked").select("*").gte("data", mes),
    supabase.from("mce_leads").select("id", { count: "exact", head: true }).gte("created_at", `${mes}T00:00:00Z`),
    supabase.from("mce_clients").select("id", { count: "exact", head: true }).gte("created_at", `${mes}T00:00:00Z`),
  ]);

  const linhas = ((posts.data || []) as PostRastreado[]);
  const semana = seteDiasAtras();
  const interacoesSemana = linhas
    .filter((p) => p.data >= semana)
    .reduce(
      (s, p) => s + (p.curtidas || 0) + (p.comentarios || 0) + (p.salvamentos || 0) + (p.compartilhamentos || 0),
      0,
    );

  const leadsMes = leads.count || 0;
  const clientesMes = clientes.count || 0;
  const postsMes = linhas.length;

  const taxaEngajamento = seguidores ? (interacoesSemana / seguidores) * 100 : null;
  const taxaLead = interacoesSemana ? (leadsMes / interacoesSemana) * 100 : null;
  const taxaCliente = leadsMes ? (clientesMes / leadsMes) * 100 : null;

  let gargalo = { etapa: "ALCANCE → ENGAJAMENTO", acao: "Postar todo dia por 30 dias." };
  if (postsMes === 0) {
    gargalo = { etapa: "ALCANCE → ENGAJAMENTO", acao: `Postar todo dia por 30 dias (0 posts este mês — o algoritmo te esqueceu).` };
  } else if (taxaEngajamento != null && taxaEngajamento < 3) {
    gargalo = { etapa: "ALCANCE → ENGAJAMENTO", acao: "Aumentar frequência e usar formatos salváveis (Mito ou Método, NEXUS-BIO)." };
  } else if (taxaLead != null && taxaLead < 2) {
    gargalo = { etapa: "ENGAJAMENTO → LEADS", acao: "Fechar todo post com CTA de palavra-chave para DM (MCE, TREINO, QUERO)." };
  } else if (taxaCliente != null && taxaCliente < 10) {
    gargalo = { etapa: "LEADS → CLIENTES", acao: "Responder o lead em até 24h com o resultado do diagnóstico na mão." };
  }

  return {
    seguidores,
    interacoesSemana,
    leadsMes,
    clientesMes,
    postsMes,
    taxaEngajamento,
    taxaLead,
    taxaCliente,
    gargalo,
  };
};

/* ─────────────── 3. Ranking por tipo ─────────────── */

export type RankingItem = {
  tipo: string;
  posts: number;
  score: number;
  alcanceMedio: number | null;
  savesMedio: number | null;
};

export const ranking = (posts: PostRastreado[]): RankingItem[] => {
  const grupos = new Map<string, PostRastreado[]>();
  for (const p of posts) {
    if (!p.tipo) continue;
    grupos.set(p.tipo, [...(grupos.get(p.tipo) || []), p]);
  }
  const brutos = [...grupos.entries()].map(([tipo, lista]) => {
    const comMetrica = lista.filter((p) => p.score_performance != null);
    const media = comMetrica.length
      ? comMetrica.reduce((s, p) => s + Number(p.score_performance || 0), 0) / comMetrica.length
      : 0;
    const alcances = lista.map((p) => p.alcance).filter((v): v is number => v != null);
    const saves = lista.map((p) => p.salvamentos).filter((v): v is number => v != null);
    return {
      tipo,
      posts: lista.length,
      bruto: media,
      alcanceMedio: alcances.length ? Math.round(alcances.reduce((a, b) => a + b, 0) / alcances.length) : null,
      savesMedio: saves.length ? Math.round(saves.reduce((a, b) => a + b, 0) / saves.length) : null,
    };
  });
  const melhor = Math.max(...brutos.map((b) => b.bruto), 0);
  return brutos
    .map((b) => ({
      tipo: b.tipo,
      posts: b.posts,
      score: melhor > 0 ? Math.round((b.bruto / melhor) * 100) : 0,
      alcanceMedio: b.alcanceMedio,
      savesMedio: b.savesMedio,
    }))
    .sort((a, b) => b.score - a.score);
};

export const insightRanking = (r: RankingItem[]): string | null => {
  const comAlcance = r.filter((x) => x.alcanceMedio != null);
  const comSaves = r.filter((x) => x.savesMedio != null);
  if (comAlcance.length < 2 || comSaves.length < 2) return null;
  const maiorAlcance = [...comAlcance].sort((a, b) => (b.alcanceMedio! - a.alcanceMedio!))[0];
  const maisSalvo = [...comSaves].sort((a, b) => (b.savesMedio! - a.savesMedio!))[0];
  if (maiorAlcance.tipo === maisSalvo.tipo) {
    return `${maiorAlcance.tipo} lidera alcance e salvamentos — é o seu formato âncora.`;
  }
  return `${maiorAlcance.tipo} tem maior alcance, mas ${maisSalvo.tipo} tem mais salvamentos. Estratégia: ${maiorAlcance.tipo} pra atrair, ${maisSalvo.tipo} pra reter.`;
};

/* ─────────────── 4. Highlights do perfil ─────────────── */

export type Highlight = { id: string; titulo: string; icone: string; stories: string[] };

export const HIGHLIGHTS: Highlight[] = [
  {
    id: "quem_sou",
    titulo: "Quem sou eu",
    icone: "👤",
    stories: [
      "Meu nome é Diogo Mello",
      "16 anos de Marinha do Brasil",
      "Coach certificado nos EUA",
      "Pai. Preto. Periférico.",
      "Criei o Método MCE",
      "Construí o nutriON do zero",
      "Minha missão: transformação com sistema",
      "Diagnóstico gratuito — link na bio",
    ],
  },
  {
    id: "mce",
    titulo: "Método MCE",
    icone: "🧠",
    stories: [
      "O que é o MCE?",
      "M — MENTALIDADE: como você PENSA",
      "C — COMPORTAMENTO: como você AGE",
      "E — EXECUÇÃO: o que você FAZ",
      "Quando um falha, os outros desmoronam",
      "Diagnóstico: qual pilar te trava?",
      "Faz o diagnóstico — link na bio",
    ],
  },
  {
    id: "transformacoes",
    titulo: "Transformações",
    icone: "🔥",
    stories: [
      "Resultados reais de quem seguiu o sistema",
      "Antes e depois do diagnóstico MCE",
      "Evolução de M, C e E semana a semana",
      "Quer ser o próximo? Link na bio",
    ],
  },
  {
    id: "treino",
    titulo: "Treino",
    icone: "💪",
    stories: [
      "Meu split: Push / Pull / Legs",
      "O que é o APEX System",
      "Feeder Set → Top Set → Back-off",
      "O que é RPE e por que eu uso",
      "Meu treino favorito",
      "Protocolo completo no nutriON",
    ],
  },
  {
    id: "ciencia",
    titulo: "Ciência",
    icone: "🧬",
    stories: [
      "Seu intestino produz GLP-1 de graça",
      "Cúrcuma + pimenta preta: absorção potencializada",
      "Arroz resfriado vira amido resistente",
      "A maior parte da serotonina é intestinal",
      "Creatina: o suplemento mais estudado",
      "NEXUS-BIO no nutriON",
    ],
  },
  {
    id: "diagnostico",
    titulo: "Diagnóstico",
    icone: "🎯",
    stories: [
      "Como funciona o Diagnóstico MCE",
      "14 perguntas · 4 minutos · resultado imediato",
      "Radar de M, C e E na hora",
      "Descobre qual pilar te trava",
      "É gratuito",
      "Link na bio — faz agora",
    ],
  },
];

/* ─────────────── 5. Gatilhos de DM ─────────────── */

export type DmTrigger = { id: string; palavra: string; mensagem: string; ativo: boolean };

export const DM_TRIGGERS_PADRAO: { palavra: string; mensagem: string }[] = [
  {
    palavra: "MCE",
    mensagem:
      "Fala! Vi que você se interessou pelo Método MCE. Aqui tá o link do diagnóstico gratuito: {LINK}. 14 perguntas, resultado imediato. Qualquer dúvida, me chama aqui. 🤝",
  },
  {
    palavra: "TREINO",
    mensagem:
      "Opa! Quer saber sobre o protocolo APEX que eu uso? Começa pelo diagnóstico gratuito que eu te mostro qual pilar atacar: {LINK}",
  },
  {
    palavra: "QUERO",
    mensagem:
      "Show! Pra eu te ajudar melhor, faz o diagnóstico MCE primeiro: {LINK}. Com o resultado eu monto um plano específico pro seu caso. 🎯",
  },
  {
    palavra: "PLANO",
    mensagem:
      "Quer um plano alimentar com ciência por trás de cada alimento? Começa aqui: {LINK}. É gratuito. 🧬",
  },
  {
    palavra: "CIÊNCIA",
    mensagem:
      "Boa! Todo o conteúdo científico que eu uso tá dentro do nutriON. Começa pelo diagnóstico gratuito: {LINK} 🔬",
  },
];

export const CTA_PALAVRAS_CHAVE = [
  "Comenta MCE que eu te mando o diagnóstico no DM 📩",
  "Comenta TREINO que eu te explico o protocolo",
  "Comenta QUERO que eu te mostro como funciona",
  "Comenta PLANO que eu te mando o caminho",
  "Comenta CIÊNCIA que eu te mando os estudos",
];

export const listarTriggers = async (): Promise<DmTrigger[]> => {
  const { data, error } = await supabase
    .from("social_dm_triggers")
    .select("id, palavra, mensagem, ativo")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as DmTrigger[];
};

export const salvarTrigger = async (palavra: string, mensagem: string) => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Faça login.");
  const { error } = await supabase
    .from("social_dm_triggers")
    .insert({ user_id: auth.user.id, palavra: palavra.toUpperCase().trim(), mensagem } as never);
  if (error) throw new Error(error.message);
};

export const removerTrigger = async (id: string) => {
  const { error } = await supabase.from("social_dm_triggers").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

/* ─────────────── 6. Link na bio ─────────────── */

export const WHATSAPP = "5521965802847";

export type BioLink = { id: string; icone: string; titulo: string; sub: string; href: string; externo?: boolean };

export const BIO_LINKS: BioLink[] = [
  { id: "diagnostico", icone: "🎯", titulo: "DIAGNÓSTICO MCE GRATUITO", sub: "Descubra qual pilar te trava", href: "/diagnostico?utm_source=instagram&utm_medium=bio&utm_campaign=diagnostico" },
  { id: "pwa", icone: "📱", titulo: "BAIXAR O NUTRION", sub: "Instale no seu celular", href: "/?utm_source=instagram&utm_medium=bio&utm_campaign=pwa" },
  { id: "nexus", icone: "🧬", titulo: "NEXUS-BIO", sub: "Enciclopédia de peptídeos e microbiota", href: "/peptide-vault?utm_source=instagram&utm_medium=bio&utm_campaign=nexus" },
  { id: "whatsapp", icone: "💬", titulo: "FALAR COMIGO NO WHATSAPP", sub: "Consultoria personalizada", href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Vim pelo link da bio, quero saber mais sobre o acompanhamento.")}`, externo: true },
  { id: "instagram", icone: "📲", titulo: "ÚLTIMO POST", sub: "Ver no Instagram", href: "https://instagram.com/diogo.mell0", externo: true },
];

export const registrarCliqueBio = async (linkId: string) => {
  try {
    await supabase.from("bio_link_clicks").insert({
      link_id: linkId,
      referrer: document.referrer || null,
      utm_source: new URLSearchParams(window.location.search).get("utm_source"),
      device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
    } as never);
  } catch {
    /* clique não pode bloquear a navegação */
  }
};

export const cliquesPorLink = async (): Promise<Record<string, number>> => {
  const { data } = await supabase.from("bio_link_clicks").select("link_id").limit(5000);
  const out: Record<string, number> = {};
  for (const r of (data || []) as { link_id: string }[]) out[r.link_id] = (out[r.link_id] || 0) + 1;
  return out;
};

/* ─────────────── 7. Posts fixados ─────────────── */

export const APRESENTACAO_SLIDES = [
  { tipo: "capa", tag: "QUEM É", titulo: "Prazer, Diogo Mello.", corpo: "Coach de nutrição e treino. Criador do Método MCE." },
  { tipo: "conteudo", tag: "ORIGEM", titulo: "16 anos de Marinha.", corpo: "Disciplina no DNA. Sistema antes de motivação." },
  { tipo: "conteudo", tag: "FORMAÇÃO", titulo: "Coach certificado nos EUA.", corpo: "Ciência, não achismo." },
  { tipo: "conteudo", tag: "RAIZ", titulo: "Pai. Preto. Periférico.", corpo: "Sem manual, com sistema." },
  { tipo: "conteudo", tag: "MÉTODO", titulo: "Criei o Método MCE.", corpo: "Mentalidade. Comportamento. Execução." },
  { tipo: "conteudo", tag: "PLATAFORMA", titulo: "Construí o nutriON.", corpo: "A plataforma que eu queria ter quando comecei." },
  { tipo: "cta", tag: "COMEÇA AQUI", titulo: "Qual pilar te trava?", corpo: "Diagnóstico gratuito — link na bio.", destaque: "14 perguntas · 4 minutos · resultado imediato" },
];

export const sugestaoFixados = (r: RankingItem[], posts: PostRastreado[]) => {
  const comLeads = [...posts].sort((a, b) => (b.leads_gerados || 0) - (a.leads_gerados || 0))[0];
  const maisAlcance = [...posts]
    .filter((p) => p.alcance != null)
    .sort((a, b) => (b.alcance || 0) - (a.alcance || 0))[0];
  return [
    {
      pin: "PIN 1 · CONVERSÃO",
      icone: "🎯",
      valor: comLeads && comLeads.leads_gerados > 0 ? `${comLeads.tipo} — ${comLeads.tema || "sem tema"} (${comLeads.leads_gerados} leads)` : "Registre os leads gerados por post para o sistema apontar o melhor conversor.",
    },
    {
      pin: "PIN 2 · MAIS VIRAL",
      icone: "🔥",
      valor: maisAlcance ? `${maisAlcance.tipo} — alcance ${maisAlcance.alcance}` : "Registre alcance e salvamentos dos posts para eleger o mais viral.",
    },
    {
      pin: "PIN 3 · APRESENTAÇÃO",
      icone: "👤",
      valor: "Carrossel 'Quem é Diogo Mello' — gere abaixo e fixe no perfil.",
    },
  ];
};
