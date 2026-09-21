// APEX ASSESSMENT PIPELINE — CAMADA 5: PRESCRIBE
// Converte o diagnóstico cruzado em prescrição integrada (STRATUM + NutriPlan).
// Só usa protocolos das bibliotecas APEX do projeto e as marcações reais do
// checklist. Nenhum valor nutricional é aplicado sem revisão profissional.

import { APEX_ACTIVATION_BY_TAG, ATIVACAO_PRINCIPIOS, type ProtocoloAtivacao } from "@/data/apexActivationLibrary";
import { APEX_CORRECTIVE_BY_TAG, type ProtocoloCorretivo } from "@/data/apexCorrectiveProtocols";
import { isTagAtivacao, isTagBiomecanica } from "@/lib/apexChecklistTags";
import type { DiagnosticoCruzado, GrupoCruzado } from "@/lib/apexCrossDiagnose";

export interface BlocoWarmup {
  tag: "[CORRECT]" | "[ACTIVATE]";
  grupo: string;
  descricao: string;
  duracao: string;
}

export interface AjusteTreino {
  grupo: string;
  itens: string[];
}

export interface FeederIntegrado {
  grupo: string;
  formato: string;
  detalhe: string;
  tag: "[FEEDER]" | "[HOMEWORK]";
}

export interface AjusteNutriPlan {
  grupo: string;
  detalhe: string;
}

export interface PrescricaoIntegrada {
  warmup: BlocoWarmup[];
  correcoes: { grupo: string; protocolo: ProtocoloCorretivo }[];
  ativacoes: { grupo: string; protocolo: ProtocoloAtivacao }[];
  ajustes: AjusteTreino[];
  feeders: FeederIntegrado[];
  nutriplan: AjusteNutriPlan[];
  fila: string[];
  encaminhamentos: string[];
  reavaliacao: { checklist_semanas: number; visual_nota: string };
}

function tecnicasPorTipo(g: GrupoCruzado): string[] {
  const itens: string[] = [];
  switch (g.tipo_primario) {
    case "ATIVACAO":
      itens.push("Pausa isométrica de 2-3s no pico em todos os exercícios do grupo");
      itens.push("Tempo 3-0-2-1 (3s excêntrico, 2s concêntrico, 1s de squeeze)");
      itens.push("Carga reduzida em 20% — o foco é sentir o músculo trabalhar");
      break;
    case "VOLUME":
      itens.push("+2 a 4 séries por semana no grupo");
      itens.push("Exercício extra com técnica avançada (myo-reps, drop-set ou rest-pause)");
      itens.push("Frequência: 1x → 2x por semana, ou manter 2x com mais volume");
      break;
    case "BIOMECANICO":
      itens.push("Carga reduzida em 30-40% nos compostos do grupo");
      itens.push("Substituir compostos por isoladores com padrão correto");
      itens.push("Retornar aos compostos só após 4-6 semanas de corretivos");
      break;
    case "ESTETICO":
      itens.push("Redistribuir a ênfase para o subgrupo em atraso");
      break;
    case "ASSIMETRIA":
      break;
    default:
      break;
  }
  if (g.tipo_primario !== "ADEQUADO" && (g.severidade === "MODERADO" || g.severidade === "SEVERO")) {
    itens.push("Posicionar como primeiro exercício do dia, depois do aquecimento");
  }
  if (g.apex_visual.assimetria_flag || g.tipo_secundario === "ASSIMETRIA" || g.tipo_primario === "ASSIMETRIA") {
    itens.push("Exercícios unilaterais antes dos bilaterais");
    itens.push("Lado mais fraco primeiro, com 1-2 séries extras");
  }
  return itens;
}

/** Prescrição integrada a partir do diagnóstico cruzado. */
export function prescreverIntegrado(diag: DiagnosticoCruzado): PrescricaoIntegrada {
  const warmup: BlocoWarmup[] = [];
  const correcoes: { grupo: string; protocolo: ProtocoloCorretivo }[] = [];
  const ativacoes: { grupo: string; protocolo: ProtocoloAtivacao }[] = [];
  const ajustes: AjusteTreino[] = [];
  const feeders: FeederIntegrado[] = [];
  const nutriplan: AjusteNutriPlan[] = [];

  for (const g of diag.priorizados) {
    const tagsBio = g.checklist_tags.filter(isTagBiomecanica);
    const tagsAtiv = g.checklist_tags.filter(isTagAtivacao);

    for (const t of tagsBio) {
      const protocolo = APEX_CORRECTIVE_BY_TAG[t];
      if (!protocolo) continue;
      if (correcoes.some((c) => c.grupo === g.grupo && c.protocolo.tag === t)) continue;
      correcoes.push({ grupo: g.grupo, protocolo });
      warmup.push({
        tag: "[CORRECT]",
        grupo: g.grupo,
        descricao: `${protocolo.titulo} — Release → Stretch → Activate → Integrate`,
        duracao: "+10-15min",
      });
    }

    for (const t of tagsAtiv) {
      const protocolo = APEX_ACTIVATION_BY_TAG[t];
      if (!protocolo) continue;
      if (ativacoes.some((a) => a.grupo === g.grupo && a.protocolo.tag === t)) continue;
      ativacoes.push({ grupo: g.grupo, protocolo });
      warmup.push({
        tag: "[ACTIVATE]",
        grupo: g.grupo,
        descricao: `${protocolo.titulo} — ${ATIVACAO_PRINCIPIOS.series}, ${ATIVACAO_PRINCIPIOS.reps}, ${ATIVACAO_PRINCIPIOS.carga}, ${ATIVACAO_PRINCIPIOS.pausa}`,
        duracao: "+5-8min",
      });
    }

    const itens = tecnicasPorTipo(g);
    if (itens.length) ajustes.push({ grupo: g.grupo, itens });

    if (g.severidade === "SEVERO" && (g.tipo_primario === "ATIVACAO" || g.tipo_primario === "VOLUME")) {
      feeders.push({
        grupo: g.grupo,
        formato: "1 sessão curta em dia off (15-20min)",
        detalhe: "2-3 exercícios de ativação + 1-2 isoladores leves · 2 séries cada · RPE 5-6",
        tag: "[FEEDER]",
      });
    } else if (g.severidade === "MODERADO" && g.tipo_primario === "ATIVACAO") {
      feeders.push({
        grupo: g.grupo,
        formato: "Exercícios de ativação como tarefa nos dias de descanso (10min)",
        detalhe: "Mesmos exercícios do aquecimento, sem carga adicional",
        tag: "[HOMEWORK]",
      });
    }

    nutriplan.push({
      grupo: g.grupo,
      detalhe:
        "Sugestão para revisão profissional no NutriPlan: reforçar o carboidrato pré-treino e garantir a dose de proteína do plano na janela pós-treino nos dias em que este grupo é treinado. Nenhum valor é alterado sem validação.",
    });
  }

  return {
    warmup,
    correcoes,
    ativacoes,
    ajustes,
    feeders,
    nutriplan,
    fila: diag.fila.map((g) => `${g.grupo} — ${g.tipo_primario}${g.severidade ? ` (${g.severidade})` : ""}`),
    encaminhamentos: diag.encaminhamentos,
    reavaliacao: {
      checklist_semanas: 4,
      visual_nota:
        "APEX Visual segue a frequência adaptativa da fase: cutting/prep quinzenal, últimas 4 semanas semanal, acumulação/manutenção mensal, deload sem avaliação.",
    },
  };
}
