// Util — Normaliza protocol_text (que pode vir como objeto, JSON serializado ou markdown puro)
// Retorna { json, markdown } — exatamente um deles estará preenchido em casos válidos.

export function parseProtocolText(raw: unknown): { json: any | null; markdown: string | null } {
  if (raw == null) return { json: null, markdown: null };

  // Já é objeto estruturado
  if (typeof raw === "object") {
    return { json: raw, markdown: null };
  }

  // String: pode ser JSON serializado OU markdown puro
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return { json: null, markdown: null };

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const obj = JSON.parse(trimmed);
        if (
          obj &&
          typeof obj === "object" &&
          (obj.block_overview || obj.training_days)
        ) {
          return { json: obj, markdown: null };
        }
        // JSON válido mas sem estrutura esperada — não renderiza JSON cru
        return { json: null, markdown: null };
      } catch {
        // Não era JSON — trata como markdown
      }
    }
    return { json: null, markdown: raw };
  }

  return { json: null, markdown: null };
}
