// APEX ASSESSMENT PIPELINE — SCAN FUNCIONAL → TAGS
// Converte as respostas reais do checklist funcional nas marcações (tags)
// definidas nas regras de classificação do APEX. Nenhuma tag é inferida sem
// resposta registrada; o score visual só é usado nas regras que o exigem.

export type ApexTag = string;

export interface TagsEntrada {
  grupo_key: string;
  respostas: Record<string, string>;
  visual_score?: number | null;
}

const LIMIAR_VISUAL_BAIXO = 60;

/** Marcações que exigem avaliação profissional antes de progredir. */
export const TAGS_ENCAMINHAMENTO = new Set<ApexTag>([
  "FLAG_IMPINGEMENT",
  "FLAG_DOR_JOELHO",
  "FLAG_LESAO_POSTERIOR",
  "FLAG_DIASTASE",
]);

/** Marcações biomecânicas: sempre tratadas antes de ativação e volume. */
export function isTagBiomecanica(tag: ApexTag): boolean {
  return tag.startsWith("FLAG_") || tag.startsWith("COMPENSACAO_") || tag.startsWith("DOMINANCIA_");
}

export function isTagAtivacao(tag: ApexTag): boolean {
  return tag.startsWith("DEFICIT_ATIVACAO") || tag === "AMNESIA_GLUTEA" || tag === "DEFICIT_VMO" ||
    tag.startsWith("DEFICIT_CABECA_");
}

export function isTagVolume(tag: ApexTag): boolean {
  return tag.startsWith("DEFICIT_VOLUME");
}

export function isTagAssimetria(tag: ApexTag): boolean {
  return tag.startsWith("ASSIMETRIA");
}

/**
 * Deriva as tags de um grupo a partir das respostas registradas.
 * Retorna lista sem duplicatas e na ordem em que as regras foram avaliadas.
 */
