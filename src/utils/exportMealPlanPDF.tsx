import { Document, Page, Text, View, StyleSheet, Image, pdf, Font } from "@react-pdf/renderer";
import React from "react";
import { buildPlanAudit, summarizeAudit } from "@/lib/planPdfAudit";

const COLORS = {
  bg: "#09090b",
  text: "#ffffff",
  muted: "#a1a1aa",
  accent: "#6366f1",
  card: "#18181b",
  border: "#27272a",
  training: "#10b981",
  rest: "#52525b",
};

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.bg, color: COLORS.text, padding: 32, fontFamily: "Helvetica", fontSize: 10 },
  cover: { backgroundColor: COLORS.bg, color: COLORS.text, padding: 40, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 },
  coachBlock: { flexDirection: "column" },
  coachName: { fontSize: 14, color: COLORS.text, fontFamily: "Helvetica-Bold" },
  coachCRN: { fontSize: 9, color: COLORS.muted, marginTop: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, objectFit: "cover" },
  title: { fontSize: 28, fontFamily: "Helvetica-Bold", color: COLORS.accent, marginTop: 80, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 40 },
  patientName: { fontSize: 22, color: COLORS.text, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  metaLine: { fontSize: 10, color: COLORS.muted, marginBottom: 3 },
  accentBar: { width: 60, height: 3, backgroundColor: COLORS.accent, marginVertical: 20 },

  sectionTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: COLORS.accent, marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 6, padding: 14, marginBottom: 10, borderLeft: `3px solid ${COLORS.accent}` },
  rowGrid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", marginBottom: 10 },
  cellLabel: { fontSize: 8, color: COLORS.muted, textTransform: "uppercase", marginBottom: 2 },
  cellValue: { fontSize: 13, color: COLORS.text, fontFamily: "Helvetica-Bold" },

  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 4, marginBottom: 8, marginTop: 12 },
  dayHeaderTraining: { backgroundColor: COLORS.training },
  dayHeaderRest: { backgroundColor: COLORS.rest },
  dayHeaderText: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  dayBadge: { fontSize: 8, color: "#ffffff", padding: "2 6", borderRadius: 3, backgroundColor: "rgba(0,0,0,0.3)" },

  meal: { backgroundColor: COLORS.card, padding: 8, marginBottom: 6, borderRadius: 4 },
  mealHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  mealName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.accent },
  mealTime: { fontSize: 9, color: COLORS.muted },
  foodLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2, borderTop: `0.5px solid ${COLORS.border}` },
  foodName: { fontSize: 9, color: COLORS.text, flex: 2 },
  foodPortion: { fontSize: 9, color: COLORS.muted, flex: 1, textAlign: "right" },
  foodMacros: { fontSize: 8, color: COLORS.muted, flex: 1.5, textAlign: "right" },

  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, padding: 8, backgroundColor: COLORS.accent, borderRadius: 4 },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  totalValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff" },

  auditCard: { backgroundColor: COLORS.card, borderRadius: 6, padding: 12, marginBottom: 10, borderLeft: "3px solid #f59e0b" },
  auditOkCard: { backgroundColor: COLORS.card, borderRadius: 6, padding: 12, marginBottom: 10, borderLeft: "3px solid #10b981" },
  auditDay: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.text, marginBottom: 4 },
  auditMeta: { fontSize: 8, color: COLORS.muted, marginBottom: 6 },
  auditError: { fontSize: 8, color: "#f87171", marginBottom: 3, lineHeight: 1.4 },
  auditWarn: { fontSize: 8, color: "#fbbf24", marginBottom: 3, lineHeight: 1.4 },
  auditOk: { fontSize: 8, color: "#34d399" },

  footer: { position: "absolute", bottom: 18, left: 32, right: 32, borderTop: `0.5px solid ${COLORS.border}`, paddingTop: 8 },
  footerText: { fontSize: 7, color: COLORS.muted, textAlign: "center" },
  footerWarn: { fontSize: 7, color: COLORS.muted, textAlign: "center", fontStyle: "italic", marginTop: 2 },
});


const MEAL_TIMES: Record<string, { label: string; time: string }> = {
  cafe_manha: { label: "Café da manhã", time: "07:00" },
  lanche_manha: { label: "Lanche da manhã", time: "10:00" },
  almoco: { label: "Almoço", time: "12:30" },
  lanche_tarde: { label: "Lanche da tarde", time: "16:00" },
  jantar: { label: "Jantar", time: "19:30" },
  ceia: { label: "Ceia", time: "22:00" },
};
const MEAL_ORDER = ["cafe_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"];
const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

