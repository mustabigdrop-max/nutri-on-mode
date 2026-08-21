// APEX — Modo Apresentação: gera cards PNG compartilháveis da análise visual.
// 3 modos: coach (Stories 1080x1920), client (Feed 4:5), instagram (1080x1080).

export type ApexReportMode = "coach" | "client" | "instagram";

export interface ApexReportDeviation {
  name: string;
  severity_label?: string;
  severity?: "leve" | "moderado" | "severo" | "ok";
}

export interface ApexReportData {
  athleteName?: string;
  categoryLabel?: string;
  photoUrl?: string | null;
  deviations: ApexReportDeviation[];
  scores: { label: string; value: number }[];
  bfEstimated?: string | number | null;
  bfTarget?: string | number | null;
  weeks?: string | number | null;
  priority?: string | null;
  clientSummary?: string;
  strengths?: string[];
  attentions?: string[];
  accent?: string;
  /* Template customizável */
  title?: string;
  coachName?: string;
  coachSubtitle?: string;
  handle?: string;
  bg?: string;
  watermark?: boolean;
}

export interface ApexPalette {
  key: string;
  label: string;
  accent: string;
  bg: string;
}

export const APEX_PALETTES: ApexPalette[] = [
  { key: "cyan", label: "APEX Cyan", accent: "#00D4FF", bg: "#020205" },
  { key: "amber", label: "nutriON Amber", accent: "#E8A020", bg: "#03030a" },
  { key: "emerald", label: "Lab Emerald", accent: "#4ade80", bg: "#0a0f0a" },
  { key: "violet", label: "VERTEX Violet", accent: "#9080ff", bg: "#050310" },
  { key: "light", label: "Clean Light", accent: "#0B7CA8", bg: "#F4F6F8" },
];

const BG = "#020205";
const CYAN = "#00D4FF";
const DIM = "rgba(255,255,255,0.55)";

const DIMENSIONS: Record<ApexReportMode, { w: number; h: number }> = {
  coach: { w: 1080, h: 1920 },
  client: { w: 1080, h: 1350 },
  instagram: { w: 1080, h: 1080 },
};


const severityColor = (s?: string) => {
  const v = String(s || "").toLowerCase();
  if (/sever|alto|crít|critic/.test(v)) return "#FF5C5C";
  if (/moder/.test(v)) return "#FFB800";
  if (/leve/.test(v)) return "#FFD166";
  return "#1DB87A";
};

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Converte uma URL de imagem em dataURL para evitar canvas "tainted" no html2canvas. */
const toDataUrl = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const sectionTitle = (label: string, accent: string, tight = false) =>
  `<div style="display:flex;align-items:center;gap:14px;margin:${tight ? "18px 0 12px 0" : "34px 0 18px 0"}">
     <div style="width:${tight ? 40 : 56}px;height:5px;border-radius:3px;background:${accent}"></div>
     <div style="font-size:${tight ? 22 : 26}px;font-weight:800;letter-spacing:${tight ? 4 : 6}px;color:${accent}">${esc(label)}</div>
   </div>`;

const isLightBg = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
};

/** Converte labels técnicos (DESVIO, IMPACTO_PALCO) em português limpo. */
const LABEL_MAP: Record<string, string> = {
  DESVIO: "Desvio detectado",
  DOMINANTE: "Músculo dominante",
  INIBIDO: "Músculo inibido",
  "IMPACTO PALCO": "Impacto no palco",
  "IMPACTO NO PALCO": "Impacto no palco",
  IMPACTO: "Impacto no palco",
  "CONEXAO FARMACOLOGICA": "Conexão farmacológica",
  URGENCIA: "Urgência",
};

