/**
 * Base do estilo "TECH CIENTÍFICO" — primitivas de Canvas compartilhadas por
 * TODOS os geradores de conteúdo do nutriON (NEXUS-BIO, MCE, BiomechanicsVault,
 * módulos, treino do dia, refeição, resultado + protocolo, mito/método).
 *
 * Identidade: fundo #020205, grade sutil, ciano #00D4FF + dourado #B8922A,
 * tipografia Rajdhani / Space Mono e barra dourada na base com a tagline.
 * Nada aqui inventa conteúdo — só desenha o que o gerador entrega.
 */

export const TECH_TPL = {
  bg: "#020205",
  ink: "#FFFFFF",
  soft: "rgba(255,255,255,0.55)",
  muted: "rgba(255,255,255,0.38)",
  cyan: "#00D4FF",
  gold: "#B8922A",
  card: "rgba(255,255,255,0.02)",
} as const;

export const TECH_W = 1080;
export const TECH_H = 1350;
export const TECH_PAD = 60;
export const TECH_FOOTER_H = 90;

const W = TECH_W;
const H = TECH_H;
const PAD = TECH_PAD;
const FOOTER_H = TECH_FOOTER_H;

/** Garante Rajdhani + Space Mono carregadas antes de desenhar. */
let fontsPromise: Promise<void> | null = null;
export const ensureTechFonts = (): Promise<void> => {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    try {
      if (!document.getElementById("nexus-tech-fonts")) {
        const link = document.createElement("link");
        link.id = "nexus-tech-fonts";
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap";
        document.head.appendChild(link);
      }
      const f = document.fonts;
      await Promise.all([
        f.load("700 80px Rajdhani"),
        f.load("600 40px Rajdhani"),
        f.load("500 28px Rajdhani"),
        f.load("400 14px 'Space Mono'"),
        f.load("700 14px 'Space Mono'"),
      ]);
      await f.ready;
    } catch {
      /* fallback de sistema serve */
    }
  })();
  return fontsPromise;
};

export const headFont = (weight: number, size: number) =>
  `${weight} ${size}px Rajdhani, Inter, system-ui, sans-serif`;
export const monoFont = (weight: number, size: number) =>
  `${weight} ${size}px 'Space Mono', ui-monospace, monospace`;

type Token = { text: string; hi: boolean };
const tokenize = (text: string): Token[] =>
  (text || "")
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") ? { text: part.slice(2, -2), hi: true } : { text: part, hi: false },
    );

/** Quebra tokens `**destaque**` e também tokens longos (URLs). */
export const drawRich = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  o: {
    size: number;
    weight: number;
    color: string;
    accent?: string;
    lineHeight?: number;
    maxWidth: number;
    family?: "head" | "mono";
    /** altura útil da figura: o texto encolhe até caber dentro dela */
    maxHeight?: number;
    minSize?: number;
  },
) => {
  const ratio = o.lineHeight ?? 1.4;
  const fontFor = (hi: boolean, size: number) =>
    o.family === "mono" ? monoFont(o.weight, size) : headFont(hi ? 700 : o.weight, size);
  const words: Token[] = [];
  for (const token of tokenize(text)) {
    for (const word of token.text.split(/\s+/)) if (word) words.push({ text: word, hi: token.hi });
  }

  const layout = (size: number) => {
    const broken: Token[] = [];
    for (const word of words) {
      ctx.font = fontFor(word.hi, size);
      if (ctx.measureText(word.text).width <= o.maxWidth || word.text.length < 12) {
        broken.push(word);
        continue;
      }
      let rest = word.text;
      while (rest) {
        let cut = rest.length;
        while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > o.maxWidth) cut--;
        broken.push({ text: rest.slice(0, cut), hi: word.hi });
        rest = rest.slice(cut);
      }
    }
    const lines: Token[][] = [[]];
    let width = 0;
    for (const word of broken) {
      ctx.font = fontFor(word.hi, size);
      const w = ctx.measureText(`${word.text} `).width;
      if (width + w > o.maxWidth && lines[lines.length - 1].length) {
        lines.push([word]);
        width = w;
      } else {
        lines[lines.length - 1].push(word);
        width += w;
      }
    }
    return lines;
  };

  // A figura manda: o texto encolhe até caber dentro do card.
  const size = o.maxHeight
    ? fitTextSize((s2) => layout(s2).length, {
        size: o.size,
        lineHeight: ratio,
        maxHeight: o.maxHeight,
        min: o.minSize,
      })
    : o.size;

  const lh = size * ratio;
  const lines = layout(size);
  let cursorY = y;
  for (const line of lines) {
    let cursorX = x;
    for (const word of line) {
      ctx.font = fontFor(word.hi, size);
      ctx.fillStyle = word.hi ? o.accent || TECH_TPL.cyan : o.color;
      ctx.fillText(word.text, cursorX, cursorY);
      cursorX += ctx.measureText(`${word.text} `).width;
    }
    cursorY += lh;
  }
  return cursorY;
};

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const rgba = (hex: string, a: number) => {
  const clean = hex.startsWith("#") ? hex : "#00D4FF";
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/** Fundo tech: grade + brilhos radiais ciano/dourado + cantos. */
export const techBackground = (ctx: CanvasRenderingContext2D, seed = 1) => {
  ctx.fillStyle = TECH_TPL.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.03);
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= W; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H);
    ctx.stroke();
  }
  for (let gy = 0; gy <= H; gy += 40) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W, gy);
    ctx.stroke();
  }

  const glow = (cx: number, cy: number, r: number, color: string, a: number) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(color, a));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  glow(W * 0.5, H * (0.16 + 0.05 * Math.sin(seed)), 360, TECH_TPL.cyan, 0.07);
  glow(W * 0.5, H * 0.45, 260, TECH_TPL.gold, 0.05);

  ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.05);
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.3, 250, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = rgba(TECH_TPL.gold, 0.04);
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.35, 330, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.15);
  ctx.lineWidth = 2;
  const c = 60;
  const o = 15;
  ctx.beginPath();
  ctx.moveTo(o, o + c); ctx.lineTo(o, o); ctx.lineTo(o + c, o);
  ctx.moveTo(W - o - c, o); ctx.lineTo(W - o, o); ctx.lineTo(W - o, o + c);
  ctx.stroke();
  ctx.strokeStyle = rgba(TECH_TPL.gold, 0.15);
  const bo = H - FOOTER_H - o;
  ctx.beginPath();
  ctx.moveTo(o, bo - c); ctx.lineTo(o, bo); ctx.lineTo(o + c, bo);
  ctx.moveTo(W - o - c, bo); ctx.lineTo(W - o, bo); ctx.lineTo(W - o, bo - c);
  ctx.stroke();
};

