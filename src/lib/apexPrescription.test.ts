import { describe, expect, it } from "vitest";
import { diagnosticarAtleta } from "./apexDeficitDiagnose";
import { prescreverApex } from "./apexPrescription";

describe("APEX PRESCRIBE", () => {
  it("não prescreve nada sem diagnóstico", () => {
    const p = prescreverApex(diagnosticarAtleta([]));
    expect(p.warmup).toHaveLength(0);
    expect(p.ativacao).toHaveLength(0);
    expect(p.nutricao).toHaveLength(0);
  });

  it("gera warm-up CORRECT e ACTIVATE com fases completas", () => {
    const diag = diagnosticarAtleta([{ grupo_key: "gluteos", respostas: { G7: "c", G2: "c", G1: "c" } }]);
    const p = prescreverApex(diag);
    expect(p.correcao).toHaveLength(1);
    expect(p.correcao[0].itens.map((i) => i.fase_nome)).toEqual(
      expect.arrayContaining(["RELEASE", "STRETCH", "ACTIVATE", "INTEGRATE"]),
    );
    expect(p.warmup.some((w) => w.tag === "[CORRECT]")).toBe(true);
    expect(p.warmup.some((w) => w.tag === "[ACTIVATE]")).toBe(true);
    expect(p.ativacao[0].series).toBe("2-3 séries");
    expect(p.ativacao[0].reps).toBe("10-15 repetições");
  });

  it("deficit severo de ativação gera feeder session", () => {
    const diag = diagnosticarAtleta([{ grupo_key: "dorsal", respostas: { D1: "b", D4: "c", D7: "c" } }]);
    const p = prescreverApex(diag);
    expect(p.feeders).toHaveLength(1);
    expect(p.feeders[0].alvo).toContain("latíssimo");
  });

  it("deficit biomecânico não recebe técnica de intensificação", () => {
    const diag = diagnosticarAtleta([{ grupo_key: "quadriceps", respostas: { Q3: "b" } }]);
    const p = prescreverApex(diag);
    expect(p.tecnicas.some((t) => t.deficit === "BIOMECANICO")).toBe(false);
  });

  it("ajustes nutricionais saem como sugestão para revisão profissional", () => {
    const diag = diagnosticarAtleta([{ grupo_key: "dorsal", respostas: { D1: "b" } }]);
    const p = prescreverApex(diag);
    expect(p.nutricao.length).toBeGreaterThan(0);
    for (const n of p.nutricao) expect(n.detalhe).toContain("revisão profissional");
  });

  it("propaga encaminhamento e prazos de reavaliação", () => {
    const diag = diagnosticarAtleta([{ grupo_key: "deltoides", respostas: { O5: "d", O2: "c" } }]);
    const p = prescreverApex(diag);
    expect(p.encaminhamentos.length).toBeGreaterThan(0);
    expect(p.reavaliacao.checklist_semanas).toBe(4);
  });
});
