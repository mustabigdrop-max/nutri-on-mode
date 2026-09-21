// ARSENAL VIRAL — MOVEMENT SCORE
// Nota 0-100 da execução, calculada de forma determinística a partir dos ângulos
// articulares medidos frame a frame (MediaPipe Pose, ver poseAnalysis.ts).
// Os ranges de referência são faixas biomecânicas do KINESIS: nenhuma nota,
// percentual ou erro é inventado — tudo sai das medições do próprio vídeo.
// Quando o exercício não tem referência cadastrada, o score não é calculado.

import type { FrameAnalysis } from "./poseAnalysis";

export type MetricaId =
  | "profundidade"        // ângulo mínimo de joelho
  | "quadril_fundo"       // ângulo mínimo de quadril
  | "extensao_final"      // ângulo máximo de quadril
  | "controle_tronco"     // inclinação mínima de tronco (quanto menor, mais inclinado)
  | "angulo_ombro"        // ângulo médio/mínimo de ombro
  | "amplitude_cotovelo"  // variação de ângulo de cotovelo
  | "trava_cotovelo"      // extensão máxima de cotovelo
  | "simetria_joelho"     // diferença entre lados
  | "simetria_cotovelo"
  | "momentum_tronco"
  | "linha_corpo";        // tronco alinhado (prancha/push-up)

export interface FaixaReferencia {
  metrica: MetricaId;
  label: string;
  min: number;
  max: number;
  peso: number;             // participação no score final
  penalidadePorGrau?: number; // padrão 2 pontos por grau fora
  seguranca?: boolean;      // fora da faixa = risco articular (limita o score a 40)
  correcao: string;         // cue do KINESIS quando está fora
}

export interface ReferenciaExercicio {
  exercicio: string;
  aliases: string[];
  faixas: FaixaReferencia[];
}

