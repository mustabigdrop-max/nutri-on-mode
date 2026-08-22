import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAthleteView } from "@/hooks/useAthleteView";
import { useAthletePlans } from "@/hooks/useAthletePlans";

const BG = "#020205";
const CYAN = "#00D4FF";

interface Message {
  id: string;
  role: "user" | "praxis";
  content: string;
}

const QUICK_ACTIONS = [
  { icon: "🔄", text: "Posso substituir algum alimento?" },
  { icon: "🍽️", text: "Qual minha próxima refeição?" },
  { icon: "💊", text: "Que suplemento tomo agora?" },
  { icon: "🏋️", text: "Qual meu treino de hoje?" },
  { icon: "📊", text: "Como tá minha evolução?" },
  { icon: "🍕", text: "Vou comer fora, o que faço?" },
];

const PraxisPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fullName } = useAthleteView();
  const { mealPlan } = useAthletePlans();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const firstName = (fullName || user?.user_metadata?.full_name || "atleta").split(" ")[0];

  useEffect(() => {
    document.title = "Seu Protocolo · NUTRION";
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const objetivo = mealPlan?.resumo?.objetivo || mealPlan?.objetivo;
    setMessages([
      {
        id: "welcome",
        role: "praxis",
        content: objetivo
          ? `${firstName}, seu protocolo de ${objetivo} está rodando. Pergunta o que precisar.`
          : `${firstName}, seu protocolo está rodando. Pergunta o que precisar.`,
      },
    ]);
  }, [firstName, mealPlan]);

  const send = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;

    const userMsg: Message = { id: `${Date.now()}`, role: "user", content: messageText };
    const history = messages.filter((m) => m.id !== "welcome").slice(-10);
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("praxis-agent", {
        body: {
          userMessage: messageText,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      const answer = (data as any)?.answer;
      const errMsg = (data as any)?.error;
      if (error || errMsg || !answer) {
        toast.error(errMsg || "Não consegui responder agora.");
        setMessages((p) => [
          ...p,
          {
            id: `${Date.now() + 1}`,
            role: "praxis",
            content: errMsg || "Erro de conexão. Tenta de novo em alguns segundos.",
          },
        ]);
      } else {
        setMessages((p) => [...p, { id: `${Date.now() + 1}`, role: "praxis", content: answer }]);
      }
    } catch (e) {
      console.error("[PRAXIS] Error:", e);
      setMessages((p) => [
        ...p,
        { id: `${Date.now() + 1}`, role: "praxis", content: "Erro de conexão. Tenta de novo em alguns segundos." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, color: "#fff" }}>
      <div className="px-4 pt-5 max-w-3xl w-full mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "#8a8a8a" }}
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>

      {/* Header */}
      <header
        className="px-5 py-6 text-center"
        style={{ background: "linear-gradient(180deg, rgba(0,212,255,0.08) 0%, transparent 100%)" }}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap
            className="w-6 h-6 praxis-icon-activate"
            style={{ color: CYAN }}
            strokeWidth={2.5}
          />
          <h1 className="praxis-title">SEU PROTOCOLO</h1>
        </div>
        <p className="praxis-subtitle">O COMPORTAMENTO VEM ANTES DO ALIMENTO.</p>
      </header>

      {/* Chat */}
      <main className="flex-1 px-4 pb-4 max-w-3xl w-full mx-auto">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "self-end max-w-[85%]" : "max-w-[85%]"}>
              <div className={m.role === "user" ? "user-bubble" : "praxis-bubble"}>
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="praxis-bubble max-w-[85%]">
              <div className="praxis-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && !loading && (
          <div className="mt-6">
            <p
              className="text-[11px] tracking-[0.15em] mb-3"
              style={{ color: "#666", fontFamily: "'Space Mono', monospace" }}
            >
              ── PERGUNTAS RÁPIDAS ──
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_ACTIONS.map((q) => (
                <button key={q.text} className="quick-action-btn" onClick={() => send(q.text)}>
                  {q.icon} {q.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-0" style={{ background: BG }}>
        <form
          className="praxis-input-bar max-w-3xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            ref={inputRef}
            className="praxis-input"
            placeholder="Pergunta o que precisar..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="praxis-send-btn" disabled={loading} aria-label="Enviar">
            <Send className="w-4 h-4" style={{ color: "#02121a" }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PraxisPage;
