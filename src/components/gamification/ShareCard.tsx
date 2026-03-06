import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import { useRef, useCallback } from "react";
import { LEVELS } from "@/hooks/useGamification";
import type { Profile } from "@/hooks/useProfile";

interface ShareCardProps {
  onClose: () => void;
  profile: Profile | null;
  currentLevel: typeof LEVELS[number];
  currentXp: number;
  badgeCount: number;
  streakDays: number;
}

const ShareCard = ({ onClose, profile, currentLevel, currentXp, badgeCount, streakDays }: ShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `nutrion-progress-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch {
      // Fallback: copy text
      const text = `🏆 nutriON Progress\n${currentLevel.icon} ${currentLevel.name} | ${currentXp} XP\n🔥 ${streakDays} dias de streak\n🎖️ ${badgeCount} badges`;
      navigator.clipboard.writeText(text);
    }
  }, [currentLevel, currentXp, streakDays, badgeCount]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm space-y-4"
      >
        {/* Shareable card */}
        <div
          ref={cardRef}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <div className="absolute inset-0 bg-grid opacity-5" />
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-primary font-black text-lg tracking-tighter">nutri</span>
              <span className="text-foreground font-black text-lg tracking-tighter">ON</span>
              <span className="text-[9px] text-primary font-mono ml-auto">MODE: ON</span>
            </div>

            {/* Level */}
            <div className="text-center mb-4">
              <span className="text-5xl block mb-2">{currentLevel.icon}</span>
              <h3 className="text-xl font-black text-foreground">{currentLevel.name}</h3>
              <p className="text-sm text-muted-foreground">Level {currentLevel.level}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-lg font-black text-primary">{currentXp}</p>
                <p className="text-[9px] text-muted-foreground font-mono">XP</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-foreground">{streakDays}🔥</p>
                <p className="text-[9px] text-muted-foreground font-mono">STREAK</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-foreground">{badgeCount}🎖️</p>
                <p className="text-[9px] text-muted-foreground font-mono">BADGES</p>
              </div>
            </div>

            {/* User name */}
            <div className="text-center border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">{profile?.full_name || "Usuário nutriON"}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={downloadCard}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Salvar Imagem
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-card border border-border text-muted-foreground text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareCard;
