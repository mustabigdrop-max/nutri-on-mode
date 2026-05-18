import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAssessmentPCA } from "@/hooks/useAssessmentPCA";
import { PERGUNTAS_PCA } from "@/data/perguntas-pca";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const EIXO_COLORS: Record<string, string> = {
  MINDSET:       GOLD,
  COMPORTAMENTO: CYAN,
  "EXECUÇÃO":    "#00C896",
};

export default function AssessmentPCA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { respostas, responder, calcularResultado, progresso } = useAssessmentPCA();

  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [direcao, setDirecao] = useState<"entrada" | "saida">("entrada");
  const [salvando, setSalvando] = useState(false);

  const pergunta = PERGUNTAS_PCA[perguntaAtual];
  const respostaAtual = respostas[pergunta.id];
  const isUltima = perguntaAtual === PERGUNTAS_PCA.length - 1;
  const eixoColor = EIXO_COLORS[pergunta.eixo] ?? GOLD;

  async function avancar() {
    if (!respostaAtual || animando) return;
    if (isUltima) { await finalizarAssessment(); return; }
    setAnimando(true);
    setDirecao("saida");
    await new Promise(r => setTimeout(r, 240));
    setPerguntaAtual(p => p + 1);
    setDirecao("entrada");
    await new Promise(r => setTimeout(r, 50));
    setAnimando(false);
  }

  function voltar() {
    if (perguntaAtual === 0 || animando) return;
    setAnimando(true);
    setDirecao("entrada");
    setTimeout(() => {
      setPerguntaAtual(p => p - 1);
      setAnimando(false);
    }, 240);
  }

  async function finalizarAssessment() {
    if (!user?.id) return;
    setSalvando(true);
    const resultado = calcularResultado();
    await supabase.from("profiles").update({
      perfil_comportamental: resultado.perfil_principal,
    }).eq("user_id", user.id);
    sessionStorage.setItem("resultado_pca", JSON.stringify(resultado));
    navigate("/resultado-pca");
  }

  const progressPct = ((perguntaAtual + (respostaAtual ? 1 : 0)) / PERGUNTAS_PCA.length) * 100;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Hex grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <div className="hud-scan-line" />

      {/* Header */}
      <div
        className="relative z-10 flex-shrink-0 px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.3rem", letterSpacing: "0.06em" }}>
            <span style={{ color: "#F5F0E8" }}>NUTRI</span>
            <span style={{ color: GOLD, textShadow: `0 0 20px rgba(184,146,42,0.4)` }}>ON</span>
          </span>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.6)" }}>
              {perguntaAtual + 1} / {PERGUNTAS_PCA.length}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full" style={{ background: eixoColor, boxShadow: `0 0 4px ${eixoColor}` }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.15em", color: eixoColor, textTransform: "uppercase" }}>
                EIXO {pergunta.eixo}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-full relative overflow-hidden"
          style={{ height: 2, background: "rgba(184,146,42,0.1)" }}
        >
          <div
            className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${eixoColor}, ${eixoColor}cc)`,
              boxShadow: `0 0 8px ${eixoColor}66`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex-1 px-5 pt-6 pb-2 flex flex-col"
        style={{
          transform: animando
            ? direcao === "saida" ? "translateX(-32px)" : "translateX(32px)"
            : "translateX(0)",
          opacity: animando ? 0 : 1,
          transition: "all 0.24s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Question */}
        <h2
          className="mb-7"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.3rem, 4vw, 1.7rem)",
            color: "#F5F0E8",
            lineHeight: 1.3,
            letterSpacing: "0.02em",
          }}
        >
          {pergunta.pergunta}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {pergunta.opcoes.map((opcao) => {
            const sel = respostaAtual === opcao.id;
            return (
              <button
                key={opcao.id}
                onClick={() => responder(pergunta.id, opcao.id)}
                className="flex items-start gap-4 text-left transition-all duration-150 group relative overflow-hidden"
                style={{
                  padding: "16px 16px",
                  background: sel ? `rgba(${eixoColor === GOLD ? "184,146,42" : eixoColor === CYAN ? "0,212,255" : "0,200,150"},0.08)` : "rgba(10,10,26,0.6)",
                  border: `1px solid ${sel ? eixoColor + "55" : "rgba(80,80,122,0.2)"}`,
                  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}
              >
                {/* Top glow on selected */}
                {sel && (
                  <span
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${eixoColor}, transparent)` }}
                  />
                )}

                {/* Letter badge */}
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 28, height: 28,
                    background: sel ? eixoColor : "rgba(80,80,122,0.12)",
                    color: sel ? "#0a0a1a" : "rgba(80,80,122,0.7)",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    transition: "all 0.2s",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {opcao.id}
                </span>

                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    color: sel ? "#F5F0E8" : "rgba(245,240,232,0.65)",
                    transition: "color 0.2s",
                  }}
                >
                  {opcao.texto}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer nav */}
      <div className="relative z-10 flex-shrink-0 px-5 pb-8 pt-4 flex items-center gap-3">
        {perguntaAtual > 0 && (
          <button
            onClick={voltar}
            className="transition-colors"
            style={{
              padding: "12px 18px",
              background: "transparent",
              border: "1px solid rgba(80,80,122,0.3)",
              color: "rgba(80,80,122,0.7)",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              cursor: "pointer",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,80,122,0.7)")}
          >
            ← VOLTAR
          </button>
        )}
        <button
          onClick={avancar}
          disabled={!respostaAtual || salvando}
          style={{
            flex: 1,
            padding: "14px",
            background: respostaAtual ? eixoColor : "rgba(80,80,122,0.1)",
            color: respostaAtual ? "#0a0a1a" : "rgba(80,80,122,0.3)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            border: "none",
            cursor: respostaAtual ? "pointer" : "not-allowed",
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            transition: "all 0.2s",
          }}
        >
          {salvando ? "ANALISANDO PERFIL..." : isUltima ? "VER MEU PERFIL →" : "PRÓXIMA →"}
        </button>
      </div>
    </div>
  );
}
