/**
 * "📲 Criar conteúdo" — motor universal por módulo do nutriON.
 *
 * Detecta em qual módulo o coach está, coleta os dados REAIS daquela tela
 * (TrainingON, NutriPlan, NutrySync, BiomechanicsVault, NEXUS-BIO, Diagnóstico)
 * e envia para o gerador. Nada é inventado: quando não existe dado real, o
 * campo simplesmente não é enviado e o conteúdo se adapta.
 */

import { getDadosRefeicao } from "@/lib/refeicaoData";
import { getProtocoloPreferido, getTreinoDeHoje } from "@/lib/treinoHojeData";

export type ModuloConteudo =
  | "TRAINING_ON"
  | "NUTRI_PLAN"
  | "NUTRI_SYNC"
  | "BIOMECHANICS"
  | "PEPTIDE_VAULT"
  | "MICROBIOTA_VAULT"
  | "STEROID_VAULT"
  | "DIAGNOSTICO"
  | "SOCIAL_ON";

export type ConfigModulo = {
  label: string;
  titulo: string;
  tom: string;
  cta: string;
  emojis: string;
  hashtagsFixas: string[];
  nuncaMencionar: string[];
  disclaimer?: boolean;
};

export const CONFIGS_MODULO: Record<ModuloConteudo, ConfigModulo> = {
  TRAINING_ON: {
    label: "TrainingON",
    titulo: "TRAININGON · APEX SYSTEM",
    tom: "coach mostrando seu treino real com orgulho técnico",
    cta: "Protocolo APEX completo no nutriON — link na bio",
    emojis: "🏋️💪⚡",
    hashtagsFixas: ["#treinointeligente", "#nutrion", "#apexsystem"],
    nuncaMencionar: [],
  },
  NUTRI_PLAN: {
    label: "NutriPlan",
    titulo: "NUTRIPLAN · CIÊNCIA NO PRATO",
    tom: "educador que traduz ciência no prato",
    cta: "Plano alimentar com ciência — link na bio",
    emojis: "🍽️🧬📊",
    hashtagsFixas: ["#nutricaoreal", "#nutrion", "#macros"],
    nuncaMencionar: ["MCE"],
  },
  NUTRI_SYNC: {
    label: "NutrySync",
    titulo: "NUTRISYNC · AJUSTE INTELIGENTE",
    tom: "fundador mostrando tecnologia inovadora",
    cta: "nutriON ajusta seu plano automaticamente — link na bio",
    emojis: "📊⚡🔥",
    hashtagsFixas: ["#nutrion", "#fitnesstech", "#nutrisync"],
    nuncaMencionar: [],
  },
  BIOMECHANICS: {
    label: "BiomechanicsVault",
    titulo: "BIOMECHANICSVAULT",
    tom: "professor de biomecânica que fala como personal",
    cta: "Análise biomecânica completa no nutriON — link na bio",
    emojis: "🔬⚙️💪",
    hashtagsFixas: ["#biomecanica", "#nutrion", "#execucaocorreta"],
    nuncaMencionar: ["MCE", "peptídeos"],
  },
  PEPTIDE_VAULT: {
    label: "PeptideVault",
    titulo: "NEXUS-BIO · PEPTIDEVAULT",
    tom: "educador científico imparcial",
    cta: "PeptideVault completa no nutriON — link na bio",
    emojis: "🧬🔬📊",
    hashtagsFixas: ["#peptideos", "#nutrion", "#ciencia"],
    nuncaMencionar: ["MCE"],
    disclaimer: true,
  },
  MICROBIOTA_VAULT: {
    label: "MicrobiotaVault",
    titulo: "NEXUS-BIO · MICROBIOTAVAULT",
    tom: "tradutor de ciência intestinal",
    cta: "Enciclopédia de microbiota no nutriON — link na bio",
    emojis: "🦠🧬🔬",
    hashtagsFixas: ["#microbiota", "#nutrion", "#saudeintestinal"],
    nuncaMencionar: ["MCE"],
    disclaimer: true,
  },
  STEROID_VAULT: {
    label: "SteroidVault",
    titulo: "NEXUS-BIO · STEROIDVAULT",
    tom: "harm reduction baseado em ciência",
    cta: "Informação que pode salvar sua saúde — link na bio",
    emojis: "💉🔬📊",
    hashtagsFixas: ["#harmreduction", "#nutrion", "#ciencia"],
    nuncaMencionar: ["MCE"],
    disclaimer: true,
  },
  DIAGNOSTICO: {
    label: "Diagnóstico MCE",
    titulo: "DIAGNÓSTICO MCE",
    tom: "coach que entende o padrão comportamental",
    cta: "Diagnóstico MCE gratuito — link na bio",
    emojis: "🧠⚡🎯",
    hashtagsFixas: ["#metodomce", "#nutrion", "#diagnostico"],
    nuncaMencionar: [],
  },
  SOCIAL_ON: {
    label: "Social ON",
    titulo: "SOCIAL ON · PLANO DO DIA",
    tom: "fundador mostrando os bastidores do sistema",
    cta: "Diagnóstico MCE gratuito — link na bio",
    emojis: "📲⚡🎯",
    hashtagsFixas: ["#nutrion", "#metodomce", "#conteudo"],
    nuncaMencionar: [],
  },
};

