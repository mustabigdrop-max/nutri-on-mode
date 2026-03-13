import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Zap, ArrowRight } from "lucide-react";

interface TrialBannerProps {
  trialEndsAt: string | null;
  plan: string;
}

const TrialBanner = ({ trialEndsAt, plan }: TrialBannerProps) => {
  const navigate = useNavigate();

  const daysLeft = useMemo(() => {
    if (!trialEndsAt) return null;
    const end = new Date(trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [trialEndsAt]);

  // Only show for free plan users with active starter access
  if (!trialEndsAt || plan !== "free" || daysLeft === null) return null;

  const isExpiring = daysLeft <= 2;
  const isExpired = daysLeft === 0;

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-4"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-destructive flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Acesso starter encerrado</p>
            <p className="text-xs text-muted-foreground">Assine um plano para continuar com acesso completo.</p>
          </div>
          <button
            onClick={() => navigate("/#plans")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap"
          >
            Ver planos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-3 mb-4 ${
        isExpiring
          ? "border-orange-400/30 bg-orange-400/5"
          : "border-primary/20 bg-primary/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isExpiring ? "bg-orange-400/20" : "bg-primary/20"
        }`}>
          <Zap className={`w-4 h-4 ${isExpiring ? "text-orange-400" : "text-primary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Acesso Starter · ON+
          </p>
          <p className="text-sm font-bold text-foreground">
            {daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}
            {isExpiring && <span className="text-orange-400 ml-2 text-xs font-normal">— expira em breve</span>}
          </p>
        </div>
        <button
          onClick={() => navigate("/#plans")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
            isExpiring
              ? "bg-orange-400 text-white"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          } transition-colors`}
        >
          {isExpiring ? "Assinar agora" : "Ver planos"}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

export default TrialBanner;
