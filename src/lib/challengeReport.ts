import jsPDF from "jspdf";

export interface ChallengeReportRow {
  full_name: string;
  email: string | null;
  whatsapp: string | null;
  tier: string;
  mce_score: number;
  streak: number;
  weight_start: number | null;
  weight_current: number | null;
  days_logged: number;
  days_completed: number;
  photos: number;
  migrated_to_client: boolean;
  checkin_rate?: number;
  completion_rate?: number;
}

export interface ChallengeReportMeta {
  challengeName: string;
  gymName?: string | null;
  startDate: string;
  endDate: string;
  day: number;
  totalDays: number;
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
}

export function reportMetrics(rows: ChallengeReportRow[]) {
  const total = rows.length;
  const premium = rows.filter((r) => r.tier === "premium").length;
  const vip = rows.filter((r) => r.tier === "vip").length;
  const free = total - premium - vip;
  const paid = premium + vip;
  const conversion = total ? Math.round((paid / total) * 100) : 0;
  const avgScore = total ? Math.round(rows.reduce((s, r) => s + (r.mce_score || 0), 0) / total) : 0;
  const avgStreak = total ? Math.round(rows.reduce((s, r) => s + (r.streak || 0), 0) / total) : 0;
  const deltas = rows
    .map((r) => (r.weight_start != null && r.weight_current != null ? r.weight_current - r.weight_start : null))
    .filter((d): d is number => d !== null);
  const avgDelta = deltas.length ? deltas.reduce((s, d) => s + d, 0) / deltas.length : 0;
  const migrated = rows.filter((r) => r.migrated_to_client).length;
  const avgCheckin = total ? Math.round(rows.reduce((s, r) => s + (r.checkin_rate ?? 0), 0) / total) : 0;
  const avgCompletion = total ? Math.round(rows.reduce((s, r) => s + (r.completion_rate ?? 0), 0) / total) : 0;
  return { total, free, premium, vip, paid, conversion, avgScore, avgStreak, avgDelta, migrated, avgCheckin, avgCompletion };
}

const delta = (r: ChallengeReportRow) =>
  r.weight_start != null && r.weight_current != null
    ? `${(r.weight_current - r.weight_start > 0 ? "+" : "")}${(r.weight_current - r.weight_start).toFixed(1)}`
    : "—";

const sig = (n: number) => `${n > 0 ? "+" : ""}${n}`;

const periodText = (meta: ChallengeReportMeta) =>
  meta.periodStart && meta.periodEnd
    ? `${meta.periodLabel ?? "Período"}: ${new Date(`${meta.periodStart}T12:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${meta.periodEnd}T12:00:00`).toLocaleDateString("pt-BR")}`
    : `${meta.startDate} a ${meta.endDate}`;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportChallengeCSV(
  meta: ChallengeReportMeta,
  rows: ChallengeReportRow[],
  prev?: ChallengeReportRow[] | null,
) {
  const head = [
    "Nome", "Email", "WhatsApp", "Plano", "MCE Score", "Streak (dias)",
    "Peso inicial", "Peso atual", "Variação (kg)", "Dias registrados",
    "Dias concluídos", "Check-in (%)", "Conclusão (%)", "Fotos", "Virou aluno",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((r) =>
    [
      r.full_name, r.email ?? "", r.whatsapp ?? "", r.tier.toUpperCase(), r.mce_score, r.streak,
      r.weight_start ?? "", r.weight_current ?? "", delta(r), r.days_logged, r.days_completed,
      r.checkin_rate ?? "", r.completion_rate ?? "", r.photos, r.migrated_to_client ? "sim" : "não",
    ].map(esc).join(","),
  );
  const m = reportMetrics(rows);
  const cmp = prev && prev.length ? reportMetrics(prev) : null;
  const summary = [
    `"${meta.challengeName} — Dia ${meta.day}/${meta.totalDays}"`,
    `"Período","${periodText(meta)}"`,
    `"Participantes",${m.total}`,
    `"Free",${m.free}`,
    `"Premium",${m.premium}`,
    `"VIP",${m.vip}`,
    `"Conversão FREE→Pago (%)",${m.conversion}`,
    `"MCE Score médio",${m.avgScore}`,
    `"Taxa de check-in (%)",${m.avgCheckin}`,
    `"Taxa de conclusão do dia (%)",${m.avgCompletion}`,
    ...(cmp
      ? [
          `"Período anterior — check-in (%)",${cmp.avgCheckin}`,
          `"Período anterior — conclusão (%)",${cmp.avgCompletion}`,
          `"Evolução check-in (p.p.)",${m.avgCheckin - cmp.avgCheckin}`,
          `"Evolução conclusão (p.p.)",${m.avgCompletion - cmp.avgCompletion}`,
          `"Evolução MCE médio",${m.avgScore - cmp.avgScore}`,
        ]
      : []),
    "",
  ];
  const csv = "\uFEFF" + [...summary, head.map(esc).join(","), ...body].join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `desafio-${meta.challengeName.toLowerCase().replace(/\s+/g, "-")}.csv`);
}