export const prettyLabel = (raw: string) => {
  const clean = String(raw || "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const norm = (t: string) =>
    t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
  const sentence = (t: string) => {
    const v = t === t.toUpperCase() && /[A-Z]{4,}/.test(t) ? t.toLowerCase() : t;
    return v.charAt(0).toUpperCase() + v.slice(1);
  };
  const direct = LABEL_MAP[norm(clean)];
  if (direct) return direct;
  // "DESVIO: paravertebrais cervicais" -> "Desvio detectado: paravertebrais cervicais"
  const m = /^([A-Za-zÀ-ÿ ]+):\s*(.+)$/.exec(clean);
  if (m) {
    const mapped = LABEL_MAP[norm(m[1])];
    if (mapped) return `${mapped}: ${sentence(m[2].trim())}`;
  }
  return sentence(clean);
};

/** Escala o corpo de texto conforme o comprimento, evitando corte/overflow. */
const fitSize = (text: string, base: number, min = 20) => {
  const len = String(text || "").length;
  if (len <= 26) return base;
  if (len <= 40) return Math.max(min, base - 4);
  if (len <= 60) return Math.max(min, base - 8);
  return min;
};

const scoreColor = (v: number) => (v >= 8 ? "#00FF88" : v >= 6 ? "#FFB800" : "#FF4444");

/** Bolinha de severidade (círculo CSS — emoji não renderiza no html2canvas). */
const severityDot = (s: string | undefined, size: number) => {
  const v = String(s || "").toLowerCase();
  const col = /sever|alto|crít|critic/.test(v)
    ? "#FF4444"
    : /moder|leve|médi|medi|aten/.test(v)
      ? "#FFB800"
      : "#00FF88";
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${col};flex:none;margin-top:${Math.round(
    size * 0.45,
  )}px;box-shadow:0 0 12px ${col}80"></div>`;
};

const buildHtml = (data: ApexReportData, mode: ApexReportMode, photo: string | null) => {
  const accent = data.accent || CYAN;
  const bg = data.bg || BG;
  const light = isLightBg(bg);
  const fg = light ? "#0B0B10" : "#FFFFFF";
  const soft = light ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.85)";
  const dim = light ? "rgba(0,0,0,0.5)" : DIM;
  const line = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.1)";
  const compact = mode === "instagram";
  const isClient = mode === "client";
  const title = data.title || "APEX INTELLIGENCE SYSTEM";
  const coachName = data.coachName || "Coach Diogo Mello";
  const coachSubtitle = data.coachSubtitle || "Nutrition & Business Coach · USA";
  const handle = data.handle || "nutrion.app.br";

  // Foto: no máximo 40% da altura do card (menos no quadrado, que tem menos espaço).
  const ratio = mode === "coach" ? 0.38 : mode === "client" ? 0.34 : 0.24;
  const photoH = Math.round(DIMENSIONS[mode].h * ratio);

  const photoBlock = photo
    ? `<div style="border-radius:28px;overflow:hidden;border:1px solid ${line};background:${light ? "#E9ECEF" : "#07070c"};
                  height:${photoH}px;display:flex;align-items:center;justify-content:center;position:relative">
         <img src="${photo}" style="max-width:100%;max-height:100%;object-fit:contain" />
       </div>`
    : `<div style="border-radius:28px;border:1px dashed ${line};height:${compact ? 200 : 260}px;
                  display:flex;align-items:center;justify-content:center;color:${dim};font-size:24px">
         Análise APEX · nutriON
       </div>`;

  const devLimit = compact ? 3 : isClient ? 4 : 6;
  const devItems = data.deviations.slice(0, devLimit).map((d) => ({
    label: prettyLabel(d.name),
    sev: String(d.severity_label || d.severity || ""),
  }));
  const devSize = fitSize(
    devItems.reduce((a, b) => (b.label.length > a.length ? b.label : a), ""),
    compact ? 23 : 30,
    compact ? 18 : 20,
  );
  const deviations = devItems
    .map(
      (d) => `
      <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:${compact ? 11 : 16}px">
        ${severityDot(d.sev, compact ? 13 : 16)}
        <div style="flex:1;min-width:0;font-size:${devSize}px;font-weight:600;line-height:1.35;
                    word-break:break-word;overflow-wrap:anywhere">${esc(d.label)}</div>
        ${
          isClient || !d.sev
            ? ""
            : `<div style="max-width:32%;text-align:right;font-size:${Math.max(
                compact ? 16 : 18,
                devSize - 8,
              )}px;font-weight:800;line-height:1.3;word-break:break-word;overflow-wrap:anywhere;color:${severityColor(
                d.sev,
              )}">${esc(prettyLabel(d.sev))}</div>`
        }
      </div>`,
    )
    .join("");

  const scores = data.scores
    .slice(0, compact ? 4 : 6)
    .map((s) => {
      const v = Math.max(0, Math.min(10, Number(s.value) || 0));
      const col = scoreColor(v);
      const label = prettyLabel(s.label);
      return `
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:${compact ? 10 : 14}px">
        <div style="flex:1;min-width:0;font-size:${fitSize(label, compact ? 21 : 26, compact ? 17 : 19)}px;font-weight:700;
                    letter-spacing:1px;line-height:1.25;word-break:break-word;overflow-wrap:anywhere">${esc(label)}</div>
        <div style="width:${compact ? 220 : 280}px;height:${compact ? 11 : 14}px;border-radius:7px;background:${line};overflow:hidden;flex:none">
          <div style="height:${compact ? 11 : 14}px;border-radius:7px;background:${col};width:${v * 10}%"></div>
        </div>
        <div style="width:${compact ? 76 : 88}px;flex:none;text-align:right;font-size:${compact ? 23 : 30}px;font-weight:900;color:${col}">${v}<span style="font-size:20px;color:${dim}">/10</span></div>
      </div>`;
    })
    .join("");

  const clientLists = `
    ${
      data.strengths?.length
        ? sectionTitle("PONTOS FORTES", "#00FF88") +
          data.strengths
            .slice(0, 3)
            .map(
              (s) =>
                `<div style="font-size:${fitSize(s, 30, 22)}px;margin-bottom:12px;line-height:1.35;word-break:break-word;display:flex;gap:14px;align-items:flex-start">${severityDot(
                  "ok",
                  16,
                )}<span>${esc(prettyLabel(s))}</span></div>`,
            )
            .join("")
        : ""
    }
    ${
      data.attentions?.length
        ? sectionTitle("ATENÇÃO", "#FFB800") +
          data.attentions
            .slice(0, 2)
            .map(
              (s) =>
                `<div style="font-size:${fitSize(s, 30, 22)}px;margin-bottom:12px;line-height:1.35;word-break:break-word;display:flex;gap:14px;align-items:flex-start">${severityDot(
                  "moderado",
                  16,
                )}<span>${esc(prettyLabel(s))}</span></div>`,
            )
            .join("")
        : ""
    }`;

  const verdictBody = isClient
    ? data.clientSummary
      ? `<div style="font-size:${fitSize(data.clientSummary, 28, 22)}px;line-height:1.45;color:${soft};word-break:break-word">${esc(
          data.clientSummary,
        )}</div>`
      : ""
    : `<div style="font-size:${compact ? 22 : 26}px;line-height:1.5;color:${soft};word-break:break-word">
         <div>BF estimado: <b style="color:${fg}">${esc(data.bfEstimated ?? "--")}%</b> · Meta: <b style="color:${fg}">${esc(
           data.bfTarget ?? "--",
         )}%</b> · Semanas: <b style="color:${fg}">${esc(data.weeks ?? "--")}</b></div>
         <div style="margin-top:10px">Prioridade: <b style="color:${accent}">${esc(prettyLabel(data.priority || "--"))}</b></div>
       </div>`;

  const verdict = verdictBody
    ? `<div style="border-radius:24px;padding:${compact ? "18px 22px" : "26px 28px"};background:rgba(0,212,255,0.05);
                   border:1px solid rgba(0,212,255,0.35);box-shadow:inset 0 0 60px rgba(0,212,255,0.04)">
         ${verdictBody}
       </div>`
    : "";

  return `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;color:${fg}">
      <div>
        <div style="font-size:${compact ? 34 : 40}px;font-weight:900;letter-spacing:5px">${esc(title)}</div>
        <div style="font-size:24px;color:${accent};letter-spacing:4px;margin-top:6px">
          Análise Visual · nutriON${data.categoryLabel && !isClient ? ` · ${esc(data.categoryLabel)}` : ""}
        </div>
      </div>

      <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;min-height:0">
        <div style="margin-top:28px">${photoBlock}</div>

        <div>${isClient ? clientLists : sectionTitle("DIAGNÓSTICO", accent, compact) + deviations}</div>

        <div>${!isClient && data.scores.length ? sectionTitle("SCORES", accent, compact) + scores : ""}</div>

        <div>${verdict ? sectionTitle("VEREDICTO", accent, compact) + verdict : ""}</div>
      </div>

      <div style="padding-top:${compact ? 20 : 36}px;border-top:1px solid ${line}">
        <div style="font-size:${compact ? 27 : 32}px;font-weight:900">${esc(coachName)}</div>
        <div style="font-size:${compact ? 21 : 24}px;color:${dim};margin-top:4px">${esc(coachSubtitle)}</div>
        <div style="font-size:${compact ? 21 : 24}px;color:${fg};margin-top:2px">${esc(handle)}</div>
        <div style="font-size:22px;color:${accent};margin-top:10px;letter-spacing:3px">TRANSFORMAÇÃO É SISTEMA.</div>
      </div>
    </div>`;
};


export async function generateApexReport(data: ApexReportData, mode: ApexReportMode): Promise<string> {
  const { w, h } = DIMENSIONS[mode];
  const photo = data.photoUrl ? await toDataUrl(data.photoUrl) : null;
  const bg = data.bg || BG;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${w}px`;
  container.style.height = `${h}px`;
  container.style.background = bg;
  container.style.padding = "64px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "'Rajdhani', 'Space Grotesk', Arial, sans-serif";
  container.style.color = isLightBg(bg) ? "#0B0B10" : "#FFFFFF";
  container.innerHTML = buildHtml(data, mode, photo);

  document.body.appendChild(container);
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(container, {
      width: w,
      height: h,
      scale: 1,
      backgroundColor: bg,
      useCORS: true,
      logging: false,
    });
    return canvas.toDataURL("image/png", 1.0);
  } finally {
    container.remove();
  }
}

