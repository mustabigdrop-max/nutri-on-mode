import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { X, Send, Loader2, Sparkles, Zap } from "lucide-react";

type AgentType = "vertex" | "nexus";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentType;
  compoundName: string;
  quickActions: string[];
}

const AGENT_CONFIG = {
  vertex: {
    name: "DR.VERTEX",
    role: "Ergogênicos · Peptídeos · Esteroides",
    color: "#7A9A7A", // sage
    icon: Sparkles,
    placeholder: "Pergunte sobre dose, timing, mecanismo, stack…",
  },
  nexus: {
    name: "DR.NEXUS",
    role: "Mindset · Comportamento · Execução",
    color: "#8878AA", // lavender
    icon: Zap,
    placeholder: "Pergunte sobre adesão, mindset, identidade…",
  },
};

const FONT_DISPLAY = "'Playfair Display', serif";
const FONT_UI = "'Barlow Condensed', sans-serif";
const FONT_MONO = "'Share Tech Mono', monospace";

export default function ErgoAgentPanel({
  isOpen,
  onClose,
  agent,
  compoundName,
  quickActions,
}: Props) {
  const cfg = AGENT_CONFIG[agent];
  const Icon = cfg.icon;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset ao trocar composto/agente
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setStreaming("");
      setInput("");
    }
  }, [isOpen, agent, compoundName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);
    setStreaming("");

    try {
      const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ergo-agent`;
      const resp = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          agent,
          compound: compoundName,
          messages: newHistory,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) throw new Error("Muitas requisições. Aguarde alguns segundos.");
        if (resp.status === 402) throw new Error("Créditos esgotados na workspace.");
        throw new Error("Erro ao iniciar stream");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content || "";
            if (delta) {
              full += delta;
              setStreaming(full);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (full) {
        setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      }
      setStreaming("");
    } catch (e: any) {
      console.error("ErgoAgent error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠ ${e.message || "Erro ao conectar."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(5,5,10,0.7)" }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l"
            style={{
              background: "rgba(12,11,18,0.97)",
              borderColor: `${cfg.color}40`,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: `${cfg.color}25` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border"
                  style={{
                    background: `${cfg.color}15`,
                    borderColor: `${cfg.color}50`,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full"
                      style={{ background: cfg.color }}
                    />
                    <span
                      className="text-sm tracking-[0.15em]"
                      style={{ fontFamily: FONT_DISPLAY, color: "#EDE6DA" }}
                    >
                      {cfg.name}
                    </span>
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-[0.2em] opacity-60"
                    style={{ fontFamily: FONT_MONO, color: "#EDE6DA" }}
                  >
                    {cfg.role}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                style={{ color: "#EDE6DA" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Context strip */}
            <div
              className="border-b px-5 py-2.5"
              style={{
                borderColor: `${cfg.color}15`,
                background: `${cfg.color}06`,
              }}
            >
              <div
                className="text-[9px] uppercase tracking-[0.25em] opacity-60"
                style={{ fontFamily: FONT_MONO, color: "#EDE6DA" }}
              >
                Composto em análise
              </div>
              <div
                className="text-sm"
                style={{ fontFamily: FONT_DISPLAY, color: cfg.color, fontStyle: "italic" }}
              >
                {compoundName}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {messages.length === 0 && !streaming && (
                <div className="space-y-3 py-4">
                  <p
                    className="text-xs opacity-60"
                    style={{ fontFamily: FONT_MONO, color: "#EDE6DA" }}
                  >
                    QUICK ACTIONS · Toque para perguntar
                  </p>
                  <div className="flex flex-col gap-2">
                    {quickActions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-lg border px-3 py-2 text-left text-xs transition-all hover:scale-[1.01]"
                        style={{
                          fontFamily: FONT_UI,
                          color: "#EDE6DA",
                          borderColor: `${cfg.color}30`,
                          background: `${cfg.color}05`,
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm"
                    style={{
                      fontFamily: FONT_UI,
                      background:
                        m.role === "user"
                          ? `${cfg.color}25`
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        m.role === "user" ? `${cfg.color}40` : "rgba(255,255,255,0.06)"
                      }`,
                      color: "#EDE6DA",
                    }}
                  >
                    {m.role === "assistant" ? (
                      <div
                        className="prose prose-sm prose-invert max-w-none
                          [&_p]:mb-2 [&_p]:leading-relaxed [&_strong]:font-semibold
                          [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1
                          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
                          [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-[11px]"
                        style={{ ["--tw-prose-bold" as any]: cfg.color }}
                      >
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}

              {streaming && (
                <div className="flex justify-start">
                  <div
                    className="max-w-[85%] rounded-2xl border px-3.5 py-2.5 text-sm"
                    style={{
                      fontFamily: FONT_UI,
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.06)",
                      color: "#EDE6DA",
                    }}
                  >
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_strong]:font-semibold">
                      <ReactMarkdown>{streaming}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !streaming && (
                <div className="flex items-center gap-2 px-2">
                  <Loader2 className="h-3 w-3 animate-spin" style={{ color: cfg.color }} />
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] opacity-60"
                    style={{ fontFamily: FONT_MONO, color: "#EDE6DA" }}
                  >
                    {agent === "vertex" ? "convergindo evidências…" : "calibrando MCE…"}
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className="border-t px-4 py-3"
              style={{ borderColor: `${cfg.color}20` }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder={cfg.placeholder}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border bg-transparent px-3 py-2.5 text-sm placeholder:opacity-40 focus:outline-none focus:ring-1"
                  style={{
                    fontFamily: FONT_UI,
                    color: "#EDE6DA",
                    borderColor: `${cfg.color}30`,
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-all disabled:opacity-40"
                  style={{
                    background: cfg.color,
                    color: "#05050A",
                  }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
