import { describe, expect, it } from "vitest";
import { buildComandoStratum, camposFaltantes } from "@/lib/apexComandoStratum";

const base = {
  aluno: {
    nome: "Atleta Teste",
    sexo: "M",
    idade: 30,
    peso_kg: 82,
    altura_cm: 178,
    bf_range: "14-16%",
    nivel: "intermediario",
    objetivo: "recomposição",
    frequencia: 4,
    duracao_sessao_min: 60,
    equipamento: "academia completa",
    lesoes: [],
  },
  periodizacao: { macrociclo: "hipertrofia", mesociclo: "acumulacao", semana: 1, semanas_totais: 4 },
  score_atual: 62,
  score_anterior: 58,
  grupos: [
    {
      grupo: "Glúteos",
      grupo_key: "gluteos",
      apex_visual_score: 38,
      deficits: [{ tipo: "BIOMECANICO", severidade: "SEVERO", evidencias: ["G1 (c)", "G2 (d)"] }],
      assimetria: false,
      fase_recomendada: "CORRECT",
      encaminhamento: [],
    },
    { grupo: "Deltoides", grupo_key: "deltoides", apex_visual_score: 78, deficits: [], encaminhamento: [] },
    { grupo: "Quadríceps", grupo_key: "quadriceps", apex_visual_score: 55, deficits: [{ tipo: "ATIVACAO", severidade: "MODERADO" }], encaminhamento: ["Avaliação com fisioterapeuta — dor no joelho"] },
  ],
  prioridades: [{ grupo: "Glúteos", tipo: "BIOMECANICO" }],
  protocolos: [
    { grupo: "Glúteos", fase: "CORRECT", exercicio: "Release Flexores de Quadril", prescricao: "2×30s/lado", cue: "Reto femoral + TFL" },
    { grupo: "Glúteos", fase: "ACTIVATE", exercicio: "Glute Bridge com Squeeze 5s", prescricao: "3×10", cue: "Achatar lombar ANTES de subir" },
  ],
  volume_atual: [{ grupo: "Glúteos", series_semana: 8 }],
  encaminhamentos: ["Quadríceps: dor no joelho"],
};

describe("COMANDO STRATUM", () => {
  it("monta o comando completo com dados do aluno e diagnóstico", () => {
    const texto = buildComandoStratum(base);
    expect(texto).toContain("═══ COMANDO STRATUM — COPIE E COLE NO TRAININGON ═══");
    expect(texto).toContain("APEX SCORE: 62/100 (anterior: 58, delta: +4)");
    expect(texto).toContain("► Glúteos — Score: 38/100");
    expect(texto).toContain("CORRECT:");
    expect(texto).toContain("Glute Bridge com Squeeze 5s");
    expect(texto).toContain("► Deltoides — Score: 78/100 — ADEQUADO");
    expect(texto).toContain("═══ FIM DO COMANDO STRATUM ═══");
  });

  it("não prescreve grupo com encaminhamento", () => {
    const texto = buildComandoStratum(base);
    expect(texto).toContain("NÃO PRESCREVER para este grupo até liberação do coach.");
  });

  it("marca avaliação parcial quando o checklist foi pulado", () => {
    expect(buildComandoStratum({ ...base, checklist_parcial: true })).toContain("Avaliação parcial — checklist funcional pendente");
  });

  it("usa 'não informado' em vez de inventar dados", () => {
    const texto = buildComandoStratum({ ...base, aluno: { nome: "X" }, score_atual: null, score_anterior: null });
    expect(texto).toContain("• Sexo: não informado");
    expect(texto).toContain("APEX SCORE: não informado");
  });

  it("lista campos obrigatórios faltantes", () => {
    expect(camposFaltantes({ nome: "X" })).toContain("peso");
    expect(camposFaltantes(base.aluno)).toHaveLength(0);
  });
});
