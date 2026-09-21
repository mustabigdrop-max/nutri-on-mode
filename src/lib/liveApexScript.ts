// ARSENAL VIRAL — LIVE APEX ("APEX DIAGNÓSTICO")
// Roteirista da série. Usa apenas o diagnóstico real do atleta (grupos, tipos de
// deficit, evidências, protocolos ativos). Sem diagnóstico salvo, não há roteiro:
// nada é inventado e nenhum exercício é prescrito fora do que o APEX registrou.

export type LiveApexVariacao = "padrao" | "followup" | "comparativo" | "educativo" | "ao_vivo";

export const LIVE_APEX_VARIACOES: { key: LiveApexVariacao; label: string; desc: string }[] = [
  { key: "padrao", label: "EPISÓDIO PADRÃO", desc: "Análise nova de um atleta" },
  { key: "followup", label: "FOLLOW-UP", desc: "Semanas depois, antes × depois" },
  { key: "comparativo", label: "COMPARATIVO", desc: "Dois atletas, mesmo objetivo" },
  { key: "educativo", label: "EDUCATIVO", desc: "O deficit que mais aparece" },
  { key: "ao_vivo", label: "AO VIVO", desc: "Análise em tempo real" },
];

export interface DeficitGrupo {
  grupo: string;
  tipo: string;              // BIOMECANICO | ATIVACAO | VOLUME | ESTETICO
  severidade?: string | null;
  evidencias?: string[];
  protocolos?: string[];
}

export interface LiveApexInput {
  numeroEpisodio: number;
  variacao: LiveApexVariacao;
  atleta: string;              // primeiro nome ou apelido autorizado
  objetivo?: string | null;
  grupos: DeficitGrupo[];
  scoreAtual?: number | null;
  scoreAnterior?: number | null;
  semanasDecorridas?: number | null;
  segundoAtleta?: { nome: string; grupos: DeficitGrupo[] } | null;
}

export interface LiveApexBloco {
  nome: string;
  segundos: number;
  fala: string[];
  direcao: string;
}

export interface LiveApexRoteiro {
  titulo: string;
  duracaoSegundos: number;
  blocos: LiveApexBloco[];
  hashtags: string[];
  legenda: string;
}

export const LIVE_APEX_HASHTAGS = [
  "#APEXDiagnostico", "#CoachDiogoMello", "#nutriON", "#TransformaçãoÉSistema",
  "#Bodybuilding", "#FitnessCoach", "#AvaliaçãoFísica", "#TreinoInteligente", "#CiênciaDoTreino",
];

const TIPO_FALA: Record<string, string> = {
  BIOMECANICO: "o padrão de movimento está travando o grupo — aqui corretivo vem antes de carga",
  ATIVACAO: "o músculo não está sendo recrutado no exercício — falta conexão, não falta peso",
  VOLUME: "o estímulo semanal está abaixo do que esse grupo precisa",
  ESTETICO: "proporção: o grupo responde, mas está atrás do conjunto",
};

function prioridade(grupos: DeficitGrupo[]): DeficitGrupo[] {
  const ordem = ["BIOMECANICO", "ATIVACAO", "VOLUME", "ESTETICO"];
  return [...grupos]
    .filter((g) => g.grupo && g.tipo)
    .sort((a, b) => ordem.indexOf(a.tipo.toUpperCase()) - ordem.indexOf(b.tipo.toUpperCase()))
    .slice(0, 3);
}