export const REFERENCIAS_KINESIS: ReferenciaExercicio[] = [
  {
    exercicio: "Agachamento",
    aliases: ["agachamento livre", "agachamento com barra", "agachamento", "leg press", "avanço/passada", "avanço", "passada"],
    faixas: [
      { metrica: "profundidade", label: "Joelho no fundo", min: 70, max: 100, peso: 0.25, correcao: "Desça até coxa paralela mantendo o pé inteiro no chão; se travar antes, reduza a carga e trabalhe mobilidade de tornozelo." },
      { metrica: "quadril_fundo", label: "Quadril no fundo", min: 60, max: 100, peso: 0.2, correcao: "Empurre o quadril para baixo e para trás sem perder a linha da coluna; amplitude só conta com controle." },
      { metrica: "controle_tronco", label: "Tronco sob controle", min: 55, max: 120, peso: 0.15, seguranca: true, correcao: "Tronco caindo à frente: puxe o ar, trave o abdômen e empurre o chão com o meio do pé. Lombar não deve arredondar." },
      { metrica: "simetria_joelho", label: "Valgo / simetria de joelhos", min: 0, max: 10, peso: 0.2, penalidadePorGrau: 3, seguranca: true, correcao: "Joelho colapsando ou lado dominante: empurre o joelho na linha do pé e inclua unilaterais começando pelo lado fraco." },
      { metrica: "extensao_final", label: "Finalização de quadril", min: 160, max: 180, peso: 0.2, correcao: "Termine a subida com quadril estendido e glúteo contraído, sem hiperextender a lombar." },
    ],
  },
  {
    exercicio: "Stiff / Terra",
    aliases: ["stiff", "rdl", "levantamento terra romeno", "levantamento terra", "terra", "romeno", "good morning"],
    faixas: [
      { metrica: "quadril_fundo", label: "Dobradiça de quadril", min: 60, max: 100, peso: 0.25, correcao: "Empurre o quadril para trás e mantenha a barra próxima ao corpo; o movimento nasce no quadril." },
      { metrica: "profundidade", label: "Joelho semi-estendido", min: 140, max: 175, peso: 0.15, correcao: "No stiff/RDL o joelho fica levemente flexionado e fixo; se dobra muito, virou agachamento." },
      { metrica: "controle_tronco", label: "Lombar neutra", min: 45, max: 110, peso: 0.3, seguranca: true, correcao: "Lombar deve permanecer neutra: empurre o quadril para trás e pare onde a coluna começa a ceder." },
      { metrica: "extensao_final", label: "Barra próxima / extensão final", min: 160, max: 180, peso: 0.15, correcao: "Finalize com quadril à frente e glúteo contraído, sem jogar o tronco para trás." },
      { metrica: "simetria_joelho", label: "Simetria", min: 0, max: 5, peso: 0.15, penalidadePorGrau: 3, correcao: "Diferença entre os lados: trabalhe unilateral e revise apoio dos pés." },
    ],
  },
  {
    exercicio: "Hip thrust",
    aliases: ["hip thrust", "elevação pélvica", "ponte de glúteo", "glute bridge"],
    faixas: [
      { metrica: "extensao_final", label: "Extensão de quadril no topo", min: 165, max: 182, peso: 0.45, correcao: "Suba até o quadril alinhar com tronco e coxa; pausa de 1-2s contraindo glúteo no topo." },
      { metrica: "profundidade", label: "Ângulo de joelho", min: 70, max: 110, peso: 0.25, correcao: "Ajuste a distância dos pés para manter o joelho perto de 90° no topo." },
      { metrica: "controle_tronco", label: "Costela travada", min: 60, max: 130, peso: 0.2, seguranca: true, correcao: "Não estenda a lombar para ganhar amplitude: costela para baixo, movimento vem do quadril." },
      { metrica: "simetria_joelho", label: "Simetria entre os lados", min: 0, max: 8, peso: 0.1, penalidadePorGrau: 3, correcao: "Quadril rodando: pressione os dois pés com a mesma força." },
    ],
  },
  {
    exercicio: "Supino / Push-up",
    aliases: ["supino reto", "supino inclinado", "push-up", "flexão", "crucifixo"],
    faixas: [
      { metrica: "amplitude_cotovelo", label: "Cotovelo", min: 80, max: 125, peso: 0.25, correcao: "Desça controlado até sentir alongamento no peitoral, mantendo o cotovelo dentro da linha segura." },
      { metrica: "angulo_ombro", label: "Ombro", min: 45, max: 75, peso: 0.2, seguranca: true, correcao: "Ajuste a abertura do braço: cotovelo nem colado demais, nem aberto demais. Ombro protegido antes de carga." },
      { metrica: "simetria_cotovelo", label: "Trajetória / simetria", min: 0, max: 8, peso: 0.2, penalidadePorGrau: 3, correcao: "Trajetória torta ou braço dominante: use halteres por um ciclo e comece pelo lado fraco." },
      { metrica: "linha_corpo", label: "Escápulas e base", min: 150, max: 185, peso: 0.2, seguranca: true, correcao: "Escápulas fixas e base estável. Quadril não cai, lombar não compensa." },
      { metrica: "trava_cotovelo", label: "Finalização", min: 155, max: 180, peso: 0.15, correcao: "Termine a fase de subida estendendo o cotovelo sem travar com impulso." },
    ],
  },
  {
    exercicio: "Desenvolvimento",
    aliases: ["desenvolvimento militar", "desenvolvimento", "elevação lateral"],
    faixas: [
      { metrica: "amplitude_cotovelo", label: "Amplitude de cotovelo", min: 50, max: 120, peso: 0.35, correcao: "Desça até a altura do queixo/orelha mantendo controle; amplitude curta reduz estímulo." },
      { metrica: "trava_cotovelo", label: "Extensão no topo", min: 155, max: 180, peso: 0.25, correcao: "Estenda o cotovelo no topo sem empurrar a cabeça para frente." },
      { metrica: "controle_tronco", label: "Tronco estável", min: 150, max: 185, peso: 0.25, seguranca: true, correcao: "Tronco inclinando para trás: trave abdômen e glúteo, e reduza a carga." },
      { metrica: "simetria_cotovelo", label: "Simetria entre os braços", min: 0, max: 8, peso: 0.15, penalidadePorGrau: 3, correcao: "Assimetria de braço: unilateral por um ciclo, lado fraco primeiro." },
    ],
  },
  {
    exercicio: "Remada / Puxada",
    aliases: ["remada curvada", "remada", "puxada frontal", "puxada", "pulldown"],
    faixas: [
      { metrica: "controle_tronco", label: "Tronco", min: 30, max: 60, peso: 0.2, seguranca: true, correcao: "Fixe o ângulo do tronco e puxe com o dorsal, não com o corpo." },
      { metrica: "amplitude_cotovelo", label: "Cotovelo", min: 80, max: 130, peso: 0.15, correcao: "Puxe até o cotovelo passar a linha do tronco, sem encolher o ombro." },
      { metrica: "angulo_ombro", label: "Retração escapular", min: 20, max: 90, peso: 0.25, correcao: "Pense em colocar a escápula no bolso de trás antes de dobrar o cotovelo." },
      { metrica: "momentum_tronco", label: "Momentum", min: 0, max: 10, peso: 0.2, seguranca: true, correcao: "Se o tronco balança para puxar, a carga passou do ponto. Reduza e pause a contração." },
      { metrica: "simetria_cotovelo", label: "Simetria", min: 0, max: 8, peso: 0.2, penalidadePorGrau: 3, correcao: "Um lado puxa mais: unilateral com halter, lado fraco primeiro." },
    ],
  },
  {
    exercicio: "Rosca / Tríceps",
    aliases: ["rosca direta", "rosca alternada", "rosca", "tríceps testa", "tríceps"],
    faixas: [
      { metrica: "amplitude_cotovelo", label: "Amplitude de cotovelo", min: 60, max: 130, peso: 0.4, correcao: "Amplitude completa: flexione até o fim e estenda controlado, sem parar no meio." },
      { metrica: "controle_tronco", label: "Tronco parado", min: 150, max: 185, peso: 0.3, correcao: "Sem impulso de tronco: cotovelo fixo ao lado do corpo e cadência controlada." },
      { metrica: "trava_cotovelo", label: "Extensão no fim", min: 150, max: 180, peso: 0.15, correcao: "Estenda o braço no fim do movimento para trabalhar o alongamento." },
      { metrica: "simetria_cotovelo", label: "Simetria entre os braços", min: 0, max: 8, peso: 0.15, penalidadePorGrau: 3, correcao: "Assimetria de braço: alternado com pausa no lado fraco." },
    ],
  },
  {
    exercicio: "Prancha",
    aliases: ["prancha", "prancha lateral", "dead bug"],
    faixas: [
      { metrica: "linha_corpo", label: "Linha do corpo", min: 160, max: 185, peso: 0.6, seguranca: true, correcao: "Quadril caindo: contraia glúteo e abdômen, costela para baixo, respire sem soltar a base." },
      { metrica: "trava_cotovelo", label: "Apoio estável", min: 70, max: 180, peso: 0.4, correcao: "Ombro sobre o cotovelo, empurrando o chão para afastar as escápulas do chão." },
    ],
  },
];

