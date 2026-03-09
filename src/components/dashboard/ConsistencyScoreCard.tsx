import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ConsistencyScore {
  id: string;
  total_score: number;
  adherence_score: number;
  quality_score: number;
  recovery_score: number;
  progress_score: number;
  percentile: number;
  positive_factor: string | null;
  improvement_tip: string | null;
  week_start: string;
}

const TIERS = [
  { min: 0, max: 40, emoji: "🌱", label: "Iniciando", desc: "cada registro conta" },
  { min: 41, max: 60, emoji: "🔥", label: "Construindo", desc: "você está criando o hábito" },
  { min: 61, max: 75, emoji: "⚡", label: "Consistente", desc: "esse é o ritmo do resultado" },
  { min: 76, max: 90, emoji: "🎯", label: "Máquina", desc: "você está no nível dos que chegam" },
  { min: 91, max: 100, emoji: "🏆", label: "Lenda", desc: "top 5% dos usuários nutriON" },
];

const getTier = (score: number) => TIERS.find(t => score >= t.min && score <= t.max) || TIERS[0];

const ConsistencyScoreCard = () => {
  const { user } = useAuth();
  const [current, setCurrent] = useState<ConsistencyScore | null>(null);
  const [previous, setPrevious] = useState<ConsistencyScore | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("consistency_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(2)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCurrent(data[0] as unknown as ConsistencyScore);
          if (data.length > 1) setPrevious(data[1] as unknown as ConsistencyScore);
        }
      });
  }, [user]);

  if (!current) return null;

  const tier = getTier(current.total_score);
  const diff = previous ? current.total_score - previous.total_score : 0;
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor = diff > 0 ? "text-primary" : diff < 0 ? "text-destructive" : "text-muted-foreground";

  const criteria = [
    { label: "Adesão", score: current.adherence_score, max: 40, emoji: "✅" },
    { label: "Qualidade", score: current.quality_score, max: 20, emoji: "✅" },
    { label: "Recuperação", score: current.recovery_score, max: 20, emoji: "✅" },
    { label: "Progresso", score: current.progress_score, max: 20, emoji: "✅" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-card p-4 mb-4"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span className="text-xs font-mono text-primary uppercase tracking-wider">Score de Consistência</span>
          </div>
          <div className="flex items-center gap-2">
            {previous && (
              <div className={`flex items-center gap-0.5 text-[10px] font-mono ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                {diff > 0 ? "+" : ""}{diff}
              </div>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Score display */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - current.total_score / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono text-foreground">{current.total_score}</span>
              <span className="text-[8px] font-mono text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg">{tier.emoji}</span>
              <span className="text-sm font-bold text-foreground">{tier.label}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{tier.desc}</p>
            {current.percentile > 0 && (
              <p className="text-[10px] text-primary font-mono mt-1">
                Melhor que {current.percentile}% dos usuários com o mesmo objetivo
              </p>
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Detalhamento</p>
              {criteria.map(c => (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-foreground">{c.emoji} {c.label}</span>
                    <span className="text-xs font-mono text-primary font-bold">{c.score}/{c.max} pts</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.score / c.max) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}

              {current.positive_factor && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mt-3">
                  <p className="text-[10px] font-mono text-primary mb-1">O que mais impactou seu score:</p>
                  <p className="text-xs text-foreground">→ {current.positive_factor}</p>
                </div>
              )}
              {current.improvement_tip && (
                <div className="rounded-lg bg-accent/5 border border-accent/10 p-3">
                  <p className="text-[10px] font-mono text-accent mb-1">Ponto de melhora:</p>
                  <p className="text-xs text-foreground">→ {current.improvement_tip}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConsistencyScoreCard;
