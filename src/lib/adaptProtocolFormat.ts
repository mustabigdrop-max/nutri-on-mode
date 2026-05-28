// Normalizes any training protocol JSON variant to the renderer's standard shape.

function stripCodeFences(s: string): string {
  return s.replace(/```(?:json|JSON)?/g, "").replace(/```/g, "").trim();
}

function normalizeMusclePriorities(mp: any): any[] {
  if (!mp) return [];
  if (Array.isArray(mp)) return mp;
  if (typeof mp === "object") {
    return Object.entries(mp).map(([muscle, data]: [string, any]) => ({
      muscle,
      weekly_sets:
        data?.weekly_sets ??
        data?.weekly_sets_mav ??
        data?.weekly_sets_mev ??
        12,
      priority: data?.priority ?? "media",
    }));
  }
  return [];
}

function normalizeTrainingDays(td: any): any[] {
  if (!td) return [];
  if (Array.isArray(td)) {
    return td.map((d: any, i: number) => ({
      ...d,
      day_number: d?.day_number ?? i + 1,
    }));
  }
  if (typeof td === "object") {
    return Object.entries(td).map(([key, day]: [string, any], i) => ({
      ...(day || {}),
      day_number:
        day?.day_number ??
        (parseInt(String(key).replace(/\D/g, ""), 10) || i + 1),
    }));
  }
  return [];
}

function synthesizeBlockOverview(raw: any, clientName?: string): any {
  return {
    title:
      raw?.block_overview?.title ||
      (clientName ? `Protocolo ${clientName}` : raw?.title || "Protocolo de Treino"),
    duration_weeks:
      raw?.block_overview?.duration_weeks ||
      raw?.mesocycle_duration_weeks ||
      raw?.duration_weeks ||
      4,
    deload_week:
      raw?.block_overview?.deload_week ||
      raw?.deload_week ||
      raw?.mesocycle_duration_weeks ||
      4,
    split_type:
      raw?.block_overview?.split_type ||
      raw?.training_system_base ||
      raw?.split_type ||
      "PPL",
    split_justification:
      raw?.block_overview?.split_justification || raw?.split_justification || "",
    progression_model:
      raw?.block_overview?.progression_model ||
      raw?.progression_model ||
      "Dupla progressão",
    muscle_priorities: normalizeMusclePriorities(
      raw?.block_overview?.muscle_priorities ?? raw?.muscle_priorities
    ),
    coach_notes:
      raw?.block_overview?.coach_notes ||
      raw?.coach_notes ||
      raw?.observations ||
      "",
  };
}

export function adaptProtocolFormat(raw: any): any {
  if (!raw) return raw;

  // String input: try to parse JSON (with code-fence stripping)
  if (typeof raw === "string") {
    const trimmed = stripCodeFences(raw);
    try {
      const parsed = JSON.parse(trimmed);
      return adaptProtocolFormat(parsed);
    } catch {
      return raw;
    }
  }

  if (typeof raw !== "object") return raw;

  // Already has block_overview + training_days → just normalize arrays
  if (raw.block_overview && raw.training_days) {
    return {
      ...raw,
      block_overview: {
        ...raw.block_overview,
        muscle_priorities: normalizeMusclePriorities(
          raw.block_overview.muscle_priorities
        ),
      },
      training_days: normalizeTrainingDays(raw.training_days),
    };
  }

  // Has training_days (any shape) but missing block_overview → synthesize
  if (raw.training_days) {
    return {
      ...raw,
      block_overview: synthesizeBlockOverview(raw, raw.client_name),
      phase_plan: raw.phase_plan,
      improvement_alerts: raw.improvement_alerts || raw.alerts || [],
      training_days: normalizeTrainingDays(raw.training_days),
    };
  }

  // Alternate top-level format (client_name / mesocycle_duration_weeks / ...)
  if (
    raw.client_name ||
    raw.mesocycle_duration_weeks ||
    raw.training_frequency_days_per_week
  ) {
    return {
      block_overview: synthesizeBlockOverview(raw, raw.client_name),
      phase_plan: raw.phase_plan || {
        macrocycle_title: raw.phase || "Hipertrofia",
        current_phase: raw.phase || "cutting",
        phases: [],
      },
      improvement_alerts: raw.improvement_alerts || raw.alerts || [],
      training_days: normalizeTrainingDays(raw.training_days),
    };
  }

  return raw;
}
