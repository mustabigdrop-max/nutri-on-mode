import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WeekPhase } from "@/lib/weekProgression";
import {
  WorkoutLogRow,
  buildWeekPlan,
  mesocycleBlocks,
  mesocycleProgress,
  weekAdherence,
  weekStatus,
} from "@/lib/mesocyclePlan";

const FONT = "'Space Grotesk', sans-serif";
const GREEN = "#4ade80";
const TEXT = "#e8f5e9";
const TEXT_MUTED = "rgba(232,245,233,0.5)";

interface Props {
  weeks: number | string | undefined;
  phaseLabel?: string;
  daysPerWeek: number;
  logs: WorkoutLogRow[];
  selectedWeek: number;
  onWeekChange: (wp: WeekPhase) => void;
  storageKey?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  concluida: { bg: "rgba(74,222,128,0.14)", color: "#4ade80", dot: "#4ade80" },
  parcial: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", dot: "#fbbf24" },
  ativa: { bg: "rgba(96,165,250,0.16)", color: "#60a5fa", dot: "#60a5fa" },
  futura: { bg: "rgba(255,255,255,0.04)", color: "rgba(232,245,233,0.45)", dot: "rgba(255,255,255,0.2)" },
  deload: { bg: "rgba(148,163,184,0.14)", color: "#cbd5e1", dot: "#94a3b8" },
};

/** Navegação semana-a-semana + progresso do mesociclo + aderência (dados reais de workout_logs). */
export default function MesocycleTracker({
  weeks,
  phaseLabel,
  daysPerWeek,
  logs,
  selectedWeek,
  onWeekChange,
  storageKey,
}: Props) {
  const plan = useMemo(() => buildWeekPlan(weeks, phaseLabel), [weeks, phaseLabel]);
  const total = plan.length;
  const [selected, setSelected] = useState(() => Math.min(Math.max(selectedWeek || 1, 1), total));

  const { pct, doneSessions, planned, stats } = useMemo(
    () => mesocycleProgress(logs, total, daysPerWeek),
    [logs, total, daysPerWeek]
  );

  // Semana ativa = maior semana com registro (ou 1)
  const currentWeek = useMemo(() => {
    const withLogs = Object.values(stats).filter((s) => s.days > 0).map((s) => s.week);
    return withLogs.length ? Math.max(...withLogs) : 1;
  }, [stats]);

  useEffect(() => {
    const wp = plan[selected - 1];
    if (wp) onWeekChange(wp);
    if (storageKey) {
      try { localStorage.setItem(storageKey, String(selected)); } catch { /* ignore */ }
    }
  }, [selected, plan, onWeekChange, storageKey]);

  const wp = plan[selected - 1];
  const blocks = useMemo(() => mesocycleBlocks(plan), [plan]);
  const adherence = weekAdherence(stats[selected], daysPerWeek);
  const stat = stats[selected];

  if (!wp) return null;

  return (
    <div
      className="rounded-2xl p-4 mb-3"
      style={{ background: "#0c120c", border: "1px solid rgba(74,222,128,0.18)", fontFamily: FONT }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelected((w) => Math.max(1, w - 1))}
            disabled={selected === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: "rgba(74,222,128,0.1)" }}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: GREEN }} />
          </button>
          <div>
            <p className="text-[11px] font-black" style={{ color: TEXT }}>
              SEMANA {wp.week} de {total}
            </p>
            <p className="text-[9px] font-bold" style={{ color: wp.color }}>{wp.label}</p>
          </div>
          <button
            onClick={() => setSelected((w) => Math.min(total, w + 1))}
            disabled={selected === total}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: "rgba(74,222,128,0.1)" }}
            aria-label="Próxima semana"
          >
            <ChevronRight className="w-4 h-4" style={{ color: GREEN }} />
          </button>
        </div>
        <div className="text-right">
          <p className="text-[9px]" style={{ color: TEXT_MUTED }}>ADERÊNCIA DA SEMANA</p>
          <p className="text-[13px] font-black" style={{ color: adherence >= 80 ? GREEN : adherence > 0 ? "#fbbf24" : TEXT_MUTED }}>
            {adherence}%
          </p>
        </div>
      </div>

      {/* Progresso do mesociclo */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold" style={{ color: TEXT_MUTED }}>PROGRESSO DO MESOCICLO</span>
          <span className="text-[9px] font-bold" style={{ color: GREEN }}>
            {pct}% · {doneSessions}/{planned} sessões
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${GREEN}, #22d3ee)` }}
          />
        </div>
      </div>

      {/* Pills por semana, agrupadas por mesociclo */}
      <div className="space-y-2">
        {blocks.map((block) => (
          <div key={block.label}>
            <p className="text-[8px] font-bold mb-1" style={{ color: TEXT_MUTED }}>{block.label.toUpperCase()}</p>
            <div className="flex flex-wrap gap-1.5">
              {block.weeks.map((weekNumber) => {
                const item = plan[weekNumber - 1];
                if (!item) return null;
                const status = weekStatus(item, stats[weekNumber], currentWeek, daysPerWeek);
                const style = STATUS_STYLE[status];
                const active = weekNumber === selected;
                return (
                  <button
                    key={weekNumber}
                    onClick={() => setSelected(weekNumber)}
                    className="px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1"
                    style={{
                      background: style.bg,
                      color: style.color,
                      border: `1px solid ${active ? style.color : "transparent"}`,
                      outline: active ? `1px solid ${style.color}55` : "none",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
                    S{weekNumber}
                    {item.isDeload && <span style={{ opacity: 0.8 }}>DL</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {stat && (
        <p className="text-[9px] mt-3" style={{ color: TEXT_MUTED }}>
          {stat.days} dia{stat.days === 1 ? "" : "s"} registrado{stat.days === 1 ? "" : "s"} · {stat.logs} exercício
          {stat.logs === 1 ? "" : "s"}
          {stat.avgTop !== null ? ` · top set médio ${stat.avgTop.toFixed(1)}kg` : ""}
          {stat.avgRpe !== null ? ` · RPE médio ${stat.avgRpe.toFixed(1)}` : ""}
        </p>
      )}
      {wp.note && (
        <p className="text-[9px] mt-2" style={{ color: wp.color }}>{wp.note}</p>
      )}
    </div>
  );
}
