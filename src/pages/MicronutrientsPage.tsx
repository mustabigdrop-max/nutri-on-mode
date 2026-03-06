import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Apple, TrendingUp, Award, Leaf } from "lucide-react";
import { useMicronutrients } from "@/hooks/useMicronutrients";
import NutrientGrid from "@/components/micronutrients/NutrientGrid";
import NutrientChart from "@/components/micronutrients/NutrientChart";
import DeficiencyAlerts from "@/components/micronutrients/DeficiencyAlerts";
import DiversityCard from "@/components/micronutrients/DiversityCard";

const MicronutrientsPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const { nutrients, dailyData, deficiencies, diversityCount, avgQualityScore, loading } = useMicronutrients(period);

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-foreground">Micronutrientes</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Qualidade nutricional profunda</p>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-4 space-y-4 max-w-lg mx-auto">
        {/* Period toggle */}
        <div className="flex gap-2">
          {(["week", "month"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                period === p ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {p === "week" ? "7 dias" : "30 dias"}
            </button>
          ))}
        </div>

        {/* Score + Diversity summary */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{avgQualityScore}</p>
            <p className="text-[10px] text-muted-foreground font-mono">Score Qualidade</p>
          </motion.div>
          <DiversityCard count={diversityCount} period={period} />
        </div>

        {/* Deficiency alerts */}
        {deficiencies.length > 0 && <DeficiencyAlerts deficiencies={deficiencies} />}

        {/* Nutrient grid */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5" /> Micronutrientes ({period === "week" ? "média/dia" : "média/dia"})
          </h2>
          <NutrientGrid nutrients={nutrients} loading={loading} />
        </div>

        {/* Evolution chart */}
        {dailyData.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Evolução
            </h2>
            <NutrientChart dailyData={dailyData} nutrients={nutrients} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MicronutrientsPage;
