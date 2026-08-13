import jsPDF from "jspdf";
import { ANAMNESIS_SECTIONS, TOTAL_SECTIONS, type AnamnesisSection } from "@/data/anamnesisSchema";

export type AnamnesisStatus = "pending" | "draft" | "completed";
export type AnamnesisMode = "online" | "presencial";

export type AnamnesisData = Record<string, Record<string, any>>;

export interface AnamnesisRow {
  id: string;
  athlete_id: string | null;
  coach_id: string | null;
  athlete_name: string | null;
  mode: AnamnesisMode;
  status: AnamnesisStatus;
  personal: Record<string, any>;
  health_history: Record<string, any>;
  diet_history: Record<string, any>;
  lifestyle: Record<string, any>;
  training: Record<string, any>;
  goals: Record<string, any>;
  digestive: Record<string, any>;
  hormonal: Record<string, any>;
  supplements: Record<string, any>;
  pharmacology: Record<string, any>;
  sections_completed: number;
  total_sections: number;
  alerts: string[];
  invite_token: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteToken(len = 6): string {
  let out = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) out += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length];
  return out;
}

export function anamnesisLink(token: string): string {
  return `${window.location.origin}/anamnese/${token}`;
}

export function emptyAnamnesisData(): AnamnesisData {
  const d: AnamnesisData = {};
  for (const s of ANAMNESIS_SECTIONS) d[s.key] = {};
  return d;
}

export function rowToData(row: Partial<AnamnesisRow>): AnamnesisData {
  const d = emptyAnamnesisData();
  for (const s of ANAMNESIS_SECTIONS) {
    d[s.key] = ((row as any)?.[s.key] as Record<string, any>) || {};
  }
  return d;
}

const isFilled = (v: any) =>
  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== "";

export function sectionIsFilled(section: AnamnesisSection, data: AnamnesisData): boolean {
  const values = data[section.key] || {};
  return Object.values(values).some(isFilled);
}

export function countCompletedSections(data: AnamnesisData): number {
  return ANAMNESIS_SECTIONS.filter((s) => sectionIsFilled(s, data)).length;
}

export function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

/** Alertas automáticos exibidos ao coach */
export function buildAlerts(data: AnamnesisData): string[] {
  const a: string[] = [];
  const diet = data.diet_history || {};
  const life = data.lifestyle || {};
  const pharm = data.pharmacology || {};
  const horm = data.hormonal || {};
  const health = data.health_history || {};
  const dig = data.digestive || {};

  if (diet.binge_eating === "Tenho atualmente") a.push("Paciente relata compulsão alimentar atual");
  if (String(diet.food_relationship || "").startsWith("Muito difícil"))
    a.push("Transtorno alimentar diagnosticado — abordagem não restritiva obrigatória");
  if (diet.emotional_eating === "Sempre" || diet.emotional_eating === "Frequentemente")
    a.push("Comer emocional frequente — ancoragem comportamental recomendada");
  if (diet.yoyo_effect === "Severo") a.push("Efeito sanfona severo — risco de adaptação metabólica");

  if (life.stress_level === "Alto") a.push("Estresse nível ALTO");
  if (life.stress_level === "Muito alto / Burnout") a.push("Estresse MUITO ALTO / burnout");
  if (Number(life.sleep_hours) > 0 && Number(life.sleep_hours) < 6) a.push("Sono < 6h por noite");
  if (String(life.sleep_quality || "").startsWith("Péssima")) a.push("Sono péssimo com uso de medicação");
  if (life.alcohol === "Frequente (4+ doses/semana)") a.push("Consumo frequente de álcool");
  if (life.work_type === "Noturno (turno/plantão)") a.push("Turno noturno — crononutrição invertida");

  if (pharm.uses_pharma === "Sim" && pharm.medical_followup === "Não")
    a.push("Usa suporte farmacológico sem acompanhamento médico");
  if (pharm.uses_pharma === "Sim" && (pharm.last_bloodwork === "6+ meses" || pharm.last_bloodwork === "Nunca fez"))
    a.push("Suporte farmacológico com exames desatualizados");

  if (String(horm.menstrual_status || "").startsWith("Amenorreia"))
    a.push("Amenorreia — risco de RED-S, proibido déficit agressivo");
  if (horm.menstrual_status === "Gestante") a.push("Gestante — protocolo restritivo contraindicado");
  if (horm.menstrual_status === "Amamentando") a.push("Amamentando — ajustar calorias e hidratação");

  const conds: string[] = health.conditions || [];
  if (conds.includes("Resistência à insulina")) a.push("Resistência à insulina — distribuir carboidratos");
  if (conds.includes("Diabetes tipo 1") || conds.includes("Diabetes tipo 2")) a.push("Diabetes — controle glicêmico prioritário");
  if (conds.includes("Hipotireoidismo") || conds.includes("Hashimoto")) a.push("Tireoide — revisar TSH/T4 antes do déficit");
  if (conds.includes("SOP (Ovários Policísticos)")) a.push("SOP — priorizar baixo índice glicêmico");

  const digDiag: string[] = dig.diagnoses || [];
  if (digDiag.includes("Síndrome do intestino irritável (SII)")) a.push("SII — considerar Low-FODMAP em fases");
  const digSymp: string[] = dig.symptoms || [];
  if (digSymp.filter((s) => s !== "Nenhum sintoma").length >= 4)
    a.push("Múltiplos sintomas digestivos — protocolo de microbiota recomendado");

  return a;
}

