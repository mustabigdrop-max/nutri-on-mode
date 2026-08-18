export type AudioSeries =
  | "mindset"
  | "comportamento"
  | "execucao"
  | "ciencia"
  | "ritual"
  | "carreira"
  | "relacionamentos"
  | "parentalidade"
  | "financas"
  | "breathwork"
  | "reprogramacao"
  | "emergencia"
  | "masterclass"
  | "focus"
  | "reset_semanal"
  | "review_mensal"
  | "competicao"
  | "biohacking"
  | "journaling"
  | "vida_real";

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
  carreira: { label: "Série Carreira", icon: "🏆", color: "#60A5FA", blurb: "Foco, energia e execução aplicados ao trabalho e à performance profissional." },
  relacionamentos: { label: "Série Relacionamentos", icon: "🤝", color: "#F472B6", blurb: "Vínculos que sustentam (ou sabotam) sua transformação." },
  parentalidade: { label: "Série Parentalidade", icon: "👨‍👩‍👧", color: "#34D399", blurb: "Ser exemplo: rotina, alimentação e mentalidade dentro de casa." },
  financas: { label: "Série Finanças", icon: "💰", color: "#FBBF24", blurb: "Disciplina financeira com a mesma lógica do MCE." },
  breathwork: { label: "Breathwork", icon: "🌬️", color: "#38BDF8", blurb: "Protocolos de respiração guiada — hackear o sistema nervoso em 90 segundos." },
  reprogramacao: { label: "Reprogramação", icon: "🧲", color: "#C084FC", blurb: "Auto-hipnose e afirmações ancoradas — 95% das decisões são subconscientes." },
  emergencia: { label: "SOS — Emergência", icon: "🚨", color: "#EF4444", blurb: "Intervenção imediata para momentos de crise comportamental." },
  masterclass: { label: "Masterclasses", icon: "🎓", color: "#2DD4BF", blurb: "Aulas profundas de 20 a 35 minutos sobre os pilares da performance." },
  focus: { label: "Focus Mode", icon: "🔇", color: "#94A3B8", blurb: "Sem voz — apenas frequência binaural e soundscape." },
  reset_semanal: { label: "Reset Semanal", icon: "📅", color: "#60A5FA", blurb: "Ritual de domingo: revisão, lições, planejamento e intenção." },
  review_mensal: { label: "Review Mensal", icon: "📊", color: "#F59E0B", blurb: "Fechamento do mês em números e declaração de identidade." },
  competicao: { label: "Dia de Competição", icon: "🏆", color: "#FACC15", blurb: "Preparação mental para o palco: véspera, backstage, finals e pós." },
  biohacking: { label: "Biohacking", icon: "🧊", color: "#22D3EE", blurb: "Frio, luz solar, grounding e calor — otimização guiada." },
  journaling: { label: "Journaling Guiado", icon: "❓", color: "#F472B6", blurb: "Perguntas poderosas com silêncio real para escrever." },
  vida_real: { label: "Vida Real", icon: "🤝", color: "#34D399", blurb: "O MCE além do shape: família, fé, dinheiro e solidão do disciplinado." },
};

