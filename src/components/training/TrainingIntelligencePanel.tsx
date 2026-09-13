import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Activity, Clock } from "lucide-react";
import type { WorkoutLogRow } from "@/lib/mesocyclePlan";
import { deloadWeeks } from "@/lib/mesocyclePlan";
import { detectPlateaus, validateRecovery48h } from "@/lib/trainingIntelligence";

const SURFACE = "#0f0f11";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#F5F0E8";
const MUTED = "#888";
const ORANGE = "#EF9F27";
const RED = "#f87171";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

/**
 * Alertas inteligentes do protocolo: platô real (workout_logs) e recuperação < 48h.
 * Não renderiza nada quando não há alerta.
 */
export default function TrainingIntelligencePanel({
  logs,
  totalWeeks,
  days,
}: {
  logs: WorkoutLogRow[];
  totalWeeks: number;
  days: Array<{ day_number?: number | null; focus?: string | null; exercises?: any[] }>;
}) {
  const [open, setOpen] = useState(true);

  const plateaus = useMemo(
    () => detectPlateaus(logs || [], deloadWeeks(Math.max(1, totalWeeks || 8))),
    [logs, totalWeeks]
  );
  const conflicts = useMemo(() => validateRecovery48h(days || []), [days]);

  if (!plateaus.length && !conflicts.length) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: ORANGE }} />
          <span className="text-[10px] font-black tracking-widest" style={{ color: ORANGE }}>
            ALERTAS DO PROTOCOLO ({plateaus.length + conflicts.length})
          </span>
        </div>
        {open ? <ChevronUp className="w-3 h-3" style={{ color: MUTED }} /> : <ChevronDown className="w-3 h-3" style={{ color: MUTED }} />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {plateaus.map((p) => (
            <div key={p.exerciseName} className="rounded-lg p-2.5" style={{ background: "rgba(239,159,39,0.06)", borderLeft: `3px solid ${ORANGE}` }}>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3" style={{ color: ORANGE }} />
                <p className="text-[11px] font-bold" style={{ color: TEXT }}>{p.exerciseName}</p>
              </div>
              <p className="text-[10px] mt-1" style={{ color: MUTED }}>
                {p.weeksStalled} semanas sem aumento de carga — melhor registro {fmt(p.bestKg)}kg
                {" "}(semanas {p.weeks.join(", ")}).
              </p>
              <p className="text-[9px] font-bold mt-1.5 tracking-widest" style={{ color: ORANGE }}>O QUE FAZER, NESTA ORDEM</p>
              <ol className="mt-0.5 space-y-0.5">
                {p.ladder.map((step, i) => (
                  <li key={i} className="text-[10px]" style={{ color: "#c9c9c9" }}>{i + 1}. {step}</li>
                ))}
              </ol>
            </div>
          ))}

          {conflicts.map((c, i) => (
            <div key={`${c.muscle}-${i}`} className="rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.06)", borderLeft: `3px solid ${RED}` }}>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" style={{ color: RED }} />
                <p className="text-[11px] font-bold" style={{ color: TEXT }}>Recuperação curta — {c.muscle}</p>
              </div>
              <p className="text-[10px] mt-1" style={{ color: MUTED }}>
                Treinos do dia {c.dayA} e do dia {c.dayB} repetem esse grupo com cerca de {c.gapHours}h de intervalo.
                Ideal manter no mínimo 48h entre eles.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
