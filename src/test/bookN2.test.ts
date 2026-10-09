import { describe, it, expect } from "vitest";
import { avaliarCartao, DIA, podeVerResposta, recallValido, capituloLido, quizPassou, cartoesIniciais, capituloDominado, ritmo, estadoProva, montarProva, provaAprovada, podeRefazerProva, seloModulo, leituraAtiva, notasMarkdown, questoesCheckpoint, tamanhoProva, acertosParaAprovar, provaPassouAcertos, podeEntregarProjeto, type QItem } from "@/lib/bookRules";
import book from "@/data/academyBook.json";

const T = Date.UTC(2026, 9, 9, 12);
describe("Livro N2", () => {
  it("Leitner: acerto sobe, erro volta à 1, quase mantém, intervalos 1/3/7/21/60", () => {
    expect(avaliarCartao(1, "lembrei", T)).toEqual({ caixa: 2, due_at: new Date(T + 3 * DIA).toISOString() });
    expect(avaliarCartao(4, "lembrei", T).due_at).toBe(new Date(T + 60 * DIA).toISOString());
    expect(avaliarCartao(5, "lembrei", T).caixa).toBe(5);
    expect(avaliarCartao(4, "nao", T)).toEqual({ caixa: 1, due_at: new Date(T + DIA).toISOString() });
    expect(avaliarCartao(3, "quase", T)).toEqual({ caixa: 3, due_at: new Date(T + 7 * DIA).toISOString() });
  });
  it("Pare e pense exige 5 palavras; Recordar exige 20", () => {
    expect(podeVerResposta("um dois três quatro")).toBe(false);
    expect(podeVerResposta("um dois três quatro cinco")).toBe(true);
    expect(recallValido(Array(19).fill("x").join(" "))).toBe(false);
    expect(recallValido(Array(20).fill("x").join(" "))).toBe(true);
  });
  it("Lido com 90% de rolagem e 50% do tempo", () => {
    expect(capituloLido(90, 180, 6)).toBe(true);
    expect(capituloLido(89, 999, 6)).toBe(false);
    expect(capituloLido(100, 179, 6)).toBe(false);
  });
  it("Checkpoint exige 75%", () => { expect(quizPassou(3, 4)).toBe(true); expect(quizPassou(2, 3)).toBe(false); });
  it("Concluir o Capítulo 0 cria 4 cartões na caixa 1 vencendo em +1 dia", () => {
    const c = cartoesIniciais(book.capitulos[0].flashcards.length, T);
    expect(c).toHaveLength(4);
    expect(c.every(x => x.caixa === 1 && x.due_at === new Date(T + DIA).toISOString())).toBe(true);
  });
  it("Dominado: 80% em caixa 4–5 e aplique feito", () => {
    const cards = [{ caixa: 4 }, { caixa: 5 }, { caixa: 4 }, { caixa: 4 }, { caixa: 2 }];
    expect(capituloDominado(cards, true)).toBe(true);
    expect(capituloDominado(cards, false)).toBe(false);
    expect(capituloDominado([{ caixa: 4 }, { caixa: 2 }], true)).toBe(false);
  });
  it("Ritmo: 1 novo por dia (até 2), revisões antes, releitura livre", () => {
    expect(ritmo({ jaIniciado: false, novosHoje: 1, limite: 1, revisoesVencidas: 0 }).liberado).toBe(false);
    expect(ritmo({ jaIniciado: false, novosHoje: 1, limite: 2, revisoesVencidas: 0 }).liberado).toBe(true);
    expect(ritmo({ jaIniciado: false, novosHoje: 1, limite: 5, revisoesVencidas: 0 }).liberado).toBe(true);
    expect(ritmo({ jaIniciado: false, novosHoje: 2, limite: 5, revisoesVencidas: 0 }).liberado).toBe(false);
    expect(ritmo({ jaIniciado: false, novosHoje: 0, limite: 1, revisoesVencidas: 2 }).liberado).toBe(false);
    expect(ritmo({ jaIniciado: true, novosHoje: 9, limite: 1, revisoesVencidas: 9 }).liberado).toBe(true);
  });
  it("Prova: 2 dias de espera, 70% para aprovar, refazer após 24h", () => {
    expect(estadoProva(true, new Date(T - DIA).toISOString(), T)).toEqual({ visivel: true, pronta: false });
    expect(estadoProva(true, new Date(T - 2 * DIA).toISOString(), T).pronta).toBe(true);
    expect(estadoProva(false, null, T).visivel).toBe(false);
    expect(provaAprovada(70)).toBe(true); expect(provaAprovada(69)).toBe(false);
    expect(podeRefazerProva(new Date(T - 23 * 3600e3).toISOString(), T)).toBe(false);
    expect(podeRefazerProva(new Date(T - DIA).toISOString(), T)).toBe(true);
  });
  it("Prova: min(12, total) do módulo, sem repetir a ordem", () => {
    const q = (p: string, n: number): QItem[] => Array.from({ length: n }, (_, i) => ({ id: `${p}${i}`, chapter_slug: p, pergunta: "", opcoes: [], correta: 0 }));
    expect(montarProva(q("m", 20), [], 7)).toHaveLength(12);
    const small = q("m", 3);
    const prev = montarProva(small, [], 1).map(x => x.id);
    const next = montarProva(small, [prev], 1).map(x => x.id);
    expect(next.join()).not.toBe(prev.join());
  });
  it("N2b: Módulo 0 tem prova de 6 questões e 5 acertos; checkpoint segue com 3", () => {
    const c0 = book.capitulos[0] as any;
    expect(questoesCheckpoint(c0.quiz)).toHaveLength(3);
    expect(tamanhoProva(c0.quiz.length)).toBe(6);
    expect(acertosParaAprovar(6)).toBe(5);
    expect(provaPassouAcertos(5, 6)).toBe(true); expect(provaPassouAcertos(4, 6)).toBe(false);
  });
  it("N2b: projeto do Módulo 0 com 5 passos e 5 itens de rubrica; entregar exige rubrica completa", () => {
    const pj = (book.modulos[0] as any).projeto;
    expect(pj.titulo).toBe("Meu plano de estudo de 7 dias");
    expect(pj.passos).toHaveLength(5); expect(pj.rubrica).toHaveLength(5);
    const av = Object.fromEntries(pj.rubrica.map((r: string) => [r, 1]));
    expect(podeEntregarProjeto({ plano: "x", balanco: "y", rubrica: pj.rubrica, av, diasRevisao: null })).toBe(true);
    expect(podeEntregarProjeto({ plano: "x", balanco: "y", rubrica: pj.rubrica, av: {}, diasRevisao: null })).toBe(false);
    expect(podeEntregarProjeto({ plano: "x", balanco: "y", rubrica: pj.rubrica, av, diasRevisao: 2 })).toBe(false);
  });
  it("Selo exige prova aprovada e projeto entregue", () => {
    expect(seloModulo(80, true)).toBe(true); expect(seloModulo(80, false)).toBe(false); expect(seloModulo(60, true)).toBe(false);
  });
  it("Leitura ativa só com aba visível e interação nos últimos 60s", () => {
    expect(leituraAtiva(true, T - 60e3, T)).toBe(true);
    expect(leituraAtiva(true, T - 61e3, T)).toBe(false);
    expect(leituraAtiva(false, T, T)).toBe(false);
  });
  it("Exporta notas agrupadas por capítulo", () => {
    const md = notasMarkdown([{ chapter_slug: "c0", bloco_idx: 1, tipo: "duvida", trecho: "reler", texto: null, created_at: "x" }], { c0: "Cap 0" });
    expect(md).toContain("## Cap 0"); expect(md).toContain("**Dúvida**");
  });
  it("Seed tem 7 módulos, só o 0 publicado, slugs únicos", () => {
    expect(book.modulos).toHaveLength(7);
    expect(book.modulos.filter(m => m.status === "publicado").map(m => m.slug)).toEqual(["m0-como-estudar"]);
    expect(new Set(book.modulos.map(m => m.slug)).size).toBe(7);
  });
});
