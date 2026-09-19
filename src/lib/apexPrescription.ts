// APEX ASSESSMENT PIPELINE — CAMADA 3: ACTIVATE / CORRECT / PRESCRIBE
// Converte o diagnóstico determinístico em prescrição para o STRATUM.
// Regras fixas: ativação não é treino (volume baixo, carga leve, sem falha);
// correção segue as fases Release → Stretch → Activate → Integrate usando
// exclusivamente a biblioteca corretiva APEX já existente no projeto.

import { APEX_CORRECTIVE_LIBRARY } from "@/data/apexCorrectiveLibrary";
import type { DeficitTipo, DiagnosticoCompleto, GrupoDiagnostico, Severidade } from "@/lib/apexDeficitDiagnose";

export const ATIVACAO_REGRA = {
  series: "2-3 séries",
  reps: "10-15 repetições",
  carga: "carga leve",
  tecnica: "pausa isométrica no pico de contração",
  aviso: "Ativação não é treino: sem falha, sem carga alta, sem contar no volume da sessão.",
};

/** Alvo de ativação por grupo muscular do checklist. */
const ALVO_ATIVACAO: Record<string, string> = {
  dorsal: "latíssimo do dorso",
  peitoral: "peitoral maior",
  deltoides: "deltoide lateral e posterior",
  gluteos: "glúteo máximo e glúteo médio",
  posterior_coxa: "isquiotibiais",
  quadriceps: "quadríceps, com ênfase no vasto medial",
  biceps: "bíceps braquial",
  triceps: "tríceps braquial",
  panturrilha: "gastrocnêmio e sóleo",
  core: "transverso do abdômen e oblíquos",
};

/** Região corretiva da biblioteca APEX associada a cada grupo com deficit biomecânico. */
const REGIAO_POR_GRUPO: Record<string, string> = {
  dorsal: "toracica",
  peitoral: "cervical_ombro",
  deltoides: "cervical_ombro",
  gluteos: "quadril_lombar",
  posterior_coxa: "quadril_lombar",
  quadriceps: "joelho",
  panturrilha: "tornozelo_pe",
  core: "core",
  biceps: "cervical_ombro",
  triceps: "cervical_ombro",
};

export const FASES_CORRECT = [
  { fase: 1 as const, nome: "RELEASE", descricao: "Liberação do tecido dominante/encurtado" },
  { fase: 2 as const, nome: "STRETCH", descricao: "Alongamento do encurtado" },
  { fase: 3 as const, nome: "ACTIVATE", descricao: "Ativação do inibido" },
  { fase: 4 as const, nome: "INTEGRATE", descricao: "Integração no padrão de movimento" },
];

export interface ItemCorretivo {
  fase: 1 | 2 | 3 | 4;
  fase_nome: string;
  exercicio: string;
  alvo: string;
  series?: string;
  repsOuDuracao?: string;
}

export interface BlocoCorrecao {
  grupo: string;
  grupo_key: string;
  regiao: string;
  regiao_subtitulo: string;
  dominante: string;
  inibido: string;
  itens: ItemCorretivo[];
  contraindicados: { item: string; reason: string }[];
}

export interface BlocoAtivacao {
  grupo: string;
  grupo_key: string;
  alvo: string;
  series: string;
  reps: string;
  carga: string;
  tecnica: string;
  momento: string;
}

export interface TecnicaPrescrita {
  grupo: string;
  deficit: DeficitTipo;
  severidade: Severidade;
  tecnica: string;
  justificativa: string;
}

export interface FeederSession {
  grupo: string;
  alvo: string;
  frequencia: string;
  detalhe: string;
}

export interface AjusteNutricional {
  titulo: string;
  detalhe: string;
}

export interface PrescricaoApex {
  warmup: { tag: "[CORRECT]" | "[ACTIVATE]"; descricao: string }[];
  correcao: BlocoCorrecao[];
  ativacao: BlocoAtivacao[];
  priorizacao: string[];
  tecnicas: TecnicaPrescrita[];
  feeders: FeederSession[];
  nutricao: AjusteNutricional[];
  encaminhamentos: string[];
  reavaliacao: { checklist_semanas: number | null; visual_semanas: number | null };
}

/** Técnica avançada compatível com cada tipo de deficit. */
function tecnicaPorDeficit(tipo: DeficitTipo): { tecnica: string; justificativa: string } | null {
  switch (tipo) {
    case "ATIVACAO":
      return {
        tecnica: "Pré-exaustão com isolador antes do multiarticular",
        justificativa: "Aumenta a participação do músculo inibido antes do padrão dominante assumir o movimento.",
      };
    case "VOLUME":
      return {
        tecnica: "Séries adicionais no grupo prioritário, progredindo semana a semana",
        justificativa: "O deficit é de estímulo acumulado, não de recrutamento.",
      };
    case "BIOMECANICO":
      return null; // deficit biomecânico não recebe técnica de intensificação
    case "ESTETICO":
      return {
        tecnica: "Trabalho em amplitude alongada com controle excêntrico",
        justificativa: "Prioriza tensão na posição de maior alongamento do grupo em atraso.",
      };
    default:
      return null;
  }
}

