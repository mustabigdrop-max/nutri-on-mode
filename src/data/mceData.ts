export type PillarKey = "M" | "C" | "E";

export interface Author {
  name: string;
  inst: string;
  year: number;
  concept: string;
  book: string;
  insight: string;
}

export interface Exercise {
  title: string;
  desc: string;
  difficulty: number;
  ref: string;
}

export interface Diagnostic {
  q: string;
  ref: string;
}

export interface Pillar {
  key: PillarKey;
  label: string;
  fullLabel: string;
  color: string;
  accent: string;
  tagline: string;
  subtitle: string;
  manifesto: string;
  authors: Author[];
  quote: string;
  diagnostics: Diagnostic[];
  exercises: Exercise[];
}

export const PILLAR_DATA: Record<PillarKey, Pillar> = {
  M: {
    key: "M",
    label: "MINDSET",
    fullLabel: "Mentalidade",
    color: "#A78BFA",
    accent: "#C4B5FD",
    tagline: "O Sistema Operacional",
    subtitle: "Fundação cognitiva · crenças e identidade",
    manifesto:
      "Mentalidade não é pensar positivo. É o software que filtra como você interpreta adversidade, processa decisões e constrói identidade. Sem o sistema operacional correto, nenhum plano funciona.",
    authors: [
      { name: "Carol Dweck", inst: "Stanford University", year: 2006, concept: "Growth Mindset", book: "Mindset: The New Psychology of Success", insight: "Indivíduos com mentalidade de crescimento interpretam falha como dado, não veredito — atingindo desempenho 47% superior em domínios complexos. Talento é ponto de partida, não teto." },
      { name: "Daniel Kahneman", inst: "Princeton · Nobel 2002", year: 2011, concept: "Sistema 1 vs Sistema 2", book: "Thinking, Fast and Slow", insight: "Sistema 1: automático, impulsivo, emocional. Sistema 2: deliberado, racional, estratégico. A maioria das decisões alimentares ruins vem do Sistema 1. MCE treina a pausa de 10 segundos entre estímulo e resposta." },
      { name: "Albert Bandura", inst: "Stanford University", year: 1997, concept: "Autoeficácia", book: "Self-Efficacy: The Exercise of Control", insight: "A crença na própria capacidade é o maior preditor de sucesso. 4 fontes: experiência de domínio, modelagem social, persuasão verbal e estado fisiológico." },
      { name: "Viktor Frankl", inst: "Universidade de Viena", year: 1946, concept: "Logoterapia", book: "Em Busca de Sentido", insight: "Entre o estímulo e a resposta há um espaço. Nesse espaço está nosso poder de escolher. A busca por sentido é o motor primário da transformação." },
      { name: "Julian Rotter", inst: "University of Connecticut", year: 1966, concept: "Locus de Controle", book: "Psychological Monographs", insight: "Locus interno: eu controlo meus resultados. Locus externo: o destino controla. MCE treina migração sistemática do externo para o interno." },
      { name: "Michael Merzenich", inst: "UCSF", year: 2013, concept: "Neuroplasticidade", book: "Soft-Wired", insight: "O cérebro se reorganiza fisicamente. 66 dias é a média para automatização real de novos comportamentos (Lally et al., 2010, European Journal of Social Psychology)." },
    ],
    quote: "Genética é o ponto de partida, não o teto.",
    diagnostics: [
      { q: "Quando algo dá errado, você assume responsabilidade ou culpa fatores externos?", ref: "Locus de Controle" },
      { q: "Você acredita genuinamente que pode transformar seu corpo nos próximos 6 meses?", ref: "Autoeficácia" },
      { q: "Consegue adiar gratificação imediata pelo resultado futuro?", ref: "Sistema 1 vs 2" },
    ],
    exercises: [
      { title: "Pausa dos 10 Segundos", desc: "Antes de cada decisão alimentar, conte 10 segundos. Ative o Sistema 2. Registre quantas vezes conseguiu hoje.", difficulty: 1, ref: "Kahneman" },
      { title: "Diário de Locus", desc: "Registre 3 situações do dia. Classifique: eu controlei ou terceirizei? Reescreva as externas como internas.", difficulty: 2, ref: "Rotter" },
      { title: "Mapa de Autoeficácia", desc: "Liste 5 conquistas passadas que provam sua capacidade. Releia antes de dormir por 7 dias.", difficulty: 1, ref: "Bandura" },
      { title: "Reframe Cognitivo", desc: "Transforme 3 frases de 'eu não consigo' para 'eu ainda não encontrei o caminho'. Escreva e releia.", difficulty: 2, ref: "Dweck" },
    ],
  },
  C: {
    key: "C",
    label: "COMPORTAMENTO",
    fullLabel: "Comportamento",
    color: "#00FF88",
    accent: "#4ADE80",
    tagline: "O Código de Execução",
    subtitle: "Arquitetura de hábitos · design de ambiente",
    manifesto:
      "Mentalidade sem comportamento é filosofia de bar. Comportamento é onde o software vira ação. É o código que transforma intenção em resultado mensurável.",
    authors: [
      { name: "James Clear", inst: "Autor · Pesquisador", year: 2018, concept: "4 Leis dos Hábitos", book: "Atomic Habits", insight: "1) Torne óbvio — 2) Torne atraente — 3) Torne fácil — 4) Torne satisfatório. Se o comportamento não acontece, uma dessas leis está falhando. Diagnostique e corrija." },
      { name: "Charles Duhigg", inst: "MIT · Yale", year: 2012, concept: "Loop do Hábito", book: "The Power of Habit", insight: "Todo comportamento segue: Gatilho → Rotina → Recompensa. Você não elimina hábitos — reprograma a rotina mantendo o gatilho e trocando a recompensa." },
      { name: "BJ Fogg", inst: "Stanford University", year: 2020, concept: "Tiny Habits", book: "Tiny Habits", insight: "Comece ridiculamente pequeno. Quer treinar? Coloque o tênis. Só. O comportamento mínimo viável remove a barreira da inércia e inicia a cadeia." },
      { name: "Richard Thaler", inst: "Chicago · Nobel 2017", year: 2008, concept: "Nudge Theory", book: "Nudge", insight: "Arquitetar ambientes que guiam decisões sem proibir. Prato menor = come menos. Frutas visíveis = come frutas. O ambiente decide por você." },
      { name: "Roy Baumeister", inst: "Princeton University", year: 2011, concept: "Willpower Depletion", book: "Willpower", insight: "Força de vontade é recurso finito — esgota com o uso. Por isso a sabotagem acontece à NOITE. Solução: automatize o máximo de decisões possível." },
      { name: "James Prochaska", inst: "Univ. Rhode Island", year: 1983, concept: "5 Estágios de Mudança", book: "Transtheoretical Model", insight: "Pré-contemplação → Contemplação → Preparação → Ação → Manutenção. A intervenção errada no estágio errado garante o fracasso." },
    ],
    quote: "Transformação é sistema. O comportamento vem antes do alimento.",
    diagnostics: [
      { q: "Suas refeições são planejadas com antecedência ou decididas na hora?", ref: "Atomic Habits" },
      { q: "Seu ambiente físico favorece ou sabota seus objetivos de saúde?", ref: "Nudge Theory" },
      { q: "Você identifica gatilhos emocionais que disparam alimentação descontrolada?", ref: "Loop do Hábito" },
    ],
    exercises: [
      { title: "Auditoria de Ambiente", desc: "Fotografe geladeira e despensa. Classifique cada item: favorece ou sabota? Elimine 3 sabotadores hoje.", difficulty: 1, ref: "Thaler" },
      { title: "Reprogramação de Loop", desc: "Identifique 1 hábito destrutivo. Mapeie: gatilho → rotina → recompensa. Substitua apenas a rotina.", difficulty: 3, ref: "Duhigg" },
      { title: "Comportamento Mínimo Viável", desc: "Escolha 1 hábito que quer criar. Reduza ao mínimo absoluto (2 min). Faça por 5 dias sem falhar.", difficulty: 1, ref: "Fogg" },
      { title: "Checklist das 4 Leis", desc: "Para cada meta: está óbvio? Atraente? Fácil? Satisfatório? Corrija a lei que está falhando.", difficulty: 2, ref: "Clear" },
    ],
  },
  E: {
    key: "E",
    label: "EXECUÇÃO",
    fullLabel: "Execução",
    color: "#F59E0B",
    accent: "#FBBF24",
    tagline: "O Output Mensurável",
    subtitle: "Sistemas de performance · accountability · feedback",
    manifesto:
      "Execução é onde tudo se materializa. Sem execução, mentalidade é devaneio e comportamento é intenção. Planejamento sem execução é só opinião.",
    authors: [
      { name: "John Boyd", inst: "U.S. Air Force", year: 1976, concept: "OODA Loop", book: "Destruction and Creation", insight: "Observar → Orientar → Decidir → Agir. Quem cicla mais rápido vence. No fitness: ajuste semanal baseado em dados concretos, não intuição." },
      { name: "Peter Gollwitzer", inst: "New York University", year: 1999, concept: "Implementation Intentions", book: "American Psychologist", insight: "Planos SE [situação] ENTÃO [ação] triplicam a taxa de execução. Chega de 'vou comer melhor.' Formato: SE for 12h ENTÃO como minha marmita." },
      { name: "Gary Keller", inst: "Autor · Empreendedor", year: 2013, concept: "The ONE Thing", book: "The ONE Thing", insight: "Qual é a ÚNICA coisa que, ao fazê-la, tudo mais se torna mais fácil ou desnecessário? Foco radical elimina a ilusão do multitasking." },
      { name: "Cal Newport", inst: "Georgetown University", year: 2016, concept: "Deep Work", book: "Deep Work", insight: "4h de trabalho focado superam 10h fragmentadas. 45min de treino com intenção em cada rep > 2h de treino distraído com celular." },
      { name: "Jocko Willink", inst: "U.S. Navy SEALs", year: 2017, concept: "Discipline = Freedom", book: "Discipline Equals Freedom", insight: "Disciplina não é restrição — é o que libera. O sistema disciplinado elimina decisões desnecessárias e libera energia para o que importa." },
      { name: "David Goggins", inst: "U.S. Navy SEALs", year: 2018, concept: "Regra dos 40%", book: "Can't Hurt Me", insight: "Quando sua mente diz que acabou, você está a 40% do potencial real. O limite é mental, nunca físico. Prove isso todo dia." },
    ],
    quote: "Planejamento sem execução é só opinião.",
    diagnostics: [
      { q: "Você tem um plano escrito com ações específicas para esta semana?", ref: "Implementation Intentions" },
      { q: "Você rastreia seu progresso com dados concretos (peso, fotos, cargas)?", ref: "OODA Loop" },
      { q: "Você tem accountability — alguém que cobra seus resultados?", ref: "Discipline = Freedom" },
    ],
    exercises: [
      { title: "Protocolo SE-ENTÃO", desc: "Crie 3 implementation intentions hoje. Formato: SE [hora/situação] ENTÃO [ação específica]. Cole no espelho.", difficulty: 1, ref: "Gollwitzer" },
      { title: "OODA Semanal", desc: "Todo domingo execute: Observe (dados) → Oriente (análise) → Decida (ajustes) → Aja (implemente na segunda).", difficulty: 3, ref: "Boyd" },
      { title: "Deep Work Session", desc: "Próximo treino: 45min sem celular, sem conversa, intenção máxima em cada repetição. Cronometre.", difficulty: 2, ref: "Newport" },
      { title: "The ONE Thing Semanal", desc: "Defina a ÚNICA coisa que você vai dominar esta semana. Escreva. Foque. Execute. Só passe pra próxima quando dominar.", difficulty: 2, ref: "Keller" },
    ],
  },
};