export type TipoConteudo = {
  id: string;
  emoji: string;
  titulo: string;
  descricao: string;
  formatos: ("carrossel" | "reels" | "stories")[];
};

export const TIPOS_POR_MODULO: Record<ModuloConteudo, TipoConteudo[]> = {
  TRAINING_ON: [
    { id: "treino_completo", emoji: "💪", titulo: "Meu treino completo", descricao: "O treino inteiro do dia: exercícios, séries, APEX e tempo.", formatos: ["carrossel", "reels", "stories"] },
    { id: "exercicio_destaque", emoji: "🏋️", titulo: "Exercício destaque", descricao: "Um exercício do dia: execução, erros e biomecânica.", formatos: ["carrossel", "reels", "stories"] },
    { id: "apex_explicado", emoji: "🔬", titulo: "APEX System explicado", descricao: "Feeder Set, Top Set, Back-off e RPE com o treino de hoje como exemplo.", formatos: ["carrossel", "reels", "stories"] },
    { id: "mapa_muscular", emoji: "📊", titulo: "Mapa muscular do dia", descricao: "Grupos trabalhados hoje e o papel de cada exercício.", formatos: ["carrossel", "stories"] },
    { id: "comparativo_exercicios", emoji: "🆚", titulo: "Comparativo de exercícios", descricao: "Dois exercícios do treino de hoje, lado a lado.", formatos: ["carrossel"] },
    { id: "react_coach", emoji: "💀", titulo: "React Coach", descricao: "Roteiro reagindo a erros nos exercícios de hoje.", formatos: ["reels"] },
    { id: "aquecimento_apex", emoji: "⏱️", titulo: "Aquecimento APEX", descricao: "O aquecimento real de hoje e por que ele muda o treino.", formatos: ["carrossel", "reels", "stories"] },
  ],
  NUTRI_PLAN: [
    { id: "plano_do_dia", emoji: "🍽️", titulo: "Meu plano completo do dia", descricao: "Refeições com macros, medidas caseiras e propósito de cada uma.", formatos: ["carrossel", "reels", "stories"] },
    { id: "refeicao_ciencia", emoji: "🔬", titulo: "Refeição + ciência", descricao: "Uma refeição real e a ciência de cada alimento.", formatos: ["carrossel", "reels", "stories"] },
    { id: "medidas_caseiras", emoji: "📏", titulo: "Medidas caseiras explicadas", descricao: "Como medir sem balança usando as porções do plano.", formatos: ["carrossel", "stories"] },
    { id: "temperos", emoji: "⚡", titulo: "Temperos funcionais", descricao: "A ciência dos temperos que estão no plano.", formatos: ["carrossel", "stories"] },
    { id: "timing", emoji: "🕐", titulo: "Timing nutricional", descricao: "Pré, pós-treino e ceia — quando comer importa.", formatos: ["carrossel", "reels", "stories"] },
    { id: "mito_metodo_nutri", emoji: "🆚", titulo: "Mito ou método nutricional", descricao: "Crenças comuns testadas contra evidência.", formatos: ["carrossel"] },
  ],
  NUTRI_SYNC: [
    { id: "ajuste_automatico", emoji: "📊", titulo: "Como o plano ajusta calorias sozinho", descricao: "Base + ajuste do treino = meta, com os números reais de hoje.", formatos: ["carrossel", "reels", "stories"] },
    { id: "treino_vs_off", emoji: "🆚", titulo: "Dia de treino vs dia off", descricao: "O plano que respira conforme o gasto do dia.", formatos: ["carrossel"] },
    { id: "mito_calorias_fixas", emoji: "💀", titulo: "Mito: comer sempre as mesmas calorias", descricao: "Por que dieta fixa perde para ajuste dinâmico.", formatos: ["carrossel"] },
  ],
  BIOMECHANICS: [
    { id: "execucao", emoji: "⚙️", titulo: "Execução correta", descricao: "Ângulos, amplitude e erros do exercício em foco.", formatos: ["carrossel", "reels", "stories"] },
    { id: "anatomia", emoji: "🔬", titulo: "Anatomia e recrutamento", descricao: "O que cada músculo faz no movimento.", formatos: ["carrossel", "stories"] },
    { id: "comparativo_biomec", emoji: "🆚", titulo: "Comparativo de variações", descricao: "Duas variações do mesmo padrão de movimento.", formatos: ["carrossel"] },
  ],
  PEPTIDE_VAULT: [
    { id: "composto", emoji: "🧬", titulo: "Composto em foco", descricao: "Mecanismo, evidência, riscos e status regulatório.", formatos: ["carrossel", "reels", "stories"] },
  ],
  MICROBIOTA_VAULT: [
    { id: "microbiota", emoji: "🦠", titulo: "Item da MicrobiotaVault", descricao: "Cepa/fibra em foco com evidência real.", formatos: ["carrossel", "reels", "stories"] },
  ],
  STEROID_VAULT: [
    { id: "harm_reduction", emoji: "💉", titulo: "Harm reduction", descricao: "Riscos, marcadores e monitoramento — educativo.", formatos: ["carrossel", "stories"] },
  ],
  DIAGNOSTICO: [
    { id: "como_funciona", emoji: "🧠", titulo: "Como funciona o diagnóstico", descricao: "As 14 perguntas, o radar e o gap identificado.", formatos: ["carrossel", "reels", "stories"] },
    { id: "resultado_real", emoji: "📊", titulo: "Resultado real (anonimizado)", descricao: "Scores M, C e E de um caso real e o que significam.", formatos: ["carrossel", "stories"] },
    { id: "qual_pilar", emoji: "🎯", titulo: "Qual pilar te trava?", descricao: "Enquete M vs C vs E com CTA direto.", formatos: ["stories"] },
    { id: "evolucao", emoji: "📈", titulo: "Evolução com dados", descricao: "Antes e depois de scores reais registrados.", formatos: ["carrossel", "stories"] },
  ],
  SOCIAL_ON: [
    { id: "bastidor", emoji: "📲", titulo: "Bastidor do sistema", descricao: "Como o plano de conteúdo do dia é montado.", formatos: ["carrossel", "reels", "stories"] },
  ],
};

