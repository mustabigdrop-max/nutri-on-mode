import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChallengeHeader } from "@/components/challenge/ChallengeLayout";
import { useChallenge } from "@/hooks/useChallenge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplets, Flame, Trophy, Dumbbell, Sparkles } from "lucide-react";
import {
  OBJETIVO_LABEL, buildMealPlan, challengeDay, challengePhase, levelBadge,
} from "@/lib/challenge";
import { cn } from "@/lib/utils";

const MOODS = ["😤", "🙂", "😐", "😔", "😫"];

export default function ChallengeDashboardPage() {
  const { participant, challenge, log, saveLog } = useChallenge();
  const [saving, setSaving] = useState(false);

  const day = challengeDay(challenge?.start_date);
  const phase = challengePhase(day);
  const meals = useMemo(
    () => (participant ? buildMealPlan(
      { kcal: participant.target_kcal, protein_g: participant.protein_g, carbs_g: participant.carbs_g, fat_g: participant.fat_g },
      participant.meals_per_day,
    ) : []),
    [participant],
  );
  if (!participant) return null;

  const done = log?.meals_done ?? [];
  const water = log?.water_ml ?? 0;
  const badge = levelBadge(participant.mce_score);

  const addWater = async (ml: number) => {
    setSaving(true);
    await saveLog({ water_ml: Math.max(0, water + ml) });
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeHeader
        title={`Dia ${day}/90`}
        subtitle={`${phase.name} · ${phase.range} · ${challenge?.name ?? "Desafio 90 Dias"}`}
      />

      <div className="px-4 space-y-4">
        <Card className="border-primary/25 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">MCE Score</p>
              <p className="text-4xl font-black text-primary leading-none">{participant.mce_score}</p>
              <p className="text-[11px] mt-1" style={{ color: badge.color }}>{badge.label}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm font-bold flex items-center gap-1 justify-end">
                <Flame className="w-4 h-4 text-orange-400" /> {participant.streak} dias
              </p>
              <p className="text-[11px] text-muted-foreground">
                {OBJETIVO_LABEL[participant.objetivo]} · {participant.target_kcal} kcal
              </p>
              <Link to="/desafio/ranking" className="text-[11px] text-primary underline flex items-center gap-1 justify-end">
                <Trophy className="w-3 h-3" /> ver ranking
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Rotina do dia</p>
              <span className="text-xs text-muted-foreground">{done.length}/{meals.length} refeições</span>
            </div>
            <Progress value={(done.length / Math.max(meals.length, 1)) * 100} />
            <div className="flex flex-wrap gap-2">
              {meals.map((m) => (
                <span
                  key={m.code}
                  className={cn(
                    "rounded-lg border px-2 py-1 text-[11px]",
                    done.includes(m.index)
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {m.emoji} {m.code}
                </span>
              ))}
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/desafio/plano">Abrir meu plano</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" /> Hidratação
            </p>
            <p className="text-2xl font-black">{(water / 1000).toFixed(1)}L <span className="text-xs font-normal text-muted-foreground">/ 3L</span></p>
            <Progress value={Math.min((water / 3000) * 100, 100)} />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" disabled={saving} onClick={() => addWater(250)}>+250ml</Button>
              <Button size="sm" variant="outline" className="flex-1" disabled={saving} onClick={() => addWater(500)}>+500ml</Button>
              <Button size="sm" variant="ghost" disabled={saving} onClick={() => addWater(-250)}>−</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold">Check-in de humor</p>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => saveLog({ mood: m })}
                  className={cn(
                    "flex-1 rounded-xl border py-2 text-2xl transition-all",
                    log?.mood === m ? "border-primary bg-primary/10" : "border-border",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <Button
              variant={log?.training_done ? "default" : "outline"}
              size="sm"
              className="w-full gap-2"
              onClick={() => saveLog({ training_done: !log?.training_done })}
            >
              <Dumbbell className="w-4 h-4" />
              {log?.training_done ? "Treino concluído hoje" : "Marcar treino do dia"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Story do dia
              </p>
              <p className="text-[11px] text-muted-foreground">Compartilhe sua evolução com a galera da academia.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/desafio/evolucao">Gerar</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="pb-4 text-center text-[11px] text-muted-foreground">"Transformação é sistema." · @diogo.mell0</p>
      </div>
    </div>
  );
}
