import type { ParsedDay, ParsedExercise } from "@/lib/parseProtocolMarkdown";
import type { WorkoutShareCardProps, WorkoutShareExercise } from "@/components/workout/WorkoutShareCard";

export type WorkoutShareMeta = {
  phase?: string | null;
  weeks?: string | number | null;
  muscles?: string[] | null;
  updatedAt?: string | null;
};

const numericValue = (text: string, marker: "RPE" | "RIR") => {
  const match = text.match(new RegExp(`${marker}\\s*(\\d+(?:[.,]\\d+)?)`, "i"));
  return match ? Number(match[1].replace(",", ".")) : 0;
};

const exerciseSetCount = (exercise: ParsedExercise) => exercise.sets.reduce((total, set) => {
  const match = set.detail.match(/(\d+)\s*séries/i);
  return total + (match ? Number(match[1]) : 0);
}, 0);

const sharePills = (exercise: ParsedExercise) => {
  const text = exercise.sets.map((set) => `${set.label || ""} ${set.detail}`).join(" ");
  const pills: string[] = [];
  if (/top set/i.test(text)) pills.push("TOP");
  if (/back-off/i.test(text)) pills.push("BSET");
  const rir = text.match(/RIR\s*(\d+)/i)?.[1];
  if (rir === "1" || rir === "2") pills.push(`RIR ${rir}`);
  if (/unilateral|\buni\b/i.test(`${exercise.name} ${exercise.notes || ""}`)) pills.push("UNI");
  return pills;
};

const muscleColor = (muscle: string): "red" | "gold" | "cyan" | "green" => {
  const value = muscle.toLowerCase();
  if (/peito|peitoral/.test(value)) return "red";
  if (/ombro|delt/.test(value)) return "cyan";
  if (/tríceps|triceps|braço|braco/.test(value)) return "gold";
  return "green";
};

const titleType = (title: string) => {
  const upper = title.toUpperCase();
  if (/PUSH|EMPURRAR/.test(upper)) return "PUSH";
  if (/PULL|PUXAR/.test(upper)) return "PULL";
  if (/LOWER|INFERIOR|PERNA/.test(upper)) return "LOWER";
  if (/UPPER|SUPERIOR/.test(upper)) return "UPPER";
  if (/PEITORAL|PEITO/.test(upper) && /(DELTOIDE|DELTÓIDE|OMBRO|TRÍCEPS|TRICEPS)/.test(upper)) return "PUSH";
  if (/(COSTAS|DORSAL)/.test(upper) && /(BÍCEPS|BICEPS)/.test(upper)) return "PULL";
  return title.replace(/^TREINO\s*[A-Z0-9]+\s*[-–—:]?\s*/i, "").trim() || "TREINO";
};

/** Monta as props do Ultra Share View a partir de um dia real do protocolo salvo. */
export function buildWorkoutShareData(day: ParsedDay, meta: WorkoutShareMeta): WorkoutShareCardProps {
  const exercises = day.exercises || [];
  const allSetText = exercises.flatMap((exercise) => exercise.sets.map((set) => set.detail)).join(" ");
  const allPrescriptionText = [
    allSetText,
    day.session_notes || "",
    ...exercises.map((exercise) => exercise.notes || ""),
  ].join(" ");
  const rpeValues = Array.from(allSetText.matchAll(/RPE\s*(\d+(?:[.,]\d+)?)/gi)).map((m) => Number(m[1].replace(",", ".")));
  const rirValues = Array.from(allPrescriptionText.matchAll(/RIR\s*(\d+(?:[.,]\d+)?)/gi)).map((m) => Number(m[1].replace(",", ".")));
  const minutes = Number(day.estimated_duration.match(/\d+/)?.[0] || 0);
  const muscleSeries = new Map<string, number>();
  exercises.forEach((exercise) => {
    const muscle = exercise.muscle_target?.split(/[·,(]/)[0]?.trim();
    if (muscle) muscleSeries.set(muscle, (muscleSeries.get(muscle) || 0) + exerciseSetCount(exercise));
  });
  const shareExercises: WorkoutShareExercise[] = exercises.slice(0, 7).map((exercise, index) => ({
    number: exercise.order || index + 1,
    name: exercise.name,
    sub: exercise.muscle_target || "Grupo não informado",
    pills: sharePills(exercise),
    color: /unilateral|corretiv|reabil/i.test(`${exercise.name} ${exercise.notes || ""}`)
      ? "red"
      : index === 1 ? "gold" : index === 2 ? "cyan" : "gray",
  }));
  const muscles = day.muscle_tags.length ? day.muscle_tags : (meta.muscles || []);
  const muscleText = muscles.join(" ");
  const litMuscles = [
    ...(/peit|peitor/i.test(muscleText) ? [{ id: "pec-left", color: "#FF4444", pulse: true }, { id: "pec-right", color: "#B8922A" }] : []),
    ...(/ombro|delt/i.test(muscleText) ? [{ id: "delt", color: "#00D4FF" }] : []),
    ...(/tríceps|triceps/i.test(muscleText) ? [{ id: "triceps", color: "#B8922A" }] : []),
  ];

  return {
    dayCode: `D${day.day_number}`,
    dayType: titleType(day.session_title),
    muscles: muscles.join(" · ") || "Grupos não informados",
    protocol: "STRATUM",
    week: meta.weeks ? `${meta.weeks} SEM` : "—",
    volume: "—",
    progression: "—",
    phase: meta.phase || "—",
    date: new Date(meta.updatedAt || Date.now())
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/\./g, "")
      .toUpperCase(),
    stats: {
      series: exercises.reduce((total, exercise) => total + exerciseSetCount(exercise), 0),
      rpe: rpeValues.length ? Math.max(...rpeValues) : numericValue(allSetText, "RPE"),
      rir: rirValues.length ? Math.min(...rirValues) : numericValue(allPrescriptionText, "RIR"),
      minutes,
    },
    focusAlert: day.session_notes || "",
    streak: 0,
    rank: "",
    warmup: (day.warmup || []).map((exercise) => exercise.name).join(" · "),
    exercises: shareExercises,
    dataStrip: Array.from(muscleSeries.entries()).slice(0, 4).map(([muscle, series]) => ({
      value: String(series),
      label: `${muscle} SÉRIES`,
      color: muscleColor(muscle),
    })),
    litMuscles,
  };
}
