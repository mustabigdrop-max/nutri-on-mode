import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, Loader2 } from "lucide-react";
import { useAthletePlans } from "@/hooks/useAthletePlans";
import AthleteBottomNav from "@/components/athlete/AthleteBottomNav";
import { MarkdownProtocolView } from "@/components/training/MarkdownProtocolView";
import { parseProtocolText } from "@/lib/parseProtocolText";
import { parseProtocolToDays } from "@/lib/parseProtocolMarkdown";
import { athleteQuery, useAthleteTarget } from "@/hooks/useAthleteTarget";
import WorkoutShareCard from "@/components/workout/WorkoutShareCard";
import { buildWorkoutShareData } from "@/lib/workoutShareAdapter";
import { Button } from "@/components/ui/button";

const BG = "#020205";
const GREEN = "#00FF88";
const TEXT = "#FFFFFF";
const DIM = "#A0A0A0";

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
  return title.replace(/^TREINO\s*[A-Z0-9]+\s*[-–—:]?\s*/i, "").trim() || "TREINO";
};

const dayShareData = (day: ParsedDay, training: NonNullable<ReturnType<typeof useAthletePlans>["training"]>) => {
  const exercises = day.exercises || [];
  const allSetText = exercises.flatMap((exercise) => exercise.sets.map((set) => set.detail)).join(" ");
  const rpeValues = Array.from(allSetText.matchAll(/RPE\s*(\d+(?:[.,]\d+)?)/gi)).map((match) => Number(match[1].replace(",", ".")));
  const rirValues = Array.from(allSetText.matchAll(/RIR\s*(\d+(?:[.,]\d+)?)/gi)).map((match) => Number(match[1].replace(",", ".")));
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
    color: /unilateral|corretiv|reabil/i.test(`${exercise.name} ${exercise.notes || ""}`) ? "red" : index === 1 ? "gold" : index === 2 ? "cyan" : "gray",
  }));
  const muscles = day.muscle_tags.length ? day.muscle_tags : (training.muscles || []);
  const litMuscles = [
    ...(/peit|peitor/i.test(muscles.join(" ")) ? [{ id: "pec-left", color: "#FF4444", pulse: true }, { id: "pec-right", color: "#B8922A" }] : []),
    ...(/ombro|delt/i.test(muscles.join(" ")) ? [{ id: "delt", color: "#00D4FF" }] : []),
    ...(/tríceps|triceps/i.test(muscles.join(" ")) ? [{ id: "triceps", color: "#B8922A" }] : []),
  ];
  const warmup = (day.warmup || []).map((exercise) => exercise.name).join(" · ");
  return {
    dayCode: `D${day.day_number}`,
    dayType: titleType(day.session_title),
    muscles: muscles.join(" · ") || "Grupos não informados",
    protocol: "STRATUM",
    week: training.weeks ? `${training.weeks} SEM` : "—",
    volume: "—",
    progression: "—",
    phase: training.phase || "—",
    date: new Date(training.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "").toUpperCase(),
    stats: {
      series: exercises.reduce((total, exercise) => total + exerciseSetCount(exercise), 0),
      rpe: rpeValues.length ? Math.max(...rpeValues) : numericValue(allSetText, "RPE"),
      rir: rirValues.length ? Math.min(...rirValues) : numericValue(allSetText, "RIR"),
      minutes,
    },
    focusAlert: day.session_notes || "",
    streak: 0,
    rank: "",
    warmup,
    exercises: shareExercises,
    dataStrip: Array.from(muscleSeries.entries()).slice(0, 4).map(([muscle, series]) => ({ value: String(series), label: `${muscle} SÉRIES`, color: muscleColor(muscle) })),
    litMuscles,
  };
};

const MyTrainingPage = () => {
  const navigate = useNavigate();
  const targetId = useAthleteTarget();
  const { loading, training } = useAthletePlans(targetId || undefined);
  const [shareDayIndex, setShareDayIndex] = useState(0);

  useEffect(() => {
    document.title = "Meu Treino · NUTRION";
  }, []);

  const content = useMemo(() => {
    if (!training?.protocolText) return null;
    const { json, markdown } = parseProtocolText(training.protocolText);
    return json || markdown || null;
  }, [training]);

  const structuredDays = useMemo(() => training ? parseProtocolToDays(training.protocolText).days.filter((day) => (day.exercises || []).length > 0) : [], [training]);
  const selectedShareDay = structuredDays[shareDayIndex] || structuredDays[0];
  const shareData = useMemo(() => training && selectedShareDay ? dayShareData(selectedShareDay, training) : null, [selectedShareDay, training]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: GREEN }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: BG, color: TEXT }}>
      <header className="px-4 pt-6 pb-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(`/dashboard${athleteQuery(targetId)}`)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: DIM }} />
          </button>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <Dumbbell className="w-5 h-5" style={{ color: GREEN }} />
              Meu Treino
            </h1>
            {training && (
              <p className="text-[11px]" style={{ color: DIM }}>
                Atualizado em {new Date(training.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>

        {training && (
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Fase", training.phase || "—"],
              ["Duração", training.weeks ? `${training.weeks} sem` : "—"],
              ["Frequência", training.daysPerWeek ? `${training.daysPerWeek}x` : "—"],
            ].map(([l, v]) => (
              <div
                key={l as string}
                className="rounded-xl p-3 text-center"
                style={{ border: `1px solid ${GREEN}22`, background: `${GREEN}0a` }}
              >
                <p className="text-sm font-bold" style={{ color: GREEN }}>{v}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: DIM }}>{l}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="px-4 max-w-3xl mx-auto">
        {content ? (
          <MarkdownProtocolView content={content} title={training?.clientName || "Protocolo"} />
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ border: `1px solid ${GREEN}22`, background: `${GREEN}08` }}
          >
            <p className="text-sm font-semibold">Nenhum treino enviado ainda</p>
            <p className="text-xs mt-1" style={{ color: DIM }}>
              Assim que seu coach enviar, ele aparece aqui.
            </p>
          </div>
        )}

        <section className="mt-8 border-t border-border/40 pt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-cyan">Ultra Share View</p>
              <h2 className="font-display text-xl font-bold">Compartilhar treino</h2>
            </div>
            {shareData && structuredDays.length > 1 && (
                <div className="flex gap-1">
                  {structuredDays.map((day, index) => (
                    <Button key={day.day_number} type="button" size="sm" variant={shareDayIndex === index ? "default" : "outline"} className="h-8 rounded-none px-3 font-tech text-[10px]" onClick={() => setShareDayIndex(index)}>
                      D{day.day_number}
                    </Button>
                  ))}
                </div>
            )}
          </div>
          {shareData ? (
            <div className="overflow-x-auto pb-3">
              <WorkoutShareCard {...shareData} />
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ border: `1px solid ${GREEN}22`, background: `${GREEN}08` }}
            >
              <p className="text-sm font-semibold">Card indisponível por enquanto</p>
              <p className="text-xs mt-1" style={{ color: DIM }}>
                {training
                  ? "Seu treino atual não está no formato estruturado necessário para o card. Peça ao coach para reenviar pelo TrainingON."
                  : "Assim que seu coach enviar seu treino pelo TrainingON, o card de compartilhamento aparece aqui."}
              </p>
            </div>
          )}
        </section>
      </main>

      <AthleteBottomNav />
    </div>
  );
};

export default MyTrainingPage;
