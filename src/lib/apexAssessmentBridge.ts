// APEX ASSESSMENT PIPELINE — PONTE COM O STRATUM
// Lê o último diagnóstico funcional salvo do atleta e o transforma em bloco de
// contexto para a geração do treino. Sem diagnóstico salvo, não injeta nada.

import { supabase } from "@/integrations/supabase/client";
import type { DiagnosticoCompleto } from "@/lib/apexDeficitDiagnose";
import { prescreverApex, type PrescricaoApex } from "@/lib/apexPrescription";

export interface ApexAssessmentContext {
  avaliadoEm: string;
  diagnostico: DiagnosticoCompleto;
  prescricao: PrescricaoApex;
}

export async function getLatestApexAssessment(athleteId: string): Promise<ApexAssessmentContext | null> {
  if (!athleteId) return null;
  const { data, error } = await supabase
    .from("apex_deficit_diagnoses")
    .select("avaliado_em, grupos, prioridades, encaminhamentos, proxima_reavaliacao")
    .eq("athlete_id", athleteId)
    .order("avaliado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const grupos = Array.isArray(data.grupos) ? (data.grupos as DiagnosticoCompleto["grupos"]) : [];
  if (!grupos.length) return null;

  const proxima = (data.proxima_reavaliacao || {}) as Record<string, number | null>;
  const diagnostico: DiagnosticoCompleto = {
    grupos,
    prioridades: Array.isArray(data.prioridades) ? (data.prioridades as DiagnosticoCompleto["prioridades"]) : [],
    encaminhamentos: Array.isArray(data.encaminhamentos) ? (data.encaminhamentos as string[]) : [],
    proxima_reavaliacao: {
      checklist_semanas: proxima.checklist_semanas ?? null,
      visual_semanas: proxima.visual_semanas ?? null,
    },
  };

  return { avaliadoEm: data.avaliado_em, diagnostico, prescricao: prescreverApex(diagnostico) };
}

/** Bloco de texto para o prompt do STRATUM. Somente dados do diagnóstico salvo. */
export function formatApexAssessmentBlock(ctx: ApexAssessmentContext | null): string {
  if (!ctx) return "━━━ APEX ASSESSMENT: sem avaliação funcional registrada para este atleta ━━━";

  const { prescricao, diagnostico, avaliadoEm } = ctx;
  const data = new Date(`${avaliadoEm}T12:00:00`).toLocaleDateString("pt-BR");

  const linhas: string[] = [
    "",
    "━━━ APEX ASSESSMENT — AVALIAÇÃO FUNCIONAL REGISTRADA ━━━",
    `- Avaliada em: ${data}`,
  ];

  if (diagnostico.prioridades.length) {
    linhas.push(
      `- Prioridades (ordem fixa biomecânico → ativação → volume → estético): ${diagnostico.prioridades
        .map((p) => `${p.grupo}: ${p.tipo} ${p.severidade}`)
        .join("; ")}`,
    );
  }
  if (prescricao.warmup.length) {
    linhas.push(`- Aquecimento obrigatório: ${prescricao.warmup.map((w) => `${w.tag} ${w.descricao}`).join(" | ")}`);
  }
  if (prescricao.ativacao.length) {
    linhas.push(
      "- Ativação pré-treino (NÃO é treino: volume baixo, carga leve, sem falha, não conta no volume da sessão): " +
        prescricao.ativacao.map((a) => `${a.grupo} → ${a.alvo} (${a.series}, ${a.reps}, ${a.carga})`).join("; "),
    );
  }
  if (prescricao.feeders.length) {
    linhas.push(`- Sessões extras: ${prescricao.feeders.map((f) => `[FEEDER] ${f.grupo} (${f.frequencia})`).join("; ")}`);
  }
  const contra = prescricao.correcao.flatMap((c) => c.contraindicados.map((x) => `${c.grupo}: ${x.item} — ${x.reason}`));
  if (contra.length) linhas.push(`- Evitar nesta fase: ${contra.join("; ")}`);
  if (diagnostico.encaminhamentos.length) {
    linhas.push(
      `- Encaminhamento profissional pendente: ${diagnostico.encaminhamentos.join("; ")}. Não progredir carga nos padrões envolvidos.`,
    );
  }

  linhas.push(
    "REGRA: posicione os grupos prioritários no início da sessão, aplique o aquecimento marcado e respeite as restrições. A decisão final é do coach.",
  );

  return linhas.join("\n");
}
