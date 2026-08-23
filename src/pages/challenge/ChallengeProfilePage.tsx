import { ChallengeHeader } from "@/components/challenge/ChallengeLayout";
import { useChallenge } from "@/hooks/useChallenge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Camera, MessageCircle } from "lucide-react";
import { CHALLENGE_DAYS, OBJETIVO_LABEL, TIER_BADGE, challengeDay, levelBadge } from "@/lib/challenge";

export default function ChallengeProfilePage() {
  const { participant, challenge } = useChallenge();
  const navigate = useNavigate();
  if (!participant) return null;

  const badge = levelBadge(participant.mce_score);
  const tier = TIER_BADGE[participant.tier] ?? TIER_BADGE.free;
  const day = challengeDay(challenge?.start_date);

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeHeader title="👤 Perfil" subtitle={challenge?.name ?? "Desafio 30 Dias"} />

      <div className="px-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-lg font-black">{participant.full_name}</p>
            <p className="text-xs text-muted-foreground">{participant.email}</p>
            <p className="text-xs">
              <span style={{ color: badge.color }}>{badge.label}</span> · {tier.emoji} {tier.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {OBJETIVO_LABEL[participant.objetivo]} · Porte {participant.porte} · {participant.meals_per_day} refeições
            </p>
            <p className="text-xs text-muted-foreground">Dia {day}/{CHALLENGE_DAYS} · Streak {participant.streak} dias</p>
          </CardContent>
        </Card>

        <Button asChild variant="outline" className="w-full gap-2">
          <Link to="/desafio/evolucao"><Camera className="w-4 h-4" /> Minhas fotos de evolução</Link>
        </Button>

        <Button asChild variant="outline" className="w-full gap-2">
          <a href="https://wa.me/" target="_blank" rel="noreferrer">
            <MessageCircle className="w-4 h-4" /> Falar com o Coach
          </a>
        </Button>

        {participant.tier === "free" && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-2 text-center">
              <p className="text-sm font-semibold">Continuar depois do desafio?</p>
              <p className="text-xs text-muted-foreground">
                Vire aluno nutriON e leve seu histórico, ranking e MCE com você.
              </p>
              <Button asChild size="sm" className="w-full"><Link to="/desafio/planos">Ver planos →</Link></Button>
            </CardContent>
          </Card>
        )}

        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
        >
          <LogOut className="w-4 h-4" /> Sair
        </Button>

        <p className="pb-4 text-center text-[11px] text-muted-foreground">@diogo.mell0 · nutrion.app.br</p>
      </div>
    </div>
  );
}
