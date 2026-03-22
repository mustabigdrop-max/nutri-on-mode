import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Shield, Loader2, Bookmark, ExternalLink, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

interface ApexMessage {
  role: "user" | "assistant";
  content: string;
  fontes?: string[];
  perplexityUsed?: boolean;
}

const AdminApexCoachPage = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [messages, setMessages] = useState<ApexMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [atletaRef, setAtletaRef] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Guard: only admin
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ApexMessage = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const profileContext = profile ? {
        nome: profile.full_name || "Coach Diogo",
        objetivo: profile.goal || profile.objetivo_principal || "coaching",
        peso: profile.weight_kg,
        peso_meta: profile.meta_peso,
        macros: profile.vet_kcal ? { kcal: profile.vet_kcal, protein: profile.protein_g, carbs: profile.carbs_g, fat: profile.fat_g } : undefined,
        protocolo: profile.active_protocol,
        restricoes: profile.dietary_restrictions,
        condicoes: profile.health_conditions,
        glp1: profile.uses_glp1,
      } : {};

      const { data, error } = await supabase.functions.invoke("apex-scientific", {
        body: {
          question: text.trim(),
          profileContext,
          history: messages.slice(-10),
          coachMode: true,
        },
      });

      if (error) throw error;

      const assistantMsg: ApexMessage = {
        role: "assistant",
        content: data?.answer || "Sem resposta.",
        fontes: data?.citations || [],
        perplexityUsed: data?.perplexityUsed || false,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Log to coach_apex_log
      await supabase.from("coach_apex_log" as any).insert({
        admin_id: user.id,
        pergunta: text.trim(),
        resposta: assistantMsg.content,
        atleta_ref: atletaRef || null,
      });
    } catch (e: any) {
      console.error("APEX Coach error:", e);
      toast.error("Erro ao conectar com o APEX Coach.");
    }
    setIsLoading(false);
  };

  const saveToNotebook = async (msg: ApexMessage) => {
    await supabase.from("lab_saved_items").insert({
      user_id: user.id,
      tipo: "coach_resposta",
      titulo: messages.find(m => m.role === "user")?.content?.slice(0, 80) || "APEX Coach",
      conteudo: { question: messages[messages.indexOf(msg) - 1]?.content, answer: msg.content, fontes: msg.fontes, atleta: atletaRef },
      tags: ["apex-coach", "admin"],
    });
    toast.success("Salvo no caderno!");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-red-900/40 bg-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <Shield className="w-5.5 h-5.5 text-red-400" />
            </div>
            <div>
              <h1 className="text-sm font-black text-red-400 tracking-widest uppercase">
                APEX ELITE COACH — PAINEL PRIVADO
              </h1>
              <p className="text-[10px] text-red-500/60 font-mono mt-0.5">
                Protocolos hormonais • Farmacologia avançada • Coaching de elite
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-950/50 border border-red-800/40">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider">
                Acesso Restrito — Admin Only
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Athlete reference bar */}
      <div className="flex-shrink-0 px-6 py-2 border-b border-red-900/20 bg-red-950/10">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-red-400/60 uppercase">Atleta ref:</span>
          <input
            type="text"
            value={atletaRef}
            onChange={e => setAtletaRef(e.target.value)}
            placeholder="Nome do atleta (opcional, para log)"
            className="flex-1 max-w-xs px-3 py-1 text-xs bg-transparent border border-red-900/30 rounded text-red-300 placeholder:text-red-900/50 focus:outline-none focus:border-red-500/40"
          />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <Shield className="w-16 h-16 text-red-500/20 mx-auto" />
            <h2 className="text-lg font-bold text-red-400/40">APEX ELITE COACH</h2>
            <p className="text-xs text-red-500/30 max-w-md mx-auto leading-relaxed">
              Protocolos hormonais completos: Testosterona, Nandrolona, Trembolona, Oxandrolona, Winstrol, GH, Insulina, IGF-1, SARMs, Clenbuterol, T3.
              Protocolos de proteção: cardio, hepática, renal, TPC, HPTA restart.
              Peak week, manipulação de água/sódio, glicerina, intra-treino avançado.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                "Protocolo TPC pós-trembolona + deca",
                "Peak week Classic Physique completo",
                "Stack intra-treino para atleta enhanced",
                "Protocolo GH + Insulina para offseason",
                "Manejo de prolactina elevada com 19-nors",
              ].map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 text-[10px] font-mono text-red-400/60 border border-red-900/30 rounded-lg hover:bg-red-950/30 hover:text-red-400 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-4 h-4 text-red-400" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-red-600 text-white px-4 py-3" : ""}`}>
              {msg.role === "assistant" ? (
                <div>
                  <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1 block">
                    APEX COACH
                  </span>
                  <div className="rounded-2xl rounded-bl-md bg-zinc-950 border border-red-900/30 px-5 py-4 space-y-3">
                    {msg.perplexityUsed && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <span className="text-[10px] font-mono text-red-400">📎 {msg.fontes?.length || 0} estudos</span>
                      </div>
                    )}
                    <div className="prose prose-sm prose-invert max-w-none text-sm text-zinc-300
                      [&_p]:mb-2 [&_ul]:mb-2 [&_strong]:text-red-400 [&_h3]:text-red-400 [&_h3]:text-sm [&_h3]:font-bold [&_h2]:text-red-400 [&_h2]:text-base
                      [&_code]:bg-zinc-900 [&_code]:text-red-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
                      [&_ul]:list-none [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-red-500 [&_ul_li]:before:mr-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.fontes && msg.fontes.length > 0 && (
                      <div className="border-t border-red-900/20 pt-2 mt-2 space-y-1">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Fontes</p>
                        {msg.fontes.slice(0, 5).map((f, fi) => (
                          <a key={fi} href={f} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-red-400/60 hover:text-red-400 truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            {f}
                          </a>
                        ))}
                      </div>
                    )}
                    <button onClick={() => saveToNotebook(msg)}
                      className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 hover:text-red-400 transition-colors mt-1">
                      <Bookmark className="w-3 h-3" /> Salvar →
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
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1 block">APEX COACH</span>
              <div className="bg-zinc-950 border border-red-900/30 rounded-2xl rounded-bl-md px-5 py-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                  <span className="text-[10px] font-mono text-zinc-500">analisando protocolos avançados...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-red-900/30 bg-black">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Pergunte ao APEX Coach (protocolos, TPC, farmacologia, peak week...)"
            className="flex-1 px-4 py-3.5 rounded-xl border border-red-900/30 bg-zinc-950 text-zinc-200 text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500/40" />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className="w-13 h-13 rounded-xl bg-red-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-red-500 transition-all">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminApexCoachPage;
