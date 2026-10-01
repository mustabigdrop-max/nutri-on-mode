/**
 * Motor de ciclo contínuo do TrainingON (escala de trabalho).
 * Independe do dia da semana: padrão + data de início, em loop.
 *
 * Ajustes manuais:
 * - folga_extra: o dia vira folga e o padrão NÃO avança (tudo depois desliza 1 dia).
 * - treino_adiantado: o dia vira treino com o próximo treino da fila; o padrão
 *   salta para logo após a próxima posição de treino (as folgas antes dela são consumidas).
 */

export type CyclePattern = "semana" | "3x1" | "4x2" | "6x1" | "2x2" | "custom";
export type AdjustKind = "folga_extra" | "treino_adiantado";

export const PATTERN_LABEL: Record<CyclePattern, string> = {
  semana: "Segunda a sexta (convencional)",
  "3x1": "3x1 (3 treino / 1 folga)",
  "4x2": "4x2 (4 treino / 2 folga)",
  "6x1": "6x1 (6 treino / 1 folga)",
  "2x2": "2x2 (2 treino / 2 folga)",
  custom: "Personalizado",
};

const repeat = (t: number, f: number) => [...Array(t).fill(true), ...Array(f).fill(false)] as boolean[];

/** Sequência treino(true)/folga(false). "semana" não é ciclo (retorna null). */
export function patternSequence(pattern: CyclePattern, custom?: string[] | null): boolean[] | null {
  switch (pattern) {
    case "3x1": return repeat(3, 1);
    case "4x2": return repeat(4, 2);
    case "6x1": return repeat(6, 1);
    case "2x2": return repeat(2, 2);
    case "custom": {
      const seq = (custom || []).map((s) => s === "treino");
      return seq.length && seq.some(Boolean) ? seq : null;
    }
    default: return null;
  }
}

export type CycleDay = {
  date: string; // YYYY-MM-DD
  isTraining: boolean;
  /** Índice 0-based no plano (D1 = 0). */
  workoutIndex?: number;
  adjustment?: AdjustKind;
  beforeStart?: boolean;
};

const toUTC = (iso: string) => new Date(`${iso}T12:00:00Z`);
export const addDays = (iso: string, n: number) => {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Calcula os dias de startDate até `until` (inclusive). */
export function computeCycle(opts: {
  sequence: boolean[];
  startDate: string;
  until: string;
  workoutCount: number;
  adjustments?: Record<string, AdjustKind>;
}): CycleDay[] {
  const { sequence, startDate, until, adjustments = {} } = opts;
  const count = Math.max(1, opts.workoutCount);
  const out: CycleDay[] = [];
  let pos = 0;
  let workout = 0;
  for (let date = startDate, guard = 0; date <= until && guard < 5000; date = addDays(date, 1), guard++) {
    const adj = adjustments[date];
    if (adj === "folga_extra") {
      out.push({ date, isTraining: false, adjustment: adj });
      continue; // padrão não avança
    }
    if (adj === "treino_adiantado") {
      let k = 0;
      while (!sequence[pos % sequence.length] && k < sequence.length) { pos++; k++; }
      pos++;
      out.push({ date, isTraining: true, workoutIndex: workout % count, adjustment: adj });
      workout++;
      continue;
    }
    const train = sequence[pos % sequence.length];
    pos++;
    if (train) {
      out.push({ date, isTraining: true, workoutIndex: workout % count });
      workout++;
    } else out.push({ date, isTraining: false });
  }
  return out;
}

/** Próximos `n` dias a partir de `from` (inclusive). Antes do início = beforeStart. */
export function upcomingDays(opts: {
  sequence: boolean[];
  startDate: string;
  from: string;
  n: number;
  workoutCount: number;
  adjustments?: Record<string, AdjustKind>;
}): CycleDay[] {
  const until = addDays(opts.from, opts.n - 1);
  const all = opts.startDate <= until ? computeCycle({ ...opts, until }) : [];
  const res: CycleDay[] = [];
  for (let i = 0; i < opts.n; i++) {
    const date = addDays(opts.from, i);
    res.push(all.find((d) => d.date === date) || { date, isTraining: false, beforeStart: true });
  }
  return res;
}

export function todaySaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