function blocoCorrecao(g: GrupoDiagnostico): BlocoCorrecao | null {
  const regiaoId = REGIAO_POR_GRUPO[g.grupo_key];
  const regiao = APEX_CORRECTIVE_LIBRARY.find((r) => r.id === regiaoId);
  if (!regiao) return null;

  const itens: ItemCorretivo[] = [];
  for (const f of FASES_CORRECT) {
    const lista = regiao.phases[f.fase] || [];
    for (const ex of lista.slice(0, 2)) {
      itens.push({
        fase: f.fase,
        fase_nome: f.nome,
        exercicio: ex.name,
        alvo: ex.target,
        series: ex.sets,
        repsOuDuracao: ex.repsOrDuration,
      });
    }
  }

  return {
    grupo: g.grupo,
    grupo_key: g.grupo_key,
    regiao: regiao.title,
    regiao_subtitulo: regiao.subtitle,
    dominante: regiao.dominant,
    inibido: regiao.inhibited,
    itens,
    contraindicados: regiao.contraindicated || [],
  };
}

/**
 * Prescrição APEX a partir do diagnóstico. Não cria exercício, série ou valor
 * nutricional fora das regras do pipeline e da biblioteca corretiva do projeto.
 */
export function prescreverApex(diagnostico: DiagnosticoCompleto): PrescricaoApex {
  const correcao: BlocoCorrecao[] = [];
  const ativacao: BlocoAtivacao[] = [];
  const tecnicas: TecnicaPrescrita[] = [];
  const feeders: FeederSession[] = [];

  for (const g of diagnostico.grupos) {
    const temBio = g.deficits.some((d) => d.tipo === "BIOMECANICO");
    const temAtiv = g.deficits.some((d) => d.tipo === "ATIVACAO");

    if (temBio) {
      const bloco = blocoCorrecao(g);
      if (bloco) correcao.push(bloco);
    }

    if (temAtiv || temBio) {
      const alvo = ALVO_ATIVACAO[g.grupo_key];
      if (alvo) {
        ativacao.push({
          grupo: g.grupo,
          grupo_key: g.grupo_key,
          alvo,
          series: ATIVACAO_REGRA.series,
          reps: ATIVACAO_REGRA.reps,
          carga: ATIVACAO_REGRA.carga,
          tecnica: ATIVACAO_REGRA.tecnica,
          momento: "Pré-treino, antes do primeiro exercício do grupo",
        });
      }
    }

    for (const d of g.deficits) {
      const t = tecnicaPorDeficit(d.tipo);
      if (t) {
        tecnicas.push({ grupo: g.grupo, deficit: d.tipo, severidade: d.severidade, ...t });
      }
      if (d.severidade === "SEVERO" && (d.tipo === "ATIVACAO" || d.tipo === "VOLUME")) {
        const alvo = ALVO_ATIVACAO[g.grupo_key];
        feeders.push({
          grupo: g.grupo,
          alvo: alvo || g.grupo,
          frequencia: "1-2 sessões curtas extras por semana",
          detalhe: `${ATIVACAO_REGRA.series} · ${ATIVACAO_REGRA.reps} · ${ATIVACAO_REGRA.carga} · ${ATIVACAO_REGRA.tecnica}`,
        });
      }
    }
  }

  const warmup: PrescricaoApex["warmup"] = [
    ...correcao.map((c) => ({
      tag: "[CORRECT]" as const,
      descricao: `${c.grupo} — ${c.regiao}: Release → Stretch → Activate → Integrate`,
    })),
    ...ativacao.map((a) => ({
      tag: "[ACTIVATE]" as const,
      descricao: `${a.grupo} — ativar ${a.alvo}: ${a.series}, ${a.reps}, ${a.carga}, ${a.tecnica}`,
    })),
  ];

  const priorizacao = diagnostico.prioridades.map(
    (p, i) => `${i + 1}. ${p.grupo} — ${p.tipo} (${p.severidade}): posicionar no início da sessão do grupo`,
  );

  const nutricao: AjusteNutricional[] = ativacao.length
    ? [
        {
          titulo: "Carboidrato pré-treino nos dias dos grupos prioritários",
          detalhe:
            "Sugestão para revisão profissional: reforçar o carboidrato da refeição pré-treino nos dias em que os grupos prioritários são treinados, mantendo o total diário do plano.",
        },
        {
          titulo: "Proteína pós-treino",
          detalhe:
            "Sugestão para revisão profissional: garantir a dose de proteína do plano na refeição pós-treino, priorizando fonte rica em leucina. Nenhum valor é alterado sem validação no NutriPlan.",
        },
      ]
    : [];

  return {
    warmup,
    correcao,
    ativacao,
    priorizacao,
    tecnicas,
    feeders,
    nutricao,
    encaminhamentos: diagnostico.encaminhamentos,
    reavaliacao: diagnostico.proxima_reavaliacao,
  };
}
