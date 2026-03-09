import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, X, CheckCircle2, XCircle, Flame, Droplets, TrendingUp, Zap } from "lucide-react";
import html2canvas from "html2canvas";
import { DAY_NAMES, WORKOUT_TYPES, type WorkoutType } from "@/hooks/useWorkoutSchedule";

interface DayData {
  day: string;
  emoji: string;
  label: string;
  planned: boolean;
  completed: boolean;
  adjustedKcal: number;
  baseKcal: number;
  kcalDiff: number;
  protein: number;
  hydration: number;
  isPast: boolean;
}

interface Stats {
  planned: number;
  completed: number;
  consistency: number;
  totalKcalAdj: number;
  avgHydration: number;
}

interface Props {
  weekData: DayData[];
  stats: Stats;
  weekLabel: string;
  userName: string;
}

const WorkoutShareCard = ({ weekData, stats, weekLabel, userName }: Props) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");

      // Try native share first, fallback to download
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "nutrisync-semana.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Minha semana NutriSync" });
          setExporting(false);
          return;
        }
      }

      // Fallback: download
      const link = document.createElement("a");
      link.download = "nutrisync-semana.png";
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export failed", e);
    }
    setExporting(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:border-primary/40 transition-all text-xs font-mono text-primary font-bold w-full justify-center"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar semana
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm space-y-3"
            >
              {/* The shareable card */}
              <div
                ref={cardRef}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, hsl(230 25% 10%), hsl(230 20% 14%))",
                  padding: "24px",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" style={{ color: "hsl(38 80% 52%)" }} />
                    <span
                      className="text-sm font-bold tracking-wider"
                      style={{ color: "hsl(38 80% 52%)", fontFamily: "monospace" }}
                    >
                      NUTRISYNC
                    </span>
                  </div>
                  <span
                    className="text-[10px] tracking-wider"
                    style={{ color: "hsl(230 15% 50%)", fontFamily: "monospace" }}
                  >
                    {weekLabel}
                  </span>
                </div>

                {/* User name */}
                <p
                  className="text-lg font-bold mb-4"
                  style={{ color: "hsl(0 0% 95%)", fontFamily: "monospace" }}
                >
                  {userName}
                </p>

                {/* Weekly grid */}
                <div className="grid grid-cols-7 gap-1.5 mb-5">
                  {weekData.map((d) => (
                    <div
                      key={d.day}
                      className="rounded-lg text-center py-2"
                      style={{
                        background: d.completed
                          ? "hsl(38 80% 52% / 0.15)"
                          : d.planned && d.isPast
                          ? "hsl(0 70% 50% / 0.1)"
                          : "hsl(230 20% 18%)",
                        border: `1px solid ${
                          d.completed
                            ? "hsl(38 80% 52% / 0.3)"
                            : "hsl(230 15% 25%)"
                        }`,
                      }}
                    >
                      <p
                        className="text-[9px] mb-0.5"
                        style={{ color: "hsl(230 15% 50%)", fontFamily: "monospace" }}
                      >
                        {d.day}
                      </p>
                      <span className="text-base block">{d.emoji}</span>
                      {d.planned ? (
                        d.completed ? (
                          <CheckCircle2 className="w-3 h-3 mx-auto mt-0.5" style={{ color: "hsl(38 80% 52%)" }} />
                        ) : d.isPast ? (
                          <XCircle className="w-3 h-3 mx-auto mt-0.5" style={{ color: "hsl(0 70% 50%)" }} />
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full mx-auto mt-0.5"
                            style={{ border: "1px solid hsl(230 15% 40%)" }}
                          />
                        )
                      ) : (
                        <span
                          className="text-[7px] block mt-0.5"
                          style={{ color: "hsl(230 15% 40%)", fontFamily: "monospace" }}
                        >
                          off
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div
                  className="grid grid-cols-3 gap-2 mb-4"
                >
                  {[
                    { icon: TrendingUp, value: `${stats.consistency}%`, label: "Consistência", color: "hsl(38 80% 52%)" },
                    { icon: Flame, value: `${stats.totalKcalAdj > 0 ? "+" : ""}${stats.totalKcalAdj}`, label: "kcal ajustado", color: "hsl(38 80% 52%)" },
                    { icon: Droplets, value: `${stats.avgHydration.toFixed(1)}L`, label: "Água/dia", color: "hsl(200 80% 55%)" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg text-center py-2.5"
                      style={{ background: "hsl(230 20% 16%)", border: "1px solid hsl(230 15% 22%)" }}
                    >
                      <s.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: s.color }} />
                      <p
                        className="text-base font-bold"
                        style={{ color: "hsl(0 0% 95%)", fontFamily: "monospace" }}
                      >
                        {s.value}
                      </p>
                      <p
                        className="text-[8px]"
                        style={{ color: "hsl(230 15% 45%)", fontFamily: "monospace" }}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Completed ratio */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px]"
                    style={{ color: "hsl(230 15% 45%)", fontFamily: "monospace" }}
                  >
                    Treinos: {stats.completed}/{stats.planned}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "hsl(38 80% 52%)", fontFamily: "monospace" }}
                  >
                    {stats.completed === stats.planned && stats.planned > 0
                      ? "🔥 Semana perfeita!"
                      : stats.consistency >= 80
                      ? "💪 Excelente!"
                      : stats.consistency >= 50
                      ? "👍 Bom ritmo"
                      : "📈 Continue evoluindo"}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "hsl(230 20% 18%)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stats.consistency}%`,
                      background: "linear-gradient(90deg, hsl(38 80% 52%), hsl(38 90% 60%))",
                    }}
                  />
                </div>

                {/* Branding */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <Zap className="w-3 h-3" style={{ color: "hsl(230 15% 35%)" }} />
                  <span
                    className="text-[9px] tracking-[.15em]"
                    style={{ color: "hsl(230 15% 35%)", fontFamily: "monospace" }}
                  >
                    NUTRI·ON MODE
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-sm font-bold transition-all disabled:opacity-50"
                  style={{
                    background: "hsl(38 80% 52%)",
                    color: "hsl(230 25% 10%)",
                  }}
                >
                  {exporting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {exporting ? "Exportando..." : "Salvar / Compartilhar"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    borderColor: "hsl(230 15% 25%)",
                    background: "hsl(230 20% 14%)",
                    color: "hsl(230 15% 50%)",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkoutShareCard;
