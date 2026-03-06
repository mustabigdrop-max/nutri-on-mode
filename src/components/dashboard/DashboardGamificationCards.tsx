import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, ChevronRight, Sparkles, Check, Leaf } from "lucide-react";
import { useGamification, LEVELS } from "@/hooks/useGamification";

const DashboardGamificationCards = () => {
  const navigate = useNavigate();
  const { currentLevel, levelProgress, currentXp, missions, badges, challenges, generateMissions, generatingMissions } = useGamification();
  const earnedBadges = badges.filter(b => b.earned).length;
  const completedMissions = missions.filter(m => m.completed).length;

  return (
    <div className="space-y-3">
      {/* Level + Badges row */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/gamification")}
          className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{currentLevel.icon}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{currentLevel.name}</p>
              <p className="text-[9px] text-muted-foreground font-mono">{currentXp} XP</p>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${levelProgress}%` }} />
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate("/gamification")}
          className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">{earnedBadges} Badges</span>
          </div>
          <p className="text-[9px] text-muted-foreground font-mono">{badges.length - earnedBadges} para conquistar</p>
          <div className="flex gap-0.5 mt-1.5">
            {badges.filter(b => b.earned).slice(0, 4).map(b => (
              <span key={b.id} className="text-sm">{b.icon}</span>
            ))}
            {earnedBadges > 4 && <span className="text-[9px] text-muted-foreground">+{earnedBadges - 4}</span>}
          </div>
        </motion.button>
      </div>

      {/* Missions card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">Missões de Hoje</span>
          </div>
          <button onClick={() => navigate("/gamification")} className="text-[10px] font-mono text-primary flex items-center gap-0.5">
            Ver todas <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {missions.length === 0 ? (
          <button
            onClick={generateMissions}
            disabled={generatingMissions}
            className="w-full py-2 rounded-lg border border-dashed border-border text-[10px] text-muted-foreground hover:border-primary/30 transition-all"
          >
            {generatingMissions ? "Gerando..." : "🎯 Gerar missões com IA"}
          </button>
        ) : (
          <div className="space-y-1.5">
            {missions.slice(0, 3).map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${m.completed ? "bg-primary/20" : "bg-muted"}`}>
                  {m.completed && <Check className="w-2.5 h-2.5 text-primary" />}
                </div>
                <span className={`text-[11px] flex-1 truncate ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {m.title}
                </span>
                <span className="text-[9px] font-mono text-primary">+{m.xp_reward}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Micronutrients quick link */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => navigate("/micronutrients")}
        className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-all"
      >
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Leaf className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-bold text-foreground">Micronutrientes</p>
          <p className="text-[9px] text-muted-foreground font-mono">Vitaminas, minerais e qualidade</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </motion.button>
    </div>
  );
};

export default DashboardGamificationCards;
