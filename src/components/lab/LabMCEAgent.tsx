import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, ExternalLink, Sparkles } from "lucide-react";
import VoiceRecorderButton from "@/components/ui/VoiceRecorderButton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";
const GREEN = "#00C896";

interface MCEMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  usedResearch?: boolean;
}

interface LabMCEAgentProps {
  onAskApex?: (q: string) => void;
}

const PILLARS = [
  {
    code: "M",
    id: "MCE-01",
    label: "MINDSET",
    sub: "Identidade → Protocolo",
    desc: "Você não segue um plano. Você age de acordo com quem você é.",
    color: GOLD,
    rgb: "184,146,42",
  },
  {
    code: "C",
    id: "MCE-02",
    label: "COMPORTAMENTO",
    sub: "Gatilho → Hábito → Recompensa",
    desc: "Seu corpo não mente. Os padrões que você repete tornam-se automáticos.",
    color: CYAN,
    rgb: "0,212,255",
  },
  {
    code: "E",
    id: "MCE-03",
    label: "EXECUÇÃO",
    sub: "Intenção → Sistema → Resultado",
    desc: "Plano sem execução é fantasia. Sistema sem feedback é cego.",
    color: GREEN,
    rgb: "0,200,150",
  },
];

const QUICK_ACTIONS = [
  { code: "DI", label: "Diagnóstico de Identidade", color: GOLD, prompt: "Quero fazer o diagnóstico completo de identidade alimentar. Me guie pelas 5 perguntas do framework MCE." },
  { code: "HL", label: "Mapear Habit Loop",         color: CYAN, prompt: "Me ajuda a mapear meu Habit Loop alimentar: CUE → ROTINA → RECOMPENSA. Identifique o que realmente dispara meus comportamentos." },
  { code: "II", label: "Implementation Intention",  color: GOLD, prompt: "Quero criar 3 implementation intentions concretas para meus principais gatilhos alimentares desta semana." },
  { code: "AS", label: "Análise Semanal MCE",       color: CYAN, prompt: "Faz minha análise semanal MCE: evidências de identidade, padrões de CUE detectados, e define o foco comportamental da próxima semana." },
  { code: "SP", label: "Plano Anti-Sabotagem",      color: GOLD, prompt: "Identifique meus 3 maiores pontos de sabotagem e monte um plano de prevenção com rotinas substitutas para cada um." },
  { code: "DA", label: "Design de Ambiente",        color: CYAN, prompt: "Me ajude a redesenhar meu ambiente usando os 4 princípios de James Clear aplicados à minha alimentação." },
  { code: "CC", label: "Coaching de Crise",         color: GREEN, prompt: "Estou prestes a sair do protocolo agora. Me ajuda a processar o que estou sentindo e tomar uma decisão consciente." },
  { code: "EV", label: "Evidência Científica",      color: GREEN, prompt: "Quero entender a ciência por trás do MCE: quais estudos validam essa abordagem comportamental para nutrição?" },
];

const QUICK_PROMPTS = [
  "Saí do protocolo ontem — me ajuda a entender por quê",
  "Quero construir minha declaração de identidade alimentar",
  "Mapear meus gatilhos emocionais com comida",
  "Como criar implementation intentions pro meu plano?",
];

