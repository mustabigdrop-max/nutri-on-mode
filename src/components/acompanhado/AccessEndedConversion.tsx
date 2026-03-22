import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Star, Scale, Sparkles, ArrowRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const AccessEndedConversion = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const streak = profile?.streak_days || 0;
  const xp = profile?.xp || 0;
  const weight = profile?.weight_kg || 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Seu acesso via coach foi encerrado.
          </h1>
          <p className="text-sm text-muted-foreground">
            Não perca seu progresso — continue com o ON+
          </p>
        </div>

        {/* Progress stats */}
        <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4">
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider text-center">
            Seu progresso até aqui
          </p>
          <div className="grid grid-cols-3 gap-3">
            {streak > 0 && (
              <div className="text-center p-3 rounded-xl bg-background">
                <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-foreground">{streak}</span>
                <p className="text-[9px] text-muted-foreground">dias streak</p>
              </div>
            )}
            <div className="text-center p-3 rounded-xl bg-background">
              <Star className="w-5 h-5 text-primary mx-auto mb-1" />
              <span className="text-lg font-bold font-mono text-foreground">{xp}</span>
              <p className="text-[9px] text-muted-foreground">XP total</p>
            </div>
            {weight > 0 && (
              <div className="text-center p-3 rounded-xl bg-background">
                <Scale className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-foreground">{weight}kg</span>
                <p className="text-[9px] text-muted-foreground">registrado</p>
              </div>
            )}
          </div>

          {streak > 0 && (
            <p className="text-sm text-center text-foreground font-medium">
              Você tem {streak} dias de streak. Assine agora e mantenha tudo.
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-12"
            onClick={() => navigate("/#planos")}
          >
            Continuar por R$127/mês
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground/60 hover:text-muted-foreground text-xs"
            onClick={() => navigate("/dashboard")}
          >
            Perder meu progresso e sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessEndedConversion;
