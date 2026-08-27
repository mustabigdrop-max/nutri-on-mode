import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#020205", s1: "#0B0B12", s2: "#10101A", s3: "#181824", s4: "#22222E",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#4A4A5A", dim: "#333340",
  text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const SUGGESTIONS = [
  "Por que eu sei o que fazer mas não faço?",
  "Como parar de comer errado à noite?",
  "Não consigo manter a consistência",
  "Como criar disciplina sem depender de motivação?",
  "Por que eu desisto sempre na 3ª semana?",
  "Como lidar com dias que não tenho vontade?",
  "O que é autoeficácia e como construir?",
  "Explica o Protocolo 24H pra mim",
];

const QUICK_TAGS = [
  "Como melhorar meu Mindset?",
  "Meu Comportamento está no automático errado",
  "Preciso melhorar minha Execução",
  "Qual exercício MCE fazer agora?",
  "Me explica o bloco da Recalibração",
];

type Msg = { role: "user" | "assistant"; text: string };

export default function MceChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", text: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setShowSuggestions(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("mce-forge", {
        body: {
          mode: "coach_chat",
          history: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply || "Erro ao processar.";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Erro de conexão. Tente novamente." }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "70vh" }}>
      <style>{`@keyframes dotPulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}`}</style>

      {/* Header */}
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.purple}`, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, background: `linear-gradient(135deg,${C.purple}20,${C.gold}15)`,
            border: `1px solid ${C.purple}30`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.t, fontSize: 18, fontWeight: 900, color: C.purple,
          }}>
            MCE
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.t, fontSize: 17, fontWeight: 700, color: C.white, letterSpacing: 0.5 }}>
              Coach MCE
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 1 }}>
                ONLINE · 6 AUTORES · PROTOCOLO 24H
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {[{ p: "M", c: C.cyan }, { p: "C", c: C.gold }, { p: "E", c: C.purple }].map(({ p, c }) => (
            <span key={p} style={{
              fontFamily: F.m, fontSize: 9, color: c, background: `${c}10`,
              border: `1px solid ${c}25`, padding: "2px 10px", letterSpacing: 2,
            }}>{p}</span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", marginBottom: 12, maxHeight: "52vh" }}>
        {/* Welcome */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
            <div style={{ fontFamily: F.t, fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 8 }}>
              Coach MCE
            </div>
            <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, lineHeight: 1.6, marginBottom: 6 }}>
              Treinado no Método MCE completo. 6 autores científicos. Protocolo 24H.
            </div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted }}>
              Pergunte qualquer coisa sobre sua jornada.
            </div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && messages.length === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 4px" }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{
                background: C.s2, border: `1px solid ${C.border}`, borderRadius: 0,
                padding: "10px 12px", cursor: "pointer", textAlign: "left",
                fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.3,
              }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 12, padding: "0 2px",
          }}>
            <div style={{ maxWidth: "88%" }}>
              {msg.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 22, height: 22, background: `${C.purple}15`, border: `1px solid ${C.purple}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: F.t, fontSize: 11, fontWeight: 900, color: C.purple,
                  }}>
                    M
                  </div>
                  <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted, letterSpacing: 2 }}>COACH MCE</span>
                </div>
              )}
              <div style={{
                background: msg.role === "user" ? `${C.cyan}08` : C.s1,
                border: `1px solid ${msg.role === "user" ? `${C.cyan}20` : C.border}`,
                padding: "12px 14px",
                fontFamily: F.b, fontSize: 12.5, color: C.text, lineHeight: 1.65,
                whiteSpace: "pre-wrap",
              }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 2px" }}>
            <div style={{
              width: 22, height: 22, background: `${C.purple}15`, border: `1px solid ${C.purple}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.t, fontSize: 11, fontWeight: 900, color: C.purple,
            }}>
              M
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: C.purple,
                  display: "inline-block",
                  animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pillar quick tags */}
      {messages.length > 0 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 4 }}>
          {QUICK_TAGS.map((s, i) => (
            <button key={i} onClick={() => send(s)} disabled={loading} style={{
              background: C.s3, border: `1px solid ${C.border}`, borderRadius: 0,
              padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: F.m, fontSize: 8, color: C.muted, flexShrink: 0,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: C.s1, border: `1px solid ${C.border}`, padding: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Pergunte ao Coach MCE..."
          rows={1}
          style={{
            flex: 1, padding: "10px 14px", background: C.s2, border: `1px solid ${C.border}`,
            borderRadius: 0, color: C.text, fontFamily: F.b, fontSize: 13,
            resize: "none", minHeight: 40, maxHeight: 100, outline: "none",
          }}
        />
        <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{
          width: 44, height: 40, background: !input.trim() ? C.dim : `linear-gradient(135deg,${C.purple},${C.gold})`,
          border: "none", borderRadius: 0, cursor: !input.trim() ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: C.white, opacity: loading ? 0.5 : 1,
        }}>↑</button>
      </div>
    </div>
  );
}
