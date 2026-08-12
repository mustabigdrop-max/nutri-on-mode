import type { CoachAthlete } from "@/hooks/useCoachAthletes";

export type AgendaType =
  | "checkin_pending"
  | "no_contact"
  | "plan_missing"
  | "training_missing"
  | "refeed_day";

export interface AgendaItem {
  id: string;
  dateLabel: string;
  athleteId: string;
  athleteName: string;
  type: AgendaType;
  priority: "high" | "medium" | "low";
  message: string;
  action?: string;
  actionRoute?: string;
}

const PRIORITY_ORDER: Record<AgendaItem["priority"], number> = { high: 0, medium: 1, low: 2 };

const nextFridayLabel = () => {
  const d = new Date();
  const diff = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

export function generateAgenda(athletes: CoachAthlete[]): AgendaItem[] {
  const items: AgendaItem[] = [];
  const hoje = "Hoje";

  for (const a of athletes) {
    if (a.diasDesdeCheckin > 30) {
      items.push({
        id: `${a.userId}-no_contact`,
        dateLabel: hoje,
        athleteId: a.userId,
        athleteName: a.name,
        type: "no_contact",
        priority: "high",
        message: `${a.name} — ${a.diasDesdeCheckin} dias sem contato`,
        action: "Ver perfil",
        actionRoute: `/coach/patient/${a.userId}`,
      });
    } else if (a.diasDesdeCheckin > 3) {
      items.push({
        id: `${a.userId}-checkin`,
        dateLabel: hoje,
        athleteId: a.userId,
        athleteName: a.name,
        type: "checkin_pending",
        priority: a.diasDesdeCheckin > 14 ? "high" : "medium",
        message: `${a.name} — último check-in há ${a.diasDesdeCheckin} dias`,
        action: "Ver perfil",
        actionRoute: `/coach/patient/${a.userId}`,
      });
    }

    if (!a.hasActiveMealPlan) {
      items.push({
        id: `${a.userId}-plan_missing`,
        dateLabel: hoje,
        athleteId: a.userId,
        athleteName: a.name,
        type: "plan_missing",
        priority: "high",
        message: `${a.name} — sem plano alimentar ativo`,
        action: "Gerar plano",
        actionRoute: `/coach/plano-alimentar?athlete=${a.userId}`,
      });
    }

    if (!a.hasActiveTrainingPlan) {
      items.push({
        id: `${a.userId}-training_missing`,
        dateLabel: hoje,
        athleteId: a.userId,
        athleteName: a.name,
        type: "training_missing",
        priority: "medium",
        message: `${a.name} — sem treino ativo`,
        action: "Montar treino",
        actionRoute: `/coach/trainingon?athlete=${a.userId}`,
      });
    }

    const faseLower = (a.fase || "").toLowerCase();
    if (a.semanaAtual && a.semanaAtual % 4 === 0 && faseLower.includes("cut")) {
      items.push({
        id: `${a.userId}-refeed`,
        dateLabel: `Sexta (${nextFridayLabel()})`,
        athleteId: a.userId,
        athleteName: a.name,
        type: "refeed_day",
        priority: "low",
        message: `${a.name} — refeed programado (semana ${a.semanaAtual})`,
      });
    }
  }

  return items.sort((x, y) => PRIORITY_ORDER[x.priority] - PRIORITY_ORDER[y.priority]);
}
