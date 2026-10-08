import { describe, expect, it } from "vitest";
import { creatorScriptPrompt, SCRIPT_LIMITS, spokenWordBudget } from "../../supabase/functions/_shared/creatorScriptRules";

describe("creator script constraints", () => {
  it("uses 2.5 to 3 spoken words per second for a real duration", () => {
    expect(spokenWordBudget(30)).toEqual({ min: 75, max: 90 });
    expect(spokenWordBudget(10)).toEqual({ min: 25, max: 30 });
    expect(spokenWordBudget(0)).toBeNull();
    expect(spokenWordBudget(NaN)).toBeNull();
  });
  it("limits each sentence to 14 words", () => {
    expect(SCRIPT_LIMITS.wordsPerSentence).toBe(14);
  });
  it("uses saved calibration, not client-supplied calibration", () => {
    const prompt = creatorScriptPrompt({ niches: ["nutrição"], creator_profile: {
      ganchos_que_retiveram_mais: ["gancho medido"],
    } }, { creator_profile: { ganchos_que_retiveram_mais: ["inventado"] } });
    const data = JSON.parse(prompt.split("\n")[1]);
    expect(data.ganchos_que_retiveram_mais).toEqual(["gancho medido"]);
    expect(data.loops_que_funcionaram).toBeNull();
    expect(data.nicho).toEqual(["nutrição"]);
  });
  it("keeps unknown calibration empty and accepts the current video objective", () => {
    const prompt = creatorScriptPrompt(null, { objective: "educar", tone: "direto" });
    const data = JSON.parse(prompt.split("\n")[1]);
    expect(data.objetivo).toBe("educar");
    expect(data.tom).toBe("direto");
    expect(data.ctas_que_converteram).toBeNull();
    expect(data.expressoes_que_ele_usa).toBeNull();
  });
});