import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown, Gem, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChallenge } from "@/hooks/useChallenge";
import { CHALLENGE_DAYS, TRIAL_DAYS, MAX_POINTS_BASIC, MAX_POINTS_FULL } from "@/lib/challenge";

const WHATSAPP = "https://wa.me/?text=";

interface PlanDef {
  id: "free" | "premium" | "vip";
  name: string;
  price: string;
  priceSub: string;
  emoji: string;
  highlight?: boolean;
  features: string[];
  missing?: string[];
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "FREE",
    price: "R$ 0",
    priceSub: `${TRIAL_DAYS} dias de acesso completo`,
    emoji: "🆓",
    features: [
      `Acesso total nos primeiros ${TRIAL_DAYS} dias`,
      "Check-in diário de humor e treino",
      "Ranking e MCE Academy (episódios livres)",
      "Histórico salvo até o fim do desafio",
    ],
    missing: [
      `Depois do trial: máx ${MAX_POINTS_BASIC} pts/dia`,
      "Plano alimentar e hidratação bloqueados",
    ],
  },
  {
    id: "premium",
    name: "PREMIUM",
    price: "R$ 149",
    priceSub: `os ${CHALLENGE_DAYS} dias completos`,
    emoji: "💎",
    highlight: true,
    features: [
      `Pontuação cheia (${MAX_POINTS_FULL} pts/dia) até o dia ${CHALLENGE_DAYS}`,
      "Plano alimentar em gramas, ajustado ao seu treino",
      "Hidratação, checklist e evolução liberados",
      "MCE Academy completo + relatório de progresso",
      "Ajuste semanal automático do plano",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    price: "R$ 249",
    priceSub: `${CHALLENGE_DAYS} dias + acompanhamento direto`,
    emoji: "🏆",
    features: [
      "Tudo do PREMIUM",
      "Ajuste manual do Coach Diogo Mello",
      "Análise de exames e composição corporal",
      "Prioridade no WhatsApp durante o desafio",
      "Relatório final de transformação em PDF",
    ],
  },
];

export default function ChallengeUpgradePage() {
  const { participant, access } = useChallenge();
  const currentTier = participant?.tier ?? "free";

  return (
    <div className="mx-auto max-w-lg px-4 pt-5 pb-8 space-y-5">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/desafio/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-lg font-bold">Planos do Desafio</h1>
          <p className="text-xs text-muted-foreground">Transformação é sistema.</p>
        </div>
      </div>

      {!access.paid && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-sm">
            {access.full ? (
              <>
                Você está no acesso completo grátis —{" "}
                <strong>{access.daysLeft} {access.daysLeft === 1 ? "dia" : "dias"} restantes</strong>. Ative
                agora e não perca a pontuação cheia.
              </>
            ) : (
              <>
                Seu acesso completo terminou. No modo básico você pontua no máximo{" "}
                <strong>{MAX_POINTS_BASIC} pts/dia</strong> e o plano fica bloqueado.
              </>
            )}
          </CardContent>
        </Card>
      )}

      {PLANS.map((plan) => {
        const isCurrent = plan.id === currentTier;
        return (
          <Card
            key={plan.id}
            className={plan.highlight ? "border-primary/60 shadow-[0_0_24px_hsl(var(--primary)/0.15)]" : undefined}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold tracking-wide flex items-center gap-2">
                    <span aria-hidden>{plan.emoji}</span> {plan.name}
                    {plan.highlight && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        MAIS ESCOLHIDO
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{plan.priceSub}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold">{plan.price}</p>
                </div>
              </div>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.missing?.map((f) => (
                  <li key={f} className="flex gap-2 text-xs text-muted-foreground/70">
                    <span className="mt-0.5 shrink-0" aria-hidden>—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <p className="text-[11px] text-muted-foreground">
                  {isCurrent ? "Seu plano atual." : "Plano de entrada do desafio."}
                </p>
              ) : isCurrent ? (
                <Button className="w-full" disabled>Plano ativo</Button>
              ) : (
                <Button asChild className="w-full gap-2" variant={plan.highlight ? "default" : "outline"}>
                  <a
                    href={`${WHATSAPP}${encodeURIComponent(`Quero ativar o plano ${plan.name} do Desafio 30 Dias nutriON.`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {plan.id === "vip" ? <Crown className="w-4 h-4" /> : <Gem className="w-4 h-4" />}
                    Ativar {plan.name}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Button asChild variant="ghost" className="w-full gap-2 text-xs">
        <a href={`${WHATSAPP}${encodeURIComponent("Tenho uma dúvida sobre os planos do Desafio 30 Dias.")}`} target="_blank" rel="noreferrer">
          <MessageCircle className="w-4 h-4" /> Falar com o Coach antes de decidir
        </a>
      </Button>
    </div>
  );
}
