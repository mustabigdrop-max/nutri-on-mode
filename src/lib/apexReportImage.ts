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
}

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

const sectionTitle = (label: string, accent: string) =>
  `<div style="display:flex;align-items:center;gap:14px;margin:34px 0 18px 0">
     <div style="width:56px;height:5px;border-radius:3px;background:${accent}"></div>
     <div style="font-size:26px;font-weight:800;letter-spacing:6px;color:${accent}">${esc(label)}</div>
   </div>`;

const buildHtml = (data: ApexReportData, mode: ApexReportMode, photo: string | null) => {
  const accent = data.accent || CYAN;
  const compact = mode === "instagram";
  const isClient = mode === "client";

  const photoBlock = photo
    ? `<div style="border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:#07070c;
                  height:${mode === "coach" ? 760 : compact ? 420 : 560}px;display:flex;align-items:center;justify-content:center">
         <img src="${photo}" style="max-width:100%;max-height:100%;object-fit:contain" />
       </div>`
    : `<div style="border-radius:28px;border:1px dashed rgba(255,255,255,0.16);height:${compact ? 240 : 320}px;
                  display:flex;align-items:center;justify-content:center;color:${DIM};font-size:24px">
         Análise APEX · nutriON
       </div>`;

  const deviations = (isClient ? data.deviations.slice(0, 4) : data.deviations.slice(0, 6))
    .map(
      (d) => `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
        <div style="width:14px;height:14px;border-radius:50%;background:${severityColor(d.severity_label || d.severity)}"></div>
        <div style="flex:1;font-size:30px;font-weight:600">${esc(d.name)}</div>
        ${
          isClient
            ? ""
            : `<div style="font-size:24px;font-weight:800;color:${severityColor(d.severity_label || d.severity)}">${esc(
                d.severity_label || "",
              )}</div>`
        }
      </div>`,
    )
    .join("");

  const scores = data.scores
    .slice(0, 4)
    .map(
      (s) => `
      <div style="flex:1;text-align:center">
        <div style="font-size:${compact ? 46 : 58}px;font-weight:900;color:${accent}">${esc(s.value)}</div>
        <div style="font-size:22px;color:${DIM};letter-spacing:3px;text-transform:uppercase">${esc(s.label)}</div>
        <div style="height:8px;border-radius:4px;background:rgba(255,255,255,0.1);margin-top:10px">
          <div style="height:8px;border-radius:4px;background:${accent};width:${Math.max(
            0,
            Math.min(100, (Number(s.value) || 0) * 10),
          )}%"></div>
        </div>
      </div>`,
    )
    .join("");

  const clientLists = `
    ${
      data.strengths?.length
        ? sectionTitle("PONTOS FORTES", "#1DB87A") +
          data.strengths
            .slice(0, 3)
            .map((s) => `<div style="font-size:30px;margin-bottom:12px">✅ ${esc(s)}</div>`)
            .join("")
        : ""
    }
    ${
      data.attentions?.length
        ? sectionTitle("ATENÇÃO", "#FFB800") +
          data.attentions
            .slice(0, 2)
            .map((s) => `<div style="font-size:30px;margin-bottom:12px">⚠️ ${esc(s)}</div>`)
            .join("")
        : ""
    }`;

  const verdict = isClient
    ? data.clientSummary
      ? `<div style="font-size:28px;line-height:1.45;color:rgba(255,255,255,0.85)">${esc(data.clientSummary)}</div>`
      : ""
    : `<div style="font-size:28px;line-height:1.5;color:rgba(255,255,255,0.85)">
         BF est: ${esc(data.bfEstimated ?? "--")}% · Meta: ${esc(data.bfTarget ?? "--")}% · Semanas: ${esc(
           data.weeks ?? "--",
         )}<br/>
         Prioridade: ${esc(data.priority || "--")}
       </div>`;

  return `
    <div style="display:flex;flex-direction:column;height:100%">
      <div>
        <div style="font-size:${compact ? 34 : 40}px;font-weight:900;letter-spacing:5px">APEX INTELLIGENCE SYSTEM</div>
        <div style="font-size:24px;color:${accent};letter-spacing:4px;margin-top:6px">
          Análise Visual · nutriON${data.categoryLabel && !isClient ? ` · ${esc(data.categoryLabel)}` : ""}
        </div>
      </div>

      <div style="margin-top:28px">${photoBlock}</div>

      ${isClient ? clientLists : sectionTitle("DIAGNÓSTICO", accent) + deviations}

      ${!isClient && data.scores.length ? sectionTitle("SCORES", accent) + `<div style="display:flex;gap:24px">${scores}</div>` : ""}

      ${verdict ? sectionTitle("VEREDICTO", accent) + verdict : ""}

      <div style="margin-top:auto;padding-top:36px;border-top:1px solid rgba(255,255,255,0.1)">
        <div style="font-size:32px;font-weight:900">Coach Diogo Mello</div>
        <div style="font-size:24px;color:${DIM};margin-top:4px">Nutrition &amp; Business Coach 🇺🇸 · nutrion.app.br</div>
        <div style="font-size:22px;color:${accent};margin-top:8px;letter-spacing:3px">TRANSFORMAÇÃO É SISTEMA.</div>
      </div>
    </div>`;
};

export async function generateApexReport(data: ApexReportData, mode: ApexReportMode): Promise<string> {
  const { w, h } = DIMENSIONS[mode];
  const photo = data.photoUrl ? await toDataUrl(data.photoUrl) : null;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${w}px`;
  container.style.height = `${h}px`;
  container.style.background = BG;
  container.style.padding = "64px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "'Rajdhani', 'Space Grotesk', Arial, sans-serif";
  container.style.color = "#FFFFFF";
  container.innerHTML = buildHtml(data, mode, photo);

  document.body.appendChild(container);
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(container, {
      width: w,
      height: h,
      scale: 1,
      backgroundColor: BG,
      useCORS: true,
      logging: false,
    });
    return canvas.toDataURL("image/png", 1.0);
  } finally {
    container.remove();
  }
}

export const downloadApexReport = (dataUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
