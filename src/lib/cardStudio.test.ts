import { describe, it, expect } from "vitest";
import { agenteCards, cardsDoReel, RECUSA_DADO, limitarPalavras, temIAouAI, corTextoAA, contraste } from "./cardStudio";

describe("Agente de Cards", () => {
  it("intenção versus ação devolve 3 propostas com cena em código", () => {
    const r = agenteCards("card sobre intenção versus ação");
    expect(r.tipo).toBe("propostas");
    if (r.tipo === "propostas") { expect(r.propostas).toHaveLength(3); r.propostas.forEach(p => expect(p.conteudo.cena).toBeTruthy()); }
  });
  it("número sem fonte é recusado com a frase prevista", () => {
    const r = agenteCards("card com 70% das pessoas comem à noite".replace("pessoas", "brasileiros"));
    expect(r).toMatchObject({ tipo: "recusa", mensagem: RECUSA_DADO });
  });
  it("número com fonte verificada e achado científico gera card A", () => {
    const r = agenteCards("card 30% menos fome", { fonte_status: "verificada", tipo_afirmacao: "achado_cientifico", referencia: "Autor, 2020, Revista" });
    expect(r.tipo).toBe("propostas");
    if (r.tipo === "propostas") expect(r.propostas[0].template).toBe("numero");
  });
  it.each(["card com rosto sorrindo", "antes e depois do cutting", "card com logo da Nike"])("recusa %s", c => {
    expect(agenteCards(c).tipo).toBe("recusa");
  });
  it("texto principal limitado a 12 palavras", () => {
    expect(limitarPalavras("a b c d e f g h i j k l m n").split(" ")).toHaveLength(12);
  });
  it("cards do reel: capa + blocos + CTA, sem card de dado sem fonte", () => {
    const cards = cardsDoReel([{ id: 1, texto_tela: "80% erram isso" }, { id: 2, fala: "Primeiro, depois, por fim" }, { id: 3, funcao: "CTA", fala: "Comenta LISTA" }], { tema: "Compras", palavraChave: "LISTA" });
    expect(cards[0].nome).toBe("capa"); expect(cards.at(-1)!.conteudo.titulo).toContain("LISTA");
    expect(cards.some(c => c.tipo === "A")).toBe(false);
  });
  it("contraste AA garantido", () => { expect(contraste("#020205", corTextoAA("#020205", "#222222"))).toBeGreaterThanOrEqual(4.5); });
  it("detecta IA/AI", () => { expect(temIAouAI("Agente de Cards")).toBe(false); });
});
