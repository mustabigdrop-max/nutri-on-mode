import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { Send, Zap, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`;

const BLOCK_LABELS = [
  "Identidade & Objetivo",
  "Histórico Alimentar",
  "Nutrição Comportamental",
  "Estilo de Vida & Treino",
  "Suporte & Contexto",
];

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, athlete: 1.9,
};

const calcGEB = (weight: number, height: number, age: number, sex: string) => {
  if (sex === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

const calcMacros = (get: number, goal: string, weight: number, usesGlp1: boolean) => {
  let vet = get;
  let proteinPerKg = 1.6;
  switch (goal) {
    case "lose_weight": vet = get - 500; proteinPerKg = 2.0; break;
    case "gain_muscle": vet = get + 350; proteinPerKg = 2.2; break;
    case "definition": vet = get - 500; proteinPerKg = 2.2; break;
    case "performance": vet = get + 250; proteinPerKg = 2.0; break;
    case "glp1": vet = get - 400; proteinPerKg = 2.2; break;
  }
  if (usesGlp1) proteinPerKg = Math.max(proteinPerKg, 2.0);
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(1);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const { updateProfile } = useProfile();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasStarted = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // Start conversation automatically
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      sendToAI([{ role: "user", content: "Olá! Quero começar meu perfil nutricional." }], true);
    }
  }, []);

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
          currentBlock,
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

            // Handle text content
            if (delta.content) {
              assistantContent += delta.content;
              updateAssistant(assistantContent);
            }

            // Handle tool calls
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
            if (args.block < 5) {
              setCurrentBlock(args.block + 1);
            }
          } else if (tc.name === "finalize_onboarding") {
            setIsFinished(true);
            // Show strategies in chat
            const strategiesText = args.strategies?.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n") || "";
            const finalMsg = `${args.summary}\n\n**Suas 3 estratégias priorizadas:**\n${strategiesText}\n\n✨ Clique no botão abaixo para ativar seu modo ON!`;
            assistantContent += (assistantContent ? "\n\n" : "") + finalMsg;
            updateAssistant(assistantContent);
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
    const d = collectedData;
    const weight = d.weight_kg || 70;
    const height = d.height_cm || 170;
    const birthDate = d.date_of_birth ? new Date(d.date_of_birth) : new Date(1990, 0, 1);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const sex = d.sex || "male";
    const goal = d.goal || "health";
    const activityLevel = d.activity_level || "moderate";
    const usesGlp1 = d.uses_glp1 || goal === "glp1";

    const geb = calcGEB(weight, height, age, sex);
    const factor = ACTIVITY_FACTORS[activityLevel] || 1.55;
    const get = geb * factor;
    const { vet, protein, carbs, fat } = calcMacros(get, goal, weight, usesGlp1);

    const error = await updateProfile({
      full_name: d.full_name || null,
      date_of_birth: d.date_of_birth || null,
      sex,
      weight_kg: weight,
      height_cm: height,
      goal,
      activity_level: activityLevel,
      training_frequency: d.training_frequency || null,
      sport: d.sport || null,
      dietary_restrictions: d.dietary_restrictions?.length ? d.dietary_restrictions : null,
      health_conditions: d.health_conditions?.length ? d.health_conditions : null,
      uses_glp1: usesGlp1,
      geb_kcal: Math.round(geb),
      get_kcal: Math.round(get),
      vet_kcal: vet,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      active_protocol: d.behavioral_profile || null,
      onboarding_completed: true,
    });

    if (error) {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } else {
      toast.success("Perfil configurado! Bem-vindo ao modo ON 🔥");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-15" />

      {/* Header with block progress */}
      <div className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground font-[family-name:var(--font-display)]">nutriON Coach</h1>
              <p className="text-xs text-muted-foreground font-mono">Onboarding inteligente</p>
            </div>
          </div>
          {/* Block progress */}
          <div className="flex gap-1">
            {BLOCK_LABELS.map((label, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-500 ${
                  i + 1 < currentBlock ? "bg-primary" :
                  i + 1 === currentBlock ? "bg-primary/60" :
                  "bg-border"
                }`} />
                <p className={`text-[9px] mt-1 font-mono truncate ${
                  i + 1 <= currentBlock ? "text-primary" : "text-muted-foreground"
                }`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat messages */}
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

      {/* Input area */}
      <div className="relative z-10 border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {isFinished ? (
            <button
              onClick={handleFinalize}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:scale-[1.02] glow-gold flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Ativar modo ON
            </button>
          ) : (
            <div className="flex gap-2">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
