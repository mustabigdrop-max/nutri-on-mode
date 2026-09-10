/**
 * Template NEXUS-BIO "TECH CIENTÍFICO" — variante opcional do carrossel
 * científico (1080x1350). Identidade: fundo #020205, grade sutil, ciano
 * #00D4FF + dourado #B8922A, tipografia Rajdhani / Space Mono e barra
 * dourada na base. O slide de mecanismo vira um DIAGRAMA DINÂMICO:
 * entradas reais da ficha (via, dose estudada) → nó central (composto) →
 * etapas do mecanismo → saída (tradução leiga). Nada é inventado: o
 * diagrama só usa os dados gerados a partir das fontes reais do Vault.
 *
 * Mesma ordem/quantidade de slides do template clássico — os rótulos de
 * `nexusSlideLabels` continuam válidos.
 */

import { chunk, limitWords, slideContentBottom } from "@/lib/slideBase";
import {
  MAX_BENEFICIOS_SLIDE,
  MAX_BENEFICIOS_TOTAL,
  MAX_LINHAS_RESUMO,
  MAX_PALAVRAS_PASSO,
  MAX_PASSOS,
  MAX_PERGUNTAS_SLIDE,
  MAX_PERGUNTAS_TOTAL,
  MAX_RISCOS_SLIDE,
  MAX_RISCOS_TOTAL,
  NEXUS_CTA_SLIDE,
  NEXUS_STATUS_COLOR,
  type NexusBeneficio,
  type NexusCarouselContent,
  type NexusEvidencia,
  type NexusRisco,
  type NexusStatus,
} from "@/lib/nexusCarouselTemplate";

export const TECH_TPL = {
  bg: "#020205",
  ink: "#FFFFFF",
  soft: "rgba(255,255,255,0.55)",
  muted: "rgba(255,255,255,0.38)",
  cyan: "#00D4FF",
  gold: "#B8922A",
  card: "rgba(255,255,255,0.02)",
} as const;

const W = 1080;
const H = 1350;
const PAD = 60;
const FOOTER_H = 90;

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

const headFont = (weight: number, size: number) =>
  `${weight} ${size}px Rajdhani, Inter, system-ui, sans-serif`;
const monoFont = (weight: number, size: number) =>
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
const drawRich = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  o: { size: number; weight: number; color: string; accent?: string; lineHeight?: number; maxWidth: number; family?: "head" | "mono" },
) => {
  const lh = o.size * (o.lineHeight ?? 1.4);
  const fontFor = (hi: boolean) =>
    o.family === "mono" ? monoFont(o.weight, o.size) : headFont(hi ? 700 : o.weight, o.size);
  const words: Token[] = [];
  for (const token of tokenize(text)) {
    for (const word of token.text.split(/\s+/)) if (word) words.push({ text: word, hi: token.hi });
  }
  // quebra tokens maiores que a linha (URLs etc.)
  const broken: Token[] = [];
  for (const word of words) {
    ctx.font = fontFor(word.hi);
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
    ctx.font = fontFor(word.hi);
    const w = ctx.measureText(`${word.text} `).width;
    if (width + w > o.maxWidth && lines[lines.length - 1].length) {
      lines.push([word]);
      width = w;
    } else {
      lines[lines.length - 1].push(word);
      width += w;
    }
  }
  let cursorY = y;
  for (const line of lines) {
    let cursorX = x;
    for (const word of line) {
      ctx.font = fontFor(word.hi);
      ctx.fillStyle = word.hi ? o.accent || TECH_TPL.cyan : o.color;
      ctx.fillText(word.text, cursorX, cursorY);
      cursorX += ctx.measureText(`${word.text} `).width;
    }
    cursorY += lh;
  }
  return cursorY;
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/** Fundo tech: grade + brilhos radiais ciano/dourado + cantos. */
const techBackground = (ctx: CanvasRenderingContext2D, seed = 1) => {
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

  // anéis orbitais estáticos (a versão animada vive só no HTML de referência)
  ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.05);
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.3, 250, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = rgba(TECH_TPL.gold, 0.04);
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.35, 330, 0, Math.PI * 2);
  ctx.stroke();

  // cantos
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
const techFooter = (ctx: CanvasRenderingContext2D, handle: string) => {
  const y = H - FOOTER_H;
  ctx.fillStyle = TECH_TPL.gold;
  ctx.fillRect(0, y, W, FOOTER_H);
  ctx.font = headFont(700, 20);
  ctx.fillStyle = TECH_TPL.bg;
  ctx.textBaseline = "middle";
  ctx.fillText("TRANSFORMAÇÃO É SISTEMA.", PAD, y + FOOTER_H / 2);
  ctx.font = monoFont(400, 13);
  ctx.globalAlpha = 0.65;
  const hdl = `@${handle.replace(/^@/, "")}`;
  ctx.fillText(`nutriON  ·  ${hdl}`, W - PAD - ctx.measureText(`nutriON  ·  ${hdl}`).width, y + FOOTER_H / 2);
  ctx.globalAlpha = 1;
  ctx.textBaseline = "alphabetic";
};

