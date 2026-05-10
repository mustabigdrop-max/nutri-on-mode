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

// Fase G — regras condensadas por modo especial (rendered no topo do PDF Elite)
const MODE_RULES: Record<string, { titulo: string; bullets: string[] }> = {
  competicao: {
    titulo: "🏆 PEAK WEEK — Regras críticas",
    bullets: [
      "Proteína 2,2–2,8 g/kg para preservar massa magra em depleção.",
      "≤3d: carb load 6–8 g/kg + sódio 1,5–2 g + água em rampa descendente 48h.",
      "ZERO fibra insolúvel, crucíferas e lácteos nas últimas 72h.",
      "Creatina 5 g/dia + eletrólitos peri-treino. Monitorar peso/visual diário.",
    ],
  },
  glp1: {
    titulo: "💉 GLP-1 — Anti-sarcopenia",
    bullets: [
      "Proteína 1,8–2,2 g/kg distribuída em ≥5 refeições (proteína listada PRIMEIRO).",
      "Refeições pequenas 200–350 kcal; ZERO frituras; reduzir gordura saturada.",
      "Hidratação +400 ml/dia + eletrólitos; creatina 3–5 g + B12 + multi.",
      "Risco: déficit proteico e perda de massa magra. Comer por horário.",
    ],
  },
  feminino: {
    titulo: "🌸 PROTOCOLO FEMININO — Regras por fase",
    bullets: [
      "Folicular: sensibilidade insulínica alta · carbo 50–55% pré/pós-treino.",
      "Ovulatória: pico estrogênico · antioxidantes · carbo 45–50%.",
      "Lútea: TDEE +5–10% · +100–150 kcal · magnésio 300mg + B6 50mg · reduzir cafeína.",
      "Menstrual: ferro heme + vit C · ômega-3 2g · reduzir volume de treino.",
      "ALERTA RED-S se kcal/kg de massa magra < 30 → revisar antes de prescrever.",
    ],
  },
  vegano: {
    titulo: "🌱 VEGANO — Plant-based completo",
    bullets: [
      "Proteína 1,6–2,0 g/kg combinando leguminosas + cereais OU soja/seitan a cada refeição (PDCAAS ≥0,9).",
      "Leucina ≥2,5 g/refeição (soja, ervilha isolada, lentilha) ou suplementar EAA.",
      "Suplementar: B12 1000mcg/sem, D3 vegana 2000UI, ômega-3 algas 500mg, creatina 5g, ferro+vit C, zinco 15mg, iodo 150mcg, cálcio 1000mg.",
      "ZERO origem animal (incl. mel, gelatina, whey, caseína).",
    ],
  },
  low_fodmap: {
    titulo: "🌾 LOW-FODMAP — GutON 3 fases",
    bullets: [
      "Fase 1 (2–6 sem): cortar trigo, lactose, alho, cebola, leguminosas, polióis, frutas FODMAP.",
      "Permitidos: arroz, aveia, quinoa, batata, banana madura, kiwi, frango, peixe, ovo, tofu firme, leite sem lactose.",
      "Proteína 1,4–1,8 g/kg + fibra solúvel tolerada (aveia, chia, kiwi).",
      "Fase 2: reintrodução por grupos (3–4 dias cada) com diário de sintomas. NÃO é dieta permanente.",
    ],
  },
  longevidade: {
    titulo: "🧬 LONGEVIDADE — Densidade × baixa inflamação",
    bullets: [
      "Padrão mediterrâneo: ≥30g fibra/dia · azeite extravirgem 30–45 ml · ≥5 porções vegetais coloridos.",
      "Proteína 1,2–1,6 g/kg priorizando peixes gordos 2–3x/sem; carne vermelha ≤2x/sem; ZERO processada.",
      "Ômega-3 EPA+DHA 1–2g · polifenóis (chá verde, cacau ≥70%, cúrcuma+pimenta).",
      "TRE 10–12h · última refeição ≥3h antes de dormir · ZERO ultraprocessados/açúcar adicionado.",
      "Suplementar: D3 2000UI, magnésio 300mg, creatina 5g, B12 se >50 anos.",
    ],
  },
};

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
    if (nutriEliteMeta.modo_especial && nutriEliteMeta.modo_especial !== "padrao" && nutriEliteMeta.modo_especial !== "normal") {
      doc.setFont("helvetica", "bold");
      const modoLabel = String(nutriEliteMeta.modo_especial).toUpperCase();
      const sufixo =
        nutriEliteMeta.modo_especial === "competicao" && nutriEliteMeta.dias_para_competicao != null
          ? ` · D-${nutriEliteMeta.dias_para_competicao}`
          : nutriEliteMeta.modo_especial === "feminino" && nutriEliteMeta.fase_ciclo
          ? ` · Fase ${String(nutriEliteMeta.fase_ciclo).toUpperCase()}`
          : "";
      doc.text(`Modo: ${modoLabel}${sufixo}`, M, y); y += 14;
      doc.setFont("helvetica", "normal");
      // Fase G — bloco de regras condensadas do modo ativo
      const rules = MODE_RULES[String(nutriEliteMeta.modo_especial)];
      if (rules) {
        if (y > H - 120) { doc.addPage(); y = M; }
        doc.setFillColor(248, 244, 230);
        const rulesH = 16 + rules.bullets.length * 11 + 8;
        doc.rect(M, y, W - 2 * M, rulesH, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(140, 90, 10);
        doc.text(rules.titulo, M + 8, y + 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        let ry = y + 24;
        for (const b of rules.bullets) {
          doc.text(`• ${b}`, M + 10, ry, { maxWidth: W - 2 * M - 16 }); ry += 11;
        }
        y += rulesH + 6;
        doc.setTextColor(40, 40, 40);
      }
    }
    if (nutriEliteMeta.alerta_coach) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 60, 60);
      doc.text("⚠ Alerta Coach:", M, y); y += 11;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(String(nutriEliteMeta.alerta_coach), M, y, { maxWidth: W - 2 * M }); y += 14;
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
        if (Array.isArray(enr.insights_ia) && enr.insights_ia.length) {
          for (const ins of enr.insights_ia.slice(0, 3)) {
            if (!ins) continue;
            doc.text(`• ${String(ins)}`, M + 6, y, { maxWidth: W - 2 * M - 6 }); y += 9;
          }
        }
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
