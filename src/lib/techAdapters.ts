/**
 * Conversores: conteúdo de cada gerador do nutriON → `TechSlide[]`.
 * Mantêm a MESMA ordem e quantidade de slides do template clássico, para que
 * os rótulos, legendas e o editor de texto continuem válidos nos dois estilos.
 * Nenhum valor é criado aqui — só reorganizado para o desenho TECH.
 */

import type { TechSlide } from "@/lib/techSlideTemplate";
import { MCE_CTA_SLIDE, type MceCarouselContent } from "@/lib/mceCarouselTemplate";
import { BIOMECH_CTA_SLIDE, type BiomechCarouselContent } from "@/lib/biomechCarouselTemplate";
import type { MitoMetodoContent } from "@/lib/mitoMetodoTemplate";
import type { ModuleSlide } from "@/lib/moduleCarouselTemplate";
import { RP_CTA_SLIDE, type ResultadoProtocoloContent } from "@/lib/resultadoProtocoloTemplate";
import type { RefeicaoSlide } from "@/lib/refeicaoCarouselTemplate";
import type { TreinoHoje } from "@/lib/treinoHojeData";
import { FAIXA_DURACAO } from "@/lib/socialDuracao";

const CTA_NOTA = "14 perguntas · 4 minutos · resultado imediato";

/* ── MCE ─────────────────────────────────────────────── */
export const mceToTech = (c: MceCarouselContent): TechSlide[] => {
  const pilar = (key: "M" | "C" | "E", nome: string) => {
    const p = c.pilares?.[key] || { frase: "", corpo: "" };
    return {
      tipo: "conteudo" as const,
      eyebrow: `PILAR ${key}`,
      titulo: nome,
      subtitulo: p.frase,
      texto: p.corpo,
      bullets: p.lista || [],
      pill: { text: "MÉTODO MCE" },
    };
  };
  return [
    { tipo: "capa", eyebrow: c.capa?.tag || "MÉTODO MCE", titulo: c.capa?.titulo || c.tema, subtitulo: c.capa?.subtitulo },
    {
      tipo: "conteudo",
      eyebrow: c.dor?.tag || "O PROBLEMA",
      titulo: c.dor?.titulo || "",
      texto: c.dor?.corpo,
      faixa: c.dor?.impacto ? { texto: c.dor.impacto } : undefined,
    },
    pilar("M", "MENTALIDADE"),
    pilar("C", "COMPORTAMENTO"),
    pilar("E", "EXECUÇÃO"),
    {
      tipo: "conteudo",
      eyebrow: c.integracao?.tag || "COMO SE CONECTA",
      titulo: c.integracao?.titulo || "",
      dados: c.integracao?.verbos
        ? [
            { label: "MENTALIDADE", valor: c.integracao.verbos.M || "" },
            { label: "COMPORTAMENTO", valor: c.integracao.verbos.C || "" },
            { label: "EXECUÇÃO", valor: c.integracao.verbos.E || "" },
          ].filter((d) => d.valor)
        : undefined,
      texto: c.integracao?.conexao,
    },
    {
      tipo: "cta",
      eyebrow: MCE_CTA_SLIDE.tag,
      titulo: MCE_CTA_SLIDE.titulo,
      subtitulo: MCE_CTA_SLIDE.subtitulo,
      faixa: { texto: MCE_CTA_SLIDE.caixa },
      nota: CTA_NOTA,
    },
  ];
};

/* ── Mito ou Método ──────────────────────────────────── */
export const mitoToTech = (c: MitoMetodoContent): TechSlide[] => {
  const cor = c.veredito === "MITO" ? "#E24B4A" : c.veredito === "MÉTODO" ? "#00D4FF" : "#B8922A";
  return [
    { tipo: "capa", eyebrow: "MITO OU MÉTODO", titulo: c.crenca || "", subtitulo: "O que a ciência mostra." },
    {
      tipo: "conteudo",
      eyebrow: "VEREDITO",
      titulo: c.veredito || "",
      pill: { text: c.veredito || "", color: cor },
      texto: c.explicacao,
    },
    ...(c.evidencias || []).map((e) => ({
      tipo: "conteudo" as const,
      eyebrow: "EVIDÊNCIA",
      titulo: e.titulo || "",
      texto: e.corpo,
    })),
    {
      tipo: "conteudo",
      eyebrow: "O QUE FAZER",
      titulo: "NA PRÁTICA",
      bullets: c.alternativa || [],
    },
    {
      tipo: "cta",
      eyebrow: "PRÓXIMO PASSO",
      titulo: "Diagnóstico MCE gratuito",
      subtitulo: "Descubra o que está travando seu resultado.",
      faixa: { texto: "Link na bio" },
      nota: CTA_NOTA,
    },
  ];
};