/** Legenda pronta para o pacote de Instagram, usando os dados da última análise. */
export const buildApexInstagramCaption = (data: ApexReportData) => {
  const focus = data.priority ? `Foco das próximas semanas: ${data.priority}.` : "";
  const bf =
    data.bfEstimated != null && data.bfEstimated !== ""
      ? `BF estimado ${data.bfEstimated}%${data.bfTarget ? ` · meta ${data.bfTarget}%` : ""}${
          data.weeks ? ` · ${data.weeks} semanas de plano` : ""
        }.`
      : "";
  const top = (data.strengths || []).slice(0, 2).map((s) => `✅ ${s}`).join("\n");
  const att = (data.attentions || []).slice(0, 2).map((s) => `⚠️ ${s}`).join("\n");
  return [
    "Transformação é sistema. 🔬",
    "",
    `Mais uma análise APEX Visual Intelligence${data.categoryLabel ? ` · ${data.categoryLabel}` : ""}.`,
    bf,
    top,
    att,
    focus,
    "",
    "3 fotos. 47 pontos anatômicos. Scores por segmento, desvios posturais e um protocolo corretivo que já nasce dentro do treino e do plano alimentar.",
    "",
    "Comenta APEX que eu te mostro como funciona na prática.",
    "",
    `${data.coachName || "Coach Diogo Mello"} · @diogo.mell0 · ${data.handle || "nutrion.app.br"}`,
    "#nutricaoesportiva #coaching #transformacao #apex",
  ]
    .filter((l) => l !== "" || true)
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .filter((l) => l !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
};

/** Pacote de Instagram: Story 1080x1920 + legenda pronta. */
export async function generateApexInstagramPackage(data: ApexReportData) {
  const story = await generateApexReport({ ...data }, "coach");
  const feed = await generateApexReport({ ...data }, "instagram");
  return { story, feed, caption: buildApexInstagramCaption(data) };
}

export const downloadApexReport = (dataUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

