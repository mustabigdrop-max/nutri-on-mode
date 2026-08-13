import {
  Apple, Dumbbell, Stethoscope, FlaskConical, Bone, Brain, Trophy, Activity,
  type LucideIcon,
} from "lucide-react";

export type ProfessionalRole =
  | "nutricionista"
  | "personal_trainer"
  | "medico_esportivo"
  | "nutrologo"
  | "fisioterapeuta"
  | "psicologo"
  | "coach_esportivo"
  | "preparador_fisico";

export type DataCategory =
  | "meal_plan"
  | "training_plan"
  | "supplements"
  | "pharmacology"
  | "lab_exams"
  | "body_composition"
  | "medical_records"
  | "prescriptions"
  | "anamnesis"
  | "check_ins"
  | "training_logs"
  | "photos"
  | "notes"
  | "psychology"
  | "rehab_protocol"
  | "cardio_protocol"
  | "sleep_data"
  | "stress_data";

export interface AlertTrigger {
  when: string;
  message: string;
}

export interface ProfessionalScope {
  role: ProfessionalRole;
  canWrite: DataCategory[];
  canRead: DataCategory[];
  cannotSee: DataCategory[];
  alerts: AlertTrigger[];
}

export const SCOPES: Record<ProfessionalRole, ProfessionalScope> = {
  nutricionista: {
    role: "nutricionista",
    canWrite: ["meal_plan", "supplements", "lab_exams", "anamnesis", "body_composition", "notes", "check_ins"],
    canRead: ["training_plan", "training_logs", "pharmacology", "medical_records", "photos", "cardio_protocol", "sleep_data", "stress_data", "rehab_protocol"],
    cannotSee: ["psychology", "prescriptions"],
    alerts: [
      { when: "training_plan_changed", message: "Personal atualizou o treino — revisar macros peri-treino" },
      { when: "pharmacology_changed", message: "Médico alterou protocolo farmacológico — revisar suporte nutricional" },
      { when: "lab_results_added", message: "Novos exames disponíveis — revisar protocolo" },
      { when: "weight_stalled", message: "Peso estagnado há 14 dias — considerar ajuste" },
    ],
  },
  personal_trainer: {
    role: "personal_trainer",
    canWrite: ["training_plan", "training_logs", "cardio_protocol", "body_composition", "notes", "photos"],
    canRead: ["meal_plan", "supplements", "lab_exams", "check_ins", "sleep_data", "stress_data", "rehab_protocol", "anamnesis"],
    cannotSee: ["pharmacology", "psychology", "prescriptions", "medical_records"],
    alerts: [
      { when: "meal_plan_changed", message: "Nutri atualizou o plano alimentar — verificar energia peri-treino" },
      { when: "rehab_protocol_updated", message: "Fisio atualizou reabilitação — ajustar exercícios" },
      { when: "injury_reported", message: "Cliente reportou dor/lesão — avaliar treino" },
    ],
  },
  medico_esportivo: {
    role: "medico_esportivo",
    canWrite: ["medical_records", "prescriptions", "pharmacology", "lab_exams", "notes", "anamnesis"],
    canRead: ["meal_plan", "training_plan", "supplements", "training_logs", "body_composition", "check_ins", "photos", "cardio_protocol", "sleep_data", "stress_data", "rehab_protocol"],
    cannotSee: ["psychology"],
    alerts: [
      { when: "lab_results_abnormal", message: "Exames com valores fora da faixa — revisar" },
      { when: "pharmacology_side_effects", message: "Cliente reportou efeitos colaterais" },
      { when: "overtraining_detected", message: "Sinais de overtraining detectados" },
    ],
  },
  nutrologo: {
    role: "nutrologo",
    canWrite: ["meal_plan", "supplements", "prescriptions", "pharmacology", "lab_exams", "medical_records", "anamnesis", "notes"],
    canRead: ["training_plan", "training_logs", "body_composition", "check_ins", "photos", "cardio_protocol", "sleep_data", "stress_data", "rehab_protocol"],
    cannotSee: ["psychology"],
    alerts: [
      { when: "training_plan_changed", message: "Treino atualizado — revisar protocolo" },
      { when: "lab_results_added", message: "Novos exames — revisar" },
    ],
  },
  fisioterapeuta: {
    role: "fisioterapeuta",
    canWrite: ["rehab_protocol", "notes", "body_composition"],
    canRead: ["training_plan", "training_logs", "photos", "medical_records", "anamnesis", "sleep_data"],
    cannotSee: ["meal_plan", "pharmacology", "psychology", "prescriptions", "supplements"],
    alerts: [
      { when: "injury_reported", message: "Cliente reportou dor — avaliar" },
      { when: "training_plan_changed", message: "Treino mudou — verificar compatibilidade com reabilitação" },
    ],
  },
  psicologo: {
    role: "psicologo",
    canWrite: ["psychology", "notes"],
    canRead: ["anamnesis", "check_ins", "sleep_data", "stress_data"],
    cannotSee: ["meal_plan", "training_plan", "pharmacology", "lab_exams", "prescriptions", "medical_records", "training_logs", "supplements", "body_composition", "photos"],
    alerts: [
      { when: "stress_high", message: "Estresse alto reportado — avaliar" },
      { when: "binge_reported", message: "Episódio de compulsão reportado" },
    ],
  },
  coach_esportivo: {
    role: "coach_esportivo",
    canWrite: ["training_plan", "cardio_protocol", "notes", "training_logs"],
    canRead: ["meal_plan", "supplements", "body_composition", "check_ins", "photos", "sleep_data", "stress_data", "lab_exams"],
    cannotSee: ["pharmacology", "psychology", "prescriptions", "medical_records"],
    alerts: [{ when: "meal_plan_changed", message: "Nutrição atualizada — ajustar periodização" }],
  },
  preparador_fisico: {
    role: "preparador_fisico",
    canWrite: ["training_plan", "cardio_protocol", "body_composition", "training_logs", "notes"],
    canRead: ["meal_plan", "supplements", "check_ins", "photos", "sleep_data", "stress_data", "rehab_protocol", "lab_exams"],
    cannotSee: ["pharmacology", "psychology", "prescriptions", "medical_records"],
    alerts: [
      { when: "injury_reported", message: "Lesão reportada — adaptar treino" },
      { when: "meal_plan_changed", message: "Nutrição mudou — verificar energia" },
    ],
  },
};

