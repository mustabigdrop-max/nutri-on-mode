// Estrutura acionável do Protocolo MCE 24H — usada pelo checklist interativo.

export type Protocol24hItem = { id: string; label: string };
export type Protocol24hBlock = {
  id: string;
  title: string;
  time: string;
  pillar: "M" | "C" | "E" | "MCE";
  pillarLabel: string;
  duration: string;
  color: string;
  items: Protocol24hItem[];
};

export const MCE_24H_BLOCKS: Protocol24hBlock[] = [
  {
    id: "b1",
    title: "IGNIÇÃO",
    time: "05:00–06:00",
    pillar: "M",
    pillarLabel: "MINDSET",
    duration: "15-20 min",
    color: "#F59E0B",
    items: [
      { id: "b1-1", label: "Âncora de Identidade (2 min) — antes do celular" },
      { id: "b1-2", label: "Revisão de Intenção — 3 prioridades escritas" },
      { id: "b1-3", label: "Ativação física + luz natural" },
      { id: "b1-4", label: "Declaração do dia em voz alta" },
    ],
  },
  {
    id: "b2",
    title: "EXECUÇÃO PRIMÁRIA",
    time: "06:00–12:00",
    pillar: "E",
    pillarLabel: "EXECUÇÃO",
    duration: "bloco de fazer",
    color: "#60A5FA",
    items: [
      { id: "b2-1", label: "Tarefa mais difícil primeiro (deep work)" },
      { id: "b2-2", label: "Treino ou sessão de performance realizada" },
      { id: "b2-3", label: "Refeições planejadas cumpridas (sem improviso)" },
      { id: "b2-4", label: "Zero negociação com a meta do dia" },
    ],
  },
  {
    id: "b3",
    title: "RECALIBRAÇÃO",
    time: "12:00–13:00",
    pillar: "C",
    pillarLabel: "COMPORTAMENTO",
    duration: "5-10 min",
    color: "#4ADE80",
    items: [
      { id: "b3-1", label: "Checagem honesta: o que saiu do plano?" },
      { id: "b3-2", label: "Ajuste da tarde (1 correção concreta)" },
      { id: "b3-3", label: "Reset mental de 3 minutos sem tela" },
    ],
  },
  {
    id: "b4",
    title: "SUSTENTAÇÃO",
    time: "13:00–18:00",
    pillar: "C",
    pillarLabel: "COMPORTAMENTO + EXECUÇÃO",
    duration: "janela crítica",
    color: "#2DD4BF",
    items: [
      { id: "b4-1", label: "Antecipar gatilho de queda (fome/cansaço/tédio)" },
      { id: "b4-2", label: "Executar o plano B em vez de improvisar" },
      { id: "b4-3", label: "Hidratação e refeição da tarde no horário" },
      { id: "b4-4", label: "Encerrar pendência que trava o dia seguinte" },
    ],
  },
  {
    id: "b5",
    title: "CONSOLIDAÇÃO",
    time: "20:00–22:00",
    pillar: "M",
    pillarLabel: "MINDSET + COMPORTAMENTO",
    duration: "15-20 min",
    color: "#A78BFA",
    items: [
      { id: "b5-1", label: "Registro do dia: 3 vitórias comportamentais" },
      { id: "b5-2", label: "Interpretação intencional das falhas" },
      { id: "b5-3", label: "Preparo do dia seguinte (roupa, comida, agenda)" },
      { id: "b5-4", label: "Desligamento de telas + rotina de sono" },
    ],
  },
  {
    id: "b6",
    title: "RESET SEMANAL",
    time: "Domingo",
    pillar: "MCE",
    pillarLabel: "OS TRÊS PILARES",
    duration: "30-45 min",
    color: "#F472B6",
    items: [
      { id: "b6-1", label: "Revisão dos 7 dias (M / C / E)" },
      { id: "b6-2", label: "Recalcular scores no Diagnóstico" },
      { id: "b6-3", label: "Definir 3 metas da semana" },
      { id: "b6-4", label: "Planejar treinos e refeições da semana" },
    ],
  },
];

export const MCE_24H_TOTAL_ITEMS = MCE_24H_BLOCKS.reduce((a, b) => a + b.items.length, 0);
