import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Lock, ArrowRight, Zap } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  fromPlan: string;
  lockedFeature: string;
}

const upgradePath: Record<string, {
  target: string;
  price: string;
  priceFrom: string;
  discount: number;
  checkoutUrl: string;
  highlights: string[];
  urgency: string;
}> = {
  ON: {
    target: "ON +",
    price: "R$127",
    priceFrom: "R$197",
    discount: 35,
    checkoutUrl: "https://pay.kiwify.com.br/6pXyygp",
    urgency: "50 vagas de fundador — restam poucas",
    highlights: [
      "Chat IA nutriON ilimitado (24h)",
      "Plano semanal completo por IA",
      "Receitas por perfil comportamental",
      "Lista de compras automática",
      "30+ micronutrientes rastreados",
      "Score nutricional diário (0-100)",
      "Alertas preditivos por IA",
      "Foto do prato → IA registra",
    ],
  },
  "ON +": {
    target: "ON PRO",
    price: "R$247",
    priceFrom: "R$397",
    discount: 37,
    checkoutUrl: "https://pay.kiwify.com.br/zbtOulj",
    urgency: "Vagas limitadas — máx. 20 alunos simultâneos",
    highlights: [
      "2 check-ins mensais com Coach (vídeo/áudio)",
      "Coach com painel em tempo real",
      "Feedback semanal personalizado",
      "Ajuste de plano pelo Coach",
      "Canal prioritário (resposta em até 24h)",
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
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative w-full max-w-md bg-[#09090f] border border-primary/25 rounded-2xl overflow-hidden shadow-[0_0_80px_-20px_hsl(var(--primary)/0.35)]"
          >
            {/* Top accent line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="p-7">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#50507a] hover:text-[#f0edf8] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lock icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-5 h-5 text-primary" />
              </div>

              {/* Title */}
              <h3 className="font-heading text-[1.5rem] text-center text-[#f0edf8] tracking-wide mb-1.5">
                FUNÇÃO BLOQUEADA
              </h3>
              <p className="text-center text-[.8rem] text-[#7070a0] font-landing mb-5">
                <span className="text-primary font-medium">"{lockedFeature}"</span> está disponível a partir do{" "}
                <span className="text-[#f0edf8] font-semibold">{path.target}</span>.
              </p>

              {/* Urgency badge */}
              <div className="flex items-center justify-center gap-1.5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[.6rem] text-primary/80 tracking-[.1em] uppercase">{path.urgency}</span>
              </div>

              {/* Plan comparison card */}
              <div className="bg-[#06060f] border border-[#14142a] rounded-xl p-5 mb-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-[.6rem] text-[#50507a] tracking-[.1em] uppercase">Plano</span>
                    <p className="font-heading text-[1.1rem] text-[#f0edf8] mt-0.5">{path.target}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[.65rem] text-[#40405a] line-through">{path.priceFrom}/mês</div>
                    <div className="font-heading text-primary text-[1.5rem] leading-none">{path.price}</div>
                    <div className="font-mono text-[.55rem] text-[#50507a]">/mês · {path.discount}% off</div>
                  </div>
                </div>

                <div className="h-px bg-[#14142a] mb-3" />

                <ul className="flex flex-col gap-2">
                  {path.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-[.77rem] text-[#a0a0c0] font-landing">
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
                  window.open(path.checkoutUrl, "_blank");
                }}
                className="w-full py-3.5 rounded-xl bg-primary text-black font-mono text-[.74rem] font-medium tracking-[.08em] hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                FAZER UPGRADE PARA {path.target.toUpperCase()}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[.6rem] text-[#40405a] mt-3 font-mono">
                Cancele quando quiser · sem fidelidade · suporte em português
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
