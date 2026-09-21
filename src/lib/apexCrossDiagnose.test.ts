import { describe, expect, it } from "vitest";
import { diagnosticarAtletaCruzado, diagnosticarGrupoCruzado } from "@/lib/apexCrossDiagnose";
import { prescreverIntegrado } from "@/lib/apexIntegratedPrescription";

describe("diagnóstico cruzado visual × funcional", () => {
  it("sem resposta e sem score não classifica", () => {
    expect(diagnosticarGrupoCruzado({ grupo_key: "dorsal", respostas: {} })).toBeNull();
  });

  it("score baixo sem marcação funcional vira deficit de volume", () => {
    const g = diagnosticarGrupoCruzado({
      grupo_key: "dorsal",
      respostas: { D1: "a", D2: "a", D3: "a", D7: "a" },
      visual_score: 45,
    });
    expect(g?.tipo_primario).toBe("VOLUME");
  });

  it("marcação biomecânica tem prioridade sobre ativação", () => {
    const g = diagnosticarGrupoCruzado({
      grupo_key: "gluteos",
      respostas: { G1: "c", G2: "c", G5: "c", G7: "c" },
      visual_score: 50,
    });
    expect(g?.tipo_primario).toBe("BIOMECANICO");
    expect(g?.checklist_tags.some((t) => t.startsWith("FLAG_"))).toBe(true);
  });

  it("assimetria acima de 8% é sinalizada", () => {
    const g = diagnosticarGrupoCruzado({
      grupo_key: "biceps",
      respostas: { B1: "a", B2: "a" },
      visual_score: 80,
      assimetria_pct: 12,
    });
    expect(g?.apex_visual.assimetria_flag).toBe(true);
  });

  it("limita a três grupos priorizados por ciclo", () => {
    const d = diagnosticarAtletaCruzado([
      { grupo_key: "dorsal", respostas: { D1: "b", D7: "c" }, visual_score: 40 },
      { grupo_key: "peitoral", respostas: { P1: "b", P2: "c" }, visual_score: 45 },
      { grupo_key: "gluteos", respostas: { G1: "c", G2: "c" }, visual_score: 42 },
      { grupo_key: "quadriceps", respostas: { Q6: "c" }, visual_score: 48 },
    ]);
    expect(d.priorizados).toHaveLength(3);
    expect(d.fila).toHaveLength(1);
  });

  it("prescrição integrada cobre só os grupos priorizados e mantém nutrição como sugestão", () => {
    const d = diagnosticarAtletaCruzado([
      { grupo_key: "gluteos", respostas: { G1: "c", G2: "c", G5: "c", G7: "c" }, visual_score: 40 },
    ]);
    const p = prescreverIntegrado(d);
    expect(p.warmup.some((w) => w.tag === "[CORRECT]")).toBe(true);
    expect(p.nutriplan[0].detalhe).toMatch(/revisão profissional/i);
    expect(p.reavaliacao.checklist_semanas).toBe(4);
  });
});
