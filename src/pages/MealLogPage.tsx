import { useState, useMemo, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Search, Plus, Minus, Check, X, ChevronDown,
  Camera, Sparkles, Loader2, Mic, MicOff, ScanBarcode, Star, Clock,
  UtensilsCrossed, PartyPopper
} from "lucide-react";
import { toast } from "sonner";
import EatOutFlow from "@/components/meal/EatOutFlow";
import FreeMealFlow from "@/components/meal/FreeMealFlow";
import VisualPortionSelector from "@/components/meal/VisualPortionSelector";

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

const FOOD_DB: FoodItem[] = [
  { id: "f1", name: "Frango grelhado", portion: "100g", portionGrams: 100, kcal: 159, protein: 32, carbs: 0, fat: 3, category: "Proteínas" },
  { id: "f2", name: "Ovos (unidade)", portion: "1 un (50g)", portionGrams: 50, kcal: 72, protein: 6, carbs: 0.5, fat: 5, category: "Proteínas" },
  { id: "f3", name: "Carne bovina magra", portion: "100g", portionGrams: 100, kcal: 170, protein: 26, carbs: 0, fat: 7, category: "Proteínas" },
  { id: "f4", name: "Tilápia", portion: "100g", portionGrams: 100, kcal: 96, protein: 20, carbs: 0, fat: 2, category: "Proteínas" },
  { id: "f5", name: "Salmão", portion: "100g", portionGrams: 100, kcal: 208, protein: 20, carbs: 0, fat: 13, category: "Proteínas" },
  { id: "f6", name: "Atum em lata", portion: "100g", portionGrams: 100, kcal: 116, protein: 26, carbs: 0, fat: 1, category: "Proteínas" },
  { id: "f7", name: "Whey Protein", portion: "1 scoop (30g)", portionGrams: 30, kcal: 120, protein: 24, carbs: 3, fat: 1.5, category: "Proteínas" },
  { id: "f8", name: "Queijo cottage", portion: "100g", portionGrams: 100, kcal: 98, protein: 12, carbs: 3, fat: 4, category: "Proteínas" },
  { id: "f9", name: "Iogurte grego", portion: "170g", portionGrams: 170, kcal: 100, protein: 17, carbs: 6, fat: 1, category: "Proteínas" },
  { id: "c1", name: "Arroz branco", portion: "100g cozido", portionGrams: 100, kcal: 130, protein: 2.5, carbs: 28, fat: 0.3, category: "Carboidratos" },
  { id: "c2", name: "Arroz integral", portion: "100g cozido", portionGrams: 100, kcal: 124, protein: 2.6, carbs: 26, fat: 1, category: "Carboidratos" },
  { id: "c3", name: "Batata doce", portion: "100g cozida", portionGrams: 100, kcal: 77, protein: 0.6, carbs: 18, fat: 0.1, category: "Carboidratos" },
  { id: "c4", name: "Pão integral", portion: "1 fatia (25g)", portionGrams: 25, kcal: 62, protein: 3, carbs: 11, fat: 1, category: "Carboidratos" },
  { id: "c5", name: "Aveia", portion: "30g", portionGrams: 30, kcal: 117, protein: 4, carbs: 20, fat: 2, category: "Carboidratos" },
  { id: "c6", name: "Macarrão integral", portion: "100g cozido", portionGrams: 100, kcal: 124, protein: 5, carbs: 25, fat: 1, category: "Carboidratos" },
  { id: "c7", name: "Tapioca", portion: "30g seco", portionGrams: 30, kcal: 108, protein: 0, carbs: 26, fat: 0, category: "Carboidratos" },
  { id: "c8", name: "Feijão preto", portion: "100g cozido", portionGrams: 100, kcal: 77, protein: 4.5, carbs: 14, fat: 0.5, category: "Carboidratos" },
  { id: "g1", name: "Azeite de oliva", portion: "1 colher (13ml)", portionGrams: 13, kcal: 117, protein: 0, carbs: 0, fat: 13, category: "Gorduras" },
  { id: "g2", name: "Pasta de amendoim", portion: "1 colher (15g)", portionGrams: 15, kcal: 94, protein: 4, carbs: 3, fat: 8, category: "Gorduras" },
  { id: "g3", name: "Castanha do pará", portion: "3 un (12g)", portionGrams: 12, kcal: 79, protein: 2, carbs: 1, fat: 8, category: "Gorduras" },
  { id: "g4", name: "Abacate", portion: "100g", portionGrams: 100, kcal: 160, protein: 2, carbs: 9, fat: 15, category: "Gorduras" },
  { id: "g5", name: "Manteiga", portion: "10g", portionGrams: 10, kcal: 72, protein: 0, carbs: 0, fat: 8, category: "Gorduras" },
  { id: "fr1", name: "Banana", portion: "1 média (100g)", portionGrams: 100, kcal: 89, protein: 1, carbs: 23, fat: 0.3, category: "Frutas" },
  { id: "fr2", name: "Maçã", portion: "1 média (130g)", portionGrams: 130, kcal: 68, protein: 0.4, carbs: 18, fat: 0.2, category: "Frutas" },
  { id: "fr3", name: "Morango", portion: "100g", portionGrams: 100, kcal: 33, protein: 0.7, carbs: 8, fat: 0.3, category: "Frutas" },
  { id: "fr4", name: "Laranja", portion: "1 média (140g)", portionGrams: 140, kcal: 62, protein: 1, carbs: 15, fat: 0.2, category: "Frutas" },
  { id: "v1", name: "Brócolis", portion: "100g cozido", portionGrams: 100, kcal: 35, protein: 3.7, carbs: 4, fat: 0.4, category: "Vegetais" },
  { id: "v2", name: "Espinafre", portion: "100g", portionGrams: 100, kcal: 23, protein: 3, carbs: 4, fat: 0.4, category: "Vegetais" },
  { id: "v3", name: "Tomate", portion: "1 médio (120g)", portionGrams: 120, kcal: 22, protein: 1, carbs: 5, fat: 0.2, category: "Vegetais" },
  { id: "v4", name: "Cenoura", portion: "1 média (80g)", portionGrams: 80, kcal: 33, protein: 0.7, carbs: 8, fat: 0.2, category: "Vegetais" },
  { id: "l1", name: "Leite desnatado", portion: "200ml", portionGrams: 200, kcal: 68, protein: 7, carbs: 10, fat: 0.4, category: "Laticínios" },
  { id: "l2", name: "Queijo mussarela", portion: "30g", portionGrams: 30, kcal: 90, protein: 7, carbs: 0.7, fat: 7, category: "Laticínios" },
  { id: "l3", name: "Requeijão light", portion: "30g", portionGrams: 30, kcal: 45, protein: 2, carbs: 2, fat: 3, category: "Laticínios" },
];

