// APEX ASSESSMENT PIPELINE — CAMADA 2: DIAGNOSE CRUZADO (visual × funcional)
// Cruza o score real do APEX Visual com as marcações reais do checklist funcional.
// Nada é estimado: sem score, o eixo visual fica indefinido; sem resposta, o eixo
// funcional fica indefinido. A ordem de tratamento é fixa:
// BIOMECANICO > ATIVACAO > VOLUME > ESTETICO > ASSIMETRIA.

import { APEX_CHECKLIST_BY_KEY } from "@/data/apexFunctionalChecklists";
import {
  derivarTags,
  isTagAssimetria,
  isTagAtivacao,
  isTagBiomecanica,
  isTagVolume,
  TAGS_ENCAMINHAMENTO,
  type ApexTag,
} from "@/lib/apexChecklistTags";

export type TipoDeficit = "ADEQUADO" | "BIOMECANICO" | "ATIVACAO" | "VOLUME" | "ESTETICO" | "ASSIMETRIA";
export type SeveridadeCruzada = "LEVE" | "MODERADO" | "SEVERO";

export const LIMIAR_VISUAL_BAIXO = 60;
export const LIMIAR_VISUAL_ADEQUADO = 75;
export const LIMIAR_ASSIMETRIA_PCT = 8;
export const MAX_GRUPOS_PRIORIZADOS = 3;

export interface EntradaCruzada {
  grupo_key: string;
  respostas: Record<string, string>;
  visual_score?: number | null;
  assimetria_pct?: number | null;
}

export interface GrupoCruzado {
  grupo_key: string;
  grupo: string;
  subgrupos: string[];
  apex_visual: { score: number | null; assimetria_pct: number | null; assimetria_flag: boolean };
  checklist_tags: ApexTag[];
  tipo_primario: TipoDeficit;
  tipo_secundario: TipoDeficit | null;
  severidade: SeveridadeCruzada | null;
  fase: string;
  evidencias_visuais: string[];
  evidencias_funcionais: string[];
  encaminhamentos: string[];
}

export interface DiagnosticoCruzado {
  grupos: GrupoCruzado[];
  priorizados: GrupoCruzado[];
  fila: GrupoCruzado[];
  encaminhamentos: string[];
}

function severidade(score: number | null, tags: ApexTag[]): SeveridadeCruzada | null {
  const bio = tags.some(isTagBiomecanica);
  if (score !== null) {
    if (score < 40) return "SEVERO";
    if (score < LIMIAR_VISUAL_BAIXO) return bio ? "SEVERO" : "MODERADO";
    if (score < LIMIAR_VISUAL_ADEQUADO) return bio ? "MODERADO" : "LEVE";
    return tags.length ? (bio ? "MODERADO" : "LEVE") : null;
  }
  if (bio) return "MODERADO";
  if (tags.length >= 3) return "SEVERO";
  if (tags.length === 2) return "MODERADO";
  if (tags.length === 1) return "LEVE";
  return null;
}

function fase(primario: TipoDeficit, secundario: TipoDeficit | null): string {
  switch (primario) {
    case "BIOMECANICO":
      return secundario === "ATIVACAO"
        ? "CORRECT 4-6 semanas → ACTIVATE após o checklist confirmar melhora"
        : "CORRECT 4-6 semanas, reavaliar checklist";
    case "ATIVACAO":
      return secundario === "VOLUME" || secundario === "ESTETICO"
        ? "ACTIVATE 4 semanas → VOLUME após ativação bem-sucedida"
        : "ACTIVATE 4 semanas, reavaliar checklist";
    case "VOLUME":
      return "VOLUME imediato, reavaliação visual em 8 semanas";
    case "ESTETICO":
      return "Redistribuir ênfase para o subgrupo em atraso, reavaliação visual em 8 semanas";
    case "ASSIMETRIA":
      return "Trabalho unilateral com o lado fraco primeiro, reavaliar em 4 semanas";
    default:
      return "Manutenção";
  }
}

const RANK_TIPO: Record<TipoDeficit, number> = {
  BIOMECANICO: 1,
  ATIVACAO: 2,
  VOLUME: 3,
  ESTETICO: 4,
  ASSIMETRIA: 5,
  ADEQUADO: 6,
};
const RANK_SEV: Record<SeveridadeCruzada, number> = { SEVERO: 1, MODERADO: 2, LEVE: 3 };

