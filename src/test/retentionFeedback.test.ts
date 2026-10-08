import { describe, it, expect } from "vitest";
import { alignBlocks, biggestDrop, classifyPatterns, mergeProfile } from "../../supabase/functions/_shared/retentionFeedback";
const blocks = [{ id: 1, tempo: "0-2s", previsto: 8 }, { id: 2, tempo: "2-6s", previsto: 8 }, { id: 3, tempo: "6-12s", previsto: 7 }];
const pts = [{ segundo: 0, audiencia: 100 }, { segundo: 2, audiencia: 90 }, { segundo: 6, audiencia: 45 }, { segundo: 12, audiencia: 40 }];
describe("retention feedback", () => {
  it("real block score is retention kept inside the block", () => {
    expect(alignBlocks(blocks, pts).map(c => c.real)).toEqual([9, 5, 8.9]);
  });
  it("flags predicted 8 vs real 5 as error -3", () => { expect(alignBlocks(blocks, pts)[1].erro).toBe(-3); });
  it("biggest drop belongs to the block where it starts", () => { expect(biggestDrop(blocks, pts)).toEqual({ segundo: 2, bloco: 2, queda_pontos: 45 }); });
  it("pattern needs 3 videos to be confirmed", () => {
    const tag = { chave: "numero_no_gancho", tipo: "gancho" as const, descricao: "Número no gancho" };
    expect(classifyPatterns([tag], [["numero_no_gancho"]]).hints[0].videos).toBe(2);
    expect(classifyPatterns([tag], [["numero_no_gancho"], ["numero_no_gancho"]]).confirmed).toHaveLength(1);
  });
  it("only confirmed patterns enter the profile", () => {
    expect(mergeProfile({}, [{ chave: "x", tipo: "queda", descricao: "Explicação longa" }]).o_que_derrubou_retencao).toEqual(["Explicação longa"]);
  });
});
