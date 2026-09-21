// ARSENAL VIRAL — CONQUISTAS DO nutriON
// Toda conquista é avaliada apenas com dados reais: avaliações APEX salvas,
// logs de treino registrados, BF% do perfil e histórico de patentes.

import type { DeltaZona, AssimetriaZona, ZonaScore } from "@/lib/apexMuscleScore";
import type { Rank } from "@/lib/apexRanks";

export interface AchievementDef {
  id: string;
  titulo: string;
  badge: string;
  descricao: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-deficit-resolved", titulo: "Primeiro Deficit Resolvido", badge: "🏆", descricao: "Um grupo saiu de deficit para adequado após a reavaliação." },
  { id: "symmetry-achieved", titulo: "Simetria Conquistada", badge: "⚖️", descricao: "Assimetria acima de 8% caiu para menos de 5%." },
  { id: "all-above-70", titulo: "Physique Completo", badge: "⭐", descricao: "Todos os grupos avaliados com score 70 ou mais." },
  { id: "100-workouts", titulo: "Centurião", badge: "💯", descricao: "100 treinos registrados." },
  { id: "250-workouts", titulo: "Veterano", badge: "🎖️", descricao: "250 treinos registrados." },
  { id: "500-workouts", titulo: "Lendário", badge: "👑", descricao: "500 treinos registrados." },
  { id: "bf-under-15", titulo: "Sub-15", badge: "🎯", descricao: "BF% registrado abaixo de 15%." },
  { id: "bf-under-12", titulo: "Sub-12", badge: "💎", descricao: "BF% registrado abaixo de 12%." },
  { id: "first-promotion", titulo: "Primeira Promoção", badge: "📈", descricao: "Primeira subida de patente." },
  { id: "prime-rank", titulo: "Prime", badge: "🔥", descricao: "Rank PRIME alcançado." },
  { id: "perfect-week", titulo: "Semana Perfeita", badge: "✅", descricao: "Todas as sessões prescritas da semana concluídas." },
  { id: "comeback", titulo: "Volta por Cima", badge: "🔄", descricao: "Streak quebrado e retomado até 14 dias." },
  { id: "apex-jump-20", titulo: "Salto APEX", badge: "🚀", descricao: "APEX Score subiu 20 pontos ou mais numa reavaliação." },
];

export function achievementById(id: string): AchievementDef | null {
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}

export interface AchievementContext {
  zonasAtuais: ZonaScore[];
  deltas: DeltaZona[];
  assimetriasAtuais: AssimetriaZona[];
  assimetriasAnteriores: AssimetriaZona[];
  /** Grupos que estavam em deficit no diagnóstico anterior. */
  deficitsAnteriores: string[];
  /** Grupos em deficit no diagnóstico atual. */
  deficitsAtuais: string[];
  totalTreinos: number;
  bfPercent: number | null;
  scoreAtual: number | null;
  scoreAnterior: number | null;
  rankAtual: Rank | null;
  jaFoiPromovido: boolean;
  semanaPerfeita: boolean;
  voltaPorCima: boolean;
}

export interface AchievementUnlock {
  id: string;
  titulo: string;
  badge: string;
  mensagem: string;
  metadata: Record<string, unknown>;
}

/** Retorna todas as conquistas satisfeitas pelos dados reais recebidos. */
export function avaliarAchievements(ctx: AchievementContext): AchievementUnlock[] {
  const out: AchievementUnlock[] = [];
  const push = (id: string, mensagem: string, metadata: Record<string, unknown> = {}) => {
    const def = achievementById(id);
    if (def) out.push({ id, titulo: def.titulo, badge: def.badge, mensagem, metadata });
  };

  const resolvido = ctx.deficitsAnteriores.find((g) => !ctx.deficitsAtuais.includes(g));
  if (resolvido) push("first-deficit-resolved", `Você resolveu seu primeiro deficit: ${resolvido}. Isso é o sistema funcionando.`, { grupo: resolvido });

  const antesPorGrupo = new Map(ctx.assimetriasAnteriores.map((a) => [a.grupo, a.pct]));
  const simetria = ctx.assimetriasAtuais.find((a) => {
    const antes = antesPorGrupo.get(a.grupo);
    return antes !== undefined && antes > 8 && a.pct < 5;
  });
  if (simetria) {
    const antes = antesPorGrupo.get(simetria.grupo) as number;
    push(
      "symmetry-achieved",
      `Assimetria de ${simetria.grupo} corrigida! De ${antes.toFixed(1)}% para ${simetria.pct.toFixed(1)}%. Equilíbrio é força.`,
      { grupo: simetria.grupo, antes, agora: simetria.pct },
    );
  }

  if (ctx.zonasAtuais.length && ctx.zonasAtuais.every((z) => z.score >= 70)) {
    push("all-above-70", "Nenhum ponto fraco. Todos os grupos avaliados acima de 70. Físico COMPLETO.");
  }

  if (ctx.totalTreinos >= 500) push("500-workouts", "500 treinos registrados. Isso é legado.", { total: ctx.totalTreinos });
  if (ctx.totalTreinos >= 250) push("250-workouts", "250 sessões registradas. Experiência acumulada de verdade.", { total: ctx.totalTreinos });
  if (ctx.totalTreinos >= 100) push("100-workouts", "100 treinos. Cada um contou. Cada um construiu.", { total: ctx.totalTreinos });

  if (ctx.bfPercent !== null && ctx.bfPercent < 12) push("bf-under-12", "BF% abaixo de 12%. Nível de palco.", { bf: ctx.bfPercent });
  else if (ctx.bfPercent !== null && ctx.bfPercent < 15) push("bf-under-15", "BF% abaixo de 15%. Definição real.", { bf: ctx.bfPercent });

  if (ctx.jaFoiPromovido) push("first-promotion", "Sua primeira promoção de patente está registrada.");
  if (ctx.rankAtual && ["prime", "titan", "apex_elite"].includes(ctx.rankAtual.key)) {
    push("prime-rank", `Rank ${ctx.rankAtual.nome}. Você chegou à faixa alta do sistema.`, { rank: ctx.rankAtual.key });
  }

  if (ctx.semanaPerfeita) push("perfect-week", "Semana perfeita. Todas as sessões concluídas. Execução nota 10.");
  if (ctx.voltaPorCima) push("comeback", "Caiu, levantou e já está em 14 dias de novo. Resiliência é maior que perfeição.");

  if (ctx.scoreAtual !== null && ctx.scoreAnterior !== null) {
    const salto = Math.round(ctx.scoreAtual - ctx.scoreAnterior);
    if (salto >= 20) push("apex-jump-20", `Score saltou +${salto} pontos! Evolução explosiva neste ciclo.`, { salto });
  }

  return out;
}

export function mensagemPraxisConquista(unlock: AchievementUnlock): string {
  return [
    "🏆 CONQUISTA DESBLOQUEADA!",
    "",
    unlock.titulo,
    "",
    unlock.mensagem,
    "",
    "Gere seu card e compartilhe nos stories. Você merece mostrar isso. 💪",
    "",
    "Coach Diogo Mello",
    "Transformação é sistema.",
  ].join("\n");
}
