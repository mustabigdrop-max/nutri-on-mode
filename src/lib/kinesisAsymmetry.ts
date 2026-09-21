/**
 * KINESIS — Seção 3: CORREÇÃO DE ASSIMETRIAS.
 * Protocolo universal em 5 fases, mapa bilateral → unilateral e
 * particularidades por grupo. Assimetria é tratada como DEFICIT: acima de 8%
 * detectado no APEX é flag, não "normal ter um lado mais forte".
 */

export const LIMITE_FLAG = 8;
export const LIMITE_LIBERACAO = 5;

export type FaseAssimetria = {
  fase: number;
  nome: string;
  passos: string[];
};

export const PROTOCOLO_ASSIMETRIA: FaseAssimetria[] = [
  {
    fase: 1,
    nome: "IDENTIFICAÇÃO (APEX Assessment)",
    passos: [
      "APEX Visual: delta acima de 8% entre lados levanta a flag.",
      "Checklist funcional confirma diferença de contração ou de força.",
      "Saída do diagnóstico: lado (D/E) e percentual de déficit no grupo.",
    ],
  },
  {
    fase: 2,
    nome: "SUBSTITUIÇÃO",
    passos: [
      "Remover os exercícios bilaterais do grupo assimétrico.",
      "Substituir por unilaterais equivalentes (mapa de substituição).",
      "Manter no máximo um composto bilateral leve, se o coach decidir mantê-lo.",
    ],
  },
  {
    fase: 3,
    nome: "VOLUME DIFERENCIADO",
    passos: [
      "Lado fraco: volume normal do grupo + 1-2 séries.",
      "Lado forte: mesmas repetições e MESMA carga do lado fraco.",
      "Nunca elevar a carga do lado forte além do que o fraco sustenta.",
      "Lado fraco sempre primeiro, em todos os exercícios.",
    ],
  },
  {
    fase: 4,
    nome: "REAVALIAÇÃO (4-8 semanas)",
    passos: [
      "APEX Visual: comparar o delta entre lados com a avaliação anterior.",
      "Checklist: reavaliar a percepção de contração no bilateral.",
      "Delta abaixo de 5%: liberar bilateral, mantendo 1 unilateral por sessão.",
      "Delta ainda acima de 5%: continuar o protocolo e investigar causa (postura, dominância, lesão prévia).",
    ],
  },
  {
    fase: 5,
    nome: "MANUTENÇÃO",
    passos: [
      "Manter pelo menos 1 exercício unilateral por sessão do grupo.",
      "Monitorar a cada 2 mesociclos com nova avaliação.",
      "Assimetria voltando acima de 8%: reativar o protocolo.",
    ],
  },
];

export const MAPA_UNILATERAL: Array<{ bilateral: string; unilateral: string }> = [
  { bilateral: "Supino reto com barra", unilateral: "Supino com halter unilateral ou alternado" },
  { bilateral: "Remada curvada com barra", unilateral: "Remada unilateral com halter" },
  { bilateral: "Agachamento com barra", unilateral: "Bulgarian Split Squat" },
  { bilateral: "Leg Press bilateral", unilateral: "Leg Press unilateral" },
  { bilateral: "Pulldown bilateral", unilateral: "Pulldown unilateral no cabo" },
  { bilateral: "Desenvolvimento com barra", unilateral: "Arnold Press unilateral" },
  { bilateral: "Hip Thrust bilateral", unilateral: "Hip Thrust unilateral" },
  { bilateral: "Leg Curl bilateral", unilateral: "Leg Curl unilateral" },
  { bilateral: "Rosca direta com barra", unilateral: "Rosca alternada com halteres" },
  { bilateral: "Tríceps pulley com barra", unilateral: "Tríceps pulley unilateral" },
  { bilateral: "Calf Raise bilateral", unilateral: "Single-Leg Calf Raise" },
];

export type ParticularidadeGrupo = {
  grupo: string;
  causa_comum: string;
  exercicios_chave: string[];
  cue: string;
  tempo_tipico: string;
  atencao?: string;
};

