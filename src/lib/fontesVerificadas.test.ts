import { describe, it, expect } from "vitest";
import seed from "@/data/cardTopics.json";
import { montarFontes, fontesUsadas, chavesFaltaFonte, deveParar, numerosCobertos } from "../../supabase/functions/_shared/fontesVerificadas";
import { custoRevalidacao, contarPilares } from "./revalidarBanco";

const fv = montarFontes(seed as any[], "A creatina te deixa inchado?", []);
describe("Q2 fontes verificadas", () => {
  it("inclui a prova de Ribeiro (27 homens, 8 semanas) e a fala segura", () => {
    expect(fv.texto).toContain("Ribeiro");
    expect(fv.falas_seguras.some(f => f.includes("27 homens"))).toBe(true);
    expect(numerosCobertos("27 homens por 8 semanas", fv.numeros)).toBe(true);
    expect(fv.nao_dizer).toContain("Creatina não retém líquido");
  });
  it("número fora das provas não é coberto", () => { expect(numerosCobertos("ensaio com 999 pessoas", fv.numeros)).toBe(false); });
  it("fontes usadas lista autor e ano", () => {
    expect(fontesUsadas(fv, "Num ensaio com 27 homens treinados")).toContainEqual({ autor: "Ribeiro", ano: 2020, tipo: "ensaio_controlado_placebo" });
  });
  it("para quando a falta de fonte repete em 2 rodadas", () => {
    const p = [{ bloco: 3, regra: "dado_sem_fonte", gravidade: "critico" }];
    expect(deveParar(chavesFaltaFonte(p), chavesFaltaFonte(p))).toBe("3|dado");
    expect(deveParar([], chavesFaltaFonte(p))).toBeNull();
    expect(chavesFaltaFonte([{ bloco: 3, regra: "dado_sem_fonte", gravidade: "moderado" }])).toEqual([]);
  });
  it("custo e contagem p1/p2", () => {
    expect(custoRevalidacao(2)).toEqual({ min: 6, max: 22, porReelMax: 11 });
    expect(contarPilares([{ slug: "p1-a" }, { slug: "p2-b" }, { slug: "p2-c" }, { slug: null }])).toMatchObject({ p1: 1, p2: 2 });
  });
});
import { verificarReel } from "../../supabase/functions/_shared/reelVerifier";
describe("Q2 limites da prova", () => {
  it("bloqueia 'não sob a pele' quando a prova não mede água sob a pele", () => {
    expect(fv.alem_do_limite).toContain("pele");
    const v = verificarReel([{ id: 1, tempo: "0-2s", fala: "Ela puxa água pro músculo, não pra debaixo da pele." }], { proibidas: [], temFonte: true, alemDoLimite: fv.alem_do_limite });
    expect(v[0].pendencias.some(p => p.regra === "afirmacao_sem_prova" && p.gravidade === "critico")).toBe(true);
  });
});
describe("Q2 número da prova", () => {
  it("'ensaio com 27 homens' passa com a prova cadastrada; com 30 não", () => {
    const o = { proibidas: [], temFonte: true, numerosFonte: fv.numeros, tipoAfirmacao: "posicao_do_metodo" };
    const ok = verificarReel([{ id: 1, tempo: "6-12s", fala: "Um estudo com 27 homens treinados mostrou isso." }], o);
    const ruim = verificarReel([{ id: 1, tempo: "6-12s", fala: "Um estudo com 30 homens treinados mostrou isso." }], o);
    expect(ok[0].pendencias.some(p => p.regra === "dado_sem_fonte")).toBe(false);
    expect(ruim[0].pendencias.some(p => p.regra === "dado_sem_fonte")).toBe(true);
  });
});
