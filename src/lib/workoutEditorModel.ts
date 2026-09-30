import { parseProtocolToDays, type ParsedDay, type ParsedExercise } from "@/lib/parseProtocolMarkdown";

export type EditableExercise = {
  name: string;
  muscle_target: string;
  sets: string;
  reps: string;
  rpe: string;
  rir: string;
  rest: string;
  notes: string;
  /** Objeto original do exercício — preservado ao salvar (top_set, tempo, load…). */
  raw?: Record<string, unknown>;
};

export type EditableDay = {
  day_number: number;
  session_title: string;
  estimated_duration: string;
  session_notes: string;
  warmup: EditableExercise[];
  exercises: EditableExercise[];
  /** Objeto original do dia — chaves extras preservadas ao salvar. */
  raw?: Record<string, unknown>;
};

export type EditableProtocol = {
  /** Demais chaves do JSON original (block_overview, phase_plan…) preservadas ao salvar. */
  extra: Record<string, unknown>;
  days: EditableDay[];
  /** true quando o conteúdo original já era estruturado com dias e exercícios. */
  wasStructured: boolean;
  /** Texto original quando o protocolo era texto livre (preservado em original_text). */
  originalText?: string;
};

export const emptyExercise = (): EditableExercise => ({
  name: "",
  muscle_target: "",
  sets: "",
  reps: "",
  rpe: "",
  rir: "",
  rest: "",
  notes: "",
});

export const emptyDay = (dayNumber: number): EditableDay => ({
  day_number: dayNumber,
  session_title: "",
  estimated_duration: "",
  session_notes: "",
  warmup: [],
  exercises: [emptyExercise()],
});

const text = (value: unknown): string =>
  value === null || value === undefined || typeof value === "object" ? "" : String(value).trim();

/** Extrai um campo numérico/textual do detalhe já formatado ("3 séries · 8-10 reps · RPE 8"). */
const fromDetail = (detail: string, pattern: RegExp): string => detail.match(pattern)?.[1]?.trim() || "";

function exerciseFromRaw(raw: any): EditableExercise {
  const safe = raw && typeof raw === "object" ? raw : {};
  const work = safe.structure && typeof safe.structure === "object" ? safe.structure.work_sets : null;
  const base = work && typeof work === "object" ? work : safe;
  return {
    name: text(safe.name) || text(safe.nome) || text(safe.exercise),
    muscle_target: text(safe.muscle_target) || text(safe.muscle),
    sets: text(base.sets),
    reps: text(base.reps),
    rpe: text(base.rpe),
    rir: text(base.rir),
    rest: text(base.rest) || text(base.rest_seconds) || text(base.descanso),
    notes: text(safe.notes) || text(safe.observacao) || text(safe.execution_cues),
    raw: raw && typeof raw === "object" ? { ...raw } : undefined,
  };
}

function exerciseFromParsed(exercise: ParsedExercise): EditableExercise {
  const detail = exercise.sets.map((set) => set.detail).join(" · ");
  return {
    name: exercise.name,
    muscle_target: exercise.muscle_target || "",
    sets: fromDetail(detail, /(\d+)\s*séries/i),
    reps: fromDetail(detail, /([\d]+(?:\s*[-–]\s*\d+)?)\s*reps/i),
    rpe: fromDetail(detail, /RPE\s*([\d.,]+)/i),
    rir: fromDetail(detail, /RIR\s*([\d.,]+)/i),
    rest: fromDetail(detail, /Descanso:\s*([^·]+)/i),
    notes: exercise.notes || "",
  };
}

function dayFromParsed(day: ParsedDay): EditableDay {
  return {
    day_number: day.day_number,
    session_title: day.session_title,
    estimated_duration: day.estimated_duration,
    session_notes: day.session_notes || "",
    warmup: (day.warmup || []).map(exerciseFromParsed),
    exercises: (day.exercises || []).map(exerciseFromParsed),
  };
}

/** Converte o conteúdo salvo do protocolo em um modelo editável, sem inventar dados. */
export function toEditableProtocol(content: unknown): EditableProtocol {
  let parsedJson: any = null;
  if (content && typeof content === "object") parsedJson = content;
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try { parsedJson = JSON.parse(trimmed); } catch { parsedJson = null; }
    }
  }

  const rawDays = Array.isArray(parsedJson)
    ? parsedJson
    : Array.isArray(parsedJson?.training_days)
      ? parsedJson.training_days
      : null;

  if (rawDays && rawDays.length > 0) {
    const extra: Record<string, unknown> = {};
    if (parsedJson && !Array.isArray(parsedJson)) {
      Object.entries(parsedJson).forEach(([key, value]) => {
        if (key !== "training_days") extra[key] = value;
      });
    }
    return {
      extra,
      wasStructured: true,
      days: rawDays.map((raw: any, index: number) => ({
        day_number: Number.isFinite(Number(raw?.day_number)) ? Number(raw.day_number) : index + 1,
        session_title: text(raw?.session_title) || text(raw?.title),
        estimated_duration: text(raw?.estimated_duration),
        session_notes: text(raw?.session_notes),
        warmup: (Array.isArray(raw?.warmup) ? raw.warmup : []).map(exerciseFromRaw),
        exercises: (Array.isArray(raw?.exercises) ? raw.exercises : []).map(exerciseFromRaw),
        raw: raw && typeof raw === "object" ? { ...raw } : undefined,
      })),
    };
  }

  const parsed = parseProtocolToDays(content);
  const days = parsed.days.map(dayFromParsed);
  const originalText = typeof content === "string" && content.trim() ? content : undefined;
  return { extra: {}, days, wasStructured: false, originalText };
}

const cleanExercise = (exercise: EditableExercise, index: number) => {
  const out: Record<string, unknown> = { ...(exercise.raw || {}), order: index + 1, name: exercise.name.trim() };
  const setField = (target: Record<string, unknown>, key: string, value: string) => {
    const trimmed = (value || "").trim();
    if (trimmed) target[key] = trimmed; else delete target[key];
  };
  setField(out, "muscle_target", exercise.muscle_target);
  setField(out, "notes", exercise.notes);
  const structure = out.structure && typeof out.structure === "object" ? { ...(out.structure as Record<string, unknown>) } : null;
  const work = structure && structure.work_sets && typeof structure.work_sets === "object"
    ? { ...(structure.work_sets as Record<string, unknown>) }
    : null;
  const target = work || out;
  (["sets", "reps", "rpe", "rir", "rest"] as const).forEach((key) => setField(target, key, exercise[key]));
  if (work && structure) { structure.work_sets = work; out.structure = structure; }
  return out;
};

/** Serializa o modelo editável no mesmo formato estruturado lido pelo app. */
export function serializeEditableProtocol(model: EditableProtocol): string {
  const training_days = model.days.map((day, index) => {
    const out: Record<string, unknown> = {
      ...(day.raw || {}),
      day_number: day.day_number || index + 1,
      exercises: day.exercises.filter((e) => e.name.trim()).map(cleanExercise),
    };
    delete out.title;
    (["session_title", "estimated_duration", "session_notes"] as const).forEach((key) => {
      if (day[key].trim()) out[key] = day[key].trim(); else delete out[key];
    });
    const warmup = day.warmup.filter((e) => e.name.trim()).map(cleanExercise);
    if (warmup.length) out.warmup = warmup; else delete out.warmup;
    return out;
  });
  const extra = model.originalText && !("original_text" in model.extra)
    ? { ...model.extra, original_text: model.originalText }
    : model.extra;
  return JSON.stringify({ ...extra, training_days }, null, 2);
}
