import { describe, it, expect } from "vitest";
import { verificarBloco, temaAmplo } from "../../supabase/functions/_shared/reelVerifier";

const o = { proibidas: ["crucial", "muda tudo"], tipoAfirmacao: null, temFonte: false };
const b = (fala: string, tempo = "10-15s") => ({ id: 3, tempo, fala });

describe("verificarReel (PROMPT K1)", () => {
  it("'siga o perfil' tem teto 3", () => expect(verificarBloco(b("Agora SIGA o perfil para mais."), 4, o).teto).toBe(3));
  it("'siga' citando a próxima parte da série não é limitado", () => expect(verificarBloco(b("Siga, amanhã tem a parte 2."), 4, o).teto).toBe(9));
  it("saudação na abertura tem teto 3", () => expect(verificarBloco(b("Oi pessoal, tudo bem?", "0-2s"), 0, o).teto).toBe(3));
  it("abertura com mais de 12 palavras tem teto 5", () => expect(verificarBloco(b("um dois três quatro cinco seis sete oito nove dez onze doze treze", "0-2s"), 0, o).teto).toBe(5));
  it("frase com mais de 14 palavras tem teto 7", () => expect(verificarBloco(b("um dois três quatro cinco seis sete oito nove dez onze doze treze catorze quinze"), 3, o).teto).toBe(7));
  it("termo proibido tem teto 5", () => expect(verificarBloco(b("Isso é crucial."), 3, o).teto).toBe(5));
  it("número sem fonte força reescrita", () => {
    const r = verificarBloco(b("Um estudo mostrou 30% a mais."), 3, o);
    expect(r.riscos).toContain("dado sem fonte"); expect(r.forcar_reescrita).toBe(true);
  });
  it("número com achado científico e fonte passa", () => expect(verificarBloco(b("São 3 gramas por dia."), 3, { ...o, tipoAfirmacao: "achado_cientifico", temFonte: true }).forcar_reescrita).toBe(false));
  it("'Comportamento antes do alimento' é tema amplo", () => expect(temaAmplo("Comportamento antes do alimento")).toBe(true));
});