/** Retorna null quando não há nenhum deficit registrado para roteirizar. */
export function gerarRoteiroLiveApex(input: LiveApexInput): LiveApexRoteiro | null {
  const foco = prioridade(input.grupos);
  if (!foco.length) return null;

  const principal = foco[0];
  const tipo = principal.tipo.toUpperCase();
  const explicacao = TIPO_FALA[tipo] || "o APEX registrou um deficit nesse grupo";
  const titulo =
    input.variacao === "educativo"
      ? "O deficit que MAIS encontro nos meus alunos"
      : input.variacao === "followup"
        ? `APEX DIAGNÓSTICO #${input.numeroEpisodio} — ${input.semanasDecorridas ?? "?"} semanas depois`
        : input.variacao === "comparativo"
          ? `APEX DIAGNÓSTICO #${input.numeroEpisodio} — 2 atletas, mesmo objetivo`
          : input.variacao === "ao_vivo"
            ? `APEX AO VIVO #${input.numeroEpisodio}`
            : `APEX DIAGNÓSTICO #${input.numeroEpisodio}`;

  const blocos: LiveApexBloco[] = [];

  blocos.push({
    nome: "HOOK",
    segundos: 5,
    fala: [
      "Fala, aqui é o Diogo Mello.",
      input.variacao === "educativo"
        ? `O deficit que eu mais encontro é ${tipo === "ATIVACAO" ? "falta de ativação" : principal.grupo.toLowerCase()}. E quase ninguém trata.`
        : `Olha o ${principal.grupo.toLowerCase()} do ${input.atleta}. O problema não é o que você está pensando.`,
    ],
    direcao: "Corte seco na foto de avaliação, zoom no grupo em questão",
  });

  blocos.push({
    nome: "ANÁLISE",
    segundos: 18,
    fala: [
      `O APEX marcou ${foco.length === 1 ? "um grupo" : `${foco.length} grupos`} em prioridade: ${foco.map((g) => `${g.grupo} (${g.tipo.toUpperCase()})`).join(", ")}.`,
      `No ${principal.grupo.toLowerCase()}, ${explicacao}.`,
      ...(principal.evidencias?.length ? [`O que apareceu na avaliação: ${principal.evidencias.slice(0, 3).join("; ")}.`] : []),
      ...(input.scoreAtual !== null && input.scoreAtual !== undefined ? [`Score geral registrado: ${Math.round(input.scoreAtual)}.`] : []),
    ],
    direcao: "Mapa muscular acendendo grupo por grupo conforme são citados",
  });

  blocos.push({
    nome: "PRESCRIÇÃO",
    segundos: 15,
    fala: [
      tipo === "BIOMECANICO"
        ? "Primeiro passo: protocolo CORRECT antes de tudo. Sem padrão limpo, carga é só reforçar o erro."
        : "Primeiro passo: ativação antes do treino do grupo, e o grupo abre a sessão.",
      ...(principal.protocolos?.length
        ? [`Protocolos que entraram no plano dele: ${principal.protocolos.slice(0, 3).join(", ")}.`]
        : ["O protocolo específico sai do próprio diagnóstico, não de fórmula genérica."]),
      "O STRATUM já reescreve o treino com isso. O NutriPlan ajusta o entorno da sessão.",
    ],
    direcao: "Tela do plano com as tags CORRECT e ACTIVATE em destaque",
  });

  if (input.variacao === "followup" && input.scoreAnterior !== null && input.scoreAnterior !== undefined && input.scoreAtual) {
    const delta = Math.round(input.scoreAtual) - Math.round(input.scoreAnterior);
    blocos.push({
      nome: "RESULTADO",
      segundos: 12,
      fala: [
        `${input.semanasDecorridas ?? "Algumas"} semanas depois: score ${Math.round(input.scoreAnterior)} → ${Math.round(input.scoreAtual)} (${delta >= 0 ? "+" : ""}${delta}).`,
        "Antes e depois lado a lado, com os números da reavaliação.",
      ],
      direcao: "Split screen do APEX Evolution, antes × depois",
    });
  }

  if (input.variacao === "comparativo" && input.segundoAtleta) {
    const outro = prioridade(input.segundoAtleta.grupos);
    blocos.push({
      nome: "COMPARATIVO",
      segundos: 14,
      fala: [
        `Mesmo objetivo, diagnóstico diferente: ${input.segundoAtleta.nome} tem ${outro.map((g) => `${g.grupo} (${g.tipo.toUpperCase()})`).join(", ") || "outro quadro"}.`,
        "Mesmo objetivo não significa mesmo treino. É por isso que avaliação vem antes de planilha.",
      ],
      direcao: "Dois mapas musculares lado a lado",
    });
  }

  blocos.push({
    nome: "CTA",
    segundos: 7,
    fala: [
      "Quer saber qual é o seu deficit? Faz o diagnóstico em nutrion.app.br.",
      "Transformação é sistema.",
    ],
    direcao: "Logo nutriON, tagline e endereço no rodapé",
  });

  const duracaoSegundos = blocos.reduce((a, b) => a + b.segundos, 0);

  return {
    titulo,
    duracaoSegundos,
    blocos,
    hashtags: LIVE_APEX_HASHTAGS,
    legenda:
      `${titulo}\n\n` +
      `${foco.map((g) => `${g.grupo}: ${g.tipo.toUpperCase()}`).join(" · ")}\n` +
      "Diagnóstico registrado no APEX, prescrição no STRATUM, reavaliação marcada.\n\n" +
      "Transformação é sistema.\n\n" +
      LIVE_APEX_HASHTAGS.join(" "),
  };
}

export function roteiroComoTexto(r: LiveApexRoteiro): string {
  const linhas = [r.titulo, `Duração: ~${r.duracaoSegundos}s`, ""];
  r.blocos.forEach((b) => {
    linhas.push(`[${b.nome} — ${b.segundos}s]`);
    b.fala.forEach((f) => linhas.push(`  "${f}"`));
    linhas.push(`  Direção: ${b.direcao}`, "");
  });
  linhas.push("LEGENDA:", r.legenda);
  return linhas.join("\n");
}
