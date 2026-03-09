import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Pencil, Camera, Sparkles, Loader2, Check, ChevronRight, Flame, Zap } from "lucide-react";
import { toast } from "sonner";

type RegisterMode = "voice" | "text" | "photo" | null;

interface ExtractedMeal {
  foods: Array<{ name: string; portion: string; kcal: number; protein: number; carbs: number; fat: number }>;
  total_kcal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_type: string | null;
  feedback: string;
}

const FirstMealScreen = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [mode, setMode] = useState<RegisterMode>(null);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extraction, setExtraction] = useState<ExtractedMeal | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const firstName = profile?.full_name?.split(" ")[0] || "Piloto";
  const kcalTarget = profile?.vet_kcal || 2000;
  const proteinTarget = profile?.protein_g || 150;

  const handleTextSubmit = async () => {
    if (!input.trim() || !user) return;
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal", {
        body: { userId: user.id, description: input, mealType: "almoco" },
      });

      if (error) throw error;

      const foods = data?.foods || [];
      const totals = {
        total_kcal: foods.reduce((s: number, f: any) => s + (f.kcal || 0), 0),
        total_protein: foods.reduce((s: number, f: any) => s + (f.protein || 0), 0),
        total_carbs: foods.reduce((s: number, f: any) => s + (f.carbs || 0), 0),
        total_fat: foods.reduce((s: number, f: any) => s + (f.fat || 0), 0),
      };

      // Save meal log
      await supabase.from("meal_logs").insert({
        user_id: user.id,
        meal_type: data?.meal_type || "almoco",
        food_names: foods.map((f: any) => f.name),
        total_kcal: totals.total_kcal,
        total_protein: totals.total_protein,
        total_carbs: totals.total_carbs,
        total_fat: totals.total_fat,
        confirmed: true,
      });

      setExtraction({
        foods,
        ...totals,
        meal_type: data?.meal_type || "almoco",
        feedback: data?.feedback || "Registrado! Agora sei por onde começar. 💪",
      });

      // Mark first meal and activation metrics
      await updateProfile({ first_meal_registered: true });
      await supabase.from("activation_metrics").upsert({
        user_id: user.id,
        first_meal_at: new Date().toISOString(),
        total_meals_day1: 1,
      }, { onConflict: "user_id" });

      setShowCelebration(true);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    navigate("/activation-tour");
  };

  const handleSkip = () => {
    navigate("/activation-tour");
  };

  // Celebration screen
  if (showCelebration && extraction) {
    const remainingProtein = Math.max(0, proteinTarget - extraction.total_protein);
    const remainingKcal = Math.max(0, kcalTarget - extraction.total_kcal);
    const isProteinLow = extraction.total_protein < 20;

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-grid opacity-10" />

        {/* Confetti-like particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${Math.random() * 60 + 30} 100% 50%)`,
                left: `${Math.random() * 100}%`,
                top: -10,
              }}
              animate={{
                y: [0, window.innerHeight + 20],
                x: [0, (Math.random() - 0.5) * 100],
                rotate: [0, Math.random() * 720],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg space-y-5"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-gold-glow flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <Check className="w-10 h-10 text-primary-foreground" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">🌱 Conquista desbloqueada</p>
              <h1 className="text-xl font-bold text-foreground">Primeira refeição registrada!</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {firstName}, você fez o que 60% das pessoas não fazem: <strong className="text-foreground">começar de verdade.</strong>
              </p>
            </motion.div>
          </motion.div>

          {/* Macros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-primary font-mono">{Math.round(extraction.total_kcal)}</span>
              <span className="text-sm text-muted-foreground ml-1">kcal</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground font-mono">{Math.round(extraction.total_protein)}g</p>
                <p className="text-[10px] text-muted-foreground font-mono">💪 Proteína</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground font-mono">{Math.round(extraction.total_carbs)}g</p>
                <p className="text-[10px] text-muted-foreground font-mono">⚡ Carboidrato</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground font-mono">{Math.round(extraction.total_fat)}g</p>
                <p className="text-[10px] text-muted-foreground font-mono">🔥 Gordura</p>
              </div>
            </div>
          </motion.div>

          {/* Remaining */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-4"
          >
            <p className="text-xs font-mono text-primary uppercase tracking-wider mb-2">Saldo restante do dia</p>
            <div className="flex gap-4">
              <p className="text-sm text-foreground">💪 Faltam <strong>{Math.round(remainingProtein)}g</strong> de proteína</p>
              <p className="text-sm text-foreground">🔥 Faltam <strong>{Math.round(remainingKcal)}</strong> kcal</p>
            </div>
          </motion.div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            {isProteinLow ? (
              <p className="text-sm text-foreground">
                Sua proteína ficou em {Math.round(extraction.total_protein)}g nessa refeição. Na próxima, inclui uma fonte proteica — frango, ovo ou atum resolvem. 💪
              </p>
            ) : (
              <p className="text-sm text-foreground">
                {extraction.feedback || "Ótima escolha de abertura! Continua assim. 💪"}
              </p>
            )}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Explorar o app
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Text input mode
  if (mode === "text") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg space-y-5"
        >
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">O que você comeu?</h2>
            <p className="text-sm text-muted-foreground">Pode ser simples: "frango com arroz e salada"</p>
          </div>

          <div className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: café com leite, pão com queijo e uma banana..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm resize-none"
              autoFocus
            />
            <button
              onClick={handleTextSubmit}
              disabled={!input.trim() || isProcessing}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isProcessing ? "Analisando..." : "Registrar"}
            </button>
            <button
              onClick={() => setMode(null)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Voice mode (simplified - opens text for now since browser audio API is complex)
  if (mode === "voice") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg space-y-5"
        >
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">🎙️ Me conta o que você comeu!</h2>
            <p className="text-sm text-muted-foreground">
              Pode ser simples, sem detalhes. Digite o que diria em voz alta.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ex: "Hoje almocei frango com arroz e salada, tomei bastante água"'
              className="w-full h-32 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm resize-none"
              autoFocus
            />
            <button
              onClick={handleTextSubmit}
              disabled={!input.trim() || isProcessing}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isProcessing ? "Analisando..." : "Registrar"}
            </button>
            <button
              onClick={() => setMode(null)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Photo mode placeholder
  if (mode === "photo") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg space-y-5 text-center"
        >
          <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">📸 Foto do prato</h2>
          <p className="text-sm text-muted-foreground">
            A análise por foto estará disponível em breve. Use a opção de texto por enquanto!
          </p>
          <button
            onClick={() => setMode("text")}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold"
          >
            Usar texto
          </button>
          <button
            onClick={() => setMode(null)}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </button>
        </motion.div>
      </div>
    );
  }

  // Main selection screen
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-7 h-7 text-primary" />
          </motion.div>
          <h1 className="text-xl font-bold text-foreground font-[family-name:var(--font-display)] mb-2">
            Seu plano está pronto, {firstName}! 🎯
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Antes de explorar o app: <strong className="text-foreground">uma coisa só</strong> — leva 30 segundos.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Me conta o que você comeu mais recentemente. Pode ser o café de hoje, o almoço, um lanche — qualquer coisa.
          </p>
          <p className="text-xs text-primary font-mono mt-3">
            Isso ativa sua IA e ela começa a trabalhar por você agora.
          </p>
        </div>

        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setMode("voice")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-primary/30 bg-primary/5 transition-all hover:scale-[1.02] active:scale-[0.98] text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-gold-glow flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-sm">🎙️ Falar é mais rápido</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Registrar por voz</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setMode("text")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border bg-card transition-all hover:scale-[1.02] active:scale-[0.98] text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Pencil className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-sm">✍️ Prefiro digitar</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Escreva o que comeu</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setMode("photo")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border bg-card transition-all hover:scale-[1.02] active:scale-[0.98] text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-sm">📷 Tirar foto do prato</h3>
              <p className="text-xs text-muted-foreground mt-0.5">IA identifica os alimentos</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Skip button - small and discrete */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Explorar o app primeiro →
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FirstMealScreen;