export function exportChallengePDF(
  meta: ChallengeReportMeta,
  rows: ChallengeReportRow[],
  prev?: ChallengeReportRow[] | null,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const m = reportMetrics(rows);
  const cmp = prev && prev.length ? reportMetrics(prev) : null;
  let y = 56;

  doc.setFillColor(5, 7, 12);
  doc.rect(0, 0, W, 92, "F");
  doc.setTextColor(232, 160, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(meta.challengeName, 40, 46);
  doc.setTextColor(210, 210, 210);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${meta.gymName ? meta.gymName + " · " : ""}Dia ${meta.day}/${meta.totalDays} · ${meta.startDate} a ${meta.endDate}`,
    40,
    64,
  );
  doc.text(`Transformação é sistema. · Coach Diogo Mello · ${periodText(meta)}`, 40, 78);
  y = 122;

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Visão geral", 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const overview = [
    `Participantes: ${m.total}   ·   Free: ${m.free}   ·   Premium: ${m.premium}   ·   VIP: ${m.vip}`,
    `Conversão FREE → Pago: ${m.conversion}%   ·   Migrados para aluno nutriON: ${m.migrated}`,
    `MCE Score médio: ${m.avgScore}   ·   Streak médio: ${m.avgStreak} dias   ·   Variação média de peso: ${m.avgDelta.toFixed(1)} kg`,
    `Taxa de check-in: ${m.avgCheckin}%   ·   Taxa de conclusão do dia: ${m.avgCompletion}%`,
    ...(cmp
      ? [
          `Período anterior: check-in ${cmp.avgCheckin}% · conclusão ${cmp.avgCompletion}% · MCE ${cmp.avgScore}`,
          `Evolução: check-in ${sig(m.avgCheckin - cmp.avgCheckin)} p.p. · conclusão ${sig(m.avgCompletion - cmp.avgCompletion)} p.p. · MCE ${sig(m.avgScore - cmp.avgScore)}`,
        ]
      : []),
  ];
  overview.forEach((line) => { doc.text(line, 40, y); y += 14; });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Evolução por participante", 40, y);
  y += 18;

  const cols = [
    { l: "Atleta", x: 40 },
    { l: "Plano", x: 190 },
    { l: "MCE", x: 240 },
    { l: "Streak", x: 280 },
    { l: "Peso", x: 330 },
    { l: "Δ kg", x: 400 },
    { l: "Dias", x: 440 },
    { l: "CI/CD %", x: 478 },
    { l: "Fotos", x: 522 },
    { l: "Aluno", x: 552 },
  ];
  const header = () => {
    doc.setFillColor(240, 240, 240);
    doc.rect(36, y - 12, W - 72, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    cols.forEach((c) => doc.text(c.l, c.x, y));
    y += 16;
    doc.setFont("helvetica", "normal");
  };
  header();

  rows
    .slice()
    .sort((a, b) => b.mce_score - a.mce_score)
    .forEach((r, i) => {
      if (y > 780) { doc.addPage(); y = 56; header(); }
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);
      const peso =
        r.weight_start != null || r.weight_current != null
          ? `${r.weight_start ?? "—"} → ${r.weight_current ?? "—"}`
          : "—";
      const vals = [
        `${i + 1}. ${r.full_name}`.slice(0, 30),
        r.tier.toUpperCase(),
        String(r.mce_score),
        `${r.streak}d`,
        peso,
        delta(r),
        `${r.days_completed}/${r.days_logged}`,
        `${r.checkin_rate ?? 0}/${r.completion_rate ?? 0}`,
        String(r.photos),
        r.migrated_to_client ? "sim" : "—",
      ];
      cols.forEach((c, idx) => doc.text(vals[idx], c.x, y));
      y += 15;
    });

  doc.save(`desafio-${meta.challengeName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
