/**
 * KINESIS — Seção 5: GERADOR DE CONTEÚDO.
 * Transforma qualquer item do KINESIS (exercício do atlas, subgrupo do
 * laboratório muscular ou protocolo de assimetria) em conteúdo pronto para o
 * SOCIAL ON: carrossel, roteiro de Reel, post estático, stories e legenda longa.
 *
 * Determinístico: usa somente o conteúdo cadastrado na base. Todo dado carrega
 * badge e, quando existe, a fonte. Sem fonte, o badge é DICA ou ESTIMATIVA.
 */

import { buscarExercicio } from "./kinesisAtlas";
import { dossieDoGrupo } from "./kinesisMuscleLab";
import { particularidadeDoGrupo, PROTOCOLO_ASSIMETRIA } from "./kinesisAsymmetry";
import type { FormatoConteudo, KinesisBadge } from "./kinesisTypes";

export type FonteConteudo =
  | { tipo: "EXERCICIO"; ref: string }
  | { tipo: "SUBGRUPO"; grupo: string; subgrupo: string }
  | { tipo: "ASSIMETRIA"; grupo: string };

export type SlideKinesis = {
  slide: number;
  tipo: "capa" | "problema" | "solucao" | "dado" | "variacao" | "lista" | "cta";
  texto: string;
  badge?: KinesisBadge;
  fonte?: string;
  visual?: string;
};

export type ConteudoKinesis = {
  titulo: string;
  formato: FormatoConteudo;
  hook: string;
  slides: SlideKinesis[];
  roteiro?: Array<{ tempo: string; bloco: string; texto: string }>;
  stories?: Array<{ story: number; texto: string; interacao?: string }>;
  legenda: string;
  fontes: string[];
  aviso?: string;
};

const CTA_PADRAO = "Salva esse post e testa no próximo treino. Me chama no direct se quiser a avaliação completa. 🔬";
const ASSINATURA = "Coach Diogo Mello · nutrion.app.br · Transformação é sistema.";

/** Reúne o material bruto da fonte escolhida. */
type Material = {
  titulo: string;
  hook: string;
  problema: string;
  solucao: string;
  dados: Array<{ texto: string; badge: KinesisBadge; fonte?: string }>;
  lista: { rotulo: string; itens: string[] };
  extra?: { rotulo: string; itens: string[] };
  contexto: string;
};

