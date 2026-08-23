import { useMemo, useState } from "react";
import { ChallengeHeader } from "@/components/challenge/ChallengeLayout";
import { useChallenge } from "@/hooks/useChallenge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Repeat, Gem } from "lucide-react";
import { OBJETIVO_LABEL, buildMealPlan } from "@/lib/challenge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ChallengePlanPage() {
  const { participant, log, saveLog } = useChallenge();
  const [openSubs, setOpenSubs] = useState<number | null>(null);

  const meals = useMemo(
    () => (participant ? buildMealPlan(
      { kcal: participant.target_kcal, protein_g: participant.protein_g, carbs_g: participant.carbs_g, fat_g: participant.fat_g },
      participant.meals_per_day,
    ) : []),
    [participant],
  );

  if (!participant) return null;
  const done = log?.meals_done ?? [];

  const toggleMeal = async (index: number) => {
    const next = done.includes(index) ? done.filter((i) => i !== index) : [...done, index];
    await saveLog({ meals_done: next, points: next.length * 3 });
    if (!done.includes(index)) toast.success("+3 pts Comportamento");
  };

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeHeader
        title="🍽️ Meu plano"
        subtitle={`${OBJETIVO_LABEL[participant.objetivo]} · Porte ${participant.porte.toUpperCase()} · ${participant.target_kcal.toLocaleString("pt-BR")} kcal`}
      />

      <div className="px-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Mapa nutricional</p>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="py-1">Refeição</th><th>Kcal</th><th>P</th><th>C</th><th>G</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((m) => (
                  <tr key={m.code} className="border-t border-border/50">
                    <td className="py-1.5">{m.code} {m.name}</td>
                    <td>{m.kcal}</td>
                    <td>{m.protein_g}g</td>
                    <td>{m.carbs_g}g</td>
                    <td>{m.fat_g}g</td>
                  </tr>
                ))}
                <tr className="border-t border-primary/40 font-bold text-primary">
                  <td className="py-1.5">TOTAL</td>
                  <td>{participant.target_kcal}</td>
                  <td>{participant.protein_g}g</td>
                  <td>{participant.carbs_g}g</td>
                  <td>{participant.fat_g}g</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {meals.map((m) => {
          const isDone = done.includes(m.index);
          return (
            <Card key={m.code} className={cn(isDone && "border-emerald-500/40 bg-emerald-500/5")}>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-bold">
                  {m.emoji} {m.code} — {m.name} · {m.time} · {m.kcal} kcal
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {m.items.map((it) => <li key={it}>• {it}</li>)}
                </ul>

                <button
                  className="flex items-center gap-1.5 text-xs text-primary"
                  onClick={() => setOpenSubs(openSubs === m.index ? null : m.index)}
                >
                  <Repeat className="w-3.5 h-3.5" /> Ver substituições
                </button>
                {openSubs === m.index && (
                  <ul className="rounded-lg border border-border bg-card/50 p-3 space-y-1 text-xs text-muted-foreground">
                    {m.substitutions.map((s) => <li key={s}>🔄 {s}</li>)}
                  </ul>
                )}

                <Button
                  size="sm"
                  variant={isDone ? "default" : "outline"}
                  className="w-full gap-2"
                  onClick={() => toggleMeal(m.index)}
                >
                  <Check className="w-4 h-4" />
                  {isDone ? "Concluída" : "Concluir (+3 pts Comportamento)"}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {participant.tier === "free" && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-2 text-center">
              <p className="text-sm font-semibold flex items-center justify-center gap-2">
                <Gem className="w-4 h-4 text-primary" /> Quer gramas exatas pro SEU corpo?
              </p>
              <p className="text-xs text-muted-foreground">
                Ajuste automático por treino, clima e rotina — só no Premium.
              </p>
              <Button asChild size="sm" className="w-full"><Link to="/desafio/planos">Ver planos do desafio →</Link></Button>
            </CardContent>
          </Card>
        )}

        <p className="pb-4 text-center text-[11px] text-muted-foreground">Sua fome nunca foi de comida.</p>
      </div>
    </div>
  );
}
