import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useCircadian } from "@/hooks/useCircadian";
import CircadianOnboarding from "@/components/circadian/CircadianOnboarding";
import CircadianTimeline from "@/components/circadian/CircadianTimeline";
import CircadianMealCard from "@/components/circadian/CircadianMealCard";
import CortisolIndicator from "@/components/circadian/CortisolIndicator";

const parseTime = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

const CircadianPage = () => {
  const navigate = useNavigate();
  const { profile, plan, loading, generating, saveProfile, generatePlan } = useCircadian();
  const [savingProfile, setSavingProfile] = useState(false);

  const handleOnboardingComplete = async (data: any) => {
    setSavingProfile(true);
    try {
      const result = await saveProfile(data);
      if (result?.error) throw result.error;
      toast.success("Perfil circadiano salvo! 🌅");
      // Auto-generate plan
      try {
        await generatePlan();
        toast.success("Plano circadiano gerado com sucesso! ✨");
      } catch {
        toast.error("Erro ao gerar plano. Tente novamente.");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar perfil");
    }
    setSavingProfile(false);
  };

  const handleRegenerate = async () => {
    try {
      await generatePlan();
      toast.success("Plano circadiano atualizado! 🔄");
    } catch {
      toast.error("Erro ao regenerar plano.");
    }
  };

  // Find next meal
  const nextMealIndex = useMemo(() => {
    if (!plan?.meals?.length) return -1;
    const now = new Date();
    const currentH = now.getHours() + now.getMinutes() / 60;
    return plan.meals.findIndex(m => parseTime(m.time) > currentH);
  }, [plan]);

  // Next meal countdown
  const nextMealCountdown = useMemo(() => {
    if (nextMealIndex < 0 || !plan?.meals?.[nextMealIndex]) return null;
    const mealTime = parseTime(plan.meals[nextMealIndex].time);
    const now = new Date();
    const currentH = now.getHours() + now.getMinutes() / 60;
    const diff = mealTime - currentH;
    const hours = Math.floor(diff);
    const mins = Math.round((diff - hours) * 60);
    return { hours, mins, label: plan.meals[nextMealIndex].label };
  }, [nextMealIndex, plan]);

  // Current circadian phase
  const currentPhase = useMemo(() => {
    if (!profile) return null;
    const now = new Date();
    const h = now.getHours();
    const wake = parseTime(profile.wake_time);
    const hoursAwake = h - wake;

    if (hoursAwake >= 0 && hoursAwake < 4) return "🌅 Janela de maior sensibilidade à insulina";
    if (h >= 12 && h < 14) return "☀️ Janela principal — refeição mais calórica";
    if (h >= 15 && h < 17) return "⚡ Pico energético vespertino — ideal pré-treino";
    if (h >= 20) return "🌙 Janela noturna — priorize proteína e triptofano";
    return "⏳ Fase de transição metabólica";
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-foreground">🌅 Nutrição Circadiana</h1>
            <p className="text-[10px] text-muted-foreground">Crono-otimização alimentar</p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 max-w-lg mx-auto">
        {/* No profile — show onboarding */}
        {!profile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5"
          >
            <div className="text-center mb-4">
              <span className="text-4xl">🌅</span>
              <h2 className="text-lg font-bold text-foreground mt-2">Configure seu Relógio Biológico</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Otimize macros, horários e refeições baseado no seu cronotipo
              </p>
            </div>
            <CircadianOnboarding onComplete={handleOnboardingComplete} saving={savingProfile} />
          </motion.div>
        ) : (
          <>
            {/* Phase banner */}
            {currentPhase && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl border border-orange-400/20 bg-orange-400/5 text-center"
              >
                <p className="text-sm font-semibold text-foreground">{currentPhase}</p>
                {nextMealCountdown && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Próxima refeição em <b className="text-orange-400">{nextMealCountdown.hours}h {nextMealCountdown.mins}min</b> — {nextMealCountdown.label}
                  </p>
                )}
              </motion.div>
            )}

            {/* Chronotype badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {profile.chronotype === "matutino" ? "🌅" : profile.chronotype === "vespertino" ? "🌙" : "☀️"}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground capitalize">{profile.chronotype}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {profile.wake_time} — {profile.sleep_time} · {profile.meal_frequency}x/dia
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-orange-400 px-2 py-1 rounded-full border border-orange-400/20 bg-orange-400/5">
                🌅 Circadiano Ativo
              </span>
            </div>

            {/* 24h Timeline */}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <h3 className="text-xs font-bold text-foreground mb-3 text-center">Mapa Circadiano 24h</h3>
              <CircadianTimeline
                wakeTime={profile.wake_time}
                sleepTime={profile.sleep_time}
                meals={plan?.meals || []}
              />
            </div>

            {/* Cortisol Indicator */}
            <CortisolIndicator />

            {/* AI Message */}
            {plan?.ai_message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl border border-orange-400/20 bg-gradient-to-r from-orange-500/5 to-amber-500/5"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground leading-relaxed">{plan.ai_message}</p>
                </div>
              </motion.div>
            )}

            {/* Meal Cards */}
            {plan?.meals?.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Plano do Dia</h3>
                  <button
                    onClick={handleRegenerate}
                    disabled={generating}
                    className="flex items-center gap-1 text-[10px] text-orange-400 font-semibold disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Regenerar
                  </button>
                </div>

                {/* Totals summary */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Calorias", val: `${plan.total_calories}`, unit: "kcal", color: "text-orange-400" },
                    { label: "Proteína", val: `${plan.total_protein}`, unit: "g", color: "text-emerald-400" },
                    { label: "Carbs", val: `${plan.total_carbs}`, unit: "g", color: "text-yellow-400" },
                    { label: "Gordura", val: `${plan.total_fat}`, unit: "g", color: "text-amber-400" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 rounded-lg bg-secondary">
                      <p className={`text-sm font-bold font-mono ${s.color}`}>{s.val}<span className="text-[8px] text-muted-foreground">{s.unit}</span></p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {plan.meals.map((meal, i) => (
                  <CircadianMealCard
                    key={i}
                    meal={meal}
                    index={i}
                    isNext={i === nextMealIndex}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">Nenhum plano gerado ainda</p>
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_20px_hsl(24_95%_53%/0.3)] disabled:opacity-50"
                >
                  {generating ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</span>
                  ) : (
                    "🌅 Gerar Plano Circadiano"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CircadianPage;
