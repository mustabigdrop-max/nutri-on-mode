export type SocialPillar = "mce_drop" | "bastidor" | "transformacao" | "entretenimento" | "cta";

export const PILLARS: Record<SocialPillar, { label: string; emoji: string; share: string; color: string; formats: string; desc: string }> = {
  mce_drop: { label: "MCE Drops", emoji: "🧠", share: "30%", color: "#00D4FF", formats: "carrossel, Reel curto", desc: "Micro-aulas sobre Mindset, Comportamento e Execução" },
  bastidor: { label: "Bastidores", emoji: "🏋️", share: "25%", color: "#E8A020", formats: "Stories, Reel POV", desc: "Treino, prep de comida, rotina real, vulnerabilidade" },
  transformacao: { label: "Transformações", emoji: "📸", share: "20%", color: "#00FF88", formats: "carrossel, Reel narrativo", desc: "Antes/depois, depoimentos, resultados nutriON" },
  entretenimento: { label: "Entretenimento", emoji: "🎭", share: "15%", color: "#A78BFA", formats: "Reel viral, Stories enquete", desc: "Mitos fitness, humor, trends, reações" },
  cta: { label: "CTA", emoji: "🔗", share: "10%", color: "#FF4D6D", formats: "Stories, Reel", desc: "nutriON, MCE Audio, Desafio 30D, link na bio" },
};

export const FORMATS = ["reel", "carrossel", "stories", "post_unico", "live", "collab"] as const;

export const HOOK_LIBRARY: { category: string; emoji: string; pillar: SocialPillar; hooks: string[] }[] = [
  {
    category: "Educativos (MCE)", emoji: "🧠", pillar: "mce_drop",
    hooks: [
      "Você não precisa de motivação. Precisa de sistema.",
      "A ciência já provou: seu cérebro está mentindo pra você.",
      "90% dos que fazem dieta vão recuperar o peso. Mas não por isso.",
      "Comer no horário é mais importante que comer 'saudável'.",
      "Seu maior sabotador não é o doce. É o pensamento antes dele.",
      "A diferença entre quem transforma e quem desiste mora em 1 hábito.",
      "Você não perde peso por falta de informação. Todo mundo sabe o que comer.",
      "Dweck, Stanford: 1 palavra muda tudo no seu resultado.",
      "70% do GH é produzido enquanto você dorme. Não na academia.",
      "Nenhum app de dieta vai funcionar se você não resolver isso antes.",
    ],
  },
  {
    category: "Treino / Bastidor", emoji: "🏋️", pillar: "bastidor",
    hooks: [
      "4:30 da manhã. O alarme toca. E o jogo começa.",
      "Minha marmita de terça-feira. Nada glamouroso. Tudo funcional.",
      "O treino que ninguém vê é o que constrói o shape que todo mundo elogia.",
      "Leg day com 16 anos de Marinha. Diferente.",
      "Isso é o que eu como todo dia. Sem exceção. Sem negociação.",
      "POV: você é pai, atleta IFBB, e empresário. Ao mesmo tempo.",
    ],
  },
  {
    category: "Transformação", emoji: "📸", pillar: "transformacao",
    hooks: [
      "Ele me mandou mensagem dizendo que ia desistir. 90 dias depois:",
      "Antes e depois com os mesmos macros. A diferença? Comportamento.",
      "Essa transformação não é sobre dieta. É sobre identidade.",
      "12 semanas. Mesmo emprego. Mesma família. Corpo diferente. Mente diferente.",
      "O MCE Score dele saiu de 45 pra 91. E o corpo acompanhou.",
    ],
  },
  {
    category: "Entretenimento", emoji: "🎭", pillar: "entretenimento",
    hooks: [
      "Coisas que todo marombeiro fala no rodízio 😂",
      "Quando alguém diz 'eu tenho metabolismo lento' 💀",
      "Minha mulher vs minha marmita. Quem ganha?",
      "5 tipos de aluno na academia. Qual é você?",
      "O que o personal pensa vs o que ele fala 🫠",
    ],
  },
  {
    category: "CTA", emoji: "🔗", pillar: "cta",
    hooks: [
      "Se eu te mostrasse um sistema que...",
      "847 pessoas estão ouvindo MCE Audio agora. Você ainda não?",
      "O Desafio 30 Dias está aberto. E eu preciso falar sobre isso.",
      "Isso aqui é o que meus alunos veem todo dia no app.",
      "Esse ranking é real. Esses resultados são reais. E seu nome pode estar aqui.",
    ],
  },
];

export const CORE_HASHTAGS = ["#MCE", "#MetodoMCE", "#nutriON", "#ComportamentoAntesDoAlimento", "#CoachNutricional"];

export const HASHTAGS_BY_PILLAR: Record<string, string[]> = {
  "🧠 Educativo": ["#NeurocienciaFitness", "#MindsetAtleta", "#PsicologiaDoEsporte", "#HabitosAtomicos", "#EducacaoNutricional"],
  "🏋️ Treino": ["#ClassicPhysique", "#IFBB", "#Bodybuilding", "#TreinoClassico", "#Musculacao"],
  "📸 Transformação": ["#AntesEDepois", "#TransformacaoReal", "#ResultadoReal", "#Emagrecimento"],
  "📍 Local": ["#RioDeJaneiro", "#ZonaSul", "#FitnessRJ"],
};

export const WEEKLY_CHECKLIST = [
  "2+ Reels publicados",
  "1+ Carrossel educativo",
  "1+ Post pessoal/bastidor",
  "1+ Transformação de cliente",
  "Stories diários",
  "Collab post com outro perfil",
  "CTA pro nutriON (link na bio)",
];

export const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
