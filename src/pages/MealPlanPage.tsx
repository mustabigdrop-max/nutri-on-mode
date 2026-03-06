import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, ChevronRight, Check, RefreshCw, Utensils,
  BarChart3, Plus, MessageSquare, User, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const MEAL_TYPES = [
  { key: "cafe_manha", label: "Café" },
  { key: "lanche_manha", label: "Lanche AM" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche_tarde", label: "Lanche PM" },
  { key: "jantar", label: "Jantar" },
  { key: "ceia", label: "Ceia" },
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Default foods per meal type for generating a plan
const DEFAULT_FOODS: Record<string, { name: string; portion: string; kcal: number; protein: number; carbs: number; fat: number }[]> = {
  cafe_manha: [
    { name: "Ovos mexidos", portion: "3 unidades", kcal: 210, protein: 18, carbs: 2, fat: 15 },
    { name: "Pão integral", portion: "2 fatias", kcal: 140, protein: 6, carbs: 24, fat: 2 },
    { name: "Tapioca c/ queijo", portion: "1 unidade", kcal: 180, protein: 8, carbs: 22, fat: 7 },
    { name: "Iogurte + granola", portion: "200ml + 30g", kcal: 220, protein: 10, carbs: 30, fat: 6 },
    { name: "Vitamina de banana", portion: "300ml", kcal: 250, protein: 12, carbs: 35, fat: 5 },
    { name: "Panqueca de aveia", portion: "2 unidades", kcal: 200, protein: 14, carbs: 22, fat: 6 },
    { name: "Crepioca", portion: "1 unidade", kcal: 190, protein: 16, carbs: 18, fat: 6 },
  ],
  lanche_manha: [
    { name: "Fruta + castanhas", portion: "1 + 30g", kcal: 180, protein: 5, carbs: 20, fat: 10 },
    { name: "Iogurte natural", portion: "170g", kcal: 100, protein: 8, carbs: 10, fat: 3 },
    { name: "Barra de proteína", portion: "1 unidade", kcal: 200, protein: 20, carbs: 18, fat: 6 },
    { name: "Mix de nuts", portion: "40g", kcal: 220, protein: 6, carbs: 8, fat: 18 },
    { name: "Banana + pasta de amendoim", portion: "1 + 15g", kcal: 190, protein: 6, carbs: 28, fat: 8 },
    { name: "Queijo cottage", portion: "100g", kcal: 90, protein: 12, carbs: 3, fat: 4 },
    { name: "Maçã + whey", portion: "1 + 1 scoop", kcal: 170, protein: 22, carbs: 18, fat: 2 },
  ],
  almoco: [
    { name: "Frango grelhado + arroz + feijão", portion: "150g + 100g + 80g", kcal: 450, protein: 40, carbs: 50, fat: 10 },
    { name: "Peixe assado + batata doce", portion: "150g + 150g", kcal: 380, protein: 35, carbs: 40, fat: 8 },
    { name: "Carne moída + arroz integral", portion: "150g + 100g", kcal: 420, protein: 35, carbs: 42, fat: 12 },
    { name: "Strogonoff de frango light", portion: "200g", kcal: 380, protein: 32, carbs: 38, fat: 10 },
    { name: "Salmão + quinoa", portion: "150g + 80g", kcal: 440, protein: 38, carbs: 30, fat: 18 },
    { name: "Omelete + salada", portion: "3 ovos + 100g", kcal: 320, protein: 24, carbs: 8, fat: 22 },
    { name: "Filé de tilápia + purê", portion: "150g + 100g", kcal: 350, protein: 32, carbs: 35, fat: 8 },
  ],
  lanche_tarde: [
    { name: "Shake proteico", portion: "300ml", kcal: 200, protein: 25, carbs: 15, fat: 5 },
    { name: "Sanduíche natural", portion: "1 unidade", kcal: 250, protein: 15, carbs: 28, fat: 8 },
    { name: "Tapioca c/ frango", portion: "1 unidade", kcal: 220, protein: 18, carbs: 22, fat: 6 },
    { name: "Wrap integral", portion: "1 unidade", kcal: 280, protein: 20, carbs: 30, fat: 8 },
    { name: "Açaí proteico", portion: "200ml", kcal: 300, protein: 15, carbs: 40, fat: 8 },
    { name: "Pão de queijo + café", portion: "2 + 200ml", kcal: 180, protein: 6, carbs: 20, fat: 8 },
    { name: "Fruta + whey", portion: "1 + 1 scoop", kcal: 170, protein: 22, carbs: 20, fat: 2 },
  ],
  jantar: [
    { name: "Frango + legumes salteados", portion: "150g + 200g", kcal: 350, protein: 35, carbs: 15, fat: 14 },
    { name: "Sopa de legumes c/ carne", portion: "400ml", kcal: 280, protein: 22, carbs: 25, fat: 8 },
    { name: "Omelete recheada", portion: "3 ovos + recheio", kcal: 320, protein: 26, carbs: 8, fat: 22 },
    { name: "Peixe + salada caesar", portion: "150g + 100g", kcal: 340, protein: 30, carbs: 12, fat: 18 },
    { name: "Frango desfiado + batata", portion: "150g + 100g", kcal: 380, protein: 32, carbs: 35, fat: 10 },
    { name: "Carne + brócolis", portion: "150g + 150g", kcal: 350, protein: 34, carbs: 10, fat: 18 },
    { name: "Salada completa + atum", portion: "200g + 120g", kcal: 300, protein: 28, carbs: 12, fat: 14 },
  ],
  ceia: [
    { name: "Chá + torrada", portion: "200ml + 1", kcal: 80, protein: 2, carbs: 14, fat: 1 },
    { name: "Caseína + morango", portion: "1 scoop + 50g", kcal: 140, protein: 20, carbs: 8, fat: 2 },
    { name: "Iogurte + canela", portion: "150g", kcal: 100, protein: 8, carbs: 12, fat: 3 },
    { name: "Leite morno + mel", portion: "200ml + 10g", kcal: 130, protein: 6, carbs: 18, fat: 4 },
    { name: "Queijo branco", portion: "50g", kcal: 90, protein: 8, carbs: 2, fat: 6 },
    { name: "Banana amassada", portion: "1 unidade", kcal: 90, protein: 1, carbs: 23, fat: 0 },
    { name: "Gelatina proteica", portion: "150g", kcal: 70, protein: 10, carbs: 6, fat: 0 },
  ],
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0];
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

interface PlanItem {
  id: string;
  user_id: string;
  week_start: string;
  day_index: number;
  meal_type: string;
  food_name: string;
  portion: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confirmed: boolean;
  swapped: boolean;
  original_food_name: string | null;
}

const MealPlanPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [items, setItems] = useState<PlanItem[]>([]);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // Mon=0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [swapModalItem, setSwapModalItem] = useState<PlanItem | null>(null);

  const fetchPlan = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("meal_plan_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart);
    setItems((data as PlanItem[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPlan(); }, [user, weekStart]);

  const generatePlan = async () => {
    if (!user) return;
    setGenerating(true);
    // Delete existing for this week
    await supabase
      .from("meal_plan_items")
      .delete()
      .eq("user_id", user.id)
      .eq("week_start", weekStart);

    const newItems: any[] = [];
    for (let day = 0; day < 7; day++) {
      MEAL_TYPES.forEach(({ key }) => {
        const options = DEFAULT_FOODS[key];
        const food = options[day % options.length];
        newItems.push({
          user_id: user.id,
          week_start: weekStart,
          day_index: day,
          meal_type: key,
          food_name: food.name,
          portion: food.portion,
          kcal: food.kcal,
          protein_g: food.protein,
          carbs_g: food.carbs,
          fat_g: food.fat,
          confirmed: false,
          swapped: false,
        });
      });
    }

    await supabase.from("meal_plan_items").insert(newItems);
    toast.success("Plano semanal gerado! 🎉");
    await fetchPlan();
    setGenerating(false);
  };

  const confirmItem = async (item: PlanItem) => {
    await supabase
      .from("meal_plan_items")
      .update({ confirmed: !item.confirmed })
      .eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, confirmed: !i.confirmed } : i));
    if (!item.confirmed) toast.success("Refeição confirmada ✓");
  };

  const swapItem = async (item: PlanItem) => {
    const options = DEFAULT_FOODS[item.meal_type];
    const currentIdx = options.findIndex(f => f.name === item.food_name);
    const next = options[(currentIdx + 1) % options.length];

    await supabase
      .from("meal_plan_items")
      .update({
        food_name: next.name,
        portion: next.portion,
        kcal: next.kcal,
        protein_g: next.protein,
        carbs_g: next.carbs,
        fat_g: next.fat,
        swapped: true,
        original_food_name: item.original_food_name || item.food_name,
      })
      .eq("id", item.id);

    setItems(prev => prev.map(i => i.id === item.id ? {
      ...i,
      food_name: next.name,
      portion: next.portion,
      kcal: next.kcal,
      protein_g: next.protein,
      carbs_g: next.carbs,
      fat_g: next.fat,
      swapped: true,
      original_food_name: i.original_food_name || i.food_name,
    } : i));
    toast("Substituição feita 🔄");
  };

  const dayItems = useMemo(() =>
    items.filter(i => i.day_index === selectedDay)
      .sort((a, b) => MEAL_TYPES.findIndex(m => m.key === a.meal_type) - MEAL_TYPES.findIndex(m => m.key === b.meal_type)),
    [items, selectedDay]
  );

  const dayTotals = useMemo(() => ({
    kcal: dayItems.reduce((s, i) => s + (i.kcal || 0), 0),
    protein: dayItems.reduce((s, i) => s + (i.protein_g || 0), 0),
    carbs: dayItems.reduce((s, i) => s + (i.carbs_g || 0), 0),
    fat: dayItems.reduce((s, i) => s + (i.fat_g || 0), 0),
    confirmed: dayItems.filter(i => i.confirmed).length,
    total: dayItems.length,
  }), [dayItems]);

  const activeTab = "plan";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Plano Semanal</h1>
            <p className="text-xs text-muted-foreground font-mono">7 dias × 6 refeições</p>
          </div>
        </div>

        {/* Week selector */}
        <div className="flex items-center justify-between mb-4 rounded-xl border border-border bg-card p-3">
          <button onClick={() => setWeekStart(addWeeks(weekStart, -1))} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono text-foreground">{formatWeekRange(weekStart)}</span>
          <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {DAY_LABELS.map((label, i) => {
            const dayConfirmed = items.filter(it => it.day_index === i && it.confirmed).length;
            const dayTotal = items.filter(it => it.day_index === i).length;
            const isToday = i === selectedDay;
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex-1 min-w-[44px] py-2 rounded-xl text-center transition-all ${
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-xs font-mono font-semibold block">{label}</span>
                {dayTotal > 0 && (
                  <span className={`text-[9px] font-mono block mt-0.5 ${isToday ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {dayConfirmed}/{dayTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Day summary */}
        {dayItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-2 mb-4"
          >
            {[
              { label: "Kcal", value: dayTotals.kcal, target: profile?.vet_kcal },
              { label: "Prot", value: dayTotals.protein, target: profile?.protein_g, unit: "g" },
              { label: "Carb", value: dayTotals.carbs, target: profile?.carbs_g, unit: "g" },
              { label: "Fat", value: dayTotals.fat, target: profile?.fat_g, unit: "g" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-border bg-card p-2 text-center">
                <span className="text-[10px] text-muted-foreground font-mono">{m.label}</span>
                <p className="text-sm font-bold font-mono text-foreground">{Math.round(m.value)}</p>
                {m.target && (
                  <span className="text-[9px] text-muted-foreground font-mono">/{Math.round(m.target)}{m.unit || ""}</span>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Meal list or generate */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dayItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Nenhum plano para esta semana</p>
            <p className="text-xs text-muted-foreground mb-6">Gere um plano automático baseado no seu perfil</p>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-gold disabled:opacity-50 transition-all"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Gerando...
                </span>
              ) : (
                "Gerar Plano Semanal ✨"
              )}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {dayItems.map((item, i) => {
                const mealLabel = MEAL_TYPES.find(m => m.key === item.meal_type)?.label || item.meal_type;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl border p-3 transition-all ${
                      item.confirmed
                        ? "bg-primary/10 border-primary/20"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Confirm button */}
                      <button
                        onClick={() => confirmItem(item)}
                        className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          item.confirmed
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-primary uppercase tracking-wider">{mealLabel}</span>
                          {item.swapped && (
                            <span className="text-[9px] font-mono text-accent px-1.5 py-0.5 rounded bg-accent/10">trocado</span>
                          )}
                        </div>
                        <p className={`text-sm font-semibold truncate ${item.confirmed ? "text-primary" : "text-foreground"}`}>
                          {item.food_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.portion} · {item.kcal}kcal · {item.protein_g}g prot
                        </p>
                      </div>

                      {/* Swap button */}
                      <button
                        onClick={() => swapItem(item)}
                        className="mt-0.5 w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-all flex-shrink-0"
                        title="Substituir"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Day progress */}
            <div className="rounded-xl border border-border bg-card/50 p-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  Progresso do dia
                </span>
                <span className="text-xs font-mono text-primary font-semibold">
                  {dayTotals.confirmed}/{dayTotals.total} confirmadas
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dayTotals.total > 0 ? (dayTotals.confirmed / dayTotals.total) * 100 : 0}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>

            {/* Regenerate button */}
            <button
              onClick={generatePlan}
              disabled={generating}
              className="w-full mt-2 py-2.5 rounded-xl border border-border text-sm font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-50"
            >
              {generating ? "Gerando..." : "Regenerar plano da semana"}
            </button>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {[
            { id: "home", icon: BarChart3, label: "Home", path: "/dashboard" },
            { id: "plan", icon: Utensils, label: "Plano", path: "/meal-plan" },
            { id: "add", icon: Plus, label: "", path: "/dashboard" },
            { id: "chat", icon: MessageSquare, label: "Chat", path: "/dashboard" },
            { id: "profile", icon: User, label: "Perfil", path: "/dashboard" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              {item.id === "add" ? (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground -mt-5 glow-gold">
                  <Plus className="w-6 h-6" />
                </div>
              ) : (
                <>
                  <item.icon className={`w-5 h-5 ${item.id === activeTab ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-mono ${item.id === activeTab ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanPage;
