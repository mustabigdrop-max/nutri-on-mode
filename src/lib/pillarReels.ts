// Regras dos reels de pilar com fonte conferida (Banco de Reels e Modo Gravação).
export type FonteStatus = "verificada" | "parcial" | "sem_fonte_primaria";
export const FONTE_SELO: Record<FonteStatus, { label: string; color: string }> = {
  verificada: { label: "Fonte localizada", color: "#5DCAA5" },
  parcial: { label: "Fonte parcial", color: "#EF9F27" },
  sem_fonte_primaria: { label: "Sem fonte primária", color: "#EF4444" },
};
export const CORTE_LABEL: Record<string, string> = { A: "A · card de dado", B: "B · texto animado", D: "D · diagrama" };

const norm = (s: string) => String(s ?? "").replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

/** Índice do bloco que contém a ressalva obrigatória, ou -1. */
export function ressalvaIndex(blocos: { fala?: string }[], ressalva: string | null | undefined): number {
  if (!ressalva) return -1;
  const r = norm(ressalva);
  return blocos.findIndex(b => { const f = norm(b.fala ?? ""); return !!f && (f.includes(r) || (f.length >= 15 && r.includes(f))); });
}

/** Pode pular para o bloco `to`? Nunca passa da ressalva sem ter parado nela. */
export function canJumpTo(to: number, visited: Set<number>, ressalva: number): boolean {
  if (ressalva < 0 || to <= ressalva) return true;
  return visited.has(ressalva);
}

export const needsSourceWarning = (s: { fonte_status?: string | null; fonte_conferida_em?: string | null }) =>
  (s.fonte_status === "parcial" || s.fonte_status === "sem_fonte_primaria") && !s.fonte_conferida_em;

/** Separa a fala em trechos, marcando [ÊNFASE] (próxima frase) e [PAUSA ...]. */
export function voiceParts(fala: string): { t: string; kind: "texto" | "enfase" | "pausa" }[] {
  const out: { t: string; kind: "texto" | "enfase" | "pausa" }[] = [];
  const re = /\[(ÊNFASE|PAUSA[^\]]*)\]/g; let last = 0; let m: RegExpExecArray | null; let enf = false;
  const push = (t: string) => { if (!t) return; if (enf) { const i = t.search(/[.,?!]/); const a = i < 0 ? t : t.slice(0, i); out.push({ t: a, kind: "enfase" }); if (i >= 0) out.push({ t: t.slice(i), kind: "texto" }); enf = false; } else out.push({ t, kind: "texto" }); };
  while ((m = re.exec(fala))) { push(fala.slice(last, m.index)); if (m[1].startsWith("PAUSA")) out.push({ t: `[${m[1]}]`, kind: "pausa" }); else enf = true; last = re.lastIndex; }
  push(fala.slice(last));
  return out;
}
