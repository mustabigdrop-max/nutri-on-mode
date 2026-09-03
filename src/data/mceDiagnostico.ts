export type DiagPillar = "M" | "C" | "E";

export interface DiagOption {
  text: string;
  value: 1 | 2 | 3 | 4;
}

export interface DiagQuestion {
  pillar: DiagPillar;
  emoji: string;
  text: string;
  options: DiagOption[];
}

export const PILLAR_META: Record<DiagPillar, { label: string; emoji: string; color: string }> = {
  M: { label: "MENTALIDADE", emoji: "🧠", color: "#00D4FF" },
  C: { label: "COMPORTAMENTO", emoji: "⚡", color: "#B8922A" },
  E: { label: "EXECUÇÃO", emoji: "🎯", color: "#00d4a1" },
};

export const GOALS = ["Emagrecer", "Ganhar massa", "Saúde geral", "Performance", "Definição"];

export const QUESTIONS: DiagQuestion[] = [
  {
    pillar: "M",
    emoji: "🧠",
    text: "Quando você fura o plano, o que acontece na sua cabeça?",
    options: [
      { text: "Culpa pesada — desisto do resto da semana", value: 1 },
      { text: "Fico mal, mas volto depois de alguns dias", value: 2 },
      { text: "Incomoda, porém retomo no dia seguinte", value: 3 },
      { text: "Trato como dado: entendo o gatilho e sigo", value: 4 },
    ],
  },
  {
    pillar: "M",
    emoji: "🧠",
    text: "O quanto você acredita que consegue transformar seu corpo em 6 meses?",
    options: [
      { text: "Pouco — já tentei muitas vezes e falhei", value: 1 },
      { text: "Depende da sorte, da rotina, do momento", value: 2 },
      { text: "Acredito, mas duvido em dias ruins", value: 3 },
      { text: "Total. Sei que é questão de método e tempo", value: 4 },
    ],
  },
  {
    pillar: "M",
    emoji: "🧠",
    text: "Quando o resultado demora, de quem é a responsabilidade?",
    options: [
      { text: "Da genética, do metabolismo, da vida corrida", value: 1 },
      { text: "Um pouco minha, um pouco das circunstâncias", value: 2 },
      { text: "Minha na maior parte das vezes", value: 3 },
      { text: "Minha. Reviso os dados e ajusto a estratégia", value: 4 },
    ],
  },
  {
    pillar: "C",
    emoji: "⚡",
    text: "Seu ambiente (casa, trabalho) joga a favor ou contra?",
    options: [
      { text: "Contra — o que sabota está sempre à mão", value: 1 },
      { text: "Metade e metade, sem organização", value: 2 },
      { text: "Em geral favorece, com deslizes", value: 3 },
      { text: "Desenhado a favor: o certo é o mais fácil", value: 4 },
    ],
  },
  {
    pillar: "C",
    emoji: "⚡",
    text: "Suas refeições são decididas quando?",
    options: [
      { text: "Na hora da fome, conforme o humor", value: 1 },
      { text: "Improviso quase sempre", value: 2 },
      { text: "Planejo a maior parte da semana", value: 3 },
      { text: "Rotina definida e comida pronta em casa", value: 4 },
    ],
  },
  {
    pillar: "C",
    emoji: "⚡",
    text: "Você identifica o gatilho emocional antes de comer fora do plano?",
    options: [
      { text: "Nunca — só percebo depois", value: 1 },
      { text: "Raramente", value: 2 },
      { text: "Quase sempre percebo", value: 3 },
      { text: "Percebo e consigo interromper o loop", value: 4 },
    ],
  },
  {
    pillar: "E",
    emoji: "🎯",
    text: "Você tem um plano escrito de ações para esta semana?",
    options: [
      { text: "Não. Vou levando", value: 1 },
      { text: "Só na cabeça, vago", value: 2 },
      { text: "Tenho metas gerais anotadas", value: 3 },
      { text: "Sim, com horário e ação definidos", value: 4 },
    ],
  },
  {
    pillar: "E",
    emoji: "🎯",
    text: "Com que constância você treina/executa o combinado?",
    options: [
      { text: "Vou em ondas — semanas inteiras sem nada", value: 1 },
      { text: "1 a 2 vezes por semana, irregular", value: 2 },
      { text: "3 a 4 vezes, quase sempre", value: 3 },
      { text: "Inegociável na agenda, acontece sempre", value: 4 },
    ],
  },
  {
    pillar: "E",
    emoji: "🎯",
    text: "Você acompanha seus números (peso, medidas, cargas, fotos)?",
    options: [
      { text: "Não acompanho nada", value: 1 },
      { text: "Só a balança, de vez em quando", value: 2 },
      { text: "Acompanho, mas sem revisar", value: 3 },
      { text: "Registro e uso os dados para ajustar", value: 4 },
    ],
  },
];

