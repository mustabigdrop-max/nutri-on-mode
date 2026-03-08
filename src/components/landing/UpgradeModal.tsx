import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Lock } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  fromPlan: string;
  lockedFeature: string;
}

const upgradePath: Record<string, { target: string; price: string; highlights: string[] }> = {
  ON: {
    target: "ON +",
    price: "R$97",
    highlights: [
      "Chat IA nutriON ilimitado",
      "Plano semanal completo por IA",
      "Receitas personalizadas por perfil",
      "Lista de compras automática",
      "30+ micronutrientes rastreados",
      "Score nutricional diário (0-100)",
      "Alertas preditivos por IA",
      "Foto do prato → IA registra",
    ],
  },
  "ON +": {
    target: "ON PRO",
    price: "R$197",
    highlights: [
      "2 check-ins mensais com Coach (vídeo/áudio)",
      "Coach com painel em tempo real",
      "Feedback semanal personalizado",
      "Ajuste de plano pelo Coach",
      "Canal prioritário (resposta 24h)",
      "Grupo exclusivo alunos PRO",
    ],
  },
};

const UpgradeModal = ({ open, onClose, fromPlan, lockedFeature }: UpgradeModalProps) => {
  const path = upgradePath[fromPlan] || upgradePath["ON"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-[#0a0a1a] border border-primary/20 rounded-2xl p-8 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.3)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#50507a] hover:text-[#f0edf8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lock icon */}
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-6 h-6 text-primary" />
            </div>

            {/* Title */}
            <h3 className="font-heading text-[1.6rem] text-center text-[#f0edf8] tracking-wide mb-2">
              DESBLOQUEIE ESSA FUNÇÃO
            </h3>
            <p className="text-center text-[.82rem] text-[#7070a0] font-landing mb-6">
              <span className="text-primary font-medium">{lockedFeature}</span> está disponível a partir do plano{" "}
              <span className="text-[#f0edf8] font-medium">{path.target}</span>.
            </p>

            {/* Comparison */}
            <div className="bg-[#06060f] border border-[#14142a] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[.65rem] text-[#50507a] tracking-[.1em] uppercase">
                  {path.target}
                </span>
                <span className="font-heading text-primary text-[1.3rem]">{path.price}<span className="font-mono text-[.55rem] text-[#50507a]">/mês</span></span>
              </div>
              <ul className="flex flex-col gap-2">
                {path.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[.78rem] text-[#a0a0c0] font-landing">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                onClose();
                window.location.href = "/auth";
              }}
              className="w-full py-3.5 rounded-lg bg-primary text-black font-mono text-[.75rem] font-medium tracking-[.08em] hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary transition-all"
            >
              FAZER UPGRADE PARA {path.target.toUpperCase()} →
            </button>
            <p className="text-center text-[.65rem] text-[#50507a] mt-3 font-mono">
              Cancele quando quiser
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
