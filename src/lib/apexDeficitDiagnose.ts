// APEX ASSESSMENT PIPELINE — CAMADA 2: DIAGNOSE
// Classificação determinística do deficit por grupo muscular.
// Usa somente as respostas reais do checklist funcional e, quando informado,
// o score visual real do APEX. Nada é estimado na ausência de dado.

import {
  APEX_CHECKLIST_BY_KEY,
  type ChecklistFlag,
  type ChecklistGroup,
} from "@/data/apexFunctionalChecklists";

export type DeficitTipo = "BIOMECANICO" | "ATIVACAO" | "VOLUME" | "ESTETICO";
export type Severidade = "LEVE" | "MODERADO" | "SEVERO";

export const ORDEM_TRATAMENTO: DeficitTipo[] = ["BIOMECANICO", "ATIVACAO", "VOLUME", "ESTETICO"];

export interface Deficit {
  tipo: DeficitTipo;
  severidade: Severidade;
  evidencias: string[];
}

export interface GrupoDiagnostico {
  grupo_key: string;
  grupo: string;
  apex_visual_score: number | null;
  respondidas: number;
  total_perguntas: number;
  deficits: Deficit[];
  assimetria: boolean;
  assimetria_evidencias: string[];
  encaminhamento: string[];
  prioridade_tratamento: DeficitTipo[];
  fase_recomendada: string;
  reavaliacao_semanas: number | null;
}

export interface ChecklistEntrada {
  grupo_key: string;
  respostas: Record<string, string>;
  visual_score?: number | null;
}

const SEVERIDADE_POR_CONTAGEM = (n: number): Severidade => (n >= 3 ? "SEVERO" : n === 2 ? "MODERADO" : "LEVE");

function severidadeEstetica(score: number): Severidade | null {
  if (score < 40) return "SEVERO";
  if (score < 60) return "MODERADO";
  if (score < 75) return "LEVE";
  return null;
}

function maiorSeveridade(a: Severidade, b: Severidade): Severidade {
  const rank: Record<Severidade, number> = { LEVE: 1, MODERADO: 2, SEVERO: 3 };
  return rank[a] >= rank[b] ? a : b;
}

function faseRecomendada(prioridades: DeficitTipo[]): string {
  if (!prioridades.length) return "Manutenção — nenhum deficit identificado nas respostas registradas";
  if (prioridades[0] === "BIOMECANICO") {
    return prioridades.includes("ATIVACAO")
      ? "CORRECT → ACTIVATE (reavaliar checklist em 4 semanas)"
      : "CORRECT (reavaliar checklist em 4 semanas)";
  }
  if (prioridades[0] === "ATIVACAO") {
    return prioridades.includes("VOLUME") || prioridades.includes("ESTETICO")
      ? "ACTIVATE → VOLUME (após 4 semanas de ativação)"
      : "ACTIVATE (reavaliar checklist em 4 semanas)";
  }
  return "VOLUME (reavaliação visual em 8 semanas)";
}

function reavaliacaoSemanas(prioridades: DeficitTipo[]): number | null {
  if (!prioridades.length) return null;
  if (prioridades.includes("BIOMECANICO") || prioridades.includes("ATIVACAO")) return 4;
  if (prioridades.includes("VOLUME")) return 8;
  return 12;
}

/**
 * Classifica o deficit de um grupo muscular a partir das respostas reais do
 * checklist funcional e, quando existir, do score visual APEX.
 */
