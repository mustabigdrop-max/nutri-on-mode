import { describe, expect, it } from "vitest";
import { buildMasterOrchestration, flaggedGroupsFromVisual } from "@/lib/apexOrchestrator";
import type { ApexZonesAnalysis } from "@/lib/apexVisualZones";

const visual: ApexZonesAnalysis = {
  zones: {
    abdomen: { score: 5.2, weight: 25 },
    deltoides_ombros: { score: 7.5, weight: 15 },
    bracos: { score: 8, weight: 12 },
    pernas: { score: 4.5, weight: 15 },
    gluteos_lombar: { score: 6.8, weight: 18 },
    vascularizacao: { score: 7, weight: 8 },
    pele_subcutaneo: { score: 7, weight: 7 },
  },
  weighted_score: 6.3,
  photos_analyzed: ["Frontal", "Lateral", "Posterior"],
};

describe("APEX Master Orchestrator", () => {
  it("mapeia somente grupos visualmente sinalizados", () => {
    expect(flaggedGroupsFromVisual(visual)).toEqual(["core", "quadriceps", "posterior_coxa"]);
  });

  it("pausa no checklist antes de gerar prescrição", () => {
    const result = buildMasterOrchestration({
      triggerSource: "fotos_uploaded",
      athleteId: "athlete",
      athleteName: "Atleta",
      visualAnalysis: visual,
      checklistMode: "pending",
    });
    expect(result.status).toBe("waiting_checklist");
    expect(result.plano_treino).toEqual({});
    expect(result.execution_log.at(-1)?.status).toBe("pending");
  });

  it("gera avaliação parcial quando o checklist é pulado", () => {
    const result = buildMasterOrchestration({
      triggerSource: "fotos_uploaded",
      athleteId: "athlete",
      athleteName: "Atleta",
      visualAnalysis: visual,
      checklistMode: "skipped",
    });
    expect(result.status).toBe("partial_ready");
    expect(result.protocolos_ativos.length).toBeGreaterThan(0);
    expect(result.praxis_messages.every((m) => m.send_on_approval === true)).toBe(true);
  });
});