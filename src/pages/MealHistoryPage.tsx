import { useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Utensils, Trash2,
  Clock, Flame, Zap, Droplets, Apple
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const MEAL_LABELS: Record<string, { label: string; emoji: string }> = {
  cafe_manha: { label: "Café da Manhã", emoji: "☕" },
  cafe_da_manha: { label: "Café da Manhã", emoji: "☕" },
  lanche_manha: { label: "Lanche AM", emoji: "🍎" },
  almoco: { label: "Almoço", emoji: "🍽️" },
  lunch: { label: "Almoço", emoji: "🍽️" },
  lanche_tarde: { label: "Lanche PM", emoji: "🥤" },
  jantar: { label: "Jantar", emoji: "🌙" },
  dinner: { label: "Jantar", emoji: "🌙" },
  ceia: { label: "Ceia", emoji: "🫖" },
  snack: { label: "Lanche", emoji: "🥤" },
  breakfast: { label: "Café da Manhã", emoji: "☕" },
};

interface MealLog {
  id: string;
  meal_type: string;
  total_kcal: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
  food_names: string[] | null;
  notes: string | null;
  emotion: string | null;
  hunger_level: number | null;
  satiety_level: number | null;
  quality_score: number | null;
  photo_url: string | null;
  confirmed: boolean | null;
  created_at: string;
}

const MealHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const displayDate = format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) return;
    const fetchMeals = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("meal_date", dateStr)
        .order("created_at", { ascending: true });
      setMeals((data as MealLog[]) ?? []);
      setLoading(false);
    };
    fetchMeals();
  }, [user, dateStr]);

  const totals = useMemo(() => ({
    kcal: meals.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0),
    protein: meals.reduce((s, m) => s + (Number(m.total_protein) || 0), 0),
    carbs: meals.reduce((s, m) => s + (Number(m.total_carbs) || 0), 0),
    fat: meals.reduce((s, m) => s + (Number(m.total_fat) || 0), 0),
  }), [meals]);

  const deleteMeal = async (id: string) => {
    const { error } = await supabase.from("meal_logs").delete().eq("id", id);
    if (!error) {
      setMeals(prev => prev.filter(m => m.id !== id));
      toast.success("Refeição removida");
    } else {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Histórico de Refeições</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Detalhes e resumo do dia</p>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-4 max-w-lg mx-auto space-y-4">
        {/* Date selector */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground capitalize">{isToday ? "Hoje" : displayDate}</p>
            {!isToday && <p className="text-[10px] text-muted-foreground font-mono">{format(selectedDate, "dd/MM/yyyy")}</p>}
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            disabled={isToday}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day summary */}
        {meals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-2"
          >
            {[
              { label: "Kcal", value: totals.kcal, icon: Flame, color: "text-primary" },
              { label: "Prot", value: `${Math.round(totals.protein)}g`, icon: Zap, color: "text-primary" },
              { label: "Carb", value: `${Math.round(totals.carbs)}g`, icon: Apple, color: "text-accent" },
              { label: "Gord", value: `${Math.round(totals.fat)}g`, icon: Droplets, color: "text-destructive" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                <s.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${s.color}`} />
                <p className="text-lg font-bold font-mono text-foreground">{typeof s.value === "number" ? Math.round(s.value) : s.value}</p>
                <p className="text-[9px] text-muted-foreground font-mono">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Meal list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Nenhuma refeição neste dia</p>
            {isToday && (
              <button
                onClick={() => navigate("/meal-log")}
                className="mt-3 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                Registrar Refeição
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {meals.map((meal, i) => {
                const info = MEAL_LABELS[meal.meal_type] || { label: meal.meal_type, emoji: "🍽️" };
                const isExpanded = expandedMeal === meal.id;

                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                      className="w-full p-3 flex items-center gap-3 text-left"
                    >
                      <span className="text-2xl">{info.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{info.label}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {Math.round(Number(meal.total_kcal) || 0)} kcal · {Math.round(Number(meal.total_protein) || 0)}g P
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {meal.quality_score && (
                          <span className={`text-xs font-mono font-bold ${
                            meal.quality_score >= 80 ? "text-primary" :
                            meal.quality_score >= 50 ? "text-accent" : "text-destructive"
                          }`}>
                            {meal.quality_score}pts
                          </span>
                        )}
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {format(new Date(meal.created_at), "HH:mm")}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-3 space-y-3">
                            {/* Macros detail */}
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { label: "Proteína", value: `${Math.round(Number(meal.total_protein) || 0)}g`, color: "bg-primary/10 text-primary" },
                                { label: "Carboidrato", value: `${Math.round(Number(meal.total_carbs) || 0)}g`, color: "bg-accent/10 text-accent" },
                                { label: "Gordura", value: `${Math.round(Number(meal.total_fat) || 0)}g`, color: "bg-destructive/10 text-destructive" },
                              ].map(m => (
                                <div key={m.label} className={`rounded-lg p-2 text-center ${m.color}`}>
                                  <p className="text-xs font-bold">{m.value}</p>
                                  <p className="text-[9px] opacity-70">{m.label}</p>
                                </div>
                              ))}
                            </div>

                            {/* Food names */}
                            {meal.food_names && meal.food_names.length > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Alimentos</p>
                                <div className="flex flex-wrap gap-1">
                                  {meal.food_names.map((name, j) => (
                                    <span key={j} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-foreground">
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Emotion & hunger */}
                            {(meal.emotion || meal.hunger_level) && (
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                {meal.emotion && <span>Emoção: {meal.emotion}</span>}
                                {meal.hunger_level && <span>Fome: {meal.hunger_level}/10</span>}
                                {meal.satiety_level && <span>Saciedade: {meal.satiety_level}/10</span>}
                              </div>
                            )}

                            {/* Photo */}
                            {meal.photo_url && (
                              <img
                                src={meal.photo_url}
                                alt="Foto da refeição"
                                className="w-full h-32 rounded-lg object-cover"
                              />
                            )}

                            {/* Notes */}
                            {meal.notes && (
                              <p className="text-xs text-muted-foreground italic">"{meal.notes}"</p>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => deleteMeal(meal.id)}
                              className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
                            >
                              <Trash2 className="w-3 h-3" /> Remover refeição
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealHistoryPage;
