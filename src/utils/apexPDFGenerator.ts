import jsPDF from "jspdf";

// ─── Página A4 (mm) ──────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const COL_W = PAGE_W - MARGIN * 2;

// ─── Paleta nutriON ──────────────────────────────────────────────
const C = {
  bg:        "#0A0A0F",
  gold:      "#B8922A",
  goldLight: "#F5D485",
  white:     "#FFFFFF",
  gray1:     "#F0EDE6",
  gray2:     "#9E9B94",
  gray3:     "#3A3A42",
  red:       "#EF4444",
  yellow:    "#FBBF24",
  green:     "#34D399",
  panel:     "#13131A",
};

// ─── Helpers de cor ──────────────────────────────────────────────
const fill = (pdf: jsPDF, hex: string) => pdf.setFillColor(hex);
const text = (pdf: jsPDF, hex: string) => pdf.setTextColor(hex);
const draw = (pdf: jsPDF, hex: string) => pdf.setDrawColor(hex);

function severityColor(graus: number): string {
  const g = Math.abs(graus);
  if (g <= 0.5) return C.green;
  if (g <= 2)   return C.yellow;
  return C.red;
}

// ─── Interfaces públicas ─────────────────────────────────────────
export interface AchadoClinico {
  titulo: string;
  graus?: number;
  dominante?: string;
  inibido?: string;
  correcao?: string;
  severityColor?: string;
}

export interface ApexPDFData {
  atleta?: {
    nome?: string;
    categoria?: string;
    coach?: string;
  };
  achados: AchadoClinico[];
  qualityScore?: number;     // 0..1
  plumbSource?: string;      // 'C7+L5' | 'C7' | 'L5' | 'frame-center'
}

// ─── Background ──────────────────────────────────────────────────
function drawPageBackground(pdf: jsPDF) {
  fill(pdf, C.bg);
  pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
}

// ─── Header ──────────────────────────────────────────────────────
function drawHeader(pdf: jsPDF, _data: ApexPDFData): number {
  fill(pdf, C.panel);
  pdf.rect(0, 0, PAGE_W, 28, "F");

  draw(pdf, C.gold);
  pdf.setLineWidth(0.3);
  pdf.line(0, 28, PAGE_W, 28);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  text(pdf, C.white);
  pdf.text("nutri", MARGIN, 17);
  const nutriW = pdf.getTextWidth("nutri");
  text(pdf, C.gold);
  pdf.text("ON", MARGIN + nutriW, 17);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  text(pdf, C.gray2);
  pdf.text("APEX VISUAL INTELLIGENCE", MARGIN, 23);

  const dataStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const dataW = pdf.getTextWidth(dataStr);
  pdf.text(dataStr, PAGE_W - MARGIN - dataW, 23);

  return 36;
}

// ─── Dados do atleta ─────────────────────────────────────────────
function drawAtletaInfo(pdf: jsPDF, data: ApexPDFData, y: number): number {
  fill(pdf, C.panel);
  draw(pdf, C.gray3);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(MARGIN, y, COL_W, 22, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  text(pdf, C.gray1);
  pdf.text(data.atleta?.nome ?? "Atleta", MARGIN + 6, y + 8);

  draw(pdf, C.gold);
  pdf.setLineWidth(0.4);
  pdf.line(MARGIN + 6, y + 11, MARGIN + 6 + 28, y + 11);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  text(pdf, C.gray2);

  const meta = [
    data.atleta?.categoria ?? "",
    data.atleta?.coach ? `Coach: ${data.atleta.coach}` : "",
    `Análise: ${new Date().toLocaleDateString("pt-BR")}`,
  ].filter(Boolean).join("   ·   ");

  pdf.text(meta, MARGIN + 6, y + 17);

  return y + 28;
}

// ─── Barra de qualidade ──────────────────────────────────────────
function drawQualityBar(pdf: jsPDF, data: ApexPDFData, y: number): number {
  const score = data.qualityScore ?? 0.70;
  const pct = Math.round(score * 100);
  const cor = pct >= 85 ? C.green : pct >= 65 ? C.yellow : C.red;
  const label = pct >= 85 ? "Análise confiável"
              : pct >= 65 ? "Análise aceitável"
              : "Reenviar foto";

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  text(pdf, C.gray2);
  pdf.text("QUALIDADE DA ANÁLISE", MARGIN, y + 4);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  text(pdf, cor);
  pdf.text(`${label}  ${pct}%`, MARGIN + 38, y + 4);

  fill(pdf, C.gray3);
  pdf.rect(MARGIN, y + 6, COL_W, 2, "F");

  fill(pdf, cor);
  pdf.rect(MARGIN, y + 6, COL_W * (pct / 100), 2, "F");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  text(pdf, C.gray2);
  pdf.text(`Linha de prumo: ${data.plumbSource ?? "frame-center"}`, MARGIN, y + 13);

  return y + 18;
}

// ─── Título de seção ─────────────────────────────────────────────
function drawSectionTitle(pdf: jsPDF, titulo: string, y: number): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  text(pdf, C.gold);
  pdf.text(titulo, MARGIN, y + 4);

  draw(pdf, C.gold);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN, y + 6, PAGE_W - MARGIN, y + 6);

  return y + 12;
}

