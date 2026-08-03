import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePartner } from "@/hooks/usePartner";
import { useCoachAccess } from "@/hooks/useCoachAccess";
import { supabase } from "@/integrations/supabase/client";
import { getLocalDateStr, getLocalDayBounds } from "@/lib/utils";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { usePlanGate } from "@/hooks/usePlanGate";
import { useWorkoutSchedule, getWorkoutAdjustment, combineAdjustments, WORKOUT_TYPES, type WorkoutType } from "@/hooks/useWorkoutSchedule";
import TrialBanner from "@/components/dashboard/TrialBanner";
import JarvisCanvas from "@/components/dashboard/JarvisCanvas";
import CockpitTopbar from "@/components/dashboard/CockpitTopbar";
import CockpitLeftRail from "@/components/dashboard/CockpitLeftRail";
import { resolveGoalObjetivo, computeAdjustedMacros } from "@/lib/goalMacros";
import { useNutritionPeriodization } from "@/hooks/useNutritionPeriodization";
import { applyPeriodization, computeFiberTarget } from "@/lib/nutritionPeriodization";
import CycleStatusCard from "@/components/nutrition/CycleStatusCard";
import DietBreakCard from "@/components/nutrition/DietBreakCard";
import MetabolicAdaptationCard from "@/components/nutrition/MetabolicAdaptationCard";
import CuttingMicronutrientsCard from "@/components/nutrition/CuttingMicronutrientsCard";
import DynamicHydrationCard from "@/components/nutrition/DynamicHydrationCard";
import PeriWorkoutTimingCard from "@/components/nutrition/PeriWorkoutTimingCard";
import CockpitRightRail from "@/components/dashboard/CockpitRightRail";
import CoachNotificationsCard from "@/components/dashboard/CoachNotificationsCard";
import MyProfessionalCard from "@/components/dashboard/MyProfessionalCard";
import AthleteCompetitionCard from "@/components/dashboard/AthleteCompetitionCard";
import CoachCompetitionShortcut from "@/components/dashboard/CoachCompetitionShortcut";
import ReengagementPopup from "@/components/dashboard/ReengagementPopup";
import UpgradeModal from "@/components/landing/UpgradeModal";
import DashboardGamificationCards from "@/components/dashboard/DashboardGamificationCards";
import NutriSyncComparisonCard from "@/components/dashboard/NutriSyncComparisonCard";
import WorkoutAlerts from "@/components/dashboard/WorkoutAlerts";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import ProactiveRecipeSuggestion from "@/components/dashboard/ProactiveRecipeSuggestion";
import WeeklySabotageCard from "@/components/dashboard/WeeklySabotageCard";
import WeightCheckInCard from "@/components/dashboard/WeightCheckInCard";
import ConsistencyScoreCard from "@/components/dashboard/ConsistencyScoreCard";
import MoodCheckinModal, { type MoodType, MOODS } from "@/components/dashboard/MoodCheckinModal";
import MuscleStateCard from "@/components/dashboard/MuscleStateCard";
import NutrientTimingCard from "@/components/dashboard/NutrientTimingCard";
import BiologicalAgeCard from "@/components/dashboard/BiologicalAgeCard";
import EmotionalWinRateCard from "@/components/dashboard/EmotionalWinRateCard";
import SosHungerInterceptor from "@/components/dashboard/SosHungerInterceptor";
import {
  ObjectiveBadge, getRingLabel, getScoreLabel,
  getPredictiveAlert, getHeaderSubtitle, getChildDashboardGreeting,
} from "@/components/dashboard/DashboardObjectiveAdapters";

