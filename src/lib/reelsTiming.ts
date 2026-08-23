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

/* ─────────────────── Variações de ritmo ─────────────────── */

export type PacingVariant = {
  id: string;
  name: string;
  desc: string;
  /** peso relativo por bloco: HOOK, CORPO, PUNCH, CTA */
  weights: Record<string, number>;
  maxChars: number;
};

export const PACING_VARIANTS: PacingVariant[] = [
  { id: "a", name: "HOOK SECO", desc: "Abre curto e joga o peso no corpo. Boa para transição rápida.", weights: { HOOK: 0.6, CORPO: 1.25, PUNCH: 0.9, CTA: 0.9 }, maxChars: 34 },
  { id: "b", name: "EQUILIBRADO", desc: "Distribuição proporcional ao texto falado. Ritmo natural.", weights: { HOOK: 1, CORPO: 1, PUNCH: 1, CTA: 1 }, maxChars: 42 },
  { id: "c", name: "CTA LONGO", desc: "Sobra ar no final para o convite respirar antes do corte.", weights: { HOOK: 0.85, CORPO: 0.9, PUNCH: 1, CTA: 1.6 }, maxChars: 50 },
];

/** Monta os blocos aplicando os pesos de uma variação de ritmo. */
export function buildVariantScript(
  parts: { hook?: string; corpo?: string; punch?: string; cta?: string },
  totalSeconds: number,
  variant: PacingVariant,
): TimedBeat[] {
  const raw = [
    { label: "HOOK", text: (parts.hook || "").trim() },
    { label: "CORPO", text: (parts.corpo || "").trim() },
    { label: "PUNCH", text: (parts.punch || "").trim() },
    { label: "CTA", text: (parts.cta || "").trim() },
  ].filter((p) => p.text.length > 0);
  if (!raw.length || !totalSeconds || totalSeconds <= 0) return [];

  const weights = raw.map((p) => Math.max(estimateSeconds(p.text), 1) * (variant.weights[p.label] ?? 1));
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

/* ─────────────────── Cues (linha a linha, arrastáveis) ─────────────────── */

export type Cue = {
  id: string;
  label: string;
  text: string;
  start: number;
  end: number;
};

/** Explode os blocos em linhas de legenda com tempo próprio (base para o timeline). */
export function buildCues(beats: TimedBeat[], maxChars = 42): Cue[] {
  const cues: Cue[] = [];
  beats.forEach((b, bi) => {
    const lines = splitIntoLines(b.text, maxChars);
    if (!lines.length) return;
    const span = Math.max(b.to - b.from, 0.4);
    const weights = lines.map((l) => Math.max(l.length, 1));
    const sum = weights.reduce((a, x) => a + x, 0);
    let cursor = b.from;
    lines.forEach((l, i) => {
      const dur = i === lines.length - 1 ? b.to - cursor : (weights[i] / sum) * span;
      cues.push({
        id: `${bi}-${i}`,
        label: b.label,
        text: l,
        start: Math.round(cursor * 100) / 100,
        end: Math.round((cursor + dur) * 100) / 100,
      });
      cursor += dur;
    });
  });
  return cues;
}

/** Move o início de uma cue mantendo a ordem e um mínimo de 0,4s por linha. */
export function moveCueStart(cues: Cue[], id: string, start: number, total: number): Cue[] {
  const idx = cues.findIndex((c) => c.id === id);
  if (idx < 0) return cues;
  const MIN = 0.4;
  const lower = idx === 0 ? 0 : cues[idx - 1].start + MIN;
  const upper = cues[idx].end - MIN;
  const s = Math.min(Math.max(start, lower), Math.max(upper, lower));
  const next = cues.map((c) => ({ ...c }));
  next[idx].start = Math.round(s * 100) / 100;
  if (idx > 0) next[idx - 1].end = next[idx].start;
  next.forEach((c) => { c.end = Math.min(c.end, total); });
  return next;
}

/** Move o fim de uma cue (e o início da seguinte). */
export function moveCueEnd(cues: Cue[], id: string, end: number, total: number): Cue[] {
  const idx = cues.findIndex((c) => c.id === id);
  if (idx < 0) return cues;
  const MIN = 0.4;
  const lower = cues[idx].start + MIN;
  const upper = idx === cues.length - 1 ? total : cues[idx + 1].end - MIN;
  const e = Math.min(Math.max(end, lower), Math.max(upper, lower));
  const next = cues.map((c) => ({ ...c }));
  next[idx].end = Math.round(e * 100) / 100;
  if (idx < next.length - 1) next[idx + 1].start = next[idx].end;
  return next;
}

/* ─────────────────── Exportação SRT / VTT ─────────────────── */

function stamp(sec: number, sep: "," | "."): string {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const ms = Math.round((s - Math.floor(s)) * 1000);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(h)}:${p(m)}:${p(ss)}${sep}${p(ms, 3)}`;
}

export function cuesToSRT(cues: Cue[]): string {
  return cues
    .map((c, i) => `${i + 1}\n${stamp(c.start, ",")} --> ${stamp(c.end, ",")}\n${c.text}\n`)
    .join("\n");
}

export function cuesToVTT(cues: Cue[]): string {
  return `WEBVTT\n\n${cues
    .map((c, i) => `${i + 1}\n${stamp(c.start, ".")} --> ${stamp(c.end, ".")}\n${c.text}\n`)
    .join("\n")}`;
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