/** Header: eyebrow mono + título grande + linha gradiente. */
const techHeader = (ctx: CanvasRenderingContext2D, eyebrow: string, title: string, subtitle?: string) => {
  let y = 110;
  ctx.font = monoFont(400, 14);
  ctx.fillStyle = rgba(TECH_TPL.cyan, 0.7);
  const label = eyebrow.toUpperCase();
  let lx = PAD;
  for (const ch of label) {
    ctx.fillText(ch, lx, y);
    lx += ctx.measureText(ch).width + 6;
  }
  y += 20;
  const end = drawRich(ctx, title.toUpperCase(), PAD, y + 62, {
    size: 62, weight: 700, color: TECH_TPL.ink, accent: TECH_TPL.cyan, lineHeight: 1.05, maxWidth: W - PAD * 2,
  });
  y = end + 10;
  if (subtitle) {
    ctx.font = headFont(500, 22);
    ctx.fillStyle = TECH_TPL.muted;
    ctx.fillText(subtitle.toUpperCase(), PAD, y + 22);
    y += 40;
  }
  // linha gradiente ciano → dourado
  const g = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.35, TECH_TPL.cyan);
  g.addColorStop(0.65, TECH_TPL.gold);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(PAD, y + 12, W - PAD * 2, 2);
  return y + 40;
};

const statusPill = (ctx: CanvasRenderingContext2D, status: NexusStatus) => {
  const color = NEXUS_STATUS_COLOR[status] === "#5DCAA5" ? TECH_TPL.cyan : NEXUS_STATUS_COLOR[status] === "#EF9F27" ? TECH_TPL.gold : NEXUS_STATUS_COLOR[status];
  ctx.font = monoFont(700, 13);
  const tw = ctx.measureText(status).width;
  const bw = tw + 36;
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
  ctx.fillText(status, x + 18, y + bh / 2 + 1);
  ctx.textBaseline = "alphabetic";
};

const contentBottom = () => H - FOOTER_H - 40;

const newSlide = (status: NexusStatus, seed: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  ctx.save();
  techBackground(ctx, seed);
  statusPill(ctx, status);
  ctx.beginPath();
  ctx.rect(0, 0, W, contentBottom() + 20);
  ctx.clip();
  return { canvas, ctx };
};

