/**
 * parseProtocolToDays — converte conteúdo de protocolo de treino
 * (JSON estruturado, texto livre, ou markdown) em uma estrutura
 * uniforme de "dias" para renderização em cards D1/D2/D3.
 */

export type ParsedDay = {
  day_number: number;
  session_title: string;
  estimated_duration: string;
  muscle_tags: string[];
  body: string; // conteúdo bruto do dia (markdown/texto) para expandir
};

export type ParsedProtocol = {
  days: ParsedDay[];
  intro?: string; // conteúdo antes do primeiro dia (overview/warm-up bruto)
  isStructured: boolean; // true se veio de JSON com training_days
  isFallback: boolean;   // true se não conseguiu dividir em dias
};

const MUSCLE_KEYWORDS = [
  "peitoral", "peito",
  "costas", "dorsal", "latíssimo", "latissimo",
  "ombro", "ombros", "deltoide", "deltóide", "delt",
  "bíceps", "biceps",
  "tríceps", "triceps",
  "quadríceps", "quadriceps", "quadr",
  "glúteo", "gluteo", "glúteos", "gluteos",
  "isquiotibial", "isquiotibiais", "posterior de coxa", "posterior",
  "panturrilha", "panturrilhas",
  "core", "abdômen", "abdomen", "abdominal",
  "trapézio", "trapezio",
  "antebraço", "antebraco",
  "anterior", "lateral", "medial", "superior",
  "lombar",
];

const PILL_DEDUPE: Record<string, string> = {
  peito: "Peitoral",
  peitoral: "Peitoral",
  costas: "Costas",
  dorsal: "Dorsal",
  latíssimo: "Dorsal",
  latissimo: "Dorsal",
  ombro: "Ombros",
  ombros: "Ombros",
  deltoide: "Ombros",
  deltóide: "Ombros",
  delt: "Ombros",
  bíceps: "Bíceps",
  biceps: "Bíceps",
  tríceps: "Tríceps",
  triceps: "Tríceps",
  quadríceps: "Quadríceps",
  quadriceps: "Quadríceps",
  quadr: "Quadríceps",
  glúteo: "Glúteos",
  gluteo: "Glúteos",
  glúteos: "Glúteos",
  gluteos: "Glúteos",
  isquiotibial: "Posterior",
  isquiotibiais: "Posterior",
  "posterior de coxa": "Posterior",
  posterior: "Posterior",
  panturrilha: "Panturrilha",
  panturrilhas: "Panturrilha",
  core: "Core",
  abdômen: "Core",
  abdomen: "Core",
  abdominal: "Core",
  trapézio: "Trapézio",
  trapezio: "Trapézio",
  antebraço: "Antebraço",
  antebraco: "Antebraço",
  anterior: "Anterior",
  lateral: "Lateral",
  medial: "Medial",
  superior: "Superior",
  lombar: "Lombar",
};

// regex que captura cabeçalho de "dia":  DIA 1, Dia 2:, D1 —, ## Dia 3, Sessão 1, Treino 2
const DAY_HEADER = /^\s*(?:#{1,4}\s*)?(?:dia|sess[aã]o|treino|d)\s*0*(\d+)\b[\s:.\-—–]*([^\n]*)$/im;

function extractMuscleTags(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const kw of MUSCLE_KEYWORDS) {
    if (lower.includes(kw)) {
      const canonical = PILL_DEDUPE[kw] || kw;
      found.add(canonical);
    }
  }
  return Array.from(found).slice(0, 6);
}

function extractDuration(text: string): string {
  // procura padrões: "90min", "90 min", "90 minutos", "1h30", "1h", "60 a 90 min"
  const m1 = text.match(/(\d{2,3})\s*(?:a|–|-)\s*(\d{2,3})\s*min(?:utos)?/i);
  if (m1) return `${m1[1]}-${m1[2]}min`;
  const m2 = text.match(/(\d{1,3})\s*min(?:utos)?/i);
  if (m2) return `${m2[1]}min`;
  const m3 = text.match(/(\d)\s*h\s*(\d{0,2})/i);
  if (m3) {
    const mins = parseInt(m3[1]) * 60 + (parseInt(m3[2] || "0") || 0);
    return `${mins}min`;
  }
  return "90min";
}

function extractTitle(headerLine: string, dayNumber: number, body: string): string {
  // remove o prefixo "DIA N", "Dia N:", "D1 —" etc, e usa o resto como título
  const cleaned = headerLine.replace(DAY_HEADER, "$2").trim();
  if (cleaned && cleaned.length > 1) return cleaned;
  // tenta primeira linha não vazia do body
  const firstLine = body.split("\n").map(l => l.trim()).find(Boolean);
  if (firstLine && firstLine.length < 80 && !DAY_HEADER.test(firstLine)) {
    return firstLine.replace(/^[#\-•*]+\s*/, "");
  }
  return `Treino ${dayNumber}`;
}

/**
 * Função principal: recebe qualquer conteúdo e retorna a estrutura uniforme.
 */
export function parseProtocolToDays(content: any): ParsedProtocol {
  if (!content) return { days: [], isStructured: false, isFallback: true };

  // === CASO 1: já é objeto JSON estruturado ===
  if (typeof content === "object") {
    if (Array.isArray(content?.training_days) && content.training_days.length) {
      return {
        days: content.training_days.map((d: any, i: number) => ({
          day_number: d.day_number || i + 1,
          session_title: d.session_title || `Treino ${i + 1}`,
          estimated_duration: d.estimated_duration || "90min",
          muscle_tags: extractMuscleTags(
            (d.session_title || "") + " " +
            (d.exercises || []).map((e: any) => `${e?.name || ""} ${e?.muscle_target || ""}`).join(" ")
          ),
          body: "",
        })),
        isStructured: true,
        isFallback: false,
      };
    }
  }

  // === CASO 2: string com possível markdown ===
  let text: string;
  if (typeof content === "string") {
    // tenta JSON.parse
    try {
      const j = JSON.parse(content);
      if (j && typeof j === "object") return parseProtocolToDays(j);
    } catch { /* segue como texto */ }
    text = content;
  } else {
    text = JSON.stringify(content, null, 2);
  }

  const lines = text.split("\n");
  type Block = { header: string; num: number; bodyLines: string[] };
  const blocks: Block[] = [];
  let introLines: string[] = [];
  let current: Block | null = null;

  for (const line of lines) {
    const m = line.match(DAY_HEADER);
    if (m) {
      if (current) blocks.push(current);
      current = { header: line, num: parseInt(m[1]), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    } else {
      introLines.push(line);
    }
  }
  if (current) blocks.push(current);

  if (blocks.length === 0) {
    return {
      days: [],
      intro: text,
      isStructured: false,
      isFallback: true,
    };
  }

  const days: ParsedDay[] = blocks.map((b, i) => {
    const body = b.bodyLines.join("\n").trim();
    const title = extractTitle(b.header, b.num || i + 1, body);
    return {
      day_number: b.num || i + 1,
      session_title: title,
      estimated_duration: extractDuration(body),
      muscle_tags: extractMuscleTags(b.header + "\n" + body),
      body,
    };
  });

  return {
    days,
    intro: introLines.join("\n").trim() || undefined,
    isStructured: false,
    isFallback: false,
  };
}
