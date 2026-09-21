/**
 * KINESIS — tipos compartilhados da base de ciência do exercício do nutriON.
 * Alimenta APEX (protocolos), STRATUM (seleção de exercícios e cues) e
 * SOCIAL ON (geração de conteúdo). Nunca se apresenta como IA: é "a base de
 * ciência do exercício" / "o atlas de movimento".
 */

/** Badge de confiabilidade da informação exibida ao coach e no conteúdo. */
export type KinesisBadge = "ESTUDO" | "DADO" | "ESTIMATIVA" | "DICA" | "MITO" | "BRO SCIENCE";

export type DeficitKinesis = "BIOMECANICO" | "ATIVACAO" | "VOLUME" | "ESTETICO" | "ASSIMETRIA" | "MANUTENCAO";

export type NivelKinesis = "iniciante" | "intermediario" | "avancado";

export type TempoPrescrito = {
  padrao: string;
  ativacao: string;
  forca: string;
};

export type ExecucaoKinesis = {
  posicao_inicial: string;
  fase_concentrica: string;
  fase_excentrica: string;
  respiracao: string;
  amplitude_ideal: string;
  tempo_recomendado: TempoPrescrito;
};

export type CuesKinesis = {
  cue_primario: string;
  cue_secundario: string;
  cue_ajuste: string;
  cue_conexao_mente_musculo: string;
};

export type ErroComum = {
  erro: string;
  consequencia: string;
  correcao: string;
  indicador_visual: string;
};

export type VariacaoKinesis = {
  variacao: string;
  diferenca: string;
  quando: string;
  contra: string;
};

export type PrescricaoObjetivo = {
  series: string;
  reps: string;
  rpe: string;
  descanso: string;
  nota?: string;
};

export type EmgKinesis = {
  /** Referência real do dado ou "ESTIMATIVA BIOMECÂNICA" quando não há paper. */
  fonte: string;
  badge: KinesisBadge;
  ativacao: Array<{ musculo: string; nivel: string }>;
  nota?: string;
};

export type ConteudoSocialKinesis = {
  hooks: string[];
  dados_impacto: Array<{ texto: string; badge: KinesisBadge; fonte?: string }>;
  formato_sugerido: FormatoConteudo;
};

export type ExercicioKinesis = {
  id: string;
  exercicio: string;
  grupo_primario: string;
  grupos_secundarios: string[];
  subgrupo_enfase: Record<string, string>;
  classificacao: {
    tipo: "composto" | "isolador";
    padrao_motor: string;
    cadeia_cinetica: "aberta" | "fechada";
    plano_movimento: string;
    articulacoes: string[];
    nivel_minimo: NivelKinesis;
  };
  execucao: ExecucaoKinesis;
  cues_coaching: CuesKinesis;
  erros_comuns: ErroComum[];
  variacoes_e_quando_usar: VariacaoKinesis[];
  prescricao_por_objetivo: {
    hipertrofia: PrescricaoObjetivo;
    forca: PrescricaoObjetivo;
    ativacao_neuromuscular: PrescricaoObjetivo;
    correcao_biomecanica: PrescricaoObjetivo;
  };
  emg: EmgKinesis;
  conteudo_social: ConteudoSocialKinesis;
};

export type SubgrupoKinesis = {
  subgrupo: string;
  funcao: string;
  exercicios_prioritarios: string[];
  principio: string;
  cue_chave: string;
  volume_recomendado: string;
  erro_comum?: string;
  nota_apex?: string;
};

export type DossieGrupo = {
  grupo: string;
  anatomia_resumo: string;
  subgrupos: SubgrupoKinesis[];
  principio_geral: string;
  treino_exemplo?: {
    contexto: string;
    exercicios: Array<{ ordem: number; exercicio: string; series_reps: string; nota: string }>;
    volume_total: string;
    nota: string;
  };
  temas_conteudo: string[];
};

export type FormatoConteudo =
  | "CARROSSEL_EDUCATIVO"
  | "REEL_ROTEIRO"
  | "POST_ESTATICO"
  | "STORY_SEQUENCIA"
  | "LEGENDA_LONGA";

export const FORMATO_LABEL: Record<FormatoConteudo, string> = {
  CARROSSEL_EDUCATIVO: "Carrossel educativo (6-10 slides)",
  REEL_ROTEIRO: "Roteiro de Reel (30-45s)",
  POST_ESTATICO: "Post estático (imagem única)",
  STORY_SEQUENCIA: "Sequência de stories (3-5)",
  LEGENDA_LONGA: "Legenda longa / thread",
};

export const BADGE_COR: Record<KinesisBadge, string> = {
  ESTUDO: "#5DCAA5",
  DADO: "#00D4FF",
  ESTIMATIVA: "#AFA9EC",
  DICA: "#EF9F27",
  MITO: "#D8402E",
  "BRO SCIENCE": "#888",
};
