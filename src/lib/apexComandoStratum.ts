// COMANDO STRATUM — saída única do APEX para colar no TrainingON.
// Monta o texto a partir do run do orquestrador (dados reais salvos), nunca inventa valores.

export interface ComandoAluno {
  nome?: string | null;
  sexo?: string | null;
  idade?: number | string | null;
  peso_kg?: number | string | null;
  altura_cm?: number | string | null;
  bf_range?: string | null;
  nivel?: string | null;
  objetivo?: string | null;
  frequencia?: number | string | null;
  duracao_sessao_min?: number | string | null;
  equipamento?: string | null;
  lesoes?: string | string[] | null;
}

export interface ComandoGrupo {
  grupo?: string | null;
  grupo_key?: string | null;
  apex_visual_score?: number | null;
  deficits?: Array<{ tipo?: string | null; severidade?: string | null; evidencias?: string[] | null }> | null;
  assimetria?: boolean | null;
  assimetria_evidencias?: string[] | null;
  fase_recomendada?: string | null;
  encaminhamento?: string[] | null;
}

export interface ComandoProtocolo {
  grupo?: string | null;
  fase?: string | null;
  exercicio?: string | null;
  prescricao?: string | null;
  cue?: string | null;
}

export interface ComandoStratumInput {
  aluno: ComandoAluno;
  periodizacao?: { macrociclo?: string | null; mesociclo?: string | null; semana?: number | string | null; semanas_totais?: number | string | null } | null;
  score_atual?: number | null;
  score_anterior?: number | null;
  grupos: ComandoGrupo[];
  prioridades?: Array<{ grupo?: string | null; tipo?: string | null }> | null;
  protocolos: ComandoProtocolo[];
  volume_atual?: Array<{ grupo?: string | null; series_semana?: number | null }> | null;
  encaminhamentos?: string[] | null;
  checklist_parcial?: boolean;
  treino_anterior?: string | null;
}

const NI = "não informado";

function val(v: unknown, sufixo = ""): string {
  if (v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v))) return NI;
  return `${v}${sufixo}`;
}

function lesoesTexto(lesoes: ComandoAluno["lesoes"]): string {
  if (!lesoes) return "nenhuma informada";
  if (Array.isArray(lesoes)) return lesoes.length ? lesoes.join(", ") : "nenhuma informada";
  return lesoes.trim() || "nenhuma informada";
}

export function camposFaltantes(aluno: ComandoAluno): string[] {
  const obrigatorios: Array<[keyof ComandoAluno, string]> = [
    ["nome", "nome"],
    ["sexo", "sexo"],
    ["idade", "idade"],
    ["peso_kg", "peso"],
    ["altura_cm", "altura"],
    ["nivel", "nível"],
    ["objetivo", "objetivo"],
    ["frequencia", "frequência semanal"],
    ["duracao_sessao_min", "duração por sessão"],
    ["equipamento", "equipamento"],
  ];
  return obrigatorios
    .filter(([key]) => {
      const v = aluno[key];
      return v === null || v === undefined || v === "";
    })
    .map(([, label]) => label);
}

function deltaTexto(atual?: number | null, anterior?: number | null): string {
  if (typeof atual !== "number") return "APEX SCORE: não informado";
  if (typeof anterior !== "number") return `APEX SCORE: ${atual}/100 (sem avaliação anterior)`;
  const delta = atual - anterior;
  return `APEX SCORE: ${atual}/100 (anterior: ${anterior}, delta: ${delta >= 0 ? "+" : ""}${delta})`;
}

function blocoGrupo(grupo: ComandoGrupo, protocolos: ComandoProtocolo[]): string[] {
  const nome = grupo.grupo || grupo.grupo_key || "grupo";
  const score = typeof grupo.apex_visual_score === "number" ? `${grupo.apex_visual_score}/100` : NI;
  const deficits = (grupo.deficits || []).filter(Boolean);
  const bloqueado = (grupo.encaminhamento || []).length > 0;

  if (bloqueado) {
    return [
      `► ${nome} — Score: ${score}`,
      `  ENCAMINHAMENTO: ${(grupo.encaminhamento || []).join(" · ")}`,
      "  NÃO PRESCREVER para este grupo até liberação do coach.",
      "",
    ];
  }

  if (!deficits.length) return [`► ${nome} — Score: ${score} — ADEQUADO`, ""];

  const meus = protocolos.filter((p) => (p.grupo || "").toLowerCase() === String(nome).toLowerCase());
  const correct = meus.filter((p) => p.fase === "CORRECT");
  const activate = meus.filter((p) => p.fase === "ACTIVATE");
  const linhaExercicio = (p: ComandoProtocolo) =>
    `    - ${p.exercicio || NI} — ${p.prescricao || NI}${p.cue ? ` — Cue: ${p.cue}` : ""}`;

  const linhas = [
    `► ${nome} — Score: ${score}`,
    `  Deficit: ${deficits.map((d) => d.tipo || NI).join(" + ")} | Severidade: ${deficits[0]?.severidade || NI}`,
    `  Fase: ${grupo.fase_recomendada || NI}`,
    `  Assimetria: ${grupo.assimetria ? `SIM ${(grupo.assimetria_evidencias || []).join("; ")}`.trim() : "NÃO"}`,
  ];
  const evidencias = deficits.flatMap((d) => d.evidencias || []).filter(Boolean);
  if (evidencias.length) linhas.push(`  Evidências: ${evidencias.slice(0, 6).join("; ")}`);
  if (correct.length) linhas.push("  CORRECT:", ...correct.map(linhaExercicio));
  if (activate.length) linhas.push("  ACTIVATE:", ...activate.map(linhaExercicio));
  linhas.push("");
  return linhas;
}

