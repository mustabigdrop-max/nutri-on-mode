import { ChallengeHeader } from "@/components/challenge/ChallengeLayout";
import { useChallenge } from "@/hooks/useChallenge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Headphones, Lock } from "lucide-react";
import { levelBadge } from "@/lib/challenge";

const PILLARS = [
  { key: "M", name: "Mente", desc: "Clareza, foco e decisão" },
  { key: "C", name: "Comportamento", desc: "Rotina executada todo dia" },
  { key: "E", name: "Energia", desc: "Sono, treino e disposição" },
];

export default function ChallengeMCEPage() {
  const { participant } = useChallenge();
  if (!participant) return null;
  const badge = levelBadge(participant.mce_score);

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeHeader title="🧠 MCE" subtitle="Mente · Comportamento · Energia" />

      <div className="px-4 space-y-4">
        <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-transparent">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto text-primary" />
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">MCE Score</p>
            <p className="text-6xl font-black text-primary leading-none">{participant.mce_score}</p>
            <p className="mt-1 text-sm font-bold" style={{ color: badge.color }}>{badge.label}</p>
          </CardContent>
        </Card>

        {PILLARS.map((p) => (
          <Card key={p.key}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-3xl font-black text-primary">{p.key}</span>
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Headphones className="w-4 h-4 text-primary" /> Áudios do Coach
            </p>
            <p className="text-xs text-muted-foreground">
              Rituais diários com a voz do Coach Diogo Mello: Despertar, Corrida, Treino e Sono.
            </p>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to="/mce/academy">Abrir MCE Academy</Link>
            </Button>
          </CardContent>
        </Card>

        {participant.tier === "free" && (
          <Card className="border-dashed">
            <CardContent className="p-4 text-center space-y-2">
              <Lock className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Diagnóstico MCE completo, alter ego e trilha de exercícios liberam no Premium.
              </p>
              <Button asChild size="sm" className="w-full"><Link to="/desafio/planos">Ver planos do desafio →</Link></Button>
            </CardContent>
          </Card>
        )}

        <p className="pb-4 text-center text-[11px] text-muted-foreground">"Transformação é sistema."</p>
      </div>
    </div>
  );
}
