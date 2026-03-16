export type PerfilPCA =
  | "Atleta Mental"
  | "Sabotador Emocional"
  | "Executor Inconsistente"
  | "Perfeccionista Paralisado";

export interface OpcaoResposta {
  id: string;
  texto: string;
  pontos: { perfil: PerfilPCA; valor: number }[];
}

export interface PerguntaPCA {
  id: number;
  eixo: "MINDSET" | "COMPORTAMENTO" | "EXECUÇÃO";
  pergunta: string;
  opcoes: OpcaoResposta[];
}

export interface PontuacaoPCA {
  SE: number;
  EI: number;
  PP: number;
  AM: number;
}

export interface ResultadoPCAType {
  perfil_principal: PerfilPCA;
  perfil_secundario: PerfilPCA;
  pontuacao: PontuacaoPCA;
}
