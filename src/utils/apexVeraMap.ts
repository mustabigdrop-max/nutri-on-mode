// APEX → VERA → TrainingON
// Mapeamento de achados posturais APEX para pontos fracos femininos
// + 8 Pilares Darkside de desenvolvimento

export interface ApexAchado {
  key: string;
  titulo: string;
  graus: number;
  severidade: "CRITICO" | "LIMITROFE" | "NORMAL";
  musculo_inibido: string;
  musculo_dominante: string;
  lado: "E" | "D" | "bilateral" | null;
}

export interface ApexToVERAPackage {
  atleta_id: string;
  atleta_nome: string;
  atleta_sexo: "F" | "M";
  sri: number | null;
  body_score: number | null;
  fcs: number | null;
  qualidade: number;
  achados: ApexAchado[];
  proporcoes: {
    largura_ombro_px: number | null;
    largura_quadril_px: number | null;
    largura_cintura_px: number | null;
    ratio_ombro_quadril: number | null;
    ratio_cintura_quadril: number | null;
  };
  plumb_source: "C7+L5" | "C7" | "L5" | "frame-center";
  analisado_em: string;
}

export interface ProtocoloExercicio {
  exercicio: string;
  perfil: "ALONGADO" | "ENCURTADO" | "CONSTANTE";
  zona: number;
  series: number;
  reps: string;
  smh: boolean;
  prioridade: "CRITICA" | "ALTA" | "NORMAL";
}

export interface WeaknessMapEntry {
  ponto_fraco: string;
  grupo_muscular: string;
  porcao: string;
  impacto_visual: string;
  impacto_postural: string;
  pilares_darkside: number[];
  protocolo_treino: ProtocoloExercicio[];
}

export const APEX_FEMALE_WEAKNESS_MAP: Record<string, WeaknessMapEntry> = {
  scapula_alada: {
    ponto_fraco: "Escápula alada",
    grupo_muscular: "costas",
    porcao: "Serrátil anterior",
    impacto_visual: "Costas sem V-taper — bordas escapulares salientes",
    impacto_postural: "Ombro protraído — postura cifótica",
    pilares_darkside: [1, 2, 4],
    protocolo_treino: [
      { exercicio: "Straight arm pulldown", perfil: "ALONGADO", zona: 3, series: 3, reps: "12-15", smh: true, prioridade: "CRITICA" },
      { exercicio: "Serrátil press na parede", perfil: "CONSTANTE", zona: 5, series: 3, reps: "15", smh: false, prioridade: "CRITICA" },
      { exercicio: "Pullover máquina", perfil: "ALONGADO", zona: 4, series: 2, reps: "15", smh: true, prioridade: "ALTA" },
    ],
  },
  pelvic_tilt: {
    ponto_fraco: "Inclinação pélvica / glúteo amnésico",
    grupo_muscular: "gluteo",
    porcao: "Glúteo máximo + médio",
    impacto_visual: "Glúteo sem projeção, hiperlordose aparente",
    impacto_postural: "Pelve em anteversão — dor lombar crônica",
    pilares_darkside: [1, 2, 3, 4],
    protocolo_treino: [
      { exercicio: "Hip thrust barra", perfil: "ENCURTADO", zona: 3, series: 4, reps: "10-12", smh: false, prioridade: "CRITICA" },
      { exercicio: "Abdução cabo em pé", perfil: "ALONGADO", zona: 4, series: 3, reps: "15", smh: true, prioridade: "CRITICA" },
      { exercicio: "Afundo búlgaro", perfil: "ALONGADO", zona: 3, series: 3, reps: "10 cada", smh: true, prioridade: "ALTA" },
      { exercicio: "Clamshell com faixa", perfil: "ALONGADO", zona: 5, series: 3, reps: "20", smh: false, prioridade: "ALTA" },
    ],
  },
  shoulder_asymmetry: {
    ponto_fraco: "Assimetria de ombros",
    grupo_muscular: "ombro",
    porcao: "Deltóide lateral",
    impacto_visual: "V-taper comprometido — ombros desnivelados",
    impacto_postural: "Compensação cervical e trapézio superior tenso",
    pilares_darkside: [1, 4, 6],
    protocolo_treino: [
      { exercicio: "Elevação lateral cabo baixo", perfil: "ALONGADO", zona: 3, series: 3, reps: "15", smh: true, prioridade: "CRITICA" },
      { exercicio: "Crucifixo invertido", perfil: "ALONGADO", zona: 4, series: 3, reps: "15", smh: false, prioridade: "ALTA" },
      { exercicio: "Face pull", perfil: "ENCURTADO", zona: 4, series: 2, reps: "15", smh: false, prioridade: "ALTA" },
    ],
  },
  lateral_spine_deviation: {
    ponto_fraco: "Desvio lateral da coluna",
    grupo_muscular: "core",
    porcao: "Oblíquos + quadrado lombar",
    impacto_visual: "Silhueta assimétrica — cintura irregular",
    impacto_postural: "Carga discal assimétrica — risco de hérnia",
    pilares_darkside: [1, 2, 4, 6],
    protocolo_treino: [
      { exercicio: "Prancha lateral", perfil: "ALONGADO", zona: 5, series: 3, reps: "30s cada", smh: false, prioridade: "CRITICA" },
      { exercicio: "Pallof press anti-rotação", perfil: "CONSTANTE", zona: 4, series: 3, reps: "12 cada", smh: false, prioridade: "ALTA" },
      { exercicio: "Bird dog", perfil: "CONSTANTE", zona: 5, series: 3, reps: "10 cada", smh: false, prioridade: "ALTA" },
    ],
  },
  hip_asymmetry: {
    ponto_fraco: "Assimetria de quadril",
    grupo_muscular: "gluteo",
    porcao: "Glúteo médio",
    impacto_visual: "Quadril desnivelado — proporção comprometida",
    impacto_postural: "Joelho valgo dinâmico — risco ACL",
    pilares_darkside: [1, 2, 4],
    protocolo_treino: [
      { exercicio: "Abdução cabo em pé unilateral", perfil: "ALONGADO", zona: 4, series: 3, reps: "15 cada", smh: true, prioridade: "CRITICA" },
      { exercicio: "Agachamento sumô", perfil: "ALONGADO", zona: 3, series: 3, reps: "12", smh: false, prioridade: "ALTA" },
      { exercicio: "Monster walk com faixa", perfil: "CONSTANTE", zona: 5, series: 2, reps: "20 cada", smh: false, prioridade: "ALTA" },
    ],
  },
};

