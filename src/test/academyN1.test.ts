import { describe, it, expect } from "vitest";
import { dominada, revisoesDaAula, treinarErro, errosDoReel, plano14, nivelPorDominio, tempoEstimado, comparativoTecnica, origemTreino } from "../../supabase/functions/_shared/academyRules";

describe("Academia N1", () => {
  it("mastered only with 70+ on 2 different days", () => {
    expect(dominada([{ dia: "2026-10-01", nota: 80 }, { dia: "2026-10-01", nota: 90 }])).toBe(false);
    expect(dominada([{ dia: "2026-10-01", nota: 80 }, { dia: "2026-10-02", nota: 70 }])).toBe(true);
  });
  it("finishing a lesson creates 4 reviews at 1, 3, 7, 21 days", () => {
    expect(revisoesDaAula("x").map(r => r.intervalo_dias)).toEqual([1, 3, 7, 21]);
  });
  it("2 correct in a row marks error as superado", () => {
    const a = treinarErro({ acertos_seguidos: 0 }, true);
    expect(a.status).toBe("aberto");
    expect(treinarErro(a, true).status).toBe("superado");
    expect(treinarErro(a, false).acertos_seguidos).toBe(0);
  });
  it("reel errors: max 3 with rule and lesson", () => {
    const m = [1, 2, 3, 4].map(id => ({ id, regras: ["Saudação no início (teto 3)"] }));
    const e = errosDoReel(m, [1, 2, 3, 4].map(id => ({ id, fala: `fala ${id}` })));
    expect(e.length).toBe(3);
    expect(e[0].regra).toBe("saudação");
    expect(e[0].lesson_slug).toBe("t3-dois-segundos");
  });
  it("14-day plan has rest on days 6 and 12", () => {
    const p = plano14("gancho", [{ slug: "t2-lacuna", trilha: "A", ordem: 1, titulo: "x" }], "2026-10-09");
    expect(p.length).toBe(14);
    expect(p.filter(d => d.descanso).map(d => d.dia)).toEqual([6, 12]);
  });
  it("levels: Retor and Mestre need 8 mastered lessons", () => {
    expect(nivelPorDominio(85, 7)).toBe("Orador");
    expect(nivelPorDominio(85, 8)).toBe("Mestre");
    expect(nivelPorDominio(20, 0)).toBe("Ouvinte");
  });
  it("time estimate: reading + 3 exercise + 2 quiz", () => {
    expect(tempoEstimado({ conceito: "a b c", exercicio: "faça" })).toBe(1 + 3 + 2);
  });
  it("technique comparison shows no data until results exist", () => {
    expect(comparativoTecnica("antítese", [{ id: "a", tecnicas: ["antítese"] }], []).reels).toBe(0);
    expect(comparativoTecnica("antítese", [{ id: "a", tecnicas: ["antítese"] }], [{ script_id: "a", pct_3s: 50 }]).selo).toBe("Indício");
  });
  it("60s drill uses an open notebook error first", () => {
    expect(origemTreino([{ id: "1", frase: "oi", regra: "saudação", status: "aberto" }], {}).tipo).toBe("erro");
  });
});
