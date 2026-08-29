import React, { useRef, useState } from "react";
import type { EducationContent } from "@/utils/apexEducation";

export interface DraggableAchado {
  key: string;
  label: string;
  graus: number;
  sev: "ok" | "alt" | "sev" | string;
}

interface Props {
  achado: DraggableAchado;
  content: EducationContent;
  initialX: number;
  initialY: number;
  onClose: () => void;
}

type Section = "o_que_e" | "impacto" | "muda";

export function DraggableEducationCard({
  achado,
  content,
  initialX,
  initialY,
  onClose,
}: Props) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  // Começa recolhido (só a pastilha com cor + título) — com várias
  // descobertas na mesma foto, abrir tudo expandido de cara polui a tela.
  // O coach expande só o que quer aprofundar; o resto fica como resumo limpo.
  const [minimized, setMinimized] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("o_que_e");
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const isSevere = achado.sev === "sev" || achado.graus >= 3;
  const isModerate = !isSevere && (achado.sev === "alt" || achado.graus >= 1);
  const cor = isSevere ? "#EF4444" : isModerate ? "#FBBF24" : "#34D399";
  const sevLabel = isSevere ? "SEVERO" : isModerate ? "MODERADO" : "LEVE";

  function startDrag(clientX: number, clientY: number) {
    dragging.current = true;
    dragStart.current = { x: clientX, y: clientY, px: pos.x, py: pos.y };
  }

  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest(".edu-card-controls")) return;
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      setPos({
        x: dragStart.current.px + ev.clientX - dragStart.current.x,
        y: dragStart.current.py + ev.clientY - dragStart.current.y,
      });
    }
    function onUp() {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if ((e.target as HTMLElement).closest(".edu-card-controls")) return;
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    const t = e.touches[0];
    setPos({
      x: dragStart.current.px + t.clientX - dragStart.current.x,
      y: dragStart.current.py + t.clientY - dragStart.current.y,
    });
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => { dragging.current = false; }}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: minimized ? 180 : 260,
        zIndex: 100,
        cursor: "move",
        userSelect: "none",
        transition: "width .2s",
      }}
    >
      <div
        style={{
          background: "rgba(10,10,15,0.92)",
          border: `1px solid ${cor}50`,
          borderRadius: 12,
          overflow: "hidden",
          backdropFilter: "blur(12px)",
          boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${cor}20`,
        }}
      >
        {/* Header */}
        <div style={{
          padding: "8px 10px",
          background: `${cor}15`,
          borderBottom: `0.5px solid ${cor}30`,
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: cor, flexShrink: 0,
            boxShadow: `0 0 6px ${cor}80`,
          }} />
          <p style={{
            fontSize: 11, fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            margin: 0, flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {content.o_que_e.titulo}
          </p>
          {minimized && (
            <span style={{
              fontSize: 8, fontWeight: 700, color: cor,
              letterSpacing: "0.08em", flexShrink: 0,
              whiteSpace: "nowrap",
            }}>
              {sevLabel}{achado.graus ? ` · ${achado.graus.toFixed(1)}°` : ""}
            </span>
          )}
          <div className="edu-card-controls" style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setMinimized((v) => !v)}
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                cursor: "pointer", fontSize: 9,
                color: "rgba(255,255,255,0.5)",
                display: "flex", alignItems: "center",
                justifyContent: "center", padding: 0,
              }}
            >
              {minimized ? "□" : "−"}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: "rgba(239,68,68,0.15)",
                border: "0.5px solid rgba(239,68,68,0.25)",
                cursor: "pointer", fontSize: 10,
                color: "#EF4444",
                display: "flex", alignItems: "center",
                justifyContent: "center", padding: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Tabs */}
            <div style={{
              display: "flex",
              borderBottom: "0.5px solid rgba(255,255,255,0.08)",
            }}>
              {([
                { id: "o_que_e", label: "O que é", cor: "#38BDF8" },
                { id: "impacto", label: "Impacto", cor: "#FBBF24" },
                { id: "muda", label: "Solução", cor: "#34D399" },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  className="edu-card-controls"
                  onClick={() => setActiveSection(tab.id)}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    background: activeSection === tab.id ? `${tab.cor}12` : "transparent",
                    border: "none",
                    borderBottom: activeSection === tab.id ? `1.5px solid ${tab.cor}` : "1.5px solid transparent",
                    cursor: "pointer",
                    fontSize: 9, fontWeight: 500,
                    color: activeSection === tab.id ? tab.cor : "rgba(255,255,255,0.3)",
                    transition: "all .15s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section content */}
            <div style={{ padding: "10px 12px" }}>
              {activeSection === "o_que_e" && (
                <>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: "0 0 8px", lineHeight: 1.6 }}>
                    {content.o_que_e.texto}
                  </p>
                  <div style={{
                    padding: "7px 9px",
                    background: "rgba(56,189,248,0.08)",
                    border: "0.5px solid rgba(56,189,248,0.15)",
                    borderRadius: 7,
                  }}>
                    <p style={{ fontSize: 10, color: "rgba(56,189,248,0.85)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                      💡 {content.o_que_e.analogia}
                    </p>
                  </div>
                </>
              )}

              {activeSection === "impacto" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { icon: "👁", label: "Visual", text: content.por_que_importa.impacto_visual },
                    { icon: "🏆", label: "Palco", text: content.por_que_importa.impacto_palco },
                    { icon: "🫀", label: "Saúde", text: content.por_que_importa.impacto_saude },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "6px 8px",
                      background: "rgba(251,191,36,0.06)",
                      border: "0.5px solid rgba(251,191,36,0.12)",
                      borderRadius: 7,
                    }}>
                      <p style={{ fontSize: 9, fontWeight: 600, color: "#FBBF24", margin: "0 0 2px" }}>
                        {item.icon} {item.label}
                      </p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === "muda" && (
                <>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: "0 0 8px", lineHeight: 1.6 }}>
                    {content.o_que_muda.no_treino}
                  </p>
                  <div style={{
                    padding: "6px 8px",
                    background: "rgba(52,211,153,0.08)",
                    border: "0.5px solid rgba(52,211,153,0.15)",
                    borderRadius: 7,
                    textAlign: "center",
                  }}>
                    <p style={{ fontSize: 9, color: "#34D399", margin: "0 0 2px", fontWeight: 600 }}>
                      ⏱ Prazo
                    </p>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                      {content.o_que_muda.tempo_medio}
                    </p>
                  </div>
                  <div style={{
                    marginTop: 6, padding: "6px 8px",
                    background: "rgba(52,211,153,0.06)",
                    borderRadius: 7,
                  }}>
                    <p style={{ fontSize: 10, color: "rgba(52,211,153,0.85)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                      ✓ {content.o_que_muda.resultado}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Sabia que */}
            <div style={{
              padding: "7px 12px",
              borderTop: "0.5px solid rgba(255,255,255,0.06)",
              background: "rgba(167,139,250,0.06)",
            }}>
              <p style={{ fontSize: 9, color: "rgba(167,139,250,0.75)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                🧬 {content.sabia_que.slice(0, 110)}
                {content.sabia_que.length > 110 ? "…" : ""}
              </p>
            </div>

            {/* nutriON APEX badge */}
            <div style={{
              padding: "5px 12px",
              borderTop: "0.5px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 4,
            }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(184,146,42,0.6)", letterSpacing: "0.12em" }}>
                nutri
              </span>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#B8922A", letterSpacing: "0.12em" }}>
                ON
              </span>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", marginLeft: 2 }}>
                APEX
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
