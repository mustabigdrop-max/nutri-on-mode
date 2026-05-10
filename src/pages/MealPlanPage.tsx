import { useState, useEffect, useMemo, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePlanGate } from "@/hooks/usePlanGate";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, ChevronRight, Check, RefreshCw, Utensils,
  BarChart3, Plus, MessageSquare, User, ArrowLeft, ShoppingCart,
  Sparkles, Wallet, GripVertical, Send, X, Loader2, Dumbbell, Bed
} from "lucide-react";
import { toast } from "sonner";
import { buildTrainingDayMap, classifyMealVsWorkout, splitWeeklyAverages, type TrainingDayInfo } from "@/lib/trainingDayMap";
import SubstitutionModal from "@/components/meal/SubstitutionModal";
import type { SubOption } from "@/components/meal/substitutionDb";
import CircadianTimeline from "@/components/meal/CircadianTimeline";
import ExpandableMealCard from "@/components/meal/ExpandableMealCard";
import AdherenceModal from "@/components/meal/AdherenceModal";
import { exportMealPlanPDF } from "@/lib/mealPlanPdf";

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
  const { role, isCoach } = usePlanGate();
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
  const [viewMode, setViewMode] = useState<"list" | "timeline">(() => {
    return (localStorage.getItem("nutriplan_view_mode") as "list" | "timeline") || "list";
  });
  const switchView = (m: "list" | "timeline") => {
    setViewMode(m);
    localStorage.setItem("nutriplan_view_mode", m);
  };
  // Phase 4: Special modes + adherence
  const [modoEspecial, setModoEspecial] = useState<"padrao" | "competicao" | "glp1" | "feminino">(
    () => (localStorage.getItem("nutriplan_modo_especial") as any) || "padrao"
  );
  const [faseCiclo, setFaseCiclo] = useState<"folicular" | "ovulatoria" | "lutea" | "menstrual">(
    () => (localStorage.getItem("nutriplan_fase_ciclo") as any) || "folicular"
  );
  const [diasComp, setDiasComp] = useState<number>(
    () => Number(localStorage.getItem("nutriplan_dias_comp")) || 14
  );
  const [showModoMenu, setShowModoMenu] = useState(false);
  const [showAdherence, setShowAdherence] = useState(false);
  const setModoSticky = (m: typeof modoEspecial) => { setModoEspecial(m); localStorage.setItem("nutriplan_modo_especial", m); };
  // ═══ NutriPlan Elite — Dimensão 1: TDEE Farmacológico ═══
  const COMPOSTOS_VERTEX = [
    "Ipamorelin", "CJC-1295", "MK-677 (Ibutamoren)", "Tesamorelin",
    "Semaglutida", "Tirzepatida", "Retatrutide",
    "Testosterona", "Nandrolona (Deca)", "Oxandrolona (Anavar)", "Trembolona", "Boldenona",
    "MK-2866 (Ostarine)", "LGD-4033", "RAD-140",
    "SLU-PP-332", "Cardarine (GW-501516)",
    "BPC-157", "TB-500",
    "T3 (Liotironina)", "Clenbuterol", "Insulina",
  ];
  const [compostosAtivos, setCompostosAtivos] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("nutriplan_compostos") || "[]"); } catch { return []; }
  });
  const [showCompostos, setShowCompostos] = useState(false);
  const [nutriEliteMeta, setNutriEliteMeta] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem("nutriplan_elite_meta") || "null"); } catch { return null; }
  });
  const toggleComposto = (c: string) => {
    setCompostosAtivos(prev => {
      const next = prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c];
      localStorage.setItem("nutriplan_compostos", JSON.stringify(next));
      return next;
    });
  };
  const [dragItem, setDragItem] = useState<PlanItem | null>(null);
  const [subModalItem, setSubModalItem] = useState<PlanItem | null>(null);
  const [trainingMap, setTrainingMap] = useState<Record<number, TrainingDayInfo>>(() => {
    const m: Record<number, TrainingDayInfo> = {};
    for (let d = 0; d < 7; d++) m[d] = { isTraining: false };
    return m;
  });

  // Send to client state
  const [showSendModal, setShowSendModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sendMode, setSendMode] = useState<"copy" | "personalized">("personalized");

  const canSendToClients = role === "admin" || isCoach;

  const loadClients = async () => {
    if (!user) return;
    setLoadingClients(true);
    let allClients: { user_id: string; full_name: string; type: string; geb_kcal?: number; get_kcal?: number; vet_kcal?: number; protein_g?: number; carbs_g?: number; fat_g?: number; weight_kg?: number; height_cm?: number; sex?: string; goal?: string; objetivo_principal?: string; dietary_restrictions?: string[]; health_conditions?: string[]; uses_glp1?: boolean; sport?: string; training_frequency?: number; activity_level?: string; }[] = [];

    // Get coach patients
    const { data: coachProf } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (coachProf) {
      const { data: patients } = await supabase
        .from("coach_patients")
        .select("patient_user_id, status")
        .eq("coach_id", coachProf.id)
        .eq("status", "active");
      if (patients && patients.length > 0) {
        const ids = patients.map(p => p.patient_user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, geb_kcal, get_kcal, vet_kcal, protein_g, carbs_g, fat_g, weight_kg, height_cm, sex, goal, objetivo_principal, dietary_restrictions, health_conditions, uses_glp1, sport, training_frequency, activity_level")
          .in("user_id", ids);
        allClients = (profiles || []).map(p => ({ ...p, full_name: p.full_name || "Sem nome", type: "aluno" }));
      }
    }

    // Get partners
    const { data: partnersList } = await supabase
      .from("partners")
      .select("user_id, full_name, status")
      .eq("created_by", user.id)
      .eq("status", "active");

    if (partnersList) {
      const partnerIds = partnersList.filter(p => p.user_id && !allClients.find(c => c.user_id === p.user_id)).map(p => p.user_id!);
      if (partnerIds.length > 0) {
        const { data: partnerProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, geb_kcal, get_kcal, vet_kcal, protein_g, carbs_g, fat_g, weight_kg, height_cm, sex, goal, objetivo_principal, dietary_restrictions, health_conditions, uses_glp1, sport, training_frequency, activity_level")
          .in("user_id", partnerIds);
        for (const pp of (partnerProfiles || [])) {
          allClients.push({ ...pp, full_name: pp.full_name || "Parceiro", type: "parceiro" });
        }
      }
    }

    setClients(allClients);
    setLoadingClients(false);
  };

  const openSendModal = () => {
    setShowSendModal(true);
    loadClients();
  };

  const sendPlanToClient = async (client: any) => {
    if (!user) return;
    const clientUserId = client.user_id;
    const clientName = client.full_name || "Cliente";
    setSendingTo(clientUserId);
    try {
      if (sendMode === "personalized") {
        // Generate a personalized plan using client's own profile/macros
        const clientProfile = {
          goal: client.goal || client.objetivo_principal || profile?.goal,
          vet_kcal: client.vet_kcal || client.get_kcal || 2000,
          get_kcal: client.get_kcal || 2000,
          protein_g: client.protein_g || 120,
          carbs_g: client.carbs_g || 200,
          fat_g: client.fat_g || 60,
          sex: client.sex,
          weight_kg: client.weight_kg,
          height_cm: client.height_cm,
          dietary_restrictions: client.dietary_restrictions,
          health_conditions: client.health_conditions,
          uses_glp1: client.uses_glp1,
          sport: client.sport,
          training_frequency: client.training_frequency,
          activity_level: client.activity_level,
        };

        // Fetch client's workout schedule
        const { data: clientWorkouts } = await supabase
          .from("workout_schedule")
          .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
          .eq("user_id", clientUserId);

        const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
          body: { profile: clientProfile, weekStart, budgetMode, workoutSchedule: clientWorkouts || [], compostos_ativos: compostosAtivos, perfil_pca: client.perfil_comportamental || profile?.perfil_comportamental, body_fat_pct: client.body_fat_pct, modo_especial: modoEspecial, fase_ciclo: faseCiclo, dias_para_competicao: diasComp },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        // Delete existing and insert personalized plan
        await supabase.from("meal_plan_items").delete().eq("user_id", clientUserId).eq("week_start", weekStart);
        const newItems: any[] = [];
        for (const day of data.days) {
          for (const meal of day.meals) {
            newItems.push({
              user_id: clientUserId,
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
        toast.success(`Plano personalizado enviado para ${clientName}! 🎯✅`);
      } else {
        // Copy mode — clone coach's current plan
        if (items.length === 0) { toast.error("Nenhum plano para copiar"); setSendingTo(null); return; }
        await supabase.from("meal_plan_items").delete().eq("user_id", clientUserId).eq("week_start", weekStart);
        const newItems = items.map(item => ({
          user_id: clientUserId,
          week_start: item.week_start,
          day_index: item.day_index,
          meal_type: item.meal_type,
          food_name: item.food_name,
          portion: item.portion,
          kcal: item.kcal,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g,
          confirmed: false,
          swapped: false,
        }));
        await supabase.from("meal_plan_items").insert(newItems);
        toast.success(`Plano copiado para ${clientName}! ✅`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao enviar plano. Tente novamente.");
    }
    setSendingTo(null);
  };

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

  const generateWithAI = async () => {
    if (!user || !profile) return;
    setGenerating(true);
    try {
      // Fetch workout schedule to personalize meal plan per training day
      const { data: workoutData } = await supabase
        .from("workout_schedule")
        .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
        .eq("user_id", user.id);

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { profile, weekStart, budgetMode, workoutSchedule: workoutData || [], compostos_ativos: compostosAtivos, perfil_pca: profile?.perfil_comportamental, body_fat_pct: (profile as any)?.body_fat_pct, modo_especial: modoEspecial, fase_ciclo: faseCiclo, dias_para_competicao: diasComp },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // ═══ NutriPlan Elite — capturar metadados ═══
      if (data?.nutriplan_elite) {
        setNutriEliteMeta(data.nutriplan_elite);
        try { localStorage.setItem("nutriplan_elite_meta", JSON.stringify(data.nutriplan_elite)); } catch { /* noop */ }
      }

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

  useEffect(() => {
    fetchPlan();
  }, [user, weekStart]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("workout_schedule")
        .select("day_of_week, workout_type, workout_time, duration_minutes, slot")
        .eq("user_id", user.id);
      setTrainingMap(buildTrainingDayMap(data as any));
    })();
  }, [user]);

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

  const weeklyTotals = useMemo(() => {
    const t: Record<number, { kcal: number; p: number; c: number; g: number }> = {};
    for (let d = 0; d < 7; d++) t[d] = { kcal: 0, p: 0, c: 0, g: 0 };
    items.forEach(i => {
      t[i.day_index].kcal += i.kcal || 0;
      t[i.day_index].p += i.protein_g || 0;
      t[i.day_index].c += i.carbs_g || 0;
      t[i.day_index].g += i.fat_g || 0;
    });
    return t;
  }, [items]);

  const weeklySplit = useMemo(
    () => splitWeeklyAverages(weeklyTotals, trainingMap),
    [weeklyTotals, trainingMap]
  );

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

        {/* Budget + NutriPlan Elite toggles */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
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
          <button
            onClick={() => setShowCompostos(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              compostosAtivos.length > 0
                ? "bg-primary/15 text-primary border border-primary/40"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            💊 Compostos {compostosAtivos.length > 0 ? `(${compostosAtivos.length})` : "Ativos"}
          </button>

          {/* View mode toggle (Phase 2) */}
          <div className="ml-auto flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => switchView("list")}
              className={`px-2.5 py-1.5 text-[11px] font-mono transition-all ${
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => switchView("timeline")}
              className={`px-2.5 py-1.5 text-[11px] font-mono transition-all ${
                viewMode === "timeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Timeline ⏱
            </button>
          </div>
        </div>

        {/* Phase 4 controls: Modo Especial + Aderência + PDF */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowModoMenu(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                modoEspecial !== "padrao"
                  ? "bg-accent/15 text-accent border border-accent/40"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {modoEspecial === "padrao" && "🎯 Modo: Padrão"}
              {modoEspecial === "competicao" && `🏆 Competição (D-${diasComp})`}
              {modoEspecial === "glp1" && "💉 GLP-1"}
              {modoEspecial === "feminino" && `🌸 Feminino · ${faseCiclo}`}
            </button>
            <AnimatePresence>
              {showModoMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-40 mt-1 left-0 w-64 rounded-xl border border-border bg-popover p-2 shadow-xl"
                >
                  {(["padrao", "competicao", "glp1", "feminino"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => { setModoSticky(m); if (m !== "competicao" && m !== "feminino") setShowModoMenu(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-mono transition-all ${
                        modoEspecial === m ? "bg-accent/20 text-accent" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {m === "padrao" && "🎯 Padrão"}
                      {m === "competicao" && "🏆 Competição (peak week)"}
                      {m === "glp1" && "💉 GLP-1"}
                      {m === "feminino" && "🌸 Feminino periodizado"}
                    </button>
                  ))}
                  {modoEspecial === "competicao" && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <label className="text-[10px] font-mono text-muted-foreground">Dias até competição</label>
                      <input
                        type="number" min={1} max={60} value={diasComp}
                        onChange={(e) => { const v = Number(e.target.value) || 14; setDiasComp(v); localStorage.setItem("nutriplan_dias_comp", String(v)); }}
                        className="w-full mt-1 px-2 py-1 text-xs font-mono rounded-md bg-background border border-border text-foreground"
                      />
                    </div>
                  )}
                  {modoEspecial === "feminino" && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <label className="text-[10px] font-mono text-muted-foreground">Fase do ciclo</label>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {(["folicular", "ovulatoria", "lutea", "menstrual"] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => { setFaseCiclo(f); localStorage.setItem("nutriplan_fase_ciclo", f); }}
                            className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all ${
                              faseCiclo === f ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowAdherence(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          >
            📊 Aderência
          </button>

          <button
            onClick={() => exportMealPlanPDF({
              items,
              weekRange: formatWeekRange(weekStart),
              patientName: profile?.full_name || undefined,
              nutriEliteMeta,
              enrichment: nutriEliteMeta?.enrichment,
            })}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-40"
          >
            📄 PDF
          </button>
        </div>

        {/* Compostos picker (NutriPlan Elite — Dimensão 1) */}
        <AnimatePresence>
          {showCompostos && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="rounded-xl border border-primary/30 bg-card p-3">
                <p className="text-xs text-muted-foreground mb-2 font-mono">
                  Selecione os compostos ativos do seu protocolo (Dr. VERTEX) — o TDEE será ajustado farmacologicamente.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {COMPOSTOS_VERTEX.map(c => {
                    const active = compostosAtivos.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleComposto(c)}
                        className={`text-[11px] px-2 py-1 rounded-md border transition-all ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NutriPlan Elite — Header de TDEE Farmacológico */}
        {nutriEliteMeta && (nutriEliteMeta.tdee_bruto > 0 || (nutriEliteMeta.ajuste_farmacologico_breakdown?.length > 0)) && (
          <div className="mb-4 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary">NutriPlan Elite · TDEE Farmacológico</span>
              <span className="text-[10px] font-mono text-muted-foreground">{nutriEliteMeta.formula_tmb}</span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground line-through">{nutriEliteMeta.tdee_bruto} kcal</span>
              <span className="text-2xl font-bold text-primary">→ {nutriEliteMeta.tdee_ajustado} kcal</span>
              {nutriEliteMeta.multiplicador_farmacologico > 1.001 && (
                <span className="text-xs font-mono text-primary/80">
                  ×{nutriEliteMeta.multiplicador_farmacologico.toFixed(2)} (+{Math.round((nutriEliteMeta.multiplicador_farmacologico - 1) * 100)}%)
                </span>
              )}
            </div>
            {nutriEliteMeta.ajuste_farmacologico_breakdown?.length > 0 && (
              <div className="mt-2 space-y-1">
                {nutriEliteMeta.ajuste_farmacologico_breakdown.map((b: any, i: number) => (
                  <div key={i} className="text-[11px] text-foreground/80">
                    <span className="font-semibold text-primary">{b.composto}</span>
                    <span className="text-muted-foreground"> [{b.categoria}] · ×{b.multiplicador} </span>
                    <span className={b.impacto_kcal >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {b.impacto_kcal >= 0 ? "+" : ""}{b.impacto_kcal} kcal
                    </span>
                    <div className="text-[10px] text-muted-foreground pl-2">↳ {b.nota}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground bg-card/60 border border-border rounded-lg px-3 py-1.5 mb-3">
          <span>⚡ Pré-treino</span>
          <span>💪 Pós-treino</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Treino</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/50 inline-block" /> Descanso</span>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {DAY_LABELS.map((label, i) => {
            const dayConfirmed = items.filter(it => it.day_index === i && it.confirmed).length;
            const dayTotal = items.filter(it => it.day_index === i).length;
            const isToday = i === selectedDay;
            const info = trainingMap[i];
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedDay(i)}
                className={`flex-1 min-w-[56px] py-2 rounded-xl text-center transition-all ${
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-xs font-mono font-semibold block">{label}</span>
                <span
                  className={`mt-1 inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-mono ${
                    info?.isTraining
                      ? isToday
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/20 text-primary border border-primary/30"
                      : isToday
                        ? "bg-primary-foreground/10 text-primary-foreground/80"
                        : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {info?.isTraining ? <><Dumbbell className="w-2 h-2" />TREINO</> : <><Bed className="w-2 h-2" />OFF</>}
                </span>
                {info?.isTraining && info.muscleGroup && (
                  <span className={`block text-[7px] font-mono mt-0.5 truncate ${isToday ? "text-primary-foreground/70" : "text-primary/70"}`}>
                    {info.muscleGroup}
                  </span>
                )}
                {dayTotal > 0 && (
                  <span className={`text-[9px] font-mono block mt-0.5 ${isToday ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {dayConfirmed}/{dayTotal}
                  </span>
                )}
              </motion.button>
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
            {viewMode === "timeline" ? (
              <CircadianTimeline
                items={dayItems}
                dayInfo={trainingMap[selectedDay]}
                onConfirm={(it) => confirmItem(it as PlanItem)}
                onSwap={(it) => setSubModalItem(it as PlanItem)}
                onSelect={(it) => setSubModalItem(it as PlanItem)}
              />
            ) : (
              <AnimatePresence mode="popLayout">
                {dayItems.map((item) => {
                  const mealLabel = MEAL_TYPES.find(m => m.key === item.meal_type)?.label || item.meal_type;
                  const dayInfo = trainingMap[item.day_index];
                  const tag = dayInfo?.isTraining ? classifyMealVsWorkout(item.meal_type, dayInfo.workoutTime) : null;
                  const enr = nutriEliteMeta?.enrichment?.[`${item.day_index}-${item.meal_type}`] || {};
                  return (
                    <ExpandableMealCard
                      key={item.id}
                      item={item}
                      mealLabel={mealLabel}
                      tag={tag as "pre" | "post" | null}
                      isDragging={dragItem?.id === item.id}
                      onConfirm={() => confirmItem(item)}
                      onSwap={() => setSubModalItem(item)}
                      onDragStart={() => handleDragStart(item)}
                      onDrop={() => handleDrop(item)}
                      funcao_metabolica={enr.funcao_metabolica}
                      janela_metabolica={enr.janela_metabolica}
                      protocolo_peri_workout={enr.protocolo_peri_workout}
                      mensagem_mce={enr.mensagem_mce}
                      insights_ia={enr.insights_ia}
                    />
                  );
                })}
              </AnimatePresence>
            )}

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
            {canSendToClients && items.length > 0 && (
              <button
                onClick={openSendModal}
                className="w-full py-2.5 mt-2 rounded-xl bg-accent/10 border border-accent/20 text-sm font-mono text-accent hover:bg-accent/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar plano para cliente
              </button>
            )}

            {/* Weekly training vs rest summary */}
            {(weeklySplit.training.count > 0 || weeklySplit.rest.count > 0) && (
              <div className="rounded-xl border border-border bg-card p-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">Médias semanais</span>
                  {weeklySplit.training.count > 0 && weeklySplit.rest.count > 0 && (
                    <span className={`text-[10px] font-mono ${weeklySplit.carbDeltaPct >= 0 ? "text-primary" : "text-accent"}`}>
                      {weeklySplit.carbDeltaPct >= 0 ? "+" : ""}{weeklySplit.carbDeltaPct}% carbos no treino
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-2">
                    <div className="flex items-center gap-1 text-primary font-bold mb-1">
                      <Dumbbell className="w-3 h-3" /> Treino ({weeklySplit.training.count}d)
                    </div>
                    <div className="text-foreground font-bold">{Math.round(weeklySplit.training.kcal)} kcal</div>
                    <div className="text-muted-foreground font-mono">
                      P{Math.round(weeklySplit.training.p)} · C{Math.round(weeklySplit.training.c)} · G{Math.round(weeklySplit.training.g)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-2">
                    <div className="flex items-center gap-1 text-muted-foreground font-bold mb-1">
                      <Bed className="w-3 h-3" /> Descanso ({weeklySplit.rest.count}d)
                    </div>
                    <div className="text-foreground">{Math.round(weeklySplit.rest.kcal)} kcal</div>
                    <div className="text-muted-foreground font-mono">
                      P{Math.round(weeklySplit.rest.p)} · C{Math.round(weeklySplit.rest.c)} · G{Math.round(weeklySplit.rest.g)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Substitution Modal */}
      <AnimatePresence>
        {subModalItem && (
          <SubstitutionModal
            foodName={subModalItem.food_name}
            currentKcal={subModalItem.kcal}
            currentProtein={subModalItem.protein_g}
            currentCarbs={subModalItem.carbs_g}
            currentFat={subModalItem.fat_g}
            goal={profile?.goal || profile?.objetivo_principal}
            restrictions={profile?.dietary_restrictions}
            dailyKcalTarget={profile?.vet_kcal}
            dailyKcalConsumed={dayTotals.kcal}
            onSelect={(sub) => handleSmartSubstitution(subModalItem, sub)}
            onClose={() => setSubModalItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Adherence Modal (Phase 4) */}
      <AnimatePresence>
        {showAdherence && (
          <AdherenceModal
            items={items}
            profile={profile as any}
            onClose={() => setShowAdherence(false)}
          />
        )}
      </AnimatePresence>

      {/* Send to Client Modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowSendModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Enviar plano da semana
                </h3>
                <button onClick={() => setShowSendModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {/* Mode toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setSendMode("personalized")}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all ${sendMode === "personalized" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
                  >
                    🎯 Personalizado (IA)
                  </button>
                  <button
                    onClick={() => setSendMode("copy")}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all ${sendMode === "copy" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
                  >
                    📋 Copiar meu plano
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3 font-mono">
                  Semana {formatWeekRange(weekStart)} • {sendMode === "personalized" ? "IA gera com GEB/GET/VET do cliente" : `${items.length} refeições`}
                </p>
                {loadingClients ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum cliente vinculado encontrado.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {clients.map(c => (
                      <button
                        key={c.user_id}
                        onClick={() => sendPlanToClient(c)}
                        disabled={!!sendingTo}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {(c.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{c.full_name || "Sem nome"}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{c.type || "cliente"}</span>
                            {c.vet_kcal && (
                              <span className="text-[10px] font-mono text-primary">
                                {Math.round(c.vet_kcal)}kcal · {c.protein_g || "?"}P · {c.carbs_g || "?"}C · {c.fat_g || "?"}G
                              </span>
                            )}
                          </div>
                        </div>
                        {sendingTo === c.user_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <Send className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default MealPlanPage;