const LabMCEAgent = ({ onAskApex }: LabMCEAgentProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<MCEMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) setShowChat(true);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setShowChat(true);
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
      toast.error("Erro ao conectar com o MCE Coach. Tente novamente.");
    }
    setIsLoading(false);
  };

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Hex grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.03) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Scan line */}
      <div className="hud-scan-line" />

      {/* ═══ MCE PILLARS HEADER ═══ */}
      <div
        className="relative z-10 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(184,146,42,0.1)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "1px solid rgba(184,146,42,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 28, height: 28,
                background: "rgba(184,146,42,0.1)",
                border: `1px solid ${GOLD}44`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", fontWeight: 700, color: GOLD }}>MC</span>
            </div>
            <div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#F5F0E8", letterSpacing: "0.08em" }}>
                MCE COACH
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}`, animation: "dotPulse 1.6s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.18em", color: "rgba(0,212,255,0.5)", textTransform: "uppercase" }}>
              SDT · HABIT LOOP · ATOMIC HABITS · GOLLWITZER
            </span>
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.code}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative group px-3 py-3 text-center overflow-hidden"
              style={{
                borderRight: i < 2 ? `1px solid rgba(${p.rgb},0.1)` : "none",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }}
              />
              {/* Radial glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(${p.rgb},0.07) 0%, transparent 70%)` }}
              />

              {/* Code */}
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: "2rem",
                  color: p.color,
                  lineHeight: 1,
                  textShadow: `0 0 30px rgba(${p.rgb},0.4)`,
                  letterSpacing: "0.02em",
                }}
              >
                {p.code}
              </div>

              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.18em", color: p.color, textTransform: "uppercase", opacity: 0.9, marginTop: 2 }}>
                {p.label}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.4rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.7)", marginTop: 2 }}>
                {p.sub}
              </div>

              {/* ID */}
              <div className="absolute top-2 right-2 opacity-25" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.38rem", color: p.color }}>
                {p.id}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto">

        {/* Empty state — ritual + actions */}
        <AnimatePresence>
          {!showChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="px-4 py-4 space-y-5"
            >
              {/* MCE Concept block */}
              <div
                className="relative overflow-hidden"
                style={{
                  border: "1px solid rgba(184,146,42,0.1)",
                  background: "rgba(10,10,26,0.6)",
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                }}
              >
                <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
                <div className="absolute top-2 right-3 opacity-25" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.4rem", color: GOLD }}>SYS-CORE</div>

                <div className="p-4 space-y-3">
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase" }}>
                    O QUE É O MCE
                  </div>
                  {PILLARS.map((p) => (
                    <div key={p.code} className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 28, height: 28,
                          background: `rgba(${p.rgb},0.1)`,
                          border: `1px solid rgba(${p.rgb},0.3)`,
                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        }}
                      >
                        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: p.color }}>{p.code}</span>
                      </div>
                      <div>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.12em", color: p.color, textTransform: "uppercase" }}>
                          {p.label} —{" "}
                        </span>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", color: "rgba(245,240,232,0.75)" }}>
                          {p.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div
                  className="mb-2.5 flex items-center gap-2"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase" }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
                  Protocolos Rápidos
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.code}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => sendMessage(action.prompt)}
                      className="flex items-center gap-2.5 text-left group relative overflow-hidden"
                      style={{
                        padding: "10px 12px",
                        background: "rgba(10,10,26,0.6)",
                        border: "1px solid rgba(80,80,122,0.15)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `rgba(${action.color === GOLD ? "184,146,42" : action.color === CYAN ? "0,212,255" : "0,200,150"},0.35)`;
                        e.currentTarget.style.background = `rgba(${action.color === GOLD ? "184,146,42" : action.color === CYAN ? "0,212,255" : "0,200,150"},0.05)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(80,80,122,0.15)";
                        e.currentTarget.style.background = "rgba(10,10,26,0.6)";
                      }}
                    >
                      {/* Hex code */}
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 26, height: 26,
                          background: `rgba(${action.color === GOLD ? "184,146,42" : action.color === CYAN ? "0,212,255" : "0,200,150"},0.1)`,
                          border: `1px solid rgba(${action.color === GOLD ? "184,146,42" : action.color === CYAN ? "0,212,255" : "0,200,150"},0.3)`,
                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        }}
                      >
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", fontWeight: 700, color: action.color }}>
                          {action.code}
                        </span>
                      </div>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.06em", color: "rgba(80,80,122,0.9)", lineHeight: 1.3 }}>
                        {action.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick prompts */}
              <div>
                <div
                  className="mb-2 flex items-center gap-2"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase" }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: CYAN }} />
                  Gatilhos Sugeridos
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      style={{
                        padding: "5px 10px",
                        background: "transparent",
                        border: "1px solid rgba(0,212,255,0.15)",
                        color: "rgba(80,80,122,0.8)",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "0.5rem",
                        letterSpacing: "0.06em",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${CYAN}44`;
                        e.currentTarget.style.color = "#F5F0E8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)";
                        e.currentTarget.style.color = "rgba(80,80,122,0.8)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat messages */}
        {showChat && (
          <div className="px-4 py-4 space-y-4">
            {/* Pillar legend compact */}
            <div className="flex items-center gap-3 mb-2">
              {PILLARS.map(p => (
                <div key={p.code} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full" style={{ background: p.color }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.12em", color: p.color, opacity: 0.6 }}>{p.code}</span>
                </div>
              ))}
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.4)" }}>MCE ATIVO</span>
            </div>

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* MCE Coach avatar */}
                {msg.role === "assistant" && (
                  <div
                    className="flex items-center justify-center shrink-0 mt-1"
                    style={{
                      width: 28, height: 28,
                      background: "rgba(184,146,42,0.12)",
                      border: `1px solid ${GOLD}44`,
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  >
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", fontWeight: 700, color: GOLD }}>MC</span>
                  </div>
                )}

                <div className={`max-w-[85%]`}>
                  {msg.role === "assistant" ? (
                    <div>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                        MCE COACH
                      </span>
                      <div
                        style={{
                          background: "rgba(13,13,31,0.9)",
                          border: "1px solid rgba(184,146,42,0.15)",
                          padding: "12px 14px",
                          clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
                          position: "relative",
                        }}
                      >
                        <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${GOLD}44, transparent)` }} />

                        {msg.usedResearch && (
                          <div
                            className="inline-flex items-center gap-1 mb-2"
                            style={{
                              padding: "2px 8px",
                              background: "rgba(0,200,150,0.08)",
                              border: `1px solid ${GREEN}33`,
                            }}
                          >
                            <Sparkles style={{ width: 10, height: 10, color: GREEN }} />
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.1em", color: GREEN }}>
                              PERPLEXITY · {msg.citations?.length || 0} FONTES
                            </span>
                          </div>
                        )}

                        <div
                          className="prose prose-sm max-w-none"
                          style={{ color: "rgba(245,240,232,0.85)" }}
                        >
                          <div
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontSize: "0.82rem",
                              lineHeight: 1.65,
                              color: "rgba(245,240,232,0.82)",
                            }}
                          >
                            <ReactMarkdown
                              components={{
                                strong: ({ children }) => (
                                  <strong style={{ color: GOLD, fontWeight: 700 }}>{children}</strong>
                                ),
                                h3: ({ children }) => (
                                  <h3 style={{ color: GOLD, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.04em", margin: "10px 0 4px" }}>{children}</h3>
                                ),
                                p: ({ children }) => <p style={{ marginBottom: 8 }}>{children}</p>,
                                ul: ({ children }) => <ul style={{ marginBottom: 8, listStyle: "none", padding: 0 }}>{children}</ul>,
                                li: ({ children }) => (
                                  <li style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                                    <span style={{ color: GOLD, flexShrink: 0 }}>→</span>
                                    <span>{children}</span>
                                  </li>
                                ),
                                code: ({ children }) => (
                                  <code style={{ background: "rgba(184,146,42,0.12)", color: CYAN, padding: "1px 6px", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem" }}>
                                    {children}
                                  </code>
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div style={{ borderTop: "1px solid rgba(184,146,42,0.1)", paddingTop: 8, marginTop: 8 }}>
                            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.15em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase", marginBottom: 4 }}>
                              Fontes Científicas
                            </p>
                            {msg.citations.slice(0, 5).map((f, fi) => (
                              <a
                                key={fi}
                                href={f}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 truncate"
                                style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", color: `${GOLD}88`, marginBottom: 2, textDecoration: "none" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = `${GOLD}88`)}
                              >
                                <ExternalLink style={{ width: 10, height: 10, flexShrink: 0 }} />
                                <span className="truncate">{f}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase", display: "block", marginBottom: 4, textAlign: "right" }}>
                        VOCÊ
                      </span>
                      <div
                        style={{
                          background: "rgba(184,146,42,0.1)",
                          border: `1px solid ${GOLD}33`,
                          padding: "10px 14px",
                          clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                        }}
                      >
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem", color: "#F5F0E8", lineHeight: 1.5 }}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-2">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 28, height: 28,
                    background: "rgba(184,146,42,0.12)",
                    border: `1px solid ${GOLD}44`,
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    animation: "hud-flicker 1.5s ease-in-out infinite",
                  }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", fontWeight: 700, color: GOLD }}>MC</span>
                </div>
                <div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                    MCE COACH
                  </span>
                  <div
                    style={{
                      background: "rgba(13,13,31,0.9)",
                      border: "1px solid rgba(184,146,42,0.15)",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Loader2 style={{ width: 14, height: 14, color: GOLD, animation: "spin 1s linear infinite" }} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.7)" }}>
                      analisando comportamento...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ INPUT ═══ */}
      <div
        className="relative z-10 flex-shrink-0 px-4 py-3"
        style={{ borderTop: "1px solid rgba(184,146,42,0.1)", background: "rgba(10,10,26,0.95)" }}
      >
        {/* Back to ritual button when in chat */}
        {showChat && (
          <button
            onClick={() => setShowChat(false)}
            className="mb-2 flex items-center gap-1.5 transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.44rem", letterSpacing: "0.15em", color: "rgba(80,80,122,0.5)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,80,122,0.5)")}
          >
            ← VER PROTOCOLOS MCE
          </button>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <div
              className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
              style={{ width: 36, borderRight: "1px solid rgba(184,146,42,0.15)" }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", color: "rgba(184,146,42,0.4)" }}>IN</span>
            </div>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              placeholder="Fale com o MCE Coach..."
              style={{
                width: "100%",
                paddingLeft: 44,
                paddingRight: 12,
                paddingTop: 11,
                paddingBottom: 11,
                background: "rgba(13,13,31,0.8)",
                border: "1px solid rgba(184,146,42,0.15)",
                color: "#F5F0E8",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.82rem",
                outline: "none",
                transition: "border-color 0.2s",
                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.4)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.15)"; }}
            />
            <span
              className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            />
          </div>

          <VoiceRecorderButton
            onTranscript={(t) => setInput(prev => prev ? prev + " " + t : t)}
            disabled={isLoading}
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            style={{
              width: 44,
              height: 44,
              background: input.trim() && !isLoading ? GOLD : "rgba(80,80,122,0.12)",
              border: `1px solid ${input.trim() && !isLoading ? GOLD + "66" : "rgba(80,80,122,0.2)"}`,
              color: input.trim() && !isLoading ? "#0a0a1a" : "rgba(80,80,122,0.4)",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabMCEAgent;
