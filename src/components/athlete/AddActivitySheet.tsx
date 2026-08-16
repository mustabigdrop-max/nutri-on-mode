import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import {
  ACTIVITY_OPTIONS,
  calculateActivityAdjustment,
  type ActivityType,
  type Intensity,
} from "@/lib/nutrySync";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const DIM = "#8A8A8A";

interface Props {
  open: boolean;
  weightKg: number;
  onClose: () => void;
  onAdd: (input: {
    type: ActivityType;
    label?: string;
    durationMin: number;
    intensity: Intensity;
  }) => Promise<void> | void;
}

const INTENSITIES: Intensity[] = ["leve", "moderada", "intensa"];

export default function AddActivitySheet({ open, weightKg, onClose, onAdd }: Props) {
  const [type, setType] = useState<ActivityType>("caminhada");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<Intensity>("moderada");
  const [customLabel, setCustomLabel] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const option = ACTIVITY_OPTIONS.find((a) => a.type === type)!;
  const preview = calculateActivityAdjustment(type, duration, intensity, weightKg);

  const submit = async () => {
    setSaving(true);
    try {
      await onAdd({
        type,
        label: type === "outro" ? customLabel.trim() || "Atividade extra" : option.label,
        durationMin: duration,
        intensity,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto"
        style={{ background: "#08080f", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black tracking-tight" style={{ color: "#fff" }}>
            Adicionar à rotina de hoje
          </h2>
          <button onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5" style={{ color: DIM }} />
          </button>
        </div>

        <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM }}>
          O que você fez?
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {ACTIVITY_OPTIONS.map((a) => (
            <button
              key={a.type}
              onClick={() => {
                setType(a.type);
                setDuration(a.presets[1] ?? a.presets[0]);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left"
              style={{
                background: type === a.type ? `${CYAN}1a` : "rgba(255,255,255,0.04)",
                border: `1px solid ${type === a.type ? `${CYAN}66` : "rgba(255,255,255,0.08)"}`,
                color: type === a.type ? CYAN : "#fff",
              }}
            >
              <span>{a.emoji}</span> {a.label}
            </button>
          ))}
        </div>

        {type === "outro" && (
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Descreva a atividade"
            className="w-full mb-4 px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          />
        )}

        <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM }}>
          Duração
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {option.presets.map((p) => (
            <button
              key={p}
              onClick={() => setDuration(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
              style={{
                background: duration === p ? `${CYAN}1a` : "rgba(255,255,255,0.04)",
                border: `1px solid ${duration === p ? `${CYAN}66` : "rgba(255,255,255,0.08)"}`,
                color: duration === p ? CYAN : "#fff",
              }}
            >
              {p >= 60 && p % 60 === 0 ? `${p / 60}h` : `${p} min`}
            </button>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM }}>
          Intensidade
        </p>
        <div className="flex gap-2 mb-4">
          {INTENSITIES.map((i) => (
            <button
              key={i}
              onClick={() => setIntensity(i)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold capitalize"
              style={{
                background: intensity === i ? `${GREEN}1a` : "rgba(255,255,255,0.04)",
                border: `1px solid ${intensity === i ? `${GREEN}66` : "rgba(255,255,255,0.08)"}`,
                color: intensity === i ? GREEN : "#fff",
              }}
            >
              {i}
            </button>
          ))}
        </div>

        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: `${CYAN}0d`, border: `1px solid ${CYAN}33` }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: DIM }}>
            Ajuste estimado
          </p>
          <p className="text-lg font-black font-mono" style={{ color: CYAN }}>
            +{preview.totalKcal} kcal
          </p>
          <p className="text-[11px] font-mono mt-1" style={{ color: DIM }}>
            +{preview.carbAdd}g carb · +{preview.proteinAdd}g proteína · +{preview.fatAdd}g gordura ·
            +{preview.hydrationAdd}ml água
          </p>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: CYAN, color: "#02020a" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Adicionar ao meu dia
        </button>
      </div>
    </div>
  );
}
