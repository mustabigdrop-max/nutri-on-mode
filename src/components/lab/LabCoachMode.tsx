import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Shield, Loader2, Bookmark, ExternalLink, Users, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanGate } from "@/hooks/usePlanGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CoachMessage {
  role: "user" | "assistant";
  content: string;
  fontes?: string[];
  perplexityUsed?: boolean;
}

interface LabCoachModeProps {
  onAskApex?: (q: string) => void;
}

const QUICK_QUESTIONS = [
  "Protocolo de periodização nutricional para atleta em cutting",
  "Stack de suplementação para otimizar recuperação pós-treino",
  "Estratégia nutricional para reverter adaptação metabólica",
  "Protocolo de peak week para competição de physique",
  "Abordagem nutricional para aluno com resistência insulínica",
];

const LabCoachMode = ({ onAskApex }: LabCoachModeProps) => {
  const { user } = useAuth();
  const { plan, role, hasAccess } = usePlanGate();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alunoRef, setAlunoRef] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCoachOrPro = role === "coach" || role === "admin" || hasAccess("ON PRO");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!isCoachOrPro) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary/40" />
        </div>
        <h3 className="text-base font-bold text-foreground">Modo Coach</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Recurso exclusivo para coaches ON PRO. Gere respostas científicas formatadas para enviar aos seus clientes.
        </p>
      </div>
    );
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;
    const userMsg: CoachMessage = { role: "user", content: text.trim() };
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
        },
      });

      if (error) throw error;

      const assistantMsg: CoachMessage = {
        role: "assistant",
        content: data?.answer || "Sem resposta.",
        fontes: data?.citations || [],
        perplexityUsed: data?.perplexityUsed || false,
      };
      setMessages(prev => [...prev, assistantMsg]);

      await supabase.from("coach_apex_sessions" as any).insert({
        admin_id: user.id,
        pergunta: text.trim(),
        resposta: assistantMsg.content,
        atleta_nome: alunoRef || null,
        tema: "lab_coach",
      });
    } catch (e) {
      console.error("Coach mode error:", e);
      toast.error("Erro ao conectar com o APEX Coach.");
    }
    setIsLoading(false);
  };

  const saveToNotebook = async (msg: CoachMessage) => {
    if (!user) return;
    const idx = messages.indexOf(msg);
    await supabase.from("lab_saved_items").insert({
      user_id: user.id,
      tipo: "coach_resposta",
      titulo: messages[idx - 1]?.content?.slice(0, 80) || "Coach Mode",
      conteudo: {
        question: messages[idx - 1]?.content,
        answer: msg.content,
        fontes: msg.fontes,
        aluno: alunoRef,
      },
      tags: ["coach-mode", "lab"],
    });
    toast.success("Salvo no caderno!");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Aluno ref bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Cliente:</span>
          </div>
          <Input
            type="text"
            value={alunoRef}
            onChange={e => setAlunoRef(e.target.value)}
            placeholder="Nome do cliente (opcional)"
            className="flex-1 max-w-xs h-7 text-xs bg-transparent border-border"
          />
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7 text-primary/30" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground/60">MODO COACH</h2>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                Gere respostas científicas formatadas para enviar aos seus clientes.
                O APEX atua como seu assistente técnico com referências e protocolos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-md mx-auto">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 text-[10px] font-mono text-muted-foreground border border-border rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all text-left"
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
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5" : ""}`}>
              {msg.role === "assistant" ? (
                <div>
                  <span className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1 block">
                    APEX COACH {alunoRef && `→ ${alunoRef}`}
                  </span>
                  <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3 space-y-2">
                    {msg.perplexityUsed && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-[10px] font-mono text-primary">📎 {msg.fontes?.length || 0} estudos</span>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none text-sm text-foreground/90
                      [&_p]:mb-2 [&_ul]:mb-2 [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-sm [&_h3]:font-bold [&_h2]:text-primary [&_h2]:text-base
                      [&_code]:bg-muted [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.fontes && msg.fontes.length > 0 && (
                      <div className="border-t border-border pt-2 mt-2 space-y-1">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">Fontes</p>
                        {msg.fontes.slice(0, 5).map((f, fi) => (
                          <a key={fi} href={f} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-primary/60 hover:text-primary truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            {f}
                          </a>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => saveToNotebook(msg)}
                      className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors mt-1"
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
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1 block">APEX COACH</span>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-[10px] font-mono text-muted-foreground">gerando protocolo...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Pergunte ao APEX Coach (protocolos, suplementação, periodização...)"
            className="flex-1 h-10 text-sm"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="w-10 h-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LabCoachMode;
