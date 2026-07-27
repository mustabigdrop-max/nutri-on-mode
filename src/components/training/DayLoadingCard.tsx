import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";

const GREEN = "#22c55e";

interface Props {
  dayNumber: number;
  title?: string;
  focusMuscles?: string[];
  state: "loading" | "error";
  onRetry?: () => void;
}

export default function DayLoadingCard({ dayNumber, title, focusMuscles = [], state, onRetry }: Props) {
  const isError = state === "error";
  const accent = isError ? "#ff4060" : GREEN;
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(0,18,8,0.6)",
        border: `0.5px solid ${isError ? "rgba(255,64,96,0.3)" : "rgba(34,197,94,0.2)"}`,
        borderLeft: `2px solid ${accent}`,
      }}
    >
      <div className="flex items-center gap-3">
        {isError ? (
          <AlertTriangle size={18} style={{ color: accent }} />
        ) : (
          <Loader2 size={18} className="animate-spin" style={{ color: accent }} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: accent }}>
            D{dayNumber} · {title || `Dia ${dayNumber}`}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            {isError ? "Falha ao gerar os exercícios deste dia." : "Gerando exercícios deste dia..."}
          </p>
          {focusMuscles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {focusMuscles.map((m, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(34,197,94,0.1)", color: GREEN }}
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shrink-0"
            style={{ background: GREEN, color: "#001208" }}
          >
            <RotateCcw size={11} /> REGERAR DIA
          </button>
        )}
      </div>
      {!isError && (
        <div className="h-[3px] w-full rounded-full overflow-hidden mt-3" style={{ background: "rgba(34,197,94,0.08)" }}>
          <div className="h-full w-1/3 rounded-full animate-pulse" style={{ background: GREEN }} />
        </div>
      )}
    </div>
  );
}
