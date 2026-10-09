// Renderização por código (Canvas 1080x1920) na identidade do Social ON. Texto sempre colocado aqui, nunca pela imagem gerada.
import type { CutTipo } from "./cutGenerator";

const W = 1080, H = 1920;
const C = { bg: "#020205", cyan: "#00D4FF", gold: "#B8922A", text: "#F5F0E8", muted: "#888888" };
const FT = "Rajdhani", FM = "Space Mono";

export interface RenderInput { tipo: CutTipo; texto: string; fonte?: string | null; itens?: string[]; imageUrl?: string | null; tempo?: string }

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = "";
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function frame(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#00D4FF14"; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}
function corners(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; const m = 60, l = 90;
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(x, y + l * dy); ctx.lineTo(x, y); ctx.lineTo(x + l * dx, y); ctx.stroke(); });
}
function lines(ctx: CanvasRenderingContext2D, txt: string, font: string, color: string, y: number, lh: number, maxW = W - 200) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = "center";
  const ls = wrap(ctx, txt, maxW); ls.forEach((l, i) => ctx.fillText(l, W / 2, y + i * lh)); return y + ls.length * lh;
}
function loadImage(src: string) { return new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

export async function renderCut(inp: RenderInput): Promise<HTMLCanvasElement> {
  await Promise.all([document.fonts.load(`700 80px ${FT}`), document.fonts.load(`400 30px "${FM}"`)]).catch(() => {});
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!; frame(ctx);
  const txt = inp.texto || "";

  if (inp.tipo === "dado") {
    const m = txt.match(/\d+[.,]?\d*\s*(%|x|kg|g|kcal|mg|h)?/i);
    const num = m ? m[0].replace(/\s+/g, "") : "";
    const rest = m ? txt.replace(m[0], "").replace(/^\W+/, "") : txt;
    ctx.font = `700 ${num.length > 5 ? 240 : 360}px ${FT}`; ctx.fillStyle = C.cyan; ctx.textAlign = "center"; ctx.fillText(num, W / 2, 900);
    ctx.fillStyle = C.gold; ctx.fillRect(W / 2 - 120, 980, 240, 8);
    lines(ctx, rest.toUpperCase(), `700 72px ${FT}`, C.text, 1110, 80);
    if (inp.fonte) lines(ctx, `FONTE: ${inp.fonte}`, `400 30px "${FM}"`, C.muted, 1650, 40, W - 240);
  } else if (inp.tipo === "texto") {
    ctx.fillStyle = C.gold; ctx.fillRect(100, 720, 12, 480);
    lines(ctx, txt.toUpperCase(), `700 104px ${FT}`, C.text, 840, 112, W - 260);
  } else if (inp.tipo === "diagrama") {
    const itens = (inp.itens?.length ? inp.itens : [txt]).slice(0, 4);
    const top = 420, gap = 1100 / itens.length;
    itens.forEach((it, i) => {
      const y = top + i * gap;
      ctx.strokeStyle = i % 2 ? C.gold : C.cyan; ctx.lineWidth = 5; ctx.strokeRect(140, y, W - 280, gap - 120);
      ctx.font = `400 34px "${FM}"`; ctx.fillStyle = i % 2 ? C.gold : C.cyan; ctx.textAlign = "left"; ctx.fillText(String(i + 1).padStart(2, "0"), 170, y + 56);
      ctx.font = `700 60px ${FT}`; ctx.fillStyle = C.text; ctx.textAlign = "center";
      wrap(ctx, it.toUpperCase(), W - 360).slice(0, 2).forEach((l, j) => ctx.fillText(l, W / 2, y + (gap - 120) / 2 + 10 + j * 66));
      if (i < itens.length - 1) { ctx.fillStyle = C.cyan; ctx.beginPath(); const ay = y + gap - 100; ctx.moveTo(W / 2 - 24, ay); ctx.lineTo(W / 2 + 24, ay); ctx.lineTo(W / 2, ay + 60); ctx.fill(); }
    });
  } else {
    if (inp.imageUrl) {
      const img = await loadImage(inp.imageUrl);
      const sc = Math.max(W / img.width, H / img.height); const iw = img.width * sc, ih = img.height * sc;
      ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      const g = ctx.createLinearGradient(0, H - 700, 0, H); g.addColorStop(0, "#02020500"); g.addColorStop(1, "#020205F0"); ctx.fillStyle = g; ctx.fillRect(0, H - 700, W, 700);
    }
    if (txt) lines(ctx, txt.toUpperCase(), `700 88px ${FT}`, C.text, H - 420, 96);
  }
  corners(ctx);
  if (inp.tempo) { ctx.font = `400 26px "${FM}"`; ctx.fillStyle = C.muted; ctx.textAlign = "right"; ctx.fillText(inp.tempo, W - 90, 130); }
  return cv;
}

export const canvasBlob = (cv: HTMLCanvasElement) => new Promise<Blob>((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error("png")), "image/png"));
