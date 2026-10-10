import { describe, it, expect } from "vitest";
import seed from "@/data/cardTopics.json";
import { acharTema, ordenarSubtemas, montarKit, verificarKit, verificarCard, temCardDado, temaSemFonte, iconePara, fotoPermitida, precisaAvisoSecundaria, FALTA_RESSALVA, type Topic } from "@/lib/cardKits";

const temas = seed as unknown as Topic[];
const t = temas[0]; const sub = (s: string) => t.subtemas.find(x => x.slug === s)!;

describe("Agente de Cards 2.0", () => {
  it("creatina acha o tema com 9 subtemas, ordenados por evidência", () => {
    expect(acharTema("Creatina", temas)?.slug).toBe("creatina");
    expect(acharTema("monohidrato de creatina", temas)?.slug).toBe("creatina");
    const o = ordenarSubtemas(t.subtemas); expect(o).toHaveLength(9);
    expect(o[o.length - 1].slug).toBe("dose-e-uso");
  });
  it("Dopamina e Dose ficam sem card de dado", () => {
    expect(temCardDado(sub("dopamina-e-humor"))).toBe(false);
    expect(temCardDado(sub("dose-e-uso"))).toBe(false);
    expect(montarKit(t, sub("dose-e-uso"), "reel").find(c => c.papel === "prova")).toBeUndefined();
    expect(montarKit(t, sub("dose-e-uso"), "reel").some(c => c.papel === "prova_bloqueada")).toBe(true);
  });
  it("Força: 5 cards no Reel e 7 no Carrossel, prova com selo", () => {
    const r = montarKit(t, sub("forca-e-musculo"), "reel"); const c = montarKit(t, sub("forca-e-musculo"), "carrossel");
    expect(r).toHaveLength(5); expect(c).toHaveLength(7);
    expect(r.find(x => x.papel === "prova")?.selo).toBeTruthy();
    expect(r.every(x => x.principal.split(/\s+/).length <= 12)).toBe(true);
  });
  it("Rim não exporta sem o card de ressalva", () => {
    const s = sub("rim-e-seguranca"); const k = montarKit(t, s, "reel");
    expect(verificarKit(k, s).exporta).toBe(true);
    const sem = k.filter(c => c.papel !== "ressalva"); const v = verificarKit(sem, s);
    expect(v.exporta).toBe(false); expect(v.kit[0].motivo).toBe(FALTA_RESSALVA);
  });
  it("número sem prova e frase de 'não dizer' são bloqueados", () => {
    const s = sub("forca-e-musculo"); const k = montarKit(t, s, "reel");
    const g = { ...k[0], principal: "Ganhe 2 kg em 30 dias" };
    expect(verificarCard(g, s).some(a => a.nivel === "bloqueio")).toBe(true);
    const n = { ...k[0], principal: "Funciona para todo mundo" };
    expect(verificarCard(n, s).some(a => a.nivel === "bloqueio" && /não dizer/.test(a.motivo))).toBe(true);
    expect(verificarCard(k[0], s).some(a => a.nivel === "bloqueio")).toBe(false);
  });
  it("sem tema: modo Sem fonte só com cards conceituais", () => {
    const sf = temaSemFonte("jejum"); expect(sf.subtemas.length).toBeGreaterThanOrEqual(4); expect(sf.subtemas.length).toBeLessThanOrEqual(6);
    const k = montarKit(sf, sf.subtemas[0], "reel");
    expect(k.some(c => c.papel === "prova")).toBe(false);
    expect(k.every(c => !/\d/.test(c.principal))).toBe(true);
  });
  it("ícone por significado e recusa de foto", () => {
    expect(iconePara("sono e noite")).toBe("lua"); expect(iconePara("treino de força")).toBe("haltere"); expect(iconePara("x", "rim")).toBe("rim");
    expect(fotoPermitida("fisico")).toBe(false); expect(fotoPermitida("embalagem")).toBe(false); expect(fotoPermitida("ambiente")).toBe(true);
  });
  it("prova secundária pede aviso antes de exportar", () => {
    expect(precisaAvisoSecundaria(montarKit(t, sub("rim-e-seguranca"), "reel"))).toBe(true);
  });
});
