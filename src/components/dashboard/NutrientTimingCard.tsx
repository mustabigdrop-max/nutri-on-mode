import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getMealSuggestionsByTime, type WorkoutTime, type WorkoutType } from "@/hooks/useWorkoutSchedule";

// Macro split recommendations per meal role
// Each meal gets a "focus" label + protein/carb/fat priority percentages
type MealRole = "pre" | "post" | "normal";

interface RoleConfig {
  badge: string;
  badgeColor: string;
  focus: string;
  protPct: number; // % of daily protein allocated here
  carbPct: number;
  fatPct: number;
}

const ROLE_CONFIG: Record<MealRole, RoleConfig> = {
  pre: {
    badge: "Pré-treino",
    badgeColor: "bg-accent/15 text-accent border-accent/20",
    focus: "↑ Carbo + Proteína  ↓ Gordura",
    protPct: 20,
    carbPct: 30,
    fatPct: 10,
  },
  post: {
    badge: "Pós-treino",
    badgeColor: "bg-primary/15 text-primary border-primary/20",
    focus: "↑↑ Proteína + Carbo  ↓↓ Gordura",
    protPct: 30,
    carbPct: 25,
    fatPct: 5,
  },
  normal: {
    badge: "Normal",
    badgeColor: "bg-border/30 text-muted-foreground border-border/20",
    focus: "Distribuição equilibrada",
    protPct: 0,
    carbPct: 0,
    fatPct: 0,
  },
};

// Assign roles to the meal suggestions list
function assignRoles(
  suggestions: ReturnType<typeof getMealSuggestionsByTime>,
): Array<ReturnType<typeof getMealSuggestionsByTime>[number] & { role: MealRole }> {
  let preAssigned = false;
  let postAssigned = false;

  return suggestions.map((s) => {
    if (s.highlight && !preAssigned) {
      preAssigned = true;
      return { ...s, role: "pre" as MealRole };
    }
    if (s.highlight && preAssigned && !postAssigned) {
      postAssigned = true;
      return { ...s, role: "post" as MealRole };
    }
    return { ...s, role: "normal" as MealRole };
  });
}

// Given daily macro targets and the meal list, compute per-meal gram targets
function calcMealMacros(
  meals: ReturnType<typeof assignRoles>,
  proteinTarget: number,
  carbsTarget: number,
  fatTarget: number,
) {
  const normalMeals = meals.filter((m) => m.role === "normal").length || 1;

  const preProtein = Math.round((ROLE_CONFIG.pre.protPct / 100) * proteinTarget);
  const preCarbs = Math.round((ROLE_CONFIG.pre.carbPct / 100) * carbsTarget);
  const preFat = Math.round((ROLE_CONFIG.pre.fatPct / 100) * fatTarget);

  const postProtein = Math.round((ROLE_CONFIG.post.protPct / 100) * proteinTarget);
  const postCarbs = Math.round((ROLE_CONFIG.post.carbPct / 100) * carbsTarget);
  const postFat = Math.round((ROLE_CONFIG.post.fatPct / 100) * fatTarget);

  const remainProtein = proteinTarget - preProtein - postProtein;
  const remainCarbs = carbsTarget - preCarbs - postCarbs;
  const remainFat = fatTarget - preFat - postFat;

  return meals.map((m) => {
    if (m.role === "pre") return { protein: preProtein, carbs: preCarbs, fat: preFat };
    if (m.role === "post") return { protein: postProtein, carbs: postCarbs, fat: postFat };
    return {
      protein: Math.round(remainProtein / normalMeals),
      carbs: Math.round(remainCarbs / normalMeals),
      fat: Math.round(remainFat / normalMeals),
    };
  });
}

interface Props {
  workoutTime: WorkoutTime;
  workoutType: WorkoutType;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

const NutrientTimingCard = ({ workoutTime, workoutType, proteinTarget, carbsTarget, fatTarget }: Props) => {
  const suggestions = useMemo(
    () => getMealSuggestionsByTime(workoutTime, workoutType),
    [workoutTime, workoutType],
  );

  const meals = useMemo(() => assignRoles(suggestions), [suggestions]);
  const macros = useMemo(
    () => calcMealMacros(meals, proteinTarget, carbsTarget, fatTarget),
    [meals, proteinTarget, carbsTarget, fatTarget],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-4 rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest">
          Nutrient Timing
        </span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground capitalize">
          treino{" "}
          {workoutTime === "morning" ? "de manhã" : workoutTime === "afternoon" ? "à tarde" : "à noite"}
        </span>
      </div>

      {/* Timeline */}
      <div className="px-3 py-2 space-y-1.5">
        {meals.map((meal, i) => {
          const role = ROLE_CONFIG[meal.role];
          const mac = macros[i];
          const isKeyMeal = meal.role !== "normal";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className={`flex items-start gap-2.5 p-2 rounded-lg transition-all ${
                isKeyMeal ? "bg-card/80 border border-border/60" : "opacity-70"
              }`}
            >
              {/* Time dot + connector */}
              <div className="flex flex-col items-center pt-1 flex-shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    meal.role === "post"
                      ? "bg-primary"
                      : meal.role === "pre"
                        ? "bg-accent"
                        : "bg-border"
                  }`}
                />
                {i < meals.length - 1 && (
                  <div className="w-px flex-1 min-h-3 bg-border/40 mt-0.5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground">{meal.time}</span>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full border ${role.badgeColor}`}
                  >
                    {role.badge}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-foreground leading-snug truncate mb-1">
                  {meal.meal}
                </p>
                {/* Macro targets for this meal */}
                <div className="flex gap-2.5">
                  <span className="text-[9px] font-mono">
                    <span className="text-muted-foreground">P </span>
                    <span className={isKeyMeal ? "text-primary font-bold" : "text-muted-foreground"}>
                      {mac.protein}g
                    </span>
                  </span>
                  <span className="text-[9px] font-mono">
                    <span className="text-muted-foreground">C </span>
                    <span className={isKeyMeal ? "text-accent font-bold" : "text-muted-foreground"}>
                      {mac.carbs}g
                    </span>
                  </span>
                  <span className="text-[9px] font-mono">
                    <span className="text-muted-foreground">G </span>
                    <span className="text-muted-foreground">{mac.fat}g</span>
                  </span>
                </div>
              </div>

              {isKeyMeal && (
                <div className="flex-shrink-0 text-right">
                  <p className="text-[8px] font-mono text-muted-foreground/70 leading-snug max-w-[70px]">
                    {role.focus}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9px] font-mono text-muted-foreground/50 text-center pb-2">
        Distribuição baseada na janela de treino
      </p>
    </motion.div>
  );
};

export default NutrientTimingCard;