export const ASSIMETRIA_POR_GRUPO: ParticularidadeGrupo[] = [
  {
    grupo: "PEITORAL",
    causa_comum: "Dominância de braço (o lado dominante recruta mais).",
    exercicios_chave: ["Dumbbell Press unilateral", "Cable Fly unilateral"],
    cue: "No unilateral, sinta o peitoral do lado trabalhando — se sentir mais ombro, ajuste o ângulo.",
    tempo_tipico: "4-6 semanas",
  },
  {
    grupo: "DORSAL",
    causa_comum: "Padrão de puxada assimétrico, escoliose leve.",
    exercicios_chave: ["Remada unilateral com halter", "Pulldown unilateral no cabo", "Single-arm cable row"],
    cue: "Retraia a escápula do lado fraco ANTES de puxar.",
    tempo_tipico: "6-8 semanas (dorsal demora mais por ser difícil de sentir)",
  },
  {
    grupo: "QUADRICEPS",
    causa_comum: "Lesão prévia de joelho, dominância de perna.",
    exercicios_chave: ["Bulgarian Split Squat", "Extensora unilateral", "Step-up"],
    cue: "Empurre com o CALCANHAR do lado fraco.",
    tempo_tipico: "6-8 semanas",
    atencao: "Se o VMO é o deficit, somar TKE com banda no lado fraco.",
  },
  {
    grupo: "GLUTEOS",
    causa_comum: "Anteriorização pélvica assimétrica, glúteo médio fraco de um lado.",
    exercicios_chave: ["Single-Leg Hip Thrust", "Single-Leg Glute Bridge", "Step-up alto"],
    cue: "O quadril não roda — mantenha as cristas ilíacas paralelas ao chão.",
    tempo_tipico: "6-8 semanas",
    atencao: "Com valgo unilateral, tratar o glúteo médio do lado do valgo primeiro.",
  },
  {
    grupo: "POSTERIOR DE COXA",
    causa_comum: "Lesão prévia (estiramento), dominância lombar unilateral.",
    exercicios_chave: ["Single-Leg RDL", "Leg Curl unilateral"],
    cue: "No RDL unilateral o quadril vai pra TRÁS, não pro lado.",
    tempo_tipico: "6-8 semanas",
    atencao: "Com histórico de lesão, aumentar volume a cada 2 semanas, não a cada semana.",
  },
  {
    grupo: "DELTOIDES",
    causa_comum: "Lesão de manguito rotador de um lado, postura assimétrica.",
    exercicios_chave: ["Arnold Press unilateral", "Elevação lateral unilateral no cabo"],
    cue: "Inicie com o ombro ABAIXO — se começa encolhido, é trapézio, não deltoide.",
    tempo_tipico: "4-6 semanas",
    atencao: "Com sinal de impingement em um lado, avaliar antes de prescrever.",
  },
  {
    grupo: "BICEPS",
    causa_comum: "Dominância de braço.",
    exercicios_chave: ["Rosca concentrada", "Rosca alternada (lado fraco primeiro)"],
    cue: "Cotovelo FIXO — se balança, está compensando.",
    tempo_tipico: "4-6 semanas (corrige rápido)",
  },
  {
    grupo: "TRICEPS",
    causa_comum: "Dominância de braço, padrão de empurrar assimétrico.",
    exercicios_chave: ["Extensão unilateral overhead", "Pushdown unilateral"],
    cue: "Cotovelo fixo ao lado da cabeça (overhead) ou rente ao corpo (pushdown).",
    tempo_tipico: "4-6 semanas",
  },
  {
    grupo: "PANTURRILHA",
    causa_comum: "Dominância da perna de apoio (até 5% de diferença é comum).",
    exercicios_chave: ["Single-Leg Calf Raise (sempre unilateral)"],
    cue: "Suba na ponta do dedão e segure 3s no topo.",
    tempo_tipico: "8-12 semanas",
    atencao: "É a assimetria mais comum e a mais difícil de corrigir; a genética pesa muito.",
  },
];

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function particularidadeDoGrupo(grupo: string): ParticularidadeGrupo | null {
  const g = norm(grupo);
  if (!g) return null;
  return (
    ASSIMETRIA_POR_GRUPO.find((p) => norm(p.grupo) === g) ||
    ASSIMETRIA_POR_GRUPO.find((p) => g.includes(norm(p.grupo)) || norm(p.grupo).includes(g)) ||
    null
  );
}

export function substituirPorUnilateral(exercicio: string): string | null {
  const e = norm(exercicio);
  if (!e) return null;
  const achado = MAPA_UNILATERAL.find((m) => {
    const b = norm(m.bilateral);
    return b === e || b.includes(e) || e.includes(b.split(" ")[0] + " " + (b.split(" ")[1] || ""));
  });
  return achado ? achado.unilateral : null;
}

export type PrescricaoAssimetria = {
  grupo: string;
  lado_fraco: "D" | "E";
  delta_pct: number;
  status: "FLAG" | "MONITORAR" | "OK";
  series_lado_fraco: number;
  series_lado_forte: number;
  regras: string[];
  exercicios: string[];
  duracao_estimada: string;
  reavaliacao: string;
};

/**
 * Prescrição determinística de correção de assimetria.
 * @param seriesBase séries semanais do grupo já definidas pelo volume do KINESIS.
 */
export function prescreverAssimetria(
  grupo: string,
  ladoFraco: "D" | "E",
  deltaPct: number,
  seriesBase: number,
): PrescricaoAssimetria {
  const p = particularidadeDoGrupo(grupo);
  const status: PrescricaoAssimetria["status"] =
    deltaPct >= LIMITE_FLAG ? "FLAG" : deltaPct > LIMITE_LIBERACAO ? "MONITORAR" : "OK";
  const extra = deltaPct >= 12 ? 2 : deltaPct >= LIMITE_FLAG ? 1 : 0;
  const regras = [
    `Lado ${ladoFraco} (fraco) treina PRIMEIRO em todos os exercícios do grupo.`,
    `Lado fraco: ${seriesBase + extra} séries/semana. Lado forte: ${seriesBase} séries/semana.`,
    "Mesmas repetições e mesma carga nos dois lados — o forte nunca vai mais pesado que o fraco.",
    status === "FLAG"
      ? "Bilateral pesado REMOVIDO do grupo até o delta cair abaixo de 5%."
      : "Bilateral liberado, mantendo 1 exercício unilateral por sessão como manutenção.",
  ];
  if (p?.atencao) regras.push(`Atenção: ${p.atencao}`);
  if (p?.cue) regras.push(`Cue do aluno: ${p.cue}`);

  return {
    grupo: p?.grupo || grupo.toUpperCase(),
    lado_fraco: ladoFraco,
    delta_pct: Math.round(deltaPct * 10) / 10,
    status,
    series_lado_fraco: seriesBase + extra,
    series_lado_forte: seriesBase,
    regras,
    exercicios: p?.exercicios_chave || ["Versão unilateral dos exercícios atuais do grupo"],
    duracao_estimada: p?.tempo_tipico || "4-8 semanas",
    reavaliacao: "Nova avaliação visual + checklist funcional em 4-8 semanas; liberar bilateral com delta abaixo de 5%.",
  };
}
