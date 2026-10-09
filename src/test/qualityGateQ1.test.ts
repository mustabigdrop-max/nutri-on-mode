import { describe, it, expect } from "vitest";
import { verificarBloco, verificarReel, linguagemAbsoluta, tetoVerificador } from "../../supabase/functions/_shared/reelVerifier";
import { notaFinal, estadoQualidade, aplicarRevisao } from "../../supabase/functions/_shared/qualityGate";
import { contentScores, spearman, parsePesos, percentil } from "@/lib/contentScore";

const o = { proibidas: [], tipoAfirmacao: null, temFonte: false };
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const b = (id: number, fala: string, tempo = "10-15s", funcao = "") => ({ id, tempo, fala, funcao });

describe("Q1 — linguagem absoluta", () => {
  it("'toda a tensão' e 'pra não errar mais' são absolutos", () => {
    expect(linguagemAbsoluta(norm("Isso joga toda a tensão na lombar"))).toHaveLength(1);
    expect(linguagemAbsoluta(norm("Faça assim pra não errar mais"))).toHaveLength(1);
  });
  it("'toda segunda' e 'todo dia' não são absolutos", () => {
    expect(linguagemAbsoluta(norm("Comece a dieta toda segunda e treine todo dia"))).toHaveLength(0);
    expect(linguagemAbsoluta(norm("Todos os dias, de manhã"))).toHaveLength(0);
  });
  it("cada ocorrência: teto 7 e pendência crítica", () => {
    const r = verificarBloco(b(2, "Jamais faça isso."), 2, o);
    expect(r.teto).toBe(7);
    expect(r.pendencias.some(p => p.gravidade === "critico" && p.regra === "linguagem_absoluta")).toBe(true);
  });
});

describe("Q1 — ressalva, CTA e antítese", () => {
  it("tema de dor sem Ressalva: teto 7 e pendência 'sem_ressalva'", () => {
    const v = verificarReel([b(1, "Seu stiff dói na lombar?", "0-2s"), b(2, "Salva esse vídeo pra conferir depois.")], o);
    expect(v[0].teto).toBe(7);
    expect(v[0].pendencias.some(p => p.regra === "sem_ressalva" && p.gravidade === "critico")).toBe(true);
  });
  it("com Ressalva antes do CTA não há pendência", () => {
    const v = verificarReel([b(1, "Seu stiff dói na lombar?", "0-2s"), b(2, "Se a lombar doer, pare e procure um profissional."), b(3, "Salva esse vídeo pra conferir depois.")], o);
    expect(v.flatMap(x => x.pendencias).some(p => p.regra === "sem_ressalva")).toBe(false);
  });
  it("CTA sem motivo: teto 6", () => {
    const v = verificarReel([b(1, "Olhe o quadril.", "0-2s"), b(2, "Salva esse vídeo.")], o);
    expect(v[1].teto).toBe(6);
  });
  it("'Não é sobre a carga. É…' gera só aviso, sem teto", () => {
    const r = verificarBloco(b(3, "Não é sobre a carga. É o quadril."), 3, o);
    expect(r.avisos.some(a => a.startsWith("antítese"))).toBe(true);
    expect(r.teto).toBe(9);
  });
  it("teto do Verificador é 10 quando nenhuma regra dispara", () => {
    expect(tetoVerificador(verificarReel([b(1, "Olhe o quadril.", "0-2s"), b(2, "Salva pra conferir depois.")], o))).toBe(10);
  });
});

describe("Q1 — porta de qualidade", () => {
  it("nota final é o menor entre Crítico 1, Crítico 2 e Verificador", () => expect(notaFinal(9.4, 8.7, 10)).toBe(8.7));
  it("ELITE só com ≥ 9.5 e nenhuma pendência", () => {
    expect(estadoQualidade(9.6, [])).toBe("elite");
    expect(estadoQualidade(9.6, [{ gravidade: "leve" }])).toBe("aprovado");
  });
  it("APROVADO exige ≥ 9.0 e nenhuma pendência crítica", () => {
    expect(estadoQualidade(9.0, [{ gravidade: "moderado" }])).toBe("aprovado");
    expect(estadoQualidade(9.2, [{ gravidade: "critico", origem: "critico2" }])).toBe("rascunho");
    expect(estadoQualidade(8.9, [])).toBe("rascunho");
  });
  it("Revisor: não muda bloco sem pendência nem aceita número novo", () => {
    const blocks = [b(1, "Olhe o quadril."), b(2, "Faça 3 séries.")].map(x => ({ ...x, texto_tela: "", estimulo_visual: "", gatilho: "" }));
    const r = aplicarRevisao(blocks, { blocos_alterados: [{ id: 1, depois: "Outro texto." }, { id: 2, depois: "Faça 12 séries." }] }, [2]);
    expect(blocks[0].fala).toBe("Olhe o quadril.");
    expect(blocks[1].fala).toBe("Faça 3 séries.");
    expect(r.rejeitadas).toHaveLength(2);
  });
});

describe("Q1 — Content Score", () => {
  const res = (i: number, extra: any = {}) => ({ id: `r${i}`, script_id: `s${i}`, status: "lancado", created_at: new Date(2026, 0, i + 1).toISOString(), pct_3s: 40 + i * 5, ...extra });
  it("menos de 5 reels com resultado: calibrando", () => {
    const s = contentScores([1, 2, 3, 4].map(i => res(i)));
    expect(s.pronto).toBe(false); expect(s.n).toBe(4);
  });
  it("componentes vazios ficam de fora e os pesos são renormalizados", () => {
    const s = contentScores([1, 2, 3, 4, 5].map(i => res(i)));
    expect(s.pronto).toBe(true);
    expect(s.ultimo!.usados).toEqual(["gancho"]);
    expect(s.ultimo!.score).toBe(percentil(65, [45, 50, 55, 60, 65]));
  });
  it("registros 'aguardando' não contam", () => expect(contentScores([1, 2, 3, 4, 5].map(i => res(i, { status: "aguardando" }))).n).toBe(0));
  it("pesos padrão 30/35/20/15 e editáveis", () => {
    expect(parsePesos("")).toEqual({ gancho: 30, retencao: 35, acao: 20, seguidor: 15 });
    expect(parsePesos("Gancho 50\nRetenção 10").gancho).toBe(50);
  });
  it("Spearman: ordem igual = 1, inversa = -1", () => {
    expect(spearman([[1, 10], [2, 20], [3, 30]])).toBe(1);
    expect(spearman([[1, 30], [2, 20], [3, 10]])).toBe(-1);
  });
});