/** Barra dourada da base: tagline + handle (desenhada por último). */
export const techFooter = (ctx: CanvasRenderingContext2D, handle: string) => {
  const y = H - FOOTER_H;
  ctx.fillStyle = TECH_TPL.gold;
  ctx.fillRect(0, y, W, FOOTER_H);
  ctx.font = headFont(700, 20);
  ctx.fillStyle = TECH_TPL.bg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("TRANSFORMAÇÃO É SISTEMA.", PAD, y + FOOTER_H / 2);
  ctx.font = monoFont(400, 13);
  ctx.globalAlpha = 0.65;
  const hdl = `@${handle.replace(/^@/, "")}`;
  ctx.fillText(`nutriON  ·  ${hdl}`, W - PAD - ctx.measureText(`nutriON  ·  ${hdl}`).width, y + FOOTER_H / 2);
  ctx.globalAlpha = 1;
  ctx.textBaseline = "alphabetic";
};

/** Header: eyebrow mono espaçado + título grande + linha gradiente. */
export const techHeader = (
  ctx: CanvasRenderingContext2D,
  eyebrow: string,
  title: string,
  subtitle?: string,
) => {
  let y = 110;
  ctx.font = monoFont(400, 14);
  ctx.fillStyle = rgba(TECH_TPL.cyan, 0.7);
  let lx = PAD;
  for (const ch of (eyebrow || "").toUpperCase()) {
    ctx.fillText(ch, lx, y);
    lx += ctx.measureText(ch).width + 6;
  }
  y += 20;
  const size = (title || "").length > 34 ? 50 : 62;
  const end = drawRich(ctx, (title || "").toUpperCase(), PAD, y + size, {
    size, weight: 700, color: TECH_TPL.ink, accent: TECH_TPL.cyan, lineHeight: 1.05, maxWidth: W - PAD * 2,
  });
  y = end + 10;
  if (subtitle) {
    const sEnd = drawRich(ctx, subtitle, PAD, y + 22, {
      size: 22, weight: 500, color: TECH_TPL.muted, lineHeight: 1.35, maxWidth: W - PAD * 2,
    });
    y = sEnd + 4;
  }
  const g = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.35, TECH_TPL.cyan);
  g.addColorStop(0.65, TECH_TPL.gold);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(PAD, y + 12, W - PAD * 2, 2);
  return y + 40;
};

/** Pílula de status no canto superior direito. */
export const techPill = (ctx: CanvasRenderingContext2D, text: string, color: string) => {
  ctx.font = monoFont(700, 13);
  const bw = ctx.measureText(text).width + 36;
  const bh = 30;
  const x = W - PAD - bw;
  const y = 60;
  roundRect(ctx, x, y, bw, bh, bh / 2);
  ctx.fillStyle = rgba(color, 0.1);
  ctx.fill();
  ctx.strokeStyle = rgba(color, 0.4);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 18, y + bh / 2 + 1);
  ctx.textBaseline = "alphabetic";
};

/** Limite inferior seguro do conteúdo (acima da barra dourada). */
export const techContentBottom = () => H - FOOTER_H - 40;

/** Cria um slide com fundo, pílula opcional e clip na área segura. */
export const newTechSlide = (seed: number, pill?: { text: string; color: string }) => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.save();
  techBackground(ctx, seed);
  if (pill) techPill(ctx, pill.text, pill.color);
  ctx.beginPath();
  ctx.rect(0, 0, W, techContentBottom() + 20);
  ctx.clip();
  return { canvas, ctx };
};

/** Fecha o slide: sai do clip, desenha o rodapé e devolve o PNG. */
export const finishTechSlide = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  handle: string,
) => {
  ctx.restore();
  techFooter(ctx, handle);
  return canvas.toDataURL("image/png");
};

/** Card com borda lateral colorida. */
export const infoCard = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) => {
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = TECH_TPL.card;
  ctx.fill();
  ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.08);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 4, h);
};