/** Detecta o módulo pela rota atual. Retorna null em telas públicas/neutras. */
export function detectarModulo(pathname: string): ModuloConteudo | null {
  const p = pathname.toLowerCase();
  if (p.includes("/my-training") || p.includes("/training")) return "TRAINING_ON";
  if (p.includes("/my-plan") || p.includes("/plano-alimentar") || p.includes("/nutriplan")) return "NUTRI_PLAN";
  if (p.includes("/nutrisync") || p.includes("/nutrysync") || p.includes("/dashboard")) return "NUTRI_SYNC";
  if (p.includes("/biomechanics")) return "BIOMECHANICS";
  if (p.includes("/peptide-vault")) return "PEPTIDE_VAULT";
  if (p.includes("/microbiota-vault")) return "MICROBIOTA_VAULT";
  if (p.includes("/steroid-vault")) return "STEROID_VAULT";
  if (p.includes("/leads") || p.includes("/diagnostico") || p.includes("/clientes")) return "DIAGNOSTICO";
  if (p.includes("/coach/social") || p.includes("/social")) return "SOCIAL_ON";
  return null;
}

export type DadosModulo = {
  /** Linha de contexto mostrada no topo do painel. */
  resumo: string;
  /** Dados reais enviados ao gerador (JSON). */
  dados: Record<string, unknown> | null;
  /** Opções para o seletor de foco (exercício, refeição, etc). */
  focos: string[];
};

const vazio = (resumo: string): DadosModulo => ({ resumo, dados: null, focos: [] });

/** Coleta os dados reais da tela atual. Sem dado real → nada é inventado. */
export async function coletarDadosModulo(modulo: ModuloConteudo): Promise<DadosModulo> {
  try {
    if (modulo === "TRAINING_ON" || modulo === "BIOMECHANICS") {
      const treino = await getTreinoDeHoje(getProtocoloPreferido() || undefined);
      if (!treino) return vazio("Nenhum treino encontrado para hoje no TrainingON.");
      return {
        resumo: `${treino.nomeTreino}${treino.duracao ? ` · ${treino.duracao}` : ""} · ${treino.diaSemana}`,
        dados: {
          nome_treino: treino.nomeTreino,
          duracao: treino.duracao,
          dia_semana: treino.diaSemana,
          grupos: treino.grupos,
          aquecimento: treino.aquecimento,
          exercicios: treino.exercicios,
          nutricao: treino.nutricao,
        },
        focos: treino.exercicios.map((e) => e.nome),
      };
    }

    if (modulo === "NUTRI_PLAN" || modulo === "NUTRI_SYNC") {
      const ref = await getDadosRefeicao();
      if (!ref) return vazio("Nenhuma refeição do plano encontrada para agora.");
      const ns = ref.nutrisync;
      const resumo =
        modulo === "NUTRI_SYNC" && ns
          ? `Base ${ns.base ?? "—"} + ajuste ${ns.ajusteTreino ?? "—"} = meta ${ns.meta ?? "—"} kcal`
          : `${ref.nome}${ref.calorias ? ` · ${ref.calorias} kcal` : ""}`;
      return {
        resumo,
        dados: {
          refeicao: ref.nome,
          horario: ref.horario,
          tag: ref.tag,
          calorias: ref.calorias,
          macros: ref.macros,
          alimentos: ref.alimentos,
          ciencia: ref.ciencia.map((c) => ({ alimento: c.alimento, ciencia: c.ciencia })),
          nutrisync: ns,
          treino_hoje: ref.treinoHoje,
        },
        focos: ref.alimentos.map((a) => a.nome),
      };
    }

    return vazio("Conteúdo gerado a partir do conteúdo científico curado deste módulo.");
  } catch {
    return vazio("Não consegui ler os dados desta tela agora.");
  }
}
