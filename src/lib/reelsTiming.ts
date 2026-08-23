// Reels Studio — sincronização de legenda/CTA com a duração do trecho cortado

export type TimedBeat = {
  label: string;
  from: number;
  to: number;
  text: string;
};

/** Divide um texto em falas curtas (quebras de linha) proporcionais ao tempo disponível. */
export function splitIntoLines(text: string, maxChars = 42): string[] {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const out: string[] = [];
  let line = "";
  clean.split(/(?<=[.!?;:])\s+|\s+/).forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (test.length > maxChars && line) {
      out.push(line);
      line = word;
    } else line = test;
  });
  if (line) out.push(line);
  return out;
}

/** Palavras por segundo confortáveis para narração em Reels. */
const WPS = 2.8;

export function estimateSeconds(text: string): number {
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  return words / WPS;
}

/**
 * Monta os blocos (hook, corpo, punch, CTA) escalados para caber exatamente
 * na duração do trecho selecionado no cortador.
 */
export function buildTimedScript(
  parts: { hook?: string; corpo?: string; punch?: string; cta?: string },
  totalSeconds: number,
): TimedBeat[] {
  const raw = [
    { label: "HOOK", text: (parts.hook || "").trim() },
    { label: "CORPO", text: (parts.corpo || "").trim() },
    { label: "PUNCH", text: (parts.punch || "").trim() },
    { label: "CTA", text: (parts.cta || "").trim() },
  ].filter((p) => p.text.length > 0);

  if (!raw.length || !totalSeconds || totalSeconds <= 0) return [];

  const weights = raw.map((p) => Math.max(estimateSeconds(p.text), 1));
  const sum = weights.reduce((a, b) => a + b, 0);

  let cursor = 0;
  return raw.map((p, i) => {
    const span = i === raw.length - 1 ? totalSeconds - cursor : (weights[i] / sum) * totalSeconds;
    const beat: TimedBeat = {
      label: p.label,
      from: Math.round(cursor * 10) / 10,
      to: Math.round((cursor + span) * 10) / 10,
      text: p.text,
    };
    cursor += span;
    return beat;
  });
}

/** Texto pronto para copiar: legenda quebrada em linhas com marcação de tempo. */
export function formatTimedScript(beats: TimedBeat[], caption?: string, cta?: string): string {
  const lines: string[] = ["ROTEIRO SINCRONIZADO COM O CORTE", "─".repeat(40)];
  beats.forEach((b) => {
    lines.push(`${b.from.toFixed(1)}s – ${b.to.toFixed(1)}s · ${b.label}`);
    splitIntoLines(b.text).forEach((l) => lines.push(`   ${l}`));
    lines.push("");
  });
  if (caption) {
    lines.push("─".repeat(40), "LEGENDA (quebras sugeridas)", "");
    splitIntoLines(caption, 60).forEach((l) => lines.push(l));
    lines.push("");
  }
  if (cta) lines.push("─".repeat(40), "CTA", ...splitIntoLines(cta, 60));
  return lines.join("\n");
}

/** Alerta quando o roteiro escrito não cabe no tempo do corte. */
export function fitStatus(parts: { hook?: string; corpo?: string; punch?: string; cta?: string }, totalSeconds: number) {
  const needed = ["hook", "corpo", "punch", "cta"].reduce(
    (a, k) => a + estimateSeconds((parts as Record<string, string | undefined>)[k] || ""),
    0,
  );
  const diff = needed - totalSeconds;
  if (Math.abs(diff) <= totalSeconds * 0.15) return { status: "ok" as const, needed, diff, msg: "O texto cabe no tempo do corte." };
  if (diff > 0) return { status: "long" as const, needed, diff, msg: `Texto ~${Math.round(diff)}s mais longo que o corte. Corte frases ou aumente o trecho.` };
  return { status: "short" as const, needed, diff, msg: `Sobram ~${Math.round(-diff)}s. Adicione um exemplo ou reduza o trecho.` };
}
