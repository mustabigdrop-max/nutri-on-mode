import { describe, it, expect } from "vitest";
import seed from "@/data/cardTopics.json";
import { acharTema, montarKit, verificarKit, verificarCard, seloLinhas, iconePara, ICONES, type Topic } from "./cardKits";

const temas = seed as unknown as Topic[];
const creatina = acharTema("creatina", temas)!;
const sub = (slug: string) => creatina.subtemas.find(s => s.slug === slug)!;
const prova = (slug: string) => montarKit(creatina, sub(slug), "reel").find(c => c.papel === "prova" || c.papel === "ha_falta")!;

describe("P2 cards pro", () => {
  it("creatina tem 8 temas, incluindo Energia no cérebro", () => {
    expect(creatina.subtemas).toHaveLength(8);
    expect(creatina.subtemas.some(s => s.titulo === "Energia no cérebro")).toBe(true);
  });
  it("sono mostra 21h, Gordji-Nejad et al., Jülich e o chip de dose", () => {
    const c = prova("sono-e-privacao"); const s = seloLinhas(c.prova, c.chip)!;
    expect(c.numero).toBe("21h"); expect(s.autores).toBe("Gordji-Nejad et al.");
    expect(s.organizacao).toContain("Forschungszentrum Jülich"); expect(c.chip).toBe("NÃO É DOSE DO DIA A DIA");
  });
  it("memória mostra 492, Xu et al. e a correção de 2025", () => {
    const c = prova("cognicao-adultos-saudaveis"); const s = seloLinhas(c.prova, c.chip)!;
    expect(c.numero).toBe("492"); expect(s.autores).toBe("Xu et al."); expect(s.organizacao).toBeTruthy();
    expect(c.chip?.toLowerCase()).toContain("correção publicada em 2025");
  });
  it("neurotransmissores usa Há × Falta e bloqueia exportação até conferir o selo", () => {
    const k = montarKit(creatina, sub("dopamina-e-humor"), "reel");
    expect(k.some(c => c.papel === "ha_falta")).toBe(true);
    expect(verificarKit(k, sub("dopamina-e-humor")).exporta).toBe(false);
  });
  it("selo omite organização nula e o verificador avisa", () => {
    const c = prova("energia-cerebral");
    expect(seloLinhas(c.prova)!.organizacao).toBeNull();
    expect(verificarCard(c, sub("energia-cerebral")).some(a => a.motivo === "organização não informada")).toBe(true);
  });
  it("energia cerebral tem card de mecanismo com 4 passos", () => {
    const m = montarKit(creatina, sub("energia-cerebral"), "reel").find(c => c.papel === "mecanismo")!;
    expect(m.passos?.map(p => p.nome)).toEqual(["CREATINA", "FOSFOCREATINA", "ATP", "NEURÔNIO"]);
  });
  it.each(["aumenta a dopamina", "aumenta a serotonina", "melhora a inteligência"])("bloqueia '%s'", f => {
    const c = { ...montarKit(creatina, sub("forca-e-musculo"), "reel")[0], principal: `Creatina ${f}` };
    expect(verificarCard(c, sub("forca-e-musculo")).some(a => a.nivel === "bloqueio")).toBe(true);
  });
  it("sem engrenagem; sem correspondência, sem ícone", () => {
    expect((ICONES as readonly string[]).includes("engrenagem")).toBe(false);
    expect(iconePara("assunto qualquer xyz")).toBe("nenhum");
  });
});
