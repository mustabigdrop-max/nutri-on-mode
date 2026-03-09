import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Loader2, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const EVENT_TYPES = [
  { key: "churrasco", emoji: "🥩", label: "Churrasco" },
  { key: "festa", emoji: "🍕", label: "Festa / aniversário" },
  { key: "jantar_fora", emoji: "🍷", label: "Jantar fora / restaurante" },
  { key: "viagem", emoji: "🏖️", label: "Viagem / final de semana fora" },
  { key: "data_comemorativa", emoji: "🎄", label: "Data comemorativa" },
  { key: "happy_hour", emoji: "🍺", label: "Happy hour / confraternização" },
  { key: "outro", emoji: "📝", label: "Outro" },
];

const INTENTIONS = [
  { key: "aproveitar", emoji: "😋", label: "Quero aproveitar sem culpa" },
  { key: "equilibrio", emoji: "⚖️", label: "Quero aproveitar mas com equilíbrio" },
  { key: "manter", emoji: "💪", label: "Quero manter o plano mesmo assim" },
];

const DATE_OPTIONS = [
  { key: "today", label: "Hoje" },
  { key: "tomorrow", label: "Amanhã" },
  { key: "custom", label: "Escolher data" },
];

type Step = "type" | "date" | "intention" | "loading" | "strategy";

const EventModePage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("type");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [intention, setIntention] = useState("");
  const [strategy, setStrategy] = useState<{ pre: string; day: string; post: string } | null>(null);

  const getDateValue = () => {
    const today = new Date();
    if (eventDate === "today") return today.toISOString().split("T")[0];
    if (eventDate === "tomorrow") {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    }
    return customDate;
  };

  const daysUntilEvent = () => {
    const d = new Date(getDateValue());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((d.getTime() - today.getTime()) / 86400000));
  };

  const generateStrategy = async () => {
    if (!user) return;
    setStep("loading");

    try {
      const { data, error } = await supabase.functions.invoke("generate-event-strategy", {
        body: {
          userId: user.id,
          eventType,
          eventDate: getDateValue(),
          intention,
          daysUntil: daysUntilEvent(),
          kcalTarget: profile?.vet_kcal || 2000,
          proteinTarget: profile?.protein_g || 150,
          objetivo: profile?.objetivo_principal || "saude_geral",
        },
      });

      if (error) throw error;

      const strat = {
        pre: data?.pre_strategy || "Aumente proteína em 15% e reduza carboidrato refinado nos dias anteriores. Hidratação: mínimo 3L/dia.",
        day: data?.day_strategy || "Comece pela proteína no evento. Prato de salada primeiro. Água entre cada bebida. Registre depois com 'Comi fora'.",
        post: data?.post_strategy || "Próximas 48h: foco em proteína e vegetais. Reduza sódio. Água 3L+. Retome o plano base sem compensação excessiva.",
      };

      setStrategy(strat);

      // Save event
      await supabase.from("special_events").insert({
        user_id: user.id,
        event_type: eventType,
        event_date: getDateValue(),
        intention,
        pre_strategy: strat.pre,
        day_strategy: strat.day,
        post_strategy: strat.post,
      } as any);

      setStep("strategy");
    } catch {
      toast.error("Erro ao gerar estratégia");
      setStep("intention");
    }
  };

  const selectType = (key: string) => {
    setEventType(key);
    setStep("date");
  };

  const selectDate = (key: string) => {
    setEventDate(key);
    if (key !== "custom") setStep("intention");
  };

  const selectIntention = (key: string) => {
    setIntention(key);
    generateStrategy();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step === "type" ? navigate("/dashboard") : setStep(step === "date" ? "type" : step === "intention" ? "date" : "type")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">📅 Modo Evento</h1>
            <p className="text-[10px] font-mono text-muted-foreground">Estratégia inteligente pré/durante/pós</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Event Type */}
          {step === "type" && (
            <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm font-mono text-foreground mb-4">Que tipo de evento?</p>
              <div className="space-y-2">
                {EVENT_TYPES.map(e => (
                  <button
                    key={e.key}
                    onClick={() => selectType(e.key)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
                  >
                    <span className="text-2xl">{e.emoji}</span>
                    <span className="text-sm font-mono text-foreground">{e.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date */}
          {step === "date" && (
            <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm font-mono text-foreground mb-4">Quando é o evento?</p>
              <div className="space-y-2 mb-4">
                {DATE_OPTIONS.map(d => (
                  <button
                    key={d.key}
                    onClick={() => selectDate(d.key)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${eventDate === d.key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}
                  >
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm font-mono text-foreground">{d.label}</span>
                    {eventDate === d.key && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
              {eventDate === "custom" && (
                <div className="mb-4">
                  <input
                    type="date"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-3 rounded-xl border border-border bg-card text-foreground font-mono text-sm"
                  />
                  {customDate && (
                    <button
                      onClick={() => setStep("intention")}
                      className="w-full mt-3 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-bold"
                    >
                      Continuar →
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Intention */}
          {step === "intention" && (
            <motion.div key="intention" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-sm font-mono text-foreground mb-4">Qual sua intenção para o evento?</p>
              <div className="space-y-2">
                {INTENTIONS.map(i => (
                  <button
                    key={i.key}
                    onClick={() => selectIntention(i.key)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
                  >
                    <span className="text-2xl">{i.emoji}</span>
                    <span className="text-sm font-mono text-foreground">{i.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-sm font-mono text-foreground">Montando sua estratégia...</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">IA analisando seu perfil e o evento</p>
            </motion.div>
          )}

          {/* Strategy Result */}
          {step === "strategy" && strategy && (
            <motion.div key="strategy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-3xl">🎉</span>
                <h2 className="text-lg font-bold text-foreground mt-2">Estratégia Pronta!</h2>
                <p className="text-xs font-mono text-muted-foreground">
                  {EVENT_TYPES.find(e => e.key === eventType)?.emoji} {EVENT_TYPES.find(e => e.key === eventType)?.label} — {daysUntilEvent() === 0 ? "Hoje" : `em ${daysUntilEvent()} dia(s)`}
                </p>
              </div>

              {/* Phase 1: Pre */}
              {daysUntilEvent() > 0 && (
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-accent font-mono">FASE 1 — PRÉ-EVENTO</span>
                    <span className="text-[10px] font-mono text-muted-foreground">({daysUntilEvent()} dia(s) antes)</span>
                  </div>
                  <p className="text-xs text-foreground font-mono whitespace-pre-line leading-relaxed">{strategy.pre}</p>
                </div>
              )}

              {/* Phase 2: Day */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-primary font-mono">FASE 2 — DIA DO EVENTO</span>
                </div>
                <p className="text-xs text-foreground font-mono whitespace-pre-line leading-relaxed">{strategy.day}</p>
              </div>

              {/* Phase 3: Post */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-foreground font-mono">FASE 3 — PÓS-EVENTO</span>
                  <span className="text-[10px] font-mono text-muted-foreground">(48h seguintes)</span>
                </div>
                <p className="text-xs text-foreground font-mono whitespace-pre-line leading-relaxed">{strategy.post}</p>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-bold"
              >
                Voltar ao Dashboard ✅
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default EventModePage;
