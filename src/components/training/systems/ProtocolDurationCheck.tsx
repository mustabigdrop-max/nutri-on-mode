import { useMemo } from "react";
import { Clock, CheckCircle2, AlertOctagon, ChevronRight } from "lucide-react";
import { estimateProtocolDuration } from "@/data/protocolDuration";

interface Props {
  systemId: string;
  muscles: string[];
  level: string;
  sessionDuration: string;
  cardio?: string;
  onFitChange?: (fits: boolean) => void;
  // theme
  surface?: string; surface2?: string;
  border?: string; borderActive?: string;
  green?: string; greenDim?: string;
  text?: string; textDim?: string; textMuted?: string;
}

export default function ProtocolDurationCheck({
  systemId, muscles, level, sessionDuration, cardio, onFitChange,
  surface = "#0c120c", surface2 = "#111a11",
  border = "rgba(74,222,128,0.1)", borderActive = "rgba(74,222,128,0.35)",
  green = "#4ade80", greenDim = "rgba(74,222,128,0.08)",
  text = "#f0fdf4", textDim = "#94a3b8", textMuted = "#64748b",
}: Props) {
  const est = useMemo(
    () => estimateProtocolDuration({ systemId, muscles, level, sessionDuration, cardio }),
    [systemId, muscles, level, sessionDuration, cardio]
  );

  // Notifica o pai quando a aderência muda
  useMemo(() => { onFitChange?.(est.fits); }, [est.fits, onFitChange]);

  const overflow = !est.fits;
  const overflowSevere = est.diff <= -15;
  const fillPct = Math.min(120, (est.estimatedMin / est.availableMin) * 100);

  const accent = overflowSevere ? "#f87171" : overflow ? "#fbbf24" : green;
  const accentBg = overflowSevere ? "rgba(239,68,68,0.08)" : overflow ? "rgba(251,191,36,0.08)" : greenDim;
  const accentBorder = overflowSevere ? "rgba(239,68,68,0.4)" : overflow ? "rgba(251,191,36,0.4)" : borderActive;

  return (
    <div className="rounded-xl p-3 space-y-3" style={{ background: surface2, border: `1px solid ${border}` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 shrink-0" style={{ color: accent }} />
          <div className="min-w-0">
            <p className="text-xs font-black" style={{ color: text }}>Tempo estimado do protocolo</p>
            <p className="text-[10px]" style={{ color: textMuted }}>
              Base: {est.exercises} exercícios · {est.totalSets} sets · descanso médio {est.avgRestSec}s
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black leading-none" style={{ color: accent }}>{est.estimatedMin}<span className="text-[10px] font-bold ml-0.5">min</span></p>
          <p className="text-[9px] mt-0.5" style={{ color: textMuted }}>de {est.availableMin}min</p>
        </div>
      </div>

      {/* Barra visual */}
      <div className="space-y-1">
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: surface }}>
          <div className="absolute inset-y-0 left-0 transition-all"
            style={{ width: `${Math.min(100, fillPct)}%`, background: accent }} />
          {fillPct > 100 && (
            <div className="absolute inset-y-0 right-0 animate-pulse"
              style={{ width: `${Math.min(20, fillPct - 100)}%`, background: "#f87171" }} />
          )}
        </div>
        <div className="flex justify-between text-[9px]" style={{ color: textMuted }}>
          <span>0min</span>
          <span style={{ color: accent }}>● {fillPct.toFixed(0)}% do tempo</span>
          <span>{est.availableMin}min</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-1.5">
        {est.breakdown.map((b) => (
          <div key={b.label} className="p-1.5 rounded-lg text-center" style={{ background: surface, border: `1px solid ${border}` }}>
            <p className="text-[8px] uppercase font-black tracking-wider" style={{ color: textDim }}>{b.label.split(" (")[0]}</p>
            <p className="text-sm font-black mt-0.5" style={{ color: text }}>{b.minutes}<span className="text-[9px] font-bold ml-0.5" style={{ color: textMuted }}>min</span></p>
          </div>
        ))}
      </div>

      {/* Status / bloqueio */}
      <div className="p-2.5 rounded-lg" style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
        <div className="flex items-start gap-2">
          {est.fits ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
          ) : (
            <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black" style={{ color: accent }}>
              {est.fits
                ? `✅ Cabe na sessão (sobram ${est.diff} min)`
                : overflowSevere
                  ? `⛔ Estoura ${Math.abs(est.diff)} min — geração bloqueada`
                  : `⚠️ Estoura ${Math.abs(est.diff)} min — ajuste antes de gerar`}
            </p>
            {!est.fits && (
              <ul className="text-[10px] mt-1.5 space-y-0.5" style={{ color: text }}>
                <li className="flex items-start gap-1"><ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />Aumente o tempo de sessão na anamnese</li>
                <li className="flex items-start gap-1"><ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />Reduza músculos prioritários (atual: {muscles.length})</li>
                <li className="flex items-start gap-1"><ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />Troque para sistema mais denso (EDT, Heavy Duty, DC)</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
