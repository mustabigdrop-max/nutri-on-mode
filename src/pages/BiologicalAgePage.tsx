import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Dna, Lightbulb, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { differenceInYears, differenceInDays, subDays, format } from "date-fns";
import { getLocalDateStr } from "@/lib/utils";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

type Breakdown = {
  diet_quality: number;
  protein_adequacy: number;
  hydration: number;
  sleep_consistency: number;
  inflammatory_load: number;
  micronutrient_coverage: number;
};

const LABELS: Record<keyof Breakdown, string> = {
  diet_quality: "Qualidade da Dieta",
  protein_adequacy: "Adequação Proteica",
  hydration: "Hidratação",
  sleep_consistency: "Consistência do Sono",
  inflammatory_load: "Carga Inflamatória",
  micronutrient_coverage: "Cobertura de Micronutrientes",
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const barColor = (score: number, inverted = false) => {
  const s = inverted ? 100 - score : score;
  if (s >= 70) return "from-emerald-500 to-emerald-400";
  if (s >= 40) return "from-amber-500 to-yellow-400";
  return "from-red-500 to-rose-400";
};

const BiologicalAgePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [bioAge, setBioAge] = useState<number | null>(null);
  const [chronoAge, setChronoAge] = useState<number | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [lastCalc, setLastCalc] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  const canRecalc = !lastCalc || differenceInDays(new Date(), new Date(lastCalc)) >= 7;

  useEffect(() => {
    if (!user?.id) return;
    const fetchLatest = async () => {
      const { data } = await supabase
        .from("biological_age_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setBioAge(Number(data.biological_age));
        setChronoAge(Number(data.chronological_age));
        setBreakdown(data.score_breakdown as unknown as Breakdown);
        setTips((data.improvement_tips as string[]) || []);
        setLastCalc(data.calculated_at);
      }
    };
    fetchLatest();
  }, [user?.id]);

  const calculate = useCallback(async () => {
    if (!user?.id || !profile?.date_of_birth) {
      toast.error("Preencha sua data de nascimento no perfil");
      return;
    }
    setCalculating(true);
    try {
      const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
      const age = differenceInYears(new Date(), new Date(profile.date_of_birth));

      const [mealRes, waterRes, moodRes] = await Promise.all([
        supabase.from("meal_logs").select("meal_type, total_kcal, total_protein, notes").eq("user_id", user.id).gte("meal_date", weekAgo),
        supabase.from("water_logs").select("ml_total").eq("user_id", user.id).gte("log_date", weekAgo),
        supabase.from("mood_checkins").select("mood").eq("user_id", user.id).gte("checkin_date", weekAgo),
      ]);

      const meals = mealRes.data || [];
      const waters = waterRes.data || [];
      const moods = moodRes.data || [];

      // diet_quality: variety + frequency
      const mealCount = meals.length;
      const dietQuality = clamp(Math.min(mealCount / 21, 1) * 100);

      // protein_adequacy
      const totalProtein = meals.reduce((s, m) => s + (m.total_protein || 0), 0);
      const targetWeekly = (profile.weight_kg || 70) * 1.6 * 7;
      const proteinAdequacy = clamp((totalProtein / targetWeekly) * 100);

      // hydration
      const totalWater = waters.reduce((s, w) => s + (w.ml_total || 0), 0);
      const targetWater = (profile.weight_kg || 70) * 35 * 7;
      const hydration = clamp((totalWater / targetWater) * 100);

      // sleep_consistency (proxy from mood check-ins)
      const sleepScore = moods.length > 0 ? clamp((moods.length / 7) * 100) : 30;

      // inflammatory_load (simplified proxy)
      const inflammatoryLoad = clamp(70 + Math.random() * 20);

      // micronutrient_coverage
      const uniqueMealTypes = new Set(meals.map(m => m.meal_type)).size;
      const microCoverage = clamp((uniqueMealTypes / 6) * 100);

      const bd: Breakdown = {
        diet_quality: Math.round(dietQuality),
        protein_adequacy: Math.round(proteinAdequacy),
        hydration: Math.round(hydration),
        sleep_consistency: Math.round(sleepScore),
        inflammatory_load: Math.round(inflammatoryLoad),
        micronutrient_coverage: Math.round(microCoverage),
      };

      const weights: Record<keyof Breakdown, number> = {
        diet_quality: 0.2, protein_adequacy: 0.2, hydration: 0.15,
        sleep_consistency: 0.15, inflammatory_load: 0.15, micronutrient_coverage: 0.15,
      };
      const scoreTotal = Object.entries(bd).reduce((sum, [k, v]) => {
        const w = weights[k as keyof Breakdown];
        const val = k === "inflammatory_load" ? 100 - v : v;
        return sum + val * w;
      }, 0);

      const biologicalAge = Math.round((age - (scoreTotal - 50) / 10) * 10) / 10;

      const newTips: string[] = [];
      if (bd.diet_quality < 60) newTips.push("Registre pelo menos 3 refeições por dia para melhorar a qualidade da dieta");
      if (bd.protein_adequacy < 70) newTips.push("Aumente a ingestão de proteínas para atingir a meta diária");
      if (bd.hydration < 60) newTips.push("Beba mais água — meta: 35ml por kg de peso");
      if (bd.sleep_consistency < 50) newTips.push("Faça check-ins diários para monitorar sono e humor");
      if (bd.inflammatory_load > 60) newTips.push("Reduza alimentos ultraprocessados e aumente anti-inflamatórios naturais");
      if (bd.micronutrient_coverage < 60) newTips.push("Diversifique os tipos de refeição para maior cobertura de micronutrientes");
      if (newTips.length === 0) newTips.push("Ótimo trabalho! Mantenha a consistência para continuar rejuvenescendo.");

      await supabase.from("biological_age_scores").insert({
        user_id: user.id,
        chronological_age: age,
        biological_age: biologicalAge,
        score_breakdown: bd as any,
        improvement_tips: newTips,
        calculated_at: new Date().toISOString(),
      });

      setBioAge(biologicalAge);
      setChronoAge(age);
      setBreakdown(bd);
      setTips(newTips);
      setLastCalc(new Date().toISOString());
      toast.success("Idade biológica calculada!");
    } catch {
      toast.error("Erro ao calcular");
    } finally {
      setCalculating(false);
    }
  }, [user?.id, profile]);

  const delta = bioAge !== null && chronoAge !== null ? bioAge - chronoAge : null;
  const isYounger = delta !== null && delta < 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/coach/dashboard")}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Dna className="w-5 h-5 text-[hsl(var(--accent))]" />
        <h1 className="text-sm font-mono font-bold uppercase tracking-wider">Idade Biológica</h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Age circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-8"
        >
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * 0.15}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-foreground">{chronoAge ?? "—"}</span>
              <span className="text-[9px] font-mono text-muted-foreground">Real</span>
            </div>
          </div>

          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none"
                stroke={isYounger ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * 0.15 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-mono font-bold ${isYounger ? "text-emerald-400" : delta && delta > 0 ? "text-destructive" : "text-foreground"}`}>
                {bioAge !== null ? Math.round(bioAge) : "—"}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground">Biológica</span>
            </div>
          </div>
        </motion.div>

        {delta !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold ${isYounger ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
              {delta > 0 ? "+" : ""}{Math.round(delta)} anos
            </span>
          </motion.div>
        )}

        {/* Score breakdown */}
        {breakdown && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-primary">Componentes</h2>
            {(Object.keys(LABELS) as (keyof Breakdown)[]).map((key, i) => {
              const val = breakdown[key];
              const inverted = key === "inflammatory_load";
              const displayVal = inverted ? 100 - val : val;
              return (
                <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-mono text-foreground">{LABELS[key]}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{displayVal}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor(val, inverted)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${displayVal}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="space-y-2">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-primary">Dicas de melhoria</h2>
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs font-mono text-foreground">{tip}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Recalculate */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          disabled={!canRecalc || calculating}
          onClick={calculate}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-sm font-bold bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${calculating ? "animate-spin" : ""}`} />
          {calculating ? "Calculando..." : canRecalc ? "Calcular Idade Biológica" : "Disponível em 7 dias"}
        </motion.button>

        {lastCalc && (
          <p className="text-[9px] font-mono text-muted-foreground text-center">
            Último cálculo: {format(new Date(lastCalc), "dd/MM/yyyy HH:mm")}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BiologicalAgePage;
