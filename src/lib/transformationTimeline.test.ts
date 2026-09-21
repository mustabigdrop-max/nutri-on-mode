import { describe, expect, it } from "vitest";
import { gerarTimeline, pontosDaTimeline } from "./transformationTimeline";
import { gerarRoteiroLiveApex } from "./liveApexScript";

const row = (data: string, base: number) => ({
  assessment_date: data,
  chest_upper: base,
  lats: base + 5,
  quads_l: base,
  quads_r: base + 2,
  glute_max: base - 5,
});

describe("transformation timeline", () => {
  it("não gera roteiro com menos de duas avaliações", () => {
    expect(gerarTimeline({ nome: "A", rows: [row("2026-01-10", 50)] })).toBeNull();
    expect(gerarTimeline({ nome: "A", rows: [] })).toBeNull();
  });

  it("ordena os pontos e calcula delta real", () => {
    const pontos = pontosDaTimeline([row("2026-05-01", 70), row("2026-01-01", 50)]);
    expect(pontos.map((p) => p.data)).toEqual(["2026-01-01", "2026-05-01"]);
    expect(pontos[0].delta).toBeNull();
    expect(pontos[1].delta).toBeGreaterThan(0);
  });

  it("monta frames com abertura, split e fecho", () => {
    const r = gerarTimeline({ nome: "Ana", rows: [row("2026-01-01", 50), row("2026-04-01", 65)] })!;
    expect(r.frames[0].tipo).toBe("abertura");
    expect(r.frames.some((f) => f.tipo === "split")).toBe(true);
    expect(r.frames[r.frames.length - 1].tipo).toBe("fecho");
    expect(r.deltaTotal).toBe(r.scoreFinal - r.scoreInicial);
  });
});

describe("live apex", () => {
  it("sem deficit registrado não há roteiro", () => {
    expect(gerarRoteiroLiveApex({ numeroEpisodio: 1, variacao: "padrao", atleta: "Ana", grupos: [] })).toBeNull();
  });

  it("prioriza biomecânico e limita a 3 grupos", () => {
    const r = gerarRoteiroLiveApex({
      numeroEpisodio: 4,
      variacao: "padrao",
      atleta: "Ana",
      grupos: [
        { grupo: "Glúteo máximo", tipo: "VOLUME" },
        { grupo: "Dorsal", tipo: "BIOMECANICO", evidencias: ["ombro eleva no pull"] },
        { grupo: "Peitoral", tipo: "ATIVACAO" },
        { grupo: "Panturrilhas", tipo: "ESTETICO" },
      ],
    })!;
    const analise = r.blocos.find((b) => b.nome === "ANÁLISE")!;
    expect(analise.fala.join(" ")).toContain("Dorsal");
    expect(analise.fala.join(" ")).toContain("3 grupos");
    expect(r.blocos[0].fala[0]).toContain("Diogo Mello");
  });
});
