/**
 * Legenda gravada NA FOTO — pega a foto real do prato e escreve o texto
 * gerado por cima, na identidade nutriON, em dois formatos:
 * feed 1080x1350 e stories 1080x1920.
 *
 * Nada é inventado aqui: o texto vem pronto de quem chamou (legenda,
 * roteiro de story ou dados reais da refeição).
 */

export type MealOverlayFormat = "feed" | "story";

const TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  soft: "#CCCCCC",
  gold: "#EF9F27",
  green: "#5DCAA5",
} as const;

const DIM = { feed: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 } } as const;

const font = (weight: number | string, size: number) =>
  `${weight} ${size}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

export const loadImageFromUrl = (url: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

/** Quebra o texto e devolve as linhas — sem desenhar. */
const linhasDe = (ctx: CanvasRenderingContext2D, texto: string, maxW: number): string[] => {
  const out: string[] = [];
  for (const paragrafo of (texto || "").split(/\n+/)) {
    const palavras = paragrafo.split(/\s+/).filter(Boolean);
    if (!palavras.length) { out.push(""); continue; }
    let linha = "";
    for (const p of palavras) {
      const teste = linha ? `${linha} ${p}` : p;
      if (ctx.measureText(teste).width > maxW && linha) { out.push(linha); linha = p; } else linha = teste;
    }
    if (linha) out.push(linha);
  }
  return out;
};

/** Escreve o texto encolhendo a fonte até caber inteiro na altura disponível. */
const textoQueCabe = (
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
  base: number,
  weight: number | string,
  cor: string,
): number => {
  let size = base;
  let linhas: string[] = [];
  for (; size >= 20; size -= 2) {
    ctx.font = font(weight, size);
    linhas = linhasDe(ctx, texto, maxW);
    if (linhas.length * size * 1.4 <= maxH) break;
  }
  ctx.font = font(weight, size);
  ctx.fillStyle = cor;
  const lh = size * 1.4;
  let cursor = y + size;
  for (const l of linhas) {
    if (cursor > y + maxH + size) break;
    if (l) ctx.fillText(l, x, cursor);
    cursor += lh;
  }
  return cursor;
};

const rodape = (ctx: CanvasRenderingContext2D, w: number, h: number, handle: string) => {
  const x = 60;
  const baseline = h - 58;
  ctx.textAlign = "left";
  ctx.font = font(700, 42);
  ctx.fillStyle = TPL.ink;
  ctx.fillText("nutri", x, baseline);
  const nw = ctx.measureText("nutri").width;
  ctx.font = font("italic 700", 42);
  ctx.fillStyle = TPL.gold;
  ctx.fillText("ON", x + nw, baseline);
  ctx.font = font(400, 26);
  ctx.fillStyle = TPL.muted;
  ctx.textAlign = "right";
  ctx.fillText(handle.startsWith("@") ? handle : `@${handle}`, w - x, baseline);
  ctx.textAlign = "left";
};

export type MealOverlayInput = {
  format: MealOverlayFormat;
  /** Foto real do prato (opcional — sem foto o fundo fica preto nutriON). */
  photo?: HTMLImageElement | null;
  /** Linha pequena no topo (ex.: PRÉ-TREINO · 18:30). */
  eyebrow?: string;
  /** Título curto acima do texto (ex.: nome da refeição). */
  titulo?: string;
  /** A legenda/roteiro que será gravado na imagem. */
  texto: string;
  /** Linha final de dados reais (ex.: 620 kcal · 45g PTN · 60g CHO). */
  dados?: string;
  handle?: string;
};

/** Desenha a foto cobrindo a área e aplica gradiente para o texto ficar legível. */
const desenharFoto = (
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  w: number,
  h: number,
  alturaFoto: number,
) => {
  const scale = Math.max(w / photo.width, alturaFoto / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  ctx.drawImage(photo, (w - dw) / 2, (alturaFoto - dh) / 2, dw, dh);
  const g = ctx.createLinearGradient(0, alturaFoto * 0.3, 0, alturaFoto);
  g.addColorStop(0, "rgba(10,10,10,0.10)");
  g.addColorStop(0.6, "rgba(10,10,10,0.62)");
  g.addColorStop(1, "rgba(10,10,10,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, alturaFoto);
};

export const renderMealPhotoOverlay = (input: MealOverlayInput): string => {
  const { w, h } = DIM[input.format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = TPL.bg;
  ctx.fillRect(0, 0, w, h);

  const padX = 72;
  const maxW = w - padX * 2;
  const alturaFoto = input.photo ? Math.round(h * (input.format === "story" ? 0.56 : 0.52)) : 0;
  if (input.photo) desenharFoto(ctx, input.photo, w, h, alturaFoto);
  else {
    const g = ctx.createRadialGradient(w * 0.9, h * 0.1, 0, w * 0.9, h * 0.1, w);
    g.addColorStop(0, "rgba(93,202,165,0.14)");
    g.addColorStop(1, "rgba(93,202,165,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  let y = input.photo ? alturaFoto - Math.round(h * 0.14) : Math.round(h * 0.12);

  if (input.eyebrow) {
    ctx.font = font(700, 26);
    ctx.fillStyle = TPL.gold;
    ctx.fillText(input.eyebrow.toUpperCase(), padX, y);
    y += 46;
  }

  if (input.titulo) {
    y = textoQueCabe(ctx, input.titulo, padX, y, maxW, 200, 62, 800, TPL.ink) + 24;
  }

  const rodapeTopo = h - (input.dados ? 190 : 130);
  y = textoQueCabe(ctx, input.texto, padX, y, maxW, Math.max(120, rodapeTopo - y - 20), 40, 500, TPL.soft);

  if (input.dados) {
    ctx.font = font(700, 28);
    ctx.fillStyle = TPL.green;
    const linhas = linhasDe(ctx, input.dados, maxW).slice(0, 2);
    let dy = h - 150;
    for (const l of linhas) { ctx.fillText(l, padX, dy); dy += 36; }
  }

  rodape(ctx, w, h, input.handle || "diogo.mell0");
  return canvas.toDataURL("image/png");
};
