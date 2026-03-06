import { motion } from "framer-motion";
import type { Challenge } from "@/hooks/useGamification";

interface ChallengeListProps {
  challenges: Challenge[];
}

const challengeTypeIcons: Record<string, string> = {
  protein: "💪",
  hydration: "💧",
  sugar_detox: "🚫",
  general: "🎯",
};

const ChallengeList = ({ challenges }: ChallengeListProps) => {
  if (challenges.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <p className="text-sm font-bold text-foreground mb-1">Desafios Semanais</p>
        <p className="text-xs text-muted-foreground">Em breve! Desafios temáticos toda semana 🎯</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Desafios da Semana</h3>
      {challenges.map((ch, i) => {
        const pct = Math.min(Math.round((ch.current_value / ch.target_value) * 100), 100);
        return (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card border rounded-xl p-3 ${ch.completed ? "border-primary/30" : "border-border"}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{challengeTypeIcons[ch.challenge_type] || "🎯"}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">{ch.title}</p>
                <p className="text-[10px] text-muted-foreground">{ch.description}</p>
              </div>
              <span className="text-[10px] font-mono text-primary">+{ch.xp_reward}</span>
            </div>
            <div className="mt-2 w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">{ch.current_value}/{ch.target_value}</span>
              <span className="text-[9px] text-muted-foreground">{pct}%</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChallengeList;
