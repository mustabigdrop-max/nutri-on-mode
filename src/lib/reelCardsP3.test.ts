import { describe, it, expect } from "vitest";
import seed from "@/data/cardTopics.json";
import { cardsProDoReel, verificarReelCards, temaDoReel, subtemaDoReel, palavraChave, acharDuplicados, ehAutoDoReel, tituloCabe, CHIP_METODO, MSG_SEM_PALAVRA } from "./reelCards";
import type { Topic } from "./cardKits";

const temas = seed as unknown as Topic[];
const reel = { tema: "Creatina não é mágica: a verdade científica sobre o ganho de força real", titulo: null, fonte_status: null, roteiro: { blocos: [
  { id: 1, fala: "A ideia de creatina mágica trava o seu ganho de força.", tempo: "0-2s", texto_tela: "CREATINA NÃO É MÁGICA" },
  { id: 2, fala: "A substância não cria força. [PAUSA 0,4s] Ela melhora a ressíntese de fosfocreatina muscular.", tempo: "2-8s", texto_tela: "RESSÍNTESE DE FOSFOCREATINA" },
  { id: 3, fala: "Ela aumenta a ressíntese de fosfocreatina, permitindo uma repetição a mais sob carga.", tempo: "8-15s", gatilho: "achado_cientifico", texto_tela: "MAIS UMA REPETIÇÃO" },
  { id: 4, fala: "O ganho real vem da sobrecarga gradual. [PAUSA 0,4s] O suplemento é apenas combustível.", tempo: "15-22s", texto_tela: "SOBRECARGA GRADUAL" },
  { id: 5, fala: "Use dose diária constante. Comente CREATINA para receber o guia seguro.", tempo: "22-25s", texto_tela: "COMENTE CREATINA" },
] } };

describe("P3 cards do reel", () => {
  it("sem fonte: dado vira POSIÇÃO DO MÉTODO, CTA com palavra real, no máximo 7, sem placeholder", () => {
    const c = cardsProDoReel(reel, { fontes: [] });
    expect(c.length).toBeLessThanOrEqual(7);
    expect(c[0].papel).toBe("capa");
    expect(c.find(x => x.blocoRef === 3)?.chip).toBe(CHIP_METODO);
    expect(c.some(x => x.papel === "prova")).toBe(false);
    const cta = c.find(x => x.papel === "cta")!;
    expect(cta.principal).toBe("Comenta CREATINA");
    expect(cta.secundario).toBe("que eu te mando o guia seguro");
    expect(c.some(x => x.papel === "ressalva")).toBe(true);
    expect(c.every(x => !/\[|\]|palavra-chave/i.test(`${x.principal} ${x.secundario ?? ""} ${x.esquerda ?? ""}`))).toBe(true);
    expect(c.every(x => x.icone !== ("engrenagem" as any))).toBe(true);
    expect(c[2].rotulo).toBe("Bloco 3 · 8-15s · Capa");
  });
  it("tema Creatina: card de dado ganha prova com selo e fontes", () => {
    const t = temaDoReel(reel, temas)!; expect(t.slug).toBe("creatina");
    const s = subtemaDoReel(t, reel)!; expect(s.slug).toBe("forca-e-musculo");
    const c = cardsProDoReel(reel, { fontes: [], subtema: s });
    const p = c.find(x => x.blocoRef === 3)!; expect(p.papel).toBe("prova"); expect(p.prova).toBeTruthy();
    expect(c[c.length - 1].papel).toBe("fontes");
    const v = verificarReelCards(c, s);
    console.log(JSON.stringify(c.map((x, i) => ({ rotulo: x.rotulo, texto: x.principal, selo: x.selo, autores: x.prova?.autores, org: x.prova?.organizacao, achados: v.porCard[i] })), null, 1));
  });
  it("sem palavra-chave: CTA bloqueado", () => {
    const r = { ...reel, roteiro: { blocos: reel.roteiro.blocos.map(b => b.id === 5 ? { ...b, fala: "Use dose diária constante.", texto_tela: "DOSE DIÁRIA" } : b) } };
    expect(palavraChave(r.roteiro)).toBeNull();
    const c = cardsProDoReel(r, { fontes: [] }); const v = verificarReelCards(c, null);
    const i = c.findIndex(x => x.papel === "cta"); expect(c[i].principal).toBe(MSG_SEM_PALAVRA); expect(v.nivelCard[i]).toBe("bloqueio");
  });
  it("título longo demais é bloqueado", () => {
    expect(tituloCabe("CREATINA NÃO É MÁGICA", "capa")).toBe(true);
    expect(tituloCabe("palavra ".repeat(40), "prova")).toBe(false);
  });
  it("duplicados mantêm um de cada; editados e cópias nunca são substituídos", () => {
    const base = { script_id: "r", bloco_ref: 1, tipo: "B", template: "capa", conteudo: { origem: "reel_auto", titulo: "X" } };
    const d = acharDuplicados([{ ...base, id: "a" }, { ...base, id: "b" }, { ...base, id: "c" }] as any);
    expect(d[0].apagar.map(x => x.id)).toEqual(["a", "b"]);
    expect(ehAutoDoReel({ ...base, id: "e", conteudo: { ...base.conteudo, editado: true } } as any, "r")).toBe(false);
    expect(ehAutoDoReel({ ...base, id: "f", nome: "x (cópia)" } as any, "r")).toBe(false);
    expect(ehAutoDoReel({ ...base, id: "g" } as any, "r")).toBe(true);
  });
});