function materialDaFonte(fonte: FonteConteudo): Material | null {
  if (fonte.tipo === "EXERCICIO") {
    const ex = buscarExercicio(fonte.ref);
    if (!ex) return null;
    const erro = ex.erros_comuns[0];
    return {
      titulo: ex.exercicio,
      hook: ex.conteudo_social.hooks[0] || `${ex.exercicio}: o detalhe que muda o estímulo`,
      problema: `${erro.erro}. ${erro.consequencia}`,
      solucao: `${erro.correcao} Cue: ${ex.cues_coaching.cue_primario}`,
      dados: [
        ...ex.conteudo_social.dados_impacto,
        {
          texto: `Ativação registrada: ${ex.emg.ativacao.map((a) => `${a.musculo} ${a.nivel}`).join(" · ")}`,
          badge: ex.emg.badge,
          fonte: ex.emg.fonte,
        },
      ],
      lista: {
        rotulo: "Variações e quando usar",
        itens: ex.variacoes_e_quando_usar.slice(0, 4).map((v) => `${v.variacao} → ${v.quando}`),
      },
      extra: {
        rotulo: "Sinais de que está errado",
        itens: ex.erros_comuns.slice(0, 3).map((e) => `${e.erro}: ${e.indicador_visual}`),
      },
      contexto: `${ex.grupo_primario} · ${ex.classificacao.padrao_motor} · nível mínimo ${ex.classificacao.nivel_minimo}`,
    };
  }

  if (fonte.tipo === "SUBGRUPO") {
    const dossie = dossieDoGrupo(fonte.grupo);
    const sub = dossie?.subgrupos.find((s) => s.subgrupo === fonte.subgrupo) || dossie?.subgrupos[0];
    if (!dossie || !sub) return null;
    return {
      titulo: `${dossie.grupo} — ${sub.subgrupo}`,
      hook: dossie.temas_conteudo[0] || `${sub.subgrupo}: o subgrupo que fica de fora do treino`,
      problema: sub.erro_comum || `${sub.subgrupo} raramente recebe estímulo específico: o treino cobre o grupo, não a porção em atraso.`,
      solucao: `${sub.principio} Cue: ${sub.cue_chave}`,
      dados: [
        { texto: `Função: ${sub.funcao}.`, badge: "DADO" },
        { texto: `Volume dedicado: ${sub.volume_recomendado}.`, badge: "DICA" },
        ...(sub.nota_apex ? [{ texto: sub.nota_apex, badge: "DICA" as KinesisBadge }] : []),
      ],
      lista: { rotulo: "Exercícios prioritários", itens: sub.exercicios_prioritarios },
      extra: { rotulo: "Princípio de desenvolvimento do grupo", itens: [dossie.principio_geral] },
      contexto: dossie.anatomia_resumo,
    };
  }

  const p = particularidadeDoGrupo(fonte.grupo);
  if (!p) return null;
  return {
    titulo: `Correção de assimetria — ${p.grupo}`,
    hook: `SEU ${p.grupo} ESTÁ ASSIMÉTRICO. E VOCÊ NEM SABE.`,
    problema: "Treino bilateral esconde a assimetria: o lado forte compensa o fraco sem você perceber.",
    solucao: "Avaliação visual e funcional, troca de bilateral por unilateral, lado fraco primeiro com 1-2 séries extras e mesma carga nos dois lados.",
    dados: [
      { texto: `Causa mais comum neste grupo: ${p.causa_comum}`, badge: "DICA" },
      { texto: `Tempo médio de correção: ${p.tempo_tipico}.`, badge: "DADO" },
      ...(p.atencao ? [{ texto: p.atencao, badge: "DICA" as KinesisBadge }] : []),
    ],
    lista: { rotulo: "Exercícios chave", itens: p.exercicios_chave },
    extra: { rotulo: "Protocolo em fases", itens: PROTOCOLO_ASSIMETRIA.map((f) => `${f.fase}. ${f.nome}`) },
    contexto: `Cue do aluno: ${p.cue}`,
  };
}

const fontesDe = (m: Material) => Array.from(new Set(m.dados.map((d) => d.fonte).filter(Boolean) as string[]));

function carrossel(m: Material): SlideKinesis[] {
  const slides: SlideKinesis[] = [
    { slide: 1, tipo: "capa", texto: m.hook.toUpperCase(), badge: "DADO", visual: "foto ou ilustração do movimento" },
    { slide: 2, tipo: "problema", texto: m.problema, badge: "DICA" },
    { slide: 3, tipo: "solucao", texto: m.solucao, badge: "DICA" },
  ];
  m.dados.slice(0, 2).forEach((d, i) =>
    slides.push({ slide: slides.length + 1, tipo: "dado", texto: d.fonte ? `${d.texto}\nFonte: ${d.fonte}` : d.texto, badge: d.badge, fonte: d.fonte }),
  );
  slides.push({
    slide: slides.length + 1,
    tipo: "lista",
    texto: `${m.lista.rotulo}:\n${m.lista.itens.map((i) => `• ${i}`).join("\n")}`,
  });
  if (m.extra)
    slides.push({
      slide: slides.length + 1,
      tipo: "variacao",
      texto: `${m.extra.rotulo}:\n${m.extra.itens.map((i) => `• ${i}`).join("\n")}`,
    });
  slides.push({ slide: slides.length + 1, tipo: "cta", texto: CTA_PADRAO });
  return slides;
}

function roteiroReel(m: Material) {
  const dado = m.dados[0];
  return [
    { tempo: "0-3s", bloco: "HOOK", texto: m.hook },
    { tempo: "3-10s", bloco: "PROBLEMA", texto: m.problema },
    { tempo: "10-28s", bloco: "SOLUÇÃO (demonstração)", texto: m.solucao },
    { tempo: "28-35s", bloco: "DADO", texto: dado ? (dado.fonte ? `${dado.texto} (${dado.fonte})` : dado.texto) : m.contexto },
    { tempo: "35-42s", bloco: "CTA", texto: CTA_PADRAO },
  ];
}

