import { motion } from "framer-motion";
import type { CircadianMeal } from "@/hooks/useCircadian";

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Pico Insulínico": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  "Janela Principal": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  "Cortisol Caindo": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  "Pré-treino": { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  "Pós-treino": { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  "Janela Anabólica": { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  "Preparação Sono": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
};

interface Props {
  meal: CircadianMeal;
  index: number;
  isNext?: boolean;
}

const CircadianMealCard = ({ meal, index, isNext }: Props) => {
  const style = TAG_STYLES[meal.context_tag] || TAG_STYLES["Janela Principal"];
  const totalKcal = Math.round(meal.carbs_g * 4 + meal.protein_g * 4 + meal.fat_g * 9);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`p-4 rounded-xl border transition-all ${
        isNext
          ? "border-orange-400/50 bg-orange-400/5 shadow-[0_0_20px_hsl(24_95%_53%/0.1)]"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-orange-400">{meal.time}</span>
          <span className="text-sm font-semibold text-foreground">{meal.label}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
          {meal.context_tag}
        </span>
      </div>

      {/* Foods */}
      <div className="flex flex-wrap gap-1 mb-3">
        {meal.foods.map((f, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {f}
          </span>
        ))}
      </div>

      {/* Macros bar */}
      <div className="flex items-center gap-3 text-[10px]">
        <span className="font-bold text-foreground">{totalKcal} kcal</span>
        <div className="flex gap-2 text-muted-foreground">
          <span>C: <b className="text-orange-400">{meal.carbs_g}g</b></span>
          <span>P: <b className="text-emerald-400">{meal.protein_g}g</b></span>
          <span>G: <b className="text-yellow-400">{meal.fat_g}g</b></span>
        </div>
      </div>

      {/* Tip */}
      {meal.tip && (
        <p className="mt-2 text-[10px] text-muted-foreground italic border-t border-border pt-2">
          💡 {meal.tip}
        </p>
      )}

      {isNext && (
        <div className="mt-2 text-[10px] font-bold text-orange-400 animate-pulse">
          ▸ Próxima refeição
        </div>
      )}
    </motion.div>
  );
};

export default CircadianMealCard;
