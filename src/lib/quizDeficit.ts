/**
 * Quiz "Descubra seu Deficit" — versão pública simplificada do checklist
 * funcional do APEX. 10 perguntas, pontuação por tipo de deficit.
 * Empate: BIOMECÂNICO > ATIVAÇÃO > VOLUME (regra do APEX Assessment Pipeline).
 */

export type DeficitKey =
  | "ativacao_gluteo"
  | "ativacao_dorsal"
  | "ativacao_peitoral"
  | "biomecanico"
  | "volume_posterior"
  | "assimetria";

export interface QuizOpcao {
  texto: string;
  pontos: Partial<Record<DeficitKey, number>>;
}

export interface QuizPergunta {
  id: string;
  pergunta: string;
  opcoes: QuizOpcao[];
}

export const QUIZ_PERGUNTAS: QuizPergunta[] = [
  {
    id: "q1",
    pergunta: "Quando você agacha, o que sente trabalhar MAIS?",
    opcoes: [
      { texto: "Glúteos trabalhando junto", pontos: {} },
      { texto: "Quadríceps queimando, glúteo quase nada", pontos: { ativacao_gluteo: 1 } },
      { texto: "Joelho incomoda ou entra para dentro", pontos: { biomecanico: 2 } },
      { texto: "Lombar aparece no final da série", pontos: { ativacao_gluteo: 2, biomecanico: 2 } },
    ],
  },
  {
    id: "q2",
    pergunta: "Na puxada ou remada, você sente as costas ou os braços?",
    opcoes: [
      { texto: "Costas claramente", pontos: {} },
      { texto: "Bíceps cansa primeiro", pontos: { ativacao_dorsal: 2 } },
      { texto: "Trapézio sobe e domina", pontos: { ativacao_dorsal: 1 } },
      { texto: "Não sinto nada específico", pontos: { ativacao_dorsal: 3 } },
    ],
  },
  {
    id: "q3",
    pergunta: "Você consegue contrair o glúteo voluntariamente, parado?",
    opcoes: [
      { texto: "Sim, forte dos dois lados", pontos: {} },
      { texto: "Sim, mas fraco", pontos: { ativacao_gluteo: 1 } },
      { texto: "Não consigo contrair direito", pontos: { ativacao_gluteo: 3 } },
      { texto: "Nunca tentei", pontos: { ativacao_gluteo: 2 } },
    ],
  },
  {
    id: "q4",
    pergunta: "Seus ombros caem para frente na postura?",
    opcoes: [
      { texto: "Não", pontos: {} },
      { texto: "Levemente", pontos: { biomecanico: 1 } },
      { texto: "Visivelmente", pontos: { biomecanico: 2, ativacao_peitoral: 2 } },
      { texto: "Não sei avaliar", pontos: { biomecanico: 1 } },
    ],
  },
  {
    id: "q5",
    pergunta: "Quantos exercícios reais de posterior de coxa você faz na semana?",
    opcoes: [
      { texto: "Dois ou mais", pontos: {} },
      { texto: "Um", pontos: { volume_posterior: 1 } },
      { texto: "Raramente", pontos: { volume_posterior: 2 } },
      { texto: "Nunca", pontos: { volume_posterior: 3 } },
    ],
  },
  {
    id: "q6",
    pergunta: "No espelho, um lado parece mais forte ou maior que o outro?",
    opcoes: [
      { texto: "Parece simétrico", pontos: {} },
      { texto: "Diferença leve", pontos: { assimetria: 1 } },
      { texto: "Diferença visível", pontos: { assimetria: 2 } },
      { texto: "Não sei avaliar", pontos: { assimetria: 1 } },
    ],
  },
  {
    id: "q7",
    pergunta: "No supino, o que você sente mais?",
    opcoes: [
      { texto: "Peito", pontos: {} },
      { texto: "Ombros", pontos: { ativacao_peitoral: 1 } },
      { texto: "Tríceps", pontos: { ativacao_peitoral: 1 } },
      { texto: "Não sinto o peito", pontos: { ativacao_peitoral: 3 } },
    ],
  },
  {
    id: "q8",
    pergunta: "Seus joelhos entram para dentro no agachamento?",
    opcoes: [
      { texto: "Não", pontos: {} },
      { texto: "Levemente", pontos: { ativacao_gluteo: 1, biomecanico: 1 } },
      { texto: "Visivelmente", pontos: { ativacao_gluteo: 2, biomecanico: 2 } },
      { texto: "Não sei avaliar", pontos: { ativacao_gluteo: 1, biomecanico: 1 } },
    ],
  },
  {
    id: "q9",
    pergunta: "Você sente dor no ombro no supino ou desenvolvimento?",
    opcoes: [
      { texto: "Nunca", pontos: {} },
      { texto: "Às vezes", pontos: { biomecanico: 1 } },
      { texto: "Frequentemente", pontos: { biomecanico: 2 } },
      { texto: "Sempre", pontos: { biomecanico: 3 } },
    ],
  },
  {
    id: "q10",
    pergunta: "Na pose de duplo bíceps de costas, você consegue abrir a dorsal?",
    opcoes: [
      { texto: "Sim", pontos: {} },
      { texto: "Fraca", pontos: { ativacao_dorsal: 1 } },
      { texto: "Nunca", pontos: { ativacao_dorsal: 2 } },
      { texto: "Nunca tentei", pontos: { ativacao_dorsal: 2 } },
    ],
  },
];

