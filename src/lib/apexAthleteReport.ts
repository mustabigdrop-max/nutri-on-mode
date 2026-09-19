// APEX ASSESSMENT PIPELINE — RELATÓRIO DO ATLETA
// Texto determinístico na voz do Coach Diogo Mello a partir do diagnóstico e da
// prescrição já registrados. Não cria dado novo nem valor científico.

import type { DiagnosticoCompleto } from "@/lib/apexDeficitDiagnose";
import type { PrescricaoApex } from "@/lib/apexPrescription";

const TIPO_EXPLICACAO: Record<string, string> = {
  BIOMECANICO: "o padrão de movimento precisa ser corrigido antes de somar carga",
  ATIVACAO: "o músculo não está sendo recrutado como deveria",
  VOLUME: "falta estímulo acumulado nesse grupo",
  ESTETICO: "o grupo está atrás do conjunto na avaliação visual",
};

export function gerarRelatorioAtleta(
  nomeAtleta: string,
  diagnostico: DiagnosticoCompleto,
  prescricao: PrescricaoApex,
  avaliadoEm: string = new Date().toISOString().slice(0, 10),
): string {
  if (!diagnostico.grupos.length) return "";

  const data = new Date(`${avaliadoEm}T12:00:00`).toLocaleDateString("pt-BR");
  const l: string[] = [];

  l.push(`Fala, ${nomeAtleta}, aqui é o Diogo Mello.`);
  l.push("");
  l.push(`Sua avaliação funcional de ${data} está fechada. Vou direto ao que ela mostrou e ao que muda no seu treino.`);
  l.push("");
  l.push("O QUE A AVALIAÇÃO MOSTROU");

  for (const g of diagnostico.grupos) {
    if (!g.deficits.length) {
      l.push(`• ${g.grupo}: sem deficit nas respostas registradas. Segue o plano.`);
      continue;
    }
    const partes = g.deficits.map(
      (d) => `${d.tipo.toLowerCase()} ${d.severidade.toLowerCase()} — ${TIPO_EXPLICACAO[d.tipo] || ""}`,
    );
    l.push(`• ${g.grupo}: ${partes.join(" / ")}`);
    if (g.assimetria) l.push(`  Há assimetria relatada: o lado mais fraco entra primeiro, sempre.`);
  }

  if (diagnostico.prioridades.length) {
    l.push("");
    l.push("A ORDEM DO TRABALHO");
    l.push("Não é gosto pessoal, é sequência: primeiro o movimento, depois o recrutamento, depois o volume, por último a estética.");
    diagnostico.prioridades.forEach((p, i) => {
      l.push(`${i + 1}. ${p.grupo} — ${p.tipo.toLowerCase()} (${p.severidade.toLowerCase()})`);
    });
  }

  if (prescricao.correcao.length) {
    l.push("");
    l.push("CORREÇÃO ANTES DE CARGA");
    for (const c of prescricao.correcao) {
      l.push(`• ${c.grupo} (${c.regiao}): liberar, alongar, ativar e integrar, nessa ordem.`);
      if (c.contraindicados.length) {
        l.push(`  Fora por agora: ${c.contraindicados.map((x) => x.item).join(", ")}.`);
      }
    }
  }

  if (prescricao.ativacao.length) {
    l.push("");
    l.push("ATIVAÇÃO ANTES DO TREINO");
    l.push("Isso não é treino, é preparação. Carga leve, sem chegar perto da falha, e não conta no seu volume.");
    for (const a of prescricao.ativacao) {
      l.push(`• ${a.grupo}: ${a.series}, ${a.reps}, ${a.carga}, ${a.tecnica}.`);
    }
  }

  if (prescricao.feeders.length) {
    l.push("");
    l.push("SESSÕES CURTAS EXTRAS");
    for (const f of prescricao.feeders) l.push(`• ${f.grupo}: ${f.frequencia}. ${f.detalhe}.`);
  }

  if (prescricao.nutricao.length) {
    l.push("");
    l.push("NUTRIÇÃO");
    l.push("Nada muda no seu plano sem revisão profissional. O que fica registrado como sugestão:");
    for (const n of prescricao.nutricao) l.push(`• ${n.titulo}: ${n.detalhe}`);
  }

  if (diagnostico.encaminhamentos.length) {
    l.push("");
    l.push("ATENÇÃO");
    for (const e of diagnostico.encaminhamentos) l.push(`• ${e}`);
    l.push("Recomendamos avaliação profissional antes de progredir neste protocolo. Isso não é atraso, é o que protege sua temporada.");
  }

  const { checklist_semanas, visual_semanas } = diagnostico.proxima_reavaliacao;
  if (checklist_semanas || visual_semanas) {
    l.push("");
    l.push("REAVALIAÇÃO");
    if (checklist_semanas) l.push(`• Checklist funcional em ${checklist_semanas} semanas.`);
    if (visual_semanas) l.push(`• Avaliação visual em ${visual_semanas} semanas.`);
  }

  l.push("");
  l.push("Transformação é sistema.");

  return l.join("\n");
}
