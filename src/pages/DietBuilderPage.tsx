import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Plus, Trash2, Save, ChevronDown, ChevronUp, Utensils, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFoods, Food } from "@/hooks/useFoods";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

// Medidas caseiras brasileiras com gramatura padrão
const HOUSEHOLD_MEASURES: Record<string, { label: string; grams: number }[]> = {
  default: [
    { label: "Colher de sopa", grams: 15 },
    { label: "Colher de chá", grams: 5 },
    { label: "Colher de sobremesa", grams: 10 },
    { label: "Xícara", grams: 160 },
    { label: "½ xícara", grams: 80 },
    { label: "Concha média", grams: 120 },
    { label: "Escumadeira", grams: 80 },
    { label: "Pegador", grams: 60 },
    { label: "Fatia média", grams: 30 },
    { label: "Unidade média", grams: 100 },
    { label: "Porção (100g)", grams: 100 },
    { label: "Gramas", grams: 1 },
  ],
};

interface DietItem {
  id: string;
  food: Food;
  measure: string;
  grams: number;
  qty: number;
}

const DietBuilderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { searchFoods, calcMacros } = useFoods();

  const [items, setItems] = useState<DietItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [mealName, setMealName] = useState("");
  const [saving, setSaving] = useState(false);

  // Search handler
  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchFoods(q);
    setSearchResults(results);
    setSearching(false);
  }, [searchFoods]);

  // Add food to diet
  const addFood = useCallback((food: Food) => {
    const defaultMeasure = HOUSEHOLD_MEASURES.default[10]; // Porção (100g)
    setItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        food,
        measure: defaultMeasure.label,
        grams: defaultMeasure.grams,
        qty: 1,
      },
    ]);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  // Update item
  const updateItem = useCallback((id: string, updates: Partial<DietItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  // Change measure
  const changeMeasure = useCallback((id: string, measureLabel: string) => {
    const measure = HOUSEHOLD_MEASURES.default.find(m => m.label === measureLabel);
    if (measure) {
      updateItem(id, { measure: measure.label, grams: measure.grams });
    }
  }, [updateItem]);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Totals
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const macros = calcMacros(item.food, item.grams * item.qty);
        return {
          kcal: acc.kcal + macros.kcal,
          protein: acc.protein + macros.protein,
          carbs: acc.carbs + macros.carbs,
          fat: acc.fat + macros.fat,
        };
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [items, calcMacros]);

  // Targets from profile
  const targets = useMemo(() => ({
    kcal: profile?.vet_kcal || 2000,
    protein: profile?.protein_g || 150,
    carbs: profile?.carbs_g || 250,
    fat: profile?.fat_g || 65,
  }), [profile]);

  // Save as meal
  const saveMeal = async () => {
    if (!user || items.length === 0) return;
    const name = mealName.trim() || `Refeição ${new Date().toLocaleDateString("pt-BR")}`;
    setSaving(true);
    const alimentos = items.map(item => ({
      food_id: item.food.id,
      nome: item.food.nome,
      medida: item.measure,
      qtd: item.qty,
      gramas: item.grams * item.qty,
      macros: calcMacros(item.food, item.grams * item.qty),
    }));

    const { error } = await supabase.from("meals_saved").insert({
      user_id: user.id,
      nome: name,
      alimentos: alimentos as any,
      total_macros: totals as any,
    });

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Refeição salva!", description: `"${name}" foi salva com sucesso.` });
      setMealName("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground font-display">Construtor de Dieta</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Monte alimento por alimento</p>
          </div>
        </div>

        {/* Real-time totalizer - sticky */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-2 z-20 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 mb-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">TOTALIZADOR</span>
            <span className="text-sm font-bold font-mono text-foreground">{totals.kcal} kcal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Proteína", value: totals.protein, target: targets.protein, unit: "g", color: "bg-primary" },
              { label: "Carbo", value: totals.carbs, target: targets.carbs, unit: "g", color: "bg-accent" },
              { label: "Gordura", value: totals.fat, target: targets.fat, unit: "g", color: "bg-destructive" },
            ].map(m => {
              const pct = Math.min((m.value / m.target) * 100, 100);
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground">{m.label}</span>
                    <span className="text-[10px] font-mono text-foreground font-bold">{m.value}{m.unit}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${m.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground">/{m.target}{m.unit}</span>
                </div>
              );
            })}
          </div>
          {/* Kcal bar */}
          <div className="mt-2">
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-gold-glow"
                animate={{ width: `${Math.min((totals.kcal / targets.kcal) * 100, 100)}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[8px] font-mono text-muted-foreground">0</span>
              <span className="text-[8px] font-mono text-primary">{Math.round((totals.kcal / targets.kcal) * 100)}% da meta</span>
              <span className="text-[8px] font-mono text-muted-foreground">{targets.kcal}</span>
            </div>
          </div>
        </motion.div>

        {/* Food items list */}
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {items.map((item, i) => {
              const macros = calcMacros(item.food, item.grams * item.qty);
              const isExpanded = expandedItem === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="p-3 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.food.nome}</p>
                      <p className="text-[10px] font-mono text-primary">
                        {macros.kcal} kcal · {macros.protein}g P · {macros.carbs}g C · {macros.fat}g G
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg text-destructive/60 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="p-3 space-y-3">
                          {/* Measure select */}
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Medida caseira</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {HOUSEHOLD_MEASURES.default.map(m => (
                                <button
                                  key={m.label}
                                  onClick={() => changeMeasure(item.id, m.label)}
                                  className={`text-[10px] font-mono px-2 py-1.5 rounded-lg border transition-all ${
                                    item.measure === m.label
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
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Quantidade</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItem(item.id, { qty: Math.max(0.5, item.qty - 0.5) })}
                                className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-foreground font-bold hover:border-primary/30 transition-colors"
                              >
                                −
                              </button>
                              <span className="text-lg font-bold font-mono text-foreground w-16 text-center">{item.qty}</span>
                              <button
                                onClick={() => updateItem(item.id, { qty: item.qty + 0.5 })}
                                className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-foreground font-bold hover:border-primary/30 transition-colors"
                              >
                                +
                              </button>
                              <span className="text-xs font-mono text-muted-foreground ml-2">
                                = {Math.round(item.grams * item.qty)}g
                              </span>
                            </div>
                          </div>

                          {/* Custom grams */}
                          {item.measure === "Gramas" && (
                            <div>
                              <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Gramas exatas</label>
                              <Input
                                type="number"
                                value={item.grams}
                                onChange={(e) => updateItem(item.id, { grams: Number(e.target.value) || 1, qty: 1 })}
                                className="h-9 font-mono text-sm"
                                min={1}
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && !showSearch && (
            <div className="rounded-xl border border-dashed border-border bg-card/30 p-10 text-center">
              <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-display">Nenhum alimento adicionado</p>
              <p className="text-xs font-mono text-primary mt-1">Toque no botão + para começar</p>
            </div>
          )}
        </div>

        {/* Search panel */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-30 bg-background/95 backdrop-blur-sm"
            >
              <div className="max-w-lg mx-auto px-4 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }} className="p-2 rounded-lg border border-border bg-card">
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Buscar alimento..."
                      className="pl-9 h-10 font-mono text-sm"
                      autoFocus
                    />
                  </div>
                </div>

                {searching && (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <div className="space-y-1 max-h-[70vh] overflow-y-auto">
                  {searchResults.map(food => (
                    <button
                      key={food.id}
                      onClick={() => addFood(food)}
                      className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-all"
                    >
                      <p className="text-sm font-semibold text-foreground">{food.nome}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {food.calorias_100g} kcal · {food.proteina_100g}g P · {food.carbo_100g}g C · {food.gordura_100g}g G
                        <span className="text-muted-foreground/60"> (por 100g)</span>
                      </p>
                      <p className="text-[9px] font-mono text-primary/60 mt-0.5">Fonte: {food.fonte}</p>
                    </button>
                  ))}
                  {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Nenhum alimento encontrado</p>
                      <p className="text-xs font-mono text-muted-foreground/60 mt-1">Tente outro termo de busca</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add food FAB */}
        {!showSearch && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowSearch(true)}
            className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            style={{ boxShadow: "var(--shadow-gold)" }}
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}

        {/* Save section */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border bg-card p-4 mb-4"
          >
            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-2 block">Salvar refeição</label>
            <Input
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Nome da refeição (ex: Café da manhã)"
              className="h-9 font-mono text-sm mb-3"
            />
            <Button
              onClick={saveMeal}
              disabled={saving}
              className="w-full gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar refeição"}
            </Button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default DietBuilderPage;
