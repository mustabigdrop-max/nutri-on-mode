/**
 * KINESIS — Seção 4: PRESCRIÇÃO DE VOLUME.
 * Tabelas MEV → MRV por grupo e nível, ajuste por deficit, distribuição por
 * sessão e frequência. É a referência que o STRATUM usa para ajustar dentro da
 * faixa a partir do diagnóstico do APEX.
 */

import type { DeficitKinesis, NivelKinesis } from "./kinesisTypes";

export type FaixaVolume = { mev: number; mrv: number };

export const TABELA_VOLUME: Array<{ grupo: string; faixas: Record<NivelKinesis, FaixaVolume> }> = [
  { grupo: "Peito", faixas: { iniciante: { mev: 6, mrv: 12 }, intermediario: { mev: 10, mrv: 18 }, avancado: { mev: 12, mrv: 22 } } },
  { grupo: "Costas (total)", faixas: { iniciante: { mev: 6, mrv: 14 }, intermediario: { mev: 10, mrv: 20 }, avancado: { mev: 14, mrv: 25 } } },
  { grupo: "Ombros (lateral)", faixas: { iniciante: { mev: 4, mrv: 10 }, intermediario: { mev: 8, mrv: 16 }, avancado: { mev: 10, mrv: 20 } } },
  { grupo: "Bíceps", faixas: { iniciante: { mev: 4, mrv: 8 }, intermediario: { mev: 6, mrv: 14 }, avancado: { mev: 8, mrv: 18 } } },
  { grupo: "Tríceps", faixas: { iniciante: { mev: 4, mrv: 8 }, intermediario: { mev: 6, mrv: 14 }, avancado: { mev: 8, mrv: 16 } } },
  { grupo: "Quadríceps", faixas: { iniciante: { mev: 6, mrv: 12 }, intermediario: { mev: 8, mrv: 18 }, avancado: { mev: 12, mrv: 22 } } },
  { grupo: "Posterior de Coxa", faixas: { iniciante: { mev: 4, mrv: 10 }, intermediario: { mev: 6, mrv: 14 }, avancado: { mev: 10, mrv: 18 } } },
  { grupo: "Glúteos", faixas: { iniciante: { mev: 4, mrv: 10 }, intermediario: { mev: 6, mrv: 16 }, avancado: { mev: 10, mrv: 20 } } },
  { grupo: "Panturrilha", faixas: { iniciante: { mev: 6, mrv: 10 }, intermediario: { mev: 8, mrv: 16 }, avancado: { mev: 10, mrv: 20 } } },
  { grupo: "Core", faixas: { iniciante: { mev: 2, mrv: 6 }, intermediario: { mev: 4, mrv: 8 }, avancado: { mev: 4, mrv: 10 } } },
];

export const MAX_SERIES_SESSAO = 10;
export const IDEAL_SERIES_SESSAO: [number, number] = [6, 8];

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const SINONIMOS: Record<string, string> = {
  peitoral: "Peito",
  peito: "Peito",
  costas: "Costas (total)",
  dorsal: "Costas (total)",
  latissimo: "Costas (total)",
  trapezio: "Costas (total)",
  ombro: "Ombros (lateral)",
  ombros: "Ombros (lateral)",
  deltoide: "Ombros (lateral)",
  deltoides: "Ombros (lateral)",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quadriceps: "Quadríceps",
  perna: "Quadríceps",
  posterior: "Posterior de Coxa",
  isquiotibiais: "Posterior de Coxa",
  gluteo: "Glúteos",
  gluteos: "Glúteos",
  panturrilha: "Panturrilha",
  abdomen: "Core",
  core: "Core",
};

/** Faixa MEV → MRV do grupo no nível informado (null se o grupo não está na tabela). */
export function faixaVolume(grupo: string, nivel: NivelKinesis): FaixaVolume | null {
  const g = norm(grupo);
  if (!g) return null;
  const direto = TABELA_VOLUME.find((t) => norm(t.grupo) === g);
  if (direto) return direto.faixas[nivel];
  const chave = Object.keys(SINONIMOS).find((k) => g.includes(k));
  const canon = chave ? SINONIMOS[chave] : null;
  const achado = canon ? TABELA_VOLUME.find((t) => t.grupo === canon) : null;
  return achado ? achado.faixas[nivel] : null;
}

