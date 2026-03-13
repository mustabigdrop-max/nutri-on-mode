import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useChatHistory, Msg } from "@/hooks/useChatHistory";
import { useMealHistory } from "@/hooks/useMealHistory";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Brain, Plus, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nutri-coach`;

const ChatPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { messages, setMessages, saveMessage, startNewConversation, loadingHistory } = useChatHistory();
  const mealHistoryContext = useMealHistory();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-send agent prompt from AgentsPage
  useEffect(() => {
    const agentPrompt = sessionStorage.getItem("nutrion-agent-prompt");
    if (agentPrompt && !loadingHistory) {
      sessionStorage.removeItem("nutrion-agent-prompt");
      setInput(agentPrompt);
      setTimeout(() => {
        setInput(agentPrompt);
        const sendPrompt = async () => {
          const text = agentPrompt.trim();
          if (!text) return;
          const userMsg: Msg = { role: "user", content: text };
          setMessages(prev => [...prev, userMsg]);
          setInput("");
          setIsLoading(true);
          await saveMessage(userMsg);
          let assistantSoFar = "";
          const upsertAssistant = (chunk: string) => {
            assistantSoFar += chunk;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          };
          try {
            const resp = await fetch(CHAT_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
              body: JSON.stringify({ messages: [userMsg], profileContext, mealHistoryContext, objetivo: profile?.objetivo_principal || "saude_geral", perfilComportamental: profile?.perfil_comportamental || "" }),
            });
            if (resp.ok && resp.body) {
              const reader = resp.body.getReader();
              const decoder = new TextDecoder();
              let textBuffer = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                textBuffer += decoder.decode(value, { stream: true });
                let newlineIndex: number;
                while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
                  let line = textBuffer.slice(0, newlineIndex);
                  textBuffer = textBuffer.slice(newlineIndex + 1);
                  if (line.endsWith("\r")) line = line.slice(0, -1);
                  if (line.startsWith(":") || line.trim() === "") continue;
                  if (!line.startsWith("data: ")) continue;
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr === "[DONE]") break;
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) upsertAssistant(content);
                  } catch { break; }
                }
              }
              if (assistantSoFar) await saveMessage({ role: "assistant", content: assistantSoFar });
            }
          } catch (e) { console.error(e); }
          setIsLoading(false);
        };
        sendPrompt();
      }, 300);
    }
  }, [loadingHistory]);

  const profileContext = profile ? [
    `Nome: ${profile.full_name || "Usuário"}`,
    `Sexo: ${profile.sex || "N/I"}`,
    `Peso: ${profile.weight_kg || "N/I"}kg, Altura: ${profile.height_cm || "N/I"}cm`,
    `Objetivo: ${profile.goal || "N/I"}`,
    `Atividade: ${profile.activity_level || "N/I"}, Treino: ${profile.training_frequency || 0}x/sem`,
    `Metas: ${profile.vet_kcal}kcal, ${profile.protein_g}g prot, ${profile.carbs_g}g carb, ${profile.fat_g}g fat`,
    `GLP-1: ${profile.uses_glp1 ? "Sim" : "Não"}`,
    `Protocolo: ${profile.active_protocol || "Padrão"}`,
    `Restrições: ${profile.dietary_restrictions?.join(", ") || "Nenhuma"}`,
    `Condições: ${profile.health_conditions?.join(", ") || "Nenhuma"}`,
    `Streak: ${profile.streak_days || 0} dias, Level: ${profile.level || 1}, XP: ${profile.xp || 0}`,
  ].join("; ") : "";

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Save user message
    await saveMessage(userMsg);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          profileContext,
          mealHistoryContext,
          objetivo: profile?.objetivo_principal || "saude_geral",
          perfilComportamental: profile?.perfil_comportamental || "",
        }),
      });

      if (resp.status === 429) { toast.error("Muitas mensagens. Aguarde um momento."); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes."); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Erro na conexão");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save complete assistant message
      if (assistantSoFar) {
        await saveMessage({ role: "assistant", content: assistantSoFar });
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao conectar com o coach");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header — professional NutriCoach MCE */}
      <div className="relative z-10 border-b border-border bg-background/98 backdrop-blur">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            {/* Agent avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-primary" />
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">NutriCoach MCE</h1>
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono bg-primary/10 text-primary border border-primary/20">
                  IA
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <p className="text-[9px] text-muted-foreground font-mono truncate">
                  {isLoading ? "Analisando seu perfil..." : "Motor Comportamental Especializado · online"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={startNewConversation}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
            title="Nova conversa"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Expertise strip */}
        {messages.length === 0 && (
          <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {["Comportamental", "Macros", "TCC", "Periodização", "Suplementos"].map(tag => (
              <span key={tag} className="whitespace-nowrap px-2 py-0.5 rounded-full text-[8px] font-mono bg-card border border-border text-muted-foreground flex-shrink-0">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <ChatEmptyState
            userName={profile?.full_name?.split(" ")[0] || ""}
            onSuggestionClick={text => { setInput(text); setTimeout(() => send(), 50); }}
          />
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={i}
              msg={msg}
              isLast={i === messages.length - 1 && msg.role === "assistant"}
            />
          ))
        )}

        {/* Thinking indicator */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-1">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <p className="text-[8px] font-mono text-primary/60 uppercase tracking-wider mb-1.5 font-bold">
                NutriCoach MCE
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 150, 300].map(delay => (
                    <motion.span
                      key={delay}
                      className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: delay / 1000 }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">analisando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 py-3 border-t border-border bg-background/98 backdrop-blur">
        <div className="flex gap-2 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Pergunte ao NutriCoach MCE..."
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
            {input.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Zap className="w-3.5 h-3.5 text-primary/50" />
              </motion.div>
            )}
          </div>
          <motion.button
            onClick={send}
            disabled={!input.trim() || isLoading}
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-all"
            style={{ boxShadow: input.trim() && !isLoading ? "0 0 16px hsl(var(--primary) / 0.3)" : "none" }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
        <p className="text-center text-[8px] font-mono text-muted-foreground/30 mt-1.5">
          NutriCoach MCE · responde com base no seu protocolo e histórico
        </p>
      </div>
      <BottomNav />
    </div>
  );
};

export default ChatPage;