interface PatientLike {
  id?: string;
  display_name?: string | null;
  full_name?: string | null;
  goal?: string | null;
  weight_kg?: number | null;
  target_weight_kg?: number | null;
  body_fat_pct?: number | null;
  target_kcal?: number | null;
  target_protein_g?: number | null;
  target_carbs_g?: number | null;
  target_fat_g?: number | null;
}
interface MealItemLike {
  day_index: number;
  meal_type: string;
  food_name: string;
  portion?: string | null;
  kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

const hasNutrition = (item: MealItemLike) => [item.kcal, item.protein_g, item.carbs_g, item.fat_g].every((value) => typeof value === "number" && value >= 0);
interface CoachProfileLike {
  professional_name?: string | null;
  crn?: string | null;
  avatar_url?: string | null;
}
interface PhaseLike {
  name?: string;
  phase_type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  pharma_notes?: string | null;
  notes?: string | null;
}

const Footer = ({ coachName, patientName }: { coachName: string; patientName: string }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      Gerado pelo NutriON • {new Date().toLocaleDateString("pt-BR")} • {coachName}
    </Text>
    <Text style={styles.footerWarn}>
      Este plano foi elaborado exclusivamente para {patientName}. Não compartilhe.
    </Text>
  </View>
);

const MealPlanDoc = ({
  patient,
  items,
  coach,
  phases,
  trainingDays,
}: {
  patient: PatientLike;
  items: MealItemLike[];
  coach: CoachProfileLike;
  phases: PhaseLike[];
  trainingDays: Set<number>;
}) => {
  const patientName = patient.display_name || patient.full_name || "Paciente";
  const coachName = coach.professional_name || "Coach";
  const today = new Date().toLocaleDateString("pt-BR");
  const activePhase = phases?.find((p) => p.status === "active") || phases?.[0];

  const proteinKcal = (patient.target_protein_g || 0) * 4;
  const carbsKcal = (patient.target_carbs_g || 0) * 4;
  const fatKcal = (patient.target_fat_g || 0) * 9;
  const totalKcal = patient.target_kcal || proteinKcal + carbsKcal + fatKcal || 1;
  const pct = (k: number) => Math.round((k / totalKcal) * 100);

  const audits = buildPlanAudit(items, patient.target_kcal || 0);
  const auditSummary = summarizeAudit(audits);



  return (
    <Document>
      {/* COVER */}
      <Page size="A4" style={styles.cover}>
        <View style={styles.headerRow}>
          <View style={styles.coachBlock}>
            <Text style={styles.coachName}>{coachName}</Text>
            {coach.crn && <Text style={styles.coachCRN}>{coach.crn}</Text>}
          </View>
          {coach.avatar_url ? <Image src={coach.avatar_url} style={styles.avatar} /> : null}
        </View>
        <View style={styles.accentBar} />
        <Text style={styles.title}>Plano Alimentar{"\n"}Individualizado</Text>
        <Text style={styles.subtitle}>Protocolo nutricional personalizado</Text>
        <View style={styles.accentBar} />
        <Text style={styles.patientName}>{patientName}</Text>
        <Text style={styles.metaLine}>Data de geração: {today}</Text>
        {activePhase && <Text style={styles.metaLine}>Fase atual: {activePhase.name || activePhase.phase_type}</Text>}
        <Footer coachName={coachName} patientName={patientName} />
      </Page>

      {/* PROTOCOL DATA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Dados do Protocolo</Text>
        <View style={styles.card}>
          <View style={styles.rowGrid}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Objetivo</Text>
              <Text style={styles.cellValue}>{patient.goal || "—"}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Peso atual</Text>
              <Text style={styles.cellValue}>{patient.weight_kg ? `${patient.weight_kg} kg` : "—"}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Meta</Text>
              <Text style={styles.cellValue}>{patient.target_weight_kg ? `${patient.target_weight_kg} kg` : "—"}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>% Gordura</Text>
              <Text style={styles.cellValue}>{patient.body_fat_pct ? `${patient.body_fat_pct}%` : "—"}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Kcal alvo</Text>
              <Text style={styles.cellValue}>{patient.target_kcal || "—"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Distribuição de Macronutrientes</Text>
        <View style={styles.card}>
          <View style={styles.rowGrid}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Proteína</Text>
              <Text style={styles.cellValue}>{patient.target_protein_g || 0} g</Text>
              <Text style={styles.cellLabel}>{pct(proteinKcal)}% do total</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Carboidrato</Text>
              <Text style={styles.cellValue}>{patient.target_carbs_g || 0} g</Text>
              <Text style={styles.cellLabel}>{pct(carbsKcal)}% do total</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Gordura</Text>
              <Text style={styles.cellValue}>{patient.target_fat_g || 0} g</Text>
              <Text style={styles.cellLabel}>{pct(fatKcal)}% do total</Text>
            </View>
          </View>
        </View>

        {activePhase && (
          <>
            <Text style={styles.sectionTitle}>Fase Atual do Protocolo</Text>
            <View style={styles.card}>
              <Text style={styles.cellValue}>{activePhase.name || activePhase.phase_type}</Text>
              {activePhase.start_date && (
                <Text style={styles.cellLabel}>
                  {new Date(activePhase.start_date).toLocaleDateString("pt-BR")}
                  {activePhase.end_date ? ` → ${new Date(activePhase.end_date).toLocaleDateString("pt-BR")}` : ""}
                </Text>
              )}
              {activePhase.notes && <Text style={{ ...styles.cellLabel, marginTop: 6 }}>{activePhase.notes}</Text>}
            </View>
          </>
        )}

        {activePhase?.pharma_notes && (
          <>
            <Text style={styles.sectionTitle}>Instruções Farmacológicas</Text>
            <View style={styles.card}>
              <Text style={{ fontSize: 10, color: COLORS.text, lineHeight: 1.5 }}>{activePhase.pharma_notes}</Text>
            </View>
          </>
        )}
        <Footer coachName={coachName} patientName={patientName} />
      </Page>

      {/* WEEKLY PLAN */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Plano Semanal</Text>
        {DAYS.map((dayName, dayIdx) => {
          const dayItems = items.filter((i) => i.day_index === dayIdx);
          const isTraining = trainingDays.has(dayIdx);
          const totals = dayItems.reduce(
            (acc, i) => ({
              kcal: acc.kcal + (i.kcal || 0),
              p: acc.p + (i.protein_g || 0),
              c: acc.c + (i.carbs_g || 0),
              f: acc.f + (i.fat_g || 0),
            }),
            { kcal: 0, p: 0, c: 0, f: 0 }
          );
          return (
            <View key={dayIdx} wrap={false}>
              <View
                style={{
                  ...styles.dayHeader,
                  ...(isTraining ? styles.dayHeaderTraining : styles.dayHeaderRest),
                }}
              >
                <Text style={styles.dayHeaderText}>{dayName}</Text>
                <Text style={styles.dayBadge}>{isTraining ? "TREINO" : "DESCANSO"}</Text>
              </View>
              {MEAL_ORDER.map((mt) => {
                const mealItems = dayItems.filter((i) => i.meal_type === mt);
                if (mealItems.length === 0) return null;
                const meta = MEAL_TIMES[mt] || { label: mt, time: "" };
                return (
                  <View key={mt} style={styles.meal}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealName}>{meta.label}</Text>
                      <Text style={styles.mealTime}>{meta.time}</Text>
                    </View>
                    {mealItems.map((item, idx) => (
                      <View key={idx} style={styles.foodLine}>
                        <Text style={styles.foodName}>{item.food_name}</Text>
                        <Text style={styles.foodPortion}>{item.portion || "—"}</Text>
                        <Text style={styles.foodMacros}>
                          {hasNutrition(item) ? `${Math.round(item.kcal || 0)}kcal · P${Math.round(item.protein_g || 0)} C${Math.round(item.carbs_g || 0)} G${Math.round(item.fat_g || 0)}` : "⚠ dados indisponíveis"}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Totais do dia</Text>
                <Text style={styles.totalValue}>
                  {Math.round(totals.kcal)} kcal · P{Math.round(totals.p)}g · C{Math.round(totals.c)}g · G{Math.round(totals.f)}g
                </Text>
              </View>
            </View>
          );
        })}
        <Footer coachName={coachName} patientName={patientName} />
      </Page>
    </Document>
  );
};

export async function exportMealPlanPDF(
  patient: PatientLike,
  mealPlanItems: MealItemLike[],
  coachProfile: CoachProfileLike,
  phases: PhaseLike[] = [],
  trainingDayIndices: number[] = []
) {
  const trainingDays = new Set(trainingDayIndices);
  const blob = await pdf(
    <MealPlanDoc
      patient={patient}
      items={mealPlanItems}
      coach={coachProfile}
      phases={phases}
      trainingDays={trainingDays}
    />
  ).toBlob();

  const patientName = (patient.display_name || patient.full_name || "paciente").replace(/\s+/g, "_");
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${patientName}_plano_${dateStr}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return fileName;
}

export default exportMealPlanPDF;
