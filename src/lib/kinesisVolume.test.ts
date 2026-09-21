import { describe, expect, it } from "vitest";
import { checarSessao, faixaVolume, prescreverVolume } from "./kinesisVolume";

describe("KINESIS — prescrição de volume", () => {
  it("resolve a faixa MEV→MRV por sinônimo de grupo", () => {
    expect(faixaVolume("Dorsal", "avancado")).toEqual({ mev: 14, mrv: 25 });
    expect(faixaVolume("peito", "iniciante")).toEqual({ mev: 6, mrv: 12 });
    expect(faixaVolume("grupo inexistente xyz", "avancado")).toBeNull();
  });

  it("deficit de VOLUME soma séries sem passar do MRV", () => {
    const p = prescreverVolume("Peito", "intermediario", "VOLUME", true)!;
    expect(p.series_semana).toBeLessThanOrEqual(p.faixa.mrv);
    expect(p.series_semana).toBeGreaterThan(p.faixa.mev);
    expect(p.tecnica_obrigatoria).toContain("Myo-reps");
  });

  it("deficit BIOMECÂNICO reduz o volume e proíbe técnica de fadiga", () => {
    const normal = prescreverVolume("Quadríceps", "avancado", "MANUTENCAO", true)!;
    const bio = prescreverVolume("Quadríceps", "avancado", "BIOMECANICO", true)!;
    expect(bio.series_semana).toBeLessThan(normal.series_semana);
    expect(bio.tecnica_obrigatoria).toContain("ZERO técnica de fadiga");
  });

  it("deficit de ATIVAÇÃO mantém volume com técnica de pausa", () => {
    const p = prescreverVolume("Glúteos", "intermediario", "ATIVACAO", true)!;
    expect(p.tecnica_obrigatoria).toContain("Pausa isométrica");
    expect(p.series_semana).toBeLessThanOrEqual(p.faixa.mrv);
  });

  it("divide em mais sessões quando passa de 10 séries semanais", () => {
    const p = prescreverVolume("Costas (total)", "avancado", "VOLUME", true)!;
    expect(p.sessoes_sugeridas).toBeGreaterThan(1);
    expect(p.series_por_sessao).toBeLessThanOrEqual(10);
  });

  it("avisa quando a sessão estoura o limite de séries", () => {
    expect(checarSessao(7).ok).toBe(true);
    expect(checarSessao(12).ok).toBe(false);
    expect(checarSessao(12).aviso).toContain("dividir");
  });
});
