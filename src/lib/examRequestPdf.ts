import jsPDF from "jspdf";
import { EXAME_BY_ID, JEJUM_LABEL, CATEGORIA_LABEL, type Exame, type ExameCategoria } from "@/data/examesCatalogo";

export interface ExamRequestPdfData {
  coachNome: string;
  coachRegistro?: string;
  coachContato?: string;
  pacienteNome: string;
  pacienteIdade?: number | null;
  pacienteSexo?: string | null;
  exameIds: string[];
  observacoes?: string;
  justificativa?: string;
  periodicidadeLabel?: string;
  proximaSolicitacao?: string | null;
  data?: Date;
}

const fmt = (d: Date) => d.toLocaleDateString("pt-BR");

export function generateExamRequestPdf(data: ExamRequestPdfData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 16;
  let y = 18;

  const exames = data.exameIds.map((id) => EXAME_BY_ID[id]).filter(Boolean) as Exame[];

  // Header
  doc.setFillColor(2, 2, 5);
  doc.rect(0, 0, W, 26, "F");
  doc.setTextColor(0, 212, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("SOLICITAÇÃO DE EXAMES LABORATORIAIS", M, 13);
  doc.setTextColor(200, 200, 210);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Emitido em ${fmt(data.data ?? new Date())}`, M, 20);
  y = 36;

  doc.setTextColor(20, 20, 20);

  // Paciente
  const line = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(label, M, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, M + 34, y);
    y += 6;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PACIENTE", M, y);
  y += 7;
  line("Nome:", data.pacienteNome || "—");
  line("Idade:", data.pacienteIdade ? `${data.pacienteIdade} anos` : "—");
  line("Sexo:", data.pacienteSexo === "F" ? "Feminino" : data.pacienteSexo === "M" ? "Masculino" : "—");
  y += 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PROFISSIONAL SOLICITANTE", M, y);
  y += 7;
  line("Nome:", data.coachNome || "—");
  if (data.coachRegistro) line("Registro:", data.coachRegistro);
  if (data.coachContato) line("Contato:", data.coachContato);
  y += 2;

  if (data.justificativa) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("JUSTIFICATIVA CLÍNICA", M, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.splitTextToSize(data.justificativa, W - M * 2).forEach((l: string) => {
      doc.text(l, M, y);
      y += 5;
    });
    y += 2;
  }

  // Exames por categoria
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`EXAMES SOLICITADOS (${exames.length})`, M, y);
  y += 7;

  const grupos = exames.reduce<Record<string, Exame[]>>((acc, e) => {
    (acc[e.categoria] ||= []).push(e);
    return acc;
  }, {});

  Object.entries(grupos).forEach(([cat, list]) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 244, 248);
    doc.rect(M - 2, y - 4.5, W - M * 2 + 4, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 90, 130);
    doc.text(CATEGORIA_LABEL[cat as ExameCategoria] ?? cat, M, y);
    doc.setTextColor(20, 20, 20);
    y += 8;

    list.forEach((e) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`• ${e.nomeCompleto}${e.sigla ? ` (${e.sigla})` : ""}`, M + 2, y);
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 120);
      doc.text(JEJUM_LABEL[e.jejum], W - M, y, { align: "right" });
      doc.setTextColor(20, 20, 20);
      y += 5.5;
    });
    y += 2;
  });

  // Preparo
  const jejuns = [...new Set(exames.map((e) => e.jejum))];
  const preparos = [...new Set(exames.map((e) => e.preparo).filter(Boolean))] as string[];
  if (y > 235) { doc.addPage(); y = 20; }
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ORIENTAÇÕES DE PREPARO", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const orientacoes = [
    jejuns.includes("sim_12h")
      ? "Jejum de 12 horas (água liberada) para o conjunto de exames metabólicos/lipídicos."
      : jejuns.includes("sim_8h")
      ? "Jejum de 8 horas (água liberada)."
      : "Não é obrigatório jejum prolongado para os exames selecionados.",
    "Evitar treino intenso e bebida alcoólica nas 48h anteriores à coleta.",
    "Coleta preferencialmente entre 7h e 9h (hormônios seguem ritmo circadiano).",
    ...preparos,
  ];
  orientacoes.forEach((o) => {
    if (y > 278) { doc.addPage(); y = 20; }
    doc.splitTextToSize(`• ${o}`, W - M * 2).forEach((l: string) => {
      doc.text(l, M, y);
      y += 5;
    });
  });

  if (data.observacoes) {
    y += 3;
    if (y > 258) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVAÇÕES", M, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.splitTextToSize(data.observacoes, W - M * 2).forEach((l: string) => {
      if (y > 278) { doc.addPage(); y = 20; }
      doc.text(l, M, y);
      y += 5;
    });
  }

  if (data.periodicidadeLabel || data.proximaSolicitacao) {
    y += 3;
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Reavaliação: ${data.periodicidadeLabel ?? "—"}${data.proximaSolicitacao ? ` · próxima em ${data.proximaSolicitacao}` : ""}`,
      M,
      y
    );
    y += 6;
  }

  // Assinatura
  if (y > 250) { doc.addPage(); y = 30; }
  y = Math.max(y + 16, 250);
  doc.setDrawColor(120, 120, 130);
  doc.line(M + 20, y, W - M - 20, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.coachNome || "Profissional responsável", W / 2, y, { align: "center" });
  if (data.coachRegistro) {
    y += 5;
    doc.text(data.coachRegistro, W / 2, y, { align: "center" });
  }

  doc.setFontSize(7);
  doc.setTextColor(130, 130, 140);
  doc.text(
    "Documento gerado pelo nutriON · a solicitação de exames deve respeitar as atribuições legais do profissional emitente.",
    W / 2,
    288,
    { align: "center" }
  );

  return doc;
}

export function downloadExamRequestPdf(data: ExamRequestPdfData) {
  const doc = generateExamRequestPdf(data);
  const nome = (data.pacienteNome || "paciente").replace(/\s+/g, "_").toLowerCase();
  doc.save(`solicitacao_exames_${nome}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
