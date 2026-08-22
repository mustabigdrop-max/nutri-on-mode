import jsPDF from "jspdf";
import { PILLAR_DATA, type PillarKey } from "@/data/mceData";

const DEMO_URL = "https://nutrion.app.br/demo";
const MCE_URL = "https://nutrion.app.br/mce";

export function exportMceReport(scores: Record<PillarKey, number>) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const total = Math.round((scores.M + scores.C + scores.E) / 3);
  const phase = total < 25 ? "RECONSTRUÇÃO" : total < 50 ? "REPROGRAMAÇÃO" : total < 75 ? "ACELERAÇÃO" : "OTIMIZAÇÃO";
  const authors = Object.values(PILLAR_DATA).flatMap((pillar) => pillar.authors);

  doc.setFillColor(3, 3, 10);
  doc.rect(0, 0, width, 148, "F");
  doc.setTextColor(232, 160, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NUTRION · MCE METHOD", 42, 42);
  doc.setTextColor(245, 240, 232);
  doc.setFontSize(28);
  doc.text("Relatório MCE", 42, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(205, 205, 205);
  doc.text("Mentalidade · Comportamento · Execução", 42, 100);
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")} · Coach Diogo Mello`, 42, 120);

  let y = 184;
  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Diagnóstico atual", 42, y);
  y += 22;

  const scoreRows: Array<{ key: PillarKey; label: string; rgb: [number, number, number] }> = [
    { key: "M", label: "Mentalidade", rgb: [147, 51, 234] },
    { key: "C", label: "Comportamento", rgb: [0, 160, 115] },
    { key: "E", label: "Execução", rgb: [210, 137, 18] },
  ];
  scoreRows.forEach(({ key, label, rgb }) => {
    doc.setFillColor(238, 238, 238);
    doc.roundedRect(42, y, 360, 12, 4, 4, "F");
    doc.setFillColor(...rgb);
    doc.roundedRect(42, y, Math.max(12, 360 * scores[key] / 100), 12, 4, 4, "F");
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${key} · ${label}`, 418, y + 10);
    doc.text(`${scores[key]}/100`, 552, y + 10, { align: "right" });
    y += 32;
  });

  doc.setFillColor(245, 241, 231);
  doc.roundedRect(42, y + 2, width - 84, 48, 4, 4, "F");
  doc.setTextColor(110, 78, 10);
  doc.setFontSize(12);
  doc.text(`MCE SCORE ${total}/100 · FASE ${phase}`, 58, y + 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("O score orienta prioridades comportamentais e não substitui avaliação clínica.", 58, y + 40);
  y += 82;

  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Base científica", 42, y);
  y += 20;
  doc.setFontSize(8);
  const columnWidth = 254;
  const authorsTop = y;
  authors.forEach((author, index) => {
    const column = index >= 9 ? 1 : 0;
    const row = index % 9;
    const x = 42 + column * columnWidth;
    const rowY = authorsTop + row * 28;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(35, 35, 35);
    doc.text(`${index + 1}. ${author.name} · ${author.year}`, x, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(95, 95, 95);
    doc.text(`${author.concept} — ${author.book}`.slice(0, 48), x, rowY + 11);
  });
  y = authorsTop + 9 * 28 + 8;

  y += 14;
  doc.setDrawColor(232, 160, 32);
  doc.line(42, y, width - 42, y);
  y += 25;
  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Experimente a demonstração", 42, y);
  y += 20;
  doc.setTextColor(35, 105, 160);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.textWithLink("Abrir demo MCE", 42, y, { url: DEMO_URL });
  doc.textWithLink("Abrir MCE completo", 160, y, { url: MCE_URL });
  y += 30;
  doc.setTextColor(65, 65, 65);
  doc.setFont("helvetica", "bold");
  doc.text('“Transformação é sistema.” — Coach Diogo Mello', 42, y);

  doc.save(`relatorio-mce-${new Date().toISOString().slice(0, 10)}.pdf`);
}