export function diagnosticarGrupo(entrada: ChecklistEntrada): GrupoDiagnostico | null {
  const grupo: ChecklistGroup | undefined = APEX_CHECKLIST_BY_KEY[entrada.grupo_key];
  if (!grupo) return null;

  const evid: Record<ChecklistFlag, string[]> = {
    OK: [],
    ATIVACAO: [],
    BIOMECANICO: [],
    VOLUME: [],
    ASSIMETRIA: [],
    DOR: [],
    ENCAMINHAMENTO: [],
  };

  let respondidas = 0;
  for (const q of grupo.perguntas) {
    const escolhida = entrada.respostas?.[q.id];
    if (!escolhida) continue;
    const opcao = q.opcoes.find((op) => op.key === escolhida);
    if (!opcao) continue;
    respondidas += 1;
    const texto = `${q.id}: ${opcao.texto} (opção ${opcao.key})`;
    for (const flag of opcao.flags) evid[flag].push(texto);
  }

  if (respondidas === 0) return null;

  const deficits: Deficit[] = [];
  const push = (tipo: DeficitTipo, evidencias: string[]) => {
    if (!evidencias.length) return;
    deficits.push({ tipo, severidade: SEVERIDADE_POR_CONTAGEM(evidencias.length), evidencias: [...evidencias] });
  };

  push("BIOMECANICO", evid.BIOMECANICO);
  push("ATIVACAO", evid.ATIVACAO);
  push("VOLUME", evid.VOLUME);

  const score =
    typeof entrada.visual_score === "number" && Number.isFinite(entrada.visual_score)
      ? entrada.visual_score
      : null;

  if (score !== null) {
    const sev = severidadeEstetica(score);
    if (sev) {
      deficits.push({
        tipo: "ESTETICO",
        severidade: sev,
        evidencias: [`APEX Visual Score ${grupo.nome}: ${score}/100`],
      });
    }
  }

  const temBio = deficits.some((d) => d.tipo === "BIOMECANICO");
  const temAtiv = deficits.some((d) => d.tipo === "ATIVACAO");
  const estetico = deficits.find((d) => d.tipo === "ESTETICO");

  // Deficit estético isolado = falta de volume. Reclassifica mantendo a evidência real.
  if (estetico && !temBio && !temAtiv) {
    const volume = deficits.find((d) => d.tipo === "VOLUME");
    if (volume) {
      volume.severidade = maiorSeveridade(volume.severidade, estetico.severidade);
      volume.evidencias = [...volume.evidencias, ...estetico.evidencias];
    } else {
      deficits.push({
        tipo: "VOLUME",
        severidade: estetico.severidade,
        evidencias: [...estetico.evidencias, "Sem deficit de ativação ou biomecânico nas respostas registradas"],
      });
    }
  }

  const prioridade_tratamento = ORDEM_TRATAMENTO.filter((t) => deficits.some((d) => d.tipo === t));
  deficits.sort((a, b) => ORDEM_TRATAMENTO.indexOf(a.tipo) - ORDEM_TRATAMENTO.indexOf(b.tipo));

  const encaminhamento = evid.ENCAMINHAMENTO.map(
    (e) => `${e} — recomendamos avaliação profissional antes de progredir neste protocolo`,
  );

  return {
    grupo_key: grupo.key,
    grupo: grupo.nome,
    apex_visual_score: score,
    respondidas,
    total_perguntas: grupo.perguntas.length,
    deficits,
    assimetria: evid.ASSIMETRIA.length > 0,
    assimetria_evidencias: evid.ASSIMETRIA,
    encaminhamento,
    prioridade_tratamento,
    fase_recomendada: faseRecomendada(prioridade_tratamento),
    reavaliacao_semanas: reavaliacaoSemanas(prioridade_tratamento),
  };
}

export interface PrioridadeGlobal {
  grupo: string;
  grupo_key: string;
  tipo: DeficitTipo;
  severidade: Severidade;
}

export interface DiagnosticoCompleto {
  grupos: GrupoDiagnostico[];
  prioridades: PrioridadeGlobal[];
  encaminhamentos: string[];
  proxima_reavaliacao: { checklist_semanas: number | null; visual_semanas: number | null };
}

const PESO_SEVERIDADE: Record<Severidade, number> = { SEVERO: 3, MODERADO: 2, LEVE: 1 };

/**
 * Diagnóstico do atleta: classifica cada grupo e ordena as prioridades globais
 * por tipo de deficit (biomecânico antes de volume) e severidade.
 */
export function diagnosticarAtleta(entradas: ChecklistEntrada[]): DiagnosticoCompleto {
  const grupos = entradas
    .map(diagnosticarGrupo)
    .filter((g): g is GrupoDiagnostico => g !== null);

  const prioridades: PrioridadeGlobal[] = [];
  for (const g of grupos) {
    for (const d of g.deficits) {
      if (d.tipo === "ESTETICO" && g.deficits.some((x) => x.tipo === "VOLUME")) continue;
      prioridades.push({ grupo: g.grupo, grupo_key: g.grupo_key, tipo: d.tipo, severidade: d.severidade });
    }
  }
  prioridades.sort((a, b) => {
    const ordem = ORDEM_TRATAMENTO.indexOf(a.tipo) - ORDEM_TRATAMENTO.indexOf(b.tipo);
    if (ordem !== 0) return ordem;
    return PESO_SEVERIDADE[b.severidade] - PESO_SEVERIDADE[a.severidade];
  });

  const encaminhamentos = grupos.flatMap((g) => g.encaminhamento.map((e) => `${g.grupo} — ${e}`));

  const precisaChecklist = grupos.some((g) =>
    g.prioridade_tratamento.some((t) => t === "BIOMECANICO" || t === "ATIVACAO"),
  );
  const precisaVisual = grupos.some((g) =>
    g.prioridade_tratamento.some((t) => t === "VOLUME" || t === "ESTETICO"),
  );

  return {
    grupos,
    prioridades,
    encaminhamentos,
    proxima_reavaliacao: {
      checklist_semanas: precisaChecklist ? 4 : null,
      visual_semanas: precisaVisual ? 8 : null,
    },
  };
}

export function addWeeksISO(weeks: number, from: Date = new Date()): string {
  const d = new Date(from.getTime() + weeks * 7 * 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}
