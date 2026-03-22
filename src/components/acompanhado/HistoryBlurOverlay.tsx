import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

interface HistoryBlurOverlayProps {
  children: React.ReactNode;
  isLimited: boolean;
}

const HistoryBlurOverlay = ({ children, isLimited }: HistoryBlurOverlayProps) => {
  if (!isLimited) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-xl">
        <div className="text-center space-y-3 p-6">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Veja seu histórico completo no ON+
          </p>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground text-xs font-bold"
            onClick={() => window.location.href = "/#planos"}
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Desbloquear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HistoryBlurOverlay;