function stories(m: Material) {
  return [
    { story: 1, texto: m.hook },
    { story: 2, texto: m.problema, interacao: "Enquete: você já sentiu isso no treino? SIM / NÃO" },
    { story: 3, texto: m.solucao },
    { story: 4, texto: `${m.lista.rotulo}: ${m.lista.itens.slice(0, 3).join(" · ")}` },
    { story: 5, texto: CTA_PADRAO },
  ];
}

function legenda(m: Material, formato: FormatoConteudo): string {
  const dados = m.dados
    .slice(0, 2)
    .map((d) => (d.fonte ? `${d.texto} (${d.fonte})` : d.texto))
    .join(" ");
  const corpo = [
    m.hook,
    "",
    m.problema,
    "",
    m.solucao,
    "",
    dados,
    "",
    `${m.lista.rotulo}: ${m.lista.itens.join(" · ")}.`,
    "",
    formato === "LEGENDA_LONGA" ? m.contexto : "",
    CTA_PADRAO,
    "",
    ASSINATURA,
  ];
  return corpo.filter((l) => l !== undefined).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Gera o conteúdo completo a partir de um item do KINESIS e um formato. */
export function gerarConteudoKinesis(fonte: FonteConteudo, formato: FormatoConteudo): ConteudoKinesis | null {
  const m = materialDaFonte(fonte);
  if (!m) return null;
  const fontes = fontesDe(m);
  const semFonte = fontes.length === 0;

  const base: ConteudoKinesis = {
    titulo: m.titulo,
    formato,
    hook: m.hook,
    slides: [],
    legenda: legenda(m, formato),
    fontes,
    aviso: semFonte
      ? "Sem referência peer-reviewed cadastrada para este item: publicar com badge DICA ou ESTIMATIVA, nunca como estudo."
      : undefined,
  };

  switch (formato) {
    case "CARROSSEL_EDUCATIVO":
      return { ...base, slides: carrossel(m) };
    case "REEL_ROTEIRO":
      return { ...base, roteiro: roteiroReel(m) };
    case "STORY_SEQUENCIA":
      return { ...base, stories: stories(m) };
    case "POST_ESTATICO":
      return {
        ...base,
        slides: [
          { slide: 1, tipo: "capa", texto: m.hook.toUpperCase(), badge: "DADO", visual: "infográfico comparativo certo × errado" },
          { slide: 2, tipo: "lista", texto: `ERRADO: ${m.problema}\nCERTO: ${m.solucao}` },
          ...(m.dados[0]
            ? [{
                slide: 3,
                tipo: "dado" as const,
                texto: m.dados[0].fonte ? `${m.dados[0].texto}\nFonte: ${m.dados[0].fonte}` : m.dados[0].texto,
                badge: m.dados[0].badge,
                fonte: m.dados[0].fonte,
              }]
            : []),
        ],
      };
    default:
      return base;
  }
}

/** Exportação em markdown para levar o conteúdo ao SOCIAL ON. */
export function conteudoParaMarkdown(c: ConteudoKinesis): string {
  const linhas = [`# ${c.titulo}`, `Formato: ${c.formato}`, "", `**Hook:** ${c.hook}`, ""];
  if (c.slides.length) {
    linhas.push("## Slides");
    c.slides.forEach((s) => linhas.push(`### Slide ${s.slide} (${s.tipo})${s.badge ? ` [${s.badge}]` : ""}`, s.texto, ""));
  }
  if (c.roteiro?.length) {
    linhas.push("## Roteiro");
    c.roteiro.forEach((r) => linhas.push(`**${r.tempo} — ${r.bloco}:** ${r.texto}`));
    linhas.push("");
  }
  if (c.stories?.length) {
    linhas.push("## Stories");
    c.stories.forEach((s) => linhas.push(`**Story ${s.story}:** ${s.texto}${s.interacao ? ` — ${s.interacao}` : ""}`));
    linhas.push("");
  }
  linhas.push("## Legenda", c.legenda, "");
  if (c.fontes.length) linhas.push("## Fontes", ...c.fontes.map((f) => `- ${f}`), "");
  if (c.aviso) linhas.push(`> ${c.aviso}`);
  return linhas.join("\n");
}
