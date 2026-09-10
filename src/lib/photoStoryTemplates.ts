/**
 * Stories 1080x1920 com a foto real do coach + overlay nutriON.
 * Cinco templates fixos: FRASE, DADO, ROTINA, CTA e MÍNIMO.
 * A foto cobre o canvas inteiro, recebe um gradiente escuro no rodapé
 * e o template é desenhado por cima. Assinatura nutriON sempre presente.
 */

export const STORY_TPL = {
  bg: "#0A0A0A",
  ink: "#F5F0E8",
  muted: "#888888",
  dim: "#666666",
  gold: "#EF9F27",
  green: "#5DCAA5",
  purple: "#AFA9EC",
} as const;

export const W = 1080;
export const H = 1920;

export type PhotoTemplate = "FRASE" | "DADO" | "ROTINA" | "CTA" | "MINIMO";

export const PHOTO_TEMPLATES: { id: PhotoTemplate; label: string; hint: string }[] = [
  { id: "FRASE", label: "FRASE", hint: "foto + citação de impacto" },
  { id: "DADO", label: "DADO", hint: "foto + card científico" },
  { id: "ROTINA", label: "ROTINA", hint: "foto + treino do dia" },
  { id: "CTA", label: "CTA", hint: "foto + diagnóstico" },
  { id: "MINIMO", label: "MÍNIMO", hint: "foto + frase curta" },
];

export type StoryTexts = {
  frase?: string;
  /** Linha menor abaixo da frase (usada pelo "Postar com minha foto"). */
  subtexto?: string;
  dado?: { numero?: string; descricao?: string; fonte?: string };
  rotina?: { hora?: string; dia?: string; nome?: string; detalhes?: string; frase?: string };
  cta?: { pergunta?: string };
  minimo?: string;
};

const font = (weight: number | string, size: number) =>
  `${weight} ${size}px Inter, 'Inter var', system-ui, -apple-system, sans-serif`;

/**
 * Texto com quebra automática; devolve o Y da última linha.
 * Quando `maxHeight` é informado (altura útil do card/figura), a fonte encolhe
 * até o texto caber inteiro dentro da figura — nada escapa da caixa.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxHeight?: number,
) {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const fonteBase = ctx.font;
  const tamanhoBase = Number(/([\d.]+)px/.exec(fonteBase)?.[1] || 0);

  const quebrar = () => {
    const linhas: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        linhas.push(line);
        line = word;
      } else line = test;
    }
    if (line) linhas.push(line);
    return linhas;
  };

  let escala = 1;
  if (maxHeight && tamanhoBase) {
    const min = 0.55;
    while (escala > min && quebrar().length * lineHeight * escala > maxHeight) {
      escala -= 0.04;
      ctx.font = fonteBase.replace(/([\d.]+)px/, `${(tamanhoBase * escala).toFixed(1)}px`);
    }
  }

  const lh = lineHeight * escala;
  const linhas = quebrar();
  let currentY = y;
  linhas.forEach((l, i) => {
    ctx.fillText(l, x, currentY);
    if (i < linhas.length - 1) currentY += lh;
  });
  ctx.font = fonteBase;
  return currentY;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

/** Carrega um arquivo ou URL como imagem pronta pro canvas. */
export function loadImage(src: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const url = typeof src === "string" ? src : URL.createObjectURL(src);
    img.onload = () => {
      if (typeof src !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Não consegui abrir essa foto."));
    img.src = url;
  });
}

/** Garante a fonte Inter carregada antes de desenhar (evita fallback feio). */
export async function ensureFonts() {
  try {
    const f = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!f) return;
    await Promise.all([f.load("700 42px Inter"), f.load("900 72px Inter"), f.load("400 28px Inter")]);
    await f.ready;
  } catch {
    /* fonte de sistema serve */
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, handle: string) {
  ctx.textAlign = "left";
  ctx.font = font(700, 32);
  ctx.fillStyle = STORY_TPL.ink;
  ctx.fillText("nutri", 60, H - 80);
  const w = ctx.measureText("nutri").width;
  ctx.font = font("italic 700", 32);
  ctx.fillStyle = STORY_TPL.gold;
  ctx.fillText("ON", 60 + w + 2, H - 80);

  ctx.font = font(400, 18);
  ctx.fillStyle = STORY_TPL.dim;
  ctx.fillText(`@${handle.replace(/^@/, "")}`, 60, H - 50);
}