export type PrescricaoVolume = {
  grupo: string;
  nivel: NivelKinesis;
  faixa: FaixaVolume;
  series_semana: number;
  regra: string;
  sessoes_sugeridas: number;
  series_por_sessao: number;
  frequencia_nota: string;
  tecnica_obrigatoria?: string;
};

/**
 * Volume semanal prescrito dentro da faixa do KINESIS, ajustado pelo deficit.
 * Regras: VOLUME +4 (sem passar do MRV); ATIVAÇÃO volume normal com técnica;
 * BIOMECÂNICO -30%; MANUTENÇÃO no MEV; ponto forte MEV a MEV+4.
 */
export function prescreverVolume(
  grupo: string,
  nivel: NivelKinesis,
  deficit: DeficitKinesis,
  prioritario: boolean,
): PrescricaoVolume | null {
  const faixa = faixaVolume(grupo, nivel);
  if (!faixa) return null;

  const base = prioritario ? faixa.mrv - 2 : Math.round((faixa.mev + faixa.mrv) / 2);
  let series = base;
  let regra = prioritario ? "topo da faixa do nível (grupo prioritário)" : "meio da faixa do nível";
  let tecnica: string | undefined;

  switch (deficit) {
    case "VOLUME":
      series = Math.min(faixa.mrv, base + 4);
      regra = "+4 séries sobre a base, limitado ao MRV (deficit de VOLUME)";
      tecnica = "Myo-reps no último exercício, drop-set no penúltimo, um exercício novo para o grupo";
      break;
    case "ATIVACAO":
      series = base;
      regra = "volume normal da faixa com técnica de ativação (deficit de ATIVAÇÃO)";
      tecnica = "Pausa isométrica de 2-3s no pico, tempo 3-0-2-1, carga -20%, isolador primeiro";
      break;
    case "BIOMECANICO":
      series = Math.max(faixa.mev - 2, Math.round(base * 0.7));
      regra = "-30% do volume normal (deficit BIOMECÂNICO: qualidade antes de quantidade)";
      tecnica = "Excêntrico 4-5s, carga -30-40%, 2-3 RIR. ZERO técnica de fadiga neste grupo";
      break;
    case "ESTETICO":
      series = base;
      regra = "mesma faixa com ênfase redistribuída para o subgrupo em atraso";
      break;
    case "ASSIMETRIA":
      series = base;
      regra = "volume da faixa aplicado por lado, com séries extras no lado fraco";
      tecnica = "Unilaterais obrigatórios, lado fraco primeiro, mesma carga nos dois lados";
      break;
    default:
      series = prioritario ? Math.min(faixa.mrv, faixa.mev + 4) : faixa.mev;
      regra = prioritario ? "MEV a MEV+4 (ponto forte: manter sem investir muito)" : "MEV (manutenção — libera volume para as prioridades)";
  }

  const sessoes = series > MAX_SERIES_SESSAO ? Math.ceil(series / IDEAL_SERIES_SESSAO[1]) : 1;
  const porSessao = Math.ceil(series / sessoes);

  let frequencia_nota = "2×/semana é o ideal para hipertrofia e correção de deficit.";
  if (sessoes >= 3) frequencia_nota = "3×/semana: indicado para ativação neuromuscular ou estrutura full body.";
  if (sessoes === 1) frequencia_nota = "1×/semana é aceitável apenas para manutenção.";

  return {
    grupo,
    nivel,
    faixa,
    series_semana: series,
    regra,
    sessoes_sugeridas: sessoes,
    series_por_sessao: Math.min(MAX_SERIES_SESSAO, porSessao),
    frequencia_nota,
    tecnica_obrigatoria: tecnica,
  };
}

/** Checagem de limites por sessão para o coach: avisa quando estoura 10 séries. */
export function checarSessao(seriesNaSessao: number): { ok: boolean; aviso?: string } {
  if (seriesNaSessao > MAX_SERIES_SESSAO)
    return { ok: false, aviso: `${seriesNaSessao} séries em uma sessão passa do limite de ${MAX_SERIES_SESSAO}: dividir em 2 sessões.` };
  if (seriesNaSessao > IDEAL_SERIES_SESSAO[1])
    return { ok: true, aviso: `Acima da faixa ideal (${IDEAL_SERIES_SESSAO[0]}-${IDEAL_SERIES_SESSAO[1]} séries/sessão), ainda dentro do limite.` };
  return { ok: true };
}
