import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Brain, Zap, TrendingUp, MessageSquare, Award, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Glp1UpsellModalProps {
  open: boolean;
  onClose: () => void;
  onActivate: () => void;
  triggerContext?: string;
}

const BENEFITS = [
  { icon: Shield, text: "Protocolo proteico personalizado para preservar massa muscular" },
  { icon: Brain, text: "Plano alimentar adaptado à supressão de apetite" },
  { icon: Zap, text: "Alertas inteligentes de risco de sarcopenia" },
  { icon: TrendingUp, text: "Guia completo de saída do medicamento sem reganho" },
  { icon: Award, text: "Score semanal de execução do protocolo" },
  { icon: MessageSquare, text: "IA coach disponível 24h com foco em GLP-1" },
];

const Glp1UpsellModal = ({ open, onClose, onActivate, triggerContext }: Glp1UpsellModalProps) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[hsl(168,100%,50%)]/20 flex items-center justify-center">
                <Syringe className="w-6 h-6 text-accent" />
              </div>
              <div>
                <span className="text-xs font-mono text-accent uppercase tracking-wider">Módulo Exclusivo</span>
                <h2 className="text-xl font-bold text-foreground font-display">GLP-1 Pro</h2>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              Você usa GLP-1. Seu protocolo precisa ser diferente.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A maioria perde músculo, sofre com efeitos colaterais e reganha tudo ao parar. 
              O Protocolo GLP-1 Pro foi criado para isso não acontecer com você.
            </p>
          </div>

          {triggerContext && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-xs text-destructive font-medium">{triggerContext}</p>
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-3">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <b.icon className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-sm text-foreground/90">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="rounded-xl bg-secondary/50 border border-border p-4">
            <p className="text-sm text-foreground/80 italic">
              "Perdi 18kg com Ozempic mas mantive toda minha massa muscular seguindo o protocolo nutriON"
            </p>
            <p className="text-xs text-muted-foreground mt-2">— Ana Paula, 38 anos, São Paulo</p>
          </div>

          {/* Price */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground line-through text-sm">R$197/mês</span>
              <span className="text-2xl font-bold text-accent font-display">R$97/mês</span>
            </div>
            <p className="text-xs text-muted-foreground">Add-on disponível em qualquer plano</p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={onActivate}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base"
            >
              <Syringe className="w-5 h-5 mr-2" />
              Ativar Protocolo GLP-1 Pro →
            </Button>
            <button
              onClick={onClose}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Agora não, continuar sem o protocolo
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Glp1UpsellModal;
