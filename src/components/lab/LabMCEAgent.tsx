import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Brain, Loader2, Bookmark, ExternalLink, Sparkles } from "lucide-react";
import VoiceRecorderButton from "@/components/ui/VoiceRecorderButton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MCEMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  usedResearch?: boolean;
}

interface LabMCEAgentProps {
  onAskApex?: (q: string) => void;
}

const QUICK_PROMPTS = [
  "Saí do protocolo ontem — me ajuda a entender por quê",
  "Quero construir minha declaração de identidade alimentar",
  "Mapear meus gatilhos emocionais com comida",
  "Como criar implementation intentions pro meu plano?",
  "Creatina tem evidência forte pra performance?",
];

const QUICK_ACTIONS = [
  { emoji: "🧠", label: "Diagnóstico de Identidade", prompt: "Quero fazer o diagnóstico completo de identidade alimentar. Me guie pelas 5 perguntas do framework MCE." },
  { emoji: "🔄", label: "Mapear Habit Loop", prompt: "Me ajuda a mapear meu Habit Loop alimentar completo: CUE → ROTINA → RECOMPENSA. Vamos identificar o que realmente dispara meus comportamentos." },
  { emoji: "⚡", label: "Implementation Intention", prompt: "Quero criar 3 implementation intentions concretas para os meus principais gatilhos alimentares desta semana." },
  { emoji: "📊", label: "Análise Semanal MCE", prompt: "Faz minha análise semanal MCE completa: evidências de identidade, padrões de CUE detectados, e define o foco comportamental da próxima semana." },
  { emoji: "🛡️", label: "Plano Anti-Sabotagem", prompt: "Identifique meus 3 maiores pontos de sabotagem alimentar e monte um plano de prevenção com rotinas substitutas para cada um." },
  { emoji: "🎯", label: "Design de Ambiente", prompt: "Me ajude a redesenhar meu ambiente usando os 4 princípios de James Clear (óbvio, atraente, fácil, satisfatório) aplicados à minha alimentação." },
  { emoji: "💬", label: "Coaching de Crise", prompt: "Estou prestes a sair do protocolo agora. Me ajuda a processar o que estou sentindo e tomar uma decisão consciente." },
  { emoji: "🔬", label: "Evidência Científica", prompt: "Quero entender a ciência por trás do MCE: quais estudos validam essa abordagem comportamental para nutrição?" },
];

const LabMCEAgent = ({ onAskApex }: LabMCEAgentProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<MCEMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: MCEMessage = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("mce-agent", {
        body: {
          userMessage: text.trim(),
          userId: user?.id,
          history: messages.slice(-10),
        },
      });

      if (error) throw error;

      const assistantMsg: MCEMessage = {
        role: "assistant",
        content: data?.answer || "Sem resposta no momento.",
        citations: data?.citations || [],
        usedResearch: data?.usedResearch || false,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error("MCE error:", e);
      toast.error("Erro ao conectar com o MCE Coach. Tente novamente.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-[hsl(var(--primary)/0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">MCE Coach — Mindset · Comportamento · Execução</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] text-accent font-mono">Online — SDT + Habit Loop + Atomic Habits + Gollwitzer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-5 py-4">
            <div className="text-center space-y-1">
              <Brain className="w-10 h-10 text-primary/30 mx-auto" />
              <p className="text-sm font-semibold text-foreground">MCE Coach</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Mindset · Comportamento · Execução — ciência comportamental aplicada à nutrição.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 px-1">⚡ Ações rápidas</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button key={i} onClick={() => sendMessage(action.prompt)}
                    className="flex items-start gap-2 p-3 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 text-left transition-all group">
                    <span className="text-lg mt-0.5">{action.emoji}</span>
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Prompts */}
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 px-1">💬 Perguntas sugeridas</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-border bg-card hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3" : ""}`}>
              {msg.role === "assistant" ? (
                <div>
                  <span className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1 block">MCE COACH</span>
                  <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3 space-y-3">
                    {msg.usedResearch && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                        <Sparkles className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-mono text-accent">Pesquisa Perplexity — {msg.citations?.length || 0} fontes</span>
                      </div>
                    )}
                    <div className="prose prose-sm prose-invert max-w-none text-sm
                      [&_p]:mb-2 [&_ul]:mb-2 [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-sm [&_h3]:font-bold
                      [&_code]:bg-secondary [&_code]:text-accent [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
                      [&_ul]:list-none [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-primary [&_ul_li]:before:mr-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="border-t border-border pt-2 mt-2 space-y-1">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">Fontes científicas</p>
                        {msg.citations.slice(0, 5).map((f, fi) => (
                          <a key={fi} href={f} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            {f}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1 block">MCE COACH</span>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-[10px] font-mono text-muted-foreground">analisando comportamento...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 pb-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Fale com o MCE Coach..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <VoiceRecorderButton onTranscript={(t) => setInput(prev => prev ? prev + " " + t : t)} disabled={isLoading} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-all">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabMCEAgent;
