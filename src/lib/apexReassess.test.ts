import { describe, expect, it } from "vitest";
import { compararAvaliacoes } from "@/lib/apexReassess";
import type { DiagnosticoCompleto, GrupoDiagnostico } from "@/lib/apexDeficitDiagnose";

function grupo(key: string, nome: string, deficits: GrupoDiagnostico["deficits"]): GrupoDiagnostico {
  return {
    grupo_key: key,
    grupo: nome,
    apex_visual_score: null,
    respondidas: 5,
    deficits,
    assimetria: false,
    assimetria_evidencias: [],
    dor: [],
    encaminhamento: false,
    encaminhamento_evidencias: [],
    fase_recomendada: null,
  } as unknown as GrupoDiagnostico;
}

function diag(grupos: GrupoDiagnostico[]): DiagnosticoCompleto {
  return { grupos, prioridades: [], encaminhamentos: [], proxima_reavaliacao: { checklist_semanas: 4, visual_semanas: 8 } };
}

describe("compararAvaliacoes", () => {
  it("marca melhora quando a severidade cai", () => {
    const antes = diag([grupo("gluteos", "Glúteos", [{ tipo: "ATIVACAO", severidade: "SEVERO", evidencias: [] } as never])]);
    const agora = diag([grupo("gluteos", "Glúteos", [{ tipo: "ATIVACAO", severidade: "LEVE", evidencias: [] } as never])]);
    const r = compararAvaliacoes({ avaliado_em: "2026-01-01", diagnostico: antes }, { avaliado_em: "2026-02-01", diagnostico: agora });
    expect(r.grupos[0].evolucao).toBe("MELHOROU");
    expect(r.resumo.melhoraram).toBe(1);
  });

  it("marca resolvido quando o deficit desaparece", () => {
    const antes = diag([grupo("core", "Core", [{ tipo: "VOLUME", severidade: "MODERADO", evidencias: [] } as never])]);
    const agora = diag([grupo("core", "Core", [])]);
    const r = compararAvaliacoes({ avaliado_em: "2026-01-01", diagnostico: antes }, { avaliado_em: "2026-03-01", diagnostico: agora });
    expect(r.grupos[0].evolucao).toBe("RESOLVIDO");
    expect(r.resumo.resolvidos).toBe(1);
  });

  it("marca novo quando o grupo não existia antes", () => {
    const antes = diag([]);
    const agora = diag([grupo("dorsal", "Dorsal", [{ tipo: "BIOMECANICO", severidade: "LEVE", evidencias: [] } as never])]);
    const r = compararAvaliacoes({ avaliado_em: "2026-01-01", diagnostico: antes }, { avaliado_em: "2026-02-01", diagnostico: agora });
    expect(r.grupos[0].evolucao).toBe("NOVO");
  });

  it("marca piora quando a severidade sobe", () => {
    const antes = diag([grupo("biceps", "Bíceps", [{ tipo: "VOLUME", severidade: "LEVE", evidencias: [] } as never])]);
    const agora = diag([grupo("biceps", "Bíceps", [{ tipo: "VOLUME", severidade: "SEVERO", evidencias: [] } as never])]);
    const r = compararAvaliacoes({ avaliado_em: "2026-01-01", diagnostico: antes }, { avaliado_em: "2026-02-01", diagnostico: agora });
    expect(r.grupos[0].evolucao).toBe("PIOROU");
  });
});