/* ── BiomechanicsVault ───────────────────────────────── */
export const biomechToTech = (c: BiomechCarouselContent): TechSlide[] => [
  {
    tipo: "capa",
    eyebrow: c.capa?.tag || "ANÁLISE BIOMECÂNICA",
    titulo: c.capa?.titulo || c.exercicio,
    subtitulo: c.capa?.subtitulo,
  },
  {
    tipo: "conteudo",
    eyebrow: "O QUE A CIÊNCIA MOSTRA",
    titulo: c.dado?.titulo || "",
    cards: [{ destaque: c.dado?.numero, texto: c.dado?.corpo }],
    pill: { text: "PESQUISA" },
  },
  ...(c.pontos || []).map((p) => ({
    tipo: "conteudo" as const,
    eyebrow: "EXECUÇÃO",
    titulo: p.titulo || "",
    texto: p.corpo,
  })),
  {
    tipo: "conteudo",
    eyebrow: "NA PRÁTICA",
    titulo: c.aplicacao?.titulo || "",
    texto: c.aplicacao?.corpo,
  },
  ...(c.fontes?.length
    ? [
        {
          tipo: "conteudo" as const,
          eyebrow: "REFERÊNCIAS",
          titulo: "FONTES",
          cards: c.fontes.slice(0, 5).map((f) => ({ texto: f })),
        },
      ]
    : []),
  {
    tipo: "cta",
    eyebrow: BIOMECH_CTA_SLIDE.tag,
    titulo: BIOMECH_CTA_SLIDE.titulo,
    subtitulo: BIOMECH_CTA_SLIDE.subtitulo,
    faixa: { texto: BIOMECH_CTA_SLIDE.caixa },
    nota: CTA_NOTA,
  },
];

/* ── Conteúdo de módulo (botão 📲) ───────────────────── */
export const moduleToTech = (slides: ModuleSlide[], tituloModulo: string): TechSlide[] =>
  (slides || []).map((s) => {
    const tipo = (s.tipo || "conteudo").toLowerCase();
    if (tipo === "capa") {
      return { tipo: "capa", eyebrow: s.tag || tituloModulo, titulo: s.titulo || "", subtitulo: s.destaque, texto: s.corpo };
    }
    if (tipo === "cta") {
      return {
        tipo: "cta",
        eyebrow: s.tag || "PRÓXIMO PASSO",
        titulo: s.titulo || "",
        subtitulo: s.corpo,
        faixa: { texto: s.destaque || "Link na bio" },
        nota: CTA_NOTA,
      };
    }
    return {
      tipo: "conteudo",
      eyebrow: s.tag || tituloModulo,
      titulo: s.titulo || "",
      texto: s.corpo,
      dados: s.dados,
      faixa: s.destaque ? { texto: s.destaque } : undefined,
    };
  });

/* ── Resultado + Protocolo ───────────────────────────── */
export const resultadoToTech = (c: ResultadoProtocoloContent): TechSlide[] => {
  const exercicios = (c.exercicios || []).slice(0, 8);
  const metade = Math.ceil(exercicios.length / 2) || 1;
  const bloco = (itens: typeof exercicios, titulo: string): TechSlide => ({
    tipo: "conteudo",
    eyebrow: "TREINO REAL",
    titulo,
    cards: itens.map((e) => ({
      titulo: e.nome,
      texto: (e.sets || []).map((s) => [s.label, s.detail].filter(Boolean).join(" · ")).join("   |   "),
      nota: e.alvo,
    })),
  });
  return [
    { tipo: "capa", eyebrow: c.capa?.tag || "RESULTADO + PROTOCOLO", titulo: c.capa?.titulo || "", subtitulo: c.capa?.subtitulo },
    {
      tipo: "conteudo",
      eyebrow: "O RESULTADO",
      titulo: c.resultado?.titulo || "",
      cards: [{ destaque: c.resultado?.numero, titulo: c.resultado?.numeroLabel, texto: c.resultado?.corpo }],
    },
    {
      tipo: "conteudo",
      eyebrow: "A SESSÃO",
      titulo: c.treino?.nome || "",
      dados: [
        { label: "DURAÇÃO", valor: c.treino?.duracao || FAIXA_DURACAO },
        ...(c.treino?.grupos || []).slice(0, 3).map((g, i) => ({ label: `GRUPO ${i + 1}`, valor: g })),
      ],
    },
    ...(c.aquecimento?.length
      ? [
          {
            tipo: "conteudo" as const,
            eyebrow: "PREPARAÇÃO",
            titulo: "AQUECIMENTO",
            cards: c.aquecimento.map((a) => ({ titulo: a.nome, texto: a.detail })),
          },
        ]
      : []),
    bloco(exercicios.slice(0, metade), "EXERCÍCIOS"),
    ...(exercicios.length > metade ? [bloco(exercicios.slice(metade), "EXERCÍCIOS")] : []),
    {
      tipo: "conteudo",
      eyebrow: "SISTEMA DE TREINO",
      titulo: c.apex?.nome || "",
      bullets: c.apex?.principios || [],
    },
    {
      tipo: "conteudo",
      eyebrow: "NUTRIÇÃO",
      titulo: c.nutricao?.titulo || "",
      texto: c.nutricao?.corpo,
    },
    {
      tipo: "conteudo",
      eyebrow: "EM RESUMO",
      titulo: c.resumo?.protocolo || "",
      faixa: c.resumo?.frase ? { texto: c.resumo.frase } : undefined,
    },
    {
      tipo: "cta",
      eyebrow: RP_CTA_SLIDE.tag,
      titulo: RP_CTA_SLIDE.titulo,
      subtitulo: RP_CTA_SLIDE.subtitulo,
      faixa: { texto: RP_CTA_SLIDE.caixa },
      nota: CTA_NOTA,
    },
  ];
};

