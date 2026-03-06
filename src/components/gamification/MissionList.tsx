import { motion } from "framer-motion";
import { Sparkles, Loader2, Check } from "lucide-react";
import type { Mission } from "@/hooks/useGamification";

interface MissionListProps {
  missions: Mission[];
  onComplete: (id: string) => void;
  onGenerate: () => void;
  generating: boolean;
}

const missionTypeIcons: Record<string, string> = {
  nutrition: "🥗",
  hydration: "💧",
  mindful: "🧘",
  exercise: "🏃",
};

const MissionList = ({ missions, onComplete, onGenerate, generating }: MissionListProps) => {
  if (missions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl p-6 text-center"
      >
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-sm font-bold text-foreground mb-1">Sem missões para hoje</p>
        <p className="text-xs text-muted-foreground mb-4">A IA vai criar missões personalizadas para você!</p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {generating ? "Gerando..." : "Gerar Missões com IA"}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {missions.map((mission, i) => (
        <motion.div
          key={mission.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`bg-card border rounded-xl p-3 flex items-center gap-3 transition-all ${
            mission.completed ? "border-primary/30 opacity-70" : "border-border"
          }`}
        >
          <span className="text-lg">{missionTypeIcons[mission.mission_type] || "⭐"}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold ${mission.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {mission.title}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{mission.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-mono text-primary">+{mission.xp_reward}</span>
            {mission.completed ? (
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-primary" />
              </div>
            ) : (
              <button
                onClick={() => onComplete(mission.id)}
                className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MissionList;
