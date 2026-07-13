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
const DAY_HEADER = /^\s*(?:#{1,4}\s*)?(?:\*{0,2})(?:dia|sess[aã]o|treino|d)\s*0*(\d+)\b[\s:.\-—–]*([^\n]*)$/im;

// regex que captura cabeçalho por dia da semana usado em protocolos APEX:
//   ### SEGUNDA-FEIRA: PEITO E TRÍCEPS, **Quarta:** Pernas, "Terça feira — Costas"
const WEEKDAY_HEADER =
  /^\s*(?:#{1,4}\s*)?(?:\*{0,2})(segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado|domingo)(?:[\s\-]*feira)?(?:\*{0,2})[\s:.\-—–]*([^\n]*)$/im;

const WEEKDAY_ORDER: Record<string, number> = {
  segunda: 1,
  terca: 2, terça: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6, sábado: 6,
  domingo: 7,
};

function normalizeWeekday(w: string): string {
  return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchDayHeader(line: string): { num: number; rest: string; isWeekday: boolean } | null {
  const m1 = line.match(DAY_HEADER);
  if (m1) return { num: parseInt(m1[1]), rest: (m1[2] || "").trim(), isWeekday: false };
  const m2 = line.match(WEEKDAY_HEADER);
  if (m2) {
    const key = normalizeWeekday(m2[1]);
    const num = WEEKDAY_ORDER[key] ?? WEEKDAY_ORDER[m2[1].toLowerCase()] ?? 1;
    const dayLabel = m2[1].charAt(0).toUpperCase() + m2[1].slice(1).toLowerCase();
    const rest = (m2[2] || "").trim();
    return { num, rest: rest ? `${dayLabel} — ${rest}` : dayLabel, isWeekday: true };
  }
  return null;
}

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

function extractTitle(rest: string, dayNumber: number, body: string): string {
  const cleaned = rest.replace(/^[*#\-•:\s]+/, "").replace(/\*+$/g, "").trim();
  if (cleaned && cleaned.length > 1) return cleaned;
  const firstLine = body.split("\n").map(l => l.trim()).find(Boolean);
  if (firstLine && firstLine.length < 80 && !matchDayHeader(firstLine)) {
    return firstLine.replace(/^[#\-•*]+\s*/, "");
  }
  return `Treino ${dayNumber}`;
}

/** Retorno seguro para conteúdo inutilizável — nunca vaza dados brutos. */
function emptyFallback(): ParsedProtocol {
  return { days: [], isStructured: false, isFallback: true };
}

/** Serializa objeto de forma segura (nunca lança, corta circular refs). */
function safeStringify(v: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(v, (_k, val) => {
      if (val && typeof val === "object") {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      return val;
    }, 2);
  } catch {
    return "";
  }
}

/** true se a string parece JSON serializado (objeto/array). */
function looksLikeJson(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (!((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]")))) return false;
  try { JSON.parse(t); return true; } catch { return false; }
}

/** Normaliza um item de training_days garantindo tipos previsíveis. */
function normalizeDay(d: any, idx: number): ParsedDay {
  const safe = d && typeof d === "object" ? d : {};
  const dayNumRaw = safe.day_number ?? safe.day_index;
  const dayNum = Number.isFinite(Number(dayNumRaw)) ? Number(dayNumRaw) : idx + 1;
  const title = typeof safe.session_title === "string" && safe.session_title.trim()
    ? safe.session_title
    : (typeof safe.title === "string" && safe.title.trim() ? safe.title : `Treino ${dayNum}`);
  const duration = typeof safe.estimated_duration === "string" && safe.estimated_duration.trim()
    ? safe.estimated_duration
    : "90min";
  const exercises = Array.isArray(safe.exercises) ? safe.exercises : [];
  return {
    day_number: dayNum,
    session_title: title,
    estimated_duration: duration,
    muscle_tags: extractMuscleTags(
      String(title) + " " +
      exercises.map((e: any) => `${e?.name ?? e?.nome ?? ""} ${e?.muscle_target ?? ""}`).join(" ")
    ),
    body: "",
  };
}

/**
 * Função principal: recebe qualquer conteúdo e retorna a estrutura uniforme.
 * Nunca vaza JSON cru — entradas inutilizáveis retornam isFallback com intro vazio.
 */
export function parseProtocolToDays(content: any): ParsedProtocol {
  // === entradas vazias / inválidas ===
  if (content == null) return emptyFallback();
  if (typeof content === "number" || typeof content === "boolean") return emptyFallback();

  // === CASO 1: objeto/array ===
  if (typeof content === "object") {
    // array direto de dias
    if (Array.isArray(content)) {
      if (content.length === 0) return emptyFallback();
      // se o array tem shape de exercises/dias, tenta usar
      if (content.every(x => x && typeof x === "object")) {
        return {
          days: content.map((d, i) => normalizeDay(d, i)),
          isStructured: true,
          isFallback: false,
        };
      }
      return emptyFallback();
    }
    const td = (content as any).training_days;
    if (Array.isArray(td) && td.length > 0) {
      return {
        days: td.map((d: any, i: number) => normalizeDay(d, i)),
        isStructured: true,
        isFallback: false,
      };
    }
    // objeto sem training_days: pode ter block_overview/phase_plan → não é nosso trabalho renderizar
    return emptyFallback();
  }

  // === CASO 2: string ===
  if (typeof content !== "string") return emptyFallback();

  const raw = content;
  const trimmed = raw.trim();
  if (!trimmed) return emptyFallback();

  // string que começa com { ou [ → tratada como JSON. Se não parsear/normalizar, fallback vazio.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    if (looksLikeJson(trimmed)) {
      try {
        const j = JSON.parse(trimmed);
        const result = parseProtocolToDays(j);
        if (!result.isFallback) return result;
      } catch { /* cai no fallback */ }
    }
    return emptyFallback();
  }

  // texto/markdown: divide por cabeçalhos de dia
  const lines = raw.split("\n");
  type Block = { rest: string; num: number; bodyLines: string[] };
  const blocks: Block[] = [];
  const introLines: string[] = [];
  let current: Block | null = null;
  let autoNum = 0;

  for (const line of lines) {
    const m = matchDayHeader(line);
    if (m) {
      if (current) blocks.push(current);
      autoNum += 1;
      current = { rest: m.rest, num: m.isWeekday ? autoNum : (m.num || autoNum), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    } else {
      introLines.push(line);
    }
  }
  if (current) blocks.push(current);

  // Limita tamanho do intro para não vazar textos gigantes/lixo
  const introText = introLines.join("\n").trim();
  const safeIntro = introText && introText.length <= 4000 && !looksLikeJson(introText)
    ? introText
    : undefined;

  if (blocks.length === 0) {
    // nenhum cabeçalho de dia detectado: só é útil se o texto tiver conteúdo curto e humano
    if (!safeIntro) return emptyFallback();
    return { days: [], intro: safeIntro, isStructured: false, isFallback: true };
  }

  const days: ParsedDay[] = blocks.map((b, i) => {
    const body = b.bodyLines.join("\n").trim();
    const title = extractTitle(b.rest, b.num || i + 1, body);
    return {
      day_number: b.num || i + 1,
      session_title: title,
      estimated_duration: extractDuration(body),
      muscle_tags: extractMuscleTags(b.rest + "\n" + body),
      body,
    };
  });

  return { days, intro: safeIntro, isStructured: false, isFallback: false };
}

// export interno para testes
export const __internal = { safeStringify, looksLikeJson, normalizeDay };
