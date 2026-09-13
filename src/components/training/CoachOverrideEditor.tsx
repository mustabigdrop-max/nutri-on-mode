import { useState } from "react";
import { toast } from "sonner";
import { Save, Trash2, SlidersHorizontal } from "lucide-react";
import {
  ExerciseOverride,
  saveExerciseOverride,
  removeExerciseOverride,
} from "@/lib/coachOverrides";

const GREEN = "#5DCAA5";
const TEXT = "#F5F0E8";
const TEXT_DIM = "#888";
const BORDER = "rgba(245,240,232,0.08)";

interface Props {
  coachId: string;
  protocolId: string;
  weekNumber: number;
  dayNumber: number;
  exerciseName: string;
  totalWeeks: number;
  current?: ExerciseOverride | null;
  onSaved?: () => void;
}

const FIELDS: Array<{ key: keyof ExerciseOverride; label: string; ph: string }> = [
  { key: "sets", label: "Séries", ph: "ex: 3" },
  { key: "reps", label: "Reps", ph: "ex: 8-10" },
  { key: "rpe", label: "RPE", ph: "ex: 8" },
  { key: "rir", label: "RIR", ph: "ex: 2" },
  { key: "rest", label: "Descanso", ph: "ex: 120s" },
];

export default function CoachOverrideEditor({
  coachId,
  protocolId,
  weekNumber,
  dayNumber,
  exerciseName,
  totalWeeks,
  current,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [propagate, setPropagate] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    sets: current?.sets || "",
    reps: current?.reps || "",
    rpe: current?.rpe || "",
    rir: current?.rir || "",
    rest: current?.rest || "",
    new_exercise_name: current?.new_exercise_name || "",
    coach_note: current?.coach_note || "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const { error, weeks } = await saveExerciseOverride(
      coachId,
      {
        protocol_id: protocolId,
        week_number: weekNumber,
        day_number: dayNumber,
        exercise_name: exerciseName,
        action: form.new_exercise_name ? "replace" : "edit",
        new_exercise_name: form.new_exercise_name || null,
        sets: form.sets || null,
        reps: form.reps || null,
        rpe: form.rpe || null,
        rir: form.rir || null,
        rest: form.rest || null,
        coach_note: form.coach_note || null,
      },
      { propagate, totalWeeks }
    );
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success(
      weeks.length > 1
        ? `Ajuste salvo e replicado da semana ${weekNumber} até ${weeks[weeks.length - 1]}`
        : `Ajuste salvo na semana ${weekNumber}`
    );
    onSaved?.();
  };

  const handleRemove = async () => {
    const err = await removeExerciseOverride(protocolId, weekNumber, dayNumber, exerciseName, {
      allWeeks: propagate,
      totalWeeks,
    });
    if (err) { toast.error(err); return; }
    setForm({ sets: "", reps: "", rpe: "", rir: "", rest: "", new_exercise_name: "", coach_note: "" });
    toast.success("Ajuste removido");
    onSaved?.();
  };

  return (
    <div className="rounded-lg" style={{ background: "rgba(93,202,165,0.05)", border: `1px solid ${BORDER}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-2.5 py-2"
      >
        <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase" style={{ color: GREEN }}>
          <SlidersHorizontal className="w-3 h-3" /> Ajuste do coach
        </span>
        <span className="text-[9px]" style={{ color: TEXT_DIM }}>{open ? "fechar" : current ? "editar" : "abrir"}</span>
      </button>

      {open && (
        <div className="px-2.5 pb-2.5 space-y-2">
          <div className="grid grid-cols-5 gap-1.5">
            {FIELDS.map((f) => (
              <label key={String(f.key)} className="block">
                <span className="block text-[8px] mb-0.5" style={{ color: TEXT_DIM }}>{f.label}</span>
                <input
                  value={form[String(f.key)] || ""}
                  onChange={(e) => set(String(f.key), e.target.value)}
                  placeholder={f.ph}
                  className="w-full rounded px-1.5 py-1 text-[10px] outline-none"
                  style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${BORDER}`, color: TEXT }}
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="block text-[8px] mb-0.5" style={{ color: TEXT_DIM }}>Trocar exercício por (opcional)</span>
            <input
              value={form.new_exercise_name || ""}
              onChange={(e) => set("new_exercise_name", e.target.value)}
              placeholder="Nome do exercício substituto"
              className="w-full rounded px-1.5 py-1 text-[10px] outline-none"
              style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${BORDER}`, color: TEXT }}
            />
          </label>

          <label className="block">
            <span className="block text-[8px] mb-0.5" style={{ color: TEXT_DIM }}>Observação para o aluno</span>
            <textarea
              value={form.coach_note || ""}
              onChange={(e) => set("coach_note", e.target.value)}
              rows={2}
              className="w-full rounded px-1.5 py-1 text-[10px] outline-none resize-none"
              style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${BORDER}`, color: TEXT }}
            />
          </label>

          <label className="flex items-center gap-1.5 text-[9px]" style={{ color: TEXT_DIM }}>
            <input type="checkbox" checked={propagate} onChange={(e) => setPropagate(e.target.checked)} />
            Aplicar também nas semanas seguintes (até a {totalWeeks})
          </label>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold disabled:opacity-50"
              style={{ background: "rgba(93,202,165,0.15)", color: GREEN }}
            >
              <Save className="w-3 h-3" /> {saving ? "Salvando..." : "Salvar ajuste"}
            </button>
            {current && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
              >
                <Trash2 className="w-3 h-3" /> Remover
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
