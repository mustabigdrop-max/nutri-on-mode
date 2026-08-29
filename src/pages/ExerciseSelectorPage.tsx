import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, BarChart3, Flame, Swords, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ExerciseSelector from "@/components/workout/ExerciseSelector";

const ExerciseSelectorPage = () => {
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
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Dumbbell className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground tracking-tight">SELEÇÃO INTELIGENTE <span className="text-primary">🎯</span></h1>
            <p className="text-[10px] text-muted-foreground font-mono">Exercícios por área específica + fase</p>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => navigate("/periodization")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <BarChart3 className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-semibold text-primary">Periodização</span>
            </button>
            <button
              onClick={() => navigate("/intensity-techniques")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
            >
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[9px] font-semibold text-orange-400">Técnicas</span>
            </button>
            <button
              onClick={() => navigate("/exercise-arsenal")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
            >
              <Swords className="w-3 h-3 text-yellow-400" />
              <span className="text-[9px] font-semibold text-yellow-400">Arsenal</span>
            </button>
            <button
              onClick={() => navigate("/recovery-protocols")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
            >
              <Heart className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-semibold text-emerald-400">Recovery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 min-h-0">
        <ExerciseSelector />
      </div>

      <BottomNav />
    </div>
  );
};

export default ExerciseSelectorPage;
