import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { Send, Zap, Bot, User, Loader2, Flame, Dumbbell, Leaf, Baby, ChevronRight, Sparkles, Syringe } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Progress } from "@/components/ui/progress";
import Glp1UpsellModal from "@/components/glp1/Glp1UpsellModal";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`;

type Objetivo = "emagrecimento" | "hipertrofia" | "saude_geral" | "infantil";

const GOALS = [
  {
    id: "emagrecimento" as Objetivo,
    icon: Flame,
    label: "EMAGRECER",
    desc: "Perder gordura com inteligência e sem sofrimento",
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-500/10 border-orange-500/30",
    iconColor: "text-orange-400",
  },
  {
    id: "hipertrofia" as Objetivo,
    icon: Dumbbell,
    label: "HIPERTROFIAR",
    desc: "Ganhar massa muscular com nutrição de precisão",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    id: "saude_geral" as Objetivo,
    icon: Leaf,
    label: "SAÚDE GERAL",
    desc: "Comer melhor, ter mais energia e viver com equilíbrio",
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  {
    id: "infantil" as Objetivo,
    icon: Baby,
    label: "MEU FILHO",
    desc: "Nutrição infantil saudável e gostosa para cada fase",
    color: "from-violet-500 to-pink-500",
    bg: "bg-violet-500/10 border-violet-500/30",
    iconColor: "text-violet-400",
  },
];

const STEP_LABELS = [
  "Objetivo",
  "Dados Pessoais",
  "Histórico",
  "Comportamental",
  "Estilo de Vida",
  "Resultado",
];

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, athlete: 1.9,
};

const calcGEB = (weight: number, height: number, age: number, sex: string) => {
  if (sex === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

const calcMacros = (get: number, objetivo: Objetivo, weight: number) => {
  let vet = get;
  let proteinPerKg = 1.6;
  switch (objetivo) {
    case "emagrecimento": vet = get - 500; proteinPerKg = 2.0; break;
    case "hipertrofia": vet = get + 350; proteinPerKg = 2.2; break;
    case "saude_geral": vet = get; proteinPerKg = 1.6; break;
    case "infantil": vet = get; proteinPerKg = 1.2; break;
  }
  const protein = weight * proteinPerKg;
  const fatKcal = vet * 0.25;
  const fat = fatKcal / 9;
  const carbs = (vet - protein * 4 - fatKcal) / 4;
  return { vet: Math.round(vet), protein: Math.round(protein), carbs: Math.round(Math.max(carbs, 50)), fat: Math.round(fat) };
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [resultData, setResultData] = useState<{
    summary: string;
    behavioral_profile?: string;
    strategies?: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showGlp1Upsell, setShowGlp1Upsell] = useState(false);
  const { updateProfile } = useProfile();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // Map step to AI chat block
  const getChatBlock = () => {
    // Steps 2-5 map to chat blocks 1-4
    return step - 1;
  };

  // When objetivo is selected, move to step 2 and start chat
  const handleGoalSelect = (goal: Objetivo) => {
    setObjetivo(goal);
    setStep(2);
  };

  // Auto-start chat when entering step 2
  useEffect(() => {
    if (step === 2 && objetivo && messages.length === 0) {
      const initMsg = objetivo === "infantil"
        ? "Olá! Quero configurar a nutrição do meu filho."
        : "Olá! Quero começar meu perfil nutricional.";
      sendToAI([{ role: "user", content: initMsg }], true);
    }
  }, [step, objetivo]);

  // Focus input when step changes
  useEffect(() => {
    if (step >= 2 && step <= 5) {
      inputRef.current?.focus();
    }
  }, [step, isLoading]);

  const sendToAI = async (chatMessages: ChatMessage[], isInit = false) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
          currentBlock: getChatBlock(),
          objetivo,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) { toast.error("Muitas requisições. Aguarde um momento."); return; }
        if (resp.status === 402) { toast.error("Créditos esgotados."); return; }
        toast.error("Erro ao conectar com a IA.");
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";
      let toolCalls: any[] = [];
      let currentToolCall: any = null;

      const updateAssistant = (text: string) => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: text } : m);
          }
          return [...prev, { role: "assistant", content: text }];
        });
        scrollToBottom();
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            if (delta.content) {
              assistantContent += delta.content;
              updateAssistant(assistantContent);
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.id) {
                  currentToolCall = { id: tc.id, name: tc.function?.name || "", arguments: tc.function?.arguments || "" };
                  toolCalls.push(currentToolCall);
                } else if (currentToolCall) {
                  if (tc.function?.arguments) currentToolCall.arguments += tc.function.arguments;
                  if (tc.function?.name) currentToolCall.name += tc.function.name;
                }
              }
            }
          } catch { /* partial JSON */ }
        }
      }

      // Process tool calls
      for (const tc of toolCalls) {
        try {
          const args = JSON.parse(tc.arguments);
          if (tc.name === "extract_block_data") {
            const newData = { ...collectedData, ...args.data };
            setCollectedData(newData);
            // Advance to next step
            const nextStep = Math.min(step + 1, 6);
            // Skip behavioral step for hipertrofia and infantil
            if (nextStep === 4 && (objetivo === "hipertrofia" || objetivo === "infantil")) {
              setStep(5);
            } else {
              setStep(nextStep);
            }
          } else if (tc.name === "finalize_onboarding") {
            setResultData({
              summary: args.summary,
              behavioral_profile: args.behavioral_profile,
              strategies: args.strategies,
            });
            setStep(6);
          }
        } catch (e) {
          console.error("Tool call parse error:", e);
        }
      }
    } catch (e) {
      console.error("Stream error:", e);
      toast.error("Erro na conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    scrollToBottom();
    sendToAI(newMessages);
  };

  const handleFinalize = async () => {
    setIsSaving(true);
    const d = collectedData;
    const weight = d.weight_kg || 70;
    const height = d.height_cm || 170;
    const birthDate = d.date_of_birth ? new Date(d.date_of_birth) : new Date(1990, 0, 1);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const sex = d.sex || "male";
    const activityLevel = d.activity_level || "moderate";

    const goalMap: Record<Objetivo, string> = {
      emagrecimento: "lose_weight",
      hipertrofia: "gain_muscle",
      saude_geral: "health",
      infantil: "health",
    };

    const geb = calcGEB(weight, height, age, sex);
    const factor = ACTIVITY_FACTORS[activityLevel] || 1.55;
    const get = geb * factor;
    const { vet, protein, carbs, fat } = calcMacros(get, objetivo!, weight);

    // Set trial_ends_at to 7 days from now
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    const error = await updateProfile({
      full_name: d.full_name || null,
      date_of_birth: d.date_of_birth || null,
      sex,
      weight_kg: weight,
      height_cm: height,
      goal: goalMap[objetivo!],
      activity_level: activityLevel,
      training_frequency: d.training_frequency || null,
      sport: d.sport || null,
      dietary_restrictions: d.dietary_restrictions?.length ? d.dietary_restrictions : null,
      health_conditions: d.health_conditions?.length ? d.health_conditions : null,
      uses_glp1: d.uses_glp1 || false,
      geb_kcal: Math.round(geb),
      get_kcal: Math.round(get),
      vet_kcal: vet,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      active_protocol: d.behavioral_profile || null,
      onboarding_completed: true,
      trial_ends_at: trialEnd.toISOString(),
    });

    if (error) {
      toast.error("Erro ao salvar perfil. Tente novamente.");
      setIsSaving(false);
    } else {
      toast.success("Perfil configurado! Bem-vindo ao modo ON 🔥");
      // Navigate to first meal activation screen instead of dashboard
      navigate("/first-meal");
    }
  };

  const progressPct = (step / 6) * 100;

  // ─── STEP 1: Goal Selection ───
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)] mb-2">
              Qual é o seu objetivo?
            </h1>
            <p className="text-sm text-muted-foreground">
              Toda a sua experiência será personalizada com base nessa escolha.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {GOALS.map((g, i) => (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleGoalSelect(g.id)}
                className={`relative flex items-center gap-4 p-5 rounded-2xl border ${g.bg} backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-left group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center flex-shrink-0`}>
                  <g.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm tracking-wide">{g.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </motion.button>
            ))}
          </div>

          <div className="mt-6">
            <Progress value={progressPct} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-center mt-2 font-mono">Passo 1 de 6</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── STEP 6: Result Screen ───
  if (step === 6) {
    const d = collectedData;
    const weight = d.weight_kg || 70;
    const height = d.height_cm || 170;
    const birthDate = d.date_of_birth ? new Date(d.date_of_birth) : new Date(1990, 0, 1);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const sex = d.sex || "male";
    const activityLevel = d.activity_level || "moderate";
    const geb = calcGEB(weight, height, age, sex);
    const factor = ACTIVITY_FACTORS[activityLevel] || 1.55;
    const get = geb * factor;
    const { vet, protein, carbs, fat } = calcMacros(get, objetivo!, weight);
    const goalInfo = GOALS.find(g => g.id === objetivo)!;

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg space-y-5"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${goalInfo.color} flex items-center justify-center mx-auto mb-4`}
            >
              <goalInfo.icon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-xl font-bold text-foreground font-[family-name:var(--font-display)]">
              {d.full_name ? `${d.full_name}, seu plano está pronto!` : "Seu plano está pronto!"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{goalInfo.label}</p>
          </div>

          {/* Macros card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Suas Metas Diárias</h3>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-primary font-mono">{vet}</span>
              <span className="text-sm text-muted-foreground ml-1">kcal/dia</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Proteína", value: `${protein}g`, pct: Math.round((protein * 4 / vet) * 100) },
                { label: "Carboidrato", value: `${carbs}g`, pct: Math.round((carbs * 4 / vet) * 100) },
                { label: "Gordura", value: `${fat}g`, pct: Math.round((fat * 9 / vet) * 100) },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-bold text-foreground font-mono">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{m.label} · {m.pct}%</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Behavioral profile (if applicable) */}
          {resultData?.behavioral_profile && (objetivo === "emagrecimento" || objetivo === "saude_geral") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Perfil Comportamental</h3>
              <p className="text-sm font-bold text-foreground capitalize">{resultData.behavioral_profile.replace("_", " ")}</p>
            </motion.div>
          )}

          {/* Strategies */}
          {resultData?.strategies && resultData.strategies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Suas Primeiras Ações</h3>
              <div className="space-y-2">
                {resultData.strategies.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Summary */}
          {resultData?.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-primary/5 border border-primary/20 rounded-2xl p-4"
            >
              <p className="text-sm text-foreground leading-relaxed">{resultData.summary}</p>
            </motion.div>
          )}

          {/* GLP-1 Upsell trigger */}
          {d.uses_glp1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="rounded-2xl border border-[#00C896]/30 bg-[#00C896]/5 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C896]/20 flex items-center justify-center flex-shrink-0">
                  <Syringe className="w-5 h-5 text-[#00C896]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-1">Você usa GLP-1. Seu protocolo precisa ser diferente.</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Proteja sua massa muscular e evite reganho com o Protocolo GLP-1 Pro — feito para quem usa Ozempic, Wegovy, Mounjaro e similares.
                  </p>
                  <button
                    onClick={() => setShowGlp1Upsell(true)}
                    className="px-4 py-2 rounded-lg bg-[#00C896] text-white text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Conhecer Protocolo GLP-1 Pro →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={handleFinalize}
              disabled={isSaving}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isSaving ? "Salvando..." : "Ativar modo ON"}
            </button>
          </motion.div>

          <Glp1UpsellModal open={showGlp1Upsell} onClose={() => setShowGlp1Upsell(false)} />

          <div>
            <Progress value={100} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-center mt-2 font-mono">Passo 6 de 6 — Completo!</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── STEPS 2-5: Chat Interface ───
  const currentStepLabel = STEP_LABELS[step - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-15" />

      {/* Header */}
      <div className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-sm font-bold text-foreground font-[family-name:var(--font-display)]">nutriON Coach</h1>
              <p className="text-xs text-muted-foreground font-mono">{currentStepLabel}</p>
            </div>
            {objetivo && (
              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${GOALS.find(g => g.id === objetivo)?.bg}`}>
                {GOALS.find(g => g.id === objetivo)?.label}
              </div>
            )}
          </div>
          <Progress value={progressPct} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground font-mono mt-1">Passo {step} de 6</p>
        </div>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border text-foreground rounded-bl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_li]:mb-0.5 [&_ul]:mb-2 [&_strong]:text-primary">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center mt-1">
                    <User className="w-3.5 h-3.5 text-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex-shrink-0 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Digite sua resposta..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