export function referenciaPara(exercicio: string): ReferenciaExercicio | null {
  const alvo = exercicio.trim().toLowerCase();
  if (!alvo) return null;
  return (
    REFERENCIAS_KINESIS.find((r) => r.aliases.some((a) => alvo === a)) ||
    REFERENCIAS_KINESIS.find((r) => r.aliases.some((a) => alvo.includes(a) || a.includes(alvo))) ||
    null
  );
}

export type Classificacao = "PRECISA CORRIGIR" | "RAZOÁVEL" | "BOM" | "EXCELENTE" | "PERFEITO";

export function classificar(score: number): Classificacao {
  if (score <= 40) return "PRECISA CORRIGIR";
  if (score <= 60) return "RAZOÁVEL";
  if (score <= 80) return "BOM";
  if (score <= 95) return "EXCELENTE";
  return "PERFEITO";
}

export interface ComponenteScore {
  metrica: MetricaId;
  label: string;
  medido: number;
  faixa: [number, number];
  status: "OK" | "ATENÇÃO" | "ERRO";
  score: number;
  peso: number;
  dentro: boolean;
}

export interface ErroDetectado {
  label: string;
  medido: number;
  faixa: [number, number];
  desvioGraus: number;
  seguranca: boolean;
  correcao: string;
}

export interface MovementScoreResult {
  exercicio: string;
  referencia: string;
  score: number;
  classificacao: Classificacao;
  framesAnalisados: number;
  componentes: ComponenteScore[];
  errosDetectados: ErroDetectado[];
  correcoesKinesis: string[];
  alertaSeguranca: string | null;
  overlayImageUrl: string | null;
}

function medir(metrica: MetricaId, frames: FrameAnalysis[]): number | null {
  if (!frames.length) return null;
  const joelho = frames.map((f) => (f.angles.leftKnee + f.angles.rightKnee) / 2);
  const quadril = frames.map((f) => (f.angles.leftHip + f.angles.rightHip) / 2);
  const cotovelo = frames.map((f) => (f.angles.leftElbow + f.angles.rightElbow) / 2);
  const ombro = frames.map((f) => (f.angles.leftShoulder + f.angles.rightShoulder) / 2);
  const tronco = frames.map((f) => f.angles.trunkLean);

  switch (metrica) {
    case "profundidade": return Math.min(...joelho);
    case "quadril_fundo": return Math.min(...quadril);
    case "extensao_final": return Math.max(...quadril);
    case "controle_tronco": return Math.min(...tronco);
    case "angulo_ombro": return Math.min(...ombro);
    case "linha_corpo": return quadril.reduce((a, b) => a + b, 0) / quadril.length;
    case "amplitude_cotovelo": return Math.max(...cotovelo) - Math.min(...cotovelo);
    case "trava_cotovelo": return Math.max(...cotovelo);
    case "momentum_tronco": return Math.max(...tronco) - Math.min(...tronco);
    case "simetria_joelho":
      return Math.max(...frames.map((f) => Math.abs(f.angles.leftKnee - f.angles.rightKnee)));
    case "simetria_cotovelo":
      return Math.max(...frames.map((f) => Math.abs(f.angles.leftElbow - f.angles.rightElbow)));
    default: return null;
  }
}

