import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle, Lightbulb, ChevronDown, ChevronUp, X } from "lucide-react";

interface SabotageReport {
  id: string;
  week_start: string;
  week_end: string;
  total_meals_logged: number;
  meals_on_plan: number;
  meals_off_plan: number;
  worst_hour: string | null;
  worst_day: string | null;
  main_trigger: string | null;
  protein_days_hit: number;
  avg_kcal_deficit: number | null;
  weight_trend: string | null;
  projected_kg_30d: number | null;
  positive_highlights: string[];
  ai_suggestion: string | null;
  read: boolean;
}

// Animated arc component
const AdherenceArc = ({ percent }: { percent: number }) => {
  const radius = 36;
  const stroke = 6;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const color = percent >= 80 ? "hsl(var(--primary))" : percent >= 50 ? "hsl(var(--accent))" : "hsl(var(--destructive))";

  return (
    <div className="relative w-20 h-12 mx-auto">
      <svg viewBox="0 0 80 44" className="w-full h-full">
        <path
          d="M 4 40 A 36 36 0 0 1 76 40"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <motion.path
          d="M 4 40 A 36 36 0 0 1 76 40"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-0">
        <span className="text-sm font-bold font-mono text-foreground">{percent}%</span>
      </div>
    </div>
  );
};

// Mini bar chart for protein days
const ProteinBars = ({ hit, total }: { hit: number; total: number }) => (
  <div className="flex items-end gap-0.5 h-6 justify-center">
    {Array.from({ length: total }, (_, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: i < hit ? "100%" : "30%" }}
        transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
        className={`w-2 rounded-sm ${i < hit ? "bg-primary" : "bg-border"}`}
      />
    ))}
  </div>
);

const WeeklySabotageCard = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<SabotageReport | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchReport = async () => {
      const { data } = await supabase
        .from("weekly_sabotage_reports" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .single();
      if (data) setReport(data as any);
    };
    fetchReport();
  }, [user]);

  const markRead = async () => {
    if (!report || report.read) return;
    await supabase
      .from("weekly_sabotage_reports" as any)
      .update({ read: true } as any)
      .eq("id", report.id);
  };

  if (!report || dismissed) return null;

  const trendIcon = report.weight_trend === "descendo"
    ? <TrendingDown className="w-4 h-4 text-primary" />
    : report.weight_trend === "subindo"
      ? <TrendingUp className="w-4 h-4 text-destructive" />
      : <Minus className="w-4 h-4 text-muted-foreground" />;

  const adherence = report.total_meals_logged > 0
    ? Math.round((report.meals_on_plan / (report.meals_on_plan + report.meals_off_plan)) * 100)
    : 0;

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-accent/20 bg-accent/5 p-4 mb-4 relative"
    >
      <button
        onClick={() => { setDismissed(true); markRead(); }}
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono text-accent uppercase tracking-wider">Diagnóstico Semanal</p>
            {!report.read && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {formatDate(report.week_start)} — {formatDate(report.week_end)}
          </p>
        </div>
      </div>

      {/* Visual summary: Arc + Protein bars + Trend */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-card/60 border border-border p-2 text-center">
          <AdherenceArc percent={adherence} />
          <p className="text-[9px] font-mono text-muted-foreground mt-1">Adesão</p>
        </div>
        <div className="rounded-lg bg-card/60 border border-border p-2 text-center">
          <ProteinBars hit={report.protein_days_hit} total={7} />
          <p className="text-[9px] font-mono text-muted-foreground mt-1">Proteína {report.protein_days_hit}/7</p>
        </div>
        <div className="rounded-lg bg-card/60 border border-border p-2 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            {trendIcon}
            <span className="text-sm font-bold font-mono text-foreground capitalize">{report.weight_trend || "—"}</span>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground">Peso</p>
          {/* Inline 30-day projection */}
          {report.projected_kg_30d !== null && report.projected_kg_30d !== 0 && (
            <p className="text-[8px] font-mono text-primary mt-0.5">
              30d: {report.projected_kg_30d > 0 ? "+" : ""}{report.projected_kg_30d}kg
            </p>
          )}
        </div>
      </div>

      {/* Positive highlights */}
      <div className="mb-3">
        <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> O que foi bem
        </p>
        <ul className="space-y-1">
          {(report.positive_highlights || []).map((h, i) => (
            <li key={i} className="text-xs text-foreground font-mono flex items-start gap-1.5">
              <span className="text-primary mt-0.5">→</span> {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded) markRead(); }}
        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? "Menos detalhes" : "Ver diagnóstico completo"}
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {(report.worst_hour || report.worst_day || report.main_trigger) && (
              <div className="mb-3 pt-2 border-t border-border">
                <p className="text-[10px] font-mono text-destructive uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Padrão de sabotagem
                </p>
                <div className="space-y-1">
                  {report.meals_off_plan > 0 && (
                    <p className="text-xs text-foreground font-mono">
                      → Você saiu do plano <span className="text-destructive font-bold">{report.meals_off_plan}x</span> na semana
                    </p>
                  )}
                  {report.worst_hour && (
                    <p className="text-xs text-foreground font-mono">
                      → Horário crítico: <span className="text-destructive font-bold">depois das {report.worst_hour}</span>
                    </p>
                  )}
                  {report.worst_day && (
                    <p className="text-xs text-foreground font-mono">
                      → Dia mais difícil: <span className="text-destructive font-bold">{report.worst_day}</span>
                    </p>
                  )}
                  {report.main_trigger && (
                    <p className="text-xs text-foreground font-mono">
                      → Gatilho principal: <span className="text-accent font-bold">{report.main_trigger}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {report.avg_kcal_deficit !== null && (
              <div className="mb-3 pt-2 border-t border-border">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">📈 Projeção</p>
                <p className="text-xs text-foreground font-mono">
                  Déficit médio: <span className="font-bold">{Math.abs(report.avg_kcal_deficit)} kcal/dia</span>
                  {report.avg_kcal_deficit > 0 ? " (déficit)" : " (superávit)"}
                </p>
              </div>
            )}

            {report.ai_suggestion && (
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Ajuste da próxima semana
                </p>
                <p className="text-xs text-foreground font-mono leading-relaxed">{report.ai_suggestion}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeeklySabotageCard;
