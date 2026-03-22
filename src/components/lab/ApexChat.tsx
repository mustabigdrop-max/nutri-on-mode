import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Microscope, Loader2, Bookmark, ExternalLink, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_UID = "70e51469-1acf-4df6-afe6-f094d21db122";

interface ApexMessage {
  role: "user" | "assistant";
  content: string;
  fontes?: string[];
  perplexityUsed?: boolean;
}

interface ApexChatProps {
  initialQuestion?: string;
}

const ApexChat = ({ initialQuestion }: ApexChatProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ApexMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coachMode, setCoachMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  const isAdmin = user?.id === ADMIN_UID;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialQuestion && !initialSent.current) {
      initialSent.current = true;
      sendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ApexMessage = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const profileContext = profile ? {
        nome: profile.full_name || "Usuário",
        objetivo: profile.goal || profile.objetivo_principal || "saude_geral",
        peso: profile.weight_kg,
        peso_meta: profile.meta_peso,
        macros: { kcal: profile.vet_kcal, protein: profile.protein_g, carbs: profile.carbs_g, fat: profile.fat_g },
        protocolo: profile.active_protocol,
        restricoes: profile.dietary_restrictions,
        condicoes: profile.health_conditions,
        glp1: profile.uses_glp1,
      } : {};

      const { data, error } = await supabase.functions.invoke("apex-scientific", {
        body: {
          question: text.trim(),
          profileContext,
          history: messages.slice(-6),
          coachMode: isAdmin && coachMode,
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

      // Save to lab_conversations
      if (user) {
        await supabase.from("lab_conversations").insert({
          user_id: user.id,
          pergunta: text.trim(),
          resposta: assistantMsg.content,
          fontes: assistantMsg.fontes,
          perplexity_usado: assistantMsg.perplexityUsed,
          intent_type: isAdmin && coachMode ? "coach_elite" : "standard",
        });
      }
    } catch (e: any) {
      console.error("APEX error:", e);
      toast.error("Erro ao conectar com o APEX. Tente novamente.");
    }
    setIsLoading(false);
  };

  const saveToNotebook = async (msg: ApexMessage) => {
    if (!user) return;
    await supabase.from("lab_saved_items").insert({
      user_id: user.id,
      tipo: "resposta",
      titulo: messages.find(m => m.role === "user")?.content?.slice(0, 80) || "Resposta APEX",
      conteudo: { question: messages[messages.indexOf(msg) - 1]?.content, answer: msg.content, fontes: msg.fontes },
      tags: ["apex"],
    });
    toast.success("Salvo no seu caderno!");
  };

  return (
    <div className="flex flex-col h-full">
      {/* APEX Header */}
      <div className={`px-4 py-3 border-b border-border ${coachMode && isAdmin ? "bg-red-950/20" : "bg-[hsl(38_80%_52%/0.03)]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${coachMode && isAdmin ? "bg-red-500/15 border border-red-500/20" : "bg-primary/15 border border-primary/20"}`}>
            {coachMode && isAdmin ? (
              <Shield className="w-5 h-5 text-red-400" />
            ) : (
              <Microscope className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground">
              {coachMode && isAdmin ? "APEX ELITE COACH 🔒" : "APEX — Agente Científico nutriON"}
            </h2>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${coachMode && isAdmin ? "bg-red-400" : "bg-accent"}`} />
              <span className="text-[10px] font-mono" style={{ color: coachMode && isAdmin ? "hsl(0 60% 60%)" : undefined }}>
                {coachMode && isAdmin ? "Coach Mode — Acesso Total Farmacológico" : "Online — Conectado a base científica 2025"}
              </span>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setCoachMode(prev => !prev); setMessages([]); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                coachMode
                  ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {coachMode ? "⚡ COACH ON" : "🔓 Coach"}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-3">
            {coachMode && isAdmin ? (
              <>
                <Shield className="w-12 h-12 text-red-400/30 mx-auto" />
                <p className="text-sm text-red-400/60">APEX ELITE COACH — Modo Admin</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Protocolos hormonais completos, TPC, GH, insulina, SARMs, manipulação avançada.
                  Informação de elite para decisões de coaching.
                </p>
              </>
            ) : (
              <>
                <Microscope className="w-12 h-12 text-primary/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Faça uma pergunta científica ao APEX</p>
              </>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${coachMode && isAdmin ? "bg-red-500/20" : "bg-primary/20"}`}>
                {coachMode && isAdmin ? (
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Microscope className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3" : ""}`}>
              {msg.role === "assistant" ? (
                <div>
                  <span className={`text-[9px] font-mono uppercase tracking-wider mb-1 block ${coachMode && isAdmin ? "text-red-400" : "text-primary"}`}>
                    {coachMode && isAdmin ? "APEX COACH" : "APEX"}
                  </span>
                  <div className={`rounded-2xl rounded-bl-md bg-card border px-4 py-3 space-y-3 ${coachMode && isAdmin ? "border-red-500/20" : "border-border"}`}>
                    {msg.perplexityUsed && (
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${coachMode && isAdmin ? "bg-red-500/10 border-red-500/20" : "bg-primary/10 border-primary/20"}`}>
                        <span className={`text-[10px] font-mono ${coachMode && isAdmin ? "text-red-400" : "text-primary"}`}>📎 Baseado em {msg.fontes?.length || 0} estudos</span>
                      </div>
                    )}
                    <div className="prose prose-sm prose-invert max-w-none text-sm
                      [&_p]:mb-2 [&_ul]:mb-2 [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-sm [&_h3]:font-bold
                      [&_code]:bg-secondary [&_code]:text-accent [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
                      [&_ul]:list-none [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-primary [&_ul_li]:before:mr-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.fontes && msg.fontes.length > 0 && (
                      <div className="border-t border-border pt-2 mt-2 space-y-1">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">Fontes</p>
                        {msg.fontes.slice(0, 5).map((f, fi) => (
                          <a key={fi} href={f} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            {f}
                          </a>
                        ))}
                      </div>
                    )}
                    <button onClick={() => saveToNotebook(msg)}
                      className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors mt-1">
                      <Bookmark className="w-3 h-3" /> Salvar no meu caderno →
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
          <div className="flex gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${coachMode && isAdmin ? "bg-red-500/20" : "bg-primary/20"}`}>
              {coachMode && isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Microscope className="w-3.5 h-3.5 text-primary" />
              )}
            </div>
            <div>
              <span className={`text-[9px] font-mono uppercase tracking-wider mb-1 block ${coachMode && isAdmin ? "text-red-400" : "text-primary"}`}>
                {coachMode && isAdmin ? "APEX COACH" : "APEX"}
              </span>
              <div className={`bg-card border rounded-2xl rounded-bl-md px-4 py-3 ${coachMode && isAdmin ? "border-red-500/20" : "border-border"}`}>
                <div className="flex items-center gap-2">
                  <Loader2 className={`w-4 h-4 animate-spin ${coachMode && isAdmin ? "text-red-400" : "text-primary"}`} />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {coachMode && isAdmin ? "analisando protocolos avançados..." : "pesquisando e analisando..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`px-4 py-3 pb-20 border-t bg-background/95 backdrop-blur ${coachMode && isAdmin ? "border-red-500/20" : "border-border"}`}>
        <div className="flex gap-2 max-w-lg mx-auto">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder={coachMode && isAdmin ? "Pergunte ao APEX Coach (modo admin)..." : "Pergunte ao APEX..."}
            className={`flex-1 px-4 py-3 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
              coachMode && isAdmin ? "border-red-500/20 focus:ring-red-500/50" : "border-border focus:ring-primary/50"
            }`} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className={`w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all ${
              coachMode && isAdmin ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"
            }`}>
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApexChat;
