import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface MonthlyReport {
  id: string;
  report_month: string;
  total_meals_logged: number;
  avg_consistency_score: number;
  best_week: number;
  best_week_score: number;
  top_foods: Array<{ name: string; count: number }>;
  pattern_analysis: { best_time?: string; worst_time?: string; best_day?: string; worst_day?: string; analysis?: string };
  macro_averages: { protein_avg?: number; carbs_avg?: number; fat_avg?: number; kcal_avg?: number; protein_target?: number; carbs_target?: number; fat_target?: number; kcal_target?: number; most_consistent?: string; most_neglected?: string };
  previous_comparison: { score_diff?: number; protein_diff?: number; adherence_diff?: number; weight_diff?: number };
  projection: { projected_weight?: number; weeks_to_goal?: number; tip?: string };
  focus_next_month: string[];
  ai_message: string | null;
  weight_start: number | null;
  weight_end: number | null;
  protein_days_hit: number;
}

const MonthlyReportPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("monthly_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("report_month", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setReport(data[0] as unknown as MonthlyReport);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">📊 Relatório Mensal</h1>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <span className="text-4xl mb-4 block">📊</span>
            <p className="text-sm text-foreground font-mono">Seu primeiro relatório será gerado no dia 1º do próximo mês.</p>
            <p className="text-xs text-muted-foreground font-mono mt-2">Continue registrando suas refeições!</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const monthName = new Date(report.report_month + "T12:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const topFoods = (report.top_foods || []) as Array<{ name: string; count: number }>;
  const pattern = (report.pattern_analysis || {}) as MonthlyReport["pattern_analysis"];
  const macros = (report.macro_averages || {}) as MonthlyReport["macro_averages"];
  const comparison = (report.previous_comparison || {}) as MonthlyReport["previous_comparison"];
  const proj = (report.projection || {}) as MonthlyReport["projection"];
  const focuses = (report.focus_next_month || []) as string[];

  const DiffBadge = ({ value, suffix = "" }: { value?: number; suffix?: string }) => {
    if (!value) return null;
    const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
    const color = value > 0 ? "text-primary" : value < 0 ? "text-destructive" : "text-muted-foreground";
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${color}`}>
        <Icon className="w-3 h-3" />{value > 0 ? "+" : ""}{value}{suffix}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">📊 Relatório Mensal</h1>
            <p className="text-[10px] font-mono text-muted-foreground capitalize">{monthName}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Conquistas */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-3">🏆 Conquistas do Mês</h3>
            <div className="space-y-2 text-xs font-mono text-foreground">
              <p>→ {report.total_meals_logged} refeições registradas</p>
              <p>→ Score médio de consistência: {report.avg_consistency_score}/100</p>
              <p>→ Melhor semana: semana {report.best_week} com score {report.best_week_score}</p>
              <p>→ Bateu proteína em {report.protein_days_hit} dos 30 dias</p>
              {report.weight_start && report.weight_end && (
                <p>→ Peso: {report.weight_start}kg → {report.weight_end}kg ({((report.weight_end - report.weight_start) > 0 ? "+" : "")}{(report.weight_end - report.weight_start).toFixed(1)}kg)</p>
              )}
            </div>
          </motion.div>

          {/* Top 5 foods */}
          {topFoods.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-3">🍽️ 5 Alimentos Mais Consumidos</h3>
              <div className="space-y-1.5">
                {topFoods.slice(0, 5).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground">{i + 1}. {f.name}</span>
                    <span className="text-muted-foreground">{f.count}x no mês</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Padrão de horários */}
          {pattern.best_time && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-3">⏰ Seu Padrão de Horários</h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div><span className="text-muted-foreground">Maior adesão:</span><p className="text-foreground">{pattern.best_time}</p></div>
                <div><span className="text-muted-foreground">Maior dificuldade:</span><p className="text-foreground">{pattern.worst_time}</p></div>
                <div><span className="text-muted-foreground">Dia mais consistente:</span><p className="text-foreground">{pattern.best_day}</p></div>
                <div><span className="text-muted-foreground">Dia mais difícil:</span><p className="text-foreground">{pattern.worst_day}</p></div>
              </div>
              {pattern.analysis && <p className="text-xs text-muted-foreground font-mono mt-3 leading-relaxed">{pattern.analysis}</p>}
            </motion.div>
          )}

          {/* Macros médios */}
          {macros.kcal_avg && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-3">📊 Macros — Média Mensal</h3>
              <div className="space-y-2">
                {[
                  { emoji: "💪", label: "Proteína", avg: macros.protein_avg, target: macros.protein_target, unit: "g" },
                  { emoji: "🍞", label: "Carboidrato", avg: macros.carbs_avg, target: macros.carbs_target, unit: "g" },
                  { emoji: "🫙", label: "Gordura", avg: macros.fat_avg, target: macros.fat_target, unit: "g" },
                  { emoji: "🔥", label: "Calorias", avg: macros.kcal_avg, target: macros.kcal_target, unit: "kcal" },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground">{m.emoji} {m.label}</span>
                    <span className="text-foreground">
                      {Math.round(m.avg || 0)}{m.unit} <span className="text-muted-foreground">(meta: {Math.round(m.target || 0)}{m.unit})</span>
                    </span>
                  </div>
                ))}
                {macros.most_consistent && <p className="text-[10px] text-primary font-mono mt-2">Mais consistente: {macros.most_consistent}</p>}
                {macros.most_neglected && <p className="text-[10px] text-accent font-mono">Mais negligenciado: {macros.most_neglected}</p>}
              </div>
            </motion.div>
          )}

          {/* Comparativo */}
          {comparison.score_diff !== undefined && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-3">📈 Comparativo — Mês Anterior</h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-foreground">Score:</span>
                  <DiffBadge value={comparison.score_diff} suffix=" pts" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">Proteína:</span>
                  <DiffBadge value={comparison.protein_diff} suffix="g" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">Adesão:</span>
                  <DiffBadge value={comparison.adherence_diff} suffix="%" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">Peso:</span>
                  <DiffBadge value={comparison.weight_diff} suffix="kg" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Projeção */}
          {proj.projected_weight && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <h3 className="text-xs font-mono text-accent uppercase tracking-wider mb-3">🎯 Projeção — Próximos 30 Dias</h3>
              <div className="space-y-1.5 text-xs font-mono text-foreground">
                <p>→ Peso projetado: {proj.projected_weight}kg</p>
                {proj.weeks_to_goal && <p>→ Previsão de meta: {proj.weeks_to_goal} semanas</p>}
                {proj.tip && <p>→ Para acelerar: {proj.tip}</p>}
              </div>
            </motion.div>
          )}

          {/* Foco do próximo mês */}
          {focuses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h3 className="text-xs font-mono text-primary uppercase tracking-wider mb-3">💡 Foco do Mês que Vem</h3>
              <div className="space-y-1.5 text-xs font-mono text-foreground">
                {focuses.map((f, i) => <p key={i}>{i + 1}. {f}</p>)}
              </div>
            </motion.div>
          )}

          {/* AI message */}
          {report.ai_message && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-mono text-foreground leading-relaxed italic">"{report.ai_message}"</p>
              <p className="text-[10px] font-mono text-primary mt-2 text-right">— Coach nutriON 🤖</p>
            </motion.div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default MonthlyReportPage;