export interface Profile {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  intervention: string;
  weakness: string;
  traits: string[];
}

export const PROFILES: Profile[] = [
  { id: "reativo", name: "O REATIVO", icon: "⚡", color: "#EF4444", desc: "Opera no piloto automático. Come por emoção, responde ao ambiente em vez de moldá-lo.", intervention: "Design de ambiente (Nudge) + Loop do Hábito (Duhigg)", weakness: "Mentalidade", traits: ["Impulsivo", "Sem sistema", "Reage ao ambiente"] },
  { id: "planejador", name: "O PLANEJADOR", icon: "📋", color: "#3B82F6", desc: "Pesquisa infinitamente, nunca executa. Confunde informação com transformação.", intervention: "Implementation Intentions (Gollwitzer) + The ONE Thing (Keller)", weakness: "Execução", traits: ["Paralisia por análise", "Perfeccionismo", "Procrastinação"] },
  { id: "intenso", name: "O INTENSO", icon: "🔥", color: "#F59E0B", desc: "Vai de 0 a 100 e volta pra 0. Tudo ou nada. Ciclos radicais sem sustentação.", intervention: "Tiny Habits (Fogg) + Identidade > Resultado (Clear)", weakness: "Comportamento", traits: ["Ciclos extremos", "Burnout", "Inconsistente"] },
  { id: "consistente", name: "O CONSISTENTE", icon: "🎯", color: "#10B981", desc: "Sistema ativo e rodando. Precisa de otimização e periodização, não de motivação.", intervention: "OODA Loop + Deep Work + Periodização comportamental", weakness: "Nenhum crítico", traits: ["Disciplinado", "Autônomo", "Busca refinamento"] },
];

export const MCE_QUOTES = [
  "Transformação é sistema.",
  "Planejamento sem execução é só opinião.",
  "Disciplina não é talento. É arquitetura comportamental.",
  "Genética é o ponto de partida, não o teto.",
  "Ambiente vence força de vontade. Sempre.",
  "A pessoa que você quer ser já sabe o que fazer. Aja como ela.",
  "Informação sem execução é entretenimento.",
  "10 segundos entre o impulso e a decisão. Ali mora a liberdade.",
  "O shape é consequência. O processo é o produto.",
  "Resultados são atrasados. Comportamento é imediato.",
];