// ─── Achado clínico (card) ───────────────────────────────────────
function drawAchadoCard(pdf: jsPDF, achado: AchadoClinico, y: number): number {
  const cor = achado.severityColor ?? severityColor(achado.graus ?? 0);
  const correcaoTxt = achado.correcao ?? "";
  const correcaoLinhas = pdf.splitTextToSize(`→ ${correcaoTxt}`, COL_W - 12);
  const cardH = 22 + correcaoLinhas.length * 3.5;

  fill(pdf, C.panel);
  draw(pdf, C.gray3);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(MARGIN, y, COL_W, cardH, 1.5, 1.5, "FD");

  // Borda esquerda colorida
  fill(pdf, cor);
  pdf.rect(MARGIN, y, 1.5, cardH, "F");

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  text(pdf, C.gray1);
  pdf.text(achado.titulo, MARGIN + 6, y + 6);

  // Badge de graus
  const grauStr = `${(achado.graus ?? 0).toFixed(1)}°`;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  const grauW = pdf.getTextWidth(grauStr) + 4;
  fill(pdf, C.panel);
  draw(pdf, cor);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(PAGE_W - MARGIN - grauW - 2, y + 2, grauW, 5, 1, 1, "FD");
  text(pdf, cor);
  pdf.text(grauStr, PAGE_W - MARGIN - grauW, y + 5.8);

  // Separador
  draw(pdf, C.gray3);
  pdf.setLineWidth(0.1);
  pdf.line(MARGIN + 6, y + 9, PAGE_W - MARGIN - 4, y + 9);

  // Dominante / Inibido
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  text(pdf, C.gray2);
  pdf.text(`Dominante: ${achado.dominante ?? "—"}`, MARGIN + 6, y + 14);
  pdf.text(`Inibido: ${achado.inibido ?? "—"}`, MARGIN + 6, y + 19);

  // Correção
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7);
  text(pdf, C.gray2);
  pdf.text(correcaoLinhas, MARGIN + 6, y + 23);

  return y + cardH + 4;
}

// ─── Achados ─────────────────────────────────────────────────────
function drawAchadosSection(pdf: jsPDF, data: ApexPDFData, y: number): number {
  y = drawSectionTitle(pdf, `ACHADOS CLÍNICOS (${data.achados.length})`, y);

  if (!data.achados.length) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    text(pdf, C.gray2);
    pdf.text("Nenhum achado relevante registrado.", MARGIN, y + 4);
    return y + 10;
  }

  for (const achado of data.achados) {
    if (y > PAGE_H - 50) {
      pdf.addPage();
      drawPageBackground(pdf);
      y = MARGIN + 8;
    }
    y = drawAchadoCard(pdf, achado, y);
  }

  return y;
}

// ─── Prescrição corretiva ────────────────────────────────────────
function drawPrescricaoSection(pdf: jsPDF, data: ApexPDFData, y: number): number {
  y = drawSectionTitle(pdf, "PRESCRIÇÃO CORRETIVA", y);

  const itens = data.achados
    .filter((a) => (a.correcao ?? "").trim().length > 0)
    .map((a) => ({ titulo: a.titulo, correcao: a.correcao ?? "" }));

  if (!itens.length) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    text(pdf, C.gray2);
    pdf.text("Sem prescrição corretiva específica para esta análise.", MARGIN, y + 4);
    return y + 10;
  }

  // Renderizar item-a-item com paginação (cada item desenha seu próprio card)
  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];
    const linhas = pdf.splitTextToSize(item.correcao, COL_W - 16);
    const itemH = 7 + linhas.length * 4 + 4;

    if (y + itemH > PAGE_H - 20) {
      pdf.addPage();
      drawPageBackground(pdf);
      y = MARGIN + 8;
    }

    // Card individual
    fill(pdf, C.panel);
    draw(pdf, C.gold);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(MARGIN, y, COL_W, itemH, 2, 2, "FD");

    // Borda dourada esquerda
    fill(pdf, C.gold);
    pdf.rect(MARGIN, y, 1.5, itemH, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    text(pdf, C.gold);
    pdf.text(item.titulo, MARGIN + 6, y + 5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    text(pdf, C.gray2);
    pdf.text(linhas, MARGIN + 6, y + 10);

    y += itemH + 3;
  }

  return y + 4;
}

// ─── Footer (em todas as páginas) ────────────────────────────────
function drawFooterAllPages(pdf: jsPDF, _data: ApexPDFData) {
  const totalPages = pdf.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    draw(pdf, C.gold);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    text(pdf, C.gray2);
    pdf.text("nutriON · APEX Visual Intelligence · nutrion.app.br", MARGIN, PAGE_H - 7);

    const tag = "Transformação é sistema.";
    const tagW = pdf.getTextWidth(tag);
    text(pdf, C.gold);
    pdf.text(tag, (PAGE_W - tagW) / 2, PAGE_H - 7);

    const pg = `${i} / ${totalPages}`;
    const pgW = pdf.getTextWidth(pg);
    text(pdf, C.gray2);
    pdf.text(pg, PAGE_W - MARGIN - pgW, PAGE_H - 7);
  }
}

// ─── Função pública ──────────────────────────────────────────────
export async function generateApexPDF(data: ApexPDFData): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawPageBackground(pdf);
  let y = drawHeader(pdf, data);
  y = drawAtletaInfo(pdf, data, y);
  y = drawQualityBar(pdf, data, y);
  y = drawAchadosSection(pdf, data, y);

  if (y > PAGE_H - 60) {
    pdf.addPage();
    drawPageBackground(pdf);
    y = MARGIN + 8;
  }

  y = drawPrescricaoSection(pdf, data, y);
  drawFooterAllPages(pdf, data);

  const nome = (data.atleta?.nome ?? "atleta").replace(/\s+/g, "_");
  const dataStr = new Date().toISOString().split("T")[0];
  pdf.save(`APEX_${nome}_${dataStr}.pdf`);
}
