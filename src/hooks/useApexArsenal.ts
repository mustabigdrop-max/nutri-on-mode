// ARSENAL VIRAL — DADOS REAIS DO ALUNO PARA CARD, PATENTE, STREAK E CONQUISTAS
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  apexScoreGeral, assimetrias, deltasPorGrupo, zonasDaAvaliacao,
  type AssimetriaZona, type DeltaZona, type MuscleScoreRow, type ZonaScore,
} from "@/lib/apexMuscleScore";
import {
  detectRankChange, mensagemPromocao, mensagemRebaixamento, nextRank, rankForScore,
  statusDoDelta, type DestaqueGrupo, type Rank,
} from "@/lib/apexRanks";
import { computeStreak, semanaPerfeita, voltaPorCima, type StreakResult, type WorkoutLog } from "@/lib/apexStreaks";
import { avaliarAchievements, mensagemPraxisConquista, type AchievementUnlock } from "@/lib/apexAchievements";

export interface ArsenalData {
  nome: string;
  fotoUrl: string | null;
  objetivo: string | null;
  pesoKg: number | null;
  alturaCm: number | null;
  bfPercent: number | null;
  avaliadoEm: string | null;
  scoreAtual: number | null;
  scoreAnterior: number | null;
  delta: number | null;
  rank: Rank | null;
  proximaPatente: Rank | null;
  zonas: ZonaScore[];
  deltas: DeltaZona[];
  assimetriasAtuais: AssimetriaZona[];
  destaques: DestaqueGrupo[];
  streak: StreakResult;
  conquistas: { id: string; titulo: string; badge: string; unlockedAt: string }[];
  novasConquistas: AchievementUnlock[];
  mensagemPatente: string | null;
}

const VAZIO_STREAK: StreakResult = { atual: 0, recorde: 0, totalTreinos: 0, ultimoTreino: null, milestone: null, proximoMilestone: null };

