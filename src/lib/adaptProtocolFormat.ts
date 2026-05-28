// Normalizes any training protocol JSON variant to the renderer's standard shape.
export function adaptProtocolFormat(raw: any): any {
  if (!raw) return raw;

  // Already in expected format
  if (raw.block_overview && raw.training_days) {
    // Ensure training_days is an array
    if (!Array.isArray(raw.training_days) && typeof raw.training_days === "object") {
      raw.training_days = Object.entries(raw.training_days).map(
        ([key, day]: [string, any]) => ({
          ...day,
          day_number: day?.day_number ?? parseInt(String(key).replace(/\D/g, ""), 10) ?? 1,
        })
      );
    }
    // Ensure muscle_priorities is an array
    const mp = raw.block_overview?.muscle_priorities;
    if (mp && !Array.isArray(mp) && typeof mp === "object") {
      raw.block_overview.muscle_priorities = Object.entries(mp).map(
        ([muscle, data]: [string, any]) => ({
          muscle,
          weekly_sets: data?.weekly_sets ?? data?.weekly_sets_mav ?? data?.weekly_sets_mev ?? 12,
          priority: data?.priority ?? "media",
        })
      );
    }
    return raw;
  }

  // Alternate format (client_name / mesocycle_duration_weeks / ...)
  if (raw.client_name || raw.mesocycle_duration_weeks || raw.training_frequency_days_per_week) {
    const musclePrioritiesArray = raw.muscle_priorities
      ? Array.isArray(raw.muscle_priorities)
        ? raw.muscle_priorities
        : Object.entries(raw.muscle_priorities).map(
            ([muscle, data]: [string, any]) => ({
              muscle,
              weekly_sets: data?.weekly_sets ?? data?.weekly_sets_mav ?? data?.weekly_sets_mev ?? 12,
              priority: data?.priority ?? "media",
            })
          )
      : [];

    const daysArray = Array.isArray(raw.training_days)
      ? raw.training_days
      : raw.training_days
        ? Object.entries(raw.training_days).map(
            ([key, day]: [string, any]) => ({
              ...day,
              day_number: day?.day_number ?? parseInt(String(key).replace(/\D/g, ""), 10) ?? 1,
            })
          )
        : [];

    return {
      block_overview: {
        title: raw.client_name ? `Protocolo ${raw.client_name}` : (raw.title || "Protocolo de Treino"),
        duration_weeks: raw.mesocycle_duration_weeks || raw.duration_weeks || 4,
        deload_week: raw.deload_week || raw.mesocycle_duration_weeks || 4,
        split_type: raw.training_system_base || raw.split_type || "PPL",
        split_justification: raw.split_justification || "",
        progression_model: raw.progression_model || "Dupla progressão",
        muscle_priorities: musclePrioritiesArray,
        coach_notes: raw.coach_notes || raw.observations || "",
      },
      phase_plan: raw.phase_plan || {
        macrocycle_title: raw.phase || "Hipertrofia",
        current_phase: raw.phase || "cutting",
        phases: [],
      },
      improvement_alerts: raw.improvement_alerts || raw.alerts || [],
      training_days: daysArray,
    };
  }

  return raw;
}
