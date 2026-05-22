// Stretched-Mediated Hypertrophy protocols for ALONGADO exercises
// Base: Kassiano 2023, Pedrosa 2022, McMahon 2021

export interface SMHProtocol {
  exercicio: string;
  cadencia: string;       // ex: "4-1-2-0" (excêntrico-pausa_baixo-concêntrico-pausa_topo)
  amplitude: string;
  foco_tecnico: string;
  tempo_pausa: string;
  carga_pct: number;      // % menor vs exercício normal
  rir_ideal: number;
  aviso_risco: string | null;
}

export const SMH_PROTOCOLS: Record<string, SMHProtocol> = {
  "rosca inclinada halteres": {
    exercicio: "Rosca inclinada halteres",
    cadencia: "4-1-2-0",
    amplitude: "Extensão total do cotovelo no fundo — não encurtar",
    foco_tecnico: "Manter ombro imóvel — só o cotovelo se move",
    tempo_pausa: "1s no ponto de extensão máxima",
    carga_pct: -15,
    rir_ideal: 2,
    aviso_risco: null,
  },
  "stiff halteres": {
    exercicio: "Stiff halteres",
    cadencia: "4-2-1-0",
    amplitude: "Inclinação máxima sem perder curvatura lombar",
    foco_tecnico: "Empurrar quadril para trás — não para baixo",
    tempo_pausa: "2s no ponto de maior tensão posterior",
    carga_pct: -20,
    rir_ideal: 2,
    aviso_risco: "Manter coluna neutra — parar se sentir lombar",
  },
  "leg curl deitado": {
    exercicio: "Leg curl deitado",
    cadencia: "3-2-2-0",
    amplitude: "Extensão total do joelho no fundo",
    foco_tecnico: "Quadril levemente elevado para maximizar alongamento",
    tempo_pausa: "2s com joelho estendido",
    carga_pct: -15,
    rir_ideal: 1,
    aviso_risco: null,
  },
  "leg curl sentado": {
    exercicio: "Leg curl sentado",
    cadencia: "3-2-2-0",
    amplitude: "Extensão total — não deixar a perna subir",
    foco_tecnico: "Máximo alongamento com quadril flexionado",
    tempo_pausa: "2s com joelho estendido",
    carga_pct: -15,
    rir_ideal: 1,
    aviso_risco: null,
  },
  "crucifixo halteres": {
    exercicio: "Crucifixo halteres",
    cadencia: "4-1-2-0",
    amplitude: "Abertura máxima — cotovelos na linha dos ombros",
    foco_tecnico: "Não deixar cotovelos afundarem abaixo do banco",
    tempo_pausa: "1s no ponto de abertura máxima",
    carga_pct: -20,
    rir_ideal: 2,
    aviso_risco: "Reduzir amplitude se sentir impingement no ombro",
  },
  "pullover máquina": {
    exercicio: "Pullover máquina",
    cadencia: "3-2-2-0",
    amplitude: "Extensão total dos braços acima da cabeça",
    foco_tecnico: "Manter cotovelos semiflexionados",
    tempo_pausa: "2s no ponto de extensão",
    carga_pct: -15,
    rir_ideal: 2,
    aviso_risco: null,
  },
  "straight arm pulldown": {
    exercicio: "Straight arm pulldown",
    cadencia: "3-2-1-0",
    amplitude: "Braços totalmente estendidos acima da cabeça",
    foco_tecnico: "Sentir o dorsal sendo esticado no topo",
    tempo_pausa: "2s no topo com braços estendidos",
    carga_pct: -10,
    rir_ideal: 2,
    aviso_risco: null,
  },
  "elevação lateral cabo baixo": {
    exercicio: "Elevação lateral cabo baixo",
    cadencia: "3-1-2-0",
    amplitude: "Braço cruzando levemente à frente do corpo",
    foco_tecnico: "Sentir o deltóide lateral sendo esticado",
    tempo_pausa: "1s no ponto de cruzamento",
    carga_pct: -10,
    rir_ideal: 1,
    aviso_risco: null,
  },
  "tríceps testa barra": {
    exercicio: "Tríceps testa barra",
    cadencia: "4-1-2-0",
    amplitude: "Flexão total do cotovelo — barra toca a testa",
    foco_tecnico: "Cotovelos apontados para o teto durante todo o movimento",
    tempo_pausa: "1s no ponto de flexão máxima",
    carga_pct: -15,
    rir_ideal: 2,
    aviso_risco: "Usar peso moderado — risco de queda com fadiga",
  },
  "abdução cabo em pé": {
    exercicio: "Abdução cabo em pé",
    cadencia: "3-2-2-0",
    amplitude: "Perna cruzando levemente à frente — máximo alongamento",
    foco_tecnico: "Sentir o glúteo médio sendo esticado na posição inicial",
    tempo_pausa: "2s com perna cruzada",
    carga_pct: -10,
    rir_ideal: 1,
    aviso_risco: null,
  },
};

export function getSMHProtocol(exerciseName: string): SMHProtocol | null {
  if (!exerciseName) return null;
  const lower = exerciseName.toLowerCase();
  const key = Object.keys(SMH_PROTOCOLS).find(
    (k) => lower.includes(k) || k.includes(lower)
  );
  return key ? SMH_PROTOCOLS[key] : null;
}
