import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImageIcon, ArrowRight, Loader2, X, ArrowLeft, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MOODS = [
  { key: "otimo", label: "Ótimo, mereci!", emoji: "😊" },
  { key: "normal", label: "Normal, faz parte", emoji: "😐" },
  { key: "culpado", label: "Me sinto culpado", emoji: "😟" },
  { key: "skip", label: "Prefiro não responder", emoji: "🤐" },
];

const MEAL_TIMES = [
  { key: "cafe_manha", label: "Café da manhã", emoji: "☕" },
  { key: "almoco", label: "Almoço", emoji: "🍽️" },
  { key: "lanche_tarde", label: "Lanche", emoji: "🥤" },
  { key: "jantar", label: "Jantar", emoji: "🌙" },
  { key: "extra", label: "Extra / fora do plano", emoji: "➕" },
];

type Step = "confirm" | "photo" | "mood" | "guilt_response" | "meal_time";

interface FreeMealFlowProps {
  onClose: () => void;
}

const FreeMealFlow = ({ onClose }: FreeMealFlowProps) => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("confirm");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aiComment, setAiComment] = useState("");
  const [aiEstimatedKcal, setAiEstimatedKcal] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [saving, setSaving] = useState(false);

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
      try {
        const { data, error } = await supabase.functions.invoke("analyze-meal", {
          body: {
            mode: "photo",
            imageBase64: base64Data,
            profileContext: "Refeição livre — análise gentil, sem julgamento",
          },
        });
        if (error) throw error;
        if (data?.foods?.length) {
          const totalKcal = data.foods.reduce((s: number, f: any) => s + (f.kcal || 0), 0);
          setAiEstimatedKcal(totalKcal);
          setAiComment(`Pelo que vejo, parece uma refeição de ~${totalKcal} kcal. Não vou contar isso contra você — só registrei para o coach ter contexto. 😊`);
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
    if (!user) return;
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

    const moodLabel = MOODS.find(m => m.key === selectedMood)?.label || "";

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      meal_type: mealType === "extra" ? "lanche_tarde" : mealType,
      total_kcal: aiEstimatedKcal || 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      photo_url: photoUrl,
      confirmed: true,
      emotion: moodLabel || null,
      notes: `🎉 Refeição Livre${moodLabel ? ` — ${moodLabel}` : ""}`,
      food_names: ["🎉 Refeição Livre"],
    });

    if (!error) {
      // Update XP & streak — free meal does NOT break streak
      const currentXp = profile?.xp || 0;
      const newXp = currentXp + 5;
      const today = new Date().toISOString().split("T")[0];
      const lastDate = profile?.last_streak_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let newStreak = profile?.streak_days || 0;
      if (lastDate !== today) {
        newStreak = lastDate === yesterday ? newStreak + 1 : 1;
      }
      await updateProfile({ xp: newXp, streak_days: newStreak, last_streak_date: today });

      // Final feedback
      const isWeightLoss = profile?.goal?.toLowerCase().includes("emag") || profile?.objetivo_principal?.toLowerCase().includes("emag");
      if (isWeightLoss) {
        toast.success("✅ Registrado! Dica: beba bastante água hoje e priorize proteína na próxima refeição. Isso ajuda a retomar o metabolismo. +5 XP");
      } else {
        toast.success("✅ Registrado! Equilíbrio também é parte do plano. +5 XP 🎉");
      }
      navigate("/dashboard");
    } else {
      toast.error("Erro ao salvar refeição");
    }
    setSaving(false);
  };

  const getStepBack = (): Step | null => {
    switch (step) {
      case "confirm": return null;
      case "photo": return "confirm";
      case "mood": return "photo";
      case "guilt_response": return "mood";
      case "meal_time": return selectedMood === "culpado" ? "guilt_response" : "mood";
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            const prev = getStepBack();
            if (prev) setStep(prev);
            else onClose();
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">🎉 Refeição Livre</h2>
          <p className="text-[10px] font-mono text-muted-foreground">Sem julgamento, com registro</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Confirm */}
        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-4">
              <span className="text-4xl block mb-3">🎉</span>
              <h3 className="text-base font-bold text-foreground mb-2">Refeição livre registrada!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Isso faz parte do processo — equilíbrio também é parte do plano.
              </p>
            </div>
            <button
              onClick={() => setStep("photo")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Photo */}
        {step === "photo" && (
          <motion.div key="photo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-3">
              Quer registrar o momento? 📸 Fotos ajudam o coach a entender seu contexto e te dar um suporte mais humano.
            </p>

            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />

            {photoPreview ? (
              <div className="relative mb-3">
                <img src={photoPreview} alt="Foto" className="w-full h-48 object-cover rounded-xl border border-border" />
                <button onClick={() => { setPhotoPreview(null); setAiComment(""); setAiEstimatedKcal(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground">
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
                <p className="text-xs text-muted-foreground">Analisando foto...</p>
              </div>
            )}

            {aiComment && !aiLoading && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-3">
                <p className="text-xs text-foreground leading-relaxed">✨ {aiComment}</p>
              </div>
            )}

            <button
              onClick={() => setStep("mood")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
            >
              {photoPreview ? "Continuar" : "Pular →"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 3: Mood */}
        {step === "mood" && (
          <motion.div key="mood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-3">Como você está se sentindo? (opcional)</p>
            <div className="space-y-2">
              {MOODS.map(mood => (
                <button
                  key={mood.key}
                  onClick={() => {
                    setSelectedMood(mood.key);
                    if (mood.key === "culpado") {
                      setStep("guilt_response");
                    } else {
                      setStep("meal_time");
                    }
                  }}
                  className="w-full p-3 rounded-xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:bg-primary/5 flex items-center gap-3"
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-sm font-semibold text-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Guilt response */}
        {step === "guilt_response" && (
          <motion.div key="guilt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                Sentir culpa depois de comer é muito comum, mas não precisa ser assim. Uma refeição não define seu progresso — o que importa é o padrão ao longo do tempo. Você está aqui, registrando, e isso já é consistência. 💪
              </p>
              <p className="text-sm text-muted-foreground mt-3">Quer conversar sobre isso com seu coach?</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  toast.success("Coach notificado! Ele entrará em contato em breve. 💙");
                  setStep("meal_time");
                }}
                className="py-3 rounded-xl border border-primary bg-primary/10 text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Sim, avisar
              </button>
              <button
                onClick={() => setStep("meal_time")}
                className="py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-secondary transition-all"
              >
                Não, tudo bem
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Meal time */}
        {step === "meal_time" && (
          <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-3">Essa refeição livre foi no lugar de qual refeição do plano?</p>
            <div className="space-y-2">
              {MEAL_TIMES.map(mt => (
                <button
                  key={mt.key}
                  onClick={() => saveMeal(mt.key)}
                  disabled={saving}
                  className="w-full p-3 rounded-xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 flex items-center gap-3"
                >
                  <span className="text-xl">{mt.emoji}</span>
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

export default FreeMealFlow;
