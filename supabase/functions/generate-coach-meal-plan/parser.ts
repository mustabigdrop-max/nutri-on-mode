// Helpers puros para parsing de respostas do plano alimentar gerado pela IA.
// Mantidos isolados para permitir testes unitários (Deno.test).

/**
 * Converte strings JSON-like que usam aspas simples em aspas duplas válidas,
 * preservando aspas duplas existentes e escapando quebras de linha literais.
 */
export function convertSingleQuotedStrings(src: string): string {
  let out = "";
  let inDouble = false;
  let inSingle = false;
  let esc = false;

  const nextSignificant = (from: number) => {
    for (let j = from + 1; j < src.length; j++) {
      const c = src[j];
      if (!/\s/.test(c)) return c;
    }
    return "";
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inSingle) {
      if (esc) { out += ch === "'" ? "'" : `\\${ch}`; esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === "'") {
        const next = nextSignificant(i);
        if (!next || next === "," || next === "}" || next === "]" || next === ":") {
          out += '"';
          inSingle = false;
          continue;
        }
      }
      if (ch === '"') { out += '\\"'; continue; }
      if (ch === "\n") { out += "\\n"; continue; }
      if (ch === "\r") { out += "\\r"; continue; }
      if (ch === "\t") { out += "\\t"; continue; }
      out += ch;
      continue;
    }
    if (esc) { out += ch; esc = false; continue; }
    if (ch === "\\") { out += ch; esc = true; continue; }
    if (ch === '"') { inDouble = !inDouble; out += ch; continue; }
    if (!inDouble && ch === "'") { inSingle = true; out += '"'; continue; }
    out += ch;
  }
  if (inSingle) out += '"';
  return out;
}

/** Remove caracteres invisíveis/controle e vírgulas pendentes que invalidam JSON. */
export function repairJsonLikeText(src: string): string {
  return convertSingleQuotedStrings(src)
    .replace(/\uFEFF|\u200B|\u200C|\u200D/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/,\s*([}\]])/g, "$1");
}

/** Extrai todos os objetos JSON balanceados de nível superior contidos no texto. */
export function extractTopLevelObjects(src: string): string[] {
  const objs: string[] = [];
  let depth = 0;
  let start = -1;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        objs.push(src.substring(start, i + 1));
        start = -1;
      }
    }
  }
  return objs;
}

/**
 * Dado um conjunto de candidatos, retorna o que mais provavelmente representa
 * o plano: prioriza objetos que contêm `"refeicoes"`; senão, o maior.
 */
export function selectBestCandidate(candidates: string[]): string | null {
  if (candidates.length === 0) return null;
  const withRefeicoes = candidates.filter((c) => /"refeicoes"\s*:/.test(c));
  const pool = withRefeicoes.length > 0 ? withRefeicoes : candidates;
  pool.sort((a, b) => b.length - a.length);
  return pool[0];
}

/**
 * Remove fences ```json e parágrafos extras antes/depois do JSON,
 * extrai o melhor objeto candidato e tenta parsear (com reparo agressivo
 * em caso de falha). Retorna `null` se não for possível obter um objeto.
 */
export function parseMealPlanResponse(raw: string): unknown | null {
  if (!raw) return null;
  let clean = raw.replace(/```json|```/g, "").trim();
  const candidates = extractTopLevelObjects(clean);
  const best = selectBestCandidate(candidates);
  if (best) clean = best;

  try {
    return JSON.parse(clean);
  } catch (_e) {
    try {
      return JSON.parse(repairJsonLikeText(clean));
    } catch (_e2) {
      return null;
    }
  }
}

/**
 * Remove horários parentéticos do título da refeição (e.g. "(11:00 - Almoço)").
 * O horário aparece em badge separado, então mantê-lo no título seria redundante.
 */
export function stripHorarioFromTitle(title: string): string {
  if (!title) return title;
  return title
    .replace(/\s*\(\s*\d{1,2}\s*[:hH]\s*\d{0,2}[^)]*\)\s*/g, " ")
    .replace(/\s*-\s*\d{1,2}\s*[:hH]\s*\d{2}\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
