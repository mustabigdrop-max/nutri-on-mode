import jsPDF from "jspdf";
import { CHALLENGE_DAYS, TIER_BADGE, levelBadge } from "@/lib/challenge";

const AMBER: [number, number, number] = [232, 160, 32];
const DARK: [number, number, number] = [10, 10, 14];
const GREY: [number, number, number] = [120, 126, 134];

export interface MyReportLog {
  log_date: string;
  points: number;
  day_completed: boolean;
  mood: string | null;
  training_done: boolean;
  water_ml: number;
}

export interface MyReportInput {
  fullName: string;
  tier: string;
  objetivo: string;
  mceScore: number;
  streak: number;
  weightStart: number | null;
  weightCurrent: number | null;
  day: number;
  challengeName: string;
  logs: MyReportLog[];
}

export function myReportMetrics(input: MyReportInput) {
  const logs = input.logs ?? [];
  const checkins = logs.length;
  const completed = logs.filter((l) => l.day_completed).length;
  const trainings = logs.filter((l) => l.training_done).length;
  const avgPoints = checkins ? Math.round(logs.reduce((s, l) => s + (l.points || 0), 0) / checkins) : 0;
  const avgWater = checkins ? Math.round(logs.reduce((s, l) => s + (l.water_ml || 0), 0) / checkins) : 0;
  const adherence = input.day ? Math.round((completed / input.day) * 100) : 0;
  const delta =
    input.weightStart != null && input.weightCurrent != null
      ? input.weightCurrent - input.weightStart
      : null;
  return { checkins, completed, trainings, avgPoints, avgWater, adherence, delta };
}

/** Relatório final de transformação do participante (1 página A4). */
export function downloadMyChallengeReport(input: MyReportInput) {
  const m = myReportMetrics(input);
  const badge = levelBadge(input.mceScore);
  const tier = TIER_BADGE[input.tier] ?? TIER_BADGE.free;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;

  // Header
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 34, "F");
  doc.setTextColor(...AMBER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("nutriON · RELATÓRIO DE TRANSFORMAÇÃO", 14, 15);
  doc.setTextColor(235, 235, 235);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${input.challengeName} · Dia ${input.day}/${CHALLENGE_DAYS}`, 14, 23);
  doc.setTextColor(...AMBER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Transformação é sistema.", 14, 29);

  // Identificação
  let y = 46;
  doc.setTextColor(20, 20, 24);
  doc.setFontSize(15);
  doc.text(input.fullName.toUpperCase(), 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GREY);
  doc.text(`${tier.label} · Objetivo: ${input.objetivo} · Nível ${badge.label}`, 14, y);

  // Cards de métricas
  y += 8;
  const cards: [string, string][] = [
    ["MCE SCORE", `${input.mceScore}`],
    ["ADERÊNCIA", `${m.adherence}%`],
    ["STREAK", `${input.streak} dias`],
    ["DIAS FECHADOS", `${m.completed}/${input.day}`],
    ["TREINOS", `${m.trainings}`],
    ["PESO", m.delta != null ? `${m.delta > 0 ? "+" : ""}${m.delta.toFixed(1)} kg` : "—"],
  ];
  const cw = (W - 28 - 10) / 3;
  cards.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 14 + col * (cw + 5);
    const cy = y + row * 26;
    doc.setDrawColor(225, 225, 228);
    doc.setFillColor(250, 250, 251);
    doc.roundedRect(x, cy, cw, 22, 2, 2, "FD");
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.setFont("helvetica", "bold");
    doc.text(c[0], x + 4, cy + 7);
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 24);
    doc.text(c[1], x + 4, cy + 17);
  });
  y += 26 * Math.ceil(cards.length / 3) + 6;

  // Evolução de pontos (barras)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 24);
  doc.text("EVOLUÇÃO DIÁRIA DE PONTOS", 14, y);
  y += 4;
  const chartH = 30;
  const logs = [...(input.logs ?? [])].sort((a, b) => a.log_date.localeCompare(b.log_date)).slice(-CHALLENGE_DAYS);
  const bw = logs.length ? (W - 28) / logs.length : 0;
  doc.setDrawColor(230, 230, 232);
  doc.line(14, y + chartH, W - 14, y + chartH);
  logs.forEach((l, i) => {
    const h = Math.max(1, ((l.points || 0) / 100) * chartH);
    doc.setFillColor(...(l.day_completed ? AMBER : [200, 200, 205] as [number, number, number]));
    doc.rect(14 + i * bw + 0.4, y + chartH - h, Math.max(bw - 0.8, 0.8), h, "F");
  });
  y += chartH + 10;

  // Hábitos
  doc.setFontSize(11);
  doc.text("HÁBITOS DO PERÍODO", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60, 62, 68);
  [
    `Check-ins registrados: ${m.checkins} de ${input.day} dias`,
    `Média de pontos por dia: ${m.avgPoints} / 100`,
    `Média de água: ${(m.avgWater / 1000).toFixed(1)} L por dia`,
    `Treinos concluídos: ${m.trainings}`,
  ].forEach((line) => {
    doc.text(`•  ${line}`, 16, y);
    y += 5.4;
  });

  // Rodapé
  doc.setFillColor(...DARK);
  doc.rect(0, 272, W, 25, "F");
  doc.setTextColor(...AMBER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Coach Diogo Mello", 14, 282);
  doc.setTextColor(200, 200, 205);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("@diogo.mell0 · nutrion.app.br", 14, 288);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, W - 14, 288, { align: "right" });

  doc.save(`transformacao-${input.fullName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