/** Notas clínicas consolidadas para o NutriPlan */
export function buildClinicalNotes(data: AnamnesisData): string {
  const h = data.health_history || {};
  const t = data.training || {};
  const parts: string[] = [];
  const conds: string[] = (h.conditions || []).filter((c: string) => c !== "Nenhuma diagnosticada");
  if (conds.length) parts.push(`Diagnósticos: ${conds.join(", ")}.`);
  if (h.other_conditions) parts.push(`Outras condições: ${h.other_conditions}.`);
  if (h.medications) parts.push(`Medicamentos: ${h.medications}.`);
  if (h.surgeries) parts.push(`Cirurgias: ${h.surgeries}.`);
  if (t.injuries) parts.push(`Lesões/limitações: ${t.injuries}.`);
  const fam: string[] = h.family_history || [];
  if (fam.length) parts.push(`Histórico familiar: ${fam.join(", ")}.`);
  return parts.join(" ");
}

function mapObjective(v?: string): string {
  const map: Record<string, string> = {
    "Emagrecer / Perder gordura": "CUTTING",
    "Ganhar massa muscular": "BULKING",
    "Recomposição (perder gordura e ganhar massa)": "RECOMP",
    "Melhorar performance no esporte": "PERFORMANCE",
    "Saúde e qualidade de vida": "LONGEVITY",
    "Preparação para competição": "CONTEST_PREP",
    "Manter o shape atual": "MAINTENANCE",
  };
  return map[v || ""] || "RECOMP";
}

function mapFrequency(v?: string): number {
  const map: Record<string, number> = { "1-2x": 2, "3-4x": 4, "5-6x": 5, "7x": 7 };
  return map[v || ""] || 3;
}

function mapNEAT(work?: string): "baixo" | "moderado" | "alto" {
  if (work === "Ativo (manual, carregando peso)") return "alto";
  if (work === "Moderado (em pé, andando)") return "moderado";
  return "baixo";
}

function mapSleepQuality(v?: string): "boa" | "regular" | "ruim" {
  if (!v) return "regular";
  if (v.startsWith("Boa")) return "boa";
  if (v.startsWith("Regular")) return "regular";
  return "ruim";
}