export function derivarTags(entrada: TagsEntrada): ApexTag[] {
  const r = entrada.respostas || {};
  const tags: ApexTag[] = [];
  const add = (t: ApexTag) => {
    if (!tags.includes(t)) tags.push(t);
  };
  const is = (qid: string, opcoes: string[]) => {
    const v = r[qid];
    return typeof v === "string" && opcoes.includes(v);
  };
  const respondidas = Object.keys(r);
  const todasA = respondidas.length > 0 && respondidas.every((q) => r[q] === "a");
  const score = typeof entrada.visual_score === "number" && Number.isFinite(entrada.visual_score)
    ? entrada.visual_score
    : null;
  const visualBaixo = score !== null && score < LIMIAR_VISUAL_BAIXO;

  switch (entrada.grupo_key) {
    case "dorsal":
      if (is("D1", ["b", "c", "d"]) && is("D7", ["c", "d"])) add("DEFICIT_ATIVACAO_DORSAL");
      if (is("D3", ["b"]) && is("D6", ["c"])) add("COMPENSACAO_TRAPEZIO_SUPERIOR");
      if (is("D5", ["b", "c", "d"])) add("ASSIMETRIA_DORSAL");
      if (is("D4", ["c", "d"]) && is("D1", ["b"])) add("DEFICIT_ATIVACAO_DORSAL_INFERIOR");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_DORSAL");
      break;

    case "peitoral":
      if (is("P1", ["b", "c", "d"]) && is("P2", ["c", "d"])) add("DEFICIT_ATIVACAO_PEITORAL");
      if (is("P4", ["c"]) && is("P5", ["c", "d"])) add("DEFICIT_ATIVACAO_PEITORAL_SUPERIOR");
      if (is("P1", ["b"]) && is("P3", ["c"])) add("COMPENSACAO_DELTOIDE_ANTERIOR");
      if (is("P6", ["b", "c"])) add("ASSIMETRIA_PEITORAL");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_PEITORAL");
      break;

    case "deltoides":
      if (is("O1", ["c"]) && is("O2", ["c"])) add("COMPENSACAO_TRAPEZIO_LATERAL");
      if (is("O3", ["c"]) && is("O4", ["c", "d"])) add("DEFICIT_ATIVACAO_DELTOIDE_POSTERIOR");
      if (is("O5", ["c", "d"])) add("FLAG_IMPINGEMENT");
      if (is("O6", ["b", "c"])) add("FLAG_PROTRACAO_ESCAPULAR");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_DELTOIDES");
      break;

    case "gluteos":
      if (is("G1", ["c", "d"]) && is("G2", ["c", "d"])) {
        add("DEFICIT_ATIVACAO_GLUTEO");
        add("AMNESIA_GLUTEA");
      }
      if (is("G3", ["d"])) add("COMPENSACAO_LOMBAR_EXTENSAO");
      if (is("G5", ["b", "c"])) {
        add("FLAG_VALGO");
        add("DEFICIT_ATIVACAO_GLUTEO_MEDIO");
      }
      if (is("G7", ["b", "c"])) add("FLAG_ANTERIORIZACAO_PELVICA");
      if (is("G2", ["b"]) || is("G6", ["b", "c"])) add("ASSIMETRIA_GLUTEO");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_GLUTEO");
      break;

    case "posterior_coxa":
      if (is("IC1", ["c", "d"])) add("DEFICIT_VOLUME_POSTERIOR");
      if (is("IC2", ["c", "d"])) add("COMPENSACAO_LOMBAR_HINGE");
      if (is("IC3", ["c"]) && is("IC5", ["c", "d"])) {
        add("DEFICIT_ATIVACAO_POSTERIOR");
        add("ENCURTAMENTO_POSTERIOR");
      }
      if (is("IC4", ["c", "d"])) add("FLAG_LESAO_POSTERIOR");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_POSTERIOR");
      break;

    case "quadriceps":
      if (is("Q2", ["c"]) && is("Q3", ["b", "c"])) {
        add("DEFICIT_VMO");
        add("FLAG_PATELAR");
      }
      if (is("Q1", ["b"])) add("DOMINANCIA_VASTO_LATERAL");
      if (is("Q6", ["c", "d"])) add("DEFICIT_ATIVACAO_QUAD");
      if (is("Q3", ["c", "d"])) add("FLAG_DOR_JOELHO");
      if (is("Q5", ["b", "c"])) add("ASSIMETRIA_QUADRICEPS");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_QUAD");
      break;

    case "biceps":
      if (is("B2", ["c", "d"]) && is("B4", ["b", "c"])) add("DEFICIT_CABECA_LONGA_BICEPS");
      if (is("B3", ["c"])) add("DOMINANCIA_BICEPS_PUXADAS");
      if (is("B5", ["b", "c"])) add("ASSIMETRIA_BICEPS");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_BICEPS");
      break;

    case "triceps":
      if (is("T3", ["c", "d"])) add("DEFICIT_CABECA_LONGA_TRICEPS");
      if (is("T2", ["c"])) add("DEFICIT_ESTETICO_TRICEPS");
      if (is("T5", ["b", "c"])) add("ASSIMETRIA_TRICEPS");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_TRICEPS");
      break;

    case "panturrilha":
      if (is("PA1", ["c", "d"]) && is("PA4", ["c"])) add("DEFICIT_VOLUME_PANTURRILHA");
      if (is("PA2", ["c"])) add("DEFICIT_ATIVACAO_GASTROCNEMIO");
      if (is("PA3", ["b", "c"])) add("DEFICIT_ATIVACAO_SOLEO");
      if (is("PA5", ["b", "c"]) || is("PA4", ["d"])) add("ASSIMETRIA_PANTURRILHA");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_PANTURRILHA");
      break;

    case "core":
      if (is("A3", ["c", "d"]) && is("A1", ["c", "d"])) add("DEFICIT_ATIVACAO_CORE");
      if (is("A6", ["c", "d"])) add("FLAG_DIASTASE");
      if (is("A2", ["d"])) add("COMPENSACAO_FLEXOR_QUADRIL");
      if (todasA && visualBaixo) add("DEFICIT_VOLUME_CORE");
      break;

    default:
      break;
  }

  return tags;
}
