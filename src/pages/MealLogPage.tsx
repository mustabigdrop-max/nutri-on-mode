import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Search, Plus, Minus, Check, X, Apple, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

const MEAL_TYPES = [
  { key: "cafe_manha", label: "Café da Manhã", emoji: "☕" },
  { key: "lanche_manha", label: "Lanche AM", emoji: "🍎" },
  { key: "almoco", label: "Almoço", emoji: "🍽️" },
  { key: "lanche_tarde", label: "Lanche PM", emoji: "🥤" },
  { key: "jantar", label: "Jantar", emoji: "🌙" },
  { key: "ceia", label: "Ceia", emoji: "🫖" },
];

interface FoodItem {
  id: string;
  name: string;
  portion: string;
  portionGrams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

// Food database (TACO-inspired)
const FOOD_DB: FoodItem[] = [
  // Proteínas
  { id: "f1", name: "Frango grelhado", portion: "100g", portionGrams: 100, kcal: 159, protein: 32, carbs: 0, fat: 3, category: "Proteínas" },
  { id: "f2", name: "Ovos (unidade)", portion: "1 un (50g)", portionGrams: 50, kcal: 72, protein: 6, carbs: 0.5, fat: 5, category: "Proteínas" },
  { id: "f3", name: "Carne bovina magra", portion: "100g", portionGrams: 100, kcal: 170, protein: 26, carbs: 0, fat: 7, category: "Proteínas" },
  { id: "f4", name: "Tilápia", portion: "100g", portionGrams: 100, kcal: 96, protein: 20, carbs: 0, fat: 2, category: "Proteínas" },
  { id: "f5", name: "Salmão", portion: "100g", portionGrams: 100, kcal: 208, protein: 20, carbs: 0, fat: 13, category: "Proteínas" },
  { id: "f6", name: "Atum em lata", portion: "100g", portionGrams: 100, kcal: 116, protein: 26, carbs: 0, fat: 1, category: "Proteínas" },
  { id: "f7", name: "Whey Protein", portion: "1 scoop (30g)", portionGrams: 30, kcal: 120, protein: 24, carbs: 3, fat: 1.5, category: "Proteínas" },
  { id: "f8", name: "Queijo cottage", portion: "100g", portionGrams: 100, kcal: 98, protein: 12, carbs: 3, fat: 4, category: "Proteínas" },
  { id: "f9", name: "Iogurte grego", portion: "170g", portionGrams: 170, kcal: 100, protein: 17, carbs: 6, fat: 1, category: "Proteínas" },
  // Carboidratos
  { id: "c1", name: "Arroz branco", portion: "100g cozido", portionGrams: 100, kcal: 130, protein: 2.5, carbs: 28, fat: 0.3, category: "Carboidratos" },
  { id: "c2", name: "Arroz integral", portion: "100g cozido", portionGrams: 100, kcal: 124, protein: 2.6, carbs: 26, fat: 1, category: "Carboidratos" },
  { id: "c3", name: "Batata doce", portion: "100g cozida", portionGrams: 100, kcal: 77, protein: 0.6, carbs: 18, fat: 0.1, category: "Carboidratos" },
  { id: "c4", name: "Pão integral", portion: "1 fatia (25g)", portionGrams: 25, kcal: 62, protein: 3, carbs: 11, fat: 1, category: "Carboidratos" },
  { id: "c5", name: "Aveia", portion: "30g", portionGrams: 30, kcal: 117, protein: 4, carbs: 20, fat: 2, category: "Carboidratos" },
  { id: "c6", name: "Macarrão integral", portion: "100g cozido", portionGrams: 100, kcal: 124, protein: 5, carbs: 25, fat: 1, category: "Carboidratos" },
  { id: "c7", name: "Tapioca", portion: "30g seco", portionGrams: 30, kcal: 108, protein: 0, carbs: 26, fat: 0, category: "Carboidratos" },
  { id: "c8", name: "Feijão preto", portion: "100g cozido", portionGrams: 100, kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, category: "Carboidratos" },
  // Gorduras
  { id: "g1", name: "Azeite de oliva", portion: "1 colher (13ml)", portionGrams: 13, kcal: 117, protein: 0, carbs: 0, fat: 13, category: "Gorduras" },
  { id: "g2", name: "Pasta de amendoim", portion: "1 colher (15g)", portionGrams: 15, kcal: 94, protein: 4, carbs: 3, fat: 8, category: "Gorduras" },
  { id: "g3", name: "Castanha do pará", portion: "3 un (12g)", portionGrams: 12, kcal: 79, protein: 2, carbs: 1, fat: 8, category: "Gorduras" },
  { id: "g4", name: "Abacate", portion: "100g", portionGrams: 100, kcal: 160, protein: 2, carbs: 9, fat: 15, category: "Gorduras" },
  { id: "g5", name: "Manteiga", portion: "10g", portionGrams: 10, kcal: 72, protein: 0, carbs: 0, fat: 8, category: "Gorduras" },
  // Frutas
  { id: "fr1", name: "Banana", portion: "1 média (100g)", portionGrams: 100, kcal: 89, protein: 1, carbs: 23, fat: 0.3, category: "Frutas" },
  { id: "fr2", name: "Maçã", portion: "1 média (130g)", portionGrams: 130, kcal: 68, protein: 0.4, carbs: 18, fat: 0.2, category: "Frutas" },
  { id: "fr3", name: "Morango", portion: "100g", portionGrams: 100, kcal: 33, protein: 0.7, carbs: 8, fat: 0.3, category: "Frutas" },
  { id: "fr4", name: "Laranja", portion: "1 média (140g)", portionGrams: 140, kcal: 62, protein: 1, carbs: 15, fat: 0.2, category: "Frutas" },
  // Verduras e legumes
  { id: "v1", name: "Brócolis", portion: "100g cozido", portionGrams: 100, kcal: 35, protein: 3.7, carbs: 4, fat: 0.4, category: "Vegetais" },
  { id: "v2", name: "Espinafre", portion: "100g", portionGrams: 100, kcal: 23, protein: 3, carbs: 4, fat: 0.4, category: "Vegetais" },
  { id: "v3", name: "Tomate", portion: "1 médio (120g)", portionGrams: 120, kcal: 22, protein: 1, carbs: 5, fat: 0.2, category: "Vegetais" },
  { id: "v4", name: "Cenoura", portion: "1 média (80g)", portionGrams: 80, kcal: 33, protein: 0.7, carbs: 8, fat: 0.2, category: "Vegetais" },
  // Laticínios
  { id: "l1", name: "Leite desnatado", portion: "200ml", portionGrams: 200, kcal: 68, protein: 7, carbs: 10, fat: 0.4, category: "Laticínios" },
  { id: "l2", name: "Queijo mussarela", portion: "30g", portionGrams: 30, kcal: 90, protein: 7, carbs: 0.7, fat: 7, category: "Laticínios" },
  { id: "l3", name: "Requeijão light", portion: "30g", portionGrams: 30, kcal: 45, protein: 2, carbs: 2, fat: 3, category: "Laticínios" },
];

interface SelectedFood {
  food: FoodItem;
  quantity: number; // number of portions
}

const MealLogPage = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [selectedMealType, setSelectedMealType] = useState(MEAL_TYPES[0].key);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [hungerLevel, setHungerLevel] = useState(5);
  const [satietyLevel, setSatietyLevel] = useState(5);
  const [emotion, setEmotion] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(false);

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return FOOD_DB;
    const q = searchQuery.toLowerCase();
    return FOOD_DB.filter(f =>
      f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const groupedFoods = useMemo(() => {
    const groups: Record<string, FoodItem[]> = {};
    filteredFoods.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [filteredFoods]);

  const totals = useMemo(() => ({
    kcal: selectedFoods.reduce((s, sf) => s + sf.food.kcal * sf.quantity, 0),
    protein: selectedFoods.reduce((s, sf) => s + sf.food.protein * sf.quantity, 0),
    carbs: selectedFoods.reduce((s, sf) => s + sf.food.carbs * sf.quantity, 0),
    fat: selectedFoods.reduce((s, sf) => s + sf.food.fat * sf.quantity, 0),
  }), [selectedFoods]);

  const addFood = (food: FoodItem) => {
    setSelectedFoods(prev => {
      const existing = prev.find(sf => sf.food.id === food.id);
      if (existing) return prev.map(sf => sf.food.id === food.id ? { ...sf, quantity: sf.quantity + 1 } : sf);
      return [...prev, { food, quantity: 1 }];
    });
  };

  const updateQuantity = (foodId: string, delta: number) => {
    setSelectedFoods(prev =>
      prev.map(sf => sf.food.id === foodId ? { ...sf, quantity: Math.max(0.5, sf.quantity + delta) } : sf)
        .filter(sf => sf.quantity > 0)
    );
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(sf => sf.food.id !== foodId));
  };

  const saveMeal = async () => {
    if (!user || selectedFoods.length === 0) return;
    setSaving(true);

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      meal_type: selectedMealType,
      total_kcal: Math.round(totals.kcal),
      total_protein: Math.round(totals.protein),
      total_carbs: Math.round(totals.carbs),
      total_fat: Math.round(totals.fat),
      hunger_level: hungerLevel,
      satiety_level: satietyLevel,
      emotion: emotion || null,
      notes: notes || null,
      confirmed: true,
    });