/** Card com borda lateral colorida (estilo info-card do HTML de referência). */
const infoCard = (
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

const EVID_FILL: Record<NexusEvidencia, number> = { FORTE: 1, MODERADA: 0.62, PRELIMINAR: 0.32 };

/** Slide de diagrama dinâmico: entradas → nó central → etapas → saída. */
const drawMechanismDiagram = (
  ctx: CanvasRenderingContext2D,
  content: NexusCarouselContent,
  startY: number,
) => {
  const cx = W / 2;
  const f = content.slide2_ficha || {};
  const passos = (content.slide3_mecanismo?.passos || [])
    .slice(0, MAX_PASSOS)
    .map((p) => limitWords(p, MAX_PALAVRAS_PASSO));
  let y = startY + 10;

  // entradas laterais (somente dados reais da ficha)
  const inputs: { label: string; value: string; side: "left" | "right" }[] = [];
  if (f.via) inputs.push({ label: "VIA", value: f.via, side: "left" });
  if (f.dose_estudada) inputs.push({ label: "DOSE ESTUDADA", value: f.dose_estudada, side: "right" });
  if (f.meia_vida) inputs.push({ label: "MEIA-VIDA", value: f.meia_vida, side: "left" });

  const nodeY = y + 90;
  for (const input of inputs.slice(0, 3)) {
    const left = input.side === "left";
    const tx = left ? PAD : W - PAD;
    ctx.font = monoFont(700, 12);
    ctx.fillStyle = left ? rgba(TECH_TPL.cyan, 0.75) : rgba(TECH_TPL.gold, 0.75);
    ctx.textAlign = left ? "left" : "right";
    ctx.fillText(input.label, tx, nodeY - 38);
    ctx.font = headFont(500, 18);
    ctx.fillStyle = TECH_TPL.soft;
    ctx.fillText(limitWords(input.value, 5), tx, nodeY - 16);
    // seta para o nó central
    ctx.strokeStyle = left ? rgba(TECH_TPL.cyan, 0.45) : rgba(TECH_TPL.gold, 0.45);
    ctx.lineWidth = 1.2;
    ctx.setLineDash(input.side === "right" ? [6, 4] : []);
    ctx.beginPath();
    ctx.moveTo(left ? PAD + 130 : W - PAD - 130, nodeY - 10);
    ctx.lineTo(left ? cx - 95 : cx + 95, nodeY - 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = "left";
  }

  // nó central — composto / via ativada
  ctx.beginPath();
  ctx.arc(cx, nodeY, 88, 0, Math.PI * 2);
  ctx.fillStyle = rgba(TECH_TPL.cyan, 0.04);
  ctx.fill();
  ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, nodeY, 66, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.25);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = monoFont(700, 17);
  ctx.fillStyle = TECH_TPL.cyan;
  ctx.fillText(limitWords(content.composto, 2).toUpperCase().slice(0, 16), cx, nodeY - 4);
  ctx.font = headFont(500, 14);
  ctx.fillStyle = rgba(TECH_TPL.cyan, 0.75);
  ctx.fillText("VIA ATIVADA", cx, nodeY + 18);
  ctx.textAlign = "left";
  y = nodeY + 110;

  // etapas do mecanismo como nós em cascata
  passos.forEach((passo, i) => {
    // seta do nó anterior
    ctx.strokeStyle = rgba(TECH_TPL.cyan, 0.4);
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, y - 22);
    ctx.lineTo(cx, y + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = rgba(TECH_TPL.cyan, 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - 6, y + 4);
    ctx.lineTo(cx + 6, y + 4);
    ctx.lineTo(cx, y + 14);
    ctx.closePath();
    ctx.fill();

    const boxW = W - PAD * 2 - 120;
    const bx = cx - boxW / 2;
    const top = y + 16;
    const end = drawRich(ctx, passo, bx + 26, top + 36, {
      size: 22, weight: 500, color: TECH_TPL.ink, accent: TECH_TPL.cyan, lineHeight: 1.4, maxWidth: boxW - 52,
    });
    const boxH = Math.max(76, end - top + 16);
    const color = i % 2 === 0 ? TECH_TPL.cyan : TECH_TPL.gold;
    infoCard(ctx, bx, top, boxW, boxH, color);
    // marcador circular (sem numeração decorativa)
    ctx.beginPath();
    ctx.arc(bx + 26, top + 30, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    y = top + boxH + 26;
  });

  // barra de saída — tradução leiga
  const saida = limitWords(content.slide3_mecanismo?.traducao_leiga || "", 18);
  if (saida && y + 90 < contentBottom()) {
    const bw = W - PAD * 2 - 60;
    const bx = cx - bw / 2;
    const top = y + 10;
    const end = drawRich(ctx, saida, bx + 24, top + 34, {
      size: 19, weight: 500, color: TECH_TPL.gold, accent: TECH_TPL.gold, lineHeight: 1.4, maxWidth: bw - 48,
    });
    roundRect(ctx, bx, top, bw, end - top + 14, 6);
    ctx.fillStyle = rgba(TECH_TPL.gold, 0.05);
    ctx.fill();
    ctx.strokeStyle = rgba(TECH_TPL.gold, 0.4);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = monoFont(400, 11);
    ctx.fillStyle = rgba(TECH_TPL.gold, 0.6);
    ctx.fillText("EM LINGUAGEM SIMPLES", bx + 24, top - 8);
  }
};

/**
 * Renderiza o carrossel NEXUS-BIO no estilo TECH CIENTÍFICO.
 * Assíncrono porque aguarda Rajdhani / Space Mono carregarem.
 */
export const renderNexusTechCarousel = async (content: NexusCarouselContent): Promise<string[]> => {
  await ensureTechFonts();
  const handle = (content.handle || "diogo.mell0").replace(/^@/, "");
  const status: NexusStatus = (["APROVADO", "PESQUISA", "EXPERIMENTAL"] as const).includes(content.slide1_status)
    ? content.slide1_status
    : "PESQUISA";
  const vault =
    content.origem === "MicrobiotaVault"
      ? "NEXUS-BIO · MICROBIOTA"
      : content.origem === "SteroidVault"
        ? "NEXUS-BIO · ESTERÓIDES"
        : "NEXUS-BIO · PEPTÍDEOS";
  const out: string[] = [];
  const C = TECH_TPL.cyan;
  const G = TECH_TPL.gold;
  const maxW = W - PAD * 2;

  // 1 — CAPA
  {
    const { canvas, ctx } = newSlide(status, 0.6);
    let y = 150;
    ctx.font = monoFont(400, 14);
    ctx.fillStyle = rgba(C, 0.7);
    ctx.fillText(vault, PAD, y);
    y += 130;
    y = drawRich(ctx, content.composto.toUpperCase(), PAD, y, {
      size: 96, weight: 700, color: TECH_TPL.ink, accent: C, lineHeight: 1.02, maxWidth: maxW,
    });
    ctx.font = headFont(500, 26);
    ctx.fillStyle = C;
    ctx.fillText((content.slide1_classe || "").toUpperCase(), PAD, y + 18);
    y += 110;
    drawRich(ctx, content.slide1_gancho, PAD, y, {
      size: 34, weight: 500, color: TECH_TPL.soft, accent: G, lineHeight: 1.45, maxWidth: maxW,
    });
    ctx.font = monoFont(700, 15);
    ctx.fillStyle = C;
    ctx.fillText("ARRASTA PRA CIÊNCIA ▸", PAD, contentBottom() - 10);
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 2 — FICHA TÉCNICA (grade 2x de info-cards)
  {
    const { canvas, ctx } = newSlide(status, 1.2);
    let y = techHeader(ctx, "FICHA TÉCNICA", content.composto, content.slide1_classe);
    const f = content.slide2_ficha || {};
    const rows: [string, string][] = (
      [
        ["CLASSE", f.classe || content.slide1_classe],
        ["MEIA-VIDA", f.meia_vida || ""],
        ["VIA", f.via || ""],
        ["APROVAÇÃO FDA", f.aprovacao_fda || ""],
        ["ANVISA", f.anvisa || ""],
        ["DOSE ESTUDADA", f.dose_estudada || ""],
        ["FABRICANTE / FONTE", f.fabricante || ""],
      ] as [string, string][]
    ).filter(([, v]) => v);

    const colW = (maxW - 16) / 2;
    let cy = y;
    rows.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx0 = PAD + col * (colW + 16);
      const top = cy + row * 0; // altura medida abaixo
      void top;
      void label;
      void value;
      void cx0;
    });
    // mede alturas por linha (maior card da linha define o passo)
    for (let r = 0; r < rows.length; r += 2) {
      const par = rows.slice(r, r + 2);
      let rowH = 0;
      const medidas = par.map(([label, value]) => {
        const probe = document.createElement("canvas").getContext("2d")!;
        const end = drawRich(probe, value, 0, 0, {
          size: 20, weight: 500, color: TECH_TPL.ink, lineHeight: 1.35, maxWidth: colW - 48,
        });
        const h = 76 + end;
        rowH = Math.max(rowH, h);
        return { label, value, h };
      });
      medidas.forEach((m, i) => {
        const cx0 = PAD + i * (colW + 16);
        const color = (r / 2 + i) % 2 === 0 ? C : G;
        infoCard(ctx, cx0, cy, colW, rowH, color);
        ctx.font = monoFont(700, 12);
        ctx.fillStyle = color;
        ctx.fillText(m.label, cx0 + 24, cy + 34);
        drawRich(ctx, m.value, cx0 + 24, cy + 66, {
          size: 20, weight: 500, color: TECH_TPL.ink, accent: color, lineHeight: 1.35, maxWidth: colW - 48,
        });
      });
      cy += rowH + 16;
      if (cy > contentBottom() - 120) break;
    }

    // nível de evidência
    const evid: NexusEvidencia = (["FORTE", "MODERADA", "PRELIMINAR"] as const).includes(
      f.nivel_evidencia as NexusEvidencia,
    )
      ? (f.nivel_evidencia as NexusEvidencia)
      : "PRELIMINAR";
    if (cy + 90 < contentBottom()) {
      ctx.font = monoFont(700, 12);
      ctx.fillStyle = C;
      ctx.fillText("NÍVEL DE EVIDÊNCIA", PAD + 4, cy + 22);
      const barW = maxW - 8;
      roundRect(ctx, PAD + 4, cy + 36, barW, 10, 5);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fill();
      roundRect(ctx, PAD + 4, cy + 36, barW * EVID_FILL[evid], 10, 5);
      ctx.fillStyle = evid === "FORTE" ? C : G;
      ctx.fill();
      ctx.font = headFont(700, 24);
      ctx.fillStyle = evid === "FORTE" ? C : G;
      ctx.fillText(evid, PAD + 4, cy + 84);
      if (f.num_estudos) {
        ctx.font = headFont(500, 18);
        ctx.fillStyle = TECH_TPL.muted;
        ctx.fillText(f.num_estudos, PAD + 4 + ctx.measureText(evid).width + 24, cy + 84);
      }
    }
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 3 — MECANISMO (diagrama dinâmico)
  {
    const { canvas, ctx } = newSlide(status, 2.1);
    const y = techHeader(ctx, "COMO FUNCIONA", "O mecanismo", content.composto);
    drawMechanismDiagram(ctx, content, y);
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 4 — BENEFÍCIOS (máx. 2 por slide)
  const grupos = chunk((content.slide4_beneficios || []).slice(0, MAX_BENEFICIOS_TOTAL), MAX_BENEFICIOS_SLIDE);
  if (!grupos.length) grupos.push([]);
  grupos.forEach((grupo: NexusBeneficio[], gi: number) => {
    const { canvas, ctx } = newSlide(status, 3.3);
    let y = techHeader(ctx, gi === 0 ? "O QUE A CIÊNCIA MOSTRA" : "O QUE A CIÊNCIA MOSTRA · CONTINUAÇÃO", "Benefícios medidos");
    for (const b of grupo) {
      const top = y;
      ctx.font = headFont(700, 64);
      ctx.fillStyle = C;
      ctx.fillText(b.numero || "•", PAD + 24, top + 78);
      let cyy = drawRich(ctx, b.desc || "", PAD + 24, top + 112, {
        size: 22, weight: 500, color: TECH_TPL.ink, accent: C, lineHeight: 1.45, maxWidth: maxW - 48,
      });
      const fonte = [b.estudo, b.n].filter(Boolean).join(" · ");
      if (fonte) {
        ctx.font = monoFont(400, 12);
        ctx.fillStyle = TECH_TPL.muted;
        ctx.fillText(limitWords(fonte, 12), PAD + 24, cyy + 14);
        cyy += 26;
      }
      infoCard(ctx, PAD, top, maxW, cyy - top + 18, C);
      y = cyy + 36;
    }
    ctx.font = monoFont(400, 12);
    ctx.fillStyle = TECH_TPL.muted;
    ctx.fillText("Dados dos estudos citados. Resultados variam entre indivíduos.", PAD, contentBottom() - 8);
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  });

  // 5 — RISCOS (máx. 3 por slide)
  const gruposRiscos = chunk((content.slide5_riscos || []).slice(0, MAX_RISCOS_TOTAL), MAX_RISCOS_SLIDE);
  if (!gruposRiscos.length) gruposRiscos.push([]);
  gruposRiscos.forEach((grupoRisco: NexusRisco[], ri: number) => {
    const { canvas, ctx } = newSlide(status, 4.5);
    let y = techHeader(ctx, ri === 0 ? "O OUTRO LADO" : "O OUTRO LADO · CONTINUAÇÃO", "Riscos e limites");
    for (const r of grupoRisco) {
      const top = y;
      let end = drawRich(ctx, r.risco || "", PAD + 28, top + 40, {
        size: 22, weight: 600, color: TECH_TPL.ink, accent: G, lineHeight: 1.45, maxWidth: maxW - 56,
      });
      if (r.contexto) {
        end = drawRich(ctx, `→ ${r.contexto}`, PAD + 28, end + 6, {
          size: 18, weight: 500, color: TECH_TPL.muted, lineHeight: 1.5, maxWidth: maxW - 56,
        });
      }
      infoCard(ctx, PAD, top, maxW, end - top + 16, G);
      ctx.font = headFont(700, 20);
      ctx.fillStyle = G;
      ctx.fillText("✕", PAD + 28, top + 0 + 40);
      // redesenha o texto por cima do marcador deslocado
      y = end + 34;
    }
    if (content.slide5_nao_indicado && ri === gruposRiscos.length - 1 && y + 120 < contentBottom()) {
      const top = y + 6;
      const end = drawRich(ctx, content.slide5_nao_indicado, PAD + 28, top + 56, {
        size: 20, weight: 500, color: TECH_TPL.soft, accent: G, lineHeight: 1.5, maxWidth: maxW - 56,
      });
      infoCard(ctx, PAD, top, maxW, end - top + 18, G);
      ctx.font = monoFont(700, 12);
      ctx.fillStyle = G;
      ctx.fillText("NÃO É INDICADO PARA", PAD + 28, top + 34);
    }
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  });

  // 6 — COMPARATIVO (opcional)
  if (content.slide6_tabela?.length && content.slide6_comparativo_nome) {
    const { canvas, ctx } = newSlide(status, 5.2);
    let y = techHeader(ctx, "COMPARATIVO", `${content.composto} vs ${content.slide6_comparativo_nome}`);
    const labelW = 200;
    const colW = (maxW - labelW) / 2;
    const c1X = PAD + labelW;
    const c2X = c1X + colW;

    roundRect(ctx, PAD, y, maxW, 52, 8);
    ctx.fillStyle = rgba(C, 0.08);
    ctx.fill();
    ctx.font = headFont(700, 20);
    ctx.fillStyle = C;
    ctx.fillText(content.composto.slice(0, 18).toUpperCase(), c1X + 16, y + 33);
    ctx.fillStyle = G;
    ctx.fillText(content.slide6_comparativo_nome.slice(0, 18).toUpperCase(), c2X + 16, y + 33);
    y += 52;

    for (const row of content.slide6_tabela.slice(0, 6)) {
      const top = y;
      ctx.font = monoFont(700, 12);
      ctx.fillStyle = TECH_TPL.muted;
      ctx.fillText((row.criterio || "").toUpperCase().slice(0, 16), PAD + 6, top + 34);
      const e1 = drawRich(ctx, row.composto1 || "—", c1X + 16, top + 34, {
        size: 19, weight: 500, color: TECH_TPL.ink, accent: C, lineHeight: 1.4, maxWidth: colW - 32,
      });
      const e2 = drawRich(ctx, row.composto2 || "—", c2X + 16, top + 34, {
        size: 19, weight: 500, color: TECH_TPL.soft, accent: G, lineHeight: 1.4, maxWidth: colW - 32,
      });
      y = Math.max(top + 56, Math.max(e1, e2) + 14);
      ctx.strokeStyle = rgba(C, 0.07);
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      if (y > contentBottom() - 60) break;
    }
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 7 — PRA QUEM FAZ SENTIDO (duas colunas)
  {
    const { canvas, ctx } = newSlide(status, 6.1);
    const y = techHeader(ctx, "NA PRÁTICA", "Pra quem faz sentido");
    const colW = (maxW - 24) / 2;
    const col = (x0: number, titulo: string, itens: string[], color: string, marker: string) => {
      let cyy = y;
      ctx.font = monoFont(700, 13);
      ctx.fillStyle = color;
      ctx.fillText(titulo, x0, cyy + 20);
      cyy += 46;
      for (const item of (itens || []).slice(0, 4)) {
        const top = cyy;
        const end = drawRich(ctx, item, x0 + 18, top + 34, {
          size: 19, weight: 500, color: TECH_TPL.ink, accent: color, lineHeight: 1.45, maxWidth: colW - 42,
        });
        infoCard(ctx, x0, top, colW, end - top + 14, color);
        ctx.font = headFont(700, 18);
        ctx.fillStyle = color;
        ctx.fillText(marker, x0 + 18 - 10, top + 34);
        cyy = end + 28;
        if (cyy > contentBottom() - 80) break;
      }
    };
    col(PAD, "PODE FAZER SENTIDO SE", content.slide7_faz_sentido || [], C, "✓");
    col(PAD + colW + 24, "NÃO FAZ SENTIDO SE", content.slide7_nao_faz_sentido || [], G, "✕");
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 8 — PERGUNTAS PRO MÉDICO (máx. 3 por slide)
  const gruposPerguntas = chunk(
    (content.slide8_perguntas_medico || []).slice(0, MAX_PERGUNTAS_TOTAL),
    MAX_PERGUNTAS_SLIDE,
  );
  if (!gruposPerguntas.length) gruposPerguntas.push([]);
  gruposPerguntas.forEach((grupoPergunta: string[], qi: number) => {
    const { canvas, ctx } = newSlide(status, 7.4);
    let y = techHeader(ctx, qi === 0 ? "LEVE PRO SEU MÉDICO" : "LEVE PRO SEU MÉDICO · CONTINUAÇÃO", "Perguntas certas");
    grupoPergunta.forEach((q, i) => {
      const top = y;
      const end = drawRich(ctx, `“${q}”`, PAD + 28, top + 44, {
        size: 22, weight: 500, color: TECH_TPL.ink, accent: C, lineHeight: 1.45, maxWidth: maxW - 56,
      });
      infoCard(ctx, PAD, top, maxW, end - top + 18, i % 2 === 0 ? C : G);
      ctx.beginPath();
      ctx.arc(PAD + 28, top + 38, 5, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? C : G;
      ctx.fill();
      y = end + 34;
    });
    ctx.font = monoFont(400, 12);
    ctx.fillStyle = TECH_TPL.muted;
    ctx.fillText("Salva esse slide e leva na consulta.", PAD, contentBottom() - 8);
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  });

  // 9 — RESUMO
  {
    const { canvas, ctx } = newSlide(status, 8.8);
    let y = techHeader(ctx, "EM RESUMO", content.composto);
    const r = content.slide9_resumo || ({} as NexusCarouselContent["slide9_resumo"]);
    const linhas: [string, string, string][] = [
      ["O QUE É", r.oque, C],
      ["BENEFÍCIO", r.beneficio, C],
      ["RISCO", r.risco, G],
      ["EVIDÊNCIA", r.evidencia || "PRELIMINAR", G],
      ["CUSTO", r.custo || "", C],
    ];
    for (const [label, value, color] of linhas.filter(([, v]) => v).slice(0, MAX_LINHAS_RESUMO)) {
      ctx.font = monoFont(700, 12);
      ctx.fillStyle = color;
      ctx.fillText(label, PAD + 4, y + 16);
      y = drawRich(ctx, value, PAD + 4, y + 48, {
        size: 21, weight: 500, color: TECH_TPL.ink, accent: color, lineHeight: 1.45, maxWidth: maxW - 8,
      });
      y += 22;
      if (y > contentBottom() - 140) break;
    }
    if (r.veredicto && y + 90 < contentBottom()) {
      const vTop = y + 6;
      const vEnd = drawRich(ctx, r.veredicto, PAD + 28, vTop + 30, {
        size: 26, weight: 700, color: G, accent: G, lineHeight: 1.4, maxWidth: maxW - 56,
      });
      ctx.fillStyle = G;
      ctx.fillRect(PAD + 4, vTop + 12, 4, vEnd - vTop - 20);
    }
    techFooter(ctx, handle);
    out.push(canvas.toDataURL("image/png"));
  }

  // 10 — CTA (fundo dourado invertido)
  {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = G;
    ctx.fillRect(0, 0, W, H);
    // grade escura sutil
    ctx.strokeStyle = "rgba(2,2,5,0.05)";
    for (let gx = 0; gx <= W; gx += 40) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += 40) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
    let y = 150;
    ctx.font = monoFont(400, 14);
    ctx.fillStyle = "rgba(2,2,5,0.55)";
    ctx.fillText(vault, PAD, y);
    y += 130;
    y = drawRich(ctx, NEXUS_CTA_SLIDE.titulo.toUpperCase(), PAD, y, {
      size: 72, weight: 700, color: TECH_TPL.bg, lineHeight: 1.05, maxWidth: maxW,
    });
    y += 30;
    y = drawRich(ctx, NEXUS_CTA_SLIDE.subtitulo, PAD, y, {
      size: 28, weight: 500, color: "rgba(2,2,5,0.7)", lineHeight: 1.4, maxWidth: maxW,
    });
    y += 50;
    roundRect(ctx, PAD, y, maxW, 110, 12);
    ctx.fillStyle = TECH_TPL.bg;
    ctx.fill();
    ctx.font = headFont(700, 30);
    ctx.fillStyle = G;
    ctx.fillText(NEXUS_CTA_SLIDE.caixa, PAD + 30, y + 48);
    ctx.font = monoFont(400, 15);
    ctx.fillStyle = TECH_TPL.soft;
    ctx.fillText(NEXUS_CTA_SLIDE.caixaSub, PAD + 30, y + 82);
    drawRich(ctx, NEXUS_CTA_SLIDE.disclaimer, PAD, H - FOOTER_H - 60, {
      size: 17, weight: 500, color: "rgba(2,2,5,0.6)", lineHeight: 1.4, maxWidth: maxW,
    });
    // barra escura na base (invertida)
    ctx.fillStyle = TECH_TPL.bg;
    ctx.fillRect(0, H - FOOTER_H, W, FOOTER_H);
    ctx.font = headFont(700, 20);
    ctx.fillStyle = G;
    ctx.textBaseline = "middle";
    ctx.fillText("TRANSFORMAÇÃO É SISTEMA.", PAD, H - FOOTER_H / 2);
    ctx.font = monoFont(400, 13);
    ctx.fillStyle = TECH_TPL.soft;
    const hdl = `nutriON  ·  @${handle}`;
    ctx.fillText(hdl, W - PAD - ctx.measureText(hdl).width, H - FOOTER_H / 2);
    ctx.textBaseline = "alphabetic";
    out.push(canvas.toDataURL("image/png"));
  }

  return out;
};
