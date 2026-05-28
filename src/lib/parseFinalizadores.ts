/**
 * parseFinalizadores — extrai exercícios finalizadores de um bloco markdown.
 *
 * Aceita formatos como:
 *   1. **Nome:** Alongamento de Peitoral
 *      **Execução:** ...
 *      **Séries/Duração:** 2x45s
 *      **Foco Corretivo:** Protração de Ombros
 *
 *   1. Alongamento de Peitoral
 *      Execução: ...
 *      Séries: ...
 *      Foco Corretivo: ...
 *
 * Também detecta agrupamentos por dia ("Dia 1:", "D1:", "Push:", "Treino A:")
 * antes de cada bloco numerado.
 */

export interface FinalizadorItem {
  numero: number;
  nome: string;
  execucao: string;
  series_duracao: string;
  foco_corretivo: string;
}

export interface FinalizadoresBlock {
  duracao_min?: number;
  objetivo?: string;
  exercicios: FinalizadorItem[];
}

// Limpa **bold**, __bold__, *italic*, `code`, # heading, bullets
function strip(s: string): string {
  return (s || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-•*]\s+/gm, "")
    .trim();
}

function fieldAfter(block: string, labels: string[]): string {
  for (const label of labels) {
    const re = new RegExp(
      `(?:\\*\\*\\s*)?${label}\\s*(?:\\*\\*)?\\s*:?\\s*\\*?\\*?([^\\n]+(?:\\n(?!\\s*(?:\\*\\*)?(?:nome|execu[çc][ãa]o|s[ée]ries?|dura[çc][ãa]o|foco|repeti)[^\\n]*:)[^\\n]+)*)`,
      "i",
    );
    const m = block.match(re);
    if (m && m[1]) return strip(m[1]);
  }
  return "";
}

/**
 * Divide texto em itens numerados (1. 2. 3. ou 1) 2) 3))
 */
function splitNumbered(text: string): string[] {
  if (!text) return [];
  // captura blocos que começam com  ^[ \t]*\d+[.)]
  const re = /(?:^|\n)\s*(\d+)[.)]\s+/g;
  const indexes: { idx: number; num: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    indexes.push({ idx: m.index + (m[0].startsWith("\n") ? 1 : 0), num: parseInt(m[1], 10) });
  }
  if (!indexes.length) return [];
  const parts: string[] = [];
  for (let i = 0; i < indexes.length; i++) {
    const start = indexes[i].idx;
    const end = i + 1 < indexes.length ? indexes[i + 1].idx : text.length;
    parts.push(text.slice(start, end).trim());
  }
  return parts;
}

function parseItem(rawBlock: string, fallbackNumero: number): FinalizadorItem | null {
  const numMatch = rawBlock.match(/^\s*(\d+)[.)]\s*/);
  const numero = numMatch ? parseInt(numMatch[1], 10) : fallbackNumero;
  const body = rawBlock.replace(/^\s*\d+[.)]\s*/, "");

  // nome = "Nome: X" se existir, senão primeira linha
  let nome = fieldAfter(body, ["nome"]);
  if (!nome) {
    const firstLine = body.split("\n")[0] || "";
    nome = strip(firstLine.replace(/^(?:\*\*)?(?:nome\s*:?)?(?:\*\*)?\s*/i, ""));
  }
  const execucao = fieldAfter(body, ["execu[çc][ãa]o", "como executar", "t[ée]cnica"]);
  const series_duracao = fieldAfter(body, ["s[ée]ries?/dura[çc][ãa]o", "s[ée]ries? e dura[çc][ãa]o", "s[ée]ries?", "dura[çc][ãa]o", "repeti[çc][õo]es"]);
  const foco_corretivo = fieldAfter(body, ["foco corretivo", "foco", "corre[çc][ãa]o", "objetivo"]);

  if (!nome) return null;
  return { numero, nome, execucao, series_duracao, foco_corretivo };
}

/**
 * Detecta header de dia: "Dia 1:", "D1:", "Treino A:", "Push:", "Pull:", "Legs:"
 */