    if (!error) {
      // Award XP for logging
      const currentXp = profile?.xp || 0;
      const currentLevel = profile?.level || 1;
      const newXp = currentXp + 15;
      const newLevel = Math.floor(newXp / 100) + 1;

      // Update streak
      const today = new Date().toISOString().split("T")[0];
      const lastDate = profile?.last_streak_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let newStreak = profile?.streak_days || 0;
      if (lastDate !== today) {
        newStreak = lastDate === yesterday ? newStreak + 1 : 1;
      }

      await updateProfile({
        xp: newXp,
        level: newLevel > currentLevel ? newLevel : currentLevel,
        streak_days: newStreak,
        last_streak_date: today,
      });

      toast.success(`Refeição registrada! +15 XP 🎉${newLevel > currentLevel ? ` Level UP! → Lv.${newLevel}` : ""}`);
      navigate("/dashboard");
    } else {
      toast.error("Erro ao salvar refeição");
    }
    setSaving(false);
  };

  const currentMeal = MEAL_TYPES.find(m => m.key === selectedMealType)!;

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Registrar Refeição</h1>
          </div>
        </div>

        {/* Meal type picker */}
        <button
          onClick={() => setShowMealPicker(!showMealPicker)}
          className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-3 mb-4"
        >
          <span className="text-sm font-semibold text-foreground">{currentMeal.emoji} {currentMeal.label}</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showMealPicker ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {showMealPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="grid grid-cols-3 gap-2">
                {MEAL_TYPES.map(mt => (
                  <button
                    key={mt.key}
                    onClick={() => { setSelectedMealType(mt.key); setShowMealPicker(false); }}
                    className={`p-2 rounded-xl text-center text-xs font-mono transition-all ${
                      mt.key === selectedMealType
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-lg block">{mt.emoji}</span>
                    {mt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time totals */}
        {selectedFoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-2 mb-4"
          >
            {[
              { label: "Kcal", value: totals.kcal, target: profile?.vet_kcal },
              { label: "Prot", value: totals.protein, target: profile?.protein_g, unit: "g" },
              { label: "Carb", value: totals.carbs, target: profile?.carbs_g, unit: "g" },
              { label: "Fat", value: totals.fat, target: profile?.fat_g, unit: "g" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-border bg-card p-2 text-center">
                <span className="text-[10px] text-muted-foreground font-mono">{m.label}</span>
                <p className="text-sm font-bold font-mono text-foreground">{Math.round(m.value)}</p>
                {m.target && (
                  <span className="text-[9px] text-muted-foreground font-mono">meta: {Math.round(m.target)}{m.unit || ""}</span>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Selected foods */}
        {selectedFoods.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Alimentos selecionados</h3>
            {selectedFoods.map(sf => (
              <motion.div
                key={sf.food.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-primary/20 bg-primary/5 p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{sf.food.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {sf.food.portion} · {Math.round(sf.food.kcal * sf.quantity)}kcal · {Math.round(sf.food.protein * sf.quantity)}g prot
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(sf.food.id, -0.5)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-mono font-bold text-foreground w-8 text-center">{sf.quantity}</span>
                    <button onClick={() => updateQuantity(sf.food.id, 0.5)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFood(sf.food.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar alimento..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Food list */}
        <div className="space-y-4 mb-6">
          {Object.entries(groupedFoods).map(([category, foods]) => (
            <div key={category}>
              <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-2">{category}</h3>
              <div className="space-y-1">
                {foods.map(food => {
                  const isSelected = selectedFoods.some(sf => sf.food.id === food.id);
                  return (
                    <button
                      key={food.id}
                      onClick={() => addFood(food)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{food.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {food.portion} · {food.kcal}kcal · P:{food.protein}g C:{food.carbs}g G:{food.fat}g
                          </p>
                        </div>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Hunger & Satiety */}
        {selectedFoods.length > 0 && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Fome antes (1-10): {hungerLevel}</label>
              <input type="range" min={1} max={10} value={hungerLevel} onChange={e => setHungerLevel(+e.target.value)}
                className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Saciedade depois (1-10): {satietyLevel}</label>
              <input type="range" min={1} max={10} value={satietyLevel} onChange={e => setSatietyLevel(+e.target.value)}
                className="w-full accent-primary" />
            </div>

            {/* Emotion */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Como se sentiu?</label>
              <div className="flex gap-2 flex-wrap">
                {["😊 Bem", "😐 Normal", "😰 Ansioso", "😔 Triste", "🤩 Ótimo", "😴 Cansado"].map(e => (
                  <button
                    key={e}
                    onClick={() => setEmotion(emotion === e ? "" : e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      emotion === e
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Observações</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: comi rápido, estava muito doce..."
                className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
              />
            </div>
          </div>
        )}

        {/* Save button */}
        {selectedFoods.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={saveMeal}
            disabled={saving}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-gold disabled:opacity-50 transition-all mb-4"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              `Registrar ${currentMeal.label} · ${Math.round(totals.kcal)} kcal`
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default MealLogPage;
