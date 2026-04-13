export const PHASES = [
  { id: "bulking", name: "Bulking", emoji: "💪", subtitle: "Ganho de massa muscular" },
  { id: "cutting", name: "Cutting", emoji: "🔥", subtitle: "Definição e queima de gordura" },
  { id: "manutencao", name: "Manutenção", emoji: "⚖️", subtitle: "Manter composição atual" },
  { id: "recomposicao", name: "Recomposição", emoji: "🔄", subtitle: "Ganhar músculo e perder gordura" },
  { id: "emagrecimento", name: "Emagrecimento", emoji: "📉", subtitle: "Perda de peso com saúde" },
  { id: "performance", name: "Performance", emoji: "🏆", subtitle: "Performance atlética máxima" },
];

export const MUSCLES = [
  "Peitoral", "Costas (Lat)", "Deltoides", "Bíceps", "Tríceps",
  "Quadríceps", "Posterior de Coxa", "Glúteos", "Panturrilha",
  "Core/Abdômen", "Trapézio", "Antebraço", "Romboides", "Eretores da Espinha",
];

export const LEVELS = [
  { value: "iniciante", label: "Iniciante (0–1 ano)" },
  { value: "intermediario", label: "Intermediário (1–3 anos)" },
  { value: "avancado", label: "Avançado (3+ anos)" },
  { value: "atleta", label: "Atleta Competitivo" },
];

export const WEEKS_OPTIONS = ["4", "6", "8", "12", "16"];
export const DAYS_OPTIONS = ["3", "4", "5", "6"];
export const SESSION_DURATIONS = ["30min", "45min", "60min", "75min", "90min+"];
export const CARDIO_OPTIONS = ["Não", "1-2x semana", "3-4x semana", "Diário"];
export const STRESS_OPTIONS = ["Ótimo", "Bom", "Regular", "Ruim"];

export const EQUIPMENT_OPTIONS = [
  "Academia completa",
  "Halteres em casa",
  "Barra + anilhas",
  "Elásticos/cabos",
  "Sem equipamento",
  "Crossfit Box",
];

export interface VolumeLandmark {
  muscle: string;
  beginner: { mev: number; mav: number; mrv: number };
  intermediate: { mev: number; mav: number; mrv: number };
  advanced: { mev: number; mav: number; mrv: number };
}

export const VOLUME_LANDMARKS: VolumeLandmark[] = [
  { muscle: "Peitoral", beginner: { mev: 8, mav: 12, mrv: 18 }, intermediate: { mev: 10, mav: 16, mrv: 22 }, advanced: { mev: 12, mav: 20, mrv: 26 } },
  { muscle: "Costas (Lat)", beginner: { mev: 10, mav: 14, mrv: 20 }, intermediate: { mev: 12, mav: 18, mrv: 25 }, advanced: { mev: 14, mav: 22, mrv: 30 } },
  { muscle: "Deltoides", beginner: { mev: 8, mav: 12, mrv: 18 }, intermediate: { mev: 10, mav: 16, mrv: 22 }, advanced: { mev: 12, mav: 20, mrv: 26 } },
  { muscle: "Bíceps", beginner: { mev: 6, mav: 10, mrv: 16 }, intermediate: { mev: 8, mav: 14, mrv: 20 }, advanced: { mev: 10, mav: 18, mrv: 26 } },
  { muscle: "Tríceps", beginner: { mev: 6, mav: 10, mrv: 16 }, intermediate: { mev: 8, mav: 14, mrv: 20 }, advanced: { mev: 10, mav: 18, mrv: 26 } },
  { muscle: "Quadríceps", beginner: { mev: 8, mav: 14, mrv: 20 }, intermediate: { mev: 10, mav: 16, mrv: 22 }, advanced: { mev: 12, mav: 20, mrv: 26 } },
  { muscle: "Posterior de Coxa", beginner: { mev: 6, mav: 10, mrv: 16 }, intermediate: { mev: 8, mav: 14, mrv: 20 }, advanced: { mev: 10, mav: 18, mrv: 24 } },
  { muscle: "Glúteos", beginner: { mev: 4, mav: 8, mrv: 16 }, intermediate: { mev: 6, mav: 12, mrv: 20 }, advanced: { mev: 8, mav: 16, mrv: 25 } },
  { muscle: "Panturrilha", beginner: { mev: 8, mav: 14, mrv: 20 }, intermediate: { mev: 10, mav: 16, mrv: 22 }, advanced: { mev: 12, mav: 20, mrv: 28 } },
  { muscle: "Core/Abdômen", beginner: { mev: 6, mav: 10, mrv: 16 }, intermediate: { mev: 8, mav: 12, mrv: 20 }, advanced: { mev: 10, mav: 16, mrv: 22 } },
  { muscle: "Trapézio", beginner: { mev: 6, mav: 10, mrv: 14 }, intermediate: { mev: 8, mav: 12, mrv: 18 }, advanced: { mev: 10, mav: 14, mrv: 22 } },
  { muscle: "Antebraço", beginner: { mev: 4, mav: 8, mrv: 14 }, intermediate: { mev: 6, mav: 10, mrv: 16 }, advanced: { mev: 8, mav: 14, mrv: 20 } },
];

export const RESULT_TABS = [
  { id: "protocolo", label: "Protocolo" },
  { id: "anatomia", label: "Anatomia & Biomecânica" },
  { id: "tecnica", label: "Técnica de Execução" },
  { id: "periodizacao", label: "Periodização" },
];
