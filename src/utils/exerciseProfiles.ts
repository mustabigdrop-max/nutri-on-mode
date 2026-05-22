// Perfil de Resistência — base científica Darkside / SMH
// Kassiano et al. 2023; Pedrosa et al. 2022
export type ResistanceProfile = 'ALONGADO' | 'ENCURTADO' | 'CONSTANTE' | 'MISTO';

export type MuscleGroup =
  | 'peito' | 'costas' | 'ombro' | 'biceps' | 'triceps'
  | 'quadriceps' | 'posterior' | 'gluteo' | 'panturrilha'
  | 'core' | 'trapezio' | 'forearm';

export interface ExerciseProfile {
  nome: string;
  perfil: ResistanceProfile;
  musculo_alvo: MuscleGroup;
  porcao: string;
  evidencia: string;
}

export const EXERCISE_PROFILES: ExerciseProfile[] = [
  // PEITO
  { nome: 'Supino reto barra', perfil: 'CONSTANTE', musculo_alvo: 'peito', porcao: 'peitoral geral', evidencia: 'Tensão distribuída — base de volume' },
  { nome: 'Supino inclinado halteres', perfil: 'CONSTANTE', musculo_alvo: 'peito', porcao: 'peitoral superior', evidencia: 'Maior ativação feixe clavicular' },
  { nome: 'Crucifixo halteres', perfil: 'ALONGADO', musculo_alvo: 'peito', porcao: 'peitoral geral', evidencia: 'Pico de tensão no alongado — stretched hypertrophy' },
  { nome: 'Peck deck', perfil: 'ALONGADO', musculo_alvo: 'peito', porcao: 'peitoral geral', evidencia: 'Tensão máxima na abertura máxima' },
  { nome: 'Cross-over alto', perfil: 'ENCURTADO', musculo_alvo: 'peito', porcao: 'peitoral inferior', evidencia: 'Pico na adução — contração máxima' },
  { nome: 'Cross-over baixo', perfil: 'ENCURTADO', musculo_alvo: 'peito', porcao: 'peitoral superior', evidencia: 'Pico na adução com elevação' },
  { nome: 'Pullover', perfil: 'ALONGADO', musculo_alvo: 'peito', porcao: 'peitoral geral', evidencia: 'Grande amplitude — tensão no alongado' },
  // COSTAS
  { nome: 'Remada curvada barra', perfil: 'CONSTANTE', musculo_alvo: 'costas', porcao: 'dorsal geral', evidencia: 'Base de espessura — volume principal' },
  { nome: 'Puxada frontal', perfil: 'CONSTANTE', musculo_alvo: 'costas', porcao: 'dorsal largura', evidencia: 'Eixo vertical — V-taper' },
  { nome: 'Pulldown cabo', perfil: 'CONSTANTE', musculo_alvo: 'costas', porcao: 'dorsal largura', evidencia: 'Variante de pulldown com cabo' },
  { nome: 'Remada cavalinho', perfil: 'ENCURTADO', musculo_alvo: 'costas', porcao: 'dorsal espessura', evidencia: 'Pico de contração no encurtado' },
  { nome: 'Pullover máquina', perfil: 'ALONGADO', musculo_alvo: 'costas', porcao: 'dorsal inserção inferior', evidencia: 'Tensão no alongado — asa do dorsal' },
  { nome: 'Remada unilateral halteres', perfil: 'ENCURTADO', musculo_alvo: 'costas', porcao: 'dorsal espessura', evidencia: 'Rotação torácica amplifica contração' },
  { nome: 'Straight arm pulldown', perfil: 'ALONGADO', musculo_alvo: 'costas', porcao: 'dorsal inserção inferior', evidencia: 'Tensão máxima na posição de alongamento' },
  // OMBRO
  { nome: 'Desenvolvimento halteres', perfil: 'CONSTANTE', musculo_alvo: 'ombro', porcao: 'deltóide anterior/médio', evidencia: 'Base de volume para ombro' },
  { nome: 'Desenvolvimento máquina', perfil: 'CONSTANTE', musculo_alvo: 'ombro', porcao: 'deltóide geral', evidencia: 'Estabilidade para volume alto' },
  { nome: 'Elevação lateral halteres', perfil: 'ENCURTADO', musculo_alvo: 'ombro', porcao: 'deltóide lateral', evidencia: 'Pico no topo — contração do medial' },
  { nome: 'Elevação lateral cabo baixo', perfil: 'ALONGADO', musculo_alvo: 'ombro', porcao: 'deltóide lateral', evidencia: 'Tensão no alongado — superior p/ SMH' },
  { nome: 'Elevação frontal cabo', perfil: 'ALONGADO', musculo_alvo: 'ombro', porcao: 'deltóide anterior', evidencia: 'Tensão no início do movimento' },
  { nome: 'Face pull', perfil: 'ENCURTADO', musculo_alvo: 'ombro', porcao: 'deltóide posterior/manguito', evidencia: 'Pico na retração — rotação externa' },
  { nome: 'Crucifixo invertido', perfil: 'ALONGADO', musculo_alvo: 'ombro', porcao: 'deltóide posterior', evidencia: 'Tensão no alongado para posterior' },
  // BÍCEPS
  { nome: 'Rosca direta barra', perfil: 'CONSTANTE', musculo_alvo: 'biceps', porcao: 'bíceps geral', evidencia: 'Base de volume — perfil misto' },
  { nome: 'Rosca direta halteres', perfil: 'MISTO', musculo_alvo: 'biceps', porcao: 'bíceps geral', evidencia: 'Supinação no topo adiciona pico' },
  { nome: 'Rosca concentrada', perfil: 'ENCURTADO', musculo_alvo: 'biceps', porcao: 'pico do bíceps', evidencia: 'Quadril bloqueia — máximo encurtado' },
  { nome: 'Rosca inclinada halteres', perfil: 'ALONGADO', musculo_alvo: 'biceps', porcao: 'cabeça longa', evidencia: 'Ombro em extensão — máximo elongado' },
  { nome: 'Rosca cabo baixo', perfil: 'ALONGADO', musculo_alvo: 'biceps', porcao: 'bíceps geral', evidencia: 'Tensão constante com pico no alongado' },
  { nome: 'Spider curl', perfil: 'ENCURTADO', musculo_alvo: 'biceps', porcao: 'bíceps geral', evidencia: 'Banco vertical elimina swing — pico top' },
  // TRÍCEPS
  { nome: 'Tríceps testa', perfil: 'ALONGADO', musculo_alvo: 'triceps', porcao: 'cabeça longa', evidencia: 'Cotovelo flexionado — máximo elongado' },
  { nome: 'Tríceps francês', perfil: 'ALONGADO', musculo_alvo: 'triceps', porcao: 'cabeça longa', evidencia: 'Overhead — cabeça longa em elongação' },
  { nome: 'Tríceps polia alta', perfil: 'ENCURTADO', musculo_alvo: 'triceps', porcao: 'cabeça lateral/medial', evidencia: 'Pico na extensão completa' },
  { nome: 'Tríceps coice', perfil: 'ENCURTADO', musculo_alvo: 'triceps', porcao: 'cabeça lateral', evidencia: 'Pico máximo na extensão do cotovelo' },
  { nome: 'Supino fechado', perfil: 'CONSTANTE', musculo_alvo: 'triceps', porcao: 'tríceps geral', evidencia: 'Base de força — volume principal' },
  // QUADRÍCEPS
  { nome: 'Agachamento livre', perfil: 'CONSTANTE', musculo_alvo: 'quadriceps', porcao: 'quadríceps geral', evidencia: 'Base de força — padrão de movimento' },
  { nome: 'Leg press', perfil: 'MISTO', musculo_alvo: 'quadriceps', porcao: 'quadríceps geral', evidencia: 'Variável por posição dos pés' },
  { nome: 'Cadeira extensora', perfil: 'ENCURTADO', musculo_alvo: 'quadriceps', porcao: 'reto femoral', evidencia: 'Pico máximo na extensão completa' },
  { nome: 'Hack squat', perfil: 'MISTO', musculo_alvo: 'quadriceps', porcao: 'quadríceps geral', evidencia: 'Sobrecarga progressiva no alongado' },
  { nome: 'Agachamento búlgaro', perfil: 'ALONGADO', musculo_alvo: 'quadriceps', porcao: 'reto femoral', evidencia: 'Extensão do quadril — cabeça biarticular' },
  { nome: 'Leg extension com cabos', perfil: 'ALONGADO', musculo_alvo: 'quadriceps', porcao: 'reto femoral', evidencia: 'Cabo cria tensão no início — SMH' },
  // POSTERIOR
  { nome: 'Stiff', perfil: 'ALONGADO', musculo_alvo: 'posterior', porcao: 'isquiotibiais geral', evidencia: 'Tensão máxima no alongamento — SMH' },
  { nome: 'Leg curl deitado', perfil: 'ALONGADO', musculo_alvo: 'posterior', porcao: 'isquiotibiais geral', evidencia: 'Quadril estendido — cabeça longa alongada' },
  { nome: 'Leg curl sentado', perfil: 'ALONGADO', musculo_alvo: 'posterior', porcao: 'isquiotibiais geral', evidencia: 'Quadril flexionado — máximo elongado SMH' },
  { nome: 'Levantamento terra', perfil: 'CONSTANTE', musculo_alvo: 'posterior', porcao: 'cadeia posterior geral', evidencia: 'Base de força — tensão constante' },
  { nome: 'Mesa flexora', perfil: 'ENCURTADO', musculo_alvo: 'posterior', porcao: 'isquiotibiais geral', evidencia: 'Pico de contração no encurtado' },
  // GLÚTEO
  { nome: 'Hip thrust', perfil: 'ENCURTADO', musculo_alvo: 'gluteo', porcao: 'glúteo máximo', evidencia: 'Pico máximo de ativação no topo' },
  { nome: 'Agachamento sumô', perfil: 'ALONGADO', musculo_alvo: 'gluteo', porcao: 'glúteo máximo/médio', evidencia: 'Abdução + flexão — tensão no alongado' },
  { nome: 'Abdução cabo', perfil: 'ALONGADO', musculo_alvo: 'gluteo', porcao: 'glúteo médio', evidencia: 'Tensão na adução máxima — SMH' },
  { nome: 'Glúteo 4 apoios cabo', perfil: 'ENCURTADO', musculo_alvo: 'gluteo', porcao: 'glúteo máximo', evidencia: 'Extensão do quadril — pico no topo' },
  { nome: 'Afundo búlgaro', perfil: 'ALONGADO', musculo_alvo: 'gluteo', porcao: 'glúteo máximo', evidencia: 'Extensão máxima do quadril traseiro' },
  // PANTURRILHA
  { nome: 'Panturrilha em pé', perfil: 'ENCURTADO', musculo_alvo: 'panturrilha', porcao: 'gastrocnêmio', evidencia: 'Pico na plantiflexão completa' },
  { nome: 'Panturrilha sentado', perfil: 'ALONGADO', musculo_alvo: 'panturrilha', porcao: 'sóleo', evidencia: 'Joelho flexionado isola sóleo no alongado' },
  { nome: 'Panturrilha no leg press', perfil: 'ALONGADO', musculo_alvo: 'panturrilha', porcao: 'gastrocnêmio', evidencia: 'Amplitude completa — tensão no alongado' },
];

