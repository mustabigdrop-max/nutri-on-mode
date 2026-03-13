import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useChatHistory, Msg } from "@/hooks/useChatHistory";
import { useMealHistory } from "@/hooks/useMealHistory";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import { ArrowLeft, Send, Sparkles, Bot, Plus, Loader2 } from "lucide-react";
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
          objetivo: profile?.objetivo_principal || profile?.goal || "saude_geral",
          perfilPCA: profile?.perfil_comportamental || "",
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

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center relative">
            <Sparkles className="w-4 h-4 text-primary" />
            {/* Online pulse */}
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">NutriCoach MCE</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-[10px] text-accent font-mono">Online</p>
              <span className="text-[9px] text-muted-foreground font-mono">· Comportamental · NutriSync</span>
            </div>
          </div>
        </div>
        <button
          onClick={startNewConversation}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          title="Nova conversa"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <ChatEmptyState
            userName={profile?.full_name?.split(" ")[0] || ""}
            onSuggestionClick={setInput}
          />
        ) : (
          messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1 block">NutriCoach MCE</span>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">analisando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 py-3 border-t border-border bg-background/95 backdrop-blur">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Pergunte ao NutriCoach..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-all relative overflow-hidden group"
          >
            <Send className="w-5 h-5 relative z-10" />
            {input.trim() && !isLoading && (
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" }} />
            )}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ChatPage;
