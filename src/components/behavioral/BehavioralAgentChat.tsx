import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Brain, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useBehavioral } from "@/hooks/useBehavioral";
import { toast } from "sonner";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGESTOES = [
  "Acabei de comer fora do protocolo e me sinto culpado",
  "Não consigo manter a consistência nos fins de semana",
  "Estou perto da minha meta mas sinto que vou sabotar",
  "Não tenho motivação para treinar hoje",
  "Como lidar com o estresse sem comer?",
];

export default function BehavioralAgentChat() {
  const { user } = useAuth();
  const { profile: userProfile } = useProfile();
  const { profile: behavProfile, diary, loops } = useBehavioral();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const diarySummary = diary.slice(0, 5).map(d =>
      `${d.emocao_primaria || "?"} (${d.emocao_intensidade}/10) — ${d.o_que_aconteceu || "sem detalhe"} — Aprendizado: ${d.o_que_aprendi || "nenhum"}`
    ).join("\n") || "Sem registros recentes.";

    const loopsSummary = loops.slice(0, 5).map(l =>
      `[${l.ativo ? "ATIVO" : "INATIVO"}] Gatilho: ${l.gatilho} → Antiga: ${l.rotina_antiga} → Nova: ${l.rotina_nova} (${l.vezes_sucesso}/${l.vezes_ativado} sucesso)`
    ).join("\n") || "Sem loops mapeados.";

    return {
      nome: userProfile?.full_name || "Usuário",
      perfil_primario: behavProfile?.perfil_primario || "",
      perfil_secundario: behavProfile?.perfil_secundario || "",
      estagio_mudanca: behavProfile?.estagio_mudanca || "",
      streak_atual: behavProfile?.streak_atual || 0,
      votos_identidade: behavProfile?.votos_identidade || 0,
      taxa_aderencia_geral: behavProfile?.taxa_aderencia_geral || 0,
      risco_abandono: behavProfile?.risco_abandono || 0,
      declaracao_identidade: behavProfile?.declaracao_identidade || "",
      crencas_limitantes: behavProfile?.crencas_limitantes || [],
      horarios_criticos: behavProfile?.horarios_criticos || [],
      dias_criticos: behavProfile?.dias_criticos || [],
      situacoes_risco: behavProfile?.situacoes_risco || [],
      objetivo: userProfile?.goal || userProfile?.objetivo_principal || "",
      diary_summary: diarySummary,
      loops_summary: loopsSummary,
    };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/behavioral-agent`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.slice(-10),
          profileContext: buildContext(),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${resp.status}`);
      }

      if (!resp.body) throw new Error("Sem resposta");

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error("Behavioral agent error:", e);
      toast.error(e.message || "Erro ao conectar com o agente");
      setMessages(prev => prev.filter(m => m !== userMsg));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[65vh] rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Coach Comportamental MCE</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-muted-foreground">
                {behavProfile?.perfil_primario
                  ? `Perfil: ${behavProfile.perfil_primario.replace(/_/g, " ")}`
                  : "Online — pronto para ajudar"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-4">
            <Brain className="w-10 h-10 text-primary/30 mx-auto" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Seu coach comportamental te conhece.</p>
              <p className="text-[10px] text-muted-foreground">Baseado na Metodologia MCE + seus dados reais.</p>
            </div>
            <div className="space-y-1.5">
              {SUGESTOES.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-border text-[10px] text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-all">
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-3 h-3 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user"
              ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3 py-2"
              : "rounded-2xl rounded-bl-md bg-muted/50 border border-border px-3 py-2"}`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none text-xs
                  [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-xs [&_h3]:font-bold
                  [&_ul]:list-none [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-primary [&_ul_li]:before:mr-1.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-3 h-3 text-primary" />
            </div>
            <div className="bg-muted/50 border border-border rounded-2xl rounded-bl-md px-3 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                <span className="text-[10px] text-muted-foreground">analisando seu perfil...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-border bg-background/95">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder="Conte como você está..."
            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
