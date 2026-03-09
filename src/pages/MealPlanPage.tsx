import { useState, useEffect, useMemo, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, ChevronRight, Check, RefreshCw, Utensils,
  BarChart3, Plus, MessageSquare, User, ArrowLeft, ShoppingCart,
  Sparkles, Wallet, GripVertical
} from "lucide-react";
import { toast } from "sonner";
import SubstitutionModal from "@/components/meal/SubstitutionModal";
import type { SubOption } from "@/components/meal/substitutionDb";

const MEAL_TYPES = [
  { key: "cafe_manha", label: "Café" },
  { key: "lanche_manha", label: "Lanche AM" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche_tarde", label: "Lanche PM" },
  { key: "jantar", label: "Jantar" },
  { key: "ceia", label: "Ceia" },
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

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
    return today === 0 ? 6 : today - 1;
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [budgetMode, setBudgetMode] = useState(false);
  const [dragItem, setDragItem] = useState<PlanItem | null>(null);
  const [subModalItem, setSubModalItem] = useState<PlanItem | null>(null);

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

  const generateWithAI = async () => {
    if (!user || !profile) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { profile, weekStart, budgetMode },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Delete existing plan
      await supabase
        .from("meal_plan_items")
        .delete()
        .eq("user_id", user.id)
        .eq("week_start", weekStart);

      // Insert AI-generated plan
      const newItems: any[] = [];
      for (const day of data.days) {
        for (const meal of day.meals) {
          newItems.push({
            user_id: user.id,
            week_start: weekStart,
            day_index: day.day_index,
            meal_type: meal.meal_type,
            food_name: meal.food_name,
            portion: meal.portion,
            kcal: meal.kcal,
            protein_g: meal.protein_g,
            carbs_g: meal.carbs_g,
            fat_g: meal.fat_g,
            confirmed: false,
            swapped: false,
          });
        }
      }

      await supabase.from("meal_plan_items").insert(newItems);
      toast.success(budgetMode ? "Plano econômico gerado! 💰" : "Plano IA gerado! 🤖✨");
      await fetchPlan();
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao gerar plano. Gerando local...");
      await generateLocalPlan();
    }
    setGenerating(false);
  };

  const generateLocalPlan = async () => {
    if (!user) return;
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

  const handleSmartSubstitution = async (item: PlanItem, sub: SubOption) => {
    await supabase
      .from("meal_plan_items")
      .update({
        food_name: sub.name,
        portion: sub.portion,
        kcal: sub.kcal,
        protein_g: sub.protein,
        carbs_g: sub.carbs,
        fat_g: sub.fat,
        swapped: true,
        original_food_name: item.original_food_name || item.food_name,
      })
      .eq("id", item.id);

    setItems(prev => prev.map(i => i.id === item.id ? {
      ...i,
      food_name: sub.name,
      portion: sub.portion,
      kcal: sub.kcal,
      protein_g: sub.protein,
      carbs_g: sub.carbs,
      fat_g: sub.fat,
      swapped: true,
      original_food_name: i.original_food_name || i.food_name,
    } : i));
    setSubModalItem(null);
    toast.success(`Substituição feita: ${sub.name} 🔄`);
  };

  // Drag-to-swap between meals
  const handleDragStart = (item: PlanItem) => setDragItem(item);

  const handleDrop = async (targetItem: PlanItem) => {
    if (!dragItem || dragItem.id === targetItem.id) { setDragItem(null); return; }

    // Swap food data between two items
    const updates = [
      supabase.from("meal_plan_items").update({
        food_name: targetItem.food_name,
        portion: targetItem.portion,
        kcal: targetItem.kcal,
        protein_g: targetItem.protein_g,
        carbs_g: targetItem.carbs_g,
        fat_g: targetItem.fat_g,
        swapped: true,
        original_food_name: dragItem.original_food_name || dragItem.food_name,
      }).eq("id", dragItem.id),
      supabase.from("meal_plan_items").update({
        food_name: dragItem.food_name,
        portion: dragItem.portion,
        kcal: dragItem.kcal,
        protein_g: dragItem.protein_g,
        carbs_g: dragItem.carbs_g,
        fat_g: dragItem.fat_g,
        swapped: true,
        original_food_name: targetItem.original_food_name || targetItem.food_name,
      }).eq("id", targetItem.id),
    ];
    await Promise.all(updates);

    setItems(prev => prev.map(i => {
      if (i.id === dragItem.id) return { ...i, food_name: targetItem.food_name, portion: targetItem.portion, kcal: targetItem.kcal, protein_g: targetItem.protein_g, carbs_g: targetItem.carbs_g, fat_g: targetItem.fat_g, swapped: true };
      if (i.id === targetItem.id) return { ...i, food_name: dragItem.food_name, portion: dragItem.portion, kcal: dragItem.kcal, protein_g: dragItem.protein_g, carbs_g: dragItem.carbs_g, fat_g: dragItem.fat_g, swapped: true };
      return i;
    }));
    setDragItem(null);
    toast("Refeições trocadas! 🔄");
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
            <p className="text-xs text-muted-foreground font-mono">IA + arraste para trocar</p>
          </div>
          <button
            onClick={() => navigate("/shopping-list")}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
            title="Lista de Compras"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Budget mode toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setBudgetMode(!budgetMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              budgetMode
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            {budgetMode ? "Orçamento ON" : "Modo Orçamento"}
          </button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Nenhum plano para esta semana</p>
            <p className="text-xs text-muted-foreground mb-6">Gere um plano personalizado com IA</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={generateWithAI}
                disabled={generating}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-gold disabled:opacity-50 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Gerando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Plano com IA ✨
                  </>
                )}
              </button>
              <button
                onClick={async () => { setGenerating(true); await generateLocalPlan(); setGenerating(false); }}
                disabled={generating}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Gerar plano rápido (offline)
              </button>
            </div>
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
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(item)}
                    className={`rounded-xl border p-3 transition-all cursor-grab active:cursor-grabbing ${
                      item.confirmed
                        ? "bg-primary/10 border-primary/20"
                        : dragItem?.id === item.id
                        ? "bg-accent/10 border-accent/30 scale-[0.98]"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Drag handle */}
                      <div className="mt-1.5 text-muted-foreground/40">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

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

                      {/* Swap button — opens smart substitution */}
                      <button
                        onClick={() => setSubModalItem(item)}
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
                <span className="text-xs font-mono text-muted-foreground">Progresso do dia</span>
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

            {/* Action buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={generateWithAI}
                disabled={generating}
                className="flex-1 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm font-mono text-primary hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? "Gerando..." : "Regenerar IA"}
              </button>
              <button
                onClick={() => navigate("/shopping-list")}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Lista de Compras
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MealPlanPage;
