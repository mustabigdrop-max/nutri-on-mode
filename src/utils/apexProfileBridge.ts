// APEX → Perfil de Resistência bridge
// Mapeia achados posturais para músculos inibidos e exercícios
// no perfil ALONGADO (Stretched-Mediated Hypertrophy).
import type { ResistanceProfile } from "@/utils/exerciseProfiles";

export interface ApexCorrectiveExercise {
  nome: string;
  perfil: "ALONGADO";
  series: number;
  reps: string;
  foco: string;
}

export interface ApexProfileRule {
  musculo_inibido: string;
  grupo: string;
  perfil_prioridade: "ALONGADO";
  exercicios_corretivos: ApexCorrectiveExercise[];
}

export const APEX_TO_PROFILE_MAP: Record<string, ApexProfileRule[]> = {
  scapula_alada: [
    {
      musculo_inibido: "Serrátil anterior",
      grupo: "costas",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Straight arm pulldown", perfil: "ALONGADO", series: 3, reps: "12-15", foco: "Ativação serrátil — tensão no alongado" },
        { nome: "Pullover máquina", perfil: "ALONGADO", series: 3, reps: "12-15", foco: "Inserção inferior do dorsal + serrátil" },
      ],
    },
  ],
  shoulder_protraction: [
    {
      musculo_inibido: "Rombóides",
      grupo: "costas",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Remada unilateral halteres", perfil: "ALONGADO", series: 3, reps: "12", foco: "Retração escapular com ROM completo" },
        { nome: "Straight arm pulldown", perfil: "ALONGADO", series: 2, reps: "15", foco: "Tensão no alongado — dorsal + serrátil" },
      ],
    },
    {
      musculo_inibido: "Trapézio inferior",
      grupo: "costas",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Pullover máquina", perfil: "ALONGADO", series: 3, reps: "15", foco: "Depressão escapular — trapézio inferior" },
      ],
    },
  ],
  shoulder_asymmetry: [
    {
      musculo_inibido: "Deltóide lateral lado inibido",
      grupo: "ombro",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Elevação lateral cabo baixo", perfil: "ALONGADO", series: 3, reps: "15", foco: "Tensão no alongado — SMH deltóide lateral" },
        { nome: "Crucifixo invertido", perfil: "ALONGADO", series: 2, reps: "15", foco: "Deltóide posterior — equilíbrio bilateral" },
      ],
    },
  ],
  pelvic_tilt: [
    {
      musculo_inibido: "Glúteo médio",
      grupo: "gluteo",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Abdução cabo em pé", perfil: "ALONGADO", series: 3, reps: "15", foco: "SMH glúteo médio — tensão no alongado" },
        { nome: "Afundo búlgaro", perfil: "ALONGADO", series: 3, reps: "10 cada", foco: "Extensão máxima — glúteo no alongado" },
      ],
    },
  ],
  hyperlordosis: [
    {
      musculo_inibido: "Glúteo máximo",
      grupo: "gluteo",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Agachamento sumô", perfil: "ALONGADO", series: 3, reps: "12", foco: "Glúteo no alongado + ativação profunda" },
        { nome: "Afundo búlgaro", perfil: "ALONGADO", series: 3, reps: "10 cada", foco: "Extensão do quadril — glúteo alongado" },
      ],
    },
    {
      musculo_inibido: "Isquiotibiais",
      grupo: "posterior",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Leg curl sentado", perfil: "ALONGADO", series: 3, reps: "12", foco: "Joelho flexionado — SMH isquiotibiais" },
        { nome: "Stiff", perfil: "ALONGADO", series: 3, reps: "12", foco: "Tensão máxima no alongado — posterior" },
      ],
    },
  ],
  lateral_spine_deviation: [
    {
      musculo_inibido: "Oblíquo contralateral",
      grupo: "core",
      perfil_prioridade: "ALONGADO",
      exercicios_corretivos: [
        { nome: "Prancha lateral", perfil: "ALONGADO", series: 3, reps: "30s cada", foco: "Tensão lateral — oblíquos no alongado" },
      ],
    },
  ],
};

export interface AchadoClinico {
  key: string;
  titulo: string;
  graus: number;
}

export function generateApexCorrectionProtocol(achados: AchadoClinico[]): string {
  const lines: string[] = [
    "=== PROTOCOLO CORRETIVO APEX ===",
    "Base: Perfil de Resistência + Stretched-Mediated Hypertrophy",
    "",
  ];
  for (const achado of achados) {
    if (!achado || achado.graus === 0) continue;
    const rules = APEX_TO_PROFILE_MAP[achado.key];
    if (!rules?.length) continue;
    lines.push(`▸ ${achado.titulo} (${achado.graus}°)`);
    for (const rule of rules) {
      lines.push(`  Músculo inibido: ${rule.musculo_inibido} → Prioridade: ${rule.perfil_prioridade}`);
      for (const ex of rule.exercicios_corretivos) {
        lines.push(`  • ${ex.nome} [${ex.perfil}] — ${ex.series}×${ex.reps} | ${ex.foco}`);
      }
      lines.push("");
    }
  }
  lines.push(
    "INSTRUÇÃO PARA O TRAININGON:",
    "Exercícios marcados [ALONGADO] devem ser posicionados no início do aquecimento.",
    "Priorizar perfil ALONGADO nos músculos inibidos identificados acima.",
  );
  return lines.join("\n");
}

export interface ParsedApexExercise {
  nome: string;
  perfil: ResistanceProfile;
  series: number;
  reps: string;
  foco: string;
  isApex: true;
  isSMH: boolean;
}

export interface ParsedApexProtocol {
  exercicios: ParsedApexExercise[];
  musculosInibidos: string[];
}

export function parseApexProtocol(protocolText: string): ParsedApexProtocol {
  const exercicios: ParsedApexExercise[] = [];
  const musculosInibidos: string[] = [];
  if (!protocolText) return { exercicios, musculosInibidos };

  for (const raw of protocolText.split("\n")) {
    const line = raw.trim();
    if (line.includes("Músculo inibido:")) {
      const m = line.match(/Músculo inibido:\s*([^→]+)/);
      if (m) musculosInibidos.push(m[1].trim());
    }
    const exMatch = line.match(/•\s+(.+?)\s+\[(\w+)\]\s+—\s+(\d+)×([\d\w\s-]+?)\s+\|\s+(.+)/);
    if (exMatch) {
      const [, nome, perfil, series, reps, foco] = exMatch;
      exercicios.push({
        nome: nome.trim(),
        perfil: perfil as ResistanceProfile,
        series: parseInt(series, 10),
        reps: reps.trim(),
        foco: foco.trim(),
        isApex: true,
        isSMH: perfil === "ALONGADO",
      });
    }
  }
  // Ordenar: ALONGADO primeiro (SMH priority)
  exercicios.sort((a, b) => {
    if (a.perfil === "ALONGADO" && b.perfil !== "ALONGADO") return -1;
    if (b.perfil === "ALONGADO" && a.perfil !== "ALONGADO") return 1;
    return 0;
  });
  return { exercicios, musculosInibidos };
}
