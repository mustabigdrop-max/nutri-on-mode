import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import IntensityTechniquesSelector from "@/components/workout/IntensityTechniquesSelector";

const IntensityTechniquesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coach/dashboard")} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
            <Flame className="w-4.5 h-4.5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">TÉCNICAS DE INTENSIDADE <span className="text-orange-400">🔥</span></h1>
            <p className="text-[10px] text-muted-foreground font-mono">11 técnicas avançadas para platôs</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 min-h-0">
        <IntensityTechniquesSelector />
      </div>

      <BottomNav />
    </div>
  );
};

export default IntensityTechniquesPage;
