export type AudioSeries =
  | "mindset"
  | "comportamento"
  | "execucao"
  | "ciencia"
  | "ritual"
  | "carreira"
  | "relacionamentos"
  | "parentalidade"
  | "financas";

export type CatalogEpisode = {
  series: AudioSeries;
  episode_number: number;
  title: string;
  description: string;
  duration_seconds: number;
  scientific_reference?: string;
};

const min = (m: number) => m * 60;

export const SERIES_META: Record<AudioSeries, { label: string; icon: string; color: string; blurb: string }> = {
  mindset: { label: "Série Mindset", icon: "🧠", color: "#A78BFA", blurb: "Identidade, crenças e a mente que sustenta o shape." },
  comportamento: { label: "Série Comportamento", icon: "🔄", color: "#00FF88", blurb: "Hábitos, sistemas e ambiente — o comportamento vem antes do alimento." },
  execucao: { label: "Série Execução", icon: "⚡", color: "#F59E0B", blurb: "Ação diária: treino, plano, sono, hidratação, registro." },
  ciencia: { label: "Aulas Científicas", icon: "📚", color: "#2DD4BF", blurb: "A ciência por trás do método MCE." },
  ritual: { label: "Rituais", icon: "🌅", color: "#E8A020", blurb: "Micro-áudios para momentos-chave do dia." },
};

