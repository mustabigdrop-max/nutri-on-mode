import { useState, useRef, useEffect } from "react";
import { Send, Brain, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const GREEN = "#4ade80";
const TEXT = "#f0fdf4";
const TEXT_DIM = "#94a3b8";
const SURFACE = "#0c120c";
const SURFACE2 = "#111a11";
const BORDER = "rgba(74,222,128,0.15)";
const BORDER_ACTIVE = "rgba(74,222,128,0.4)";

type Msg = { role: "user" | "assistant"; content: string };

const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trainingon-fibras`;

export default function TrainingOnFibrasChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "**TrainingON — Inteligência de Fibras Musculares** 🧬\n\nMonto seu protocolo justificando cada decisão pela fisiologia das fibras (Tipo I, IIA, IIX).\n\nMe diz:\n1. Objetivo (hipertrofia, força, definição, recomp...)\n2. Nível e frequência semanal\n3. Equipamentos\n4. Pontos fracos / lesões\n\nE eu monto a divisão certa pra **suas fibras**.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content !== messages[messages.length - 1]?.content) {
          // already streaming -> replace last
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(STREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })) }),
      });

      if (resp.status === 429) {
        toast.error("Muitas requisições — aguarde alguns segundos.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("Créditos esgotados. Adicione no workspace.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream falhou");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) upsert(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao consultar o agente.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: SURFACE, border: `1px solid ${BORDER}`, height: "70vh", minHeight: 520 }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${BORDER}`, background: SURFACE2 }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(74,222,128,0.12)", border: `1px solid ${BORDER_ACTIVE}` }}
          >
            <Brain className="w-4 h-4" style={{ color: GREEN }} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: TEXT }}>
              Agente Fibras Musculares
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: TEXT_DIM }}>
              Tipo I · IIA · IIX
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg transition-all hover:scale-105"
          style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          title="Limpar conversa"
        >
          <Trash2 className="w-3.5 h-3.5" style={{ color: TEXT_DIM }} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm"
              style={{
                background: m.role === "user" ? "rgba(74,222,128,0.15)" : SURFACE2,
                border: `1px solid ${m.role === "user" ? BORDER_ACTIVE : BORDER}`,
                color: TEXT,
              }}
            >
              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-emerald-300 prose-strong:text-emerald-200 prose-code:text-emerald-300">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5 rounded-2xl flex items-center gap-2"
              style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT_DIM }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">Analisando fibras...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2" style={{ borderTop: `1px solid ${BORDER}`, background: SURFACE2 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Ex: hipertrofia, 4x/sem, foco em costas e pernas..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
          style={{ background: GREEN, color: "#03130a" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