export interface RoleMeta {
  label: string;
  short: string;
  color: string;
  icon: LucideIcon;
  registration: string;
  emoji: string;
}

export const ROLE_META: Record<ProfessionalRole, RoleMeta> = {
  nutricionista: { label: "Nutricionista", short: "Nutri", color: "#00D4FF", icon: Apple, registration: "CRN", emoji: "🍽️" },
  personal_trainer: { label: "Personal Trainer", short: "Personal", color: "#00FF88", icon: Dumbbell, registration: "CREF", emoji: "🏋️" },
  medico_esportivo: { label: "Médico do Esporte", short: "Médico", color: "#FF6B6B", icon: Stethoscope, registration: "CRM", emoji: "🩺" },
  nutrologo: { label: "Nutrólogo", short: "Nutrólogo", color: "#9B59B6", icon: FlaskConical, registration: "CRM/RQE", emoji: "🧪" },
  fisioterapeuta: { label: "Fisioterapeuta", short: "Fisio", color: "#FFD700", icon: Bone, registration: "CREFITO", emoji: "🦴" },
  psicologo: { label: "Psicólogo", short: "Psico", color: "#FF69B4", icon: Brain, registration: "CRP", emoji: "🧠" },
  coach_esportivo: { label: "Coach Esportivo", short: "Coach", color: "#00FF88", icon: Trophy, registration: "Certificação", emoji: "🏆" },
  preparador_fisico: { label: "Preparador Físico", short: "Preparador", color: "#00FF88", icon: Activity, registration: "CREF", emoji: "⚡" },
};

export const PROFESSIONAL_ROLES = Object.keys(ROLE_META) as ProfessionalRole[];

export const CATEGORY_LABEL: Record<DataCategory, string> = {
  meal_plan: "Plano alimentar",
  training_plan: "Plano de treino",
  supplements: "Suplementação",
  pharmacology: "Protocolo farmacológico",
  lab_exams: "Exames laboratoriais",
  body_composition: "Composição corporal",
  medical_records: "Prontuário médico",
  prescriptions: "Prescrições",
  anamnesis: "Anamnese",
  check_ins: "Check-ins",
  training_logs: "Logs de treino",
  photos: "Fotos de evolução",
  notes: "Notas",
  psychology: "Notas psicológicas",
  rehab_protocol: "Protocolo de reabilitação",
  cardio_protocol: "Protocolo de cardio",
  sleep_data: "Dados de sono",
  stress_data: "Estresse / HRV",
};

export const VISIBILITY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "nutri_only", label: "Só nutri" },
  { value: "personal_only", label: "Só personal" },
  { value: "medico_only", label: "Só médico" },
  { value: "nutri_personal", label: "Nutri + Personal" },
  { value: "nutri_medico", label: "Nutri + Médico" },
  { value: "personal_medico", label: "Personal + Médico" },
  { value: "private", label: "Privada (só eu)" },
];

export const isProfessionalRole = (v: unknown): v is ProfessionalRole =>
  typeof v === "string" && v in ROLE_META;

/** Mapeia o professional_type legado do nutriON para a nova ProfessionalRole */
export const roleFromProfessionalType = (t: string | null | undefined): ProfessionalRole => {
  switch (t) {
    case "nutritionist": return "nutricionista";
    case "personal_trainer": return "personal_trainer";
    case "medico": return "medico_esportivo";
    case "bodybuilding_coach": return "coach_esportivo";
    case "nutrition_coach": return "nutricionista";
    default: return "nutricionista";
  }
};
