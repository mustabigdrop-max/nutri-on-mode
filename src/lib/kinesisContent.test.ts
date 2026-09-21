import { describe, expect, it } from "vitest";
import { KINESIS_ATLAS, buscarExercicio, cueDoExercicio, variacaoParaDeficit } from "./kinesisAtlas";
import { dossieDoGrupo } from "./kinesisMuscleLab";
import { prescreverAssimetria, substituirPorUnilateral } from "./kinesisAsymmetry";
import { conteudoParaMarkdown, gerarConteudoKinesis } from "./kinesisContent";

describe("KINESIS — atlas", () => {
  it("todo exercício tem cues obrigatórios, erros e variações com quando/contra", () => {
    for (const ex of KINESIS_ATLAS) {
      expect(ex.cues_coaching.cue_primario.length).toBeGreaterThan(10);
      expect(ex.cues_coaching.cue_conexao_mente_musculo.length).toBeGreaterThan(10);
      expect(ex.erros_comuns.length).toBeGreaterThanOrEqual(2);
      expect(ex.variacoes_e_quando_usar.length).toBeGreaterThanOrEqual(2);
      for (const v of ex.variacoes_e_quando_usar) {
        expect(v.quando).toBeTruthy();
        expect(v.contra).toBeTruthy();
      }
      expect(ex.emg.fonte).toBeTruthy();
    }
  });

  it("dado sem paper é marcado como estimativa, nunca como estudo", () => {
    for (const ex of KINESIS_ATLAS) {
      if (ex.emg.fonte.startsWith("ESTIMATIVA")) expect(ex.emg.badge).toBe("ESTIMATIVA");
    }
  });

  it("busca tolerante e cue para o STRATUM", () => {
    expect(buscarExercicio("barbell-bent-row")?.id).toBe("barbell-bent-row");
    expect(buscarExercicio("Supino Reto com Barra")?.id).toBe("supino-reto-barra");
    expect(cueDoExercicio("Hip Thrust com Barra")?.toLowerCase()).toContain("quadril");
    expect(variacaoParaDeficit("Remada Curvada com Barra (Barbell Bent-Over Row)", "ASSIMETRIA")).toContain("Unilateral");
  });
});

describe("KINESIS — laboratório muscular e assimetria", () => {
  it("resolve o dossiê por sinônimo", () => {
    expect(dossieDoGrupo("costas")?.grupo).toBe("DORSAL");
    expect(dossieDoGrupo("ombros")?.grupo).toBe("DELTOIDES");
  });

  it("prescreve assimetria com lado fraco primeiro e mesma carga", () => {
    const p = prescreverAssimetria("dorsal", "E", 12, 10);
    expect(p.status).toBe("FLAG");
    expect(p.series_lado_fraco).toBeGreaterThan(p.series_lado_forte);
    expect(p.regras.join(" ")).toContain("mesma carga");
    expect(p.regras.join(" ")).toContain("PRIMEIRO");
  });

  it("delta abaixo de 5% libera bilateral", () => {
    const p = prescreverAssimetria("biceps", "D", 3, 8);
    expect(p.status).toBe("OK");
    expect(p.regras.join(" ")).toContain("Bilateral liberado");
  });

  it("mapeia bilateral para unilateral", () => {
    expect(substituirPorUnilateral("Agachamento com barra")).toBe("Bulgarian Split Squat");
  });
});

describe("KINESIS — gerador de conteúdo", () => {
  it("carrossel tem capa, dado com fonte e CTA final", () => {
    const c = gerarConteudoKinesis({ tipo: "EXERCICIO", ref: "hip-thrust" }, "CARROSSEL_EDUCATIVO")!;
    expect(c.slides[0].tipo).toBe("capa");
    expect(c.slides[c.slides.length - 1].tipo).toBe("cta");
    expect(c.fontes.some((f) => f.includes("Contreras"))).toBe(true);
    expect(c.legenda).toContain("Transformação é sistema.");
  });

  it("roteiro de Reel cobre hook, problema, solução, dado e CTA", () => {
    const c = gerarConteudoKinesis({ tipo: "EXERCICIO", ref: "elevacao-lateral" }, "REEL_ROTEIRO")!;
    expect(c.roteiro?.map((r) => r.bloco)).toEqual(["HOOK", "PROBLEMA", "SOLUÇÃO (demonstração)", "DADO", "CTA"]);
  });

  it("sem paper cadastrado, avisa para não publicar como estudo", () => {
    const c = gerarConteudoKinesis({ tipo: "ASSIMETRIA", grupo: "PANTURRILHA" }, "CARROSSEL_EDUCATIVO")!;
    expect(c.fontes).toHaveLength(0);
    expect(c.aviso).toContain("nunca como estudo");
  });

  it("gera stories com enquete e markdown exportável", () => {
    const c = gerarConteudoKinesis({ tipo: "SUBGRUPO", grupo: "DORSAL", subgrupo: "Latíssimo Dorsal — Porção Inferior" }, "STORY_SEQUENCIA")!;
    expect(c.stories?.some((s) => !!s.interacao)).toBe(true);
    expect(conteudoParaMarkdown(c)).toContain("## Legenda");
  });

  it("nunca menciona IA no conteúdo gerado", () => {
    const c = gerarConteudoKinesis({ tipo: "EXERCICIO", ref: "barbell-bent-row" }, "CARROSSEL_EDUCATIVO")!;
    const texto = conteudoParaMarkdown(c);
    expect(/\b(IA|AI|Intelig[êe]ncia Artificial)\b/.test(texto)).toBe(false);
  });
});
