/** Perfis profissionais do nutriON — determinam formato padrão e nomenclatura. */
export type ProfessionalRole =
  | "nutrition_coach"
  | "nutritionist"
  | "nutrologist"
  | "personal_trainer";

export type PlanFormat = "caseiras" | "gramas" | "ambos";

export interface ProfessionalRoleConfig {
  id: ProfessionalRole;
  label: string;
  registrationLabel: string | null;
  /** Formato padrão de exibição do plano. */
  defaultFormat: PlanFormat;
  /** Formatos disponíveis nas configurações do NutriPlan. */
  allowedFormats: PlanFormat[];
  /** Nomenclatura usada no plano (título/rodapé). */
  planNoun: string;
  disclaimer: string;
  /** Recursos extras liberados por categoria. */
  micronutrients: boolean;
  pharmacology: boolean;
  focus: string;
}

export const PROFESSIONAL_ROLES: Record<ProfessionalRole, ProfessionalRoleConfig> = {
  nutrition_coach: {
    id: "nutrition_coach",
    label: "Nutrition Coach",
    registrationLabel: null,
    defaultFormat: "caseiras",
    allowedFormats: ["caseiras", "ambos"],
    planNoun: "Orientação alimentar",
    disclaimer:
      "Orientação alimentar de coach — não substitui a consulta com nutricionista ou médico.",
    micronutrients: false,
    pharmacology: false,
    focus: "Educação alimentar e comportamento",
  },
  nutritionist: {
    id: "nutritionist",
    label: "Nutricionista (CRN)",
    registrationLabel: "CRN",
    defaultFormat: "gramas",
    allowedFormats: ["gramas", "ambos", "caseiras"],
    planNoun: "Prescrição dietética",
    disclaimer: "Prescrição dietética elaborada por nutricionista responsável.",
    micronutrients: true,
    pharmacology: false,
    focus: "Prescrição dietética e micronutrientes",
  },
  nutrologist: {
    id: "nutrologist",
    label: "Nutrólogo (CRM)",
    registrationLabel: "CRM",
    defaultFormat: "gramas",
    allowedFormats: ["gramas", "ambos", "caseiras"],
    planNoun: "Prescrição médica nutricional",
    disclaimer: "Prescrição médica nutricional elaborada por médico responsável.",
    micronutrients: true,
    pharmacology: true,
    focus: "Prescrição médica e farmacologia integrada",
  },
  personal_trainer: {
    id: "personal_trainer",
    label: "Personal Trainer (CREF)",
    registrationLabel: "CREF",
    defaultFormat: "caseiras",
    allowedFormats: ["caseiras", "ambos"],
    planNoun: "Orientação alimentar",
    disclaimer:
      "Orientação alimentar de apoio ao treino — não substitui a consulta com nutricionista ou médico.",
    micronutrients: false,
    pharmacology: false,
    focus: "Timing de nutrição peri-treino",
  },
};

export const PROFESSIONAL_ROLE_LIST = Object.values(PROFESSIONAL_ROLES);

/** Converte `professional_type` legado para a nova categoria. */
export const roleFromProfessionalType = (type?: string | null): ProfessionalRole => {
  switch (type) {
    case "nutritionist":
      return "nutritionist";
    case "medico":
      return "nutrologist";
    case "personal_trainer":
      return "personal_trainer";
    default:
      return "nutrition_coach";
  }
};

export const resolveProfessionalRole = (
  role?: string | null,
  legacyType?: string | null,
): ProfessionalRoleConfig => {
  if (role && role in PROFESSIONAL_ROLES) return PROFESSIONAL_ROLES[role as ProfessionalRole];
  return PROFESSIONAL_ROLES[roleFromProfessionalType(legacyType)];
};
