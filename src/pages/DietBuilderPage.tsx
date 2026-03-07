import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Plus, Trash2, Save, ChevronDown, ChevronUp,
  Utensils, X, Copy, RefreshCw, FileText, Pencil, Check, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFoods, Food } from "@/hooks/useFoods";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

// ─── Medidas caseiras ─────────────────────────────────────
const MEASURES = [
  { label: "Colher de sopa", grams: 15 },
  { label: "Colher de chá", grams: 5 },
  { label: "Colher de sobremesa", grams: 10 },
  { label: "Xícara", grams: 160 },
  { label: "½ xícara", grams: 80 },
  { label: "Concha média", grams: 120 },
  { label: "Fatia média", grams: 30 },
  { label: "Unidade média", grams: 100 },
  { label: "Porção (100g)", grams: 100 },
  { label: "Gramas", grams: 1 },
];

// ─── Tipos de refeição ────────────────────────────────────
const MEAL_SLOTS = [
  { key: "cafe_manha", label: "Café da Manhã", emoji: "☕", time: "07:00" },
  { key: "lanche_manha", label: "Lanche da Manhã", emoji: "🍎", time: "10:00" },
  { key: "almoco", label: "Almoço", emoji: "🍽️", time: "12:30" },
  { key: "lanche_tarde", label: "Lanche da Tarde", emoji: "🥤", time: "15:30" },
  { key: "jantar", label: "Jantar", emoji: "🥗", time: "19:00" },
  { key: "ceia", label: "Ceia", emoji: "🌙", time: "21:30" },
];