/**
 * Calcula o Movement Score. Retorna null quando não há referência KINESIS para
 * o exercício ou frames suficientes — nesse caso nenhuma nota é exibida.
 */
export function calcularMovementScore(exercicio: string, frames: FrameAnalysis[]): MovementScoreResult | null {
  const ref = referenciaPara(exercicio);
  if (!ref || frames.length < 5) return null;

  const componentes: ComponenteScore[] = [];
  const erros: ErroDetectado[] = [];
  let riscoArticular = false;

  ref.faixas.forEach((f) => {
    const medido = medir(f.metrica, frames);
    if (medido === null || !Number.isFinite(medido)) return;
    const valor = Math.round(medido);
    const dentro = valor >= f.min && valor <= f.max;
    const desvio = dentro ? 0 : valor < f.min ? f.min - valor : valor - f.max;
    const penalidade = f.penalidadePorGrau ?? 2;
    const score = Math.max(0, Math.round(100 - desvio * penalidade));
    const status = dentro ? "OK" : score >= 70 ? "ATENÇÃO" : "ERRO";

    componentes.push({ metrica: f.metrica, label: f.label, medido: valor, faixa: [f.min, f.max], status, score, peso: f.peso, dentro });

    if (!dentro) {
      erros.push({ label: f.label, medido: valor, faixa: [f.min, f.max], desvioGraus: desvio, seguranca: !!f.seguranca, correcao: f.correcao });
      if (f.seguranca && desvio >= 8) riscoArticular = true;
    }
  });

  if (!componentes.length) return null;

  const pesoTotal = componentes.reduce((a, c) => a + c.peso, 0);
  let score = Math.round(componentes.reduce((a, c) => a + c.peso * c.score, 0) / pesoTotal);
  let alertaSeguranca: string | null = null;
  if (riscoArticular) {
    score = Math.min(score, 40);
    alertaSeguranca = "Sinal de risco articular na execução. Reduza a carga agora e priorize o padrão antes de progredir.";
  }
  score = Math.max(0, Math.min(100, score));

  return {
    exercicio: exercicio,
    referencia: ref.exercicio,
    score,
    classificacao: classificar(score),
    framesAnalisados: frames.length,
    componentes,
    errosDetectados: erros.sort((a, b) => Number(b.seguranca) - Number(a.seguranca) || b.desvioGraus - a.desvioGraus),
    correcoesKinesis: erros.map((e) => e.correcao),
    alertaSeguranca,
    overlayImageUrl: null,
  };
}

/** Roteiro de Reel a partir do Movement Score, na voz do Coach Diogo Mello. */
export function roteiroReelMovementScore(r: MovementScoreResult): string {
  const principal = r.errosDetectados[0];
  const linhas = [
    `MOVEMENT SCORE — ${r.exercicio} · ${r.score}/100 (${r.classificacao})`,
    "",
    "[HOOK — 4s]",
    `  "Fala, aqui é o Diogo Mello. Esse ${r.exercicio.toLowerCase()} tirou ${r.score} de 100. Olha onde perdeu ponto."`,
    "",
    "[MEDIÇÃO — 12s]",
    ...r.componentes.map((c) => `  ${c.label}: ${c.medido}° (faixa ${c.faixa[0]}–${c.faixa[1]}°) — ${c.dentro ? "dentro" : "fora"}`),
    "",
    "[ERRO PRINCIPAL — 12s]",
    principal
      ? `  "${principal.label}: ${principal.medido}°, ${principal.desvioGraus}° fora da faixa. ${principal.correcao}"`
      : `  "Execução dentro das faixas de referência. O ponto agora é progressão de carga com o mesmo padrão."`,
    "",
    "[CORREÇÃO — 10s]",
    ...(r.correcoesKinesis.length ? r.correcoesKinesis.slice(0, 3).map((c) => `  • ${c}`) : ["  • Manter o padrão e progredir carga de forma controlada."]),
    ...(r.alertaSeguranca ? ["", `  ALERTA: ${r.alertaSeguranca}`] : []),
    "",
    "[CTA — 5s]",
    '  "Manda seu vídeo e o sistema te dá a nota e a correção. nutrion.app.br."',
    '  "Transformação é sistema."',
  ];
  return linhas.join("\n");
}
