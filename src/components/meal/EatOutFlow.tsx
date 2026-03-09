import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImageIcon, ArrowRight, Loader2, X, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "fast_food", label: "Fast Food", emoji: "🍔", kcal: 850, protein: 35, carbs: 90, fat: 35 },
  { key: "self_service", label: "Self Service", emoji: "🍽️", kcal: 700, protein: 40, carbs: 70, fat: 22 },
  { key: "japones", label: "Japonês", emoji: "🍣", kcal: 550, protein: 35, carbs: 75, fat: 10 },
  { key: "churrascaria", label: "Churrascaria", emoji: "🥩", kcal: 900, protein: 70, carbs: 30, fat: 50 },
  { key: "pizzaria", label: "Pizzaria", emoji: "🍕", kcal: 800, protein: 28, carbs: 95, fat: 30 },
  { key: "lanchonete", label: "Lanchonete", emoji: "🌮", kcal: 650, protein: 25, carbs: 70, fat: 28 },
  { key: "frutos_mar", label: "Frutos do Mar", emoji: "🐟", kcal: 500, protein: 45, carbs: 30, fat: 15 },
  { key: "saudavel", label: "Saudável / Fit", emoji: "🥗", kcal: 480, protein: 38, carbs: 45, fat: 12 },
  { key: "italiana", label: "Italiana", emoji: "🍝", kcal: 780, protein: 30, carbs: 95, fat: 28 },
  { key: "marmita", label: "Marmita", emoji: "🍱", kcal: 650, protein: 38, carbs: 68, fat: 18 },
];

const SIZES = [
  { key: "pouco", label: "Pouco", emoji: "🐦", multiplier: 0.65 },
  { key: "normal", label: "Normal", emoji: "😊", multiplier: 1.0 },
  { key: "bastante", label: "Bastante", emoji: "😋", multiplier: 1.35 },
  { key: "exagerei", label: "Exagerei", emoji: "😅", multiplier: 1.7 },
];

const MEAL_TIMES = [
  { key: "cafe_manha", label: "Café da manhã", emoji: "☕" },
  { key: "almoco", label: "Almoço", emoji: "🍽️" },
  { key: "lanche_tarde", label: "Lanche", emoji: "🥤" },
  { key: "jantar", label: "Jantar", emoji: "🌙" },
];

type Step = "category" | "size" | "photo" | "meal_time";

interface EatOutFlowProps {
  onClose: () => void;
}