import {
  Flame, TrendingUp, Droplets, Apple, BarChart3, MessageSquare,
  User, Plus, Utensils, LogOut, Zap, Brain, ChevronRight, Award,
  Camera, Users, Heart, Settings, HelpCircle, Leaf, Trophy, ShoppingCart, History, Dumbbell, FileText, Hammer,
  Clock, Pill, Bug, Smile, CalendarDays, HelpingHand, BarChart, Lock, Sun, AlertTriangle, Scale, Trash2, Bell, Sparkles
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

// SVG animated ring component — premium quad ring (kcal + 3 macros)
const CalorieRing = ({
  percent, kcal, target, objetivo,
  protPercent = 0, carbPercent = 0, fatPercent = 0,
}: {
  percent: number; kcal: number; target: number; objetivo?: string;
  protPercent?: number; carbPercent?: number; fatPercent?: number;
}) => {
  const radius = 90;
  const stroke = 10;
  const macroStroke = 5;
  // 3 macro tracks inside, evenly spaced
  const rProt = 74;
  const rCarb = 64;
  const rFat = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const arc = (r: number, p: number) => {
    const c = 2 * Math.PI * r;
    return { c, off: c - (Math.min(p, 100) / 100) * c };
  };
  const a1 = arc(rProt, protPercent);
  const a2 = arc(rCarb, carbPercent);
  const a3 = arc(rFat, fatPercent);
  const remaining = Math.max(target - kcal, 0);
  const isOver = percent > 100;
  const isOnTarget = percent >= 85 && percent <= 105;

  return (
    <div className="relative w-56 h-56 mx-auto">
      {/* Ambient glow */}
      {isOnTarget && (
        <motion.div
          className="absolute inset-4 rounded-full"
          animate={{ boxShadow: ["0 0 20px hsl(var(--primary) / 0.1)", "0 0 40px hsl(var(--primary) / 0.25)", "0 0 20px hsl(var(--primary) / 0.1)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
            <stop offset="100%" stopColor={isOver ? "hsl(345 82% 70%)" : "hsl(var(--accent))"} />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Tracks */}
        <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle cx="100" cy="100" r={rProt} fill="none" stroke="hsl(var(--border))" strokeWidth={macroStroke} opacity={0.35} />
        <circle cx="100" cy="100" r={rCarb} fill="none" stroke="hsl(var(--border))" strokeWidth={macroStroke} opacity={0.35} />
        <circle cx="100" cy="100" r={rFat} fill="none" stroke="hsl(var(--border))" strokeWidth={macroStroke} opacity={0.35} />
        {/* Outer kcal ring */}
        <motion.circle
          cx="100" cy="100" r={radius} fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          filter="url(#ringGlow)"
        />
        {/* Protein — gold */}
        <motion.circle
          cx="100" cy="100" r={rProt} fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={macroStroke}
          strokeLinecap="round"
          strokeDasharray={a1.c}
          initial={{ strokeDashoffset: a1.c }}
          animate={{ strokeDashoffset: a1.off }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.5 }}
        />
        {/* Carbs — cyan */}
        <motion.circle
          cx="100" cy="100" r={rCarb} fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={macroStroke}
          strokeLinecap="round"
          strokeDasharray={a2.c}
          initial={{ strokeDashoffset: a2.c }}
          animate={{ strokeDashoffset: a2.off }}
          transition={{ duration: 1.7, ease: "easeOut", delay: 0.65 }}
        />
        {/* Fat — destructive */}
        <motion.circle
          cx="100" cy="100" r={rFat} fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth={macroStroke}
          strokeLinecap="round"
          strokeDasharray={a3.c}
          initial={{ strokeDashoffset: a3.c }}
          animate={{ strokeDashoffset: a3.off }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.8 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Percentage badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mb-1 ${
            isOver ? "bg-destructive/20 text-destructive" : isOnTarget ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
          }`}
        >
          {Math.round(percent)}%
        </motion.span>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-4xl font-bold font-mono text-foreground leading-none"
        >
          {Math.round(kcal).toLocaleString()}
        </motion.span>
        <span className="text-xs font-mono text-muted-foreground mt-1">de {target.toLocaleString()} kcal</span>
        <span className="text-[10px] font-mono text-primary mt-0.5">
          {getRingLabel(objetivo || "saude_geral", remaining, percent)}
        </span>
        {/* On-target pulse */}
        {isOnTarget && (
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-1 w-2 h-2 rounded-full bg-accent"
          />
        )}
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

// Score gauge — animated half-circle arc
const ScoreGauge = ({ score }: { score: number }) => {
  const color = score >= 80 ? "hsl(var(--primary))" : score >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  const textColor = score >= 80 ? "text-primary" : score >= 50 ? "text-accent" : "text-destructive";
  const label = score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : "Melhore";
  const radius = 30;
  const circumference = Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-card p-3 h-24 flex flex-col items-center justify-center">
      <div className="relative w-16 h-10">
        <svg viewBox="0 0 68 38" className="w-full h-full">
          <path d="M 4 34 A 30 30 0 0 1 64 34" fill="none" stroke="hsl(var(--border))" strokeWidth={5} strokeLinecap="round" />
          <motion.path
            d="M 4 34 A 30 30 0 0 1 64 34"
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center">
          <span className={`text-lg font-bold font-mono ${textColor}`}>{score}</span>
        </div>
      </div>
      <p className={`text-[9px] font-mono ${textColor} mt-0.5`}>{label}</p>
    </div>
  );
};

// Streak fire — with floating particles and glow
const StreakFire = ({ days }: { days: number }) => {
  const isWeek = days >= 7;
  return (
    <div className="rounded-xl border border-border bg-card p-3 h-24 flex flex-col items-center justify-center relative overflow-hidden">
      {days > 0 && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      )}
      {/* Floating particles */}
      {days > 0 && [0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          style={{ left: `${30 + i * 20}%` }}
          animate={{ y: [0, -30, -60], opacity: [0, 0.8, 0], x: [0, (i - 1) * 8] }}
          transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={days > 0 ? { scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={days > 0 ? { filter: "drop-shadow(0 0 6px hsl(38 80% 52% / 0.5))" } : {}}
        >
          <Flame className={`w-6 h-6 ${days > 0 ? "text-primary" : "text-muted-foreground"}`} />
        </motion.div>
        <span className="text-2xl font-bold font-mono text-foreground">{days}</span>
        <p className="text-[10px] font-mono text-muted-foreground">Streak</p>
        {isWeek && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[8px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mt-0.5"
          >
            🔥 semana!
          </motion.span>
        )}
      </div>
    </div>
  );
};

// XP bar — with milestones and shimmer
const XPBar = ({ xp, level }: { xp: number; level: number }) => {
  const LEVEL_NAMES = ["", "Iniciante", "Consistente", "Focado", "Disciplinado", "Forte", "Máquina", "Lenda", "Imortal"];
  const xpPerLevel = 500;
  const currentLevelXP = xp % xpPerLevel;
  const percent = (currentLevelXP / xpPerLevel) * 100;
  const xpToNext = xpPerLevel - currentLevelXP;
  const milestones = [25, 50, 75];

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-foreground font-bold">Lv.{level}</span>
          <span className="text-[10px] font-mono text-primary">{LEVEL_NAMES[Math.min(level, 8)]}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{xpToNext} XP para Lv.{level + 1}</span>
      </div>
      <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-gold-glow relative"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
        {/* Milestone markers */}
        {milestones.map(m => (
          <div
            key={m}
            className="absolute top-0 bottom-0 w-px bg-foreground/15"
            style={{ left: `${m}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] font-mono text-muted-foreground">{currentLevelXP} XP</span>
        <span className="text-[8px] font-mono text-muted-foreground">{xpPerLevel}</span>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const lastDateRef = useRef(getLocalDateStr());
  const activeDateRef = useRef(getLocalDateStr());
  const [todayTotals, setTodayTotals] = useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [todayMood, setTodayMood] = useState<MoodType | null>(null);
  const { todayLog: waterLog, addWater } = useWaterLogs();
  const { hasAccess, plan, isCoach } = usePlanGate();
  const { partner, isAdmin } = usePartner();
  const { hasAccess: hasCoachAccess } = useCoachAccess();
  const { getTodayWorkout, getTodayWorkouts, getNextRestDay, getWorkoutsForDay, todayLog: workoutLog } = useWorkoutSchedule();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: "" });
  const [protocolosInfo, setProtocolosInfo] = useState<{ total: number; unread: number; hasMealPlan: boolean }>({ total: 0, unread: 0, hasMealPlan: false });
  const waterMl = waterLog?.ml_total ?? 0;
  const waterGlasses = Math.round(waterMl / 250);
  const isOnPlus = hasAccess("ON +");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: envs } = await supabase
        .from("protocolo_envios")
        .select("id, tipo_conteudo")
        .eq("destinatario_id", user.id);
      const list = envs || [];
      const ids = list.map((e: any) => e.id);
      const hasMealPlan = list.some((e: any) =>
        Array.isArray(e.tipo_conteudo) && e.tipo_conteudo.includes("plano_alimentar")
      );
      if (!ids.length) return setProtocolosInfo({ total: 0, unread: 0, hasMealPlan: false });
      const { data: notifs } = await supabase
        .from("coach_notifications")
        .select("reference_id, read")
        .eq("recipient_user_id", user.id)
        .in("reference_id", ids);
      const readIds = new Set((notifs || []).filter((n: any) => n.read).map((n: any) => n.reference_id));
      const unread = ids.filter((id) => !readIds.has(id)).length;
      setProtocolosInfo({ total: ids.length, unread, hasMealPlan });
    })();
  }, [user]);

  useEffect(() => {
    if (!profile?.onboarding_completed && !loading) {
      navigate("/onboarding");
    }
  }, [profile, loading]);

  const syncActiveDate = useCallback(() => {
    const currentDate = getLocalDateStr();
    lastDateRef.current = currentDate;
    activeDateRef.current = currentDate;
    return currentDate;
  }, []);

  const fetchMealsRef = useRef<() => Promise<void>>();
  fetchMealsRef.current = async () => {
    if (!user) return;
    const requestDate = syncActiveDate();
    const { startIso, endIso } = getLocalDayBounds();
    const { data } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startIso)
      .lt("created_at", endIso)
      .order("created_at", { ascending: true });

    if (requestDate !== activeDateRef.current) return;

    const meals = (data ?? []).filter((meal) => meal.meal_date === requestDate || !meal.meal_date);
    setTodayMeals(meals);
    setTodayTotals({
      kcal: meals.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0),
      protein: meals.reduce((s, m) => s + (Number(m.total_protein) || 0), 0),
      carbs: meals.reduce((s, m) => s + (Number(m.total_carbs) || 0), 0),
      fat: meals.reduce((s, m) => s + (Number(m.total_fat) || 0), 0),
    });
  };

  const fetchMeals = () => fetchMealsRef.current?.();

  useEffect(() => {
    fetchMeals();

    // Auto-refresh at midnight when the date changes
    const checkDateChange = () => {
      const currentDate = getLocalDateStr();
      if (currentDate !== lastDateRef.current) {
        syncActiveDate();
        setTodayMood(null);
        setTodayMeals([]);
        setTodayTotals({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
        fetchMealsRef.current?.();
        return true;
      }
      return false;
    };
    const interval = setInterval(checkDateChange, 1000);

    // When phone/browser wakes from sleep, interval may be stale — check immediately
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const changed = checkDateChange();
        if (!changed) fetchMealsRef.current?.();
      }
    };
    const handleFocus = () => {
      const changed = checkDateChange();
      if (!changed) fetchMealsRef.current?.();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, syncActiveDate]);

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

  // Unify goal from both fields (objetivo_principal or goal)
  const rawGoal = profile?.objetivo_principal || profile?.goal || "saude_geral";
  const objetivo = rawGoal;
  const weightKg = profile?.weight_kg || 70;
  const heightCm = profile?.height_cm || 170;
  const sex = profile?.sex || "male";
  const activityLevel = profile?.activity_level || "moderate";
  const usesGlp1 = profile?.uses_glp1 || false;
  const dateOfBirth = profile?.date_of_birth;

  // Auto-calculate VET from profile if not set
  const autoCalc = useMemo(() => {
    const ACTIVITY_FACTORS: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, athlete: 1.9,
    };
    const age = dateOfBirth
      ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 30;
    const geb = sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    const factor = ACTIVITY_FACTORS[activityLevel] || 1.55;
    const get = geb * factor;

    // Determine goal phase adjustments
    let vet = get;
    let proteinPerKg = 1.6;
    const g = rawGoal;
    if (g === "lose_weight" || g === "emagrecimento" || g === "cutting") {
      vet = get - 500; proteinPerKg = 2.0;
    } else if (g === "gain_muscle" || g === "hipertrofia" || g === "bulking") {
      vet = get + 350; proteinPerKg = 2.2;
    } else if (g === "definition" || g === "definicao") {
      vet = get - 500; proteinPerKg = 2.2;
    } else if (g === "recomposition" || g === "recomposicao") {
      vet = get; proteinPerKg = 2.2;
    } else if (g === "performance") {
      vet = get + 250; proteinPerKg = 2.0;
    } else if (g === "longevity" || g === "longevidade") {
      vet = get - 100; proteinPerKg = 1.8;
    } else if (g === "glp1") {
      vet = get - 400; proteinPerKg = 2.2;
    }
    if (usesGlp1) proteinPerKg = Math.max(proteinPerKg, 2.0);

    const protein = Math.round(weightKg * proteinPerKg);
    const fat = Math.round((vet * 0.25) / 9);
    const carbs = Math.round(Math.max((vet - protein * 4 - fat * 9) / 4, 50));
    return { vet: Math.round(vet), protein, carbs, fat };
  }, [weightKg, heightCm, sex, activityLevel, rawGoal, usesGlp1, dateOfBirth]);

  // Use profile macros if set, otherwise auto-calculate
  const baseKcal = profile?.vet_kcal || autoCalc.vet;
  const baseProtein = profile?.protein_g || autoCalc.protein;
  const baseCarbs = profile?.carbs_g || autoCalc.carbs;
  const baseFat = profile?.fat_g || autoCalc.fat;

  // Goal-based phase multiplier (NutriSync overlay)
  const goalPhase = useMemo(() => {
    const g = rawGoal;
    if (g === "gain_muscle" || g === "hipertrofia" || g === "bulking") {
      return { label: "BULKING", emoji: "📈", multiplier: 1.0, proteinBoost: 1.0, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" };
    }
    if (g === "lose_weight" || g === "emagrecimento" || g === "cutting" || g === "definition" || g === "definicao") {
      return { label: "CUTTING", emoji: "🔥", multiplier: 1.0, proteinBoost: 1.0, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" };
    }
    if (g === "recomposition" || g === "recomposicao") {
      return { label: "RECOMPOSIÇÃO", emoji: "🔄", multiplier: 1.0, proteinBoost: 1.0, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" };
    }
    if (g === "performance") {
      return { label: "PERFORMANCE", emoji: "⚡", multiplier: 1.0, proteinBoost: 1.0, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" };
    }
    if (g === "longevity" || g === "longevidade") {
      return { label: "LONGEVIDADE", emoji: "🧬", multiplier: 1.0, proteinBoost: 1.0, color: "text-teal-400", bg: "bg-teal-400/10 border-teal-400/20" };
    }
    if (g === "glp1") {
      return { label: "GLP-1", emoji: "💉", multiplier: 1.0, proteinBoost: 1.0, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" };
    }
    return { label: "MANUTENÇÃO", emoji: "⚖️", multiplier: 1.0, proteinBoost: 1.0, color: "text-primary", bg: "bg-primary/10 border-primary/20" };
  }, [rawGoal]);

  // NutriSync: adjust targets based on ALL today's workouts (combined)
  const todayWorkout = getTodayWorkout();
  const todayAllWorkouts = getTodayWorkouts();
  const workoutAdj = useMemo(() => {
    if (todayAllWorkouts.length === 0) return getWorkoutAdjustment("rest" as WorkoutType, weightKg);
    return combineAdjustments(todayAllWorkouts, weightKg);
  }, [todayAllWorkouts, weightKg]);

  // Final targets = VET × fase do objetivo (mesma lógica do NutriSync) × ajuste do treino
  const goalObjetivo = useMemo(() => resolveGoalObjetivo(rawGoal), [rawGoal]);
  const adjustedTargets = useMemo(
    () =>
      computeAdjustedMacros({
        baseKcal,
        baseCarbs,
        baseFat,
        weightKg,
        objetivo: goalObjetivo,
        workout: workoutAdj,
      }),
    [baseKcal, baseCarbs, baseFat, weightKg, goalObjetivo, workoutAdj]
  );
  // Periodização nutricional (refeeds / diet break) — mesma fonte do NutriSync
  const periodization = useNutritionPeriodization();
  const periodized = useMemo(
    () =>
      applyPeriodization({
        macros: adjustedTargets,
        tdee: baseKcal,
        objetivo: goalObjetivo,
        cycle: periodization.cycleState,
        refeedTarget: periodization.config.cycle.refeed_target,
        dietBreakActive: periodization.dietBreakState.active,
      }),
    [adjustedTargets, baseKcal, goalObjetivo, periodization.cycleState, periodization.config.cycle.refeed_target, periodization.dietBreakState.active]
  );
  const kcalTarget = periodized.kcal;
  const proteinTarget = periodized.protein;
  const carbsTarget = periodized.carbs;
  const fatTarget = periodized.fat;
  const fiberTarget = computeFiberTarget(kcalTarget, profile?.sex);
  const isRefeedDay = periodized.mode === "refeed";
  const isDietBreak = periodized.mode === "diet_break";
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

  const PLAN_BADGE: Record<string, { label: string; color: string }> = {
    free: { label: "FREE", color: "text-muted-foreground bg-secondary" },
    ON: { label: "ON", color: "text-primary bg-primary/10" },
    "ON +": { label: "ON+", color: "text-accent bg-accent/10" },
    "ON PRO": { label: "PRO", color: "text-destructive bg-destructive/10" },
  };

  type GridItem = { label: string; desc: string; path: string; emoji: string; plan: "free" | "ON" | "ON +" | "ON PRO" };

  const gridItems: GridItem[] = [
    // Core
    { label: "Diários de Ergogênicos", desc: "Ciclos, check-ins e exames com IA", path: "/ergo-diary", emoji: "📋", plan: "ON +" },
    { label: "Registrar", desc: "Log de refeições · IA analisa foto", path: "/meal-log", emoji: "🍽️", plan: "free" },
    { label: "Histórico", desc: "Refeições passadas", path: "/meal-history", emoji: "📋", plan: "free" },
    { label: "Plano Alimentar", desc: "Cardápio semanal personalizado por IA", path: "/meal-plan", emoji: "🍎", plan: "ON" },
    
    { label: "Lista de Compras", desc: "Custo + itens automáticos", path: "/shopping-list", emoji: "🛒", plan: "ON" },
    { label: "Receitas", desc: "Filtradas por macros do dia", path: "/recipes", emoji: "🍳", plan: "ON" },
    { label: "Coach IA", desc: "Chat nutricional com contexto completo", path: "/chat", emoji: "🤖", plan: "ON" },
    { label: "Agentes IA", desc: "Agentes especializados de nutrição", path: "/chat", emoji: "🧬", plan: "ON" },
    // MCE
    { label: "MCE Adaptativo", desc: "Peso real + calibração TDEE", path: "/weight-adaptive", emoji: "⚖️", plan: "free" },
    // Acompanhamento
    { label: "Hidratação", desc: "Controle de água diário", path: "/hydration", emoji: "💧", plan: "free" },
    { label: "Progresso", desc: "Gráficos de evolução", path: "/progress", emoji: "📈", plan: "ON" },
    { label: "Diário Fotográfico", desc: "Slider antes × depois", path: "/transformation", emoji: "📸", plan: "ON" },
    { label: "Composição Corporal", desc: "Medidas & bioimpedância", path: "/body-composition", emoji: "💪", plan: "ON +" },
    { label: "Conquistas", desc: "Desafios & missões por IA", path: "/gamification", emoji: "🎮", plan: "ON" },
    // Nutrição Avançada
    { label: "Micronutrientes", desc: "Vitaminas & minerais", path: "/micronutrients", emoji: "🥬", plan: "ON" },
    { label: "Exames de Sangue", desc: "IA interpreta seus exames", path: "/blood-test", emoji: "🩸", plan: "ON +" },
    { label: "Suplementos", desc: "Stack personalizado por IA", path: "/supplementation", emoji: "💊", plan: "ON +" },
    { label: "Montar Dieta", desc: "Construtor alimento a alimento", path: "/diet-builder", emoji: "🔨", plan: "ON +" },
    // Protocolo & Treino
    { label: "NutriSync", desc: "Treino + nutrição em tempo real", path: "/nutrisync", emoji: "⚡", plan: "ON" },
    { label: "Histórico Treinos", desc: "Consistência & calorias ajustadas", path: "/workout-history", emoji: "🏋️", plan: "ON" },
    { label: "Protocolo Refeed", desc: "Refeed e diet break científicos", path: "/refeed-protocol", emoji: "🔄", plan: "ON +" },
    { label: "Nutrição Sport", desc: "Periodização nutricional para atletas", path: "/nutricao-sport", emoji: "🏅", plan: "ON +" },
    // Cronobiologia
    { label: "Nutrição Circadiana", desc: "Plano por relógio biológico", path: "/circadian", emoji: "🌅", plan: "ON +" },
    { label: "Cronobiologia", desc: "Janelas de macros por horário", path: "/chronobiology", emoji: "🕐", plan: "ON +" },
    // Comportamental
    { label: "Comportamental", desc: "Mindful eating & TCC", path: "/behavioral-nutrition", emoji: "🧠", plan: "ON +" },
    { label: "Scan Emocional", desc: "Diagnóstico comportamental profundo", path: "/emotional-scan", emoji: "🔬", plan: "ON +" },
    { label: "Mapa de Gatilhos", desc: "Identifica padrões de autossabotagem", path: "/behavioral-triggers", emoji: "🎯", plan: "ON +" },
    { label: "Preditor de Quebra", desc: "Score de risco em tempo real", path: "/diet-break-predictor", emoji: "🚨", plan: "ON +" },
    // Módulos especiais
    { label: "Refeição Snap", desc: "Análise instantânea por foto, áudio ou texto", path: "/refeicao-snap", emoji: "📸", plan: "ON" },
    { label: "Microbioma", desc: "Saúde intestinal & protocolo de fibras", path: "/microbiome", emoji: "🦠", plan: "ON +" },
    // ON+ Exclusivo
    { label: "Modo Evento", desc: "Estratégia pré/durante/pós evento", path: "/event-mode", emoji: "📅", plan: "ON +" },
    { label: "Simulador", desc: "E se eu comer...?", path: "/food-simulator", emoji: "🤔", plan: "ON +" },
    { label: "Relatório Mensal", desc: "Análise completa do mês com projeções", path: "/monthly-report", emoji: "📊", plan: "ON +" },
    { label: "Performance Pro", desc: "Protocolo de nutrição para atletas", path: "/performance-pro", emoji: "🏆", plan: "ON PRO" },
    { label: "Painel do Coach", desc: "Gerencie seus alunos e convites", path: "/coach-dashboard", emoji: "👨‍🏫", plan: "ON PRO" },
    { label: "Protocolo GLP-1", desc: "Otimização nutricional com agonistas", path: "/glp1", emoji: "💉", plan: "ON +" },
    // Sistema
    { label: "Wearables", desc: "Passos, sono & atividade", path: "/wearables", emoji: "⌚", plan: "ON +" },
    { label: "Perfil", desc: "Seus dados & metas", path: "/profile", emoji: "👤", plan: "free" },
    { label: "Configurações", desc: "Recalcular VET & macros", path: "/settings", emoji: "⚙️", plan: "free" },
    // Admin & Parceiro
    { label: "Painel Admin", desc: "Gerenciar parceiros e sistema", path: "/admin", emoji: "🛡️", plan: "free" },
    { label: "Painel Parceiro", desc: "Seus módulos e comissões", path: "/partner", emoji: "🤝", plan: "free" },
  ];

  const visibleGridItems = gridItems.filter((item) => {
    if (item.path === "/admin") return isAdmin;
    if (item.path === "/partner") return Boolean(partner);
    return true;
  });

  const macros = [
    { label: "Proteína", value: todayTotals.protein, target: proteinTarget, unit: "g", percent: protPercent, colorFrom: "from-primary", colorTo: "to-gold-glow", icon: "💪" },
    { label: "Carboidrato", value: todayTotals.carbs, target: carbsTarget, unit: "g", percent: carbPercent, colorFrom: "from-accent", colorTo: "to-cyan-glow", icon: "⚡" },
    { label: "Gordura", value: todayTotals.fat, target: fatTarget, unit: "g", percent: fatPercent, colorFrom: "from-danger", colorTo: "to-destructive", icon: "🔥" },
  ];

  const mealTypeIcons: Record<string, string> = {
    cafe_da_manha: "☕", almoco: "🍽️", jantar: "🌙", lanche: "🥤", ceia: "🫖",
    breakfast: "☕", morning_snack: "🍎", lunch: "🍽️", afternoon_snack: "🥤",
    pre_workout: "💪", post_workout: "🏋️", dinner: "🌙", supper: "🫖",
    snack: "🥜", extra: "➕",
  };

  const moodData = MOODS.find(m => m.key === todayMood);
  const isChallengeMode = todayMood === "animado";
  const isSimplifiedMode = todayMood === "cansado";

  const chronoAge = dateOfBirth
    ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 30;

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:cursor-crosshair" style={{ background: "#020205" }}>
      <JarvisCanvas />
      <CockpitTopbar phaseLabel={goalPhase.label} onSignOut={signOut} />

      {/* Mood Check-in Modal */}
      <MoodCheckinModal
        userName={profile.full_name?.split(" ")[0] || "Piloto"}
        onMoodSelected={setTodayMood}
      />

      <ReengagementPopup hasMealsToday={todayMeals.length > 0} />

      <div
        className="relative z-10 md:grid md:gap-px"
        style={{
          gridTemplateColumns: "200px 1fr 175px",
          background: "rgba(184,146,42,0.06)",
          minHeight: "calc(100vh - 48px)",
        }}
      >
        <CockpitLeftRail
          fullName={profile.full_name || "Piloto"}
          sport={profile.sport || undefined}
          phaseLabel={goalPhase.label}
          tdee={kcalTarget}
          protein={{ value: todayTotals.protein, target: proteinTarget }}
          carbs={{ value: todayTotals.carbs, target: carbsTarget }}
          fat={{ value: todayTotals.fat, target: fatTarget }}
          fiber={{ target: fiberTarget }}
          bodyComposition={{ weightKg, bodyFatPct: periodization.bodyFatPct }}
          streakDays={profile.streak_days || 0}
          level={profile.level || 1}
          xp={profile.xp || 0}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="md:overflow-y-auto scrollbar-none"
          style={{ background: "rgba(2,2,5,0.88)", maxHeight: "calc(100vh - 48px)" }}
        >
          <div className="max-w-lg mx-auto px-4 pt-4">
            <TrialBanner />
        <MyProfessionalCard />
        <CoachNotificationsCard />
        {hasCoachAccess && new Date().getDay() === 1 && (
          <button
            onClick={() => navigate("/weekly-checkin")}
            className="w-full mb-3 flex items-center gap-3 p-3 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/20 to-primary/5 hover:from-primary/30 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center shrink-0">
              <span className="text-lg">📋</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">Check-in da Semana</div>
              <div className="text-xs text-muted-foreground">Envie seu progresso para o coach responder</div>
            </div>
          </button>
        )}
        <AthleteCompetitionCard />
        <div className="mb-3"><CoachCompetitionShortcut /></div>
        {hasCoachAccess && protocolosInfo.total === 0 && (
          <button
            onClick={() => navigate("/meus-protocolos")}
            className="w-full mb-3 flex items-center gap-3 p-3 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Área Coach</p>
              <p className="text-xs text-muted-foreground">Acesse plano alimentar, treino e envios do seu coach</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </button>
        )}
        {protocolosInfo.total > 0 && (
          <button
            onClick={() => navigate("/meus-protocolos")}
            className="w-full mb-3 flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 transition-all text-left"
          >
            <div className="relative w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
              {protocolosInfo.unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {protocolosInfo.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Meus Protocolos</p>
              <p className="text-xs text-muted-foreground">
                {protocolosInfo.unread > 0
                  ? `${protocolosInfo.unread} novo${protocolosInfo.unread > 1 ? "s" : ""} do seu coach`
                  : `${protocolosInfo.total} protocolo${protocolosInfo.total > 1 ? "s" : ""} recebido${protocolosInfo.total > 1 ? "s" : ""}`}
              </p>
            </div>
          </button>
        )}
        {protocolosInfo.hasMealPlan && (
          <button
            onClick={() => navigate("/meus-protocolos")}
            className="w-full mb-3 flex items-center gap-3 p-3 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Plano Alimentar do Coach</p>
              <p className="text-xs text-muted-foreground">Toque para abrir e ver suas refeições</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </button>
        )}
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

        {/* Goal phase banner */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-3 mb-4 flex items-center justify-between ${goalPhase.bg}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goalPhase.emoji}</span>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Fase atual</p>
              <p className={`text-sm font-bold ${goalPhase.color}`}>{goalPhase.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{kcalTarget}</p>
            <p className="text-[10px] font-mono text-muted-foreground">kcal/dia</p>
            {kcalTarget !== baseKcal && (
              <p className="text-[9px] font-mono text-muted-foreground/60">TDEE base {baseKcal}</p>
            )}
          </div>
        </motion.div>

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
                {kcalDiff !== 0 && (
                  <p className={`text-[10px] font-mono ${kcalDiff > 0 ? "text-primary" : "text-destructive"}`}>
                    {kcalDiff > 0 ? "+" : ""}{kcalDiff} kcal ajustado para hoje
                  </p>
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
          todayWorkouts={getTodayWorkouts()}
          nextRestDow={getNextRestDay().dow}
          restDayWorkouts={getWorkoutsForDay(getNextRestDay().dow)}
        />

        {/* Calorie ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <CalorieRing percent={kcalPercent} kcal={todayTotals.kcal} target={kcalTarget} objetivo={objetivo} protPercent={protPercent} carbPercent={carbPercent} fatPercent={fatPercent} />
        </motion.div>

        {/* Macro bars — card wrapped with shimmer and % */}
        <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Macronutrientes</p>
          {macros.map((macro, i) => {
            const isNearTarget = macro.percent >= 95;
            return (
              <motion.div
                key={macro.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <span className="text-sm">{macro.icon}</span> {macro.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold ${
                      macro.percent >= 95 ? "text-primary" : macro.percent >= 70 ? "text-accent" : "text-muted-foreground"
                    }`}>
                      {Math.round(macro.percent)}%
                    </span>
                    <span className="text-xs font-mono text-foreground font-bold">
                      {Math.round(macro.value)}<span className="text-muted-foreground font-normal">/{macro.target}{macro.unit}</span>
                    </span>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(macro.percent, 100)}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${macro.colorFrom} ${macro.colorTo} relative overflow-hidden`}
                  >
                    {/* Shimmer when ≥95% */}
                    {isNearTarget && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.3, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                  <div className="absolute right-0 top-0 bottom-0 w-px bg-foreground/20" />
                </div>
              </motion.div>
            );
          })}
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

        {/* Aprenda — aulas interativas */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.87 }}
          onClick={() => navigate("/learn")}
          className="w-full mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 text-left transition-all hover:border-primary/40 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-xl group-hover:bg-primary/25 transition-colors">
            🎓
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Aprenda · Fisiologia do Treino</p>
            <p className="text-[11px] text-muted-foreground">4 cards interativos · conecte ciência ao seu treino</p>
          </div>
          <span className="rounded-full bg-primary/15 px-2 py-1 text-[9px] font-mono font-bold text-primary">+50 XP</span>
          <ChevronRight className="h-4 w-4 text-primary" />
        </motion.button>

        {/* VERA — Agente Feminino */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.875 }}
          onClick={() => navigate("/coach/vera")}
          className="w-full mb-4 flex items-center gap-3 rounded-xl p-4 text-left transition-all group"
          style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(167,139,250,0.03))", border: "1px solid rgba(167,139,250,0.25)" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(167,139,250,0.18)" }}>
            <Sparkles className="w-5 h-5" style={{ color: "#A78BFA" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#fff" }}>VERA · Agente Feminino</p>
            <p className="text-[11px] text-muted-foreground">Ciclo · ACO · EAA · biomecânica · adesão</p>
          </div>
          <span className="rounded-full px-2 py-1 text-[9px] font-mono font-bold" style={{ background: "rgba(167,139,250,0.18)", color: "#A78BFA" }}>FEMININO</span>
          <ChevronRight className="h-4 w-4" style={{ color: "#A78BFA" }} />
        </motion.button>



        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88 }}
          onClick={() => isOnPlus ? navigate("/ergo-diary") : setUpgradeModal({ open: true, feature: "Diários de Ergogênicos" })}
          className="w-full mb-4 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-left transition-all hover:border-accent/40 group relative"
        >
          {!isOnPlus && <Lock className="w-3.5 h-3.5 text-muted-foreground absolute top-2 right-2" />}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-xl group-hover:bg-accent/20 transition-colors">
            📋
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Diários de Ergogênicos</p>
            <p className="text-[11px] text-muted-foreground">Registrar ciclos, check-ins e análise de exames com IA</p>
          </div>
          <span className="rounded-full bg-accent/10 px-2 py-1 text-[9px] font-mono font-bold text-accent">ON+</span>
          <ChevronRight className="h-4 w-4 text-accent" />
        </motion.button>

        {(isAdmin || partner || isCoach) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-4 grid grid-cols-1 gap-2"
          >
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/15"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-xl">
                  🛡️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">Painel Admin</p>
                  <p className="text-[11px] text-muted-foreground">Gerenciar parceiros, acessos e sistema</p>
                </div>
                <ChevronRight className="h-4 w-4 text-primary" />
              </button>
            )}

            {isCoach && (
              <button
                onClick={() => navigate("/coach-dashboard")}
                className="w-full flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/15"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-xl">
                  🏋️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">Painel Coach</p>
                  <p className="text-[11px] text-muted-foreground">Gerenciar clientes e planos</p>
                </div>
                <ChevronRight className="h-4 w-4 text-primary" />
              </button>
            )}

            {partner && (
              <button
                onClick={() => navigate("/partner")}
                className="w-full flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-left transition-all hover:border-accent/50 hover:bg-accent/15"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-xl">
                  🤝
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">Painel Parceiro</p>
                  <p className="text-[11px] text-muted-foreground">Ver módulos liberados e comissões</p>
                </div>
                <ChevronRight className="h-4 w-4 text-accent" />
              </button>
            )}
          </motion.div>
        )}

        {/* Upgrade Modal */}
        <UpgradeModal
          open={upgradeModal.open}
          onClose={() => setUpgradeModal({ open: false, feature: "" })}
          fromPlan={plan === "free" ? "ON" : plan}
          lockedFeature={upgradeModal.feature}
        />

        {/* Weekly Sabotage Diagnosis */}
        <WeeklySabotageCard />

        {/* MCE Adaptativo — Peso real + calibração TDEE */}
        <WeightCheckInCard />

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
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { error } = await supabase.from("meal_logs").delete().eq("id", meal.id);
                      if (!error) {
                        toast.success("Refeição removida");
                        fetchMeals();
                      } else {
                        toast.error("Erro ao remover");
                      }
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                    title="Remover refeição"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Muscle State + Nutrient Timing + Biological Age + Win Rate Cards */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <MuscleStateCard />
          <NutrientTimingCard />
          <BiologicalAgeCard />
          <EmotionalWinRateCard />
        </div>


        {/* All Functions Grid — Landing-style with plan badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-px bg-primary" />
              <h3 className="text-[10px] font-mono text-primary uppercase tracking-[.2em]">Todas as funções</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground">
                {(() => {
                  const allItems = visibleGridItems;
                  const unlocked = allItems.filter(it => hasAccess(it.plan)).length;
                  return `${unlocked}/${allItems.length} ativas`;
                })()}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden bg-border/60">
            {visibleGridItems.map((item, i) => {
              const unlocked = hasAccess(item.plan);
              const planBadge = PLAN_BADGE[item.plan];
              return (
                <motion.button
                  key={item.path + item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.12 + i * 0.02 }}
                  onClick={() => unlocked ? navigate(item.path) : setUpgradeModal({ open: true, feature: item.label })}
                  className={`bg-[hsl(var(--card))] p-4 text-left transition-colors relative overflow-hidden group ${
                    unlocked ? "hover:bg-primary/[.03]" : "opacity-60"
                  }`}
                >
                  {/* Plan badge */}
                  <span className={`absolute top-1.5 right-1.5 text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full ${planBadge.color}`}>
                    {planBadge.label}
                  </span>

                  {!unlocked && <Lock className="w-3 h-3 text-muted-foreground absolute bottom-2 right-2" />}

                  {/* Hover bar */}
                  <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />

                  {/* Active pulse */}
                  {unlocked && (
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  )}

                  <div className="font-heading text-[2rem] text-border/40 leading-none mb-1 font-bold">{String(i + 1).padStart(2, "0")}</div>
                  <div className="text-lg mb-1">{item.emoji}</div>
                  <div className="text-[11px] font-bold text-foreground tracking-wide leading-tight mb-0.5">{item.label}</div>
                  <p className="text-[9px] text-muted-foreground leading-snug">{item.desc}</p>
                </motion.button>
              );
            })}
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
        </motion.div>

        <CockpitRightRail
          apexScore={aiScore}
          adherencePct={Math.round(((kcalPercent + protPercent + carbPercent + fatPercent) / 4) || 0)}
          proteinDaysHit={Math.min(profile.streak_days || 0, 7)}
          chronologicalAge={chronoAge}
          biologicalAge={Math.max(chronoAge - Math.round((aiScore - 50) / 10), 18)}
        />
      </div>

      <SosHungerInterceptor />
      <BottomNav />
    </div>
  );
};

export default DashboardPage;
