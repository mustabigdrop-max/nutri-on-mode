import { Dumbbell, Apple, Activity, Brain, Trophy, Stethoscope, type LucideIcon } from "lucide-react";

export type ProfessionalType =
  | "nutritionist"
  | "personal_trainer"
  | "nutrition_coach"
  | "bodybuilding_coach"
  | "medico";

export type ProfileChoice = "athlete" | ProfessionalType;

export interface ProfileMeta {
  id: ProfileChoice;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;          // hex
  badge: string;          // "PROFISSIONAL" | "ELITE" | "CLÍNICO" | "GRATUITO"
  badgeColor: string;     // hex
  isProfessional: boolean;
  isElite?: boolean;
}

export const PROFILE_META: Record<ProfileChoice, ProfileMeta> = {
  athlete: {
    id: "athlete",
    label: "Atleta / Cliente",
    description: "Quero acompanhar minha evolução, receber planos e usar os módulos do sistema",
    icon: Dumbbell,
    color: "#00C896",
    badge: "GRATUITO",
    badgeColor: "#00C896",
    isProfessional: false,
  },
  nutritionist: {
    id: "nutritionist",
    label: "Nutricionista",
    description: "Quero gerenciar pacientes, gerar planos alimentares e acompanhar evolução nutricional",
    icon: Apple,
    color: "#B8922A",
    badge: "PROFISSIONAL",
    badgeColor: "#B8922A",
    isProfessional: true,
  },
  personal_trainer: {
    id: "personal_trainer",
    label: "Personal Trainer",
    description: "Quero gerenciar alunos, prescrever treinos e acompanhar performance física",
    icon: Activity,
    color: "#B8922A",
    badge: "PROFISSIONAL",
    badgeColor: "#B8922A",
    isProfessional: true,
  },
  nutrition_coach: {
    id: "nutrition_coach",
    label: "Nutrition Coach",
    description: "Combino nutrição e comportamento para transformar o estilo de vida dos clientes",
    icon: Brain,
    color: "#B8922A",
    badge: "PROFISSIONAL",
    badgeColor: "#B8922A",
    isProfessional: true,
  },
  bodybuilding_coach: {
    id: "bodybuilding_coach",
    label: "Coach Bodybuilding",
    description: "Preparo atletas para competição — nutrição, treino, farmacologia e palco",
    icon: Trophy,
    color: "#00D4FF",
    badge: "ELITE",
    badgeColor: "#00D4FF",
    isProfessional: true,
    isElite: true,
  },
  medico: {
    id: "medico",
    label: "Médico / Nutrólogo",
    description: "Prescrevo protocolos clínicos integrados com nutrição e suplementação",
    icon: Stethoscope,
    color: "#00C896",
    badge: "CLÍNICO",
    badgeColor: "#B8922A",
    isProfessional: true,
  },
};

export const PROFILE_CHOICES: ProfileChoice[] = [
  "athlete",
  "nutritionist",
  "personal_trainer",
  "nutrition_coach",
  "bodybuilding_coach",
  "medico",
];

export const isProfessionalType = (v: string | null | undefined): v is ProfessionalType =>
  !!v && ["nutritionist","personal_trainer","nutrition_coach","bodybuilding_coach","medico"].includes(v);
