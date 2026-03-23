import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Zap, Loader2, Bookmark, ExternalLink, Lock, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanGate } from "@/hooks/usePlanGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EliteMessage {
  role: "user" | "assistant";
  content: string;
  fontes?: string[];
  perplexityUsed?: boolean;
}

const QUICK_QUESTIONS = [
  "Peak week completo para Men's Physique — água, sódio, carb load",
  "Protocolo intra-treino avançado para hipertrofia máxima",
  "Estratégia de refeeding pós-competição para evitar rebote",
  "Manipulação de carboidrato e glicerina pré-palco",
  "Stack de suporte hepático e cardiovascular durante prep",
  "Periodização nutricional offseason → prep 16 semanas",
];

const LabApexElite = () => {
  const { user } = useAuth();
  const { hasAccess } = usePlanGate();
  const [messages, setMessages] = useState<EliteMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [atletaRef, setAtletaRef] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const canAccess = hasAccess("ON PRO");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-destructive/40" />
        </div>
        <h3 className="text-base font-bold text-foreground">APEX ELITE</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Modo Atleta & Competição — exclusivo ON PRO. Protocolos avançados de peak week, manipulação hídrica, farmacologia aplicada e preparação para palco.
        </p>
      </div>
    );
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;
    const userMsg: EliteMessage = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("apex-scientific", {
        body: {
          question: text.trim(),
          profileContext: {},
          history: messages.slice(-10),
          coachMode: true,
          eliteMode: true,
        },
      });

      if (error) throw error;

      const assistantMsg: EliteMessage = {
        role: "assistant",
        content: data?.answer || "Sem resposta.",
        fontes: data?.citations || [],
        perplexityUsed: data?.perplexityUsed || false,
      };
      setMessages(prev => [...prev, assistantMsg]);

      await supabase.from("lab_conversations").insert({
        user_id: user.id,
        pergunta: text.trim(),
        resposta: assistantMsg.content,
        fontes: assistantMsg.fontes,
        perplexity_usado: assistantMsg.perplexityUsed,
        intent_type: "apex_elite",
      });
    } catch (e) {
      console.error("APEX Elite error:", e);
      toast.error("Erro ao conectar com o APEX Elite.");
    }
    setIsLoading(false);
  };

  const saveToNotebook = async (msg: EliteMessage) => {
    if (!user) return;
    const idx = messages.indexOf(msg);
    await supabase.from("lab_saved_items").insert({
      user_id: user.id,
      tipo: "elite_protocolo",
      titulo: messages[idx - 1]?.content?.slice(0, 80) || "APEX Elite",
      conteudo: {
        question: messages[idx - 1]?.content,
        answer: msg.content,
        fontes: msg.fontes,
        atleta: atletaRef,
      },
      tags: ["apex-elite", "competicao"],
    });
    toast.success("Salvo no caderno!");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Atleta ref bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-destructive/60" />
            <span className="text-[10px] font-mono text-destructive/60 uppercase">Atleta:</span>
          </div>
          <Input
            type="text"
            value={atletaRef}
            onChange={e => setAtletaRef(e.target.value)}
            placeholder="Nome do atleta (opcional)"
            className="flex-1 max-w-xs h-7 text-xs bg-transparent border-destructive/20 focus-visible:ring-destructive/30"
          />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-destructive/10 border border-destructive/20">
            <Zap className="w-3 h-3 text-destructive" />
            <span className="text-[9px] font-mono font-bold text-destructive uppercase tracking-wider">Elite Mode</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7 text-destructive/40" />
            </div>
            <div>
              <h2 className="text-sm font-black text-destructive/80 tracking-widest uppercase">APEX ELITE</h2>
              <p className="text-[10px] text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                Modo Atleta & Competição. Protocolos hormonais, peak week, manipulação de água/sódio, 
                farmacologia avançada, TPC, suporte hepático/cardiovascular e preparação para palco.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-lg mx-auto">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 text-[10px] font-mono text-destructive/60 border border-destructive/20 rounded-lg hover:bg-destructive/5 hover:text-destructive hover:border-destructive/40 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-destructive/15 border border-destructive/25 flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-3.5 h-3.5 text-destructive" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-destructive text-destructive-foreground px-4 py-2.5" : ""}`}>
              {msg.role === "assistant" ? (
                <div>
                  <span className="text-[9px] font-mono text-destructive uppercase tracking-wider mb-1 block">
                    APEX ELITE {atletaRef && `→ ${atletaRef}`}
                  </span>
                  <div className="rounded-2xl rounded-bl-md bg-card border border-destructive/20 px-4 py-3 space-y-2">
                    {msg.perplexityUsed && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20">
                        <span className="text-[10px] font-mono text-destructive">📎 {msg.fontes?.length || 0} estudos</span>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none text-sm text-foreground/90
                      [&_p]:mb-2 [&_ul]:mb-2 [&_strong]:text-destructive [&_h3]:text-destructive [&_h3]:text-sm [&_h3]:font-bold [&_h2]:text-destructive [&_h2]:text-base
                      [&_code]:bg-muted [&_code]:text-destructive [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
                      [&_ul]:list-none [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-destructive [&_ul_li]:before:mr-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.fontes && msg.fontes.length > 0 && (
                      <div className="border-t border-destructive/15 pt-2 mt-2 space-y-1">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">Fontes</p>
                        {msg.fontes.slice(0, 5).map((f, fi) => (
                          <a key={fi} href={f} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-destructive/60 hover:text-destructive truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            {f}
                          </a>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => saveToNotebook(msg)}
                      className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors mt-1"
                    >
                      <Bookmark className="w-3 h-3" /> Salvar no caderno
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-destructive/15 border border-destructive/25 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-destructive uppercase tracking-wider mb-1 block">APEX ELITE</span>
              <div className="bg-card border border-destructive/20 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-destructive animate-spin" />
                  <span className="text-[10px] font-mono text-muted-foreground">analisando protocolos avançados...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-destructive/20 bg-background">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Peak week, farmacologia, TPC, intra-treino, prep..."
            className="flex-1 h-10 text-sm border-destructive/20 focus-visible:ring-destructive/30"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="w-10 h-10 bg-destructive hover:bg-destructive/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LabApexElite;
