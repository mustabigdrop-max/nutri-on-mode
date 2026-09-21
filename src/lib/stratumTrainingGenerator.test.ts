import { describe, expect, it } from "vitest";
import {
  MAX_GRUPOS_PRIORITARIOS,
  MAX_SERIES_SEMANA,
  MIN_SERIES_SEMANA,
  buildStratumGeneratorInstruction,
  definirDivisao,
  gerarPlanoStratum,
  periodizar,
  tecnicasDoDeficit,
  volumeDoGrupo,
} from "@/lib/stratumTrainingGenerator";
import type { DiagnosticoCompleto, GrupoDiagnostico } from "@/lib/apexDeficitDiagnose";

const grupo = (
  nome: string,
  key: string,
  tipo: GrupoDiagnostico["deficits"][number]["tipo"],
  severidade: GrupoDiagnostico["deficits"][number]["severidade"],
  assimetria = false,
): GrupoDiagnostico => ({
  grupo_key: key,
  grupo: nome,
  apex_visual_score: 42,
  respondidas: 6,
  total_perguntas: 6,
  deficits: [{ tipo, severidade, evidencias: [`${key}: evidência registrada`] }],
  assimetria,
  assimetria_evidencias: assimetria ? [`${key}: assimetria registrada`] : [],
  encaminhamento: [],
  prioridade_tratamento: [tipo],
  fase_recomendada: "CORRECT",
  reavaliacao_semanas: 4,
});

const diag = (grupos: GrupoDiagnostico[]): DiagnosticoCompleto => ({
  grupos,
  prioridades: [],
  encaminhamentos: [],
  proxima_reavaliacao: { checklist_semanas: 4, visual_semanas: 8 },
});

describe("divisão", () => {
  it("usa PPL x2 em 6 dias e full body x3 quando há deficit de ativação em 3 dias", () => {
    expect(definirDivisao(6, [], false).nome).toContain("Push / Pull / Legs ×2");
    expect(definirDivisao(3, [], true).nome).toBe("Full Body ×3");
    expect(definirDivisao(3, [], false).nome).toBe("Push / Pull / Legs");
    expect(definirDivisao(4, [], false).nome).toBe("Upper / Lower ×2");
    expect(definirDivisao(2, [], false).nome).toBe("Full Body ×2");
  });
});

describe("volume por deficit", () => {
  it("soma 4 séries no deficit de volume e corta 30% no biomecânico", () => {
    const base = volumeDoGrupo("intermediario", "MANUTENCAO", true).series;
    expect(volumeDoGrupo("intermediario", "VOLUME", true).series).toBe(base + 4);
    expect(volumeDoGrupo("intermediario", "BIOMECANICO", true).series).toBeLessThan(base);
  });

  it("respeita os limites de 6 a 25 séries", () => {
    for (const nivel of ["iniciante", "intermediario", "avancado"] as const) {
      for (const tipo of ["VOLUME", "BIOMECANICO", "ATIVACAO", "ESTETICO", "MANUTENCAO"] as const) {
        const { series } = volumeDoGrupo(nivel, tipo, true);
        expect(series).toBeGreaterThanOrEqual(MIN_SERIES_SEMANA);
        expect(series).toBeLessThanOrEqual(MAX_SERIES_SEMANA);
      }
    }
  });
});

describe("técnicas", () => {
  it("nunca prescreve técnica de fadiga no deficit biomecânico", () => {
    const itens = tecnicasDoDeficit("BIOMECANICO", false).join(" ").toLowerCase();
    expect(itens).not.toContain("myo");
    expect(itens).not.toContain("drop-set");
    expect(itens).toContain("sem falha");
  });

  it("adiciona unilaterais quando há assimetria", () => {
    expect(tecnicasDoDeficit("VOLUME", true).join(" ")).toContain("unilaterais");
  });
});

describe("periodização", () => {
  it("deload usa metade do volume e libera apenas trabalho leve", () => {
    const p = periodizar("deload", 1, 4);
    expect(p.volume_pct).toBe(50);
    expect(p.tecnicas_avancadas).toBe("nenhuma");
  });

  it("acumulação começa em 70% e chega a 100% do volume", () => {
    expect(periodizar("acumulacao", 1, 4).volume_pct).toBe(70);
    expect(periodizar("acumulacao", 4, 4).volume_pct).toBe(100);
    expect(periodizar("acumulacao", 1, 4).tecnicas_avancadas).toContain("bloqueadas");
  });
});

describe("plano completo", () => {
  const plano = gerarPlanoStratum({
    nivel: "intermediario",
    frequencia: 5,
    mesociclo: "acumulacao",
    semanaNoMeso: 1,
    semanasTotaisMeso: 4,
    diagnostico: diag([
      grupo("Glúteo Máximo", "gluteo", "BIOMECANICO", "MODERADO"),
      grupo("Dorsal Inferior", "dorsal", "ATIVACAO", "SEVERO", true),
      grupo("Posterior de Coxa", "posterior", "VOLUME", "SEVERO"),
      grupo("Panturrilha", "panturrilha", "VOLUME", "LEVE"),
    ]),
    volumeAtualPorGrupo: { "Posterior de Coxa": 6 },
  });

  it("limita a 3 grupos priorizados e manda o resto para manutenção", () => {
    expect(plano.prioritarios).toHaveLength(MAX_GRUPOS_PRIORITARIOS);
    expect(plano.manutencao).toContain("Panturrilha");
  });

  it("coloca o grupo biomecânico como prioridade 1", () => {
    expect(plano.prioritarios[0].tipo).toBe("BIOMECANICO");
  });

  it("gera feeder para deficit severo de ativação/volume", () => {
    expect(plano.extras.some((e) => e.tag === "[FEEDER]")).toBe(true);
  });

  it("gera flags do NutriPlan somente como sugestão", () => {
    expect(plano.nutriplan.length).toBeGreaterThan(0);
    for (const n of plano.nutriplan) expect(n.sugestao).toContain("revisão profissional");
  });

  it("produz bloco de prompt sem termos proibidos", () => {
    const texto = buildStratumGeneratorInstruction(plano);
    expect(texto).toContain("STRATUM TRAINING GENERATOR");
    expect(texto).toContain("CORRECT antes de VOLUME");
    expect(/\bIA\b|intelig[êe]ncia artificial/i.test(texto.replace("IA/AI/Inteligência Artificial", ""))).toBe(false);
  });

  it("sem diagnóstico, não cria camadas de priorização", () => {
    const semApex = gerarPlanoStratum({
      nivel: "iniciante",
      frequencia: 3,
      mesociclo: "acumulacao",
      semanaNoMeso: 1,
      semanasTotaisMeso: 4,
      diagnostico: null,
    });
    expect(semApex.prioritarios).toHaveLength(0);
    expect(semApex.aquecimento).toHaveLength(0);
    expect(semApex.extras).toHaveLength(0);
  });
});
