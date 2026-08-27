import { useNavigate } from "react-router-dom";
import { ArrowLeft, Swords } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ExerciseArsenalSelector from "@/components/workout/ExerciseArsenalSelector";

const ExerciseArsenalPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      <div className="relative z-10 flex-shrink-0 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/coach/dashboard")}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-orange-500/30 border border-primary/30 flex items-center justify-center">
            <Swords className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground tracking-tight">
              ARSENAL DE EXERCÍCIOS <span className="text-primary">⚔️</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">
              Banco completo por grupo muscular + técnicas avançadas
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 min-h-0">
        <ExerciseArsenalSelector />
      </div>

      <BottomNav />
    </div>
  );
};

export default ExerciseArsenalPage;
