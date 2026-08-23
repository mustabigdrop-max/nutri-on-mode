// Reels Studio V2 — exportação de legenda completa (TXT) e geração das 3 telas de Stories

export type ReelExportData = {
  hook?: string;
  template_match?: string;
  roteiro?: Record<string, string>;
  legendas?: { tom: string; texto: string }[];
  hashtags?: string[];
  self_comment?: string;
  melhor_horario?: string;
  stories?: string[];
  produto_sugerido?: string;
  nivel_funil?: string;
};

const SEP = "─".repeat(46);

/** Monta o pacote completo: roteiro + legenda + hashtags + CTA. */
export function buildFullCaption(
  result: ReelExportData,
  opts: { templateName?: string; captionIndex?: number } = {},
): string {
  const cap = result.legendas?.[opts.captionIndex ?? 0];
  const r = result.roteiro || {};
  const cta = r.cta_28_35s || "";
  const lines: string[] = [];

  lines.push("nutriON · SOCIAL ON — REELS STUDIO");
  lines.push("transformação é sistema.");
  if (opts.templateName) lines.push(`Formato: ${opts.templateName}`);
  lines.push(SEP, "", "HOOK", `"${result.hook || "—"}"`, "", SEP, "", "ROTEIRO");
  [
    ["0-2s   HOOK ", r.hook_0_2s],
    ["2-20s  CORPO", r.corpo_2_20s],
    ["20-28s PUNCH", r.punch_20_28s],
    ["28-35s CTA  ", r.cta_28_35s],
  ].forEach(([label, text]) => {
    if (text) lines.push(`${label} | ${text}`);
  });
  if (r.duracao_total) lines.push(`Duração: ${r.duracao_total}`);
  if (r.musica) lines.push(`Música: ${r.musica}`);
  if (r.edicao) lines.push(`Edição: ${r.edicao}`);

  lines.push("", SEP, "", "LEGENDA" + (cap?.tom ? ` (${cap.tom})` : ""), cap?.texto || "—");

  if (cta) lines.push("", SEP, "", "CTA", cta);

  if (result.hashtags?.length) {
    lines.push("", SEP, "", `HASHTAGS (${result.hashtags.length})`, result.hashtags.join(" "));
  }
  if (result.self_comment) lines.push("", SEP, "", "SELF-COMMENT", result.self_comment);
  if (result.stories?.length) {
    lines.push("", SEP, "", "STORIES DE APOIO");
    result.stories.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  }
  if (result.melhor_horario) lines.push("", `Melhor horário: ${result.melhor_horario}`);
  if (result.produto_sugerido) {
    lines.push(`Produto: ${result.produto_sugerido}${result.nivel_funil ? ` (${result.nivel_funil})` : ""}`);
  }

  return lines.join("\n");
}

export function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  triggerDownload(URL.createObjectURL(blob), filename.endsWith(".txt") ? filename : `${filename}.txt`);
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ---------------------------------------------------------------- STORIES

export type StoryScreen = {
  index: number;
  kicker: string;
  title: string;
  body: string;
  footer: string;
  accent: string;
};

/** Deriva as 3 telas de Stories a partir do resultado do Reel. */
export function buildStoryScreens(result: ReelExportData, accent = "#B8922A"): StoryScreen[] {
  const r = result.roteiro || {};
  const custom = result.stories || [];
  return [
    {
      index: 1,
      kicker: "STORY 1 · CHAMADA",
      title: result.hook || custom[0] || "Transformação é sistema.",
      body: custom[0] && custom[0] !== result.hook ? custom[0] : r.hook_0_2s || "",
      footer: "arrasta pra cima · @diogo.mell0",
      accent,
    },
    {
      index: 2,
      kicker: "STORY 2 · VALOR",
      title: r.punch_20_28s || custom[1] || "O que ninguém te contou",
      body: custom[1] || r.corpo_2_20s || "",
      footer: "novo Reel no feed",
      accent: "#00D4FF",
    },
    {
      index: 3,
      kicker: "STORY 3 · CTA",
      title: r.cta_28_35s || custom[2] || "Bora começar hoje.",
      body: custom[2] || result.produto_sugerido || "nutriON · transformação é sistema.",
      footer: "link na bio",
      accent: "#00C896",
    },
  ];
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  text.split("\n").forEach((paragraph) => {
    let line = "";
    paragraph.split(/\s+/).filter(Boolean).forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = word;
      } else line = test;
    });
    if (line) out.push(line);
  });
  return out;
}

/** Renderiza uma tela de Story 1080x1920 e devolve o dataURL. */
export function renderStoryCanvas(screen: StoryScreen, format: "png" | "jpg" = "png"): string {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // fundo
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#050508");
  grad.addColorStop(0.55, "#0a0a12");
  grad.addColorStop(1, "#020205");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // grid sutil
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 90) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += 90) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // barra de destaque
  ctx.fillStyle = screen.accent;
  ctx.fillRect(90, 300, 140, 8);

  // kicker
  ctx.fillStyle = screen.accent;
  ctx.font = "600 34px 'Space Mono', monospace";
  ctx.fillText(screen.kicker, 90, 250);

  // título
  ctx.fillStyle = "#F5F0E8";
  ctx.font = "800 82px 'Rajdhani', sans-serif";
  const titleLines = wrap(ctx, screen.title, W - 180).slice(0, 6);
  let y = 430;
  titleLines.forEach((l) => { ctx.fillText(l, 90, y); y += 96; });

  // corpo
  if (screen.body) {
    ctx.fillStyle = "#A0A0A0";
    ctx.font = "400 40px 'Space Mono', monospace";
    y += 40;
    wrap(ctx, screen.body, W - 180).slice(0, 12).forEach((l) => { ctx.fillText(l, 90, y); y += 58; });
  }

  // rodapé
  ctx.fillStyle = screen.accent;
  ctx.font = "600 36px 'Space Mono', monospace";
  ctx.fillText(screen.footer, 90, H - 190);
  ctx.fillStyle = "#4A4A4A";
  ctx.font = "400 30px 'Space Mono', monospace";
  ctx.fillText("nutriON · transformação é sistema.", 90, H - 130);

  return format === "jpg" ? canvas.toDataURL("image/jpeg", 0.92) : canvas.toDataURL("image/png");
}

export function downloadStory(screen: StoryScreen, format: "png" | "jpg" = "png") {
  const url = renderStoryCanvas(screen, format);
  if (!url) return;
  triggerDownload(url, `story-${screen.index}.${format}`);
}

export function downloadAllStories(screens: StoryScreen[], format: "png" | "jpg" = "png") {
  screens.forEach((s, i) => setTimeout(() => downloadStory(s, format), i * 350));
}