export interface DiagAnswer {
  pillar: DiagPillar;
  question_index: number;
  score: number;
}

export interface DiagScores {
  M: number;
  C: number;
  E: number;
  total: number;
  level: string;
  levelColor: string;
}

export function levelFor(total: number) {
  if (total < 40) return { level: "Iniciante", color: "#ff4757" };
  if (total < 60) return { level: "Intermediário", color: "#B8922A" };
  if (total < 80) return { level: "Avançado", color: "#00d4a1" };
  return { level: "Elite", color: "#00D4FF" };
}

export function computeScores(answers: DiagAnswer[]): DiagScores {
  const pillarScore = (p: DiagPillar) => {
    const list = answers.filter((a) => a.pillar === p);
    if (!list.length) return 0;
    const sum = list.reduce((acc, a) => acc + a.score, 0);
    return Math.round((sum / (list.length * 4)) * 100);
  };
  const M = pillarScore("M");
  const C = pillarScore("C");
  const E = pillarScore("E");
  const total = Math.round((M + C + E) / 3);
  const { level, color } = levelFor(total);
  return { M, C, E, total, level, levelColor: color };
}

type Band = "low" | "mid" | "high";

const INSIGHTS: Record<DiagPillar, Record<Band, string>> = {
  M: {
    low: "Sua mentalidade ainda opera no modo tudo-ou-nada: um deslize vira veredito e o processo trava. Enquanto a falha for interpretada como prova de incapacidade, nenhum plano alimentar sobrevive à segunda semana. O primeiro trabalho aqui não é dieta — é reconstruir a leitura que você faz de si mesmo diante do erro.",
    mid: "Você já entende que o resultado depende de você, mas ainda oscila: em dias bons acredita, em dias ruins terceiriza. Essa instabilidade de crença é o que faz a execução perder força justamente quando mais precisa dela. Consolidar autoeficácia é o próximo passo.",
    high: "Sua mentalidade está madura: você trata erro como dado e assume responsabilidade pelo processo. Esse é o alicerce que permite periodizar de verdade e sustentar protocolos mais agressivos sem colapso emocional.",
  },
  C: {
    low: "Seu comportamento está sendo decidido pelo ambiente, não por você. Sem planejamento nem estrutura, cada refeição vira uma negociação com a força de vontade — e força de vontade esgota, principalmente à noite. O caminho é arquitetura: tornar o certo óbvio e fácil, e o errado difícil.",
    mid: "Você já tem algum sistema, mas ele ainda depende demais de disposição. Existem brechas claras no ambiente e nos gatilhos emocionais que derrubam semanas boas. Fechar essas brechas vale mais do que qualquer ajuste de macro.",
    high: "Seu comportamento é sistematizado: ambiente organizado, refeições planejadas e consciência dos gatilhos. Com essa base, o refinamento nutricional passa a render de verdade.",
  },
  E: {
    low: "A execução é o seu gargalo: existe intenção, mas não existe sistema. Sem plano escrito, constância e números acompanhados, não há como corrigir rota — você fica repetindo tentativas às cegas. Planejamento sem execução é só opinião.",
    mid: "Você executa, mas de forma irregular e sem feedback consistente. Falta o ciclo de revisão semanal que transforma esforço em progressão. Pequenos ajustes de rastreamento já mudariam sua curva.",
    high: "Sua execução é forte: rotina inegociável e dados sendo usados para ajustar. Aqui o ganho vem de periodização fina e otimização, não de mais disciplina.",
  },
};

export function insightFor(pillar: DiagPillar, score: number) {
  const band: Band = score < 40 ? "low" : score < 70 ? "mid" : "high";
  return INSIGHTS[pillar][band];
}

export function weakestPillar(s: { M: number; C: number; E: number }): DiagPillar {
  const arr: [DiagPillar, number][] = [["M", s.M], ["C", s.C], ["E", s.E]];
  arr.sort((a, b) => a[1] - b[1]);
  return arr[0][0];
}

export const COACH_WHATSAPP = "5511999999999";
