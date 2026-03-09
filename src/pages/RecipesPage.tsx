import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { RECIPE_DB, Recipe } from "@/data/recipeDb";
import {
  ArrowLeft, Clock, Flame, ChevronDown, ChevronUp, Check,
  Star, Filter, X, ChevronRight, Utensils, Home
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

type MacroFilter = "all" | "protein" | "carbs" | "fat" | "balanced";
type TimeFilter = "all" | "5" | "15" | "30";
type MealFilter = "all" | "cafe" | "almoco" | "lanche" | "jantar";
type CalFilter = "all" | "light" | "medium" | "heavy";

const MEAL_TYPE_MAP: Record<string, string> = {
  cafe: "cafe_da_manha",
  almoco: "almoco",
  lanche: "lanche",
  jantar: "jantar",
};

const RecipesPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [todayTotals, setTodayTotals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [recentFoods, setRecentFoods] = useState<string[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);

  // Filters
  const [macroFilter, setMacroFilter] = useState<MacroFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [mealFilter, setMealFilter] = useState<MealFilter>("all");
  const [calFilter, setCalFilter] = useState<CalFilter>("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Fetch today's meals and recent foods
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

    Promise.all([
      supabase.from("meal_logs").select("total_kcal, total_protein, total_carbs, total_fat")
        .eq("user_id", user.id).eq("meal_date", today),
      supabase.from("meal_logs").select("food_names")
        .eq("user_id", user.id).gte("meal_date", fourteenDaysAgo),
    ]).then(([todayRes, recentRes]) => {
      const meals = todayRes.data || [];
      setTodayTotals({
        kcal: meals.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0),
        protein: meals.reduce((s, m) => s + (Number(m.total_protein) || 0), 0),
        carbs: meals.reduce((s, m) => s + (Number(m.total_carbs) || 0), 0),
        fat: meals.reduce((s, m) => s + (Number(m.total_fat) || 0), 0),
      });

      // Count food frequency
      const foodCount: Record<string, number> = {};
      (recentRes.data || []).forEach((m: any) => {
        (m.food_names || []).forEach((f: string) => {
          const key = f.toLowerCase().trim();
          foodCount[key] = (foodCount[key] || 0) + 1;
        });
      });
      const common = Object.entries(foodCount)
        .filter(([, c]) => c >= 3)
        .map(([name]) => name);
      setRecentFoods(common);
    });
  }, [user]);

  const kcalTarget = profile?.vet_kcal || 2000;
  const proteinTarget = profile?.protein_g || 150;
  const carbsTarget = profile?.carbs_g || 250;
  const fatTarget = profile?.fat_g || 65;
  const objetivo = profile?.objetivo_principal || "saude_geral";
  const restrictions = (profile?.dietary_restrictions || []).map(r => r.toLowerCase());

  const remaining = {
    kcal: Math.max(kcalTarget - todayTotals.kcal, 0),
    protein: Math.max(proteinTarget - todayTotals.protein, 0),
    carbs: Math.max(carbsTarget - todayTotals.carbs, 0),
    fat: Math.max(fatTarget - todayTotals.fat, 0),
  };

  // Determine which macro is most deficient by %
  const deficiencies = {
    protein: proteinTarget > 0 ? (remaining.protein / proteinTarget) * 100 : 0,
    carbs: carbsTarget > 0 ? (remaining.carbs / carbsTarget) * 100 : 0,
    fat: fatTarget > 0 ? (remaining.fat / fatTarget) * 100 : 0,
  };
  const primaryDeficiency = Object.entries(deficiencies).sort((a, b) => b[1] - a[1])[0][0] as "protein" | "carbs" | "fat";

  // Check if recipe has common ingredients
  const hasCommonIngredients = (recipe: Recipe) => {
    return recipe.ingredients.some(i =>
      i.common && recentFoods.some(f =>
        i.name.toLowerCase().includes(f) || f.includes(i.name.toLowerCase())
      )
    );
  };

  // Score and filter recipes
  const scoredRecipes = useMemo(() => {
    const hour = new Date().getHours();

    return RECIPE_DB
      .filter(r => {
        // Exclude infantil if not infantil objective (and vice versa)
        if (objetivo === "infantil" && !r.tags.includes("infantil")) return false;
        if (objetivo !== "infantil" && r.tags.includes("infantil") && !r.tags.some(t => t !== "infantil")) return false;

        // Check restrictions
        if (restrictions.length > 0) {
          const ingredientNames = r.ingredients.map(i => i.name.toLowerCase()).join(" ");
          if (restrictions.some(rest => ingredientNames.includes(rest))) return false;
        }

        // Calorie filter: recipe must fit in remaining kcal (with 20% margin)
        if (r.kcal > remaining.kcal * 1.2 && remaining.kcal > 0) return false;

        // Manual filters
        if (macroFilter !== "all" && r.macro_focus !== macroFilter) return false;
        if (timeFilter !== "all" && r.time_min > parseInt(timeFilter)) return false;
        if (mealFilter !== "all" && !r.tags.includes(mealFilter)) return false;
        if (calFilter === "light" && r.kcal > 300) return false;
        if (calFilter === "medium" && (r.kcal < 300 || r.kcal > 500)) return false;
        if (calFilter === "heavy" && r.kcal < 500) return false;
        if (onlyAvailable && !hasCommonIngredients(r)) return false;

        // Late night: only quick recipes
        if (hour >= 21 && r.time_min > 10) return false;

        return true;
      })
      .map(r => {
        let score = 0;

        // Prioritize by primary deficiency
        if (primaryDeficiency === "protein" && r.macro_focus === "protein") score += 30;
        if (primaryDeficiency === "carbs" && r.macro_focus === "carbs") score += 30;
        if (primaryDeficiency === "fat" && r.macro_focus === "fat") score += 30;

        // Objective scoring
        if (objetivo === "emagrecimento" && r.kcal < 400) score += 15;
        if (objetivo === "hipertrofia" && r.protein >= 25) score += 15;

        // Common ingredients bonus
        if (hasCommonIngredients(r)) score += 20;

        // Quick recipe bonus if late
        if (hour >= 18 && r.time_min <= 10) score += 10;

        // Tag match bonus
        if (r.tags.includes(objetivo)) score += 10;

        return { recipe: r, score, hasIngredients: hasCommonIngredients(r) };
      })
      .sort((a, b) => b.score - a.score);
  }, [todayTotals, remaining, macroFilter, timeFilter, mealFilter, calFilter, onlyAvailable, objetivo, restrictions, recentFoods, primaryDeficiency]);

  const handleRegister = async (recipe: Recipe) => {
    if (!user) return;
    setRegistering(recipe.id);

    // Determine meal type based on time
    const hour = new Date().getHours();
    let mealType = "lanche";
    if (hour < 10) mealType = "cafe_da_manha";
    else if (hour < 14) mealType = "almoco";
    else if (hour < 17) mealType = "lanche";
    else mealType = "jantar";

    if (mealFilter !== "all") {
      mealType = MEAL_TYPE_MAP[mealFilter] || mealType;
    }

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      meal_type: mealType,
      food_names: recipe.ingredients.map(i => i.name),
      total_kcal: recipe.kcal,
      total_protein: recipe.protein,
      total_carbs: recipe.carbs,
      total_fat: recipe.fat,
      notes: `📖 Receita: ${recipe.name}`,
      confirmed: true,
    });

    if (error) {
      toast.error("Erro ao registrar receita");
    } else {
      // Update local totals
      setTodayTotals(prev => ({
        kcal: prev.kcal + recipe.kcal,
        protein: prev.protein + recipe.protein,
        carbs: prev.carbs + recipe.carbs,
        fat: prev.fat + recipe.fat,
      }));

      const newRemProt = Math.max(proteinTarget - (todayTotals.protein + recipe.protein), 0);
      const closedProtein = newRemProt <= 5;

      toast.success(
        closedProtein
          ? `🎯 Proteína batida! ${recipe.name} registrada.`
          : `✅ ${recipe.name} registrada — faltam ${Math.round(newRemProt)}g de proteína.`,
        { duration: 4000 }
      );
    }
    setRegistering(null);
  };

  const filterChips = [
    { label: "💪 + Proteína", active: macroFilter === "protein", onClick: () => setMacroFilter(macroFilter === "protein" ? "all" : "protein") },
    { label: "⚡ + Carbo", active: macroFilter === "carbs", onClick: () => setMacroFilter(macroFilter === "carbs" ? "all" : "carbs") },
    { label: "🥑 + Gordura", active: macroFilter === "fat", onClick: () => setMacroFilter(macroFilter === "fat" ? "all" : "fat") },
    { label: "⚖️ Balanceada", active: macroFilter === "balanced", onClick: () => setMacroFilter(macroFilter === "balanced" ? "all" : "balanced") },
  ];

  const timeChips = [
    { label: "⏱️ 5 min", active: timeFilter === "5", onClick: () => setTimeFilter(timeFilter === "5" ? "all" : "5") },
    { label: "⏱️ 15 min", active: timeFilter === "15", onClick: () => setTimeFilter(timeFilter === "15" ? "all" : "15") },
    { label: "⏱️ 30 min", active: timeFilter === "30", onClick: () => setTimeFilter(timeFilter === "30" ? "all" : "30") },
  ];

  const mealChips = [
    { label: "☕ Café", active: mealFilter === "cafe", onClick: () => setMealFilter(mealFilter === "cafe" ? "all" : "cafe") },
    { label: "🍽️ Almoço", active: mealFilter === "almoco", onClick: () => setMealFilter(mealFilter === "almoco" ? "all" : "almoco") },
    { label: "🥤 Lanche", active: mealFilter === "lanche", onClick: () => setMealFilter(mealFilter === "lanche" ? "all" : "lanche") },
    { label: "🌙 Jantar", active: mealFilter === "jantar", onClick: () => setMealFilter(mealFilter === "jantar" ? "all" : "jantar") },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">🍳 Receitas para hoje</h1>
            <p className="text-[10px] font-mono text-muted-foreground">Filtradas por macros em aberto</p>
          </div>
        </div>

        {/* Macro summary card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4"
        >
          <p className="text-xs font-mono text-primary mb-3">O que falta fechar hoje:</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Proteína", icon: "💪", value: Math.round(remaining.protein), unit: "g", pct: deficiencies.protein },
              { label: "Carbo", icon: "🍞", value: Math.round(remaining.carbs), unit: "g", pct: deficiencies.carbs },
              { label: "Gordura", icon: "🫙", value: Math.round(remaining.fat), unit: "g", pct: deficiencies.fat },
              { label: "Calorias", icon: "🔥", value: Math.round(remaining.kcal), unit: "kcal", pct: (remaining.kcal / kcalTarget) * 100 },
            ].map(m => (
              <div key={m.label} className="text-center">
                <span className="text-lg">{m.icon}</span>
                <p className="text-sm font-bold font-mono text-foreground">{m.value}{m.unit === "g" ? "g" : ""}</p>
                {m.unit === "kcal" && <p className="text-[9px] font-mono text-muted-foreground">{m.value} kcal</p>}
                <p className="text-[9px] font-mono text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground">
            Filtrei <span className="font-bold text-primary">{scoredRecipes.length}</span> receitas que fecham seus macros e cabem no saldo calórico.
            {recentFoods.length > 0 && " 🏠 Priorizei ingredientes do seu histórico."}
          </p>
        </motion.div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:border-primary/30 transition-colors"
        >
          <Filter className="w-4 h-4 text-primary" />
          Filtros
          {showFilters ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="space-y-3 p-3 rounded-xl border border-border bg-card">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-1.5">MACRO FOCUS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filterChips.map(c => (
                      <button
                        key={c.label}
                        onClick={c.onClick}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                          c.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-1.5">TEMPO</p>
                  <div className="flex flex-wrap gap-1.5">
                    {timeChips.map(c => (
                      <button
                        key={c.label}
                        onClick={c.onClick}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                          c.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-1.5">REFEIÇÃO</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mealChips.map(c => (
                      <button
                        key={c.label}
                        onClick={c.onClick}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                          c.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-1.5">CALORIAS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Leve <300", val: "light" as CalFilter },
                      { label: "Médio 300-500", val: "medium" as CalFilter },
                      { label: "Completo 500+", val: "heavy" as CalFilter },
                    ].map(c => (
                      <button
                        key={c.val}
                        onClick={() => setCalFilter(calFilter === c.val ? "all" : c.val)}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                          calFilter === c.val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    onlyAvailable ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Home className="w-3 h-3" />
                  🏠 Só o que tenho em casa
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipe list */}
        <div className="space-y-3">
          {scoredRecipes.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
              <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma receita encontrada com esses filtros</p>
              <button
                onClick={() => { setMacroFilter("all"); setTimeFilter("all"); setMealFilter("all"); setCalFilter("all"); setOnlyAvailable(false); }}
                className="text-xs text-primary font-mono mt-2"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            scoredRecipes.map(({ recipe, hasIngredients }, i) => {
              const isExpanded = expandedRecipe === recipe.id;
              const protPct = remaining.protein > 0 ? Math.min(Math.round((recipe.protein / remaining.protein) * 100), 100) : 100;

              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{recipe.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{recipe.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {recipe.time_min} min
                          </span>
                          {hasIngredients && (
                            <span className="text-[10px] font-mono text-primary">🏠 Você tem</span>
                          )}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>

                    {/* Macro row */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] font-mono text-foreground">💪 {recipe.protein}g</span>
                      <span className="text-[11px] font-mono text-foreground">🍞 {recipe.carbs}g</span>
                      <span className="text-[11px] font-mono text-foreground">🫙 {recipe.fat}g</span>
                      <span className="text-[11px] font-mono text-primary font-bold">🔥 {recipe.kcal}kcal</span>
                    </div>

                    {/* Impact tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        ✅ Fecha {protPct}% da proteína restante
                      </span>
                      {recipe.kcal <= remaining.kcal && (
                        <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          ✅ Dentro do saldo calórico
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 border-t border-border pt-3">
                          {/* Ingredients */}
                          <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-2">Ingredientes</p>
                          <div className="space-y-1 mb-3">
                            {recipe.ingredients.map((ing, j) => (
                              <div key={j} className="flex items-center gap-2 text-xs text-foreground">
                                <span className={`w-1.5 h-1.5 rounded-full ${ing.common ? "bg-primary" : "bg-muted-foreground"}`} />
                                <span>{ing.name}</span>
                                <span className="text-muted-foreground ml-auto">{ing.amount}</span>
                              </div>
                            ))}
                          </div>

                          {/* Steps */}
                          <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-2">Preparo</p>
                          <div className="space-y-1.5 mb-4">
                            {recipe.steps.map((step, j) => (
                              <div key={j} className="flex items-start gap-2 text-xs text-foreground">
                                <span className="text-[10px] font-mono text-primary font-bold mt-0.5">{j + 1}.</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>

                          {/* Register button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRegister(recipe); }}
                            disabled={registering === recipe.id}
                            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm glow-gold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {registering === recipe.id ? (
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Registrar agora
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default RecipesPage;
