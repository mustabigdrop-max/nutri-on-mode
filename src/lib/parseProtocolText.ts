// Util — Normaliza protocol_text (que pode vir como objeto, JSON serializado ou markdown puro)
// Retorna { json, markdown } — exatamente um deles estará preenchido em casos válidos.
// Contrato crítico: NUNCA devolver uma string JSON estruturada como markdown.

const isStructuredProtocol = (obj: any) =>
  !!obj && typeof obj === "object" && (obj.block_overview || obj.training_days || obj.phase_plan);

/** Remove cercas de código markdown (```json ... ```) preservando o conteúdo. */
function stripCodeFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

/** Extrai o primeiro objeto JSON estruturado presente no texto, se houver. */
function extractStructuredJson(s: string): any | null {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  const candidate = s.slice(start, end + 1);
  try {
    const obj = JSON.parse(candidate);
    return isStructuredProtocol(obj) ? obj : null;
  } catch {
    return null;
  }
}

/** true se o texto contém um bloco JSON cru (mesmo que não parseável) que não deve ir pra tela. */
function containsRawJsonBlock(s: string): boolean {
  return /"(block_overview|training_days|phase_plan|session_title|improvement_alerts)"\s*:/.test(s);
}

export function parseProtocolText(raw: unknown): { json: any | null; markdown: string | null } {
  if (raw == null) return { json: null, markdown: null };

  // Já é objeto estruturado
  if (typeof raw === "object") {
    return { json: raw, markdown: null };
  }

  if (typeof raw !== "string") return { json: null, markdown: null };

  const trimmed = stripCodeFences(raw.trim());
  if (!trimmed) return { json: null, markdown: null };

  // JSON puro
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const obj = JSON.parse(trimmed);
      if (isStructuredProtocol(obj)) return { json: obj, markdown: null };
      // JSON válido mas sem estrutura esperada — não renderiza JSON cru
      return { json: null, markdown: null };
    } catch {
      // Não era JSON válido — segue para as checagens abaixo
    }
  }

  // Texto misto (header/markdown + bloco JSON) — tenta extrair o protocolo estruturado
  const embedded = extractStructuredJson(trimmed);
  if (embedded) return { json: embedded, markdown: null };

  // Texto contém JSON cru quebrado — nunca exibir
  if (containsRawJsonBlock(trimmed)) return { json: null, markdown: null };

  return { json: null, markdown: raw };
}
