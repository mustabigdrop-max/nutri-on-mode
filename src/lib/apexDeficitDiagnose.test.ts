import { describe, expect, it } from "vitest";
import { diagnosticarAtleta, diagnosticarGrupo } from "./apexDeficitDiagnose";

describe("APEX DIAGNOSE", () => {
  it("retorna null sem respostas", () => {
    expect(diagnosticarGrupo({ grupo_key: "dorsal", respostas: {} })).toBeNull();
    expect(diagnosticarGrupo({ grupo_key: "inexistente", respostas: { D1: "a" } })).toBeNull();
  });

  it("classifica ativação e estético do dorsal com prioridade correta", () => {
    const d = diagnosticarGrupo({
      grupo_key: "dorsal",
      respostas: { D1: "b", D4: "c", D7: "c" },
      visual_score: 42,
    })!;
    const ativacao = d.deficits.find((x) => x.tipo === "ATIVACAO")!;
    expect(ativacao.severidade).toBe("SEVERO");
    expect(ativacao.evidencias).toHaveLength(3);
    expect(d.deficits.some((x) => x.tipo === "ESTETICO")).toBe(true);
    expect(d.prioridade_tratamento).toEqual(["ATIVACAO", "ESTETICO"]);
    expect(d.fase_recomendada).toContain("ACTIVATE");
    expect(d.reavaliacao_semanas).toBe(4);
  });

  it("biomecânico vem antes de ativação e volume", () => {
    const d = diagnosticarGrupo({
      grupo_key: "gluteos",
      respostas: { G7: "c", G5: "b", G1: "c" },
    })!;
    expect(d.prioridade_tratamento[0]).toBe("BIOMECANICO");
    expect(d.fase_recomendada.startsWith("CORRECT")).toBe(true);
  });

  it("estético isolado é reclassificado como volume", () => {
    const d = diagnosticarGrupo({
      grupo_key: "panturrilha",
      respostas: { PA1: "a", PA2: "a", PA3: "a", PA4: "a", PA5: "a" },
      visual_score: 35,
    })!;
    const volume = d.deficits.find((x) => x.tipo === "VOLUME")!;
    expect(volume.severidade).toBe("SEVERO");
    expect(d.prioridade_tratamento).toContain("VOLUME");
  });

  it("score adequado não gera deficit estético", () => {
    const d = diagnosticarGrupo({
      grupo_key: "biceps",
      respostas: { B1: "a", B2: "a", B3: "a", B4: "a", B5: "a" },
      visual_score: 80,
    })!;
    expect(d.deficits).toHaveLength(0);
    expect(d.reavaliacao_semanas).toBeNull();
  });

  it("dor persistente gera encaminhamento profissional", () => {
    const d = diagnosticarGrupo({ grupo_key: "deltoides", respostas: { O5: "d" } })!;
    expect(d.encaminhamento).toHaveLength(1);
    expect(d.encaminhamento[0]).toContain("avaliação profissional");
  });

  it("marca assimetria sem criar deficit", () => {
    const d = diagnosticarGrupo({ grupo_key: "quadriceps", respostas: { Q5: "b" } })!;
    expect(d.assimetria).toBe(true);
    expect(d.deficits).toHaveLength(0);
  });

  it("ordena prioridades globais por tipo e severidade", () => {
    const r = diagnosticarAtleta([
      { grupo_key: "posterior_coxa", respostas: { IC1: "d", IC3: "d" } },
      { grupo_key: "gluteos", respostas: { G7: "c", G5: "c" } },
    ]);
    expect(r.prioridades[0].tipo).toBe("BIOMECANICO");
    expect(r.prioridades[0].grupo_key).toBe("gluteos");
    expect(r.proxima_reavaliacao.checklist_semanas).toBe(4);
    expect(r.proxima_reavaliacao.visual_semanas).toBe(8);
  });
});