export function useApexArsenal(targetUserId?: string) {
  const { user } = useAuth();
  const userId = targetUserId || user?.id || null;
  const [data, setData] = useState<ArsenalData | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const desde = new Date();
      desde.setDate(desde.getDate() - 400);
      const desdeISO = desde.toISOString().slice(0, 10);

      const [perfilRes, scoresRes, logsRes, diagRes, conquistasRes, rankRes] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, objetivo_principal, goal, weight_kg, height_cm, bf_percent, training_frequency").eq("user_id", userId).maybeSingle(),
        supabase.from("apex_muscle_scores").select("*").eq("user_id", userId).order("assessment_date", { ascending: false }).limit(2),
        supabase.from("workout_daily_logs").select("log_date, workout_type, completed").eq("user_id", userId).gte("log_date", desdeISO).order("log_date", { ascending: false }),
        supabase.from("apex_deficit_diagnoses").select("avaliado_em, grupos").eq("athlete_id", userId).order("avaliado_em", { ascending: false }).limit(2),
        supabase.from("apex_achievements").select("achievement_id, unlocked_at, metadata").eq("user_id", userId),
        supabase.from("apex_rank_history").select("rank_key, previous_rank_key, direction, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      const perfil = perfilRes.data as Record<string, unknown> | null;
      const scores = (scoresRes.data || []) as MuscleScoreRow[];
      const atual = scores[0] ?? null;
      const anterior = scores[1] ?? null;
      const logs = (logsRes.data || []) as WorkoutLog[];
      const diagnosticos = (diagRes.data || []) as { avaliado_em: string; grupos: unknown }[];

      const scoreAtual = apexScoreGeral(atual);
      const scoreAnterior = apexScoreGeral(anterior);
      const rank = rankForScore(scoreAtual);
      const deltas = deltasPorGrupo(atual, anterior);
      const assimAtuais = assimetrias(atual);
      const assimAnteriores = assimetrias(anterior);

      const gruposDeficit = (raw: unknown): string[] => {
        if (!Array.isArray(raw)) return [];
        return (raw as { grupo?: string; deficits?: { tipo?: string }[] }[])
          .filter((g) => Array.isArray(g.deficits) && g.deficits.some((d) => d.tipo && d.tipo !== "ADEQUADO"))
          .map((g) => g.grupo || "")
          .filter(Boolean);
      };
      const deficitsAtuais = gruposDeficit(diagnosticos[0]?.grupos);
      const deficitsAnteriores = gruposDeficit(diagnosticos[1]?.grupos);

      const destaques: DestaqueGrupo[] = [...deltas]
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 3)
        .map((d) => {
          const emDeficit = deficitsAtuais.includes(d.grupo);
          return {
            grupo: d.grupo,
            delta: d.delta,
            status: statusDoDelta(d.delta, emDeficit),
            nota: emDeficit ? "corrigindo 🔄" : undefined,
          };
        });

      const streak = logs.length ? computeStreak(logs) : VAZIO_STREAK;
      const frequencia = Number(perfil?.training_frequency) || 0;

      const jaRegistradas = new Set(((conquistasRes.data || []) as { achievement_id: string }[]).map((c) => c.achievement_id));
      const rankHist = (rankRes.data || []) as { rank_key: string; previous_rank_key: string | null; direction: string; created_at: string }[];
      const jaFoiPromovido = rankHist.some((r) => r.direction === "promotion");

      const candidatas = avaliarAchievements({
        zonasAtuais: zonasDaAvaliacao(atual),
        deltas,
        assimetriasAtuais: assimAtuais,
        assimetriasAnteriores: assimAnteriores,
        deficitsAnteriores,
        deficitsAtuais,
        totalTreinos: streak.totalTreinos,
        bfPercent: perfil?.bf_percent !== null && perfil?.bf_percent !== undefined ? Number(perfil.bf_percent) : null,
        scoreAtual,
        scoreAnterior,
        rankAtual: rank,
        jaFoiPromovido,
        semanaPerfeita: semanaPerfeita(logs, frequencia),
        voltaPorCima: voltaPorCima(logs, streak.atual, streak.recorde),
      });

      const novas = candidatas.filter((c) => !jaRegistradas.has(c.id));
      if (novas.length && !targetUserId) {
        await supabase.from("apex_achievements").insert(
          novas.map((n) => ({ user_id: userId, achievement_id: n.id, metadata: n.metadata as never })),
        );
        await supabase.from("notifications").insert(
          novas.map((n) => ({
            user_id: userId,
            type: "achievement_unlocked",
            title: `${n.badge} ${n.titulo}`,
            body: mensagemPraxisConquista(n),
            action_url: "/physique-card",
            metadata: { achievement_id: n.id } as never,
          })),
        );
      }

      // Mudança de patente entre a avaliação anterior e a atual.
      let mensagemPatente: string | null = null;
      const mudanca = detectRankChange(scoreAnterior, scoreAtual);
      if (mudanca && scoreAtual !== null && scoreAnterior !== null) {
        const nome = String(perfil?.full_name || "Atleta");
        mensagemPatente = mudanca.direction === "promotion"
          ? mensagemPromocao({ nome, de: mudanca.from, para: mudanca.to, scoreAnterior, scoreAtual, destaques })
          : mensagemRebaixamento({ nome, de: mudanca.from, para: mudanca.to, scoreAnterior, scoreAtual });

        const jaRegistrada = rankHist.some((r) => r.rank_key === mudanca.to.key && r.previous_rank_key === mudanca.from.key);
        if (!jaRegistrada && !targetUserId) {
          await supabase.from("apex_rank_history").insert({
            user_id: userId,
            rank_key: mudanca.to.key,
            previous_rank_key: mudanca.from.key,
            apex_score: Math.round(scoreAtual),
            previous_apex_score: Math.round(scoreAnterior),
            direction: mudanca.direction,
            assessment_date: (atual?.assessment_date as string) || null,
          });
          await supabase.from("notifications").insert({
            user_id: userId,
            type: mudanca.direction === "promotion" ? "rank_promotion" : "rank_adjust",
            title: mudanca.direction === "promotion" ? `${mudanca.to.icone} Promoção: ${mudanca.to.nome}` : `Patente ajustada: ${mudanca.to.nome}`,
            body: mensagemPatente,
            action_url: "/physique-card",
            metadata: { de: mudanca.from.key, para: mudanca.to.key } as never,
          });
        }
      }

      const conquistasSalvas = ((conquistasRes.data || []) as { achievement_id: string; unlocked_at: string }[])
        .map((c) => {
          const def = candidatas.find((x) => x.id === c.achievement_id);
          return { id: c.achievement_id, titulo: def?.titulo || c.achievement_id, badge: def?.badge || "🏅", unlockedAt: c.unlocked_at };
        });

      setData({
        nome: String(perfil?.full_name || "Atleta"),
        fotoUrl: (perfil?.avatar_url as string) || null,
        objetivo: (perfil?.objetivo_principal as string) || (perfil?.goal as string) || null,
        pesoKg: perfil?.weight_kg !== null && perfil?.weight_kg !== undefined ? Number(perfil.weight_kg) : null,
        alturaCm: perfil?.height_cm !== null && perfil?.height_cm !== undefined ? Number(perfil.height_cm) : null,
        bfPercent: perfil?.bf_percent !== null && perfil?.bf_percent !== undefined ? Number(perfil.bf_percent) : null,
        avaliadoEm: (atual?.assessment_date as string) || (atual?.created_at as string) || null,
        scoreAtual,
        scoreAnterior,
        delta: scoreAtual !== null && scoreAnterior !== null ? Math.round(scoreAtual - scoreAnterior) : null,
        rank,
        proximaPatente: nextRank(rank),
        zonas: zonasDaAvaliacao(atual),
        deltas,
        assimetriasAtuais: assimAtuais,
        destaques,
        streak,
        conquistas: [...conquistasSalvas, ...novas.map((n) => ({ id: n.id, titulo: n.titulo, badge: n.badge, unlockedAt: new Date().toISOString() }))]
          .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i),
        novasConquistas: novas,
        mensagemPatente,
      });
    } finally {
      setLoading(false);
    }
  }, [userId, targetUserId]);

  useEffect(() => { void carregar(); }, [carregar]);

  return { data, loading, recarregar: carregar };
}