// ─── Templates de dieta pré-populados ─────────────────────
interface TemplateFood {
  name: string;
  portion: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietTemplate {
  name: string;
  description: string;
  kcalRange: string;
  tag: string;
  meals: Record<string, TemplateFood[]>;
}

const DIET_TEMPLATES: DietTemplate[] = [
  {
    name: "Cutting 1600 kcal",
    description: "Déficit moderado, alta proteína",
    kcalRange: "~1600 kcal",
    tag: "🔥 Emagrecimento",
    meals: {
      cafe_manha: [
        { name: "Ovos mexidos", portion: "3 unid", grams: 150, kcal: 210, protein: 18, carbs: 2, fat: 15 },
        { name: "Pão integral", portion: "1 fatia", grams: 30, kcal: 70, protein: 3, carbs: 12, fat: 1 },
      ],
      lanche_manha: [
        { name: "Iogurte natural", portion: "170g", grams: 170, kcal: 100, protein: 8, carbs: 10, fat: 3 },
      ],
      almoco: [
        { name: "Frango grelhado", portion: "150g", grams: 150, kcal: 250, protein: 38, carbs: 0, fat: 10 },
        { name: "Arroz integral", portion: "3 col. sopa", grams: 80, kcal: 100, protein: 2, carbs: 22, fat: 1 },
        { name: "Feijão", portion: "1 concha", grams: 80, kcal: 60, protein: 4, carbs: 10, fat: 0.5 },
        { name: "Salada verde", portion: "à vontade", grams: 100, kcal: 20, protein: 1, carbs: 4, fat: 0 },
      ],
      lanche_tarde: [
        { name: "Whey protein", portion: "1 scoop", grams: 30, kcal: 120, protein: 24, carbs: 3, fat: 1 },
        { name: "Banana", portion: "1 unid", grams: 100, kcal: 90, protein: 1, carbs: 23, fat: 0 },
      ],
      jantar: [
        { name: "Peixe assado", portion: "150g", grams: 150, kcal: 180, protein: 32, carbs: 0, fat: 5 },
        { name: "Legumes salteados", portion: "200g", grams: 200, kcal: 80, protein: 3, carbs: 12, fat: 3 },
      ],
      ceia: [
        { name: "Chá de camomila", portion: "200ml", grams: 200, kcal: 5, protein: 0, carbs: 1, fat: 0 },
        { name: "Queijo cottage", portion: "2 col. sopa", grams: 40, kcal: 35, protein: 5, carbs: 1, fat: 1.5 },
      ],
    },
  },
  {
    name: "Manutenção 2000 kcal",
    description: "Equilíbrio de macros, dieta variada",
    kcalRange: "~2000 kcal",
    tag: "⚖️ Manutenção",
    meals: {
      cafe_manha: [
        { name: "Tapioca c/ queijo", portion: "1 unid", grams: 120, kcal: 180, protein: 8, carbs: 22, fat: 7 },
        { name: "Café com leite", portion: "200ml", grams: 200, kcal: 80, protein: 4, carbs: 8, fat: 3 },
      ],
      lanche_manha: [
        { name: "Fruta da estação", portion: "1 unid", grams: 150, kcal: 80, protein: 1, carbs: 20, fat: 0 },
        { name: "Castanhas", portion: "30g", grams: 30, kcal: 180, protein: 5, carbs: 6, fat: 16 },
      ],
      almoco: [
        { name: "Carne moída refogada", portion: "150g", grams: 150, kcal: 260, protein: 28, carbs: 2, fat: 16 },
        { name: "Arroz branco", portion: "4 col. sopa", grams: 120, kcal: 160, protein: 3, carbs: 36, fat: 0.5 },
        { name: "Feijão carioca", portion: "1 concha", grams: 100, kcal: 75, protein: 5, carbs: 13, fat: 0.5 },
        { name: "Salada mista", portion: "100g", grams: 100, kcal: 25, protein: 1, carbs: 5, fat: 0 },
      ],
      lanche_tarde: [
        { name: "Sanduíche natural", portion: "1 unid", grams: 150, kcal: 250, protein: 15, carbs: 28, fat: 8 },
      ],
      jantar: [
        { name: "Frango desfiado", portion: "150g", grams: 150, kcal: 230, protein: 35, carbs: 0, fat: 9 },
        { name: "Batata doce", portion: "150g", grams: 150, kcal: 130, protein: 2, carbs: 30, fat: 0 },
        { name: "Brócolis", portion: "100g", grams: 100, kcal: 35, protein: 3, carbs: 6, fat: 0.5 },
      ],
      ceia: [
        { name: "Iogurte + canela", portion: "150g", grams: 150, kcal: 100, protein: 8, carbs: 12, fat: 3 },
      ],
    },
  },
  {
    name: "Bulking 2800 kcal",
    description: "Superávit calórico, foco hipertrofia",
    kcalRange: "~2800 kcal",
    tag: "💪 Hipertrofia",
    meals: {
      cafe_manha: [
        { name: "Panqueca de aveia", portion: "3 unid", grams: 180, kcal: 300, protein: 20, carbs: 35, fat: 9 },
        { name: "Mel", portion: "1 col. sopa", grams: 20, kcal: 60, protein: 0, carbs: 16, fat: 0 },
        { name: "Leite integral", portion: "300ml", grams: 300, kcal: 180, protein: 10, carbs: 15, fat: 10 },
      ],
      lanche_manha: [
        { name: "Vitamina de banana c/ aveia", portion: "400ml", grams: 400, kcal: 350, protein: 15, carbs: 50, fat: 10 },
      ],
      almoco: [
        { name: "Picanha grelhada", portion: "200g", grams: 200, kcal: 400, protein: 40, carbs: 0, fat: 26 },
        { name: "Arroz branco", portion: "5 col. sopa", grams: 150, kcal: 200, protein: 4, carbs: 44, fat: 0.5 },
        { name: "Feijão preto", portion: "1.5 concha", grams: 150, kcal: 110, protein: 7, carbs: 20, fat: 0.5 },
        { name: "Farofa de ovos", portion: "2 col. sopa", grams: 40, kcal: 120, protein: 3, carbs: 14, fat: 6 },
      ],
      lanche_tarde: [
        { name: "Açaí c/ granola", portion: "300ml", grams: 350, kcal: 400, protein: 8, carbs: 60, fat: 14 },
      ],
      jantar: [
        { name: "Salmão grelhado", portion: "200g", grams: 200, kcal: 360, protein: 40, carbs: 0, fat: 22 },
        { name: "Macarrão integral", portion: "150g cozido", grams: 150, kcal: 170, protein: 6, carbs: 34, fat: 1 },
        { name: "Molho de tomate", portion: "50g", grams: 50, kcal: 20, protein: 1, carbs: 4, fat: 0 },
      ],
      ceia: [
        { name: "Caseína + morango", portion: "1 scoop + 50g", grams: 80, kcal: 140, protein: 20, carbs: 8, fat: 2 },
      ],
    },
  },
  {
    name: "Low Carb 1800 kcal",
    description: "Carboidratos reduzidos, gorduras saudáveis",
    kcalRange: "~1800 kcal",
    tag: "🥑 Low Carb",
    meals: {
      cafe_manha: [
        { name: "Ovos mexidos c/ queijo", portion: "3 ovos + 30g", grams: 180, kcal: 280, protein: 22, carbs: 2, fat: 21 },
        { name: "Abacate", portion: "½ unid", grams: 80, kcal: 130, protein: 1, carbs: 3, fat: 12 },
      ],
      lanche_manha: [
        { name: "Nozes", portion: "40g", grams: 40, kcal: 260, protein: 6, carbs: 4, fat: 24 },
      ],
      almoco: [
        { name: "Frango grelhado", portion: "180g", grams: 180, kcal: 300, protein: 45, carbs: 0, fat: 12 },
        { name: "Salada caesar", portion: "150g", grams: 150, kcal: 120, protein: 4, carbs: 5, fat: 10 },
        { name: "Azeite extra virgem", portion: "1 col. sopa", grams: 15, kcal: 120, protein: 0, carbs: 0, fat: 14 },
      ],
      lanche_tarde: [
        { name: "Queijo minas + tomate", portion: "50g + 1 unid", grams: 150, kcal: 140, protein: 10, carbs: 5, fat: 9 },
      ],
      jantar: [
        { name: "Salmão c/ aspargos", portion: "150g + 100g", grams: 250, kcal: 300, protein: 35, carbs: 5, fat: 16 },
      ],
      ceia: [
        { name: "Chá verde", portion: "200ml", grams: 200, kcal: 5, protein: 0, carbs: 1, fat: 0 },
        { name: "Queijo cottage", portion: "3 col. sopa", grams: 60, kcal: 50, protein: 7, carbs: 2, fat: 2 },
      ],
    },
  },
];

// ─── Interfaces ───────────────────────────────────────────
interface MealItem {
  id: string;
  name: string;
  portion: string;
  measure: string;
  measureQty: number;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  kcalPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  editing?: boolean;
}

interface MealSlotData {
  key: string;
  items: MealItem[];
  collapsed: boolean;
}

// ─── Helpers ──────────────────────────────────────────────
const uid = () => crypto.randomUUID();

const templateToSlots = (template: DietTemplate): MealSlotData[] =>
  MEAL_SLOTS.map(slot => ({
    key: slot.key,
    items: (template.meals[slot.key] || []).map(f => ({
      id: uid(),
      name: f.name,
      portion: f.portion,
      measure: "Porção",
      measureQty: 1,
      grams: f.grams,
      kcal: f.kcal,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      kcalPer100g: Math.round(f.kcal / f.grams * 100),
      proteinPer100g: Math.round(f.protein / f.grams * 1000) / 10,
      carbsPer100g: Math.round(f.carbs / f.grams * 1000) / 10,
      fatPer100g: Math.round(f.fat / f.grams * 1000) / 10,
    })),
    collapsed: false,
  }));

const emptySlots = (): MealSlotData[] =>
  MEAL_SLOTS.map(slot => ({ key: slot.key, items: [], collapsed: false }));

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const DietBuilderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { searchFoods, calcMacros } = useFoods();

