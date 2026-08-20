import { motion } from "framer-motion";
import { Zap, Plus, Trash2 } from "lucide-react";
import { activityMeta, fmtKcal, type PhaseConfig } from "@/lib/nutrySync";
import { metActivity } from "@/lib/nutrySyncMet";
import type { DailyActivity } from "@/hooks/useDailyActivities";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const GOLD = "#FFB800";
const DIM = "#8A8A8A";

export interface MacroTriple {
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  phase: PhaseConfig;
  baseKcal: number;
  adjustKcal: number;
  consumedKcal: number;
  targetMacros: MacroTriple;
  consumedMacros: MacroTriple;
  trainingLabel?: string | null;
  trainingKcal?: number;
  activities: DailyActivity[];
  climateLabel?: string | null;
  climateMl?: number;
  onAddActivity: () => void;
  onRemoveActivity?: (id: string) => void;
  readOnly?: boolean;
}

const MacroBar = ({
  label, target, consumed, color,
}: { label: string; target: number; consumed: number; color: string }) => {
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-wider" style={{ color: DIM }}>{label}</p>
      <p className="text-sm font-black font-mono" style={{ color }}>{Math.round(target)}g</p>
      <div className="h-1.5 rounded-full my-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <p className="text-[10px] font-mono" style={{ color: DIM }}>
        {Math.round(consumed)}g · {pct}%
      </p>
    </div>
  );
};

export default function NutrySyncPanel({
  phase, baseKcal, adjustKcal, consumedKcal, targetMacros, consumedMacros,
  trainingLabel, trainingKcal = 0, activities, climateLabel, climateMl = 0,
  onAddActivity, onRemoveActivity, readOnly,
}: Props) {
  const target = Math.round(baseKcal + adjustKcal);
  const pct = target > 0 ? Math.min(100, Math.round((consumedKcal / target) * 100)) : 0;
  const remaining = Math.max(0, target - consumedKcal);

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        border: `1px solid ${CYAN}22`,
        borderLeft: `3px solid ${CYAN}`,
        background: `linear-gradient(135deg, ${CYAN}0f, ${CYAN}03)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: CYAN }} />
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: CYAN }}>
            NutrySync · hoje
          </span>
        </div>
        <span
          className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: `${phase.color}1a`, color: phase.color, border: `1px solid ${phase.color}44` }}
        >
          {phase.label}
        </span>
      </div>

      {/* Balanço */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { l: "Base", v: fmtKcal(baseKcal), c: DIM },
          { l: "Ajustes", v: `${adjustKcal >= 0 ? "+" : ""}${fmtKcal(adjustKcal)}`, c: adjustKcal >= 0 ? GREEN : GOLD },
          { l: "Meta hoje", v: fmtKcal(target), c: CYAN },
        ].map((x) => (
          <div key={x.l} className="rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: DIM }}>{x.l}</p>
            <p className="text-base font-black font-mono" style={{ color: x.c }}>{x.v}</p>
            <p className="text-[9px]" style={{ color: DIM }}>kcal</p>
          </div>
        ))}
      </div>

      <div className="h-2.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ background: `linear-gradient(90deg, ${CYAN}, ${GREEN})` }}
        />
      </div>
      <p className="text-[11px] font-mono mb-4" style={{ color: DIM }}>
        Consumido {fmtKcal(consumedKcal)} / {fmtKcal(target)} kcal · restam{" "}
        <strong style={{ color: "#fff" }}>{fmtKcal(remaining)}</strong>
      </p>

      {/* Ajustes do dia */}
      <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: DIM }}>Ajustes do dia</p>
      <div className="space-y-1.5 mb-3">
        {trainingLabel && (
          <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-xs truncate">🏋️ {trainingLabel}</span>
            <span className="text-xs font-mono font-bold" style={{ color: GREEN }}>+{trainingKcal} kcal</span>
          </div>
        )}
        {activities.map((a) => {
          const m = metActivity(a.activity_type);
          const meta = m ?? activityMeta(a.activity_type);
          return (
            <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="text-xs truncate">
                {meta.emoji} {a.activity_label || meta.label} · {a.duration_min}min{a.met ? ` · MET ${Number(a.met).toFixed(1)}` : ` (${a.intensity})`}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold" style={{ color: GREEN }}>+{a.kcal_adjustment} kcal</span>
                {!readOnly && onRemoveActivity && (
                  <button onClick={() => onRemoveActivity(a.id)} aria-label="Remover atividade">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: DIM }} />
                  </button>
                )}
              </span>
            </div>
          );
        })}
        {climateMl > 0 && (
          <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-xs truncate">🌡️ {climateLabel}</span>
            <span className="text-xs font-mono font-bold" style={{ color: CYAN }}>+{climateMl}ml água</span>
          </div>
        )}
        {!trainingLabel && activities.length === 0 && climateMl === 0 && (
          <p className="text-xs" style={{ color: DIM }}>Nenhum ajuste aplicado hoje — plano base.</p>
        )}
      </div>

      {/* Macros */}
      <div className="flex gap-3 mb-3">
        <MacroBar label="Proteína" target={targetMacros.protein} consumed={consumedMacros.protein} color={GREEN} />
        <MacroBar label="Carbo" target={targetMacros.carbs} consumed={consumedMacros.carbs} color={CYAN} />
        <MacroBar label="Gordura" target={targetMacros.fat} consumed={consumedMacros.fat} color={GOLD} />
      </div>

      <button
        onClick={onAddActivity}
        disabled={readOnly}
        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
        style={{ background: `${CYAN}14`, color: CYAN, border: `1px solid ${CYAN}33` }}
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar atividade
      </button>
    </div>
  );
}
