import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useCoachTier } from "@/hooks/useCoachTier";

type Props = {
  variant?: "inline" | "card";
  message?: string;
};

const CoachUpgradeGate = ({ variant = "card", message }: Props) => {
  const navigate = useNavigate();
  const { currentClients, maxClients, isCoachPro, isAdmin } = useCoachTier();

  if (isCoachPro || isAdmin) return null;

  const defaultMsg = `Você atingiu ${currentClients}/${maxClients} clientes do plano Coach Free. Faça upgrade para Coach Pro e tenha clientes ilimitados.`;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-xs text-yellow-300">
        <Lock className="w-3 h-3" />
        <span>{message || defaultMsg}</span>
        <button onClick={() => navigate("/coach/settings")} className="underline">
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <Card className="border-yellow-500/40 bg-yellow-500/5">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-yellow-200">Limite Coach Free atingido</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {message || defaultMsg}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/coach/settings")}>
          Upgrade
        </Button>
      </CardContent>
    </Card>
  );
};

export default CoachUpgradeGate;
