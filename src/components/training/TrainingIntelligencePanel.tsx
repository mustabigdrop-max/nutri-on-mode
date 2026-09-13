import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Activity, Clock, Check, Loader2, BatteryLow } from "lucide-react";
import { toast } from "sonner";
import type { WorkoutLogRow } from "@/lib/mesocyclePlan";
import { deloadWeeks } from "@/lib/mesocyclePlan";
import { detectPlateaus, validateRecovery48h } from "@/lib/trainingIntelligence";
import { saveExerciseOverride, setForcedDeload } from "@/lib/coachOverrides";

const SURFACE = "#0f0f11";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#F5F0E8";
const MUTED = "#888";
const ORANGE = "#EF9F27";
const RED = "#f87171";
const GREEN = "#5DCAA5";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));
const norm = (s?: string | null) => String(s || "").trim().toLowerCase();

/**
 * Alertas inteligentes do protocolo: platô real (workout_logs) e recuperação < 48h.
 * Cada alerta traz a ação sugerida — quando o coach está logado, a ação é aplicada
 * como ajuste real (training_exercise_overrides / training_week_overrides).
 * Não renderiza nada quando não há alerta.
 */
export default function TrainingIntelligencePanel({
  logs,
  totalWeeks,
  days,
  coachId,
  protocolId,
  weekNumber,
  onChanged,
}: {
  logs: WorkoutLogRow[];
  totalWeeks: number;
  days: Array<{ day_number?: number | null; focus?: string | null; exercises?: any[] }>;
  coachId?: string | null;
  protocolId?: string | null;
  weekNumber?: number;
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [choice, setChoice] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});

  const plateaus = useMemo(
    () => detectPlateaus(logs || [], deloadWeeks(Math.max(1, totalWeeks || 8))),
    [logs, totalWeeks]
  );
  const conflicts = useMemo(() => validateRecovery48h(days || []), [days]);

  const canAct = Boolean(coachId && protocolId && weekNumber && weekNumber > 0);

  /** Dia real onde o exercício aparece no protocolo. null quando não encontrado. */
  const dayOfExercise = (name: string): number | null => {
    for (let i = 0; i < (days || []).length; i++) {
      const d = days[i];
      const found = (d?.exercises || []).some(
        (e: any) => norm(e?.name ?? e?.nome) === norm(name)
      );
      if (found) return Number(d?.day_number) || i + 1;
    }
    return null;
  };

  const applyIntervention = async (exerciseName: string, step: string) => {
    if (!canAct) return;
    const dayNumber = dayOfExercise(exerciseName);
    if (!dayNumber) {
      toast.error("Não localizei este exercício na semana atual do protocolo.");
      return;
    }
    setSaving(exerciseName);
    const { error } = await saveExerciseOverride(
      coachId!,
      {
        protocol_id: protocolId!,
        week_number: weekNumber!,
        day_number: dayNumber,
        exercise_name: exerciseName,
        action: "edit",
        coach_note: `Platô detectado — intervenção: ${step}`,
      },
      { propagate: true, totalWeeks: Math.max(1, totalWeeks || 1) }
    );
    setSaving(null);
    if (error) {
      toast.error(error);
      return;
    }
    setDone((d) => ({ ...d, [exerciseName]: step }));
    toast.success(`Ajuste aplicado em ${exerciseName}`);
    onChanged?.();
  };

  const forceDeload = async () => {
    if (!canAct) return;
    setSaving("__deload__");
    const error = await setForcedDeload(
      coachId!,
      protocolId!,
      weekNumber!,
      true,
      "Descarga forçada por platô detectado nos registros de carga"
    );
    setSaving(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`Semana ${weekNumber} marcada como descarga`);
    onChanged?.();
  };

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
          {plateaus.map((p) => {
            const selected = choice[p.exerciseName] ?? 0;
            const applied = done[p.exerciseName];
            return (
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

                {applied ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Check className="w-3 h-3" style={{ color: GREEN }} />
                    <span className="text-[10px]" style={{ color: GREEN }}>Aplicado: {applied}</span>
                  </div>
                ) : canAct ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <select
                      value={selected}
                      onChange={(e) => setChoice((c) => ({ ...c, [p.exerciseName]: Number(e.target.value) }))}
                      className="text-[10px] rounded px-2 py-1 outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", color: TEXT, border: `1px solid ${BORDER}` }}
                    >
                      {p.ladder.map((step, i) => (
                        <option key={i} value={i} style={{ background: SURFACE }}>{step}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => applyIntervention(p.exerciseName, p.ladder[selected])}
                      disabled={saving === p.exerciseName}
                      className="text-[10px] font-bold rounded px-2.5 py-1 flex items-center gap-1 disabled:opacity-60"
                      style={{ background: ORANGE, color: "#0A0A0A" }}
                    >
                      {saving === p.exerciseName ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Aplicar ajuste
                    </button>
                    <button
                      onClick={forceDeload}
                      disabled={saving === "__deload__"}
                      className="text-[10px] font-bold rounded px-2.5 py-1 flex items-center gap-1 disabled:opacity-60"
                      style={{ background: "transparent", color: GREEN, border: `1px solid ${GREEN}` }}
                    >
                      {saving === "__deload__" ? <Loader2 className="w-3 h-3 animate-spin" /> : <BatteryLow className="w-3 h-3" />}
                      Forçar descarga
                    </button>
                  </div>
                ) : (
                  <p className="text-[9px] mt-2" style={{ color: MUTED }}>
                    Fale com seu coach para aplicar o ajuste.
                  </p>
                )}
              </div>
            );
          })}

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
              <p className="text-[10px] mt-1.5" style={{ color: GREEN }}>
                Ação sugerida: separar os dois treinos em pelo menos 2 dias ou mover esse grupo para o outro dia.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