const EatOutFlow = ({ onClose }: EatOutFlowProps) => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [selectedSize, setSelectedSize] = useState<typeof SIZES[0] | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aiComment, setAiComment] = useState("");
  const [aiAdjusted, setAiAdjusted] = useState(false);
  const [adjustedMacros, setAdjustedMacros] = useState<{ kcal: number; protein: number; carbs: number; fat: number } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getMacros = () => {
    if (!selectedCategory || !selectedSize) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    if (aiAdjusted && adjustedMacros) return adjustedMacros;
    const m = selectedSize.multiplier;
    return {
      kcal: Math.round(selectedCategory.kcal * m),
      protein: Math.round(selectedCategory.protein * m),
      carbs: Math.round(selectedCategory.carbs * m),
      fat: Math.round(selectedCategory.fat * m),
    };
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      setPhotoPreview(base64Full);
      const base64Data = base64Full.split(",")[1];
      if (!base64Data || !selectedCategory || !selectedSize) return;

      setAiLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("analyze-meal", {
          body: {
            mode: "photo",
            imageBase64: base64Data,
            profileContext: `Categoria informada: ${selectedCategory.label}, Tamanho: ${selectedSize.label}`,
          },
        });
        if (error) throw error;
        if (data?.foods?.length) {
          const totalFromAi = {
            kcal: data.foods.reduce((s: number, f: any) => s + (f.kcal || 0), 0),
            protein: data.foods.reduce((s: number, f: any) => s + (f.protein || 0), 0),
            carbs: data.foods.reduce((s: number, f: any) => s + (f.carbs || 0), 0),
            fat: data.foods.reduce((s: number, f: any) => s + (f.fat || 0), 0),
          };
          const foodNames = data.foods.map((f: any) => f.name).join(", ");
          const estimatedMacros = getMacros();
          const diff = Math.abs(totalFromAi.kcal - estimatedMacros.kcal);

          if (diff > 200) {
            setAiComment(`Percebi que tem bastante ${foodNames} — ajustei a estimativa para refletir melhor o que você comeu.`);
            setAdjustedMacros(totalFromAi);
            setAiAdjusted(true);
          } else {
            setAiComment(`Identifiquei no seu prato: ${foodNames}. Isso bate com ${selectedCategory.label} que você escolheu — confirmando os macros estimados.`);
          }
        } else {
          setAiComment("Não consegui identificar bem, mas registrei a foto para o coach ver 😊");
        }
      } catch {
        setAiComment("Não consegui identificar bem, mas registrei a foto para o coach ver 😊");
      }
      setAiLoading(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveMeal = async (mealType: string) => {
    if (!user || !selectedCategory || !selectedSize) return;
    setSaving(true);
    const macros = getMacros();

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

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      meal_type: mealType,
      total_kcal: macros.kcal,
      total_protein: macros.protein,
      total_carbs: macros.carbs,
      total_fat: macros.fat,
      photo_url: photoUrl,
      confirmed: true,
      notes: `🍴 Comi fora — ${selectedCategory.label} (${selectedSize.label})`,
      food_names: [`${selectedCategory.emoji} ${selectedCategory.label}`],
    });

    if (!error) {
      // Update XP & streak
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

      // Show final feedback
      const vet = profile?.vet_kcal || 2000;
      const remaining = vet - macros.kcal;
      if (remaining > 0) {
        toast.success(`✅ Registrado! Você ainda tem ~${Math.round(remaining)}kcal disponíveis hoje. Próxima refeição: foco em proteína/vegetais. +10 XP ⚡`);
      } else {
        toast.success(`✅ Registrado! Você ficou ~${Math.round(Math.abs(remaining))}kcal acima da meta hoje. Amanhã voltamos 100% ao plano — sem drama. 🙌 +10 XP ⚡`);
      }
      navigate("/dashboard");
    } else {
      toast.error("Erro ao salvar refeição");
    }
    setSaving(false);
  };

  const macros = getMacros();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (step === "category") onClose();
            else if (step === "size") setStep("category");
            else if (step === "photo") setStep("size");
            else if (step === "meal_time") setStep("photo");
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">🍴 Comi Fora</h2>
          <p className="text-[10px] font-mono text-muted-foreground">
            {step === "category" && "Etapa 1/4 — Categoria"}
            {step === "size" && "Etapa 2/4 — Tamanho"}
            {step === "photo" && "Etapa 3/4 — Foto (opcional)"}
            {step === "meal_time" && "Etapa 4/4 — Horário"}
          </p>
        </div>
      </div>

      {/* Step 1: Category */}
      <AnimatePresence mode="wait">
        {step === "category" && (
          <motion.div key="cat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-3">Onde você comeu?</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setSelectedCategory(cat); setStep("size"); }}
                  className={`p-3 rounded-xl border text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
                    selectedCategory?.key === cat.key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="text-2xl block mb-1">{cat.emoji}</span>
                  <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">~{cat.kcal} kcal</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Size */}
        {step === "size" && (
          <motion.div key="size" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-1">
              {selectedCategory?.emoji} {selectedCategory?.label} — Quanto você comeu?
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {SIZES.map(size => {
                const est = selectedCategory ? Math.round(selectedCategory.kcal * size.multiplier) : 0;
                return (
                  <button
                    key={size.key}
                    onClick={() => { setSelectedSize(size); setStep("photo"); }}
                    className="p-4 rounded-xl border border-border bg-card text-center transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="text-3xl block mb-1">{size.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{size.label}</span>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">~{est} kcal</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Photo */}
        {step === "photo" && (
          <motion.div key="photo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-3">Quer registrar uma foto do prato? 📸</p>

            {/* Macros preview */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "Kcal", value: macros.kcal },
                { label: "Prot", value: macros.protein, unit: "g" },
                { label: "Carb", value: macros.carbs, unit: "g" },
                { label: "Fat", value: macros.fat, unit: "g" },
              ].map(m => (
                <div key={m.label} className="rounded-xl border border-border bg-card p-2 text-center">
                  <span className="text-[10px] text-muted-foreground font-mono">{m.label}</span>
                  <p className="text-sm font-bold font-mono text-foreground">{m.value}{m.unit || ""}</p>
                </div>
              ))}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />

            {photoPreview ? (
              <div className="relative mb-3">
                <img src={photoPreview} alt="Foto da refeição" className="w-full h-48 object-cover rounded-xl border border-border" />
                <button onClick={() => { setPhotoPreview(null); setAiComment(""); setAiAdjusted(false); setAdjustedMacros(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => fileInputRef.current?.click()} className="py-4 rounded-xl border-2 border-dashed border-primary/30 bg-card hover:bg-primary/5 transition-all flex flex-col items-center gap-1.5">
                  <Camera className="w-6 h-6 text-primary" />
                  <span className="text-xs font-semibold text-foreground">📷 Tirar foto</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="py-4 rounded-xl border-2 border-dashed border-primary/30 bg-card hover:bg-primary/5 transition-all flex flex-col items-center gap-1.5">
                  <ImageIcon className="w-6 h-6 text-primary" />
                  <span className="text-xs font-semibold text-foreground">🖼️ Galeria</span>
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="rounded-xl border border-primary/30 bg-card p-4 text-center mb-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Analisando foto com IA...</p>
              </div>
            )}

            {aiComment && !aiLoading && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-3">
                <p className="text-xs text-foreground leading-relaxed">✨ {aiComment}</p>
              </div>
            )}

            <button
              onClick={() => setStep("meal_time")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              {photoPreview ? "Continuar" : "Pular →"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 4: Meal time */}
        {step === "meal_time" && (
          <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-3">Qual refeição foi?</p>

            {/* Final macros */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "Kcal", value: macros.kcal },
                { label: "Prot", value: macros.protein, unit: "g" },
                { label: "Carb", value: macros.carbs, unit: "g" },
                { label: "Fat", value: macros.fat, unit: "g" },
              ].map(m => (
                <div key={m.label} className="rounded-xl border border-border bg-card p-2 text-center">
                  <span className="text-[10px] text-muted-foreground font-mono">{m.label}</span>
                  <p className="text-sm font-bold font-mono text-foreground">{m.value}{m.unit || ""}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MEAL_TIMES.map(mt => (
                <button
                  key={mt.key}
                  onClick={() => saveMeal(mt.key)}
                  disabled={saving}
                  className="p-4 rounded-xl border border-border bg-card text-center transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                >
                  <span className="text-2xl block mb-1">{mt.emoji}</span>
                  <span className="text-sm font-semibold text-foreground">{mt.label}</span>
                </button>
              ))}
            </div>

            {saving && (
              <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Salvando...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EatOutFlow;