/** Regra de ouro do overlay: m\u00e1x 10 palavras, 2 linhas, sem hashtag nem CTA. */
export function validarOverlay(texto: string): { valido: boolean; motivo?: string } {
  const limpo = (texto || "").trim();
  const palavras = limpo.split(/\s+/).filter(Boolean).length;
  if (palavras > 10) return { valido: false, motivo: `Overlay tem ${palavras} palavras. M\u00e1ximo: 10.` };
  if (limpo.includes("#")) return { valido: false, motivo: "Sem hashtag no overlay." };
  return { valido: true };
}

/** Corta o overlay pro limite visual: remove hashtags e trunca em 10 palavras. */
export function encurtarOverlay(texto: string, maxPalavras = 10): string {
  const limpo = (texto || "").replace(/#\S+/g, "").replace(/\s+/g, " ").trim();
  const palavras = limpo.split(" ").filter(Boolean);
  if (palavras.length <= maxPalavras) return limpo;
  return palavras.slice(0, maxPalavras).join(" ").replace(/[,;:\s]+$/, "") + ".";
}

function templateFrase(ctx: CanvasRenderingContext2D, texto: string, subtexto?: string) {
  const frase = encurtarOverlay(texto);
  const y = H * 0.68;
  const maxWidth = W - 120;

  // Mede: se cabe em 1 linha, vai ainda maior; sen\u00e3o quebra em 2.
  ctx.font = font(900, 72);
  ctx.fillStyle = STORY_TPL.ink;
  if (ctx.measureText(frase).width <= maxWidth) {
    ctx.fillText(frase, 60, y);
  } else {
    ctx.font = font(900, 64);
    wrapText(ctx, frase, 60, y, maxWidth, 76);
  }

  if (subtexto) {
    const sub = encurtarOverlay(subtexto, 5);
    ctx.font = font(300, 28);
    ctx.fillStyle = "#cccccc";
    ctx.fillText(sub, 60, y + 90);
  }
}

function templateDado(ctx: CanvasRenderingContext2D, d: NonNullable<StoryTexts["dado"]>) {
  const cardY = H * 0.55;
  ctx.font = font(700, 16);
  ctx.fillStyle = STORY_TPL.gold;
  ctx.fillText("NEXUS-BIO", 70, cardY - 30);

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  roundRect(ctx, 50, cardY, 980, 320, 16);
  ctx.fillStyle = STORY_TPL.gold;
  ctx.fillRect(50, cardY, 4, 320);

  ctx.font = font(900, 72);
  ctx.fillStyle = STORY_TPL.gold;
  ctx.fillText(d.numero || "—", 80, cardY + 95);

  ctx.font = font(400, 28);
  ctx.fillStyle = STORY_TPL.ink;
  wrapText(ctx, d.descricao || "", 80, cardY + 155, 920, 36);

  if (d.fonte) {
    ctx.font = font("italic 300", 20);
    ctx.fillStyle = STORY_TPL.dim;
    ctx.fillText(d.fonte, 80, cardY + 285);
  }
}

function templateRotina(ctx: CanvasRenderingContext2D, r: NonNullable<StoryTexts["rotina"]>) {
  ctx.font = font(300, 24);
  ctx.fillStyle = STORY_TPL.ink;
  ctx.fillText(`${r.hora || ""} · ${r.dia || ""}`.trim(), 60, H * 0.05 + 40);

  const cardY = H * 0.62;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  roundRect(ctx, 40, cardY, 1000, 350, 16);

  ctx.font = font(700, 30);
  ctx.fillStyle = STORY_TPL.ink;
  ctx.fillText(r.nome || "Treino de hoje", 70, cardY + 55);

  ctx.font = font(400, 22);
  ctx.fillStyle = STORY_TPL.muted;
  ctx.fillText(r.detalhes || "", 70, cardY + 95);

  ctx.fillStyle = STORY_TPL.gold;
  ctx.fillRect(70, cardY + 125, 40, 2);

  ctx.font = font(400, 26);
  ctx.fillStyle = STORY_TPL.ink;
  wrapText(ctx, r.frase || "", 70, cardY + 180, 920, 34);
}

function templateCta(ctx: CanvasRenderingContext2D, pergunta: string) {
  const cardY = H * 0.58;
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  roundRect(ctx, 40, cardY, 1000, 420, 16);

  ctx.font = font(700, 38);
  ctx.fillStyle = STORY_TPL.ink;
  wrapText(ctx, pergunta || "Qual pilar te trava?", 80, cardY + 70, 900, 48);

  ctx.textAlign = "center";
  ctx.font = font(900, 44);
  const cx = W / 2;
  ctx.fillStyle = STORY_TPL.gold;
  ctx.fillText("M", cx - 110, cardY + 210);
  ctx.fillStyle = "#555555";
  ctx.fillText("·", cx - 55, cardY + 210);
  ctx.fillStyle = STORY_TPL.green;
  ctx.fillText("C", cx, cardY + 210);
  ctx.fillStyle = "#555555";
  ctx.fillText("·", cx + 55, cardY + 210);
  ctx.fillStyle = STORY_TPL.purple;
  ctx.fillText("E", cx + 110, cardY + 210);

  ctx.fillStyle = STORY_TPL.gold;
  roundRect(ctx, 140, cardY + 262, 800, 70, 10);
  ctx.font = font(700, 24);
  ctx.fillStyle = "#0A0A0A";
  ctx.fillText("DIAGNÓSTICO MCE GRATUITO", cx, cardY + 306);

  ctx.font = font(400, 18);
  ctx.fillStyle = STORY_TPL.muted;
  ctx.fillText("14 perguntas · 4 minutos", cx, cardY + 362);
  ctx.textAlign = "left";
}

function templateMinimo(ctx: CanvasRenderingContext2D, frase: string) {
  ctx.font = font(500, 34);
  ctx.fillStyle = STORY_TPL.ink;
  wrapText(ctx, frase, 70, H * 0.7, 940, 44);
}

/** Compõe o story final: foto + gradiente + template + assinatura. */
export function renderPhotoStory(
  photo: HTMLImageElement,
  template: PhotoTemplate,
  texts: StoryTexts,
  handle = "diogo.mell0",
): string {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = STORY_TPL.bg;
  ctx.fillRect(0, 0, W, H);

  const scale = Math.max(W / photo.width, H / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  ctx.drawImage(photo, (W - dw) / 2, (H - dh) / 2, dw, dh);

  const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.3, "rgba(0,0,0,0.4)");
  grad.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // leve escurecimento no topo pra legibilidade de hora/dia
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.25);
  top.addColorStop(0, "rgba(0,0,0,0.55)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H * 0.25);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  if (template === "FRASE") templateFrase(ctx, texts.frase || "", texts.subtexto);
  else if (template === "DADO") templateDado(ctx, texts.dado || {});
  else if (template === "ROTINA") templateRotina(ctx, texts.rotina || {});
  else if (template === "CTA") templateCta(ctx, texts.cta?.pergunta || "Qual pilar te trava?");
  else templateMinimo(ctx, texts.minimo || "");

  drawFooter(ctx, handle);
  return canvas.toDataURL("image/png");
}

/** Textos padrão — usados enquanto a geração não volta ou se ela falhar. */
export const defaultStoryTexts = (tema: string): StoryTexts => {
  const agora = new Date();
  const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return {
    frase: "Transformação é sistema. Não é motivação.",
    dado: {
      numero: "—",
      descricao: `Gere o texto para trazer o dado científico sobre ${tema}.`,
      fonte: "",
    },
    rotina: {
      hora: `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`,
      dia: dias[agora.getDay()],
      nome: "Treino de hoje",
      detalhes: tema,
      frase: "Feito é melhor que perfeito. Todo dia.",
    },
    cta: { pergunta: "Qual pilar te trava?" },
    minimo: "Terminado. Nem sempre bonito.",
  };
};
