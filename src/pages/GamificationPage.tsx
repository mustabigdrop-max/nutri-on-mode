import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Share2 } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useProfile } from "@/hooks/useProfile";
import LevelCard from "@/components/gamification/LevelCard";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import MissionList from "@/components/gamification/MissionList";
import ChallengeList from "@/components/gamification/ChallengeList";
import ShareCard from "@/components/gamification/ShareCard";

type Tab = "overview" | "badges" | "missions";

const GamificationPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const gamification = useGamification();
  const [tab, setTab] = useState<Tab>("overview");
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Gamificação</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Conquistas, missões e progresso</p>
        </div>
        <button
          onClick={() => setShowShare(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 px-4 mt-4 max-w-lg mx-auto space-y-4">
        {/* Level Card */}
        <LevelCard
          currentLevel={gamification.currentLevel}
          nextLevel={gamification.nextLevel}
          levelProgress={gamification.levelProgress}
          currentXp={gamification.currentXp}
          streakDays={profile?.streak_days || 0}
        />

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: "overview", label: "Visão Geral" },
            { key: "badges", label: "Badges" },
            { key: "missions", label: "Missões" },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-foreground">{gamification.badges.filter(b => b.earned).length}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">Badges</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-foreground">{gamification.missions.filter(m => m.completed).length}/{gamification.missions.length}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">Missões Hoje</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-foreground">{gamification.challenges.filter(c => c.completed).length}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">Desafios</p>
                </div>
              </div>

              {/* Recent badges */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Últimas Conquistas</h3>
                <BadgeGrid badges={gamification.badges.filter(b => b.earned).slice(0, 6)} compact />
                {gamification.badges.filter(b => b.earned).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Complete missões e desafios para ganhar badges!</p>
                )}
              </div>

              {/* Today's missions */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Missões de Hoje</h3>
                <MissionList
                  missions={gamification.missions}
                  onComplete={gamification.completeMission}
                  onGenerate={gamification.generateMissions}
                  generating={gamification.generatingMissions}
                />
              </div>
            </motion.div>
          )}

          {tab === "badges" && (
            <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BadgeGrid badges={gamification.badges} />
            </motion.div>
          )}

          {tab === "missions" && (
            <motion.div key="missions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <MissionList
                missions={gamification.missions}
                onComplete={gamification.completeMission}
                onGenerate={gamification.generateMissions}
                generating={gamification.generatingMissions}
              />
              <ChallengeList challenges={gamification.challenges} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShare && (
          <ShareCard
            onClose={() => setShowShare(false)}
            profile={profile}
            currentLevel={gamification.currentLevel}
            currentXp={gamification.currentXp}
            badgeCount={gamification.badges.filter(b => b.earned).length}
            streakDays={profile?.streak_days || 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamificationPage;
