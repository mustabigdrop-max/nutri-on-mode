// Social ON — Editor: animações por camada, guias/snap, projeto salvo e exportações.

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  color: string;
  stroke: string;
  strokeWidth: number;
  align: CanvasTextAlign;
  y: number;
  x?: number;
  shadow: boolean;
  uppercase: boolean;
  letterSpacing: number;
  bg?: string;
  bgPad?: number;
  glow?: string;
  glowSize?: number;
  fullBlack?: boolean;
  cineBars?: boolean;
  skew?: number;
};

export type MoveKind = "none" | "up" | "down" | "left" | "right" | "zoom";

export type LayerAnim = {
  /** Segundo em que a camada aparece. */
  start: number;
  /** Duração visível em segundos (0 = até o fim do vídeo). */
  duration: number;
  fadeIn: number;
  fadeOut: number;
  move: MoveKind;
  /** Distância do movimento em fração da tela (0–0.3). */
  moveAmount: number;
};

export type Layer = {
  id: number;
  text: string;
  style: TextStyle;
  visible: boolean;
  preset: string;
  anim: LayerAnim;
};

export const defaultAnim = (): LayerAnim => ({
  start: 0,
  duration: 0,
  fadeIn: 0.3,
  fadeOut: 0.3,
  move: "none",
  moveAmount: 0.05,
});

/* ---------------- Guias e margens seguras (Reels 9:16) ---------------- */

/** Margens seguras do Reels: topo (UI do app), base (legenda/CTA) e laterais. */
export const SAFE = { top: 0.14, bottom: 0.2, side: 0.06 };

/** Linhas de snap em fração (0–1). */
export function snapTargetsY(): number[] {
  return [SAFE.top, 1 / 3, 0.5, 2 / 3, 1 - SAFE.bottom];
}
export function snapTargetsX(): number[] {
  return [SAFE.side, 1 / 3, 0.5, 2 / 3, 1 - SAFE.side];
}

/** Aproxima o valor da guia mais próxima dentro da tolerância. */
export function snapValue(value: number, targets: number[], tolerance = 0.02): { value: number; snapped: number | null } {
  let best: number | null = null;
  let bestDist = tolerance;
  for (const t of targets) {
    const d = Math.abs(value - t);
    if (d <= bestDist) { bestDist = d; best = t; }
  }
  return { value: best ?? value, snapped: best };
}

export function drawGuides(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  active: { x: number | null; y: number | null },
) {
  ctx.save();
  // Margens seguras
  ctx.strokeStyle = "rgba(184,146,42,0.45)";
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.strokeRect(w * SAFE.side, h * SAFE.top, w * (1 - SAFE.side * 2), h * (1 - SAFE.top - SAFE.bottom));

  // Terços
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.setLineDash([2, 6]);
  [1 / 3, 2 / 3].forEach((f) => {
    ctx.beginPath(); ctx.moveTo(0, h * f); ctx.lineTo(w, h * f); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * f, 0); ctx.lineTo(w * f, h); ctx.stroke();
  });

  // Guia ativa do snap
  ctx.setLineDash([]);
  ctx.strokeStyle = "#00D4FF";
  ctx.lineWidth = 1.5;
  if (active.y != null) { ctx.beginPath(); ctx.moveTo(0, h * active.y); ctx.lineTo(w, h * active.y); ctx.stroke(); }
  if (active.x != null) { ctx.beginPath(); ctx.moveTo(w * active.x, 0); ctx.lineTo(w * active.x, h); ctx.stroke(); }
  ctx.restore();
}

/* ---------------- Animação ---------------- */

export type AnimState = { alpha: number; dx: number; dy: number; scale: number };

/** Estado de animação da camada no tempo t (segundos). null = não desenhar. */
export function animAt(anim: LayerAnim, t: number, total: number): AnimState | null {
  const start = Math.max(0, anim.start || 0);
  const dur = anim.duration && anim.duration > 0 ? anim.duration : Math.max(0.1, (total || 0) - start);
  const end = start + dur;
  if (t < start || t > end) return null;

  const inT = Math.max(0, anim.fadeIn || 0);
  const outT = Math.max(0, anim.fadeOut || 0);
  let alpha = 1;
  if (inT > 0 && t < start + inT) alpha = (t - start) / inT;
  if (outT > 0 && t > end - outT) alpha = Math.min(alpha, (end - t) / outT);
  alpha = Math.max(0, Math.min(1, alpha));

  // Progresso da entrada (usado no movimento)
  const p = inT > 0 ? Math.max(0, Math.min(1, (t - start) / inT)) : 1;
  const ease = 1 - Math.pow(1 - p, 3);
  const amt = (anim.moveAmount ?? 0.05) * (1 - ease);

  let dx = 0, dy = 0, scale = 1;
  switch (anim.move) {
    case "up": dy = amt; break;
    case "down": dy = -amt; break;
    case "left": dx = amt; break;
    case "right": dx = -amt; break;
    case "zoom": scale = 1 - amt * 2; break;
    default: break;
  }
  return { alpha, dx, dy, scale };
}

/* ---------------- Projeto (salvar / carregar) ---------------- */

export type EditorProject = {
  version: 1;
  name: string;
  ratio: string;
  layers: Layer[];
  savedAt: string;
};

const KEY = "socialon_editor_projects";

export function listProjects(): EditorProject[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EditorProject[]) : [];
  } catch { return []; }
}

export function saveProject(p: Omit<EditorProject, "version" | "savedAt">): EditorProject {
  const project: EditorProject = { ...p, version: 1, savedAt: new Date().toISOString() };
  const all = listProjects().filter((x) => x.name !== project.name);
  all.unshift(project);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30)));
  return project;
}

export function deleteProject(name: string) {
  localStorage.setItem(KEY, JSON.stringify(listProjects().filter((p) => p.name !== name)));
}

export function downloadProject(p: EditorProject) {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${p.name.replace(/\s+/g, "-").toLowerCase()}.socialon.json`);
}

export async function readProjectFile(file: File): Promise<EditorProject> {
  const text = await file.text();
  const data = JSON.parse(text) as EditorProject;
  if (!data || !Array.isArray(data.layers)) throw new Error("Arquivo de projeto inválido.");
  data.layers = data.layers.map((l) => ({ ...l, anim: { ...defaultAnim(), ...(l.anim || {}) } }));
  return data;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------------- Exportação ---------------- */

export type VideoFormat = "mp4" | "webm";

export function pickRecorderMime(format: VideoFormat): string | null {
  const candidates =
    format === "mp4"
      ? ["video/mp4;codecs=avc1.42E01E", "video/mp4;codecs=h264", "video/mp4"]
      : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  if (typeof MediaRecorder === "undefined") return null;
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

export function supportsMp4(): boolean {
  return !!pickRecorderMime("mp4");
}

/**
 * Gera um GIF a partir de frames do canvas (vídeos curtos).
 * Reduz resolução e fps para manter o arquivo utilizável.
 */
export async function encodeGif(
  frames: { data: Uint8ClampedArray; width: number; height: number }[],
  fps: number,
): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const enc = GIFEncoder();
  const delay = Math.round(1000 / fps);
  for (const f of frames) {
    const data = new Uint8Array(f.data.buffer.slice(0));
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    enc.writeFrame(index, f.width, f.height, { palette, delay });
  }
  enc.finish();
  return new Blob([enc.bytesView() as unknown as BlobPart], { type: "image/gif" });
}
