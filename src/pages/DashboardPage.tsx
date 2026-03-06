import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  Flame, TrendingUp, Droplets, Apple, BarChart3, MessageSquare,
  User, Plus, Utensils, LogOut, Dumbbell
} from "lucide-react";

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [todayTotals, setTodayTotals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (!profile?.onboarding_completed && !loading) {
      navigate("/onboarding");
    }
  }, [profile, loading]);

  useEffect(() => {
    if (!user) return;
    const fetchMeals = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("meal_date", today);
      if (data) {
        setTodayMeals(data);
        setTodayTotals({
          kcal: data.reduce((s, m) => s + (m.total_kcal || 0), 0),
          protein: data.reduce((s, m) => s + (m.total_protein || 0), 0),
          carbs: data.reduce((s, m) => s + (m.total_carbs || 0), 0),
          fat: data.reduce((s, m) => s + (m.total_fat || 0), 0),
        });
      }
    };
    fetchMeals();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kcalTarget = profile.vet_kcal || 2000;
  const proteinTarget = profile.protein_g || 150;
  const carbsTarget = profile.carbs_g || 250;
  const fatTarget = profile.fat_g || 65;

  const kcalPercent = Math.min((todayTotals.kcal / kcalTarget) * 100, 100);
  const protPercent = Math.min((todayTotals.protein / proteinTarget) * 100, 100);
  const carbPercent = Math.min((todayTotals.carbs / carbsTarget) * 100, 100);
  const fatPercent = Math.min((todayTotals.fat / fatTarget) * 100, 100);

  // Day status
  const isON = kcalPercent >= 70 && protPercent >= 60;
  const isAlmost = kcalPercent >= 40 || protPercent >= 40;

  const macros = [
    { label: "Proteína", value: todayTotals.protein, target: proteinTarget, unit: "g", percent: protPercent, colorClass: "bg-primary" },
    { label: "Carboidrato", value: todayTotals.carbs, target: carbsTarget, unit: "g", percent: carbPercent, colorClass: "bg-accent" },
    { label: "Gordura", value: todayTotals.fat, target: fatTarget, unit: "g", percent: fatPercent, colorClass: "bg-danger" },
  ];

  const levelNames = ["Iniciante", "Iniciante", "Consistente", "Consistente", "Máquina", "Máquina", "Lenda", "Lenda", "Modo ON", "Modo ON"];


  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground font-mono">Olá,</p>
            <h1 className="text-lg font-bold text-foreground">{profile.full_name || "Usuário"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gold-subtle bg-primary/5">
              <div className={`w-2 h-2 rounded-full ${isON ? "bg-primary animate-pulse-gold" : isAlmost ? "bg-primary/50" : "bg-danger"}`} />
              <span className="text-xs font-mono text-primary">{isON ? "ON" : isAlmost ? "QUASE" : "OFF"}</span>
            </div>
            <button onClick={signOut} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calories center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Consumidas hoje</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl sm:text-6xl font-bold font-mono text-foreground">
              {Math.round(todayTotals.kcal).toLocaleString()}
            </span>
            <span className="text-lg text-muted-foreground font-mono">/ {Math.round(kcalTarget).toLocaleString()}</span>
          </div>
          <span className="text-xs text-primary font-mono">kcal</span>
        </motion.div>

        {/* Macro bars */}
        <div className="space-y-3 mb-6">
          {macros.map((macro, i) => (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-muted-foreground">{macro.label}</span>
                <span className="text-xs font-mono text-foreground">
                  {Math.round(macro.value)}<span className="text-muted-foreground">/{macro.target}{macro.unit}</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${macro.percent}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${macro.colorClass}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
            <span className="text-lg font-bold font-mono text-foreground">{profile.streak_days || 0}</span>
            <p className="text-[10px] text-muted-foreground font-mono">Streak 🔥</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <span className="text-lg font-bold font-mono text-foreground">Lv.{profile.level || 1}</span>
            <p className="text-[10px] text-muted-foreground font-mono">{levelNames[profile.level || 1]}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <BarChart3 className="w-5 h-5 text-accent mx-auto mb-1" />
            <span className="text-lg font-bold font-mono text-foreground">{profile.xp || 0}</span>
            <p className="text-[10px] text-muted-foreground font-mono">XP</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className={`rounded-xl border p-3 mb-4 ${
          isON ? "bg-primary/10 border-primary/20" : isAlmost ? "bg-primary/5 border-primary/10" : "bg-danger/10 border-danger/20"
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isON ? "bg-primary animate-pulse-gold" : isAlmost ? "bg-primary/60" : "bg-danger"}`} />
            <span className={`text-sm font-mono font-semibold ${isON ? "text-primary" : isAlmost ? "text-primary/80" : "text-danger"}`}>
              {isON ? "MODO ON" : isAlmost ? "QUASE LÁ" : "MODO OFF"}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {isON ? "Dia no controle ✓" : isAlmost ? "Continue registrando" : "Registre suas refeições"}
            </span>
          </div>
        </div>

        {/* Today's meals */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Refeições de hoje</h3>
          {todayMeals.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/50 p-6 text-center">
              <Utensils className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma refeição registrada</p>
              <p className="text-xs text-muted-foreground mt-1">Toque no + para registrar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayMeals.map(meal => (
                <div key={meal.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Apple className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {meal.meal_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meal.total_kcal} kcal · {meal.total_protein}g prot
                    </p>
                  </div>
                  {meal.confirmed && (
                    <span className="text-xs text-primary font-mono">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick info */}
        <div className="rounded-xl border border-border bg-card/50 p-4 mb-4">
          <p className="text-xs text-muted-foreground font-mono mb-1">Seu protocolo</p>
          <p className="text-sm font-semibold text-foreground">{profile.vet_kcal} kcal/dia · {profile.protein_g}g prot · {profile.carbs_g}g carb · {profile.fat_g}g fat</p>
          <p className="text-xs text-primary font-mono mt-1">
            {profile.goal === "lose_weight" ? "Emagrecimento" :
             profile.goal === "gain_muscle" ? "Hipertrofia" :
             profile.goal === "definition" ? "Definição" :
             profile.goal === "glp1" ? "Protocolo GLP-1" :
             profile.goal === "performance" ? "Performance" :
             profile.goal === "health" ? "Saúde" : "Manutenção"}
          </p>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {[
            { id: "home", icon: BarChart3, label: "Home" },
            { id: "plan", icon: Utensils, label: "Plano" },
            { id: "add", icon: Plus, label: "" },
            { id: "chat", icon: MessageSquare, label: "Chat" },
            { id: "profile", icon: User, label: "Perfil" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              {item.id === "add" ? (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground -mt-5 glow-gold">
                  <Plus className="w-6 h-6" />
                </div>
              ) : (
                <>
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-mono ${activeTab === item.id ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
