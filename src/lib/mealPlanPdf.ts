import jsPDF from "jspdf";

interface PlanItem {
  day_index: number;
  meal_type: string;
  food_name: string;
  portion: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MEAL_LABELS: Record<string, string> = {
  cafe_manha: "Café da manhã",
  lanche_manha: "Lanche AM",
  almoco: "Almoço",
  lanche_tarde: "Lanche PM",
  jantar: "Jantar",
  ceia: "Ceia",
};
const MEAL_ORDER = ["cafe_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"];

export function exportMealPlanPDF(opts: {
  items: PlanItem[];
  weekRange: string;
  patientName?: string;
  nutriEliteMeta?: any;
  enrichment?: Record<string, any>;
}) {
  const { items, weekRange, patientName, nutriEliteMeta, enrichment } = opts;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 36;
  let y = M;

  // Header band
  doc.setFillColor(232, 160, 32);
  doc.rect(0, 0, W, 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("nutriON · NutriPlan Elite", M, 36);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(weekRange, W - M, 36, { align: "right" });
  y = 80;

  doc.setTextColor(20, 20, 20);
  if (patientName) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Atleta: ${patientName}`, M, y);
    y += 18;
  }

  // TDEE block
  if (nutriEliteMeta) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(232, 160, 32);
    doc.text("TDEE Farmacológico", M, y); y += 14;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Fórmula: ${nutriEliteMeta.formula_tmb || "—"} · TMB ${nutriEliteMeta.tmb || "—"} kcal · Fator ${nutriEliteMeta.fator_atividade || "—"}`, M, y); y += 12;
    doc.text(`TDEE Bruto ${nutriEliteMeta.tdee_bruto || "—"} kcal → Ajustado ${nutriEliteMeta.tdee_ajustado || "—"} kcal (×${(nutriEliteMeta.multiplicador_farmacologico || 1).toFixed(2)})`, M, y); y += 12;
    if (nutriEliteMeta.compostos_ativos?.length) {
      doc.text(`Compostos: ${nutriEliteMeta.compostos_ativos.join(", ")}`, M, y, { maxWidth: W - 2 * M }); y += 14;
    }
    if (nutriEliteMeta.modo_especial && nutriEliteMeta.modo_especial !== "padrao") {
      doc.setFont("helvetica", "bold");
      doc.text(`Modo: ${String(nutriEliteMeta.modo_especial).toUpperCase()}`, M, y); y += 14;
      doc.setFont("helvetica", "normal");
    }
    y += 4;
  }

  // Per-day blocks
  for (let d = 0; d < 7; d++) {
    const dayItems = items.filter(i => i.day_index === d)
      .sort((a, b) => MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type));
    if (!dayItems.length) continue;

    if (y > H - 120) { doc.addPage(); y = M; }

    // Day header bar
    doc.setFillColor(20, 20, 20);
    doc.rect(M, y, W - 2 * M, 22, "F");
    doc.setTextColor(232, 160, 32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(DAYS[d], M + 8, y + 15);
    const totals = dayItems.reduce(
      (s, i) => ({ k: s.k + i.kcal, p: s.p + i.protein_g, c: s.c + i.carbs_g, g: s.g + i.fat_g }),
      { k: 0, p: 0, c: 0, g: 0 }
    );
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${Math.round(totals.k)} kcal · P${Math.round(totals.p)} · C${Math.round(totals.c)} · G${Math.round(totals.g)}`,
      W - M - 8, y + 15, { align: "right" }
    );
    y += 30;

    doc.setTextColor(20, 20, 20);
    for (const m of dayItems) {
      if (y > H - 60) { doc.addPage(); y = M; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(232, 160, 32);
      doc.text(MEAL_LABELS[m.meal_type] || m.meal_type, M, y);
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "normal");
      doc.text(`${m.kcal} kcal · P${m.protein_g} C${m.carbs_g} G${m.fat_g}`, W - M, y, { align: "right" });
      y += 12;
      doc.setFontSize(10);
      doc.text(m.food_name, M, y, { maxWidth: W - 2 * M }); y += 12;
      if (m.portion) {
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text(m.portion, M, y, { maxWidth: W - 2 * M }); y += 10;
        doc.setTextColor(20, 20, 20);
      }
      const enr = enrichment?.[`${d}-${m.meal_type}`];
      if (enr) {
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        if (enr.funcao_metabolica) { doc.text(`◆ ${enr.funcao_metabolica}`, M + 6, y, { maxWidth: W - 2 * M - 6 }); y += 9; }
        if (enr.janela_metabolica) { doc.text(`◷ ${enr.janela_metabolica}`, M + 6, y, { maxWidth: W - 2 * M - 6 }); y += 9; }
        if (enr.protocolo_peri_workout) { doc.text(`⚡ ${enr.protocolo_peri_workout}`, M + 6, y, { maxWidth: W - 2 * M - 6 }); y += 9; }
        if (enr.mensagem_mce) { doc.text(`MCE: ${enr.mensagem_mce}`, M + 6, y, { maxWidth: W - 2 * M - 6 }); y += 9; }
        doc.setTextColor(20, 20, 20);
      }
      y += 4;
    }
    y += 6;
  }

  // Footer on each page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`nutriON · O comportamento vem antes do alimento. · Página ${i}/${pages}`, W / 2, H - 16, { align: "center" });
  }

  doc.save(`nutriplan-${weekRange.replace(/[^\d]/g, "-")}.pdf`);
}
