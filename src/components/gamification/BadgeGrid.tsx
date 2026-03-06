import { motion } from "framer-motion";
import type { Badge } from "@/hooks/useGamification";

interface BadgeGridProps {
  badges: Badge[];
  compact?: boolean;
}

const BadgeGrid = ({ badges, compact }: BadgeGridProps) => {
  const sorted = [...badges].sort((a, b) => (a.earned === b.earned ? 0 : a.earned ? -1 : 1));
  const displayed = compact ? sorted.slice(0, 6) : sorted;

  return (
    <div className={`grid ${compact ? "grid-cols-3" : "grid-cols-3"} gap-2`}>
      {displayed.map((badge, i) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className={`relative bg-card border rounded-xl p-3 text-center transition-all ${
            badge.earned
              ? "border-primary/40 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.3)]"
              : "border-border opacity-50 grayscale"
          }`}
        >
          <span className="text-2xl block mb-1">{badge.icon}</span>
          <p className="text-[10px] font-bold text-foreground leading-tight">{badge.name}</p>
          {!compact && (
            <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
          )}
          {badge.earned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <span className="text-[8px] text-primary-foreground">✓</span>
            </div>
          )}
          {!badge.earned && !compact && (
            <p className="text-[8px] text-primary font-mono mt-1">+{badge.xp_reward} XP</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default BadgeGrid;
