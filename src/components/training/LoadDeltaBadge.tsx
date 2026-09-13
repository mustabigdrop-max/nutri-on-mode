import { useMemo } from "react";
import { LoadDelta, WorkoutLogRow, loadDelta } from "@/lib/mesocyclePlan";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

/** Delta de carga real entre semanas (workout_logs). Não exibe nada sem registro real. */
export default function LoadDeltaBadge({
  logs,
  exerciseName,
  week,
}: {
  logs: WorkoutLogRow[];
  exerciseName: string;
  week?: number | null;
}) {
  const delta: LoadDelta | null = useMemo(() => {
    if (!week) return null;
    return loadDelta(logs, exerciseName, week);
  }, [logs, exerciseName, week]);

  if (!delta) return null;

  const up = delta.deltaKg > 0;
  const down = delta.deltaKg < 0;
  const color = up ? "#4ade80" : down ? "#f87171" : "#94a3b8";
  const sign = up ? "+" : "";

  return (
    <span
      className="text-[8px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
      style={{ background: `${color}1f`, color }}
      title={`Semana ${delta.previousWeek} → semana ${week}`}
    >
      {fmt(delta.previousKg)}kg → {fmt(delta.currentKg)}kg ({sign}{fmt(delta.deltaKg)}kg)
    </span>
  );
}