/** Mapeamento anamnese → campos do NutriPlan / TrainingON */
export function mapAnamnesisToNutriPlan(data: AnamnesisData) {
  const p = data.personal || {};
  const d = data.diet_history || {};
  const l = data.lifestyle || {};
  const t = data.training || {};
  const g = data.goals || {};
  const ph = data.pharmacology || {};

  return {
    nome: p.full_name || "",
    idade: calculateAge(p.birth_date),
    sexo: p.sex || "",
    telefone: p.phone || "",
    email: p.email || "",
    peso: t.weight ? Number(t.weight) : null,
    altura: t.height ? Number(t.height) : null,
    bf: t.body_fat ? Number(t.body_fat) : null,
    massaMagra: t.lean_mass ? Number(t.lean_mass) : null,
    objetivo: mapObjective(g.main_objective),
    pesoMeta: g.target_weight ? Number(g.target_weight) : null,
    prazo: g.deadline_date || null,
    modalidadeTreino: t.modality || "",
    anosTreino: t.years_training || "",
    frequenciaTreino: mapFrequency(t.frequency),
    horarioTreino: t.training_time || "",
    cardio: t.does_cardio === "Sim" ? t.cardio_detail || "Sim" : "Não",
    neat: mapNEAT(l.work_type),
    tipoTrabalho: l.work_type || "",
    sono: mapSleepQuality(l.sleep_quality),
    horasSono: l.sleep_hours ? Number(l.sleep_hours) : null,
    horaAcordar: l.wake_time || "",
    horaDormir: l.sleep_time || "",
    estresse: l.stress_level || "",
    alcool: l.alcohol || "",
    cafeina: l.caffeine || "",
    aguaAtual: l.water_intake || "",
    nivelCulinario: l.cooking_skill || "",
    mealPrep: l.meal_prep || "",
    refeicoesFora: l.eating_out || "",
    condicaoEconomica: l.economic_tier || "",
    refeicoesDia: d.current_meals_per_day || "",
    restricoes: [...(d.restrictions || []), d.other_restriction].filter(Boolean),
    alimentosOdeia: d.hated_foods || "",
    triggerFoods: d.trigger_foods || "",
    preferencias: d.loved_foods || "",
    intolerancias: d.intolerances || "",
    historicoMetabolico: {
      previousDiets: d.previous_diets_count || "",
      yoyoHistory: d.yoyo_effect || "",
      lowestWeight: d.lowest_adult_weight || null,
      highestWeight: d.highest_adult_weight || null,
    },
    perfilDigestivo: data.digestive || {},
    perfilHormonal: data.hormonal || {},
    suplementacao: [(ph.supplements_used || []).join(", "), ph.supplements_doses].filter(Boolean).join(" · "),
    pharmEnabled: ph.uses_pharma === "Sim",
    pharmProfile: ph.profile || "",
    pharmDescription: ph.description || "",
    observacoesClinicas: buildClinicalNotes(data),
    alertas: buildAlerts(data),
  };
}

export const ANAMNESIS_PREFILL_KEY = "nutrion:anamnesis-prefill";

/** Guarda o mapeamento para o NutriPlan consumir ao abrir */
export function stashPrefill(athleteId: string, data: AnamnesisData) {
  try {
    sessionStorage.setItem(
      ANAMNESIS_PREFILL_KEY,
      JSON.stringify({ athleteId, values: mapAnamnesisToNutriPlan(data), at: Date.now() })
    );
  } catch { /* ignore */ }
}

export function readPrefill(): { athleteId: string; values: ReturnType<typeof mapAnamnesisToNutriPlan> } | null {
  try {
    const raw = sessionStorage.getItem(ANAMNESIS_PREFILL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const fmtValue = (v: any): string => {
  if (Array.isArray(v)) return v.join(", ");
  if (v === true) return "Sim";
  if (v === false) return "Não";
  return String(v ?? "");
};

export function exportAnamnesisPDF(row: Partial<AnamnesisRow>, data: AnamnesisData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 56;

  const ensure = (need = 20) => {
    if (y + need > H - 50) {
      doc.addPage();
      y = 56;
    }
  };

  doc.setFontSize(18);
  doc.text("ANAMNESE NUTRICIONAL", 40, y);
  y += 18;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    `nutriON · Método MCE  ·  ${row.athlete_name || data.personal?.full_name || "Paciente"}  ·  ${new Date(
      row.created_at || Date.now()
    ).toLocaleDateString("pt-BR")}`,
    40,
    y
  );
  y += 22;

  const alerts = buildAlerts(data);
  if (alerts.length) {
    doc.setTextColor(190, 60, 40);
    doc.setFontSize(11);
    doc.text("ALERTAS AUTOMÁTICOS", 40, y);
    y += 14;
    doc.setFontSize(9);
    alerts.forEach((al) => {
      ensure();
      doc.text(`• ${al}`, 46, y);
      y += 12;
    });
    y += 8;
  }

  for (const section of ANAMNESIS_SECTIONS) {
    const values = data[section.key] || {};
    const entries = section.fields
      .map((f) => [f.label, fmtValue(values[f.key])] as const)
      .filter(([, v]) => v.trim() !== "");
    if (!entries.length) continue;

    ensure(40);
    doc.setTextColor(20);
    doc.setFontSize(12);
    doc.text(section.title.toUpperCase(), 40, y);
    y += 6;
    doc.setDrawColor(210);
    doc.line(40, y, W - 40, y);
    y += 14;

    doc.setFontSize(9);
    for (const [label, value] of entries) {
      const lines = doc.splitTextToSize(`${label}: ${value}`, W - 90);
      ensure(lines.length * 11 + 4);
      doc.setTextColor(60);
      doc.text(lines, 46, y);
      y += lines.length * 11 + 2;
    }
    y += 10;
  }

  doc.save(`anamnese-${(row.athlete_name || "paciente").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export { ANAMNESIS_SECTIONS, TOTAL_SECTIONS };
