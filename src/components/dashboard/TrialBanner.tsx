import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { usePlanGate } from "@/hooks/usePlanGate";

const TrialBanner = () => {
  const navigate = useNavigate();
  const { plan } = usePlanGate();

  // Only show for free users
  if (plan !== "free") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Acesso Starter · ON+
          </p>
          <p className="text-sm font-bold text-foreground">
            Desbloqueie todas as funções por R$9,90
          </p>
        </div>
        <button
          onClick={() => navigate("/#plans")}
          className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          Ver planos
        </button>
      </div>
    </motion.div>
  );
};

export default TrialBanner;
