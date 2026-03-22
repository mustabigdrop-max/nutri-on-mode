import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, BarChart3, BookOpen, ShoppingCart } from "lucide-react";

interface LockedFeatureModalProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
}

const BONUS_FEATURES = [
  { icon: <BookOpen className="w-4 h-4" />, label: "Receitas personalizadas por IA" },
  { icon: <ShoppingCart className="w-4 h-4" />, label: "Lista de compras inteligente" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "Histórico completo e relatórios" },
];

const LockedFeatureModal = ({ open, onClose, featureName }: LockedFeatureModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/20 max-w-sm mx-auto p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent px-6 pt-8 pb-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            Disponível no plano ON+
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seu coach cuida do seu plano.{" "}
            Para acessar <span className="text-foreground font-medium">{featureName}</span>{" "}
            por conta própria e ter controle total da sua nutrição, assine o ON+.
          </p>
        </div>

        {/* Bonus features */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider">
            O que você ganha no ON+
          </p>
          {BONUS_FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {f.icon}
              </div>
              <span className="text-foreground">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            onClick={() => window.location.href = "/#planos"}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Ver plano ON+ — R$127/mês →
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground text-sm"
            onClick={onClose}
          >
            Continuar no modo acompanhado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LockedFeatureModal;