/* ── Refeição registrada ─────────────────────────────── */
export const refeicaoToTech = (slides: RefeicaoSlide[]): TechSlide[] =>
  (slides || []).map((s): TechSlide => {
    switch (s.tipo) {
      case "CAPA":
        return { tipo: "capa", eyebrow: s.tag, titulo: s.titulo, subtitulo: s.subtitulo };
      case "FICHA":
        return { tipo: "conteudo", eyebrow: s.tag, titulo: s.titulo, dados: s.linhas, nota: s.nota };
      case "LISTA":
        return {
          tipo: "conteudo",
          eyebrow: s.tag,
          titulo: s.titulo,
          cards: s.itens.map((i) => ({ titulo: i.titulo, texto: i.sub })),
          nota: s.nota,
        };
      case "CIENCIA":
        return {
          tipo: "conteudo",
          eyebrow: s.tag,
          titulo: s.alimento,
          subtitulo: s.nutriente,
          texto: s.mecanismo,
          cards: s.dado ? [{ destaque: s.dado, texto: s.bonus }] : s.bonus ? [{ texto: s.bonus }] : undefined,
          nota: s.fonte,
        };
      case "CTA":
        return {
          tipo: "cta",
          eyebrow: s.tag,
          titulo: s.titulo,
          subtitulo: s.subtitulo,
          faixa: { texto: s.caixa },
          nota: s.caixaSub,
        };
      default:
        return { tipo: "conteudo", eyebrow: s.tag, titulo: s.titulo, texto: s.corpo, bullets: s.bullets };
    }
  });

/* ── Treino de hoje (TrainingON) ─────────────────────── */
export const treinoHojeToTech = (t: TreinoHoje): TechSlide[] => {
  const exercicios = (t.exercicios || []).slice(0, 10);
  const metade = Math.ceil(exercicios.length / 2) || 1;
  const bloco = (itens: typeof exercicios): TechSlide => ({
    tipo: "conteudo",
    eyebrow: "SESSÃO DE HOJE",
    titulo: t.nomeTreino || "TREINO DE HOJE",
    cards: itens.map((e) => ({
      titulo: e.nome,
      texto: (e.sets || []).map((s) => [s.label, s.detail].filter(Boolean).join(" · ")).join("   |   "),
      nota: e.alvo,
    })),
  });
  const nutri = t.nutricao;
  return [
    {
      tipo: "capa",
      eyebrow: `${t.diaSemana || ""} · ${t.dataLabel || ""}`.trim(),
      titulo: t.nomeTreino || "TREINO DE HOJE",
      subtitulo: (t.grupos || []).join(" · "),
      texto: t.duracao || FAIXA_DURACAO,
    },
    ...(t.aquecimento?.length
      ? [
          {
            tipo: "conteudo" as const,
            eyebrow: "PREPARAÇÃO",
            titulo: "AQUECIMENTO",
            cards: t.aquecimento.map((a) => ({
              titulo: a.nome,
              texto: (a.sets || []).map((s) => [s.label, s.detail].filter(Boolean).join(" · ")).join("   |   "),
            })),
          },
        ]
      : []),
    bloco(exercicios.slice(0, metade)),
    ...(exercicios.length > metade ? [bloco(exercicios.slice(metade))] : []),
    ...(nutri && (nutri.metaDiaKcal || nutri.proteinaG || nutri.carboG)
      ? [
          {
            tipo: "conteudo" as const,
            eyebrow: "AJUSTE DE CALORIAS PELO TREINO",
            titulo: "NUTRIÇÃO DO DIA",
            dados: [
              ...(nutri.metaDiaKcal ? [{ label: "META DO DIA", valor: `${nutri.metaDiaKcal} kcal` }] : []),
              ...(nutri.proteinaG ? [{ label: "PROTEÍNA", valor: `${nutri.proteinaG} g` }] : []),
              ...(nutri.carboG ? [{ label: "CARBOIDRATO", valor: `${nutri.carboG} g` }] : []),
              ...(nutri.treinoTipo ? [{ label: "TIPO DE DIA", valor: nutri.treinoTipo }] : []),
            ],
          },
        ]
      : []),
    {
      tipo: "cta",
      eyebrow: "PRÓXIMO PASSO",
      titulo: "Quer um treino assim pra você?",
      subtitulo: "Descubra o que está travando seu resultado.",
      faixa: { texto: "Link na bio" },
      nota: CTA_NOTA,
    },
  ];
};
