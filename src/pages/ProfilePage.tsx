import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Award, Flame, TrendingUp, Star, Trophy,
  Target, Zap, Shield, Heart, Crown, LogOut,
  BarChart3, Utensils, Plus, MessageSquare, User, ChevronRight
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  condition: string;
}

const ProfilePage = () => {
  const { signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [mealCount, setMealCount] = useState(0);
  const [weightCount, setWeightCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const fetchCounts = async () => {
      const { count: mc } = await supabase.from("meal_logs").select("*", { count: "exact", head: true }).eq("user_id", profile.user_id);
      const { count: wc } = await supabase.from("weight_logs").select("*", { count: "exact", head: true }).eq("user_id", profile.user_id);
      setMealCount(mc || 0);
      setWeightCount(wc || 0);
    };
    fetchCounts();
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const xp = profile.xp || 0;
  const level = profile.level || 1;
  const streak = profile.streak_days || 0;
  const xpForNext = level * 100;
  const xpProgress = (xp % 100) / 100 * 100;

  const levelNames: Record<number, string> = {
    1: "Iniciante", 2: "Aprendiz", 3: "Consistente", 4: "Dedicado",
    5: "Máquina", 6: "Guerreiro", 7: "Lenda", 8: "Ícone", 9: "Modo ON", 10: "Transcendente",
  };

  const badges: Badge[] = [
    { id: "first_meal", name: "Primeira Refeição", description: "Registre sua primeira refeição", icon: <Utensils className="w-5 h-5" />, unlocked: mealCount >= 1, condition: `${Math.min(mealCount, 1)}/1` },
    { id: "streak_3", name: "Streak 3 🔥", description: "3 dias consecutivos", icon: <Flame className="w-5 h-5" />, unlocked: streak >= 3, condition: `${Math.min(streak, 3)}/3` },
    { id: "streak_7", name: "Semana ON", description: "7 dias consecutivos", icon: <Zap className="w-5 h-5" />, unlocked: streak >= 7, condition: `${Math.min(streak, 7)}/7` },
    { id: "streak_30", name: "Mês Completo", description: "30 dias consecutivos", icon: <Crown className="w-5 h-5" />, unlocked: streak >= 30, condition: `${Math.min(streak, 30)}/30` },
    { id: "meals_10", name: "10 Refeições", description: "Registre 10 refeições", icon: <Target className="w-5 h-5" />, unlocked: mealCount >= 10, condition: `${Math.min(mealCount, 10)}/10` },
    { id: "meals_50", name: "50 Refeições", description: "Registre 50 refeições", icon: <Star className="w-5 h-5" />, unlocked: mealCount >= 50, condition: `${Math.min(mealCount, 50)}/50` },
    { id: "meals_100", name: "Centurião", description: "Registre 100 refeições", icon: <Trophy className="w-5 h-5" />, unlocked: mealCount >= 100, condition: `${Math.min(mealCount, 100)}/100` },
    { id: "level_5", name: "Nível 5", description: "Alcance o nível 5", icon: <Shield className="w-5 h-5" />, unlocked: level >= 5, condition: `Lv.${Math.min(level, 5)}/5` },
    { id: "weight_1", name: "Primeiro Peso", description: "Registre seu primeiro peso", icon: <Heart className="w-5 h-5" />, unlocked: weightCount >= 1, condition: `${Math.min(weightCount, 1)}/1` },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1">Perfil & Conquistas</h1>
          <button onClick={signOut} className="p-2 rounded-lg text-muted-foreground hover:text-danger transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {(profile.full_name || "U")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{profile.full_name || "Usuário"}</h2>
              <p className="text-xs text-primary font-mono">{levelNames[level] || "Mestre"} · Lv.{level}</p>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
              <span>XP</span>
              <span>{xp % 100}/{100} para Lv.{level + 1}</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-xl bg-background">
              <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
              <span className="text-lg font-bold font-mono text-foreground">{streak}</span>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-background">
              <Award className="w-5 h-5 text-accent mx-auto mb-1" />
              <span className="text-lg font-bold font-mono text-foreground">{unlockedCount}</span>
              <p className="text-[10px] text-muted-foreground">Badges</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-background">
              <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
              <span className="text-lg font-bold font-mono text-foreground">{xp}</span>
              <p className="text-[10px] text-muted-foreground">XP Total</p>
            </div>
          </div>
        </motion.div>

        {/* Streak fire animation */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6 text-center"
          >
            <div className="text-4xl mb-2 animate-pulse-gold" style={{ display: "inline-block" }}>🔥</div>
            <p className="text-sm font-bold text-foreground">
              {streak} {streak === 1 ? "dia" : "dias"} de streak!
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {streak >= 30 ? "Imparável! 🏆" :
               streak >= 14 ? "Máquina! 💪" :
               streak >= 7 ? "Semana completa! 🎯" :
               streak >= 3 ? "Consistência! ⚡" :
               "Continue assim! 🚀"}
            </p>
          </motion.div>
        )}

        {/* Badges grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">🏆 Conquistas ({unlockedCount}/{badges.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border p-3 text-center transition-all ${
                  badge.unlocked
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card/50 opacity-50"
                }`}
              >
                <div className={`mx-auto mb-1 ${badge.unlocked ? "text-primary" : "text-muted-foreground"}`}>
                  {badge.icon}
                </div>
                <p className="text-[10px] font-semibold text-foreground truncate">{badge.name}</p>
                <p className="text-[9px] text-muted-foreground font-mono">{badge.condition}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => navigate("/settings")}
            className="w-full rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Configurações</p>
              <p className="text-[10px] text-muted-foreground">Editar perfil, metas e macros</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/progress")}
            className="w-full rounded-xl border border-border bg-card p-3 flex items-center gap-3 hover:border-primary/30 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Progresso</p>
              <p className="text-[10px] text-muted-foreground">Gráficos de peso, macros e score</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Protocol info */}
        <div className="rounded-xl border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Seu Protocolo</h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="text-muted-foreground">Meta calórica:</div>
            <div className="text-foreground font-semibold">{profile.vet_kcal} kcal</div>
            <div className="text-muted-foreground">Proteína:</div>
            <div className="text-foreground font-semibold">{profile.protein_g}g</div>
            <div className="text-muted-foreground">Carboidrato:</div>
            <div className="text-foreground font-semibold">{profile.carbs_g}g</div>
            <div className="text-muted-foreground">Gordura:</div>
            <div className="text-foreground font-semibold">{profile.fat_g}g</div>
            <div className="text-muted-foreground">Objetivo:</div>
            <div className="text-primary font-semibold">
              {profile.goal === "lose_weight" ? "Emagrecimento" :
               profile.goal === "gain_muscle" ? "Hipertrofia" :
               profile.goal === "definition" ? "Definição" :
               profile.goal === "glp1" ? "GLP-1" :
               profile.goal === "performance" ? "Performance" : "Saúde"}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
