import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, ChevronDown } from "lucide-react";
import { CLIMATE_OPTIONS, type ClimateBand, type HydrationTarget } from "@/lib/nutrySync";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";
const DIM = "#8A8A8A";

interface Props {
  consumedMl: number;
  target: HydrationTarget;
  climate: ClimateBand;
  onClimateChange: (band: ClimateBand) => void;
  onAdd: (ml: number) => void;
  readOnly?: boolean;
}

export default function HydrationCard({
  consumedMl, target, climate, onClimateChange, onAdd, readOnly,
}: Props) {
  const [showWhy, setShowWhy] = useState(false);
  const pct = target.targetMl > 0 ? Math.min(100, Math.round((consumedMl / target.targetMl) * 100)) : 0;
  const message =
    pct >= 100 ? "Meta batida! 💪" : pct >= 50 ? "Mais da metade!" : pct > 0 ? "Bora hidratar" : "Comece agora";

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        border: `1px solid ${CYAN}22`,
        borderLeft: `3px solid ${CYAN}`,
        background: `linear-gradient(135deg, ${CYAN}0f, ${CYAN}03)`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="w-4 h-4" style={{ color: CYAN }} />
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: CYAN }}>
          Hidratação
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Garrafa */}
        <div
          className="relative w-14 h-24 rounded-xl overflow-hidden flex-shrink-0"
          style={{ border: `1px solid ${CYAN}44`, background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ background: `linear-gradient(180deg, ${CYAN}cc, ${CYAN}55)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black font-mono" style={{ color: "#fff" }}>{pct}%</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-lg font-black font-mono" style={{ color: "#fff" }}>
            {(consumedMl / 1000).toFixed(1)} / {(target.targetMl / 1000).toFixed(1)} L
          </p>
          <p className="text-xs" style={{ color: pct >= 100 ? GREEN : DIM }}>{message}</p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {[250, 500, 750].map((ml) => (
              <button
                key={ml}
                disabled={readOnly}
                onClick={() => onAdd(ml)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg disabled:opacity-40"
                style={{ background: `${CYAN}14`, color: CYAN, border: `1px solid ${CYAN}33` }}
              >
                +{ml}ml
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clima informado */}
      <p className="text-[10px] uppercase tracking-wider mt-4 mb-1.5" style={{ color: DIM }}>
        Como está o clima hoje?
      </p>
      <div className="flex gap-1.5">
        {CLIMATE_OPTIONS.map((c) => (
          <button
            key={c.band}
            disabled={readOnly}
            onClick={() => onClimateChange(c.band)}
            className="flex-1 text-[10px] font-semibold px-1 py-1.5 rounded-lg disabled:opacity-40"
            style={{
              background: climate === c.band ? `${CYAN}1a` : "rgba(255,255,255,0.04)",
              border: `1px solid ${climate === c.band ? `${CYAN}66` : "rgba(255,255,255,0.08)"}`,
              color: climate === c.band ? CYAN : DIM,
            }}
          >
            {c.emoji} {c.label.split(" ")[0]}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowWhy((v) => !v)}
        className="flex items-center gap-1 text-[11px] mt-3"
        style={{ color: DIM }}
      >
        Por que {(target.targetMl / 1000).toFixed(1)}L hoje?
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{ transform: showWhy ? "rotate(180deg)" : "none" }}
        />
      </button>
      {showWhy && (
        <div className="mt-2 space-y-1">
          {target.breakdown.map((b) => (
            <div key={b.label} className="flex items-center justify-between text-[11px] font-mono">
              <span style={{ color: DIM }}>{b.label}</span>
              <span style={{ color: "#fff" }}>+{b.ml} ml</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
