import { motion } from "framer-motion";
import { Dumbbell, Check, RefreshCw, Sun, Moon, Sunset, Sunrise } from "lucide-react";
import type { TrainingDayInfo } from "@/lib/trainingDayMap";

interface PlanItemLike {
  id: string;
  meal_type: string;
  food_name: string;
  portion: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confirmed: boolean;
  swapped: boolean;
}

const MEAL_TIMES: Record<string, { hour: number; label: string; icon: any }> = {
  cafe_manha:   { hour: 7,    label: "Café da manhã", icon: Sunrise },
  lanche_manha: { hour: 10,   label: "Lanche AM",     icon: Sun },
  almoco:       { hour: 12.5, label: "Almoço",        icon: Sun },
  lanche_tarde: { hour: 16,   label: "Lanche PM",     icon: Sunset },
  jantar:       { hour: 19.5, label: "Jantar",        icon: Sunset },
  ceia:         { hour: 22,   label: "Ceia",          icon: Moon },
};

const HOUR_START = 6;
const HOUR_END = 24;
const HOUR_RANGE = HOUR_END - HOUR_START;

function formatHour(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

function parseWorkoutTime(t?: string | null): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h + (m || 0) / 60;
}

interface Props {
  items: PlanItemLike[];
  dayInfo?: TrainingDayInfo;
  onConfirm: (item: PlanItemLike) => void;
  onSwap: (item: PlanItemLike) => void;
  onSelect?: (item: PlanItemLike) => void;
}

export default function CircadianTimeline({ items, dayInfo, onConfirm, onSwap, onSelect }: Props) {
  const workoutHour = parseWorkoutTime(dayInfo?.workoutTime);

  const placed = items
    .map(it => ({ it, t: MEAL_TIMES[it.meal_type]?.hour ?? 12 }))
    .sort((a, b) => a.t - b.t);

  const pct = (h: number) => ((h - HOUR_START) / HOUR_RANGE) * 100;

  const tickHours = [6, 9, 12, 15, 18, 21, 24];

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-card via-card to-background/40 p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Cronobiologia</span>
          <span className="text-[10px] font-mono text-muted-foreground">06h → 24h</span>
        </div>
        {dayInfo?.isTraining && workoutHour && (
          <span className="text-[10px] font-mono text-primary flex items-center gap-1">
            <Dumbbell className="w-3 h-3" /> Treino {formatHour(workoutHour)}
          </span>
        )}
      </div>

      <div className="relative pl-14 pr-2" style={{ minHeight: `${placed.length * 72 + 40}px` }}>
        {/* Vertical rail */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/60 via-primary/40 to-blue-500/40" />

        {/* Hour ticks */}
        {tickHours.map(h => (
          <div
            key={h}
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${pct(h)}%` }}
          >
            <span className="w-10 text-right text-[9px] font-mono text-muted-foreground/60">{h}h</span>
            <span className="w-2 h-px bg-border ml-1" />
          </div>
        ))}

        {/* Workout marker */}
        {workoutHour && dayInfo?.isTraining && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute left-9 z-10"
            style={{ top: `${pct(workoutHour)}%`, transform: "translateY(-50%)" }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-background">
                <Dumbbell className="w-3 h-3" />
              </span>
              <span className="text-[10px] font-mono text-primary font-bold">
                TREINO{dayInfo.muscleGroup ? ` · ${dayInfo.muscleGroup}` : ""}
              </span>
            </div>
          </motion.div>
        )}

        {/* Meal nodes (positioned absolutely on rail, content flows in column) */}
        <div className="space-y-2 relative">
          {placed.map(({ it, t }, i) => {
            const meta = MEAL_TIMES[it.meal_type];
            const Icon = meta?.icon || Sun;
            const tag = workoutHour
              ? Math.abs(t - workoutHour) <= 1.5
                ? t < workoutHour ? "pre" : "post"
                : null
              : null;
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-xl border bg-card/80 backdrop-blur p-2.5 ${
                  it.confirmed ? "border-primary/40 bg-primary/5" : "border-border"
                } ${tag === "pre" ? "border-l-2 border-l-accent" : tag === "post" ? "border-l-2 border-l-primary" : ""}`}
              >
                {/* Node dot on rail */}
                <span
                  className={`absolute -left-[26px] top-3 w-3 h-3 rounded-full border-2 border-background ${
                    it.confirmed ? "bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.25)]" : "bg-muted-foreground/60"
                  }`}
                />
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center pt-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary/80" />
                    <span className="text-[9px] font-mono text-muted-foreground mt-0.5">{formatHour(t)}</span>
                  </div>

                  <button
                    onClick={() => onConfirm(it)}
                    className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                      it.confirmed
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelect?.(it)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-primary uppercase tracking-wider truncate">
                        {meta?.label || it.meal_type}
                      </span>
                      {tag && (
                        <span className={`text-[8px] font-mono px-1 py-px rounded ${tag === "pre" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>
                          {tag === "pre" ? "Pré ⚡" : "Pós 💪"}
                        </span>
                      )}
                      {it.swapped && <span className="text-[8px] font-mono text-accent">trocado</span>}
                    </div>
                    <p className={`text-sm font-semibold truncate ${it.confirmed ? "text-primary" : "text-foreground"}`}>
                      {it.food_name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {it.portion} · {it.kcal}kcal · P{it.protein_g} C{it.carbs_g} G{it.fat_g}
                    </p>
                  </button>

                  <button
                    onClick={() => onSwap(it)}
                    className="mt-0.5 w-6 h-6 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-all flex-shrink-0"
                    title="Substituir"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