/** Módulos que aparecem em destaque como acesso rápido no app. */
export const SOS_SERIES: AudioSeries = "emergencia";

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
  { series: "ritual", episode_number: 5, title: "Corrida MCE — O Laboratório de 30 Minutos", description: "30 minutos de corrida guiada: BDNF, grit e experiência de domínio.", duration_seconds: min(30), scientific_reference: "Ratey, 2008 · Duckworth, 2016 · Bandura, 1977" },
  { series: "ritual", episode_number: 6, title: "Dia Difícil — A Mentira", description: "10 minutos para os dias em que a cabeça inventa motivos pra desistir.", duration_seconds: min(10), scientific_reference: "Kahneman, 2011 · James, 1890 · Fogg, 2019" },
  // MICRO-ÁUDIOS DE MUSCULAÇÃO (entre séries)
  { series: "ritual", episode_number: 101, title: "Micro 01 — Antes da primeira série", description: "Visualização e neurônios espelho antes da série 1.", duration_seconds: 30 },
  { series: "ritual", episode_number: 102, title: "Micro 02 — Série pesada", description: "Setup e caráter antes de um top set.", duration_seconds: 25 },
  { series: "ritual", episode_number: 103, title: "Micro 03 — Meio do treino", description: "Mielinização: cada rep te torna neurologicamente superior.", duration_seconds: 30 },
  { series: "ritual", episode_number: 104, title: "Micro 04 — Após série muito boa", description: "Experiência de domínio registrada.", duration_seconds: 25 },
  { series: "ritual", episode_number: 105, title: "Micro 05 — Quando começa a pesar", description: "Amígdala x tanque de reserva.", duration_seconds: 30 },
  { series: "ritual", episode_number: 106, title: "Micro 06 — Antes de composto pesado", description: "Agachamento, supino, terra: comando seco.", duration_seconds: 20 },
  { series: "ritual", episode_number: 107, title: "Micro 07 — Descanso entre séries", description: "90 segundos e ressíntese de fosfocreatina.", duration_seconds: 30 },
  { series: "ritual", episode_number: 108, title: "Micro 08 — Contração no pico", description: "Tensão mecânica e excêntrica controlada.", duration_seconds: 25 },
  { series: "ritual", episode_number: 109, title: "Micro 09 — Últimas 2 séries", description: "O treino começa quando você quer parar.", duration_seconds: 25 },
  { series: "ritual", episode_number: 110, title: "Micro 10 — Após um PR", description: "Uma nova versão de quem você é.", duration_seconds: 30 },
  { series: "ritual", episode_number: 111, title: "Micro 11 — Conexão mente-músculo", description: "22% mais fibras com presença mental.", duration_seconds: 30 },
  { series: "ritual", episode_number: 112, title: "Micro 12 — Superset e drop set", description: "Tensão contínua sem descanso.", duration_seconds: 20 },
  { series: "ritual", episode_number: 113, title: "Micro 13 — Reta final do treino", description: "O que você faz quando ninguém vê.", duration_seconds: 25 },
  { series: "ritual", episode_number: 114, title: "Micro 14 — Exercício de isolamento", description: "Honestidade muscular e amplitude total.", duration_seconds: 25 },
  { series: "ritual", episode_number: 115, title: "Micro 15 — Última repetição", description: "Fechamento do treino com reconhecimento.", duration_seconds: 30 },
  // CARREIRA
  { series: "carreira", episode_number: 1, title: "O mesmo motor: MCE no trabalho", description: "Mindset, Comportamento e Execução fora da academia.", duration_seconds: min(18) },
  { series: "carreira", episode_number: 2, title: "Energia é a moeda da carreira", description: "Sono, glicemia e treino como alavancas de produtividade.", duration_seconds: min(20) },
  { series: "carreira", episode_number: 3, title: "Deep work: proteger o bloco nobre", description: "Como desenhar o dia em torno do que realmente move o ponteiro.", duration_seconds: min(20), scientific_reference: "Cal Newport, 2016" },
  { series: "carreira", episode_number: 4, title: "Reuniões, comida e cortisol", description: "Rotina corporativa sem sabotar o plano alimentar.", duration_seconds: min(17) },
  { series: "carreira", episode_number: 5, title: "Ambição sem burnout", description: "Carga, deload e recuperação também na carreira.", duration_seconds: min(19) },
  { series: "carreira", episode_number: 6, title: "Viagens e alta demanda", description: "Protocolo mínimo viável quando a agenda explode.", duration_seconds: min(16) },
  { series: "carreira", episode_number: 7, title: "Presença: ser levado a sério", description: "Postura, disposição e a leitura que o mundo faz do seu corpo.", duration_seconds: min(15) },
  { series: "carreira", episode_number: 8, title: "Carreira MCE: o profissional inevitável", description: "Consistência composta ao longo de anos.", duration_seconds: min(22) },
  // RELACIONAMENTOS
  { series: "relacionamentos", episode_number: 1, title: "Seu círculo define sua média", description: "Quem está por perto molda o que é normal pra você.", duration_seconds: min(18) },
  { series: "relacionamentos", episode_number: 2, title: "O parceiro que não entende o processo", description: "Como comunicar objetivos sem criar conflito.", duration_seconds: min(20) },
  { series: "relacionamentos", episode_number: 3, title: "Jantar fora, churrasco, aniversário", description: "Ambiente social sem culpa e sem descarrilar.", duration_seconds: min(17) },
  { series: "relacionamentos", episode_number: 4, title: "Limites: o não que protege o plano", description: "Dizer não sem se afastar de quem importa.", duration_seconds: min(16) },
  { series: "relacionamentos", episode_number: 5, title: "Sabotagem afetiva", description: "Quando o carinho vem em forma de comida.", duration_seconds: min(18) },
  { series: "relacionamentos", episode_number: 6, title: "Treinar junto muda tudo", description: "Parceria de treino, accountability e vínculo.", duration_seconds: min(15) },
  { series: "relacionamentos", episode_number: 7, title: "Libido, hormônios e conexão", description: "Como composição corporal e sono afetam a intimidade.", duration_seconds: min(19) },
  { series: "relacionamentos", episode_number: 8, title: "Relacionamentos MCE: crescer junto", description: "Transformação individual que eleva quem está ao redor.", duration_seconds: min(20) },
  // PARENTALIDADE
  { series: "parentalidade", episode_number: 1, title: "Filhos aprendem o que veem", description: "Você é o cardápio e a rotina da casa.", duration_seconds: min(18) },
  { series: "parentalidade", episode_number: 2, title: "A geladeira é uma decisão", description: "Ambiente alimentar familiar sem policiamento.", duration_seconds: min(17) },
  { series: "parentalidade", episode_number: 3, title: "Tempo: o pai/mãe que treina", description: "Encaixar treino na vida real com crianças.", duration_seconds: min(16) },
  { series: "parentalidade", episode_number: 4, title: "Nunca comente o corpo do seu filho", description: "Linguagem que previne relação disfuncional com comida.", duration_seconds: min(20) },
  { series: "parentalidade", episode_number: 5, title: "Sono da casa, sono do atleta", description: "Rotina noturna familiar e recuperação.", duration_seconds: min(15) },
  { series: "parentalidade", episode_number: 6, title: "Movimento como brincadeira", description: "Criar filhos ativos sem transformar em obrigação.", duration_seconds: min(16) },
  { series: "parentalidade", episode_number: 7, title: "Culpa parental e autocuidado", description: "Cuidar de si não é egoísmo — é infraestrutura.", duration_seconds: min(18) },
  { series: "parentalidade", episode_number: 8, title: "Parentalidade MCE: legado de hábitos", description: "O que fica depois que o shape muda.", duration_seconds: min(20) },
  // FINANÇAS
  { series: "financas", episode_number: 1, title: "Disciplina financeira é disciplina alimentar", description: "O mesmo músculo comportamental.", duration_seconds: min(18) },
  { series: "financas", episode_number: 2, title: "Comer bem gastando menos", description: "Custo por grama de proteína e compras inteligentes.", duration_seconds: min(18) },
  { series: "financas", episode_number: 3, title: "Suplementos: o que vale o dinheiro", description: "Prioridade de gasto baseada em evidência.", duration_seconds: min(19) },
  { series: "financas", episode_number: 4, title: "Delivery: o vazamento silencioso", description: "Impacto duplo no bolso e no shape.", duration_seconds: min(15) },
  { series: "financas", episode_number: 5, title: "Investir em saúde é investir em anos", description: "Custo hoje, retorno em décadas.", duration_seconds: min(18) },
  { series: "financas", episode_number: 6, title: "Meal prep econômico", description: "Planejamento semanal que corta desperdício.", duration_seconds: min(17) },
  { series: "financas", episode_number: 7, title: "Ansiedade financeira e compulsão", description: "Estresse crônico, cortisol e decisões alimentares.", duration_seconds: min(20) },
  { series: "financas", episode_number: 8, title: "Finanças MCE: patrimônio e corpo", description: "Juros compostos aplicados ao comportamento.", duration_seconds: min(20) },
  // BREATHWORK
  { series: "breathwork", episode_number: 1, title: "Fisiológico Sigh", description: "Duas inspirações pelo nariz + expiração longa. Derruba cortisol em 90 segundos.", duration_seconds: min(2), scientific_reference: "Huberman Lab · Stanford" },
  { series: "breathwork", episode_number: 2, title: "Box Breathing", description: "4-4-4-4. A técnica dos Navy SEALs para controle emocional e foco.", duration_seconds: min(5) },
  { series: "breathwork", episode_number: 3, title: "Wim Hof Adaptado", description: "3 rounds: 30 respirações profundas, retenção máxima e recuperação.", duration_seconds: min(10), scientific_reference: "Kox et al., 2014 · PNAS" },
  { series: "breathwork", episode_number: 4, title: "4-7-8 Sono", description: "Inspira 4, segura 7, solta 8. Ativa o parassimpático e induz o sono.", duration_seconds: min(5), scientific_reference: "Dr. Andrew Weil" },
  { series: "breathwork", episode_number: 5, title: "Energizante Matinal", description: "Kapalabhati adaptada: expirações curtas e fortes para elevar o alerta.", duration_seconds: min(3) },
  { series: "breathwork", episode_number: 6, title: "Coerência Cardíaca", description: "Inspira 5, solta 5. Máxima variabilidade cardíaca = máxima resiliência.", duration_seconds: min(6), scientific_reference: "HeartMath Institute" },
  // REPROGRAMAÇÃO
  { series: "reprogramacao", episode_number: 1, title: "Identidade de Atleta", description: "Indução leve em theta + afirmações de identidade em primeira pessoa.", duration_seconds: min(15) },
  { series: "reprogramacao", episode_number: 2, title: "Eliminação de Autossabotagem", description: "Desativar comer emocional, procrastinação e desistência.", duration_seconds: min(15) },
  { series: "reprogramacao", episode_number: 3, title: "Visualização de Resultado", description: "90 dias à frente: visualização sensorial detalhada do corpo construído.", duration_seconds: min(12) },
  { series: "reprogramacao", episode_number: 4, title: "Relação com Comida", description: "Sua fome nunca foi de comida — reprogramação em nível profundo.", duration_seconds: min(15) },
  { series: "reprogramacao", episode_number: 5, title: "Confiança e Autoestima", description: "Reconstrução da autoimagem para quem começa com autoestima baixa.", duration_seconds: min(12) },
  { series: "reprogramacao", episode_number: 6, title: "Superação de Platô", description: "O platô não é o fim. É o teste.", duration_seconds: min(10) },
  // EMERGÊNCIA
  { series: "emergencia", episode_number: 1, title: "Vontade de comer fora do plano", description: "Pico de dopamina antecipatória: passa em 90 segundos. Me dá 3 minutos.", duration_seconds: min(3), scientific_reference: "Núcleo accumbens · Berridge" },
  { series: "emergencia", episode_number: 2, title: "Não quero treinar hoje", description: "91% de quem treinou mesmo sem vontade se sentiu melhor depois.", duration_seconds: min(3), scientific_reference: "Univ. Hertfordshire" },
  { series: "emergencia", episode_number: 3, title: "Ansiedade / mente acelerada", description: "Physiological sigh + grounding sensorial 5-4-3-2-1.", duration_seconds: min(4) },
  { series: "emergencia", episode_number: 4, title: "Insônia / não consigo dormir", description: "Body scan progressivo + respiração 4-7-8.", duration_seconds: min(5) },
  { series: "emergencia", episode_number: 5, title: "Recaída alimentar", description: "Depois de comer fora do plano. Sem julgamento — corta a narrativa de culpa.", duration_seconds: min(4), scientific_reference: "Prochaska · Estágios de mudança" },
  { series: "emergencia", episode_number: 6, title: "Comparação / inveja", description: "Você compara seu bastidor com o pódio do outro.", duration_seconds: min(3), scientific_reference: "Festinger, 1954" },
  // MASTERCLASSES
  { series: "masterclass", episode_number: 1, title: "Sono e Performance", description: "Arquitetura do sono, fases e impacto na composição corporal.", duration_seconds: min(30), scientific_reference: "Matthew Walker · Huberman" },
  { series: "masterclass", episode_number: 2, title: "O Eixo Intestino-Cérebro", description: "Microbioma, serotonina intestinal, humor, fibras e probióticos.", duration_seconds: min(25) },
  { series: "masterclass", episode_number: 3, title: "Hormônios e Estilo de Vida", description: "Testosterona, cortisol, insulina e GH otimizados sem farmacologia.", duration_seconds: min(30) },
  { series: "masterclass", episode_number: 4, title: "A Ciência da Força de Vontade", description: "Ego depletion, glicose cerebral, fadiga de decisão e design de ambiente.", duration_seconds: min(25), scientific_reference: "Baumeister" },
  { series: "masterclass", episode_number: 5, title: "Neuroplasticidade Aplicada", description: "Como 30 dias de consistência remodelam circuitos neurais.", duration_seconds: min(25), scientific_reference: "Merzenich · Doidge" },
  { series: "masterclass", episode_number: 6, title: "Cronobiologia: o relógio interno", description: "Ritmo circadiano, TRE, jet lag social e cortisol matinal.", duration_seconds: min(25), scientific_reference: "Satchin Panda" },
  { series: "masterclass", episode_number: 7, title: "Psicologia do Comportamento Alimentar", description: "Fome fisiológica vs emocional vs social. Deep dive completo.", duration_seconds: min(30) },
  { series: "masterclass", episode_number: 8, title: "A Ciência do Hábito", description: "Duhigg, Clear, Fogg e Gollwitzer — o framework completo.", duration_seconds: min(25) },
  { series: "masterclass", episode_number: 9, title: "Flow State", description: "As 8 condições do flow aplicadas ao treino, ao trabalho e à vida.", duration_seconds: min(25), scientific_reference: "Csikszentmihalyi" },
  { series: "masterclass", episode_number: 10, title: "Dor, Desconforto e Crescimento", description: "Hormese e antifragilidade: por que evitar desconforto estagna.", duration_seconds: min(20), scientific_reference: "Taleb" },
  // FOCUS MODE
  { series: "focus", episode_number: 1, title: "Deep Focus", description: "15 Hz beta + lo-fi ambient. Trabalho concentrado e estudo.", duration_seconds: min(25) },
  { series: "focus", episode_number: 2, title: "Flow State", description: "10-12 Hz alpha + ambient pads. Treino, criação, arte.", duration_seconds: min(45) },
  { series: "focus", episode_number: 3, title: "Recovery", description: "4-6 Hz theta + bowls tibetanos. Descanso ativo e pós-treino.", duration_seconds: min(30) },
  { series: "focus", episode_number: 4, title: "Power Nap", description: "Theta → delta → alpha. Cochilo de 20 min com despertar suave.", duration_seconds: min(20) },
  { series: "focus", episode_number: 5, title: "Night Mode", description: "2-3 Hz delta + chuva/oceano. Indução contínua para dormir.", duration_seconds: min(60) },
  { series: "focus", episode_number: 6, title: "Pre-Competition", description: "10 Hz alpha + batimento 60bpm. Calma focada antes do palco.", duration_seconds: min(15) },
  // RESET SEMANAL
  { series: "reset_semanal", episode_number: 1, title: "Reset Semanal — Domingo", description: "Revisão da semana, lições, planejamento, meal prep e intenção declarada.", duration_seconds: min(15) },
  // REVIEW MENSAL
  { series: "review_mensal", episode_number: 1, title: "Review Mensal", description: "O mês em números, quem você era há 30 dias e a declaração de identidade.", duration_seconds: min(20) },
  // COMPETIÇÃO
  { series: "competicao", episode_number: 1, title: "Noite antes da competição", description: "Visualização do palco, calma e preparação mental.", duration_seconds: min(10) },
  { series: "competicao", episode_number: 2, title: "Backstage — antes do prejudging", description: "Pump-up mental e controle de ansiedade com respiração 4-4.", duration_seconds: min(5) },
  { series: "competicao", episode_number: 3, title: "Entre prejudging e finals", description: "Recuperação mental sem queimar energia com resultado.", duration_seconds: min(8) },
  { series: "competicao", episode_number: 4, title: "Pós-competição", description: "Processamento emocional independente do resultado.", duration_seconds: min(10) },
  // BIOHACKING
  { series: "biohacking", episode_number: 1, title: "Cold Exposure guiado", description: "Banho gelado ou imersão: norepinefrina e tolerância ao desconforto.", duration_seconds: min(5) },
  { series: "biohacking", episode_number: 2, title: "Sunlight Morning Protocol", description: "Luz solar nos primeiros 30 min: reset do núcleo supraquiasmático.", duration_seconds: min(3), scientific_reference: "Huberman Lab" },
  { series: "biohacking", episode_number: 3, title: "Grounding / Earthing", description: "Pés descalços no chão e inflamação sistêmica.", duration_seconds: min(5), scientific_reference: "J. Environ. Public Health" },
  { series: "biohacking", episode_number: 4, title: "Sauna / calor guiado", description: "Heat shock proteins e adaptação cardiovascular.", duration_seconds: min(10) },
  // JOURNALING
  { series: "journaling", episode_number: 1, title: "Sessão de autoconhecimento", description: "10 perguntas poderosas com 60s de silêncio para escrever.", duration_seconds: min(15) },
  { series: "journaling", episode_number: 2, title: "Carta pro eu futuro", description: "Uma carta para você daqui 90 dias — o contrato mais importante.", duration_seconds: min(10) },
  { series: "journaling", episode_number: 3, title: "Mapa de gatilhos", description: "Identificar o gatilho principal e definir a resposta substituta.", duration_seconds: min(12) },
  // VIDA REAL
  { series: "vida_real", episode_number: 1, title: "Quando ninguém em casa apoia", description: "Lidar com o ambiente familiar sem conflito e sem ceder.", duration_seconds: min(12) },
  { series: "vida_real", episode_number: 2, title: "O atleta e o pai", description: "Shape e presença: conciliar cardio às 4h30 com a vida de família.", duration_seconds: min(10) },
  { series: "vida_real", episode_number: 3, title: "Dinheiro é execução", description: "MCE financeiro: a mesma disciplina, outro domínio.", duration_seconds: min(12) },
  { series: "vida_real", episode_number: 4, title: "Fé e propósito", description: "O corpo como responsabilidade, não vaidade.", duration_seconds: min(10) },
  { series: "vida_real", episode_number: 5, title: "A solidão do disciplinado", description: "Temporária — ao contrário da solidão do arrependido.", duration_seconds: min(10) },
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