const DAY_HEADER_RE =
  /^[\s\-•*#]*(?:\*\*\s*)?((?:dia|treino|sess[ãa]o|d)\s*\d+|treino\s+[a-z]|push|pull|legs?|peito|costas|pernas?|ombros?)[\s:.\-—–*]*([^\n]*)$/im;

/**
 * Faz parse e retorna:
 *  - global: itens encontrados quando não houver agrupamento por dia
 *  - byDay: mapa chave→itens quando houver cabeçalhos de dia
 */
export function parseFinalizadoresByDay(text: string): {
  global: FinalizadorItem[];
  byDay: Record<string, FinalizadorItem[]>;
  objetivo?: string;
  duracao_min?: number;
} {
  const empty = { global: [] as FinalizadorItem[], byDay: {} as Record<string, FinalizadorItem[]> };
  if (!text || !text.trim()) return empty;

  // Extrai objetivo/duração globais se presentes no topo
  const objetivoMatch = text.match(/objetivo\s*:?\s*([^\n]+)/i);
  const duracaoMatch = text.match(/(\d+)\s*min(?:utos)?/i);
  const objetivo = objetivoMatch ? strip(objetivoMatch[1]) : undefined;
  const duracao_min = duracaoMatch ? parseInt(duracaoMatch[1], 10) : undefined;

  // Tenta dividir por dia
  const lines = text.split("\n");
  type DayBucket = { key: string; bodyLines: string[] };
  const buckets: DayBucket[] = [];
  let intro: string[] = [];
  let current: DayBucket | null = null;

  for (const line of lines) {
    const m = line.match(DAY_HEADER_RE);
    // só conta como header se for linha curta (não exercício numerado)
    const isExerciseNumber = /^\s*\d+[.)]/.test(line);
    if (m && !isExerciseNumber && line.trim().length < 80) {
      if (current) buckets.push(current);
      const key = strip(m[1]).toUpperCase().replace(/\s+/g, "");
      current = { key, bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    } else {
      intro.push(line);
    }
  }
  if (current) buckets.push(current);

  const parseBlock = (t: string): FinalizadorItem[] => {
    const parts = splitNumbered(t);
    const out: FinalizadorItem[] = [];
    parts.forEach((p, i) => {
      const item = parseItem(p, i + 1);
      if (item) out.push(item);
    });
    return out;
  };

  if (buckets.length > 0) {
    const byDay: Record<string, FinalizadorItem[]> = {};
    for (const b of buckets) {
      const items = parseBlock(b.bodyLines.join("\n"));
      if (items.length) byDay[b.key] = items;
    }
    // se nada extraído por dia, cai para parse global
    if (Object.keys(byDay).length > 0) {
      return { global: parseBlock(intro.join("\n")), byDay, objetivo, duracao_min };
    }
  }

  return { global: parseBlock(text), byDay: {}, objetivo, duracao_min };
}

/**
 * Resolve quais finalizadores aplicar ao dia.
 * - Se houver bucket por dia que case com a chave (D1, DIA1, PUSH, etc.), usa essa.
 * - Senão usa os globais.
 */
export function resolveFinalizadoresForDay(
  parsed: ReturnType<typeof parseFinalizadoresByDay>,
  dayNumber: number,
  dayTitle?: string,
): FinalizadorItem[] {
  const keys = Object.keys(parsed.byDay);
  if (keys.length === 0) return parsed.global;

  const candidates = [
    `D${dayNumber}`,
    `DIA${dayNumber}`,
    `TREINO${dayNumber}`,
    `SESSÃO${dayNumber}`,
    `SESSAO${dayNumber}`,
  ];
  // por título: PUSH, PULL, LEGS, PEITO, COSTAS, PERNAS, OMBROS
  if (dayTitle) {
    const t = dayTitle.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    ["PUSH", "PULL", "LEGS", "PEITO", "COSTAS", "PERNAS", "OMBROS"].forEach((tag) => {
      if (t.includes(tag)) candidates.push(tag);
    });
  }

  for (const c of candidates) {
    const hit = keys.find((k) => k === c || k.startsWith(c));
    if (hit) return parsed.byDay[hit];
  }
  // Sem match: se houver só 1 bucket, retorna ele para todos
  if (keys.length === 1) return parsed.byDay[keys[0]];
  return parsed.global;
}

/**
 * Aceita um campo "finalizadores" do JSON (objeto ou array) e normaliza para FinalizadorItem[].
 */
export function normalizeFinalizadoresJson(raw: any): FinalizadoresBlock | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    return {
      exercicios: raw
        .map((it: any, i: number) => ({
          numero: Number(it?.numero ?? i + 1),
          nome: String(it?.nome ?? it?.name ?? "").trim(),
          execucao: String(it?.execucao ?? it?.execution ?? "").trim(),
          series_duracao: String(it?.series_duracao ?? it?.series ?? it?.duracao ?? "").trim(),
          foco_corretivo: String(it?.foco_corretivo ?? it?.focus ?? "").trim(),
        }))
        .filter((it) => it.nome),
    };
  }
  if (typeof raw === "object") {
    const list = raw.exercicios || raw.exercises || raw.items || [];
    return {
      duracao_min: Number(raw.duracao_min ?? raw.duration_min ?? 10) || 10,
      objetivo: String(raw.objetivo ?? raw.objective ?? "").trim() || undefined,
      exercicios: Array.isArray(list)
        ? list
            .map((it: any, i: number) => ({
              numero: Number(it?.numero ?? i + 1),
              nome: String(it?.nome ?? it?.name ?? "").trim(),
              execucao: String(it?.execucao ?? it?.execution ?? "").trim(),
              series_duracao: String(it?.series_duracao ?? it?.series ?? it?.duracao ?? "").trim(),
              foco_corretivo: String(it?.foco_corretivo ?? it?.focus ?? "").trim(),
            }))
            .filter((it) => it.nome)
        : [],
    };
  }
  if (typeof raw === "string") {
    const parsed = parseFinalizadoresByDay(raw);
    return { exercicios: parsed.global, objetivo: parsed.objetivo, duracao_min: parsed.duracao_min };
  }
  return null;
}