export const OITO_PILARES = [
  { numero: 1, nome: "Frequência", descricao: "Treinar o ponto fraco 2x/semana mínimo", aplicacao: "Adicionar sessão extra dedicada ao grupo deficiente" },
  { numero: 2, nome: "Volume", descricao: "Mais séries semanais para o ponto fraco", aplicacao: "5-8 séries extras/semana acima do volume normal" },
  { numero: 3, nome: "Prioridade", descricao: "Treinar o ponto fraco no início da sessão", aplicacao: "Primeiro exercício quando o SNC está fresco" },
  { numero: 4, nome: "Perfil de Resistência", descricao: "Priorizar exercícios no perfil ALONGADO", aplicacao: "SMH para maior estímulo hipertrófico" },
  { numero: 5, nome: "Zona de repetição", descricao: "Z3-Z4 para máxima hipertrofia", aplicacao: "9-20 reps com cadência controlada" },
  { numero: 6, nome: "Conexão mente-músculo", descricao: "Foco total no músculo fraco", aplicacao: "Pré-ativação + isométrico antes do exercício principal" },
  { numero: 7, nome: "Paciência", descricao: "Ponto fraco leva 2-3× mais tempo", aplicacao: "Mínimo 12-16 semanas de protocolo específico" },
  { numero: 8, nome: "Técnica específica", descricao: "Rest Pause e Drop-set no ponto fraco", aplicacao: "Última série do exercício principal com técnica avançada" },
];

export function buildApexPackage(input: {
  atleta_id: string;
  atleta_nome: string;
  atleta_sexo: "F" | "M";
  sri?: number | null;
  body_score?: number | null;
  fcs?: number | null;
  qualidade?: number;
  achados: Array<{
    key: string;
    titulo: string;
    graus?: number;
    inibido?: string;
    dominante?: string;
    lado?: "E" | "D" | "bilateral" | null;
  }>;
  proporcoes?: Partial<ApexToVERAPackage["proporcoes"]>;
  plumb_source?: ApexToVERAPackage["plumb_source"];
}): ApexToVERAPackage {
  return {
    atleta_id: input.atleta_id,
    atleta_nome: input.atleta_nome,
    atleta_sexo: input.atleta_sexo,
    sri: input.sri ?? null,
    body_score: input.body_score ?? null,
    fcs: input.fcs ?? null,
    qualidade: input.qualidade ?? 0.78,
    achados: input.achados.map((a) => ({
      key: a.key,
      titulo: a.titulo,
      graus: a.graus ?? 0,
      severidade: (a.graus ?? 0) >= 3 ? "CRITICO" : (a.graus ?? 0) >= 1 ? "LIMITROFE" : "NORMAL",
      musculo_inibido: a.inibido ?? "",
      musculo_dominante: a.dominante ?? "",
      lado: a.lado ?? null,
    })),
    proporcoes: {
      largura_ombro_px: input.proporcoes?.largura_ombro_px ?? null,
      largura_quadril_px: input.proporcoes?.largura_quadril_px ?? null,
      largura_cintura_px: input.proporcoes?.largura_cintura_px ?? null,
      ratio_ombro_quadril: input.proporcoes?.ratio_ombro_quadril ?? null,
      ratio_cintura_quadril: input.proporcoes?.ratio_cintura_quadril ?? null,
    },
    plumb_source: input.plumb_source ?? "C7+L5",
    analisado_em: new Date().toISOString(),
  };
}

