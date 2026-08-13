import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Microscope, Brain, BookOpen, Search } from "lucide-react";

interface LabUpsellModalProps {
  open: boolean;
  onClose: () => void;
}

const BULLETS = [
  { icon: Brain, text: "Agente com acesso a estudos de 2025 em tempo real" },
  { icon: BookOpen, text: "Protocolos completos explicados com base científica" },
  { icon: Search, text: "Biblioteca de pesquisas curada por especialistas" },
];

const LabUpsellModal = ({ open, onClose }: LabUpsellModalProps) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="bg-card border-primary/20 max-w-md">
      <DialogHeader className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Microscope className="w-8 h-8 text-primary" />
        </div>
        <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
          NUTRION LAB
        </DialogTitle>
        <DialogDescription className="text-muted-foreground text-sm">
          Seu consultor científico 24h
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {BULLETS.map((b, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <b.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-foreground/90">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="text-center space-y-1 py-2">
        <p className="text-xs text-muted-foreground">Adicione ao seu plano atual</p>
        <p className="text-2xl font-bold text-primary">+ R$97<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
      </div>

      <Button className="w-full h-12 text-base font-bold" onClick={onClose}>
        Ativar o LAB →
      </Button>
      
      <p className="text-[10px] text-center text-muted-foreground font-mono">
        Usado por coaches e atletas que levam nutrição a sério.
      </p>
    </DialogContent>
  </Dialog>
);

export default LabUpsellModal;
