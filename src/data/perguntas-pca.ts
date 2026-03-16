import { PerguntaPCA } from "@/types/pca";

export const PERGUNTAS_PCA: PerguntaPCA[] = [
  {
    id: 1,
    eixo: "MINDSET",
    pergunta: "Como você se sente quando fura a dieta?",
    opcoes: [
      { id: "A", texto: "Culpa intensa, fico me punindo por dias", pontos: [{ perfil: "Sabotador Emocional", valor: 3 }] },
      { id: "B", texto: "Frustrado, mas continuo no dia seguinte", pontos: [{ perfil: "Executor Inconsistente", valor: 3 }] },
      { id: "C", texto: "Sensação de fracasso total — desisto de vez", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 3 }] },
      { id: "D", texto: "Erro pontual. Ajusto sem drama e sigo", pontos: [{ perfil: "Atleta Mental", valor: 3 }] },
    ],
  },
  {
    id: 2,
    eixo: "MINDSET",
    pergunta: "Qual frase melhor descreve sua relação com comida?",
    opcoes: [
      { id: "A", texto: "Comida é meu conforto nos momentos difíceis", pontos: [{ perfil: "Sabotador Emocional", valor: 3 }] },
      { id: "B", texto: "Sei o que comer, mas não consigo manter", pontos: [{ perfil: "Executor Inconsistente", valor: 3 }] },
      { id: "C", texto: "Ou estou 100% no plano ou estou completamente fora", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 3 }] },
      { id: "D", texto: "Comida é combustível para minha performance", pontos: [{ perfil: "Atleta Mental", valor: 3 }] },
    ],
  },
  {
    id: 3,
    eixo: "MINDSET",
    pergunta: "O que você pensa quando vê resultados lentos na balança?",
    opcoes: [
      { id: "A", texto: "Fico desmotivado e busco consolo na comida", pontos: [{ perfil: "Sabotador Emocional", valor: 2 }] },
      { id: "B", texto: "Fico animado por uns dias, mas perco o gás", pontos: [{ perfil: "Executor Inconsistente", valor: 2 }] },
      { id: "C", texto: "Sinto que não adianta e considero parar tudo", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 2 }] },
      { id: "D", texto: "Revejo os dados e ajusto a estratégia", pontos: [{ perfil: "Atleta Mental", valor: 2 }] },
    ],
  },
  {
    id: 4,
    eixo: "MINDSET",
    pergunta: "Como você descreve sua crença sobre seu próprio corpo?",
    opcoes: [
      { id: "A", texto: "Tenho muita dificuldade de me aceitar como sou", pontos: [{ perfil: "Sabotador Emocional", valor: 2 }] },
      { id: "B", texto: "Quero mudar mas não me comprometo de verdade", pontos: [{ perfil: "Executor Inconsistente", valor: 2 }] },
      { id: "C", texto: "Só me aceito quando alcançar o peso ideal", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 2 }] },
      { id: "D", texto: "Tenho clareza de onde estou e onde quero chegar", pontos: [{ perfil: "Atleta Mental", valor: 2 }] },
    ],
  },
  {
    id: 5,
    eixo: "COMPORTAMENTO",
    pergunta: "O que mais te faz comer fora do plano?",
    opcoes: [
      { id: "A", texto: "Ansiedade, estresse ou emoções negativas", pontos: [{ perfil: "Sabotador Emocional", valor: 3 }] },
      { id: "B", texto: "Falta de planejamento ou praticidade", pontos: [{ perfil: "Executor Inconsistente", valor: 3 }] },
      { id: "C", texto: "Pressão social ou eventos fora da rotina", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 3 }] },
      { id: "D", texto: "Raramente saio do plano — tenho controle", pontos: [{ perfil: "Atleta Mental", valor: 3 }] },
    ],
  },
  {
    id: 6,
    eixo: "COMPORTAMENTO",
    pergunta: "Quando você inicia uma dieta, o que normalmente acontece?",
    opcoes: [
      { id: "A", texto: "Vai bem por dias, depois um evento emocional quebra tudo", pontos: [{ perfil: "Sabotador Emocional", valor: 3 }] },
      { id: "B", texto: "Começo ótimo, perco o ritmo na 2ª ou 3ª semana", pontos: [{ perfil: "Executor Inconsistente", valor: 3 }] },
      { id: "C", texto: "Qualquer deslize me faz recomeçar do zero", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 3 }] },
      { id: "D", texto: "Mantenho com ajustes graduais e consistentes", pontos: [{ perfil: "Atleta Mental", valor: 3 }] },
    ],
  },
  {
    id: 7,
    eixo: "COMPORTAMENTO",
    pergunta: "Como você lida com festas, reuniões e refeições sociais?",
    opcoes: [
      { id: "A", texto: "Exagero e depois fico com culpa por dias", pontos: [{ perfil: "Sabotador Emocional", valor: 2 }] },
      { id: "B", texto: "Como de tudo e retomo a dieta na segunda-feira", pontos: [{ perfil: "Executor Inconsistente", valor: 2 }] },
      { id: "C", texto: "Fico ansioso e prefiro evitar essas situações", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 2 }] },
      { id: "D", texto: "Faço escolhas conscientes e sigo sem culpa", pontos: [{ perfil: "Atleta Mental", valor: 2 }] },
    ],
  },
  {
    id: 8,
    eixo: "COMPORTAMENTO",
    pergunta: "Com qual frequência você registra o que come?",
    opcoes: [
      { id: "A", texto: "Quase nunca — prefiro não saber", pontos: [{ perfil: "Sabotador Emocional", valor: 2 }] },
      { id: "B", texto: "Registro por alguns dias e depois abandono", pontos: [{ perfil: "Executor Inconsistente", valor: 2 }] },
      { id: "C", texto: "Registro obsessivamente até errar e parar", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 2 }] },
      { id: "D", texto: "Registro sistematicamente como ferramenta", pontos: [{ perfil: "Atleta Mental", valor: 2 }] },
    ],
  },
  {
    id: 9,
    eixo: "EXECUÇÃO",
    pergunta: "Você prepara suas refeições com antecedência (meal prep)?",
    opcoes: [
      { id: "A", texto: "Não — decido na hora conforme meu humor", pontos: [{ perfil: "Sabotador Emocional", valor: 3 }] },
      { id: "B", texto: "Planejo, mas não executo com constância", pontos: [{ perfil: "Executor Inconsistente", valor: 3 }] },
      { id: "C", texto: "Quando faço, é perfeito. Quando falho, abandono", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 3 }] },
      { id: "D", texto: "Sim, é parte da minha rotina semanal", pontos: [{ perfil: "Atleta Mental", valor: 3 }] },
    ],
  },
  {
    id: 10,
    eixo: "EXECUÇÃO",
    pergunta: "Qual é sua maior dificuldade prática na alimentação?",
    opcoes: [
      { id: "A", texto: "Resistir quando estou em baixa emocional", pontos: [{ perfil: "Sabotador Emocional", valor: 3 }] },
      { id: "B", texto: "Manter a consistência por mais de 2 semanas", pontos: [{ perfil: "Executor Inconsistente", valor: 3 }] },
      { id: "C", texto: "Aceitar dias imperfeitos sem desistir de tudo", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 3 }] },
      { id: "D", texto: "Otimizar ainda mais os resultados que já tenho", pontos: [{ perfil: "Atleta Mental", valor: 3 }] },
    ],
  },
  {
    id: 11,
    eixo: "EXECUÇÃO",
    pergunta: "Como você reage ao receber uma orientação que exige mudança de hábito?",
    opcoes: [
      { id: "A", texto: "Me sinto sobrecarregado e resistente", pontos: [{ perfil: "Sabotador Emocional", valor: 2 }] },
      { id: "B", texto: "Começo animado, mas não sustento", pontos: [{ perfil: "Executor Inconsistente", valor: 2 }] },
      { id: "C", texto: "Quero seguir tudo ao pé da letra ou não faço nada", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 2 }] },
      { id: "D", texto: "Avalio, adapto e implemento progressivamente", pontos: [{ perfil: "Atleta Mental", valor: 2 }] },
    ],
  },
  {
    id: 12,
    eixo: "EXECUÇÃO",
    pergunta: "Se pudesse escolher um tipo de suporte ideal, qual seria?",
    opcoes: [
      { id: "A", texto: "Alguém que entenda minhas emoções e me acolha", pontos: [{ perfil: "Sabotador Emocional", valor: 2 }] },
      { id: "B", texto: "Lembretes e checks frequentes para não esquecer", pontos: [{ perfil: "Executor Inconsistente", valor: 2 }] },
      { id: "C", texto: "Um plano detalhado e estruturado para seguir", pontos: [{ perfil: "Perfeccionista Paralisado", valor: 2 }] },
      { id: "D", texto: "Dados, métricas e metas desafiadoras", pontos: [{ perfil: "Atleta Mental", valor: 2 }] },
    ],
  },
];