export interface VERAPontoFraco {
  nome: string;
  severidade: "CRITICO" | "LIMITROFE" | "NORMAL";
  impacto_visual: string;
  impacto_postural: string;
  causa_raiz: string;
  pilares: number[];
  protocolo: ProtocoloExercicio[];
}

export interface VERADiagnostic {
  atleta_id: string;
  pontos_fracos: VERAPontoFraco[];
  pilares_ativos: typeof OITO_PILARES;
  timeline_semanas: number;
  observacoes_femininas: string[];
}

// Diagnóstico determinístico baseado no mapa (sem IA)
// — pode ser usado como fallback ou base inicial antes do refinamento com VERA.
export function buildDeterministicDiagnostic(pkg: ApexToVERAPackage): VERADiagnostic {
  const ordenados = [...pkg.achados]
    .filter((a) => a.graus > 0 && APEX_FEMALE_WEAKNESS_MAP[a.key])
    .sort((a, b) => b.graus - a.graus)
    .slice(0, 3);

  const pontos: VERAPontoFraco[] = ordenados.map((a) => {
    const map = APEX_FEMALE_WEAKNESS_MAP[a.key];
    return {
      nome: map.ponto_fraco,
      severidade: a.severidade,
      impacto_visual: map.impacto_visual,
      impacto_postural: map.impacto_postural,
      causa_raiz: `${map.porcao} inibido — dominância de ${a.musculo_dominante || "antagonistas"}`,
      pilares: map.pilares_darkside,
      protocolo: map.protocolo_treino,
    };
  });

  const pilaresUsados = new Set<number>();
  pontos.forEach((p) => p.pilares.forEach((n) => pilaresUsados.add(n)));

  return {
    atleta_id: pkg.atleta_id,
    pontos_fracos: pontos,
    pilares_ativos: OITO_PILARES.filter((p) => pilaresUsados.has(p.numero)),
    timeline_semanas: pontos.some((p) => p.severidade === "CRITICO") ? 16 : 12,
    observacoes_femininas: [
      "Adaptar volume e RIR conforme fase do ciclo menstrual",
      "Priorizar glúteo médio e isquiotibiais alongados",
      "Monitorar valgo dinâmico durante agachamentos",
    ],
  };
}

export function formatProtocolForTrainingOn(d: VERADiagnostic, atletaNome: string): string {
  const lines: string[] = [
    "=== PROTOCOLO CORRETIVO VERA + APEX ===",
    `Atleta: ${atletaNome}`,
    `Avaliação: ${new Date().toLocaleDateString("pt-BR")}`,
    `Pontos fracos: ${d.pontos_fracos.length}`,
    "",
  ];
  d.pontos_fracos.forEach((pf) => {
    lines.push(`▸ ${pf.nome} — ${pf.severidade}`);
    lines.push(`  Causa: ${pf.causa_raiz}`);
    lines.push("");
    pf.protocolo.forEach((ex) => {
      lines.push(
        `  • ${ex.exercicio} [${ex.perfil}] — ${ex.series}×${ex.reps} Z${ex.zona}` +
          (ex.smh ? " | SMH" : "") +
          (ex.prioridade === "CRITICA" ? " ★" : "")
      );
    });
    lines.push("");
  });
  lines.push("PILARES DARKSIDE ATIVOS:");
  d.pilares_ativos.forEach((p) => lines.push(`  ${p.numero}. ${p.nome}: ${p.aplicacao}`));
  lines.push("");
  lines.push(`TIMELINE: ${d.timeline_semanas} semanas`);
  return lines.join("\n");
}
