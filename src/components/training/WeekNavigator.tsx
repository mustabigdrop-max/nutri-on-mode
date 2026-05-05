import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  WEEK_PLAN,
  MESOCYCLE_BLOCKS,
  PROTOCOL_START_DATE,
  getCurrentWeekFromDate,
  nextDeloadInDays,
  WeekPhase,
} from "@/lib/weekProgression";

const FONT = "'Space Grotesk', sans-serif";
const STORAGE_KEY = "trainingon:mello16:selectedWeek";

export interface WeekSummary {
  count: number;
  avgTop: number | null;
  avgRpe: number | null;
}

interface Props {
  protocolKey?: string; // identifica o protocolo (default: mello-bulking-16)
  onWeekChange: (week: WeekPhase) => void;
  initialWeek?: number; // sobrescreve localStorage se fornecido
  weekSummaries?: Record<number, WeekSummary>;
}

export default function WeekNavigator({ protocolKey = "mello-bulking-16", onWeekChange, initialWeek, weekSummaries }: Props) {
  const storageKey = `${STORAGE_KEY}:${protocolKey}`;
  const currentRealWeek = useMemo(() => getCurrentWeekFromDate(), []);
  const [selected, setSelected] = useState<number>(() => {
    if (initialWeek && initialWeek >= 1 && initialWeek <= 16) return initialWeek;
    try {
      const raw = localStorage.getItem(storageKey);
      const n = raw ? parseInt(raw, 10) : NaN;
      if (Number.isFinite(n) && n >= 1 && n <= 16) return n;
    } catch {}
    return currentRealWeek;
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, String(selected)); } catch {}
    const wp = WEEK_PLAN[selected - 1];
    if (wp) onWeekChange(wp);
  }, [selected, storageKey, onWeekChange]);

  const summaryFor = (w: number) => weekSummaries?.[w];
  const currentSummary = summaryFor(selected);

  const wp = WEEK_PLAN[selected - 1];
  const deloadIn = nextDeloadInDays(currentRealWeek);
  const progressPct = (selected / 16) * 100;

  return (
    <div
      className="rounded-2xl p-4 mb-3"
      style={{
        background: "#0c120c",
        border: "1px solid rgba(74,222,128,0.18)",
        fontFamily: FONT,
      }}
    >
      {/* Top: setas + título + dropdown */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelected((w) => Math.max(1, w - 1))}
            disabled={selected === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: "#4ade80" }} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "#64748b" }}>
              Semana
            </span>
            <span className="text-[15px] font-black" style={{ color: "#f0fdf4" }}>
              {selected} <span style={{ color: "#64748b", fontWeight: 400 }}>de 16</span>
            </span>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: wp.bg, color: wp.color, border: `1px solid ${wp.color}40` }}
            >
              {wp.label}
            </span>
            {selected === currentRealWeek && (
              <span
                className="text-[8px] px-1.5 py-0.5 rounded-full font-black"
                style={{ background: "rgba(74,222,128,0.18)", color: "#4ade80", border: "1px solid #4ade80" }}
              >
                AGORA
              </span>
            )}
          </div>

          <button
            onClick={() => setSelected((w) => Math.min(16, w + 1))}
            disabled={selected === 16}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}
          >
            <ChevronRight className="w-4 h-4" style={{ color: "#4ade80" }} />
          </button>
        </div>

        <select
          value={selected}
          onChange={(e) => setSelected(parseInt(e.target.value, 10))}
          className="text-[11px] rounded-lg px-2 py-1.5 outline-none"
          style={{
            background: "#111a11",
            color: "#f0fdf4",
            border: "1px solid rgba(74,222,128,0.2)",
            fontFamily: FONT,
          }}
        >
          {WEEK_PLAN.map((w) => {
            const s = summaryFor(w.week);
            return (
              <option key={w.week} value={w.week}>
                Sem {w.week} — {w.label}{s ? " ✓" : ""}
              </option>
            );
          })}
        </select>
      </div>

      {currentSummary && (
        <div
          className="mb-2 text-[10px] px-2 py-1 rounded-md inline-block"
          style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
        >
          ✓ Concluída · Top Set médio: {currentSummary.avgTop?.toFixed(1) ?? "—"}kg · RPE médio: {currentSummary.avgRpe?.toFixed(1) ?? "—"}
        </div>
      )}

      {/* Barra de progresso por mesociclo */}
      <div className="relative">
        <div className="flex gap-1.5">
          {MESOCYCLE_BLOCKS.map((block, bi) => {
            const total = block.weeks.length;
            const completed = block.weeks.filter((w) => w <= selected).length;
            const pct = (completed / total) * 100;
            return (
              <div key={bi} className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                    {block.label}
                  </span>
                  <span className="text-[8px]" style={{ color: "#64748b" }}>
                    {block.weeks[0]}–{block.weeks[block.weeks.length - 1]}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(74,222,128,0.08)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4 }}
                    style={{ height: "100%", background: "#4ade80" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1 text-right text-[8px]" style={{ color: "#64748b" }}>
          {progressPct.toFixed(0)}% do ciclo
        </div>
      </div>

      {/* Footer: deload + data início */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-[9px]" style={{ color: "#64748b" }}>
          <Calendar className="w-3 h-3" />
          Início: {PROTOCOL_START_DATE.toLocaleDateString("pt-BR")}
        </div>
        {deloadIn !== null && (
          <span
            className="text-[9px] px-2 py-1 rounded-full font-bold"
            style={{
              background: deloadIn <= 7 ? "rgba(251,191,36,0.12)" : "rgba(148,163,184,0.1)",
              color: deloadIn <= 7 ? "#fbbf24" : "#94a3b8",
              border: `1px solid ${deloadIn <= 7 ? "rgba(251,191,36,0.3)" : "rgba(148,163,184,0.2)"}`,
            }}
          >
            Próximo deload em {deloadIn} {deloadIn === 1 ? "dia" : "dias"}
          </span>
        )}
      </div>
    </div>
  );
}