/** Classifica um grupo cruzando score visual real e marcações reais do checklist. */
export function diagnosticarGrupoCruzado(entrada: EntradaCruzada): GrupoCruzado | null {
  const grupo = APEX_CHECKLIST_BY_KEY[entrada.grupo_key];
  if (!grupo) return null;

  const respondidas = Object.keys(entrada.respostas || {}).length;
  const score =
    typeof entrada.visual_score === "number" && Number.isFinite(entrada.visual_score) ? entrada.visual_score : null;
  const assimetriaPct =
    typeof entrada.assimetria_pct === "number" && Number.isFinite(entrada.assimetria_pct) ? entrada.assimetria_pct : null;
  if (respondidas === 0 && score === null) return null;

  const tags = derivarTags({ grupo_key: entrada.grupo_key, respostas: entrada.respostas, visual_score: score });
  const assimetriaFlag = assimetriaPct !== null && assimetriaPct > LIMIAR_ASSIMETRIA_PCT;

  const temBio = tags.some(isTagBiomecanica);
  const temAtiv = tags.some(isTagAtivacao);
  const temVol = tags.some(isTagVolume);
  const temAssim = tags.some(isTagAssimetria) || assimetriaFlag;
  const visualBaixo = score !== null && score < LIMIAR_VISUAL_BAIXO;

  let primario: TipoDeficit = "ADEQUADO";
  let secundario: TipoDeficit | null = null;

  if (temBio) {
    primario = "BIOMECANICO";
    if (temAtiv) secundario = "ATIVACAO";
    else if (visualBaixo) secundario = "VOLUME";
  } else if (temAtiv) {
    primario = "ATIVACAO";
    if (visualBaixo) secundario = "VOLUME";
    else if (score !== null && score < LIMIAR_VISUAL_ADEQUADO) secundario = "ESTETICO";
  } else if (temVol || visualBaixo) {
    primario = "VOLUME";
  } else if (score !== null && score < LIMIAR_VISUAL_ADEQUADO) {
    primario = "ESTETICO";
  } else if (temAssim) {
    primario = "ASSIMETRIA";
  }

  if (primario !== "ADEQUADO" && temAssim && secundario === null && primario !== "ASSIMETRIA") {
    secundario = "ASSIMETRIA";
  }

  const evidencias_visuais: string[] = [];
  if (score !== null) evidencias_visuais.push(`Score visual ${grupo.nome}: ${score}/100`);
  if (assimetriaPct !== null) {
    evidencias_visuais.push(
      `Assimetria D/E: ${assimetriaPct}%${assimetriaFlag ? ` (acima do limiar de ${LIMIAR_ASSIMETRIA_PCT}%)` : ""}`,
    );
  }

  const evidencias_funcionais: string[] = [];
  for (const q of grupo.perguntas) {
    const escolhida = entrada.respostas?.[q.id];
    if (!escolhida) continue;
    const opcao = q.opcoes.find((op) => op.key === escolhida);
    if (!opcao) continue;
    if (opcao.flags.includes("OK")) continue;
    evidencias_funcionais.push(`${q.id}(${opcao.key}): ${opcao.texto}`);
  }

  const encaminhamentos = tags
    .filter((t) => TAGS_ENCAMINHAMENTO.has(t))
    .map((t) => `${grupo.nome} — ${t}: recomendamos avaliação profissional antes de progredir neste protocolo`);

  return {
    grupo_key: grupo.key,
    grupo: grupo.nome,
    subgrupos: grupo.subgrupos,
    apex_visual: { score, assimetria_pct: assimetriaPct, assimetria_flag: assimetriaFlag },
    checklist_tags: tags,
    tipo_primario: primario,
    tipo_secundario: secundario,
    severidade: primario === "ADEQUADO" ? null : severidade(score, tags),
    fase: fase(primario, secundario),
    evidencias_visuais,
    evidencias_funcionais,
    encaminhamentos,
  };
}

/**
 * Diagnóstico cruzado do atleta. Ordena por tipo (biomecânico primeiro, com
 * encaminhamento à frente) e severidade; no máximo 3 grupos por ciclo, o resto
 * entra na fila do próximo mesociclo.
 */
export function diagnosticarAtletaCruzado(entradas: EntradaCruzada[]): DiagnosticoCruzado {
  const grupos = entradas
    .map(diagnosticarGrupoCruzado)
    .filter((g): g is GrupoCruzado => g !== null);

  const comDeficit = grupos.filter((g) => g.tipo_primario !== "ADEQUADO");
  comDeficit.sort((a, b) => {
    const encA = a.encaminhamentos.length > 0 ? 0 : 1;
    const encB = b.encaminhamentos.length > 0 ? 0 : 1;
    if (a.tipo_primario === "BIOMECANICO" && b.tipo_primario === "BIOMECANICO" && encA !== encB) return encA - encB;
    const tipo = RANK_TIPO[a.tipo_primario] - RANK_TIPO[b.tipo_primario];
    if (tipo !== 0) return tipo;
    const sa = a.severidade ? RANK_SEV[a.severidade] : 4;
    const sb = b.severidade ? RANK_SEV[b.severidade] : 4;
    if (sa !== sb) return sa - sb;
    return (a.apex_visual.score ?? 100) - (b.apex_visual.score ?? 100);
  });

  return {
    grupos,
    priorizados: comDeficit.slice(0, MAX_GRUPOS_PRIORIZADOS),
    fila: comDeficit.slice(MAX_GRUPOS_PRIORIZADOS),
    encaminhamentos: grupos.flatMap((g) => g.encaminhamentos),
  };
}
