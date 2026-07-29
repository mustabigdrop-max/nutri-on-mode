// Contrato de dados dos protocolos gerados pela Edge Function `generate-training-protocol`.
// Usado tanto nos testes offline (fixtures) quanto no teste live end-to-end.
// Regra de ouro: qualquer payload que a UI vai renderizar precisa passar aqui.

export interface ContractResult {
  ok: boolean;
  errors: string[];
}

const isObj = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const nonEmptyStr = (v: unknown) => typeof v === "string" && v.trim().length > 0;

function requireFields(obj: any, fields: string[], prefix: string, errors: string[]) {
  for (const f of fields) {
    if (!nonEmptyStr(obj?.[f]) && typeof obj?.[f] !== "number") {
      errors.push(`${prefix}.${f} ausente ou vazio`);
    }
  }
}

/** Valida um exercício individual (nome + estrutura de séries). */
export function validateExercise(ex: any, prefix: string): string[] {
  const errors: string[] = [];
  if (!isObj(ex)) return [`${prefix} não é objeto`];
  if (!nonEmptyStr(ex.name)) errors.push(`${prefix}.name ausente`);

  const structure = ex.structure;
  if (!isObj(structure)) {
    errors.push(`${prefix}.structure ausente`);
    return errors;
  }

  // Um bloco de séries válido precisa de sets + reps (top_set, backoff_sets ou work_sets)
  const blockKeys = ["top_set", "backoff_sets", "work_sets"] as const;
  const present = blockKeys.filter((k) => isObj(structure[k]));
  if (present.length === 0) {
    errors.push(`${prefix}.structure sem top_set/backoff_sets/work_sets`);
  }
  for (const k of present) {
    const b = structure[k];
    const hasSets = typeof b.sets === "number" || nonEmptyStr(b.sets);
    const hasReps = typeof b.reps === "number" || nonEmptyStr(b.reps);
    if (!hasSets) errors.push(`${prefix}.structure.${k}.sets ausente`);
    if (!hasReps) errors.push(`${prefix}.structure.${k}.reps ausente`);
  }

  if (structure.feeder_sets != null && !Array.isArray(structure.feeder_sets)) {
    errors.push(`${prefix}.structure.feeder_sets deve ser array`);
  }
  return errors;
}

/** Blocos de séries preenchidos de um exercício (usado pela UI e pelos testes). */
export function exerciseSetBlocks(ex: any): any[] {
  const s = ex?.structure;
  if (!isObj(s)) return [];
  return ["top_set", "backoff_sets", "work_sets"].map((k) => s[k]).filter(isObj);
}


/** Valida um dia de treino completo (com exercícios). */
export function validateTrainingDay(day: any, prefix = "day"): ContractResult {
  const errors: string[] = [];
  if (!isObj(day)) return { ok: false, errors: [`${prefix} não é objeto`] };

  if (typeof day.day_number !== "number") errors.push(`${prefix}.day_number não numérico`);
  requireFields(day, ["session_title"], prefix, errors);

  if (!Array.isArray(day.focus_muscles) || day.focus_muscles.length === 0) {
    errors.push(`${prefix}.focus_muscles vazio`);
  }
  if (!Array.isArray(day.warmup) || day.warmup.length === 0) {
    errors.push(`${prefix}.warmup vazio`);
  }
  if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
    errors.push(`${prefix}.exercises vazio`);
  } else {
    day.exercises.forEach((ex: any, i: number) => {
      errors.push(...validateExercise(ex, `${prefix}.exercises[${i}]`));
    });
  }
  return { ok: errors.length === 0, errors };
}

/** Campos mínimos do block_overview em cada fase da geração. */
export const OVERVIEW_FIELDS_SKELETON = ["title", "split_type", "progression_model"];
export const OVERVIEW_FIELDS_FULL = [
  ...OVERVIEW_FIELDS_SKELETON,
  "periodization_model",
  "primary_goal",
];

/** Valida o esqueleto (fase 1 da geração fracionada). */
export function validateSkeleton(skeleton: any): ContractResult {
  const errors: string[] = [];
  if (!isObj(skeleton)) return { ok: false, errors: ["skeleton não é objeto"] };

  if (!isObj(skeleton.block_overview)) {
    errors.push("skeleton.block_overview ausente");
  } else {
    requireFields(skeleton.block_overview, OVERVIEW_FIELDS_SKELETON, "skeleton.block_overview", errors);
  }

  const plan = skeleton.day_plan;
  if (!Array.isArray(plan) || plan.length === 0) {
    errors.push("skeleton.day_plan vazio");
  } else {
    plan.forEach((d: any, i: number) => {
      const p = `skeleton.day_plan[${i}]`;
      if (typeof d?.day_number !== "number") errors.push(`${p}.day_number não numérico`);
      if (!nonEmptyStr(d?.session_title)) errors.push(`${p}.session_title ausente`);
      if (!Array.isArray(d?.focus_muscles) || d.focus_muscles.length === 0) {
        errors.push(`${p}.focus_muscles vazio`);
      }
    });
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Valida o protocolo completo (block_overview + training_days).
 * `source: "fractionated"` afrouxa o overview, pois nesse fluxo ele vem do esqueleto.
 */
export function validateFullProtocol(
  protocol: any,
  opts: { source?: "full" | "fractionated" } = {},
): ContractResult {
  const errors: string[] = [];
  if (!isObj(protocol)) return { ok: false, errors: ["protocol não é objeto"] };

  const overviewFields =
    opts.source === "fractionated" ? OVERVIEW_FIELDS_SKELETON : OVERVIEW_FIELDS_FULL;

  if (!isObj(protocol.block_overview)) {
    errors.push("protocol.block_overview ausente");
  } else {
    requireFields(protocol.block_overview, overviewFields, "protocol.block_overview", errors);
  }


  const days = protocol.training_days;
  if (!Array.isArray(days) || days.length === 0) {
    errors.push("protocol.training_days vazio");
  } else {
    days.forEach((d: any, i: number) => {
      const r = validateTrainingDay(d, `protocol.training_days[${i}]`);
      errors.push(...r.errors);
    });
  }

  if (protocol.improvement_alerts && !Array.isArray(protocol.improvement_alerts)) {
    errors.push("protocol.improvement_alerts deve ser array");
  }
  return { ok: errors.length === 0, errors };
}
