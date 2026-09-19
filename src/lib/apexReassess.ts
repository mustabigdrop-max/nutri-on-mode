// APEX ASSESSMENT PIPELINE — REASSESS
// Compara duas avaliações já registradas. Nenhum valor é inventado: só entra o
// que foi respondido e salvo nos diagnósticos.

import type { DiagnosticoCompleto, GrupoDiagnostico, Severidade } from "@/lib/apexDeficitDiagnose";

const PESO_SEVERIDADE: Record<Severidade, number> = { LEVE: 1, MODERADO: 2, SEVERO: 3 } as Record<Severidade, number>;

export type Evolucao = "MELHOROU" | "PIOROU" | "ESTAVEL" | "NOVO" | "RESOLVIDO";

export interface ComparacaoGrupo {
  grupo: string;
  grupo_key: string;
  antes: string;
  agora: string;
  evolucao: Evolucao;
}

export interface ComparacaoAvaliacoes {
  data_anterior: string;
  data_atual: string;
  grupos: ComparacaoGrupo[];
  resumo: { melhoraram: number; pioraram: number; estaveis: number; novos: number; resolvidos: number };
}

function carga(g: GrupoDiagnostico | undefined): number {
  if (!g || !g.deficits.length) return 0;
  return g.deficits.reduce((acc, d) => acc + (PESO_SEVERIDADE[d.severidade] || 0), 0);
}

function descrever(g: GrupoDiagnostico | undefined): string {
  if (!g) return "não avaliado";
  if (!g.deficits.length) return "sem deficit";
  return g.deficits.map((d) => `${d.tipo.toLowerCase()} ${d.severidade.toLowerCase()}`).join(", ");
}

export function compararAvaliacoes(
  anterior: { avaliado_em: string; diagnostico: DiagnosticoCompleto },
  atual: { avaliado_em: string; diagnostico: DiagnosticoCompleto },
): ComparacaoAvaliacoes {
  const keys = new Set<string>([
    ...anterior.diagnostico.grupos.map((g) => g.grupo_key),
    ...atual.diagnostico.grupos.map((g) => g.grupo_key),
  ]);

  const grupos: ComparacaoGrupo[] = [];
  const resumo = { melhoraram: 0, pioraram: 0, estaveis: 0, novos: 0, resolvidos: 0 };

  for (const key of keys) {
    const a = anterior.diagnostico.grupos.find((g) => g.grupo_key === key);
    const b = atual.diagnostico.grupos.find((g) => g.grupo_key === key);
    const cargaA = carga(a);
    const cargaB = carga(b);

    let evolucao: Evolucao;
    if (!a && b && cargaB > 0) {
      evolucao = "NOVO";
      resumo.novos += 1;
    } else if (cargaA > 0 && cargaB === 0) {
      evolucao = "RESOLVIDO";
      resumo.resolvidos += 1;
    } else if (cargaB < cargaA) {
      evolucao = "MELHOROU";
      resumo.melhoraram += 1;
    } else if (cargaB > cargaA) {
      evolucao = "PIOROU";
      resumo.pioraram += 1;
    } else {
      evolucao = "ESTAVEL";
      resumo.estaveis += 1;
    }

    grupos.push({
      grupo: (b || a)?.grupo || key,
      grupo_key: key,
      antes: descrever(a),
      agora: descrever(b),
      evolucao,
    });
  }

  grupos.sort((x, y) => x.grupo.localeCompare(y.grupo, "pt-BR"));

  return { data_anterior: anterior.avaliado_em, data_atual: atual.avaliado_em, grupos, resumo };
}
