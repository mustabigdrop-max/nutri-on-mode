import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAssessmentPCA } from "@/hooks/useAssessmentPCA";
import { PERGUNTAS_PCA } from "@/data/perguntas-pca";
import { HudShell, HudStatusBar, HudHex, HudPanel } from "@/components/hud/HudShell";
import { ArrowLeft, ArrowRight } from "lucide-react";

const EIXO_COLORS: Record<string, string> = {
  MINDSET: "#B8922A",
  COMPORTAMENTO: "#00D4FF",
  "EXECUÇÃO": "#00C896",
};

export default function AssessmentPCA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { respostas, responder, calcularResultado } = useAssessmentPCA();

  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [direcao, setDirecao] = useState<"entrada" | "saida">("entrada");
  const [salvando, setSalvando] = useState(false);

  const pergunta = PERGUNTAS_PCA[perguntaAtual];
  const respostaAtual = respostas[pergunta.id];
  const isUltima = perguntaAtual === PERGUNTAS_PCA.length - 1;
  const eixoColor = EIXO_COLORS[pergunta.eixo] || "#B8922A";

  async function avancar() {
    if (!respostaAtual || animando) return;
    if (isUltima) { await finalizarAssessment(); return; }
    setAnimando(true);
    setDirecao("saida");
    await new Promise(r => setTimeout(r, 220));
    setPerguntaAtual(p => p + 1);
    setDirecao("entrada");
    await new Promise(r => setTimeout(r, 50));
    setAnimando(false);
  }

  function voltar() {
    if (perguntaAtual === 0 || animando) return;
    setAnimando(true);
    setDirecao("entrada");
    setTimeout(() => { setPerguntaAtual(p => p - 1); setAnimando(false); }, 220);
  }

  async function finalizarAssessment() {
    if (!user?.id) return;
    setSalvando(true);
    const resultado = calcularResultado();
    await supabase.from("profiles").update({ perfil_comportamental: resultado.perfil_principal }).eq("user_id", user.id);
    sessionStorage.setItem("resultado_pca", JSON.stringify(resultado));
    navigate("/resultado-pca");
  }

  const progressPct = ((perguntaAtual + (respostaAtual ? 1 : 0)) / PERGUNTAS_PCA.length) * 100;

  return (
    <HudShell>
      <div className="min-h-screen flex flex-col px-5 py-6 max-w-2xl mx-auto w-full">
        <HudStatusBar
          label="PCA-MODULE"
          meta={`Q · ${String(perguntaAtual + 1).padStart(2, "0")}/${String(PERGUNTAS_PCA.length).padStart(2, "0")}`}
          color={eixoColor}
        />

        <div className="flex items-center justify-between mt-5">
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.08em" }}>
            <span style={{ color: "#F5F0E8" }}>NUTRI</span>
            <span style={{ color: "#B8922A" }}>ON</span>
          </div>
          <span className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
            {perguntaAtual + 1} DE {PERGUNTAS_PCA.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full mt-4" style={{ height: 2, background: "rgba(184,146,42,0.1)" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: eixoColor,
              boxShadow: `0 0 12px ${eixoColor}`,
              transition: "width 0.4s ease-out",
            }}
          />
        </div>

        {/* Eixo badge */}
        <div className="mt-5 flex items-center gap-2 hud-tech" style={{ color: eixoColor }}>
          <span className="hud-status-dot" />
          EIXO · {pergunta.eixo}
        </div>

        {/* Pergunta + opções */}
        <HudPanel
          tag={`Q · ${String(perguntaAtual + 1).padStart(2, "0")}`}
          tagColor={eixoColor}
          className="flex-1 mt-6 p-6"
        >
          <div
            style={{
              transform: animando
                ? direcao === "saida" ? "translateX(-40px)" : "translateX(40px)"
                : "translateX(0)",
              opacity: animando ? 0 : 1,
              transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h2
              className="mb-8"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: 24,
                lineHeight: 1.3,
                color: "#F5F0E8",
                letterSpacing: "0.02em",
              }}
            >
              {pergunta.pergunta}
            </h2>

            <div className="flex flex-col gap-3">
              {pergunta.opcoes.map((opcao) => {
                const sel = respostaAtual === opcao.id;
                return (
                  <button
                    key={opcao.id}
                    onClick={() => responder(pergunta.id, opcao.id)}
                    className="relative flex items-start gap-4 p-4 text-left transition-all"
                    style={{
                      background: sel ? `${eixoColor}14` : "rgba(10,10,26,0.7)",
                      border: `1px solid ${sel ? eixoColor : "rgba(184,146,42,0.15)"}`,
                      clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    {sel && (
                      <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${eixoColor}, transparent)` }}
                      />
                    )}
                    <HudHex code={opcao.id} color={eixoColor} size={36} />
                    <span
                      className="flex-1 pt-1"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#F5F0E8",
                      }}
                    >
                      {opcao.texto}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </HudPanel>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-6 pt-4">
          {perguntaAtual > 0 && (
            <button
              onClick={voltar}
              className="hud-btn hud-btn-outline flex items-center gap-2"
              style={{ padding: "0.75rem 1rem" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> VOLTAR
            </button>
          )}
          <button
            onClick={avancar}
            disabled={!respostaAtual || salvando}
            className="hud-btn flex-1 flex items-center justify-center gap-2"
            style={{ background: eixoColor }}
          >
            {salvando ? "ANALISANDO..." : isUltima ? "VER PERFIL" : "PRÓXIMA"}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </HudShell>
  );
}
