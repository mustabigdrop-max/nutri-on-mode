import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAssessmentPCA } from "@/hooks/useAssessmentPCA";
import { PERGUNTAS_PCA } from "@/data/perguntas-pca";
import { cn } from "@/lib/utils";

const EIXO_COLORS: Record<string, string> = {
  MINDSET: "border-primary text-primary",
  COMPORTAMENTO: "border-blue-500 text-blue-400",
  "EXECUÇÃO": "border-emerald-500 text-emerald-400",
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

  async function avancar() {
    if (!respostaAtual || animando) return;

    if (isUltima) {
      await finalizarAssessment();
      return;
    }

    setAnimando(true);
    setDirecao("saida");
    await new Promise(r => setTimeout(r, 250));
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
    }, 250);
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

  return (
    <div className="min-h-screen bg-[#0D0D0B] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl">
            <span className="text-[#F5F4F0]">nutri</span>
            <span className="text-primary">ON</span>
          </div>
          <span className="text-sm text-[#666]">
            {perguntaAtual + 1} de {PERGUNTAS_PCA.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#1A1A18] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((perguntaAtual + (respostaAtual ? 1 : 0)) / PERGUNTAS_PCA.length) * 100}%` }}
          />
        </div>

        {/* Eixo badge */}
        <div className="mt-4">
          <span className={cn(
            "text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full border",
            EIXO_COLORS[pergunta.eixo]
          )}>
            EIXO {pergunta.eixo}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div
        className="flex-1 px-5 flex flex-col"
        style={{
          transform: animando
            ? direcao === "saida" ? "translateX(-40px)" : "translateX(40px)"
            : "translateX(0)",
          opacity: animando ? 0 : 1,
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <h2
          className="text-[#F5F4F0] text-[22px] leading-[1.35] mb-8 mt-2"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {pergunta.pergunta}
        </h2>

        <div className="flex flex-col gap-3">
          {pergunta.opcoes.map((opcao) => {
            const selecionada = respostaAtual === opcao.id;
            return (
              <button
                key={opcao.id}
                onClick={() => responder(pergunta.id, opcao.id)}
                className={cn(
                  "flex items-start gap-4 p-[18px] rounded-[14px] text-left transition-all duration-150 border-[1.5px]",
                  selecionada
                    ? "bg-primary/10 border-primary"
                    : "bg-[#151513] border-[#2A2A27] hover:border-[#3A3A37]"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5",
                  selecionada
                    ? "bg-primary text-[#0D0D0B]"
                    : "bg-[#1E1E1C] text-[#666]"
                )}>
                  {opcao.id}
                </span>
                <span className="text-[15px] leading-[1.5] text-[#F5F4F0]">
                  {opcao.texto}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 pb-8 pt-4 flex items-center gap-3">
        {perguntaAtual > 0 && (
          <button
            onClick={voltar}
            className="px-5 py-3.5 rounded-[14px] border border-[#2A2A27] text-[#666] text-sm font-medium"
          >
            ← Voltar
          </button>
        )}
        <button
          onClick={avancar}
          disabled={!respostaAtual || salvando}
          className={cn(
            "flex-1 py-3.5 rounded-[14px] text-base font-bold transition-all duration-200",
            respostaAtual
              ? "bg-primary text-[#0D0D0B] hover:brightness-110"
              : "bg-[#1A1A18] text-[#333] cursor-not-allowed"
          )}
        >
          {salvando ? "Analisando..." : isUltima ? "Ver meu perfil →" : "Próxima →"}
        </button>
      </div>
    </div>
  );
}
