import { motion } from "framer-motion";
import type { NutrientSummary } from "@/hooks/useMicronutrients";

interface NutrientGridProps {
  nutrients: NutrientSummary[];
  loading: boolean;
}

const NutrientGrid = ({ nutrients, loading }: NutrientGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (nutrients.every(n => n.total === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Registre refeições para ver seus micronutrientes
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {nutrients.map((n, i) => {
        const barColor = n.pct >= 80 ? "bg-primary" : n.pct >= 50 ? "bg-accent" : "bg-destructive";
        return (
          <motion.div
            key={n.nutrient}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-foreground truncate">{n.label}</span>
              <span className={`text-[10px] font-mono ${n.pct >= 80 ? "text-primary" : n.pct >= 50 ? "text-accent" : "text-destructive"}`}>
                {n.pct}%
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground mb-1.5">
              {n.total}{n.unit} / {n.recommended}{n.unit}
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(n.pct, 100)}%` }}
                transition={{ duration: 0.6, delay: i * 0.03 }}
                className={`h-full rounded-full ${barColor}`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NutrientGrid;
