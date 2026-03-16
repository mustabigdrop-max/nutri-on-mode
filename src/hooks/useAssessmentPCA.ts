import { useState } from "react";
import { PontuacaoPCA, ResultadoPCAType, PerfilPCA } from "@/types/pca";
import { PERGUNTAS_PCA } from "@/data/perguntas-pca";

export function useAssessmentPCA() {
  const [respostas, setRespostas] = useState<Record<number, string>>({});

  function responder(perguntaId: number, opcaoId: string) {
    setRespostas(prev => ({ ...prev, [perguntaId]: opcaoId }));
  }

  function calcularResultado(): ResultadoPCAType {
    const pontuacao: PontuacaoPCA = { SE: 0, EI: 0, PP: 0, AM: 0 };

    PERGUNTAS_PCA.forEach(pergunta => {
      const opcaoId = respostas[pergunta.id];
      if (!opcaoId) return;
      const opcao = pergunta.opcoes.find(o => o.id === opcaoId);
      if (!opcao) return;
      opcao.pontos.forEach(({ perfil, valor }) => {
        const key = perfil === "Sabotador Emocional" ? "SE"
          : perfil === "Executor Inconsistente" ? "EI"
          : perfil === "Perfeccionista Paralisado" ? "PP"
          : "AM";
        pontuacao[key] += valor;
      });
    });

    const ranking = Object.entries(pontuacao)
      .sort(([, a], [, b]) => b - a);

    const mapKey = (k: string): PerfilPCA =>
      k === "SE" ? "Sabotador Emocional"
      : k === "EI" ? "Executor Inconsistente"
      : k === "PP" ? "Perfeccionista Paralisado"
      : "Atleta Mental";

    return {
      perfil_principal: mapKey(ranking[0][0]),
      perfil_secundario: mapKey(ranking[1][0]),
      pontuacao,
    };
  }

  const totalRespondidas = Object.keys(respostas).length;
  const totalPerguntas = PERGUNTAS_PCA.length;
  const progresso = Math.round((totalRespondidas / totalPerguntas) * 100);

  return { respostas, responder, calcularResultado, progresso, totalRespondidas, totalPerguntas };
}
