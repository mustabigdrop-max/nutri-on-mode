import { motion } from "framer-motion";
import { LEVELS } from "@/hooks/useGamification";

interface LevelCardProps {
  currentLevel: typeof LEVELS[number];
  nextLevel: typeof LEVELS[number];
  levelProgress: number;
  currentXp: number;
  streakDays: number;
}

const LevelCard = ({ currentLevel, nextLevel, levelProgress, currentXp, streakDays }: LevelCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden"
  >
    {/* Background glow */}
    <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 30% 50%, ${currentLevel.color}, transparent 70%)` }} />

    <div className="relative z-10 flex items-center gap-4">
      {/* Level icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${currentLevel.color}20` }}>
          {currentLevel.icon}
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-primary-foreground">
          {currentLevel.level}
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-black text-foreground">{currentLevel.name}</h2>
        <p className="text-xs text-muted-foreground">{currentXp} XP total</p>

        {/* XP bar */}
        <div className="mt-2 w-full h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground font-mono">{Math.round(levelProgress)}%</span>
          <span className="text-[9px] text-muted-foreground font-mono">→ {nextLevel.name} ({nextLevel.minXp} XP)</span>
        </div>
      </div>
    </div>

    {/* Streak */}
    {streakDays > 0 && (
      <div className="relative z-10 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20">
        <span className="text-lg">🔥</span>
        <span className="text-xs font-bold text-foreground">{streakDays} dias de streak!</span>
      </div>
    )}
  </motion.div>
);

export default LevelCard;