  const [mealSlots, setMealSlots] = useState<MealSlotData[]>(emptySlots());
  const [planName, setPlanName] = useState("Meu Plano Alimentar");
  const [showTemplates, setShowTemplates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [measureMode, setMeasureMode] = useState<"caseira" | "gramas">("caseira");

  // Search state
  const [searchSlot, setSearchSlot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Food being configured (measure picker step)
  const [pendingFood, setPendingFood] = useState<{ food: Food; slotKey: string } | null>(null);
  const [pendingMeasure, setPendingMeasure] = useState("Porção (100g)");
  const [pendingQty, setPendingQty] = useState(1);

  // Inline editing
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Targets from profile
  const targets = useMemo(() => ({
    kcal: profile?.vet_kcal || 2000,
    protein: profile?.protein_g || 150,
    carbs: profile?.carbs_g || 250,
    fat: profile?.fat_g || 65,
  }), [profile]);

  // Day totals
  const totals = useMemo(() => {
    const all = mealSlots.flatMap(s => s.items);
    return {
      kcal: all.reduce((s, i) => s + i.kcal, 0),
      protein: all.reduce((s, i) => s + i.protein, 0),
      carbs: all.reduce((s, i) => s + i.carbs, 0),
      fat: all.reduce((s, i) => s + i.fat, 0),
    };
  }, [mealSlots]);

  // Per-meal totals
  const mealTotals = useCallback((slotKey: string) => {
    const slot = mealSlots.find(s => s.key === slotKey);
    if (!slot) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    return {
      kcal: slot.items.reduce((s, i) => s + i.kcal, 0),
      protein: slot.items.reduce((s, i) => s + i.protein, 0),
      carbs: slot.items.reduce((s, i) => s + i.carbs, 0),
      fat: slot.items.reduce((s, i) => s + i.fat, 0),
    };
  }, [mealSlots]);

  // Load template
  const loadTemplate = (template: DietTemplate) => {
    setMealSlots(templateToSlots(template));
    setPlanName(template.name);
    setShowTemplates(false);
    toast({ title: "Template carregado!", description: `"${template.name}" pronto para edição.` });
  };

  // Toggle collapse
  const toggleCollapse = (key: string) => {
    setMealSlots(prev => prev.map(s => s.key === key ? { ...s, collapsed: !s.collapsed } : s));
  };

  // Remove item
  const removeItem = (slotKey: string, itemId: string) => {
    setMealSlots(prev => prev.map(s =>
      s.key === slotKey ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
    ));
  };

  // Update item inline
  const updateItem = (slotKey: string, itemId: string, updates: Partial<MealItem>) => {
    setMealSlots(prev => prev.map(s =>
      s.key === slotKey ? {
        ...s,
        items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
      } : s
    ));
  };

  // Select food → open measure picker
  const selectFoodForMeasure = (food: Food, slotKey: string) => {
    setPendingFood({ food, slotKey });
    setPendingMeasure("Porção (100g)");
    setPendingQty(1);
  };

  // Confirm food with measure
  const confirmAddFood = () => {
    if (!pendingFood) return;
    const { food, slotKey } = pendingFood;
    const measure = MEASURES.find(m => m.label === pendingMeasure) || MEASURES[8];
    const totalGrams = measure.grams * pendingQty;
    const factor = totalGrams / 100;

    const item: MealItem = {
      id: uid(),
      name: food.nome,
      portion: `${pendingQty} ${measure.label} (${Math.round(totalGrams)}g)`,
      measure: measure.label,
      measureQty: pendingQty,
      grams: Math.round(totalGrams),
      kcal: Math.round(food.calorias_100g * factor),
      protein: Math.round(food.proteina_100g * factor * 10) / 10,
      carbs: Math.round(food.carbo_100g * factor * 10) / 10,
      fat: Math.round(food.gordura_100g * factor * 10) / 10,
      kcalPer100g: food.calorias_100g,
      proteinPer100g: food.proteina_100g,
      carbsPer100g: food.carbo_100g,
      fatPer100g: food.gordura_100g,
    };
    setMealSlots(prev => prev.map(s =>
      s.key === slotKey ? { ...s, items: [...s.items, item] } : s
    ));
    setPendingFood(null);
    setSearchSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Recalc item when measure changes inline
  const changeMeasureInline = (slotKey: string, itemId: string, measureLabel: string, qty: number) => {
    const item = mealSlots.find(s => s.key === slotKey)?.items.find(i => i.id === itemId);
    if (!item || !item.kcalPer100g) return;
    const measure = MEASURES.find(m => m.label === measureLabel) || MEASURES[8];
    const totalGrams = measure.grams * qty;
    const factor = totalGrams / 100;
    updateItem(slotKey, itemId, {
      measure: measureLabel,
      measureQty: qty,
      grams: Math.round(totalGrams),
      portion: `${qty} ${measure.label} (${Math.round(totalGrams)}g)`,
      kcal: Math.round(item.kcalPer100g! * factor),
      protein: Math.round(item.proteinPer100g! * factor * 10) / 10,
      carbs: Math.round(item.carbsPer100g! * factor * 10) / 10,
      fat: Math.round(item.fatPer100g! * factor * 10) / 10,
    });
  };

  // Search
  const handleSearch = useCallback(async (q: string, cat?: string | null) => {
    setSearchQuery(q);
    const activeCat = cat !== undefined ? cat : categoryFilter;
    if (q.trim().length < 2 && !activeCat) { setSearchResults([]); return; }
    setSearching(true);
    let query = supabase.from("foods").select("*").order("nome").limit(30);
    if (q.trim().length >= 2) query = query.ilike("nome", `%${q}%`);
    if (activeCat) query = query.eq("categoria", activeCat);
    const { data } = await query;
    setSearchResults((data as Food[]) ?? []);
    setSearching(false);
  }, [categoryFilter]);

  // Duplicate item
  const duplicateItem = (slotKey: string, item: MealItem) => {
    const dup = { ...item, id: uid() };
    setMealSlots(prev => prev.map(s =>
      s.key === slotKey ? { ...s, items: [...s.items, dup] } : s
    ));
  };

  // Recalculate macros when grams change
  const recalcByGrams = (slotKey: string, itemId: string, newGrams: number, food?: Food) => {
    // If we don't have the original food data, just update grams
    updateItem(slotKey, itemId, { grams: newGrams });
  };

  // Save as meal plan
  const savePlan = async () => {
    if (!user) return;
    setSaving(true);

    // Save each slot as a separate saved meal
    for (const slot of mealSlots) {
      if (slot.items.length === 0) continue;
      const slotLabel = MEAL_SLOTS.find(s => s.key === slot.key)?.label || slot.key;
      const alimentos = slot.items.map(i => ({
        food_id: "",
        nome: i.name,
        medida: i.portion,
        qtd: 1,
        gramas: i.grams,
        macros: { kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat },
      }));
      const mealTotals = {
        kcal: slot.items.reduce((s, i) => s + i.kcal, 0),
        protein: slot.items.reduce((s, i) => s + i.protein, 0),
        carbs: slot.items.reduce((s, i) => s + i.carbs, 0),
        fat: slot.items.reduce((s, i) => s + i.fat, 0),
      };
      await supabase.from("meals_saved").insert({
        user_id: user.id,
        nome: `${planName} — ${slotLabel}`,
        alimentos: alimentos as any,
        total_macros: mealTotals as any,
      });
    }

    setSaving(false);
    toast({ title: "Plano salvo! ✅", description: "Todas as refeições foram salvas." });
  };

  // Check if there's any content
  const hasContent = mealSlots.some(s => s.items.length > 0);

  // ── Kcal distribution bar colors
  const macroColors = {
    protein: "hsl(var(--primary))",
    carbs: "hsl(var(--accent))",
    fat: "hsl(210, 40%, 50%)",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground font-display">Construtor de Dieta</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Estilo WebDiet · Edição inline
            </p>
          </div>
          {hasContent && (
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              title="Templates"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Template selector ─────────────────────────── */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Escolha um template ou monte do zero
                </span>
                {hasContent && (
                  <button onClick={() => setShowTemplates(false)} className="text-xs text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DIET_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => loadTemplate(t)}
                    className="group text-left rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                    <span className="text-[10px] font-mono text-primary/70">{t.tag}</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.description}</p>
                    <span className="text-[10px] font-mono text-primary font-bold mt-1 block">{t.kcalRange}</span>
                  </button>
                ))}
                <button
                  onClick={() => { setMealSlots(emptySlots()); setShowTemplates(false); setPlanName("Meu Plano Alimentar"); }}
                  className="text-left rounded-xl border border-dashed border-border bg-card/50 p-3 hover:border-primary/40 transition-all flex flex-col items-center justify-center"
                >
                  <Plus className="w-5 h-5 text-muted-foreground mb-1" />
                  <p className="text-xs font-semibold text-muted-foreground">Montar do zero</p>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Plan name ─────────────────────────────────── */}
        {!showTemplates && (
          <div className="flex gap-2 mb-4">
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="h-9 font-mono text-sm border-border bg-card flex-1"
              placeholder="Nome do plano..."
            />
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setMeasureMode("caseira")}
                className={`px-3 py-1.5 text-[10px] font-mono transition-all ${
                  measureMode === "caseira" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                🥄 Caseira
              </button>
              <button
                onClick={() => setMeasureMode("gramas")}
                className={`px-3 py-1.5 text-[10px] font-mono transition-all ${
                  measureMode === "gramas" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                ⚖️ Gramas
              </button>
            </div>
          </div>
        )}

        {/* ── Daily totalizer (sticky) ──────────────────── */}
        {!showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-2 z-20 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 mb-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Total do dia</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold font-mono ${
                  totals.kcal > targets.kcal * 1.05 ? "text-destructive" :
                  totals.kcal >= targets.kcal * 0.95 ? "text-primary" :
                  "text-foreground"
                }`}>{totals.kcal}</span>
                <span className="text-xs font-mono text-muted-foreground">/ {Math.round(targets.kcal)} kcal</span>
              </div>
            </div>
            {/* Macro bars */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Prot", value: totals.protein, target: targets.protein, color: "bg-primary" },
                { label: "Carb", value: totals.carbs, target: targets.carbs, color: "bg-accent" },
                { label: "Gord", value: totals.fat, target: targets.fat, color: "bg-blue-500" },
              ].map(m => {
                const pct = Math.min((m.value / m.target) * 100, 100);
                const over = m.value > m.target * 1.05;
                return (
                  <div key={m.label}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[9px] font-mono text-muted-foreground">{m.label}</span>
                      <span className={`text-[10px] font-mono font-bold ${over ? "text-destructive" : "text-foreground"}`}>
                        {Math.round(m.value)}g
                        <span className="text-muted-foreground font-normal">/{Math.round(m.target)}g</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${over ? "bg-destructive" : m.color}`}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Kcal progress bar */}
            <div className="mt-2">
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    totals.kcal > targets.kcal * 1.05
                      ? "bg-destructive"
                      : "bg-gradient-to-r from-primary to-accent"
                  }`}
                  animate={{ width: `${Math.min((totals.kcal / targets.kcal) * 100, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[8px] font-mono text-muted-foreground">
                  {Math.round((totals.protein * 4 / Math.max(totals.kcal, 1)) * 100)}% prot ·
                  {Math.round((totals.carbs * 4 / Math.max(totals.kcal, 1)) * 100)}% carb ·
                  {Math.round((totals.fat * 9 / Math.max(totals.kcal, 1)) * 100)}% gord
                </span>
                <span className="text-[8px] font-mono text-primary font-semibold">
                  {Math.round((totals.kcal / targets.kcal) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Meal slots ────────────────────────────────── */}
        {!showTemplates && (
          <div className="space-y-3">
            {mealSlots.map((slot) => {
              const slotInfo = MEAL_SLOTS.find(s => s.key === slot.key)!;
              const mt = mealTotals(slot.key);

              return (
                <div key={slot.key} className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Meal header */}
                  <button
                    onClick={() => toggleCollapse(slot.key)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-base">{slotInfo.emoji}</span>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-bold text-foreground">{slotInfo.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground ml-2">{slotInfo.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary font-bold">{mt.kcal} kcal</span>
                      <span className="text-[9px] font-mono text-muted-foreground">
                        P{Math.round(mt.protein)} C{Math.round(mt.carbs)} G{Math.round(mt.fat)}
                      </span>
                      {slot.collapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Meal items */}
                  <AnimatePresence>
                    {!slot.collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border">
                          {/* Table header */}
                          {slot.items.length > 0 && (
                            <div className="grid grid-cols-[1fr_60px_45px_45px_45px_28px] gap-1 px-3 py-1.5 bg-muted/20 text-[9px] font-mono text-muted-foreground uppercase">
                              <span>Alimento</span>
                              <span className="text-right">Kcal</span>
                              <span className="text-right">P</span>
                              <span className="text-right">C</span>
                              <span className="text-right">G</span>
                              <span></span>
                            </div>
                          )}

                          {/* Items */}
                          {slot.items.map((item) => {
                            const isEditing = editingItem === item.id;
                            return (
                              <div
                                key={item.id}
                                className="grid grid-cols-[1fr_60px_45px_45px_45px_28px] gap-1 px-3 py-1.5 border-t border-border/50 items-center hover:bg-muted/10 group transition-colors"
                              >
                                <div className="min-w-0">
                                  {isEditing ? (
                                    <div className="space-y-1">
                                      <Input
                                        value={item.name}
                                        onChange={(e) => updateItem(slot.key, item.id, { name: e.target.value })}
                                        className="h-6 text-xs font-mono px-1.5 border-primary/30"
                                      />
                                      <Input
                                        value={item.portion}
                                        onChange={(e) => updateItem(slot.key, item.id, { portion: e.target.value })}
                                        placeholder="Porção"
                                        className="h-6 text-[10px] font-mono px-1.5 text-muted-foreground"
                                      />
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setEditingItem(item.id)}
                                      className="text-left w-full"
                                    >
                                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                                      {measureMode === "caseira" ? (
                                        <p className="text-[10px] font-mono text-muted-foreground truncate">
                                          {item.measureQty || 1} {item.measure || "Porção"}{" "}
                                          <span className="text-muted-foreground/50">({item.grams}g)</span>
                                        </p>
                                      ) : (
                                        <p className="text-[10px] font-mono text-muted-foreground truncate">
                                          {item.grams}g{" "}
                                          {item.measure && item.measure !== "Gramas" && (
                                            <span className="text-muted-foreground/50">≈ {item.measureQty || 1} {item.measure}</span>
                                          )}
                                        </p>
                                      )}
                                    </button>
                                  )}
                                </div>
                                {isEditing ? (
                                  <>
                                    <Input type="number" value={item.kcal} onChange={(e) => updateItem(slot.key, item.id, { kcal: +e.target.value || 0 })} className="h-6 text-[10px] font-mono text-right px-1" />
                                    <Input type="number" value={item.protein} onChange={(e) => updateItem(slot.key, item.id, { protein: +e.target.value || 0 })} className="h-6 text-[10px] font-mono text-right px-1" />
                                    <Input type="number" value={item.carbs} onChange={(e) => updateItem(slot.key, item.id, { carbs: +e.target.value || 0 })} className="h-6 text-[10px] font-mono text-right px-1" />
                                    <Input type="number" value={item.fat} onChange={(e) => updateItem(slot.key, item.id, { fat: +e.target.value || 0 })} className="h-6 text-[10px] font-mono text-right px-1" />
                                    <button onClick={() => setEditingItem(null)} className="p-0.5 rounded text-primary hover:bg-primary/10">
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs font-mono text-foreground text-right font-semibold">{item.kcal}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground text-right">{item.protein}g</span>
                                    <span className="text-[10px] font-mono text-muted-foreground text-right">{item.carbs}g</span>
                                    <span className="text-[10px] font-mono text-muted-foreground text-right">{item.fat}g</span>
                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setEditingItem(item.id)} className="p-0.5 rounded text-muted-foreground hover:text-primary">
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => removeItem(slot.key, item.id)} className="p-0.5 rounded text-muted-foreground hover:text-destructive">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}

                          {/* Meal total row */}
                          {slot.items.length > 0 && (
                            <div className="grid grid-cols-[1fr_60px_45px_45px_45px_28px] gap-1 px-3 py-1.5 bg-muted/20 border-t border-border">
                              <span className="text-[10px] font-mono text-muted-foreground font-bold">SUBTOTAL</span>
                              <span className="text-[10px] font-mono text-primary text-right font-bold">{mt.kcal}</span>
                              <span className="text-[10px] font-mono text-muted-foreground text-right font-semibold">{Math.round(mt.protein)}g</span>
                              <span className="text-[10px] font-mono text-muted-foreground text-right font-semibold">{Math.round(mt.carbs)}g</span>
                              <span className="text-[10px] font-mono text-muted-foreground text-right font-semibold">{Math.round(mt.fat)}g</span>
                              <span></span>
                            </div>
                          )}

                          {/* Add food button */}
                          <button
                            onClick={() => { setSearchSlot(slot.key); setSearchQuery(""); setSearchResults([]); }}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors border-t border-border/50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar alimento
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Save section ──────────────────────────────── */}
        {hasContent && !showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 mb-4"
          >
            <Button
              onClick={savePlan}
              disabled={saving}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar Plano Completo"}
            </Button>
          </motion.div>
        )}

        {/* ── Search overlay ────────────────────────────── */}
        <AnimatePresence>
          {searchSlot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm overflow-y-auto"
            >
              <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => { setSearchSlot(null); setPendingFood(null); setSearchQuery(""); setSearchResults([]); }}
                    className="p-2 rounded-lg border border-border bg-card"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-primary block mb-1">
                      {pendingFood ? `Selecione a medida para: ${pendingFood.food.nome}` : `Adicionando em: ${MEAL_SLOTS.find(s => s.key === searchSlot)?.label}`}
                    </span>
                    {!pendingFood && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          placeholder="Buscar no banco TACO/IBGE..."
                          className="pl-9 h-10 font-mono text-sm"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Measure picker step ──────────────────── */}
                {pendingFood && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Food info */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <p className="text-sm font-bold text-foreground">{pendingFood.food.nome}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {pendingFood.food.calorias_100g} kcal · {pendingFood.food.proteina_100g}g P · {pendingFood.food.carbo_100g}g C · {pendingFood.food.gordura_100g}g G
                        <span className="text-muted-foreground/60"> (por 100g)</span>
                      </p>
                    </div>

                    {/* Measure grid */}
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase mb-2 block">Medida caseira</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {MEASURES.map(m => (
                          <button
                            key={m.label}
                            onClick={() => setPendingMeasure(m.label)}
                            className={`text-[10px] font-mono px-2 py-2 rounded-lg border transition-all text-left ${
                              pendingMeasure === m.label
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {m.label}
                            <span className="block text-[8px] text-muted-foreground">{m.grams}g</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground uppercase mb-2 block">Quantidade</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPendingQty(Math.max(0.5, pendingQty - 0.5))}
                          className="w-10 h-10 rounded-lg border border-border bg-card flex items-center justify-center text-foreground font-bold text-lg hover:border-primary/30"
                        >−</button>
                        <span className="text-xl font-bold font-mono text-foreground w-16 text-center">{pendingQty}</span>
                        <button
                          onClick={() => setPendingQty(pendingQty + 0.5)}
                          className="w-10 h-10 rounded-lg border border-border bg-card flex items-center justify-center text-foreground font-bold text-lg hover:border-primary/30"
                        >+</button>
                      </div>
                    </div>

                    {/* Preview */}
                    {(() => {
                      const measure = MEASURES.find(m => m.label === pendingMeasure) || MEASURES[8];
                      const totalGrams = measure.grams * pendingQty;
                      const factor = totalGrams / 100;
                      const preview = {
                        kcal: Math.round(pendingFood.food.calorias_100g * factor),
                        protein: Math.round(pendingFood.food.proteina_100g * factor * 10) / 10,
                        carbs: Math.round(pendingFood.food.carbo_100g * factor * 10) / 10,
                        fat: Math.round(pendingFood.food.gordura_100g * factor * 10) / 10,
                      };
                      return (
                        <div className="rounded-xl border border-border bg-card p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground font-mono">
                              {pendingQty} {measure.label}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              = <span className="font-bold text-foreground">{Math.round(totalGrams)}g</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <span className="text-[9px] font-mono text-muted-foreground">Kcal</span>
                              <p className="text-sm font-bold text-primary font-mono">{preview.kcal}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-muted-foreground">Prot</span>
                              <p className="text-sm font-bold font-mono text-foreground">{preview.protein}g</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-muted-foreground">Carb</span>
                              <p className="text-sm font-bold font-mono text-foreground">{preview.carbs}g</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-muted-foreground">Gord</span>
                              <p className="text-sm font-bold font-mono text-foreground">{preview.fat}g</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPendingFood(null)}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-mono text-muted-foreground hover:text-foreground"
                      >
                        Voltar
                      </button>
                      <Button onClick={confirmAddFood} className="flex-1 gap-1.5">
                        <Check className="w-4 h-4" />
                        Adicionar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── Search results ───────────────────────── */}
                {!pendingFood && (
                  <>
                    {/* Category filter chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {[
                        { key: null, label: "Todos", emoji: "📋" },
                        { key: "proteina", label: "Proteínas", emoji: "🥩" },
                        { key: "carboidrato", label: "Carboidratos", emoji: "🍚" },
                        { key: "fruta", label: "Frutas", emoji: "🍎" },
                        { key: "vegetal", label: "Vegetais", emoji: "🥦" },
                        { key: "laticinio", label: "Laticínios", emoji: "🧀" },
                        { key: "gordura", label: "Gorduras", emoji: "🥑" },
                        { key: "prato_pronto", label: "Pratos prontos", emoji: "🍲" },
                        { key: "suplemento", label: "Suplementos", emoji: "💊" },
                        { key: "tempero", label: "Temperos", emoji: "🧂" },
                        { key: "outros", label: "Outros", emoji: "📦" },
                      ].map(cat => (
                        <button
                          key={cat.key ?? "all"}
                          onClick={() => { setCategoryFilter(cat.key); handleSearch(searchQuery, cat.key); }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all ${
                            categoryFilter === cat.key
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      ))}
                    </div>

                    {searching && (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                      {searchResults.map(food => (
                        <button
                          key={food.id}
                          onClick={() => selectFoodForMeasure(food, searchSlot!)}
                          className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground flex-1">{food.nome}</p>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {food.categoria === "proteina" ? "🥩" : food.categoria === "carboidrato" ? "🍚" : food.categoria === "fruta" ? "🍎" : food.categoria === "vegetal" ? "🥦" : food.categoria === "laticinio" ? "🧀" : food.categoria === "gordura" ? "🥑" : food.categoria === "prato_pronto" ? "🍲" : food.categoria === "suplemento" ? "💊" : food.categoria === "tempero" ? "🧂" : "📦"}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {food.calorias_100g} kcal · {food.proteina_100g}g P · {food.carbo_100g}g C · {food.gordura_100g}g G
                            <span className="text-muted-foreground/60"> (por 100g) · {food.fonte}</span>
                          </p>
                        </button>
                      ))}
                      {!searching && searchQuery.length >= 2 && searchResults.length === 0 && !categoryFilter && (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">Nenhum alimento encontrado</p>
                        </div>
                      )}
                      {!searching && categoryFilter && searchResults.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">Nenhum alimento nessa categoria</p>
                        </div>
                      )}
                      {searchQuery.length < 2 && !categoryFilter && (
                        <div className="text-center py-8">
                          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Digite pelo menos 2 caracteres ou filtre por categoria</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default DietBuilderPage;
