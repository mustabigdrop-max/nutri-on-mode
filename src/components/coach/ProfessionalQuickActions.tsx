import { useNavigate } from "react-router-dom";
import {
  FileText, Activity, ClipboardCheck, Pill, Eye, Brain, Trophy, FlaskConical,
  Stethoscope, Apple, Dumbbell, type LucideIcon,
} from "lucide-react";
import { PROFILE_META, type ProfessionalType } from "@/lib/professionalTypes";

interface Action {
  label: string;
  icon: LucideIcon;
  route: string;
  primary?: boolean;
}

const ACTIONS_BY_TYPE: Record<ProfessionalType, Action[]> = {
  nutritionist: [
    { label: "GERAR PLANO ALIMENTAR", icon: FileText, route: "/coach/plano-alimentar", primary: true },
    { label: "MATRIX Intelligence", icon: Brain, route: "/coach/matrix" },
    { label: "Check-ins", icon: ClipboardCheck, route: "/coach/checkins" },
    { label: "Suplementação", icon: Pill, route: "/coach/suplementos" },
  ],
  personal_trainer: [
    { label: "GERAR TREINO", icon: Dumbbell, route: "/coach/training", primary: true },
    { label: "AXIS Intelligence", icon: Activity, route: "/coach/axis" },
    { label: "Avaliação Física", icon: Eye, route: "/coach/avaliacao" },
    { label: "Check-ins", icon: ClipboardCheck, route: "/coach/checkins" },
  ],
  nutrition_coach: [
    { label: "GERAR PLANO", icon: FileText, route: "/coach/plano-alimentar", primary: true },
    { label: "Protocolo Comportamental", icon: Brain, route: "/coach/pca" },
    { label: "MATRIX Intelligence", icon: Apple, route: "/coach/matrix" },
    { label: "Check-ins", icon: ClipboardCheck, route: "/coach/checkins" },
  ],
  bodybuilding_coach: [
    { label: "GERAR PLANO", icon: FileText, route: "/coach/plano-alimentar", primary: true },
    { label: "GERAR TREINO", icon: Dumbbell, route: "/coach/training", primary: true },
    { label: "APEX Visual", icon: Eye, route: "/coach/apex-visual" },
    { label: "Dr. VERTEX", icon: FlaskConical, route: "/coach/vertex" },
    { label: "Peak Week", icon: Trophy, route: "/coach/competition" },
    { label: "Check-ins", icon: ClipboardCheck, route: "/coach/checkins" },
  ],
  medico: [
    { label: "Protocolo Clínico", icon: Stethoscope, route: "/coach/plano-alimentar", primary: true },
    { label: "Farmacologia", icon: FlaskConical, route: "/coach/vertex" },
    { label: "Exames e Biomarcadores", icon: Activity, route: "/coach/exames" },
    { label: "Check-ins", icon: ClipboardCheck, route: "/coach/checkins" },
  ],
};

interface Props {
  professionalType: ProfessionalType | null;
}

const ProfessionalQuickActions = ({ professionalType }: Props) => {
  const nav = useNavigate();
  if (!professionalType) return null;
  const meta = PROFILE_META[professionalType];
  const actions = ACTIONS_BY_TYPE[professionalType];
  const accent = meta.color;

  return (
    <div className="space-y-2">
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 8,
          color: `${accent}99`,
          letterSpacing: "0.18em",
        }}
      >
        AÇÕES RÁPIDAS · {meta.label.toUpperCase()}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.route + a.label}
              onClick={() => nav(a.route)}
              className="flex items-center gap-2 px-3 py-3 text-left transition-all hover:scale-[1.01]"
              style={{
                background: a.primary ? accent : "transparent",
                color: a.primary ? "#020205" : `${accent}cc`,
                border: a.primary ? "none" : `1px solid ${accent}33`,
                fontFamily: "Rajdhani, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.06em",
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                if (!a.primary) (e.currentTarget as HTMLElement).style.background = `${accent}10`;
              }}
              onMouseLeave={(e) => {
                if (!a.primary) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfessionalQuickActions;