/** Ordem de desempate: BIOMECÂNICO > ATIVAÇÃO > VOLUME (ASSIMETRIA entra junto de biomecânico). */
const PRIORIDADE: DeficitKey[] = [
  "biomecanico",
  "assimetria",
  "ativacao_gluteo",
  "ativacao_dorsal",
  "ativacao_peitoral",
  "volume_posterior",
];

export function calcularResultado(respostas: number[]): { resultado: DeficitKey; pontuacao: Record<DeficitKey, number> } {
  const pontuacao: Record<DeficitKey, number> = {
    ativacao_gluteo: 0, ativacao_dorsal: 0, ativacao_peitoral: 0,
    biomecanico: 0, volume_posterior: 0, assimetria: 0,
  };
  respostas.forEach((opcaoIdx, qIdx) => {
    const op = QUIZ_PERGUNTAS[qIdx]?.opcoes[opcaoIdx];
    if (!op) return;
    for (const [k, v] of Object.entries(op.pontos)) {
      pontuacao[k as DeficitKey] += v || 0;
    }
  });
  const max = Math.max(...Object.values(pontuacao));
  if (max === 0) return { resultado: "volume_posterior", pontuacao }; // sem sinal claro: volume é o mais comum
  const resultado = PRIORIDADE.find((k) => pontuacao[k] === max)!;
  return { resultado, pontuacao };
}

export interface DeficitCard {
  titulo: string;
  explicacao: string;
  oQueFazer: string[];
}

export const DEFICIT_CARDS: Record<DeficitKey, DeficitCard> = {
  ativacao_gluteo: {
    titulo: "DEFICIT DE ATIVAÇÃO — GLÚTEOS",
    explicacao:
      "Seu glúteo existe, mas não está participando dos exercícios como deveria. Horas sentado apagam a conexão do quadril — e aí quadríceps e lombar fazem o trabalho que era dele.",
    oQueFazer: [
      "Fazer exercícios de ativação de glúteo ANTES de cada treino de pernas",
      "Glute bridge com pausa de 5s no topo, todos os dias",
      "Treinar glúteo PRIMEIRO na sessão, não no final",
    ],
  },
  ativacao_dorsal: {
    titulo: "DEFICIT DE ATIVAÇÃO — DORSAL",
    explicacao:
      "Suas costas treinam, mas quem cansa é o braço. Sem conexão mente-músculo com o latíssimo, cada puxada vira exercício de bíceps — e as costas ficam para trás.",
    oQueFazer: [
      "Pulldown com pegada neutra e pausa de 2s na contração",
      "Pensar em 'puxar com o cotovelo', não com a mão",
      "Começar o treino de costas com um isolador leve de dorsal",
    ],
  },
  ativacao_peitoral: {
    titulo: "DEFICIT DE ATIVAÇÃO — PEITORAL",
    explicacao:
      "No supino, ombro e tríceps estão roubando o trabalho do peito. O resultado: muito esforço de empurrar e pouco peitoral para mostrar.",
    oQueFazer: [
      "Crossover leve ANTES do supino para acordar o peitoral",
      "Pausa de 2s na contração em todo exercício de peito",
      "Reduzir a carga até sentir o peito, não o ombro",
    ],
  },
  biomecanico: {
    titulo: "DEFICIT BIOMECÂNICO — PADRÃO DE MOVIMENTO",
    explicacao:
      "Dor e compensação são sinais de que o padrão de movimento precisa de correção antes de mais carga. Ignorar isso é como acelerar com o freio de mão puxado.",
    oQueFazer: [
      "Corrigir o padrão ANTES de aumentar volume ou carga",
      "Trocar compostos pesados por variações guiadas temporariamente",
      "Fazer a avaliação completa para mapear a origem exata",
    ],
  },
  volume_posterior: {
    titulo: "DEFICIT DE VOLUME — CADEIA POSTERIOR",
    explicacao:
      "Costas, glúteos e posteriores respondem a volume semanal suficiente — e o seu está abaixo do necessário. Não é genética: é matemática de séries.",
    oQueFazer: [
      "Aumentar as séries semanais de costas e posterior de forma progressiva",
      "Incluir um exercício de alongamento máximo (cadeira flexora, stiff)",
      "Distribuir o volume em 2 sessões por semana, não 1",
    ],
  },
  assimetria: {
    titulo: "ASSIMETRIA — LADO A LADO",
    explicacao:
      "Um lado está carregando o treino pelo outro. Enquanto a diferença existir, exercícios bilaterais pesados só aumentam o desequilíbrio.",
    oQueFazer: [
      "Trocar bilaterais por unilaterais nos grupos afetados",
      "Sempre começar pelo lado mais FRACO",
      "Fazer 1-2 séries extras apenas no lado fraco",
    ],
  },
};

export function buildWhatsappMessage(card: DeficitCard): string {
  return `Oi Coach Diogo! Fiz o quiz de deficit no nutriON e meu resultado foi ${card.titulo}. Quero fazer a avaliação completa do APEX! 🔬`;
}
