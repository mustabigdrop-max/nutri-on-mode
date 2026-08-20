import { useMemo, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import {
  MET_ACTIVITIES,
  MET_CATEGORY_LABELS,
  DURATION_PRESETS,
  RUN_ZONES,
  calculateMetAdjustment,
  getRunningMET,
  type MetCategory,
  type RunZone,
} from "@/lib/nutrySyncMet";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const DIM = "#8A8A8A";

interface Props {
  open: boolean;
  weightKg: number;
  baseKcal?: number;
  onClose: () => void;
  onAdd: (input: {
    type: string;
    label: string;
    category: MetCategory;
    met: number;
    durationMin: number;
    zone?: string | null;
  }) => Promise<void> | void;
}

const CATEGORY_ORDER: MetCategory[] = ["musculacao", "cardio", "combate", "outros"];

export default function AddActivitySheet({ open, weightKg, baseKcal = 0, onClose, onAdd }: Props) {
  const [type, setType] = useState("legs");
  const [duration, setDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState("");
  const [zone, setZone] = useState<RunZone | null>(null);
  const [saving, setSaving] = useState(false);

  const activity = useMemo(
    () => MET_ACTIVITIES.find((a) => a.type === type) ?? MET_ACTIVITIES[0],
    [type],
  );
  const isRun = activity.type === "corrida";
  const met = isRun && zone ? getRunningMET(zone) : activity.met;
  const calc = calculateMetAdjustment({ type: activity.type, met, durationMin: duration, weightKg });

  if (!open) return null;

  const submit = async () => {
    setSaving(true);
    try {
      await onAdd({
        type: activity.type,
        label: isRun && zone ? `Corrida ${zone}` : activity.label,
        category: activity.category,
        met,
        durationMin: duration,
        zone: isRun ? zone : null,
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
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
        style={{ background: "#08080f", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black tracking-tight">➕ Adicionar atividade</h2>
          <button onClick={onClose} aria-label="Fechar">
            <X className="w-5 h-5" style={{ color: DIM }} />
          </button>
        </div>

        {CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="mb-4">
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM }}>
              {MET_CATEGORY_LABELS[cat].emoji} {MET_CATEGORY_LABELS[cat].label}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MET_ACTIVITIES.filter((a) => a.category === cat).map((a) => {
                const active = type === a.type;
                return (
                  <button
                    key={a.type}
                    onClick={() => {
                      setType(a.type);
                      if (a.type !== "corrida") setZone(null);
                    }}
                    className="px-2 py-2 rounded-xl text-[11px] font-semibold leading-tight"
                    style={{
                      background: active ? `${CYAN}1a` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? `${CYAN}66` : "rgba(255,255,255,0.08)"}`,
                      color: active ? CYAN : "#fff",
                    }}
                  >
                    <span className="block">{a.emoji}</span>
                    {a.label}
                    <span className="block text-[9px] font-mono" style={{ color: DIM }}>
                      MET {a.met.toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {isRun && (
          <>
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM }}>
              ❤️ Zona de corrida
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {RUN_ZONES.map((z) => (
                <button
                  key={z.zone}
                  onClick={() => setZone(zone === z.zone ? null : z.zone)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                  style={{
                    background: zone === z.zone ? `${GREEN}1a` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${zone === z.zone ? `${GREEN}66` : "rgba(255,255,255,0.08)"}`,
                    color: zone === z.zone ? GREEN : "#fff",
                  }}
                >
                  {z.label} · MET {z.met.toFixed(1)}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM }}>
          ⏱️ Duração
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setDuration(p);
                setCustomDuration("");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
              style={{
                background: duration === p ? `${CYAN}1a` : "rgba(255,255,255,0.04)",
                border: `1px solid ${duration === p ? `${CYAN}66` : "rgba(255,255,255,0.08)"}`,
                color: duration === p ? CYAN : "#fff",
              }}
            >
              {p} min
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          max={600}
          inputMode="numeric"
          value={customDuration}
          onChange={(e) => {
            setCustomDuration(e.target.value);
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n) && n > 0) setDuration(Math.min(600, n));
          }}
          placeholder="Personalizar: minutos"
          className="w-full mb-4 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        />

        <div className="rounded-xl p-3 mb-4" style={{ background: `${CYAN}0d`, border: `1px solid ${CYAN}33` }}>
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: DIM }}>Cálculo</p>
          <p className="text-xs mb-1">
            {isRun && zone ? `Corrida ${zone}` : activity.label} · {duration} min · {Math.round(weightKg)} kg
          </p>
          <p className="text-[11px] font-mono" style={{ color: DIM }}>
            MET {met.toFixed(1)} × {Math.round(weightKg)} × {(duration / 60).toFixed(2)}h ={" "}
            <strong style={{ color: "#fff" }}>{calc.grossKcal} kcal</strong> bruto
          </p>
          <p className="text-[11px] font-mono" style={{ color: DIM }}>
            EPOC (+{Math.round((calc.epocFactor - 1) * 100)}%): +{calc.epocKcal} kcal
          </p>
          <p className="text-[11px] font-mono" style={{ color: DIM }}>
            Já contabilizado no TDEE base: −{calc.alreadyCounted} kcal
          </p>
          <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.12)" }} />
          <p className="text-lg font-black font-mono" style={{ color: GREEN }}>
            AJUSTE LÍQUIDO: +{calc.netAdjustment} kcal
          </p>
          <p className="text-[11px] font-mono mt-1" style={{ color: DIM }}>
            +{calc.carbAdd}g carbo · +{calc.proteinAdd}g proteína · +{calc.fatAdd}g gordura · +{calc.hydrationMl}ml água
          </p>
          {baseKcal > 0 && (
            <p className="text-[11px] mt-2" style={{ color: CYAN }}>
              Sua meta hoje sobe de {baseKcal.toLocaleString("pt-BR")} →{" "}
              {(baseKcal + calc.netAdjustment).toLocaleString("pt-BR")} kcal
            </p>
          )}
        </div>

        <button
          onClick={submit}
          disabled={saving || duration <= 0}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: CYAN, color: "#02020a" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Confirmar atividade
        </button>
      </div>
    </div>
  );
}