export const MCE_AUDIO_CATALOG: CatalogEpisode[] = [
  // MINDSET
  { series: "mindset", episode_number: 1, title: "A identidade vem antes do resultado", description: "Por que você come o que come? A resposta está na identidade, não na dieta.", duration_seconds: min(20), scientific_reference: "Carol Dweck, 2006" },
  { series: "mindset", episode_number: 2, title: "O medo de mudar é biológico", description: "A zona de conforto como armadilha evolutiva.", duration_seconds: min(18), scientific_reference: "Kahneman, 2011" },
  { series: "mindset", episode_number: 3, title: "Autoeficácia: a crença que move", description: "Cada treino concluído reforça a crença de que você é capaz.", duration_seconds: min(22), scientific_reference: "Bandura, 1977" },
  { series: "mindset", episode_number: 4, title: "O propósito por trás do shape", description: "Quem encontra o porquê suporta qualquer como.", duration_seconds: min(20), scientific_reference: "Viktor Frankl, 1946" },
  { series: "mindset", episode_number: 5, title: "Crenças limitantes: o código que te trava", description: "De onde vêm as frases que te param — e como reescrevê-las.", duration_seconds: min(17), scientific_reference: "Aaron Beck" },
  { series: "mindset", episode_number: 6, title: "Neuroplasticidade: seu cérebro muda", description: "Você não está preso a quem era ontem.", duration_seconds: min(22), scientific_reference: "Merzenich, 2013" },
  { series: "mindset", episode_number: 7, title: "Locus de controle: quem manda na sua vida?", description: "Interno vs externo. Quem tem resultado assume controle.", duration_seconds: min(19), scientific_reference: "Rotter, 1954" },
  { series: "mindset", episode_number: 8, title: "Motivação é combustível. Disciplina é motor.", description: "Como construir disciplina sem depender de emoção.", duration_seconds: min(15) },
  { series: "mindset", episode_number: 9, title: "O atleta de dentro", description: "Mentalidade de atleta no trabalho, nos relacionamentos, na vida.", duration_seconds: min(20) },
  { series: "mindset", episode_number: 10, title: "Lidando com o fracasso", description: "O fracasso é dado. A resposta ao fracasso é escolha.", duration_seconds: min(18) },
  { series: "mindset", episode_number: 11, title: "Comparação: o veneno silencioso", description: "Compare-se com quem você era 90 dias atrás.", duration_seconds: min(16) },
  { series: "mindset", episode_number: 12, title: "Mindset MCE: o sistema completo", description: "Como o Mindset alimenta Comportamento e Execução.", duration_seconds: min(25) },
  // COMPORTAMENTO
  { series: "comportamento", episode_number: 1, title: "O hábito é mais forte que a vontade", description: "Gatilho → Rotina → Recompensa. Reprograme o loop.", duration_seconds: min(20), scientific_reference: "Charles Duhigg" },
  { series: "comportamento", episode_number: 2, title: "Tiny Habits: comece ridiculamente pequeno", description: "Comportamento = Motivação × Habilidade × Gatilho.", duration_seconds: min(18), scientific_reference: "BJ Fogg, 2019" },
  { series: "comportamento", episode_number: 3, title: "Sistemas > Metas", description: "Você cai ao nível dos seus sistemas.", duration_seconds: min(20), scientific_reference: "James Clear, 2018" },
  { series: "comportamento", episode_number: 4, title: "O ambiente decide por você", description: "Quem controla o ambiente controla o comportamento.", duration_seconds: min(17) },
  { series: "comportamento", episode_number: 5, title: "Consistência vence intensidade", description: "7/10 todo dia vence 10/10 uma vez por mês.", duration_seconds: min(19) },
  { series: "comportamento", episode_number: 6, title: "Comportamento alimentar: por que você come?", description: "Fome fisiológica, emocional e social — como identificar cada uma.", duration_seconds: min(22), scientific_reference: "nutriON" },
  { series: "comportamento", episode_number: 7, title: "O sabotador invisível", description: "Autossabotagem: por que acontece e como desarmar.", duration_seconds: min(20) },
  { series: "comportamento", episode_number: 8, title: "Cronobiologia: o relógio que ninguém vê", description: "Ritmo circadiano, horário das refeições e performance.", duration_seconds: min(18) },
  { series: "comportamento", episode_number: 9, title: "Decisão zero: automatize o que importa", description: "Menos decisões, menos fadiga decisória.", duration_seconds: min(16), scientific_reference: "Baumeister" },
  { series: "comportamento", episode_number: 10, title: "Relacionamentos e comportamento", description: "Como proteger seus hábitos do ambiente social.", duration_seconds: min(20) },
  { series: "comportamento", episode_number: 11, title: "Recaída: o protocolo de volta", description: "Todo mundo recai. A diferença é ter protocolo de retorno.", duration_seconds: min(18), scientific_reference: "Prochaska" },
  { series: "comportamento", episode_number: 12, title: "Comportamento MCE: o design completo", description: "Comportamento como arquitetura, não força de vontade.", duration_seconds: min(25) },
  // EXECUÇÃO
  { series: "execucao", episode_number: 1, title: "Execução é o único indicador que importa", description: "Planejamento sem execução é opinião.", duration_seconds: min(18) },
  { series: "execucao", episode_number: 2, title: "O plano é o mapa. A execução é o território.", description: "Aderência de 80% supera perfeição abandonada.", duration_seconds: min(20) },
  { series: "execucao", episode_number: 3, title: "Treinar é negociar consigo mesmo", description: "O treino que você não quer fazer é o mais importante.", duration_seconds: min(17) },
  { series: "execucao", episode_number: 4, title: "Intensidade inteligente", description: "RIR, RPE, volume e frequência na prática.", duration_seconds: min(20) },
  { series: "execucao", episode_number: 5, title: "Nutrição como execução", description: "Macro é número. Refeição é ação. Check-in é prova.", duration_seconds: min(18) },
  { series: "execucao", episode_number: 6, title: "Sono como execução", description: "Protocolo noturno: magnésio, caseína, tela off, horário fixo.", duration_seconds: min(16) },
  { series: "execucao", episode_number: 7, title: "Hidratação como execução", description: "Água é infraestrutura metabólica.", duration_seconds: min(14) },
  { series: "execucao", episode_number: 8, title: "Suplementação como execução", description: "O básico que funciona, no horário certo.", duration_seconds: min(18) },
  { series: "execucao", episode_number: 9, title: "O diário de execução", description: "Registrar é provar pra si mesmo. Dados são espelhos.", duration_seconds: min(15) },
  { series: "execucao", episode_number: 10, title: "Semanas difíceis existem", description: "Como manter execução mínima quando a vida aperta.", duration_seconds: min(20) },
  { series: "execucao", episode_number: 11, title: "O atleta completo", description: "Corpo + mente + hábito. O shape é consequência.", duration_seconds: min(22) },
  { series: "execucao", episode_number: 12, title: "Execução MCE: o protocolo final", description: "M + C + E = transformação inevitável.", duration_seconds: min(25) },
  // CIÊNCIA
  { series: "ciencia", episode_number: 1, title: "Carol Dweck — Mentalidade de Crescimento", description: "Fixed vs Growth Mindset aplicado ao bodybuilding e à vida.", duration_seconds: min(25), scientific_reference: "Dweck, 2006 · Stanford" },
  { series: "ciencia", episode_number: 2, title: "Albert Bandura — Autoeficácia", description: "A crença na própria capacidade e o loop positivo da execução.", duration_seconds: min(22), scientific_reference: "Bandura, 1977 · Stanford" },
  { series: "ciencia", episode_number: 3, title: "James Clear — Hábitos Atômicos", description: "Identidade → Sistemas → Resultados.", duration_seconds: min(20), scientific_reference: "Clear, 2018" },
  { series: "ciencia", episode_number: 4, title: "BJ Fogg — Tiny Habits", description: "Começar tão pequeno que é impossível falhar.", duration_seconds: min(20), scientific_reference: "Fogg, 2019 · Stanford" },
  { series: "ciencia", episode_number: 5, title: "Roy Baumeister — Força de Vontade", description: "Ego depletion e por que meal prep funciona.", duration_seconds: min(22), scientific_reference: "Baumeister, 2011" },
  { series: "ciencia", episode_number: 6, title: "Viktor Frankl — Logoterapia", description: "Quando você encontra o porquê, o como se torna suportável.", duration_seconds: min(25), scientific_reference: "Frankl, 1946" },
  { series: "ciencia", episode_number: 7, title: "Daniel Kahneman — Sistema 1 e Sistema 2", description: "Como criar barreiras para o cérebro impulsivo.", duration_seconds: min(23), scientific_reference: "Kahneman, 2011" },
  { series: "ciencia", episode_number: 8, title: "Deci & Ryan — Motivação Intrínseca", description: "Autonomia, competência e conexão.", duration_seconds: min(20), scientific_reference: "Deci & Ryan, 1985" },
  { series: "ciencia", episode_number: 9, title: "Michael Merzenich — Neuroplasticidade", description: "Repetição consistente cria novas redes neurais.", duration_seconds: min(22), scientific_reference: "Merzenich, 2013" },
  // RITUAIS
  { series: "ritual", episode_number: 1, title: "Despertar", description: "5 minutos para decidir quem você será hoje.", duration_seconds: min(5) },
  { series: "ritual", episode_number: 2, title: "Pré-treino", description: "3 minutos de foco antes da primeira série.", duration_seconds: min(3) },
  { series: "ritual", episode_number: 3, title: "Pós-treino", description: "3 minutos para consolidar o que foi construído.", duration_seconds: min(3) },
  { series: "ritual", episode_number: 4, title: "Pré-sono", description: "7 minutos de recuperação e fechamento do dia.", duration_seconds: min(7) },
];

export const RITUAL_KEY_BY_EPISODE: Record<number, "despertar" | "pre_treino" | "pos_treino" | "pre_sono"> = {
  1: "despertar",
  2: "pre_treino",
  3: "pos_treino",
  4: "pre_sono",
};

export const AUDIO_MCE_POINTS = {
  briefing_listened: { m: 3, c: 0, e: 0 },
  episode_completed: { m: 5, c: 2, e: 0 },
  ritual_despertar: { m: 4, c: 3, e: 0 },
  ritual_pre_treino: { m: 2, c: 0, e: 3 },
  ritual_pos_treino: { m: 0, c: 0, e: 5 },
  ritual_pre_sono: { m: 3, c: 4, e: 0 },
  science_class_completed: { m: 8, c: 0, e: 0 },
} as const;
