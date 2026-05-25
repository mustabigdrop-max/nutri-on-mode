import { useState, useEffect, useRef, useCallback } from "react";
import { Brain, X, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string; ts: number };

interface Props {
  athleteId?: string | null;
  athleteName?: string;
  activeTab?: string;
  apexContext: string; // pre-built block: scores, postura, plano, palco, farmacologia, etc.
}

const QUICK_ACTIONS: Record<string, { label: string; prompt: string }[]> = {
  scores: [
    { label: "📊 EXPLICAR SCORES", prompt: "Explique tecnicamente os scores APEX deste atleta." },
    { label: "⚖️ PRIORIDADE DE CORREÇÃO", prompt: "Quais correções devem ter prioridade e por quê?" },
    { label: "🎯 IMPACTO NO PALCO", prompt: "Qual o impacto desses scores no palco de Classic Physique?" },
    { label: "🔄 RECALCULAR", prompt: "Sugira ajustes para recalcular os scores." },
  ],
  postura: [
    { label: "🦴 EXPLICAR SÍNDROME", prompt: "Explique a síndrome postural identificada (Janda)." },
    { label: "💪 MÚSCULOS INIBIDOS", prompt: "Quais músculos estão inibidos e quais facilitados?" },
    { label: "⚡ PROTOCOLO CORRETO?", prompt: "O protocolo corretivo prescrito está adequado?" },
    { label: "✏️ SUGERIR AJUSTE", prompt: "Sugira ajustes finos no protocolo corretivo." },
  ],
  correcoes: [
    { label: "🦴 EXPLICAR SÍNDROME", prompt: "Explique a síndrome postural identificada (Janda)." },
    { label: "💪 MÚSCULOS INIBIDOS", prompt: "Quais músculos estão inibidos e quais facilitados?" },
    { label: "⚡ PROTOCOLO CORRETO?", prompt: "O protocolo corretivo prescrito está adequado?" },
    { label: "✏️ SUGERIR AJUSTE", prompt: "Sugira ajustes finos no protocolo corretivo." },
  ],
  "plano-mestre": [
    { label: "📅 VALIDAR VOLUME", prompt: "Valide o volume semanal por grupamento." },
    { label: "🔁 VERIFICAR FREQUÊNCIA", prompt: "Verifique a frequência de cada grupamento." },
    { label: "⚙️ AJUSTAR EXERCÍCIO", prompt: "Sugira ajustes em exercícios específicos." },
    { label: "🔄 REGENERAR DIA", prompt: "Quais dias merecem regeneração e por quê?" },
  ],
  plano: [
    { label: "📅 VALIDAR VOLUME", prompt: "Valide o volume semanal por grupamento." },
    { label: "🔁 VERIFICAR FREQUÊNCIA", prompt: "Verifique a frequência de cada grupamento." },
    { label: "⚙️ AJUSTAR EXERCÍCIO", prompt: "Sugira ajustes em exercícios específicos." },
    { label: "🔄 REGENERAR DIA", prompt: "Quais dias merecem regeneração e por quê?" },
  ],
  farmacologia: [
    { label: "💊 EXPLICAR COMPOSTO", prompt: "Explique os compostos do protocolo informado." },
    { label: "⚠️ RED FLAGS", prompt: "Aponte red flags no protocolo farmacológico." },
    { label: "🔗 VERIFICAR SINERGIA", prompt: "Verifique sinergia e antagonismos dos compostos." },
    { label: "📋 PROTOCOLO COMPLETO", prompt: "Avalie o protocolo farmacológico completo." },
  ],
  palco: [
    { label: "🏆 VIABILIDADE DA META", prompt: "A meta de palco é viável no prazo?" },
    { label: "📅 TIMELINE REALISTA?", prompt: "A timeline atual é realista?" },
    { label: "⚡ PONTOS CRÍTICOS", prompt: "Quais são os pontos críticos até o palco?" },
    { label: "🔄 REVISAR PLANO", prompt: "Sugira revisões no plano de finalização." },
  ],
};

const DEFAULT_ACTIONS = QUICK_ACTIONS.scores;

const TEAL = "#00d4aa";
const TEAL_SOFT = "rgba(0,212,170,0.1)";

