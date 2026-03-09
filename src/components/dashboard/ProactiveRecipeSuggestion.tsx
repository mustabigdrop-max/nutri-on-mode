import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Utensils, ChevronRight, Clock } from "lucide-react";
import { RECIPE_DB, Recipe } from "@/data/recipeDb";

interface Props {
  proteinConsumed: number;
  proteinTarget: number;
  kcalConsumed: number;
  kcalTarget: number;
}

const ProactiveRecipeSuggestion = ({ proteinConsumed, proteinTarget, kcalConsumed, kcalTarget }: Props) => {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const proteinRemaining = proteinTarget - proteinConsumed;
  const kcalRemaining = kcalTarget - kcalConsumed;

  const shouldShow = hour >= 19 && proteinRemaining >= 30;

  const topRecipes = useMemo(() => {
    if (!shouldShow) return [];
    return RECIPE_DB
      .filter(r => r.macro_focus === "protein" && r.kcal <= Math.max(kcalRemaining, 400) && r.time_min <= 15)
      .sort((a, b) => {
        const scoreA = a.protein - a.time_min * 0.5;
        const scoreB = b.protein - b.time_min * 0.5;
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [shouldShow, kcalRemaining]);

  if (!shouldShow || topRecipes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Utensils className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-0.5">Sugestão de receita</p>
          <p className="text-sm text-foreground leading-relaxed">
            💪 Faltam <span className="font-bold text-primary">{Math.round(proteinRemaining)}g</span> de proteína hoje. Separei 3 receitas rápidas:
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {topRecipes.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => navigate("/recipes")}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-card/60 border border-border hover:border-primary/30 transition-all text-left group"
          >
            <span className="text-xl">{recipe.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-foreground font-medium truncate">{recipe.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {recipe.time_min}min
                </span>
                <span className="text-[10px] font-mono text-primary font-bold">{recipe.protein}g prot</span>
                <span className="text-[10px] font-mono text-muted-foreground">{recipe.kcal}kcal</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default ProactiveRecipeSuggestion;