export const PROFILE_CONFIG: Record<ResistanceProfile, {
  label: string; color: string; bg: string; border: string; icon: string; tip: string;
}> = {
  ALONGADO: { label: 'Alongado', color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '↕', tip: 'Tensão máxima no alongado — prioridade para pontos fracos' },
  ENCURTADO: { label: 'Encurtado', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', icon: '◎', tip: 'Tensão máxima na contração — pump e sarcoplasma' },
  CONSTANTE: { label: 'Constante', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', icon: '▬', tip: 'Tensão uniforme — base de volume principal' },
  MISTO: { label: 'Misto', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', icon: '≋', tip: 'Dois picos de tensão — variável por execução' },
};

export const PROFILE_BY_NAME: Record<string, ExerciseProfile> = Object.fromEntries(
  EXERCISE_PROFILES.map(e => [e.nome.toLowerCase(), e])
);

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function findExerciseProfile(exerciseName: string | null | undefined): ExerciseProfile | null {
  if (!exerciseName) return null;
  const lower = normalize(exerciseName);
  // Exact-ish match first
  const exact = EXERCISE_PROFILES.find(e => normalize(e.nome) === lower);
  if (exact) return exact;
  // Substring (prefer longest catalog name match)
  const matches = EXERCISE_PROFILES.filter(e => {
    const n = normalize(e.nome);
    return lower.includes(n) || n.includes(lower);
  });
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.nome.length - a.nome.length)[0];
}

export interface ProfileBalance {
  musculo: string;
  alongado: number;
  encurtado: number;
  constante: number;
  misto: number;
  total: number;
  gaps: ResistanceProfile[];
}

export function calcProfileBalance(exercises: Array<{ name?: string; nome?: string }>): ProfileBalance[] {
  const byMuscle: Record<string, ExerciseProfile[]> = {};
  for (const ex of exercises || []) {
    const profile = findExerciseProfile(ex?.name || ex?.nome);
    if (!profile) continue;
    const m = profile.musculo_alvo;
    byMuscle[m] = [...(byMuscle[m] ?? []), profile];
  }
  return Object.entries(byMuscle).map(([musculo, profs]) => {
    const counts = { ALONGADO: 0, ENCURTADO: 0, CONSTANTE: 0, MISTO: 0 } as Record<ResistanceProfile, number>;
    for (const p of profs) counts[p.perfil]++;
    const gaps: ResistanceProfile[] = [];
    if (counts.ALONGADO === 0) gaps.push('ALONGADO');
    if (counts.ENCURTADO === 0) gaps.push('ENCURTADO');
    if (counts.CONSTANTE === 0) gaps.push('CONSTANTE');
    return {
      musculo,
      alongado: counts.ALONGADO,
      encurtado: counts.ENCURTADO,
      constante: counts.CONSTANTE,
      misto: counts.MISTO,
      total: profs.length,
      gaps,
    };
  });
}