export function buildComandoStratum(input: ComandoStratumInput): string {
  const a = input.aluno;
  const p = input.periodizacao || {};
  const linhas: string[] = [];

  linhas.push("═══ COMANDO STRATUM — COPIE E COLE NO TRAININGON ═══", "");
  linhas.push("Gere o treino completo para este aluno baseado no diagnóstico APEX abaixo.", "");
  if (input.checklist_parcial) {
    linhas.push("⚠️ Avaliação parcial — checklist funcional pendente. Base apenas visual.", "");
  }
  linhas.push(
    "DADOS DO ALUNO:",
    `• Nome: ${val(a.nome)}`,
    `• Sexo: ${val(a.sexo)}`,
    `• Idade: ${val(a.idade)}`,
    `• Peso: ${val(a.peso_kg, "kg")} | Altura: ${val(a.altura_cm, "cm")} | BF%: ${val(a.bf_range)}`,
    `• Nível: ${val(a.nivel)}`,
    `• Objetivo: ${val(a.objetivo)}`,
    `• Frequência: ${val(a.frequencia)} dias/semana`,
    `• Duração máxima/sessão: ${val(a.duracao_sessao_min)} min`,
    `• Equipamento: ${val(a.equipamento)}`,
    `• Lesões: ${lesoesTexto(a.lesoes)}`,
    "",
    "FASE ATUAL:",
    `• ${val(p.macrociclo)} | ${val(p.mesociclo)} | Semana ${val(p.semana)} de ${val(p.semanas_totais)}`,
    "",
    deltaTexto(input.score_atual, input.score_anterior),
    "",
    "DIAGNÓSTICO:",
    "",
  );

  const comDeficit = input.grupos.filter((g) => (g.deficits || []).length > 0 || (g.encaminhamento || []).length > 0);
  const adequados = input.grupos.filter((g) => !comDeficit.includes(g));
  for (const grupo of [...comDeficit, ...adequados]) {
    linhas.push(...blocoGrupo(grupo, input.protocolos));
  }

  const prioridades = (input.prioridades || []).slice(0, 3);
  linhas.push("PRIORIDADES:");
  if (prioridades.length) {
    prioridades.forEach((item, i) => linhas.push(`${i + 1}. ${item.grupo || NI} — ${item.tipo || NI}`));
  } else {
    linhas.push("Nenhuma prioridade classificada nesta avaliação — manter manutenção.");
  }
  linhas.push("");

  linhas.push(`FLAGS: ${(input.encaminhamentos || []).length ? (input.encaminhamentos || []).join(" · ") : "nenhum"}`, "");

  const volume = (input.volume_atual || []).filter((v) => v && v.grupo);
  if (volume.length) {
    linhas.push("VOLUME ATUAL:");
    for (const v of volume) linhas.push(`• ${v.grupo}: ${v.series_semana ?? NI} séries/semana`);
    linhas.push("");
  }

  if (input.treino_anterior) {
    linhas.push("TREINO ANTERIOR (gerar comparativo de mudanças):", input.treino_anterior, "");
  }

  linhas.push(
    "REGRAS:",
    "• BIOMECÂNICO: carga -30%, sem compostos pesados, padrão controlado",
    "• ATIVAÇÃO: isolador primeiro, pausa 2-3s, tempo 3-0-2-1, carga -20%",
    "• VOLUME: +4 séries/sem, técnica avançada no último exercício",
    "• ASSIMETRIA: unilateral obrigatório, lado fraco primeiro, +1-2 séries",
    "• Warm-up: CORRECT antes de ACTIVATE, obrigatórios nos dias do grupo",
    "• Feeder: se SEVERO, sessão curta em dia off (15min, RPE 5)",
    "• NutriPlan: grupo prioritário → +15-20% carb pré, +leucina pós (sugestão para revisão profissional)",
    "",
    "Gere: divisão semanal, sessões completas, feeder, homework, flags nutricionais, resumo de mudanças, data reavaliação.",
    "",
    "═══ FIM DO COMANDO STRATUM ═══",
  );

  return linhas.join("\n");
}