interface SelectedFood {
  food: FoodItem;
  quantity: number;
}

type InputMode = "manual" | "ai-text" | "ai-photo" | "voice" | "barcode" | "quick";

interface SavedMeal {
  meal_type: string;
  total_kcal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  count: number;
}

const MealLogPage = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMealType, setSelectedMealType] = useState(MEAL_TYPES[0].key);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [hungerLevel, setHungerLevel] = useState(5);
  const [satietyLevel, setSatietyLevel] = useState(5);
  const [emotion, setEmotion] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [specialFlow, setSpecialFlow] = useState<"eat-out" | "free-meal" | null>(null);
  // AI states
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiComment, setAiComment] = useState("");
  const [aiMicronutrients, setAiMicronutrients] = useState<Record<string, number>[]>([]);
  const [aiQualityScore, setAiQualityScore] = useState<number | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Barcode states
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // Quick meals (frequent)
  const [quickMeals, setQuickMeals] = useState<SavedMeal[]>([]);
  const [quickLoading, setQuickLoading] = useState(false);

  // Load frequent meals
  useEffect(() => {
    if (!user || inputMode !== "quick") return;
    const loadFrequent = async () => {
      setQuickLoading(true);
      const { data } = await supabase
        .from("meal_logs")
        .select("meal_type, total_kcal, total_protein, total_carbs, total_fat, notes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data && data.length > 0) {
        // Group by meal_type + rough kcal range
        const grouped: Record<string, SavedMeal> = {};
        data.forEach(m => {
          const key = `${m.meal_type}_${Math.round((m.total_kcal || 0) / 50) * 50}`;
          if (!grouped[key]) {
            grouped[key] = {
              meal_type: m.meal_type,
              total_kcal: m.total_kcal || 0,
              total_protein: m.total_protein || 0,
              total_carbs: m.total_carbs || 0,
              total_fat: m.total_fat || 0,
              count: 0,
            };
          }
          grouped[key].count++;
        });
        const sorted = Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 6);
        setQuickMeals(sorted);
      }
      setQuickLoading(false);
    };
    loadFrequent();
  }, [user, inputMode]);

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

  const addAiFoods = (foods: Array<{ name: string; portion: string; kcal: number; protein: number; carbs: number; fat: number; micronutrients?: Record<string, number> }>, qualityScore?: number) => {
    const newFoods: SelectedFood[] = foods.map((f, i) => ({
      food: {
        id: `ai-${Date.now()}-${i}`,
        name: f.name,
        portion: f.portion,
        portionGrams: 100,
        kcal: f.kcal,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        category: "🤖 IA",
      },
      quantity: 1,
    }));
    setSelectedFoods(prev => [...prev, ...newFoods]);
    // Store micronutrients for saving later
    const micros = foods.map(f => f.micronutrients || {});
    setAiMicronutrients(prev => [...prev, ...micros]);
    if (qualityScore != null) setAiQualityScore(qualityScore);
  };

  // AI text/voice analysis
  const analyzeByText = async (text?: string) => {
    const query = text || aiQuery;
    if (!query.trim()) return;
    setAiLoading(true);
    setAiComment("");
    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: {
          mode: "text",
          query,
          profileContext: profile ? `Objetivo: ${profile.goal}, Meta: ${profile.vet_kcal}kcal, Proteína: ${profile.protein_g}g` : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.foods?.length) {
        addAiFoods(data.foods, data.quality_score);
        setAiComment(data.comment || "");
        setAiQuery("");
        setVoiceTranscript("");
        toast.success(`${data.foods.length} alimento(s) identificado(s)! ✨`);
      } else {
        toast.error("A IA não conseguiu identificar alimentos.");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro na análise por IA");
    }
    setAiLoading(false);
  };

  // Photo analysis
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      setPhotoPreview(base64Full);
      const base64Data = base64Full.split(",")[1];
      if (!base64Data) return;
      setAiLoading(true);
      setAiComment("");
      try {
        const { data, error } = await supabase.functions.invoke("analyze-meal", {
          body: {
            mode: "photo",
            imageBase64: base64Data,
            profileContext: profile ? `Objetivo: ${profile.goal}, Meta: ${profile.vet_kcal}kcal` : undefined,
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (data?.foods?.length) {
          addAiFoods(data.foods, data.quality_score);
          setAiComment(data.comment || "");
          toast.success(`${data.foods.length} alimento(s) detectado(s) na foto! 📸✨`);
        } else {
          toast.error("Não foi possível identificar alimentos na foto.");
        }
      } catch (err: any) {
        toast.error(err.message || "Erro ao analisar foto");
      }
      setAiLoading(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Voice recognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Reconhecimento de voz não suportado neste navegador.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceTranscript(transcript);
      if (event.results[0]?.isFinal) {
        setIsListening(false);
        // Auto-analyze after final result
        analyzeByText(transcript);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Erro no reconhecimento de voz.");
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setVoiceTranscript("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Barcode lookup via OpenFoodFacts
  const lookupBarcode = async () => {
    if (!barcodeQuery.trim()) return;
    setBarcodeLoading(true);
    try {
      const resp = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeQuery.trim()}.json`);
      const data = await resp.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        const food: FoodItem = {
          id: `barcode-${barcodeQuery}`,
          name: p.product_name || p.product_name_pt || "Produto",
          portion: `${p.serving_size || "100g"}`,
          portionGrams: parseFloat(p.serving_quantity) || 100,
          kcal: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
          protein: Math.round((n.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((n.fat_100g || 0) * 10) / 10,
          category: "📦 Produto",
        };
        addFood(food);
        setBarcodeQuery("");
        toast.success(`${food.name} encontrado! 📦`);
      } else {
        toast.error("Produto não encontrado. Verifique o código de barras.");
      }
    } catch {
      toast.error("Erro ao buscar produto.");
    }
    setBarcodeLoading(false);
  };

  // Quick meal register
  const registerQuickMeal = async (meal: SavedMeal) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      meal_type: meal.meal_type,
      total_kcal: Math.round(meal.total_kcal),
      total_protein: Math.round(meal.total_protein),
      total_carbs: Math.round(meal.total_carbs),
      total_fat: Math.round(meal.total_fat),
      confirmed: true,
    });
    if (!error) {
      const currentXp = profile?.xp || 0;
      const newXp = currentXp + 10;
      const today = new Date().toISOString().split("T")[0];
      const lastDate = profile?.last_streak_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let newStreak = profile?.streak_days || 0;
      if (lastDate !== today) {
        newStreak = lastDate === yesterday ? newStreak + 1 : 1;
      }
      await updateProfile({ xp: newXp, streak_days: newStreak, last_streak_date: today });
      toast.success("Refeição rápida registrada! +10 XP ⚡");
      navigate("/dashboard");
    } else {
      toast.error("Erro ao salvar.");
    }
    setSaving(false);
  };

  const saveMeal = async () => {
    if (!user || selectedFoods.length === 0) return;
    setSaving(true);

    let photoUrl: string | null = null;
    if (photoPreview) {
      try {
        const blob = await fetch(photoPreview).then(r => r.blob());
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from("meal-photos").upload(fileName, blob, { contentType: "image/jpeg" });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("meal-photos").getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      } catch { /* ignore */ }
    }

    const foodNames = selectedFoods.map(sf => sf.food.name);
    const { data: insertedMeal, error } = await supabase.from("meal_logs").insert({
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
      photo_url: photoUrl,
      confirmed: true,
      quality_score: aiQualityScore,
      food_names: foodNames,
    }).select("id").single();

    if (!error && insertedMeal) {
      // Save micronutrients if available
      if (aiMicronutrients.length > 0) {
        const nutrientRows = aiMicronutrients.flatMap(micros =>
          Object.entries(micros).filter(([, v]) => v > 0).map(([nutrient, amount]) => ({
            meal_log_id: insertedMeal.id,
            user_id: user.id,
            nutrient,
            amount,
            unit: nutrient.endsWith("_mcg") ? "mcg" : nutrient.endsWith("_mg") ? "mg" : "g",
          }))
        );
        if (nutrientRows.length > 0) {
          await supabase.from("meal_nutrients").insert(nutrientRows);
        }
      }
      const currentXp = profile?.xp || 0;
      const currentLevel = profile?.level || 1;
      const newXp = currentXp + 15;
      const newLevel = Math.floor(newXp / 100) + 1;
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
  const mealTypeIcons: Record<string, string> = {
    cafe_manha: "☕", lanche_manha: "🍎", almoco: "🍽️", lanche_tarde: "🥤", jantar: "🌙", ceia: "🫖",
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">

        {/* Special flows */}
        {specialFlow === "eat-out" && (
          <EatOutFlow onClose={() => setSpecialFlow(null)} />
        )}
        {specialFlow === "free-meal" && (
          <FreeMealFlow onClose={() => setSpecialFlow(null)} />
        )}

        {!specialFlow && (
        <>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Registrar Refeição</h1>
            <p className="text-[10px] font-mono text-muted-foreground">5 formas de registrar</p>
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
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="grid grid-cols-3 gap-2">
                {MEAL_TYPES.map(mt => (
                  <button
                    key={mt.key}
                    onClick={() => { setSelectedMealType(mt.key); setShowMealPicker(false); }}
                    className={`p-2 rounded-xl text-center text-xs font-mono transition-all ${
                      mt.key === selectedMealType ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
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

        {/* Quick access: Comi Fora + Refeição Livre */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setSpecialFlow("eat-out")}
            className="py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">🍴 Comi fora</span>
          </button>
          <button
            onClick={() => setSpecialFlow("free-meal")}
            className="py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <PartyPopper className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">🎉 Refeição Livre</span>
          </button>
        </div>

        {/* Input mode selector — 2 rows */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {([
            { mode: "manual" as InputMode, icon: Search, label: "Busca" },
            { mode: "ai-text" as InputMode, icon: Sparkles, label: "IA Texto" },
            { mode: "ai-photo" as InputMode, icon: Camera, label: "IA Foto" },
            { mode: "voice" as InputMode, icon: Mic, label: "Voz" },
            { mode: "barcode" as InputMode, icon: ScanBarcode, label: "Código" },
            { mode: "quick" as InputMode, icon: Star, label: "Rápida" },
          ]).map(m => (
            <button
              key={m.mode}
              onClick={() => setInputMode(m.mode)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                inputMode === m.mode
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <m.icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          ))}
        </div>

        {/* AI Comment */}
        <AnimatePresence>
          {aiComment && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">{aiComment}</p>
                <button onClick={() => setAiComment("")} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Loading */}
        <AnimatePresence>
          {aiLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 rounded-xl border border-primary/30 bg-card p-6 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Analisando com IA...</p>
              <p className="text-xs text-muted-foreground mt-1">Identificando alimentos e calculando macros</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo preview */}
        {photoPreview && (
          <div className="mb-4 relative">
            <img src={photoPreview} alt="Foto da refeição" className="w-full h-48 object-cover rounded-xl border border-border" />
            <button onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Real-time totals */}
        {selectedFoods.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Kcal", value: totals.kcal, target: profile?.vet_kcal },
              { label: "Prot", value: totals.protein, target: profile?.protein_g, unit: "g" },
              { label: "Carb", value: totals.carbs, target: profile?.carbs_g, unit: "g" },
              { label: "Fat", value: totals.fat, target: profile?.fat_g, unit: "g" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-border bg-card p-2 text-center">
                <span className="text-[10px] text-muted-foreground font-mono">{m.label}</span>
                <p className="text-sm font-bold font-mono text-foreground">{Math.round(m.value)}</p>
                {m.target && <span className="text-[9px] text-muted-foreground font-mono">meta: {Math.round(m.target)}{m.unit || ""}</span>}
              </div>
            ))}
          </motion.div>
        )}

        {/* Selected foods */}
        {selectedFoods.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Alimentos selecionados</h3>
            {selectedFoods.map(sf => (
              <motion.div key={sf.food.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {(sf.food.category === "🤖 IA" || sf.food.category === "📦 Produto") && <span className="text-primary mr-1">✨</span>}
                      {sf.food.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {sf.food.portion} · {Math.round(sf.food.kcal * sf.quantity)}kcal · {Math.round(sf.food.protein * sf.quantity)}g prot
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(sf.food.id, -0.5)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-mono font-bold text-foreground w-8 text-center">{sf.quantity}</span>
                    <button onClick={() => updateQuantity(sf.food.id, 0.5)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeFood(sf.food.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 ml-1"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* === INPUT MODE CONTENT === */}

        {/* 1. Manual search */}
        {inputMode === "manual" && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar alimento (TACO/IBGE)..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-4 mb-6">
              {Object.entries(groupedFoods).map(([category, foods]) => (
                <div key={category}>
                  <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-2">{category}</h3>
                  <div className="space-y-1">
                    {foods.map(food => {
                      const isSelected = selectedFoods.some(sf => sf.food.id === food.id);
                      return (
                        <button key={food.id} onClick={() => addFood(food)} className={`w-full text-left rounded-xl border p-3 transition-all ${isSelected ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{food.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{food.portion} · {food.kcal}kcal · P:{food.protein}g C:{food.carbs}g G:{food.fat}g</p>
                            </div>
                            {isSelected ? <Check className="w-4 h-4 text-primary flex-shrink-0" /> : <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 2. AI Text */}
        {inputMode === "ai-text" && !aiLoading && (
          <div className="mb-4">
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && analyzeByText()} placeholder="Ex: prato de arroz com feijão e frango..." className="w-full pl-10 pr-20 py-3 rounded-xl border border-primary/30 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button onClick={() => analyzeByText()} disabled={!aiQuery.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40">Analisar</button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">💡 Descreva sua refeição em linguagem natural. A IA calcula macros automaticamente.</p>
          </div>
        )}

        {/* 3. AI Photo */}
        {inputMode === "ai-photo" && !aiLoading && (
          <div className="mb-4">
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-6 rounded-xl border-2 border-dashed border-primary/30 bg-card hover:bg-primary/5 transition-all flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 text-primary" />
              <span className="text-sm font-semibold text-foreground">Tirar foto ou escolher da galeria</span>
              <span className="text-[10px] text-muted-foreground">A IA identifica os alimentos automaticamente</span>
            </button>
          </div>
        )}

        {/* 4. Voice */}
        {inputMode === "voice" && !aiLoading && (
          <div className="mb-4">
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-border bg-card">
              <motion.button
                onClick={isListening ? stopListening : startListening}
                animate={isListening ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0 0 hsl(var(--primary) / 0)", "0 0 0 12px hsl(var(--primary) / 0.15)", "0 0 0 0 hsl(var(--primary) / 0)"] } : {}}
                transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground glow-gold"
                }`}
              >
                {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </motion.button>
              <p className="text-sm text-foreground font-semibold">
                {isListening ? "Ouvindo..." : "Toque para falar"}
              </p>
              <p className="text-[10px] text-muted-foreground text-center">
                {isListening ? "Diga o que você comeu e a IA vai registrar" : "Ex: \"Comi arroz com feijão e frango grelhado\""}
              </p>
              {voiceTranscript && (
                <div className="w-full p-3 rounded-xl bg-secondary text-sm text-foreground font-mono">
                  "{voiceTranscript}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Barcode */}
        {inputMode === "barcode" && (
          <div className="mb-4">
            <div className="relative">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="text"
                inputMode="numeric"
                value={barcodeQuery}
                onChange={e => setBarcodeQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && lookupBarcode()}
                placeholder="Digite o código de barras (EAN)..."
                className="w-full pl-10 pr-20 py-3 rounded-xl border border-accent/30 bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                onClick={lookupBarcode}
                disabled={!barcodeQuery.trim() || barcodeLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold disabled:opacity-40"
              >
                {barcodeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Buscar"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              📦 Digite o código de barras do produto. Busca em +2M itens do OpenFoodFacts.
            </p>
          </div>
        )}

        {/* 6. Quick meals */}
        {inputMode === "quick" && (
          <div className="mb-4">
            {quickLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Carregando refeições frequentes...</p>
              </div>
            ) : quickMeals.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-border bg-card/50">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma refeição anterior encontrada</p>
                <p className="text-xs text-muted-foreground mt-1">Registre refeições para vê-las aqui</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Suas refeições frequentes</p>
                {quickMeals.map((meal, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => registerQuickMeal(meal)}
                    disabled={saving}
                    className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{mealTypeIcons[meal.meal_type] || "🍽️"}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground capitalize">{meal.meal_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {Math.round(meal.total_kcal)} kcal · {Math.round(meal.total_protein)}g P · {Math.round(meal.total_carbs)}g C · {Math.round(meal.total_fat)}g G
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="text-[10px] font-mono">{meal.count}×</span>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hunger & Satiety */}
        {selectedFoods.length > 0 && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Fome antes (1-10): {hungerLevel}</label>
              <input type="range" min={1} max={10} value={hungerLevel} onChange={e => setHungerLevel(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Saciedade depois (1-10): {satietyLevel}</label>
              <input type="range" min={1} max={10} value={satietyLevel} onChange={e => setSatietyLevel(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Como se sentiu?</label>
              <div className="flex gap-2 flex-wrap">
                {["😊 Bem", "😐 Normal", "😰 Ansioso", "😔 Triste", "🤩 Ótimo", "😴 Cansado"].map(e => (
                  <button key={e} onClick={() => setEmotion(emotion === e ? "" : e)} className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${emotion === e ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Observações</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: comi rápido, estava muito doce..." className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20" />
            </div>
          </div>
        )}

        {/* Save button */}
        {selectedFoods.length > 0 && (
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={saveMeal} disabled={saving} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-gold disabled:opacity-50 transition-all mb-4">
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
        </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default MealLogPage;
