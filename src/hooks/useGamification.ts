import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  earned: boolean;
  earned_at?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  completed: boolean;
  mission_type: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  xp_reward: number;
  completed: boolean;
  challenge_type: string;
}

export const LEVELS = [
  { level: 1, name: "Iniciante", minXp: 0, icon: "🌱", color: "hsl(var(--muted-foreground))" },
  { level: 2, name: "Consistente", minXp: 100, icon: "🌿", color: "hsl(120, 40%, 50%)" },
  { level: 3, name: "Focado", minXp: 300, icon: "🎯", color: "hsl(200, 70%, 55%)" },
  { level: 4, name: "Disciplinado", minXp: 600, icon: "⚡", color: "hsl(45, 90%, 55%)" },
  { level: 5, name: "Forte", minXp: 1000, icon: "💪", color: "hsl(25, 90%, 55%)" },
  { level: 6, name: "Máquina", minXp: 1500, icon: "🔥", color: "hsl(0, 80%, 55%)" },
  { level: 7, name: "Lenda", minXp: 2500, icon: "👑", color: "hsl(280, 70%, 60%)" },
  { level: 8, name: "Imortal", minXp: 4000, icon: "💎", color: "hsl(var(--primary))" },
];

export const useGamification = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingMissions, setGeneratingMissions] = useState(false);

  const currentXp = profile?.xp || 0;
  const currentLevel = LEVELS.reduce((acc, l) => currentXp >= l.minXp ? l : acc, LEVELS[0]);
  const nextLevel = LEVELS.find(l => l.minXp > currentXp) || LEVELS[LEVELS.length - 1];
  const xpInLevel = currentXp - currentLevel.minXp;
  const xpForNextLevel = nextLevel.minXp - currentLevel.minXp;
  const levelProgress = xpForNextLevel > 0 ? Math.min((xpInLevel / xpForNextLevel) * 100, 100) : 100;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const weekStart = getWeekStart();

      const [badgesDef, userBadges, missionsData, challengesData] = await Promise.all([
        supabase.from("badges").select("*"),
        supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id),
        supabase.from("daily_missions").select("*").eq("user_id", user.id).eq("mission_date", today),
        supabase.from("weekly_challenges").select("*").eq("user_id", user.id).eq("week_start", weekStart),
      ]);

      const earnedMap = new Map((userBadges.data || []).map(ub => [ub.badge_id, ub.earned_at]));
      const allBadges: Badge[] = (badgesDef.data || []).map(b => ({
        ...b,
        earned: earnedMap.has(b.id),
        earned_at: earnedMap.get(b.id),
      }));
      setBadges(allBadges);
      setMissions((missionsData.data || []) as Mission[]);
      setChallenges((challengesData.data || []) as Challenge[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const generateMissions = useCallback(async () => {
    if (!user || generatingMissions) return;
    setGeneratingMissions(true);
    try {
      const profileCtx = profile ? `Objetivo: ${profile.goal}, Nível: ${currentLevel.name}, XP: ${currentXp}, Streak: ${profile.streak_days}d` : "";
      const { data, error } = await supabase.functions.invoke("generate-missions", {
        body: { profileContext: profileCtx, mealHistoryContext: "" },
      });
      if (error) throw error;
      if (data?.missions) {
        const today = new Date().toISOString().split("T")[0];
        const rows = data.missions.map((m: any) => ({
          user_id: user.id,
          mission_date: today,
          title: m.title,
          description: m.description,
          xp_reward: m.xp_reward || 20,
          mission_type: m.mission_type || "nutrition",
        }));
        const { data: inserted } = await supabase.from("daily_missions").upsert(rows, { onConflict: "user_id,mission_date,title" }).select("*");
        if (inserted) setMissions(inserted as Mission[]);
      }
    } catch (e) {
      console.error("Failed to generate missions:", e);
    }
    setGeneratingMissions(false);
  }, [user, profile, currentLevel, currentXp, generatingMissions]);

  const completeMission = useCallback(async (missionId: string) => {
    if (!user) return;
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    await supabase.from("daily_missions").update({ completed: true }).eq("id", missionId);
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true } : m));

    const newXp = (profile?.xp || 0) + mission.xp_reward;
    const newLevel = LEVELS.reduce((acc, l) => newXp >= l.minXp ? l.level : acc, 1);
    await updateProfile({ xp: newXp, level: newLevel });
  }, [user, missions, profile, updateProfile]);

  return {
    badges, missions, challenges, loading, generatingMissions,
    currentLevel, nextLevel, levelProgress, currentXp,
    generateMissions, completeMission,
  };
};

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}
