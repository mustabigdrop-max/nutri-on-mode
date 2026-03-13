import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { usePlanGate } from "@/hooks/usePlanGate";
import { useWorkoutSchedule, getWorkoutAdjustment, WORKOUT_TYPES, type WorkoutType } from "@/hooks/useWorkoutSchedule";
import TrialBanner from "@/components/dashboard/TrialBanner";
import ReengagementPopup from "@/components/dashboard/ReengagementPopup";
import UpgradeModal from "@/components/landing/UpgradeModal";
import DashboardGamificationCards from "@/components/dashboard/DashboardGamificationCards";
import NutriSyncComparisonCard from "@/components/dashboard/NutriSyncComparisonCard";
import WorkoutAlerts from "@/components/dashboard/WorkoutAlerts";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import ProactiveRecipeSuggestion from "@/components/dashboard/ProactiveRecipeSuggestion";
import WeeklySabotageCard from "@/components/dashboard/WeeklySabotageCard";
import ConsistencyScoreCard from "@/components/dashboard/ConsistencyScoreCard";
import MoodCheckinModal, { type MoodType, MOODS } from "@/components/dashboard/MoodCheckinModal";
import {
  ObjectiveBadge, getRingLabel, getScoreLabel,
  getPredictiveAlert, getHeaderSubtitle, getChildDashboardGreeting,
} from "@/components/dashboard/DashboardObjectiveAdapters";
import {
  Flame, TrendingUp, Droplets, Apple, BarChart3, MessageSquare,
  User, Plus, Utensils, LogOut, Zap, Brain, ChevronRight, Award,
  Camera, Users, Heart, Settings, HelpCircle, Leaf, Trophy, ShoppingCart, History, Dumbbell, FileText, Hammer,
  Clock, Pill, Bug, Smile, CalendarDays, HelpingHand, BarChart, Lock, Sun
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

// SVG animated ring component — upgraded with dual rings, glow, status pulse
const CalorieRing = ({ percent, kcal, target, objetivo }: { percent: number; kcal: number; target: number; objetivo?: string }) => {
  const r1 = 88, r2 = 72, stroke1 = 10, stroke2 = 4;
  const c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2;
  const offset1 = c1 - (Math.min(percent, 100) / 100) * c1;
  const offset2 = c2 - (Math.min(percent, 100) / 100) * c2;
  const remaining = Math.max(target - kcal, 0);
  const isOnTarget = percent >= 80 && percent <= 115;
  const isOver = percent > 115;

  return (
    <div className="relative w-56 h-56 mx-auto">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        background: isOver
          ? "radial-gradient(circle at 50% 50%, hsl(var(--destructive) / 0.07), transparent 70%)"
          : isOnTarget
            ? "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.09), transparent 70%)"
            : "radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.06), transparent 70%)",
        filter: "blur(12px)",
      }} />

      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="60%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Tick marks (8 dashes) */}
        </defs>
        {/* Outer track */}
        <circle cx="100" cy="100" r={r1} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke1} opacity={0.6} />
        {/* Outer fill */}
        <motion.circle
          cx="100" cy="100" r={r1} fill="none"
          stroke={isOver ? "hsl(var(--destructive))" : "url(#ringGrad)"}
          strokeWidth={stroke1} strokeLinecap="round"
          strokeDasharray={c1}
          initial={{ strokeDashoffset: c1 }}
          animate={{ strokeDashoffset: offset1 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
          filter="url(#ringGlow)"
        />
        {/* Inner track */}
        <circle cx="100" cy="100" r={r2} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke2} opacity={0.3} />
        {/* Inner fill — tracks protein */}
        <motion.circle
          cx="100" cy="100" r={r2} fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={stroke2} strokeLinecap="round"
          strokeDasharray={c2}
          initial={{ strokeDashoffset: c2 }}
          animate={{ strokeDashoffset: offset2 }}
          transition={{ duration: 1.9, ease: "easeOut", delay: 0.45 }}
          opacity={0.45}
        />
        {/* 12 o'clock dot */}
        <circle cx="100" cy={100 - r1} r="3" fill="hsl(var(--border))" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Pulsing ON indicator */}
        {isOnTarget && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute top-8 w-1.5 h-1.5 rounded-full bg-primary"
          />
        )}
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className={`text-[2.2rem] font-bold font-mono leading-none ${
            isOver ? "text-destructive" : "text-foreground"
          }`}
        >
          {Math.round(kcal).toLocaleString()}
        </motion.span>
        <span className="text-[10px] font-mono text-muted-foreground mt-0.5">de {target.toLocaleString()} kcal</span>
        <span className={`text-[9px] font-mono mt-1 ${isOnTarget ? "text-primary" : isOver ? "text-destructive" : "text-muted-foreground"}`}>
          {getRingLabel(objetivo || "saude_geral", remaining, percent)}
        </span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold ${
            isOnTarget ? "bg-primary/10 text-primary" : isOver ? "bg-destructive/10 text-destructive" : "bg-card text-muted-foreground"
          }`}
        >
          {Math.round(percent)}%
        </motion.div>
      </div>
    </div>
  );
};

// Hydration waves component
const HydrationWidget = ({ glasses, target }: { glasses: number; target: number }) => {
  const percent = Math.min((glasses / target) * 100, 100);
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 h-24">
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: `${percent}%`, background: "linear-gradient(180deg, hsl(200 80% 50% / 0.15), hsl(200 80% 50% / 0.25))" }}
          initial={{ height: 0 }}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
        >
          <svg viewBox="0 0 120 20" preserveAspectRatio="none" className="absolute top-0 left-0 w-[200%] h-5 -translate-y-full">
            <motion.path
              d="M0 10 Q15 0 30 10 Q45 20 60 10 Q75 0 90 10 Q105 20 120 10 V20 H0Z"
              fill="hsl(200 80% 50% / 0.2)"
              animate={{ x: [0, -60] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>
      </div>
      <div className="relative z-10 flex items-center justify-between h-full">
        <div>
          <Droplets className="w-5 h-5 text-cyan mb-1" />
          <p className="text-[10px] font-mono text-muted-foreground">Hidratação</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-foreground">{glasses}</span>
          <span className="text-xs font-mono text-muted-foreground">/{target}</span>
          <p className="text-[10px] font-mono text-cyan">{Math.round(glasses * 250)}ml</p>
        </div>
      </div>
    </div>
  );
};

// Score gauge — arc-style with gradient fill
const ScoreGauge = ({ score }: { score: number }) => {
  const arcColor = score >= 80 ? "hsl(var(--primary))" : score >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  const label = score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : "Melhore";
  // Half-arc: from 210° to 330° (120° sweep for 100%)
  const RADIUS = 28, CX = 36, CY = 38;
  const startAngle = -210, totalSweep = 240;
  const sweepAngle = (Math.min(score, 100) / 100) * totalSweep;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (sweep: number) => {
    const sx = CX + RADIUS * Math.cos(toRad(startAngle));
    const sy = CY + RADIUS * Math.sin(toRad(startAngle));
    const ex = CX + RADIUS * Math.cos(toRad(startAngle + sweep));
    const ey = CY + RADIUS * Math.sin(toRad(startAngle + sweep));
    const large = sweep > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${ex} ${ey}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-2 h-24 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: score >= 80 ? "radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.06), transparent 70%)" : "none",
      }} />
      <svg viewBox="0 0 72 52" className="w-16 h-14">
        {/* Track */}
        <path d={arcPath(totalSweep)} fill="none" stroke="hsl(var(--border))" strokeWidth="4.5" strokeLinecap="round" />
        {/* Fill */}
        <motion.path
          d={arcPath(sweepAngle)}
          fill="none" stroke={arcColor} strokeWidth="4.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
        />
        {/* Value */}
        <text x={CX} y={CY + 2} textAnchor="middle" className="font-mono" fontSize="11" fontWeight="bold" fill={arcColor}>{score}</text>
        <text x={CX} y={CY + 11} textAnchor="middle" fontSize="5.5" fill="hsl(var(--muted-foreground))">MCE Score</text>
      </svg>
      <p className="text-[8px] font-mono" style={{ color: arcColor }}>{label}</p>
    </div>
  );
};

// Streak fire — animated particles when streak > 0
const StreakFire = ({ days }: { days: number }) => (
  <div className="rounded-xl border border-border bg-card p-2 h-24 flex flex-col items-center justify-center relative overflow-hidden">
    {days > 0 && (
      <>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/12 via-primary/5 to-transparent pointer-events-none" />
        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-1 rounded-full"
            style={{
              width: 4 - i, height: 4 - i,
              background: i === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))",
              left: `${28 + i * 18}%`,
              opacity: 0.7,
            }}
            animate={{ y: [-4, -20 - i * 6], opacity: [0.7, 0], scale: [1, 0.3] }}
            transition={{ duration: 1.2 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
          />
        ))}
      </>
    )}
    <div className="relative z-10 flex flex-col items-center">
      <motion.div
        animate={days > 0 ? { scale: [1, 1.18, 1], rotate: [-2, 2, -2] } : {}}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame className={`w-5 h-5 ${days > 0 ? "text-primary" : "text-muted-foreground"}`}
          style={days > 0 ? { filter: "drop-shadow(0 0 5px hsl(var(--primary) / 0.6))" } : {}}
        />
      </motion.div>
      <motion.span
        className="text-2xl font-bold font-mono text-foreground leading-none mt-0.5"
        initial={{ scale: 1 }}
        animate={days > 0 ? { textShadow: ["0 0 0px transparent", "0 0 8px hsl(var(--primary) / 0.5)", "0 0 0px transparent"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {days}
      </motion.span>
      <p className="text-[9px] font-mono text-muted-foreground">Streak</p>
      {days >= 7 && <p className="text-[8px] font-mono text-primary leading-none">🔥 semana!</p>}
    </div>
  </div>
);

// XP bar — upgraded with milestone markers and shimmer
const XPBar = ({ xp, level }: { xp: number; level: number }) => {
  const LEVEL_NAMES = ["", "Iniciante", "Consistente", "Focado", "Disciplinado", "Forte", "Máquina", "Lenda", "Imortal"];
  const xpPerLevel = 500;
  const currentLevelXP = xp % xpPerLevel;
  const percent = (currentLevelXP / xpPerLevel) * 100;
  const MILESTONES = [25, 50, 75]; // % checkpoints

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Award className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-xs font-mono text-foreground font-bold">Lv.{level}</span>
          <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded-full bg-primary/10">
            {LEVEL_NAMES[Math.min(level, 8)]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-primary font-bold">{currentLevelXP}</span>
          <span className="text-[10px] font-mono text-muted-foreground">/ {xpPerLevel} XP</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden relative">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-gold-glow to-accent relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-y-0 w-8 bg-white/30 skew-x-12"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5, ease: "linear" }}
          />
        </motion.div>
        {/* Milestone markers */}
        {MILESTONES.map(m => (
          <div
            key={m}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${m}%`, background: "hsl(var(--border))", opacity: percent >= m ? 0.4 : 0.6 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] font-mono text-muted-foreground/50">{level === 1 ? "início" : `Lv.${level}`}</span>
        <span className="text-[8px] font-mono text-primary/50">{xpPerLevel - currentLevelXP} XP para Lv.{level + 1}</span>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [todayTotals, setTodayTotals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [todayMood, setTodayMood] = useState<MoodType | null>(null);
  const { todayLog: waterLog, addWater } = useWaterLogs();
  const { hasAccess, plan, isTrialActive, trialEndsAt } = usePlanGate();
  const { getTodayWorkout, todayLog: workoutLog } = useWorkoutSchedule();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: "" });
  const waterMl = waterLog?.ml_total ?? 0;
  const waterGlasses = Math.round(waterMl / 250);
  const isOnPlus = hasAccess("ON +");

  useEffect(() => {
    if (!profile?.onboarding_completed && !loading) {
      navigate("/onboarding");
    }
  }, [profile, loading]);

  const fetchMeals = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("meal_date", today)
      .order("created_at", { ascending: true });
    if (data) {
      setTodayMeals(data);
      setTodayTotals({
        kcal: data.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0),
        protein: data.reduce((s, m) => s + (Number(m.total_protein) || 0), 0),
        carbs: data.reduce((s, m) => s + (Number(m.total_carbs) || 0), 0),
        fat: data.reduce((s, m) => s + (Number(m.total_fat) || 0), 0),
      });
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("dashboard-meals")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "meal_logs",
        filter: `user_id=eq.${user.id}`,
      }, () => { fetchMeals(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const objetivo = profile?.objetivo_principal || "saude_geral";
  const weightKg = profile?.weight_kg || 70;
  const baseKcal = profile?.vet_kcal || 2000;
  const baseProtein = profile?.protein_g || 150;
  const baseCarbs = profile?.carbs_g || 250;
  const baseFat = profile?.fat_g || 65;

  // NutriSync: adjust targets based on today's workout
  const todayWorkout = getTodayWorkout();
  const workoutAdj = useMemo(() => {
    const wType = (todayWorkout?.workout_type || "rest") as WorkoutType;
    return getWorkoutAdjustment(wType, weightKg);
  }, [todayWorkout, weightKg]);

  const kcalTarget = Math.round(baseKcal * workoutAdj.kcalMultiplier);
  const proteinTarget = Math.round(workoutAdj.proteinPerKg * weightKg);
  const carbsTarget = Math.round(baseCarbs * workoutAdj.carbsMultiplier);
  const fatTarget = Math.round(baseFat * workoutAdj.fatMultiplier);
  const kcalDiff = kcalTarget - baseKcal;

  const kcalPercent = (todayTotals.kcal / kcalTarget) * 100;
  const protPercent = Math.min((todayTotals.protein / proteinTarget) * 100, 100);
  const carbPercent = Math.min((todayTotals.carbs / carbsTarget) * 100, 100);
  const fatPercent = Math.min((todayTotals.fat / fatTarget) * 100, 100);

  // AI Score calculation
  const aiScore = useMemo(() => {
    if (todayMeals.length === 0) return 0;
    let score = 0;
    const calDiff = Math.abs(kcalPercent - 100);
    score += Math.max(0, 40 - calDiff * 0.8);
    score += Math.min(protPercent, 100) * 0.25;
    const mealTypes = new Set(todayMeals.map(m => m.meal_type));
    score += Math.min(mealTypes.size, 4) * 5;
    const macroBalance = (Math.min(protPercent, 100) + Math.min(carbPercent, 100) + Math.min(fatPercent, 100)) / 3;
    score += macroBalance * 0.15;
    return Math.round(Math.min(score, 100));
  }, [todayTotals, todayMeals, kcalPercent, protPercent, carbPercent, fatPercent]);

  const hour = new Date().getHours();
  const predictiveAlert = useMemo(() => {
    return getPredictiveAlert(objetivo, todayMeals, todayTotals, proteinTarget, kcalTarget, kcalPercent, hour);
  }, [todayMeals, todayTotals, hour, proteinTarget, kcalTarget, kcalPercent, objetivo]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isON = kcalPercent >= 70 && protPercent >= 60;

  const macros = [
    { label: "Proteína", value: todayTotals.protein, target: proteinTarget, unit: "g", percent: protPercent, colorFrom: "from-primary", colorTo: "to-gold-glow", icon: "💪" },
    { label: "Carboidrato", value: todayTotals.carbs, target: carbsTarget, unit: "g", percent: carbPercent, colorFrom: "from-accent", colorTo: "to-cyan-glow", icon: "⚡" },
    { label: "Gordura", value: todayTotals.fat, target: fatTarget, unit: "g", percent: fatPercent, colorFrom: "from-danger", colorTo: "to-destructive", icon: "🔥" },
  ];

  const mealTypeIcons: Record<string, string> = {
    cafe_da_manha: "☕", almoco: "🍽️", jantar: "🌙", lanche: "🥤", ceia: "🫖",
    breakfast: "☕", lunch: "🍽️", dinner: "🌙", snack: "🥤",
  };

  const moodData = MOODS.find(m => m.key === todayMood);
  const isChallengeMode = todayMood === "animado";
  const isSimplifiedMode = todayMood === "cansado";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Mood Check-in Modal */}
      <MoodCheckinModal
        userName={profile.full_name?.split(" ")[0] || "Piloto"}
        onMoodSelected={setTodayMood}
      />

      <ReengagementPopup hasMealsToday={todayMeals.length > 0} />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Trial Banner */}
        <TrialBanner trialEndsAt={trialEndsAt || null} plan={plan} />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{getHeaderSubtitle(objetivo)}</p>
            <h1 className="text-lg font-bold text-foreground">{profile.full_name || "Piloto"}</h1>
            <ObjectiveBadge objetivo={objetivo} />
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={isON ? { boxShadow: ["0 0 0px hsl(38 80% 52% / 0)", "0 0 12px hsl(38 80% 52% / 0.4)", "0 0 0px hsl(38 80% 52% / 0)"] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isON ? "border-primary/40 bg-primary/10" : "border-border bg-card"}`}
            >
              <div className={`w-2 h-2 rounded-full ${isON ? "bg-primary animate-pulse-gold" : "bg-muted-foreground"}`} />
              <span className={`text-xs font-mono font-bold ${isON ? "text-primary" : "text-muted-foreground"}`}>
                {isON ? "ON" : "OFF"}
              </span>
            </motion.div>
            <button onClick={signOut} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Infantil greeting */}
        {objetivo === "infantil" && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-pink-400/20 bg-pink-400/5 p-3 mb-4 text-center"
          >
            <p className="text-sm text-foreground">{getChildDashboardGreeting(profile.full_name?.split(" ")[0])}</p>
          </motion.div>
        )}

        {/* Mood-adaptive banner */}
        {todayMood && todayMood !== "normal" && moodData && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${moodData.color}`}
          >
            <span className="text-2xl">{moodData.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {isChallengeMode ? "🔥 Modo Desafio Ativado" : isSimplifiedMode ? "💤 Modo Simplificado" : "🧘 Modo Cuidado"}
              </p>
              <p className="text-xs text-foreground font-mono leading-relaxed truncate">
                {isSimplifiedMode ? "Só 3 refeições hoje. Sem pressão." : isChallengeMode ? "Bata todas as metas hoje!" : "Priorize alimentos anti-estresse."}
              </p>
            </div>
          </motion.div>
        )}

        {/* NutriSync workout banner */}
        {todayWorkout && todayWorkout.workout_type !== "rest" && (() => {
          const wInfo = WORKOUT_TYPES[todayWorkout.workout_type as WorkoutType];
          return (
            <motion.button
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate("/nutrisync")}
              className="w-full rounded-xl border border-primary/20 bg-primary/5 p-3 mb-4 flex items-center gap-3 text-left hover:border-primary/30 transition-all"
            >
              <span className="text-2xl">{wInfo?.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest">⚡ NutriSync Ativo</p>
                <p className="text-xs font-bold text-foreground truncate">{wInfo?.label}</p>
                {kcalDiff > 0 && (
                  <p className="text-[10px] font-mono text-primary">+{kcalDiff} kcal ajustado para hoje</p>
                )}
              </div>
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
            </motion.button>
          );
        })()}

        {/* Workout time alerts (pre/post) */}
        {todayWorkout && todayWorkout.workout_type !== "rest" && (
          <WorkoutAlerts
            workoutType={todayWorkout.workout_type as WorkoutType}
            workoutTime={todayWorkout.workout_time}
          />
        )}

        {/* NutriSync Comparison Card */}
        <NutriSyncComparisonCard
          baseKcal={baseKcal}
          baseCarbs={baseCarbs}
          baseFat={baseFat}
          weightKg={weightKg}
        />

        {/* Calorie ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <CalorieRing percent={kcalPercent} kcal={todayTotals.kcal} target={kcalTarget} objetivo={objetivo} />
        </motion.div>

        {/* Macro bars — upgraded */}
        <div className="space-y-2 mb-4">
          {macros.map((macro, i) => (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="rounded-xl border border-border bg-card/60 p-2.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <span className="text-sm">{macro.icon}</span>
                  <span className="font-bold text-foreground/80">{macro.label}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono text-foreground font-bold">{Math.round(macro.value)}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">/{macro.target}{macro.unit}</span>
                  {macro.percent >= 95 && (
                    <span className="text-[9px] font-mono text-primary ml-1">✓</span>
                  )}
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(macro.percent, 100)}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 1.1, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${macro.colorFrom} ${macro.colorTo} relative overflow-hidden`}
                >
                  {macro.percent >= 95 && (
                    <motion.div
                      className="absolute inset-y-0 w-6 bg-white/25 skew-x-12"
                      animate={{ x: ["-100%", "500%"] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 1 + i * 0.4, ease: "linear" }}
                    />
                  )}
                </motion.div>
                <div className="absolute right-0 top-0 bottom-0 w-px bg-foreground/15" />
              </div>
              <div className="mt-1 flex justify-end">
                <span className={`text-[9px] font-mono ${macro.percent >= 90 ? "text-primary" : "text-muted-foreground/40"}`}>
                  {Math.round(macro.percent)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row: Score, Streak, Hydration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          <ScoreGauge score={aiScore} />
          <StreakFire days={profile.streak_days || 0} />
          <HydrationWidget glasses={waterGlasses} target={8} />
        </motion.div>

        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-4"
        >
          <XPBar xp={profile.xp || 0} level={profile.level || 1} />
        </motion.div>

        {/* Gamification, Missions & Micronutrients */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.82 }}
          className="mb-4"
        >
          <DashboardGamificationCards />
        </motion.div>

        {/* Hydration quick actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mb-4 space-y-2"
        >
          <button
            onClick={() => addWater(250)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-accent/30 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Plus className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm font-mono text-foreground">+ 1 copo de água (250ml)</span>
            <span className="ml-auto text-xs font-mono text-muted-foreground">{waterMl}ml</span>
          </button>
          <button
            onClick={() => navigate("/hydration")}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Droplets className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-mono text-foreground">Controle de Hidratação</p>
              <p className="text-[9px] font-mono text-muted-foreground">Acompanhe sua meta diária de água</p>
            </div>
           <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/meal-plan")}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Apple className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-mono text-foreground">Plano Alimentar</p>
              <p className="text-[9px] font-mono text-muted-foreground">Cardápio semanal e lista de compras</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* R$97 Exclusive: Consistency Score */}
        {isOnPlus && <ConsistencyScoreCard />}

        {/* R$97 Exclusive: Quick Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.86 }}
          className="grid grid-cols-2 gap-2 mb-4"
        >
          <button
            onClick={() => isOnPlus ? navigate("/event-mode") : setUpgradeModal({ open: true, feature: "Modo Evento" })}
            className="flex items-center gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5 hover:border-primary/40 transition-all group relative"
          >
            {!isOnPlus && <Lock className="w-3.5 h-3.5 text-muted-foreground absolute top-2 right-2" />}
            <CalendarDays className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-xs font-mono text-foreground font-bold">📅 Tenho um evento</p>
              <p className="text-[9px] font-mono text-muted-foreground">Estratégia automática</p>
            </div>
          </button>
          <button
            onClick={() => isOnPlus ? navigate("/food-simulator") : setUpgradeModal({ open: true, feature: "Simulador 'E se eu comer?'" })}
            className="flex items-center gap-2 p-3 rounded-xl border border-accent/20 bg-accent/5 hover:border-accent/40 transition-all group relative"
          >
            {!isOnPlus && <Lock className="w-3.5 h-3.5 text-muted-foreground absolute top-2 right-2" />}
            <HelpingHand className="w-5 h-5 text-accent" />
            <div className="text-left">
              <p className="text-xs font-mono text-foreground font-bold">🤔 E se eu comer...?</p>
              <p className="text-[9px] font-mono text-muted-foreground">Simule antes</p>
            </div>
          </button>
        </motion.div>

        {/* Upgrade Modal */}
        <UpgradeModal
          open={upgradeModal.open}
          onClose={() => setUpgradeModal({ open: false, feature: "" })}
          fromPlan={plan === "free" ? "ON" : plan}
          lockedFeature={upgradeModal.feature}
        />

        {/* Weekly Sabotage Diagnosis */}
        <WeeklySabotageCard />

        {/* Proactive Recipe Suggestion */}
        <ProactiveRecipeSuggestion
          proteinConsumed={todayTotals.protein}
          proteinTarget={proteinTarget}
          kcalConsumed={todayTotals.kcal}
          kcalTarget={kcalTarget}
        />

        {/* Smart Proactive Alerts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.88 }}
        >
          <SmartAlerts />
        </motion.div>

        {/* Predictive AI Alert */}
        {predictiveAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Alerta IA</p>
                <p className="text-sm text-foreground leading-relaxed">{predictiveAlert}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Today's meals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground font-display">Refeições de hoje</h3>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/meal-history")} className="text-xs font-mono text-muted-foreground flex items-center gap-1 hover:text-foreground">
                Histórico
              </button>
              <button onClick={() => navigate("/meal-log")} className="text-xs font-mono text-primary flex items-center gap-1">
                Registrar <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          {todayMeals.length === 0 ? (
            <button
              onClick={() => navigate("/meal-log")}
              className="w-full rounded-xl border border-dashed border-border bg-card/30 p-8 text-center hover:border-primary/30 transition-colors group"
            >
              <Utensils className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
              <p className="text-sm text-muted-foreground">Nenhuma refeição registrada</p>
              <p className="text-xs text-primary font-mono mt-1">Toque para registrar</p>
            </button>
          ) : (
            <div className="space-y-2">
              {todayMeals.map((meal, i) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-3 flex items-center gap-3"
                >
                  <span className="text-xl">{mealTypeIcons[meal.meal_type] || "🍽️"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground capitalize truncate">
                      {meal.meal_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {Math.round(meal.total_kcal || 0)} kcal · {Math.round(meal.total_protein || 0)}g P · {Math.round(meal.total_carbs || 0)}g C · {Math.round(meal.total_fat || 0)}g G
                    </p>
                  </div>
                  {meal.confirmed && <span className="text-primary text-xs font-mono">✓</span>}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* All Functions Grid — Landing-style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-4 h-px bg-primary" />
            <h3 className="text-[10px] font-mono text-primary uppercase tracking-[.2em]">Todas as funções</h3>
          </div>
          <div className="grid grid-cols-3 gap-px bg-[#14142a] rounded-2xl overflow-hidden">
            {(() => {
              const GATED_PATHS = ["/event-mode", "/food-simulator", "/monthly-report"];
              const GATE_LABELS: Record<string, string> = {
                "/event-mode": "Modo Evento",
                "/food-simulator": "Simulador 'E se eu comer?'",
                "/monthly-report": "Relatório Mensal",
              };
              const items = [
                { icon: Utensils, label: "Registrar", desc: "Log de refeições", path: "/meal-log", emoji: "🍽️" },
                { icon: History, label: "Histórico", desc: "Refeições passadas", path: "/meal-history", emoji: "📋" },
                { icon: Apple, label: "Plano Alimentar", desc: "Cardápio semanal IA", path: "/meal-plan", emoji: "🍎" },
                { icon: ShoppingCart, label: "Lista de Compras", desc: "Custo + itens automáticos", path: "/shopping-list", emoji: "🛒" },
                { icon: Apple, label: "Receitas", desc: "Filtradas por macros do dia", path: "/recipes", emoji: "🍳" },
                { icon: CalendarDays, label: "Modo Evento", desc: "Estratégia pré/durante/pós", path: "/event-mode", emoji: "📅" },
                { icon: HelpingHand, label: "Simulador", desc: "E se eu comer...?", path: "/food-simulator", emoji: "🤔" },
                { icon: BarChart, label: "Relatório Mensal", desc: "Padrão alimentar do mês", path: "/monthly-report", emoji: "📊" },
                { icon: MessageSquare, label: "Coach IA", desc: "Chat nutricional inteligente", path: "/chat", emoji: "🤖" },
                { icon: Droplets, label: "Hidratação", desc: "Controle de água diário", path: "/hydration", emoji: "💧" },
                { icon: TrendingUp, label: "Progresso", desc: "Gráficos de evolução", path: "/progress", emoji: "📈" },
                { icon: Camera, label: "Diário Fotográfico", desc: "Slider antes × depois", path: "/transformation", emoji: "📸" },
                { icon: Leaf, label: "Micronutrientes", desc: "Vitaminas & minerais", path: "/micronutrients", emoji: "🥬" },
                { icon: Trophy, label: "Conquistas", desc: "XP, badges & ranking", path: "/gamification", emoji: "🎮" },
                { icon: Hammer, label: "Montar Dieta", desc: "Construtor alimento a alimento", path: "/diet-builder", emoji: "🔨" },
                { icon: Clock, label: "Cronobiologia", desc: "Janelas de macros por horário", path: "/chronobiology", emoji: "🕐" },
                { icon: Sun, label: "Nutrição Circadiana", desc: "Plano por relógio biológico", path: "/circadian", emoji: "🌅" },
                { icon: Smile, label: "Comportamental", desc: "Mindful eating & TCC", path: "/behavioral-nutrition", emoji: "🧠" },
                { icon: Pill, label: "Suplementos", desc: "Stack personalizado IA", path: "/supplementation", emoji: "💊" },
                { icon: Bug, label: "Microbioma", desc: "Saúde intestinal & Bristol", path: "/microbiome", emoji: "🦠" },
                { icon: FileText, label: "Exames de Sangue", desc: "IA interpreta seus exames", path: "/blood-test", emoji: "🩸" },
                { icon: Users, label: "Família", desc: "Perfis de filhos & idosos", path: "/family", emoji: "👨‍👩‍👧" },
                { icon: Dumbbell, label: "Wearables", desc: "Passos, sono & atividade", path: "/wearables", emoji: "⌚" },
                { icon: User, label: "Perfil", desc: "Seus dados & metas", path: "/profile", emoji: "👤" },
                { icon: Settings, label: "Configurações", desc: "Recalcular VET & macros", path: "/settings", emoji: "⚙️" },
                { icon: Heart, label: "Profissional", desc: "Painel B2B completo", path: "/professional", emoji: "🩺" },
                { icon: Pill, label: "Protocolo GLP-1", desc: "Proteção muscular com caneta", path: "/glp1", emoji: "💉" },
                { icon: Zap, label: "NutriSync", desc: "Treino + nutrição em tempo real", path: "/nutrisync", emoji: "⚡" },
                { icon: Dumbbell, label: "Histórico Treinos", desc: "Consistência & calorias ajustadas", path: "/workout-history", emoji: "🏋️" },
                { icon: Zap, label: "Performance Pro", desc: "Nutrição para atletas avançados", path: "/performance-pro", emoji: "⚡" },
                { icon: Zap, label: "Desempenho Mental", desc: "Nootrópicos, energia & foco", path: "/mental-performance", emoji: "🧠" },
              ];
              return items.map((item, i) => {
                const isLocked = GATED_PATHS.includes(item.path) && !isOnPlus;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.12 + i * 0.02 }}
                    onClick={() => isLocked ? setUpgradeModal({ open: true, feature: GATE_LABELS[item.path] }) : navigate(item.path)}
                    className="bg-[hsl(var(--card))] p-4 text-left transition-colors hover:bg-primary/[.03] relative overflow-hidden group"
                  >
                    {isLocked && <Lock className="w-3 h-3 text-muted-foreground absolute top-2 right-2" />}
                    <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />
                    <div className="font-heading text-[2rem] text-border/40 leading-none mb-1 font-bold">{String(i + 1).padStart(2, "0")}</div>
                    <div className="text-lg mb-1">{item.emoji}</div>
                    <div className="text-[11px] font-bold text-foreground tracking-wide leading-tight mb-0.5">{item.label}</div>
                    <p className="text-[9px] text-muted-foreground leading-snug">{item.desc}</p>
                  </motion.button>
                );
              });
            })()}
          </div>
        </motion.div>

        {/* Protocol info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="rounded-xl border border-border bg-card/50 p-3 mb-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Protocolo ativo</span>
          </div>
          <p className="text-xs font-mono text-foreground">
            {kcalTarget} kcal · {proteinTarget}g P · {carbsTarget}g C · {fatTarget}g G
          </p>
          {kcalDiff > 0 && (
            <p className="text-[10px] font-mono text-primary mt-0.5">⚡ NutriSync: +{kcalDiff} kcal ajustado</p>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DashboardPage;