export default function ApexAgentDrawer({ athleteId, athleteName, activeTab, apexContext }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Pronto");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const quick = QUICK_ACTIONS[activeTab || "scores"] || DEFAULT_ACTIONS;

  // Load existing session
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const q = supabase
        .from("apex_agent_sessions")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const { data } = athleteId ? await q.eq("athlete_id", athleteId) : await q;
      if (data && data[0]) {
        const s: any = data[0];
        setSessionId(s.id);
        setMessages((s.messages as any) || []);
        setApproved(s.status === "approved");
      }
    })();
  }, [athleteId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }), 50);
    }
  }, [open, messages]);

  const persist = useCallback(async (next: Msg[], extra: Record<string, any> = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (sessionId) {
      await supabase.from("apex_agent_sessions").update({ messages: next as any, ...extra }).eq("id", sessionId);
    } else {
      const { data } = await supabase.from("apex_agent_sessions").insert({
        coach_id: user.id,
        athlete_id: athleteId || null,
        messages: next as any,
        snapshot: { activeTab, contextPreview: apexContext.slice(0, 4000) } as any,
        ...extra,
      }).select("id").single();
      if (data) setSessionId(data.id);
    }
  }, [sessionId, athleteId, activeTab, apexContext]);

  const callAgent = useCallback(async (mode: "initial" | "chat", nextMessages: Msg[]) => {
    setLoading(true);
    setStatus("Respondendo...");
    try {
      const { data, error } = await supabase.functions.invoke("apex-agent", {
        body: {
          mode,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          apexContext,
          activeTab,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const text = (data as any)?.text || "";
      const reply: Msg = { role: "assistant", content: text, ts: Date.now() };
      const updated = [...nextMessages, reply];
      setMessages(updated);
      persist(updated);
      if (!open) setUnread(u => u + 1);
      setStatus("Pronto para revisão");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao consultar APEX Agent");
      setStatus("Pronto");
    } finally {
      setLoading(false);
    }
  }, [apexContext, activeTab, open, persist]);

  // Auto initial analysis on first open
  useEffect(() => {
    if (!open || initRef.current || approved) return;
    if (messages.length > 0) { initRef.current = true; return; }
    if (!apexContext || apexContext.length < 30) return;
    initRef.current = true;
    setStatus("Analisando seu protocolo APEX...");
    callAgent("initial", []);
  }, [open, messages.length, apexContext, approved, callAgent]);

  const send = (content: string) => {
    if (!content.trim() || loading || approved) return;
    const userMsg: Msg = { role: "user", content: content.trim(), ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    callAgent("chat", next);
  };

  const handleApprove = async () => {
    if (!sessionId) return;
    await supabase.from("apex_agent_sessions").update({
      status: "approved",
      approved_at: new Date().toISOString(),
    }).eq("id", sessionId);
    setApproved(true);
    setConfirmApprove(false);
    const reply: Msg = {
      role: "assistant",
      content: "Protocolo APEX aprovado. Todas as correções e o plano de treino estão salvos e disponíveis para o atleta.",
      ts: Date.now(),
    };
    setMessages(m => [...m, reply]);
    toast.success("Protocolo APEX aprovado");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        title="APEX AGENT · Tirar dúvidas"
        aria-label="APEX Agent"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: TEAL_SOFT,
          border: `1.5px solid ${TEAL}`,
          boxShadow: `0 0 16px rgba(0,212,170,0.25), 0 0 32px rgba(0,212,170,0.1)`,
          zIndex: 9999,
          display: open ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: TEAL,
        }}
      >
        <Brain size={20} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700,
            minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unread}</span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 9997,
            animation: "apexFadeIn .25s ease-out",
          }}
        />
      )}

      {/* Drawer */}
      {open && (
        <div
          style={{
            position: "fixed", right: 0, top: 0, height: "100vh", width: 380,
            zIndex: 9998,
            background: "linear-gradient(180deg, #04080e 0%, #060c14 100%)",
            borderLeft: `0.5px solid rgba(0,212,170,0.2)`,
            borderTop: `2px solid ${TEAL}`,
            boxShadow: "-8px 0 32px rgba(0,0,0,0.6)",
            animation: "apexSlideIn .3s ease-out",
            display: "flex", flexDirection: "column",
            color: "#e8f0ff",
          }}
        >
          <style>{`
            @keyframes apexSlideIn { from { transform: translateX(100%);} to { transform: translateX(0);} }
            @keyframes apexFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes apexPulse { 0%,100%{opacity:.4;transform:scale(.9);} 50%{opacity:1;transform:scale(1.1);} }
          `}</style>

          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "rgba(0,212,170,0.05)",
            borderBottom: "0.5px solid rgba(0,212,170,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 22, height: 22 }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: `1px solid ${TEAL}`,
                    animation: `apexPulse 1.6s ease-in-out ${i * 0.3}s infinite`,
                  }}/>
                ))}
                <span style={{
                  position: "absolute", inset: 6, borderRadius: "50%", background: TEAL,
                }}/>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".14em", color: "#e8f0ff" }}>
                APEX AGENT
              </span>
              <span style={{
                fontSize: 8, color: "#c9a84c", border: "0.5px solid rgba(201,168,76,0.4)",
                padding: "2px 5px", borderRadius: 3, letterSpacing: ".1em", fontWeight: 700,
              }}>PhD · Elite</span>
              <button onClick={() => setOpen(false)} style={{
                marginLeft: "auto", background: "transparent", border: "none",
                color: "#7a8aa0", cursor: "pointer", padding: 2,
              }} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <div style={{ fontSize: 9, color: TEAL, marginTop: 6, letterSpacing: ".05em" }}>
              {loading ? status : (approved ? "Protocolo aprovado" : status)}
              {athleteName ? ` · ${athleteName}` : ""}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: "auto", padding: "12px 14px",
            fontFamily: "'Courier New', monospace",
          }}>
            {messages.length === 0 && !loading && (
              <div style={{ fontSize: 10, color: "#5a6a82", textAlign: "center", padding: 30 }}>
                Aguardando análise inicial do APEX Agent...
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                marginBottom: 10,
                marginLeft: m.role === "user" ? "15%" : 0,
              }}>
                <div style={{
                  padding: "10px 12px",
                  fontSize: 11,
                  lineHeight: 1.75,
                  fontFamily: "'Courier New', monospace",
                  whiteSpace: "pre-wrap",
                  background: m.role === "assistant" ? "rgba(0,212,170,0.04)" : "rgba(200,160,32,0.05)",
                  color: m.role === "assistant" ? "#e8f0ff" : "#a0b0c8",
                  borderLeft: m.role === "assistant" ? `2px solid rgba(0,212,170,0.25)` : "none",
                  borderRight: m.role === "user" ? `2px solid rgba(200,160,32,0.25)` : "none",
                  borderRadius: m.role === "assistant" ? "0 6px 6px 6px" : "6px 0 6px 6px",
                  textAlign: m.role === "user" ? "right" : "left",
                }}>
                  {m.content}
                </div>
                <div style={{
                  fontSize: 8, color: "#5a6a82", marginTop: 4,
                  textAlign: m.role === "user" ? "right" : "left",
                }}>
                  {new Date(m.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: 10, color: TEAL, padding: 8 }}>● ● ● analisando</div>
            )}
          </div>

          {/* Quick actions */}
          {!approved && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5,
              padding: "8px 14px",
              borderTop: "0.5px solid rgba(255,255,255,0.04)",
            }}>
              {quick.map((a) => (
                <button
                  key={a.label}
                  onClick={() => send(a.prompt)}
                  disabled={loading}
                  style={{
                    padding: "5px 4px", fontSize: 8,
                    border: "0.5px solid rgba(0,212,170,0.15)",
                    borderRadius: 3, color: "#7a8aa0",
                    background: "transparent", cursor: loading ? "wait" : "pointer",
                    letterSpacing: ".05em", textTransform: "uppercase",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,212,170,0.35)";
                    e.currentTarget.style.color = TEAL;
                    e.currentTarget.style.background = "rgba(0,212,170,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,212,170,0.15)";
                    e.currentTarget.style.color = "#7a8aa0";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          {!approved && (
            <div style={{
              padding: "10px 14px",
              borderTop: "0.5px solid rgba(0,212,170,0.1)",
              background: "rgba(4,8,14,0.98)",
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Questione, reivindique ou sugira ajuste no protocolo..."
                style={{
                  minHeight: 56, maxHeight: 100, width: "100%",
                  background: "rgba(8,16,26,0.95)",
                  border: "0.5px solid rgba(0,212,170,0.15)",
                  borderBottom: "1.5px solid rgba(0,212,170,0.3)",
                  borderRadius: 4, padding: "8px 10px",
                  fontSize: 11, color: "#e8f0ff",
                  fontFamily: "'Courier New', monospace",
                  resize: "none", outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: 8, color: "#5a6a82" }}>
                  Enter para nova linha · Ctrl+Enter enviar
                </span>
                <button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  style={{
                    background: TEAL_SOFT,
                    border: `0.5px solid rgba(0,212,170,0.3)`,
                    color: TEAL, fontSize: 9, fontWeight: 700,
                    padding: "5px 12px", borderRadius: 3,
                    textTransform: "uppercase", letterSpacing: ".1em",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !input.trim() ? 0.5 : 1,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}
                >
                  Enviar <Send size={10} />
                </button>
              </div>
            </div>
          )}

          {/* Approve protocol */}
          <div style={{ padding: "10px 14px", borderTop: "0.5px solid rgba(0,212,170,0.1)" }}>
            {!confirmApprove ? (
              <button
                onClick={() => approved ? null : setConfirmApprove(true)}
                disabled={approved || !sessionId}
                style={{
                  width: "100%", padding: "10px 0",
                  background: approved ? "rgba(0,212,170,0.16)" : "rgba(0,212,170,0.08)",
                  border: "0.5px solid rgba(0,212,170,0.3)",
                  color: "#60ffdd", fontSize: 11, fontWeight: 700,
                  borderRadius: 4, letterSpacing: ".1em",
                  cursor: approved ? "default" : "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <CheckCircle2 size={13} />
                {approved ? "APROVADO ✓" : "APROVAR PROTOCOLO APEX"}
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, color: "#a0b0c8", lineHeight: 1.5 }}>
                  Aprovar e finalizar o protocolo APEX? Versão atual será salva como definitiva e disponibilizada ao atleta.
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setConfirmApprove(false)} style={{
                    flex: 1, padding: "8px 0", background: "transparent",
                    border: "0.5px solid rgba(255,255,255,0.15)", color: "#7a8aa0",
                    fontSize: 10, borderRadius: 3, cursor: "pointer",
                  }}>CANCELAR</button>
                  <button onClick={handleApprove} style={{
                    flex: 1, padding: "8px 0", background: TEAL_SOFT,
                    border: `0.5px solid ${TEAL}`, color: TEAL,
                    fontSize: 10, fontWeight: 700, borderRadius: 3, cursor: "pointer",
                  }}>✓ CONFIRMAR</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
