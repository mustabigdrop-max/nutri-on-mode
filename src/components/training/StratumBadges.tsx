import { useState } from "react";
import { ChevronDown, Cpu } from "lucide-react";
import type { StratumResult } from "@/lib/stratumEngine";

const GREEN = "#4ade80";
const TEXT = "#f0fdf4";
const TEXT_DIM = "#94a3b8";
const TEXT_MUTED = "#64748b";

export default function StratumBadges({ result, compact }: { result: StratumResult; compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider" style={{ color: TEXT_MUTED }}>
          <Cpu className="w-3 h-3" style={{ color: GREEN }} />
          DECISÕES DO MOTOR STRATUM
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {result.decisions.map((d) => (
          <button
            key={d.id}
            onClick={() => setOpen(open === d.id ? null : d.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition"
            style={{
              background: open === d.id ? "rgba(74,222,128,0.16)" : "rgba(74,222,128,0.07)",
              border: `1px solid rgba(74,222,128,${open === d.id ? 0.4 : 0.18})`,
              color: open === d.id ? GREEN : TEXT_DIM,
            }}
          >
            {d.label}
            <ChevronDown className="w-3 h-3" style={{ transform: open === d.id ? "rotate(180deg)" : "none" }} />
          </button>
        ))}
      </div>

      {open && (() => {
        const d = result.decisions.find((x) => x.id === open)!;
        return (
          <div className="p-3 rounded-xl" style={{ background: "#0c120c", border: "1px solid rgba(74,222,128,0.18)" }}>
            <div className="text-[11px] font-bold mb-1" style={{ color: TEXT }}>{d.label}</div>
            <p className="text-[11px] leading-relaxed" style={{ color: TEXT_DIM }}>{d.detail}</p>
            {d.ref && <p className="text-[9px] italic mt-1.5" style={{ color: TEXT_MUTED }}>📚 {d.ref}</p>}
            {d.id === "volume" && (
              <div className="mt-2 space-y-0.5">
                {result.volume.map((v) => (
                  <div key={v.muscle} className="flex justify-between text-[10px]">
                    <span style={{ color: TEXT_MUTED }}>{v.muscle}</span>
                    <span style={{ color: TEXT }}>
                      {v.weeklySets} séries/sem · MEV {v.mev} / MAV {v.mav[0]}-{v.mav[1]} / MRV {v.mrv}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
