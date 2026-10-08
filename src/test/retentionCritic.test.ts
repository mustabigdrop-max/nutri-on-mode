import { describe, expect, it, vi } from "vitest";
import { CRITIC_LIMITS, normalizeCritique, objectiveChecks, replaceBlock, reviewRetention, type ScriptBlock } from "../../supabase/functions/_shared/retentionCritic";

const block: ScriptBlock = { id: 1, tempo: "0-2s", fala: "Motivação falha. Seu sistema permanece.", caminho: ["hook"] };
const critic = (nota: number) => ({ notas_por_bloco: [{ id: 1, nota, causa_da_queda: "Promessa vaga", correcao: "Mostre uma escolha concreta." }], riscos_de_conteudo: [], veredito: "A promessa precisa ficar clara." });
describe("retention critic rules", () => {
  it("counts words per block and per sentence before scoring", () => {
    expect(objectiveChecks(block)).toMatchObject({ palavras: 5, palavras_por_frase: [2, 3], palavras_por_seg: 2.5, ritmo_invalido: false });
  });
  it("penalizes more than 14 words in one sentence", () => {
    const long = { ...block, tempo: "0-6s", fala: "um dois três quatro cinco seis sete oito nove dez onze doze treze quatorze quinze" };
    expect(normalizeCritique(critic(10), [long]).notas_por_bloco[0].nota).toBe(7);
  });
  it("penalizes less than 2 words per second", () => {
    expect(normalizeCritique(critic(9), [{ ...block, tempo: "0-3s" }]).notas_por_bloco[0].nota).toBe(7);
  });
  it("penalizes more than 3 words per second", () => {
    expect(normalizeCritique(critic(9), [{ ...block, tempo: "0-1s" }]).notas_por_bloco[0].nota).toBe(7);
  });
  it("caps a greeting hook at 3", () => {
    expect(normalizeCritique(critic(10), [{ ...block, fala: "Oi pessoal. Hoje eu vou explicar." }]).notas_por_bloco[0].nota).toBe(3);
  });
  it("rewrites a risky block even when its score is 8", () => {
    const risk = { ...critic(8), riscos_de_conteudo: [{ id: 1, risco: "Número sem fonte." }] };
    expect(normalizeCritique(risk, [block]).blocos_para_reescrever).toEqual([1]);
  });
  it("caps vague opening context at 3", () => {
    expect(normalizeCritique({ ...critic(9), notas_por_bloco: [{ ...critic(9).notas_por_bloco[0], contexto_vago: true }] }, [block]).notas_por_bloco[0].nota).toBe(3);
  });
  it("caps an unclear promise at 5", () => {
    const promise = { ...block, id: 2, tempo: "2-6s", fala: "Uma promessa sem explicação clara não ajuda você a escolher." };
    expect(normalizeCritique({ notas_por_bloco: [{ id: 2, nota: 9, promessa_incompreensivel: true }] }, [promise]).notas_por_bloco[0].nota).toBe(5);
  });
  it("never fabricates a score for an omitted block", () => {
    expect(() => normalizeCritique({}, [block])).toThrow("faltou nota");
  });
  it("revises only the exact mapped text, including nested arrays", () => {
    const result = { concepts: [{ script: { hook: block.fala, cta: "Salve." } }] };
    expect(replaceBlock(result, { ...block, caminho: ["concepts", 0, "script", "hook"] }, "Seu sistema supera sua motivação.")).toBe(true);
    expect(result.concepts[0].script).toEqual({ hook: "Seu sistema supera sua motivação.", cta: "Salve." });
  });
  it("rejects ambiguous replacements", () => {
    expect(replaceBlock({ hook: `${block.fala} ${block.fala}` }, { ...block }, "Novo")).toBe(false);
  });
  it("limits redactor to two rounds and shows scores below 7", async () => {
    const result = { hook: block.fala, caption: "Intocada", roteiros_retencao: [{ blocos: [{ ...block }] }] };
    const complete = vi.fn(async (system: string, input: unknown) => system.includes("Você é o Redator")
      ? { blocos: [{ id: 1, fala: block.fala }] } : critic(6));
    const reviewed = await reviewRetention(result, complete, "Regras") as Record<string, any>;
    expect(CRITIC_LIMITS.maxRounds).toBe(2);
    expect(complete.mock.calls.filter(([s]) => s.includes("Você é o Redator"))).toHaveLength(2);
    expect(reviewed.critica_retencao[0]).toMatchObject({ rodadas: 2, nota_geral: 6 });
    expect(reviewed.critica_retencao[0].historico).toHaveLength(3);
    expect(reviewed.critica_retencao[0].avisos[0].texto).toContain("Este trecho está fraco. Sugestão de gravação:");
    expect(reviewed.caption).toBe("Intocada");
    for (const [system, input] of complete.mock.calls) if (system.includes("Você é o Redator")) expect(Object.keys(input as object)).toEqual(["blocos"]);
  });
  it("does not review non-script results", async () => {
    const complete = vi.fn();
    expect(await reviewRetention({ caption: "Legenda" }, complete, "")).toEqual({ caption: "Legenda" });
    expect(complete).not.toHaveBeenCalled();
  });
});