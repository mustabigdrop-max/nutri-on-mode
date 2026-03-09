import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Dumbbell, Moon, ChevronDown, ChevronUp, Droplets } from "lucide-react";
import { getWorkoutAdjustment } from "@/hooks/useWorkoutSchedule";

interface Props {
  baseKcal: number;
  baseCarbs: number;
  baseFat: number;
  weightKg: number;
}

const NutriSyncComparisonCard = ({ baseKcal, baseCarbs, baseFat, weightKg }: Props) => {
  const [open, setOpen] = useState(false);

  const legs = getWorkoutAdjustment("legs", weightKg);
  const rest = getWorkoutAdjustment("rest", weightKg);

  const scenarios = [
    {
      label: "Dia de Perna",
      emoji: "🦵",
      icon: Dumbbell,
      adj: legs,
      accent: "primary",
      kcal: Math.round(baseKcal * legs.kcalMultiplier),
      protein: Math.round(legs.proteinPerKg * weightKg),
      carbs: Math.round(baseCarbs * legs.carbsMultiplier),
      fat: Math.round(baseFat * legs.fatMultiplier),
    },
    {
      label: "Dia de Descanso",
      emoji: "😴",
      icon: Moon,
      adj: rest,
      accent: "muted-foreground",
      kcal: Math.round(baseKcal * rest.kcalMultiplier),
      protein: Math.round(rest.proteinPerKg * weightKg),
      carbs: Math.round(baseCarbs * rest.carbsMultiplier),
      fat: Math.round(baseFat * rest.fatMultiplier),
    },
  ];

  const diff = {
    kcal: scenarios[0].kcal - scenarios[1].kcal,
    protein: scenarios[0].protein - scenarios[1].protein,
    carbs: scenarios[0].carbs - scenarios[1].carbs,
    fat: scenarios[0].fat - scenarios[1].fat,
    water: legs.hydrationLiters - rest.hydrationLiters,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-4"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl border border-border bg-card p-3 text-left hover:border-primary/20 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🦵</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Comparativo NutriSync
            </span>
            <span className="text-sm">😴</span>
          </div>
          {open ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>

        {!open && (
          <p className="text-[10px] font-mono text-primary mt-1">
            Perna: {scenarios[0].kcal} kcal vs Descanso: {scenarios[1].kcal} kcal ({diff.kcal > 0 ? "+" : ""}{diff.kcal})
          </p>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-b-xl border border-t-0 border-border bg-card/50 p-4 space-y-4">
              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-3">
                {scenarios.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-border bg-background/50 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-lg">{s.emoji}</span>
                      <span className="text-[10px] font-mono font-bold text-foreground leading-tight">
                        {s.label}
                      </span>
                    </div>

                    <MacroRow label="Kcal" value={s.kcal} unit="" highlight />
                    <MacroRow label="Proteína" value={s.protein} unit="g" />
                    <MacroRow label="Carbs" value={s.carbs} unit="g" />
                    <MacroRow label="Gordura" value={s.fat} unit="g" />
                    <MacroRow label="Água" value={s.adj.hydrationLiters} unit="L" isDecimal />
                  </div>
                ))}
              </div>

              {/* Diff summary */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">
                  Diferença Perna → Descanso
                </p>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {[
                    { label: "Kcal", val: diff.kcal },
                    { label: "Prot", val: diff.protein },
                    { label: "Carb", val: diff.carbs },
                    { label: "Gord", val: diff.fat },
                    { label: "Água", val: diff.water, suffix: "L", isDecimal: true },
                  ].map((d) => (
                    <div key={d.label}>
                      <p className="text-[9px] font-mono text-muted-foreground">{d.label}</p>
                      <p
                        className={`text-xs font-bold font-mono ${
                          (d.isDecimal ? d.val : d.val) > 0
                            ? "text-primary"
                            : d.val < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {d.val > 0 ? "+" : ""}
                        {d.isDecimal ? d.val.toFixed(1) : d.val}
                        {d.suffix || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono text-primary">💡 {legs.tip}</p>
                <p className="text-[9px] font-mono text-muted-foreground">😴 {rest.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MacroRow = ({
  label,
  value,
  unit,
  highlight,
  isDecimal,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
  isDecimal?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[9px] font-mono text-muted-foreground">{label}</span>
    <span
      className={`text-xs font-mono font-bold ${
        highlight ? "text-primary" : "text-foreground"
      }`}
    >
      {isDecimal ? value.toFixed(1) : value}
      <span className="text-muted-foreground font-normal text-[9px]">{unit}</span>
    </span>
  </div>
);

export default NutriSyncComparisonCard;
