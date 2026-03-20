import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Scale, TrendingDown, TrendingUp, Minus,
  CheckCircle, AlertTriangle, Zap, Info, Plus, Trash2,
  Activity, Target, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWeightLogs, type WeightTrend } from "@/hooks/useWeightLogs";
import { useProfile } from "@/hooks/useProfile";
import { useMealHistory } from "@/hooks/useMealHistory";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  WeightTrend["status"],
  { label: string; sublabel: string; color: string; icon: typeof CheckCircle; bg: string }
> = {
  on_track: {
    label: "Protocolo no alvo",
    sublabel: "Sua taxa de mudança está dentro da faixa ideal.",
    color: "#00f0b4",
    icon: CheckCircle,
    bg: "rgba(0,240,180,.07)",
  },
  too_fast: {
    label: "Rápido demais",
    sublabel: "Você está mudando mais rápido que o seguro. Risco de catabolismo.",
    color: "#e8a020",
    icon: AlertTriangle,
    bg: "rgba(232,160,32,.07)",
  },
  too_slow: {
    label: "Progresso abaixo do alvo",
    sublabel: "Mudança mais lenta que o planejado. O protocolo precisa de ajuste.",
    color: "#ff6644",
    icon: TrendingDown,
    bg: "rgba(255,102,68,.07)",
  },
  gaining_unexpected: {
    label: "Ganho inesperado",
    sublabel: "Você está ganhando peso no modo manutenção. Ajuste necessário.",
    color: "#ff6644",
    icon: AlertTriangle,
    bg: "rgba(255,102,68,.07)",
  },
  insufficient_data: {
    label: "Dados insuficientes",
    sublabel: "Registre peso por pelo menos 3 dias para ativar a calibração MCE.",
    color: "#7890ff",
    icon: Info,
    bg: "rgba(120,144,255,.07)",
  },
};

// ─── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, color, icon: Icon, delay = 0,
}: {
  label: string; value: string; sub: string; color: string; icon: typeof Scale; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="p-4 rounded-xl border"
      style={{ background: `${color}06`, borderColor: `${color}18` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color: `${color}80` }} />
        <span className="font-mono text-[.52rem] tracking-[.1em] uppercase" style={{ color: `${color}60` }}>
          {label}
        </span>
      </div>
      <div className="font-heading text-[1.5rem] leading-none mb-1" style={{ color }}>
        {value}
      </div>
      <div className="font-landing text-[.68rem] text-[hsl(var(--muted-foreground))]">{sub}</div>
    </motion.div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg border text-[.7rem]"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
      <p className="font-mono text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
      <p className="font-heading" style={{ color: "hsl(var(--primary))" }}>
        {payload[0].value} kg
      </p>
    </div>
  );
}

// ─── Add weight form ──────────────────────────────────────────────────────────
function AddWeightForm({ onAdd }: { onAdd: (kg: number, fat?: number) => Promise<void> }) {
  const [kg, setKg] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(kg.replace(",", "."));
    if (!val || val < 30 || val > 300) return toast.error("Peso inválido");
    const fatVal = fat ? parseFloat(fat.replace(",", ".")) : undefined;
    try {
      setLoading(true);
      await onAdd(val, fatVal);
      setKg(""); setFat("");
      toast.success("Peso registrado ✓ MCE recalibrado");
    } catch { toast.error("Erro ao salvar"); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-mono text-[.52rem] text-[hsl(var(--muted-foreground))] uppercase tracking-wider block mb-1.5">
            Peso (kg) *
          </label>
          <input
            type="number" step="0.1" placeholder="ex: 78.5"
            value={kg} onChange={e => setKg(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border bg-[hsl(var(--background))] text-[.85rem] font-mono focus:outline-none focus:border-primary transition-colors"
            style={{ borderColor: "hsl(var(--border))" }}
          />
        </div>
        <div>
          <label className="font-mono text-[.52rem] text-[hsl(var(--muted-foreground))] uppercase tracking-wider block mb-1.5">
            % Gordura (opcional)
          </label>
          <input
            type="number" step="0.1" placeholder="ex: 18.5"
            value={fat} onChange={e => setFat(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border bg-[hsl(var(--background))] text-[.85rem] font-mono focus:outline-none focus:border-primary transition-colors"
            style={{ borderColor: "hsl(var(--border))" }}
          />
        </div>
      </div>
      <button
        type="submit" disabled={loading || !kg}
        className="flex items-center justify-center gap-2 py-3 rounded-xl font-heading text-[.85rem] tracking-[.05em] transition-all disabled:opacity-40"
        style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
      >
        <Plus className="w-4 h-4" />
        {loading ? "Salvando..." : "Registrar peso de hoje"}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WeightAdaptivePage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { todayMeals } = useMealHistory?.() ?? { todayMeals: [] };

  // Target rate from profile: cut = -0.5, maintain = 0, bulk = +0.3
  const targetWeeklyRate = useMemo(() => {
    const obj = profile?.objetivo ?? "manter";
    if (obj === "perder" || obj === "emagrecer") return -0.5;
    if (obj === "ganhar" || obj === "hipertrofia") return 0.35;
    return 0;
  }, [profile?.objetivo]);

  // Average daily kcal from recent meals (last 7 days)
  const avgDailyKcal = useMemo(() => {
    if (!todayMeals?.length) return profile?.calorias_diarias ?? null;
    const total = todayMeals.reduce((sum: number, m: any) => sum + (m.calories ?? 0), 0);
    return total || profile?.calorias_diarias ?? null;
  }, [todayMeals, profile?.calorias_diarias]);

  const { logs, loading, addLog, deleteLog, latestWeight, totalDelta, trend } =
    useWeightLogs(avgDailyKcal, targetWeeklyRate);

  const statusCfg = STATUS_CONFIG[trend.status];

  // Chart data — last 30 logs chronologically
  const chartData = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
      .slice(-30)
      .map(l => ({
        date: format(parseISO(l.logged_at), "dd/MM", { locale: ptBR }),
        peso: l.weight_kg,
        gordura: l.body_fat_pct,
      }));
  }, [logs]);

  // Ideal weight trajectory line for chart
  const idealLine = useMemo(() => {
    if (!latestWeight || chartData.length < 2) return [];
    return chartData.map((d, i) => ({
      ...d,
      ideal: Math.round((latestWeight + (targetWeeklyRate / 7) * i) * 10) / 10,
    }));
  }, [chartData, latestWeight, targetWeeklyRate]);

  const hasEnoughData = trend.daysOfData >= 3;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3.5">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/[.05] transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-[.9rem] tracking-[.04em]">MCE ADAPTATIVO</h1>
            <p className="font-mono text-[.48rem] text-muted-foreground tracking-[.1em]">Motor de Calibração Metabólica Real</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: `${statusCfg.color}12`, border: `1px solid ${statusCfg.color}25` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusCfg.color }} />
            <span className="font-mono text-[.48rem]" style={{ color: statusCfg.color }}>LIVE</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Status card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={trend.status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border relative overflow-hidden"
            style={{ background: statusCfg.bg, borderColor: `${statusCfg.color}25` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: `linear-gradient(90deg,transparent,${statusCfg.color}60,transparent)` }} />
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${statusCfg.color}15`, border: `1px solid ${statusCfg.color}25` }}>
                <statusCfg.icon className="w-4 h-4" style={{ color: statusCfg.color }} />
              </div>
              <div>
                <p className="font-heading text-[.85rem] mb-0.5" style={{ color: statusCfg.color }}>
                  {statusCfg.label}
                </p>
                <p className="font-landing text-[.72rem] text-muted-foreground leading-[1.5]">
                  {statusCfg.sublabel}
                </p>
              </div>
            </div>

            {/* Adjustment recommendation */}
            {trend.adjustmentKcal !== 0 && hasEnoughData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 pt-3 border-t flex items-center gap-2"
                style={{ borderColor: `${statusCfg.color}20` }}
              >
                <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: statusCfg.color }} />
                <p className="font-mono text-[.55rem] tracking-[.06em]" style={{ color: `${statusCfg.color}90` }}>
                  MCE RECOMENDA:{" "}
                  <strong>
                    {trend.adjustmentKcal > 0 ? "+" : ""}{trend.adjustmentKcal} kcal/dia
                  </strong>
                  {" "}→ vá para Configurações → Recalcular VET para aplicar
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Peso atual" icon={Scale}
            value={latestWeight ? `${latestWeight} kg` : "—"}
            sub={latestWeight ? "Último registro" : "Ainda sem registros"}
            color="#e8a020" delay={0.05}
          />
          <MetricCard
            label="Variação total" icon={totalDelta !== null && totalDelta < 0 ? TrendingDown : TrendingUp}
            value={totalDelta !== null ? `${totalDelta > 0 ? "+" : ""}${totalDelta} kg` : "—"}
            sub={`${trend.daysOfData} dias de dados`}
            color={totalDelta !== null && totalDelta < 0 ? "#00f0b4" : totalDelta !== null && totalDelta > 0 ? "#ff6644" : "#7890ff"}
            delay={0.1}
          />
          <MetricCard
            label="Taxa semanal real" icon={Activity}
            value={hasEnoughData ? `${trend.weeklyRateKg > 0 ? "+" : ""}${trend.weeklyRateKg} kg/sem` : "—"}
            sub={hasEnoughData ? `Alvo: ${targetWeeklyRate > 0 ? "+" : ""}${targetWeeklyRate} kg/sem` : "Registre 3+ pesagens"}
            color="#7890ff" delay={0.15}
          />
          <MetricCard
            label="TDEE real estimado" icon={Target}
            value={trend.estimatedTDEE ? `${trend.estimatedTDEE.toLocaleString("pt-BR")} kcal` : "—"}
            sub={trend.estimatedTDEE ? "Baseado em peso + intake" : "Precisa de dados de refeição"}
            color="#00f0b4" delay={0.2}
          />
        </div>

        {/* Chart */}
        {chartData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-heading text-[.78rem] tracking-[.04em]">Curva de peso real</p>
                <p className="font-mono text-[.5rem] text-muted-foreground tracking-[.08em]">
                  Linha tracejada = trajetória ideal do protocolo
                </p>
              </div>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={idealLine.length ? idealLine : chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                  domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="peso" stroke="hsl(var(--primary))"
                  strokeWidth={2} fill="url(#weightGrad)"
                  dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
                {idealLine.length > 0 && (
                  <Line
                    type="monotone" dataKey="ideal" stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5} strokeDasharray="4 3" dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Explanation of MCE Adaptive */}
        {!hasEnoughData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <p className="font-heading text-[.75rem] mb-2 text-[#7890ff]">Como funciona o MCE Adaptativo?</p>
            <div className="space-y-2">
              {[
                { n: "1", t: "Registre seu peso diariamente (ideal: manhã em jejum)", c: "#e8a020" },
                { n: "2", t: "Com 3+ registros, o MCE calcula sua taxa real de perda/ganho", c: "#00f0b4" },
                { n: "3", t: "Compara com o alvo do seu protocolo (ex: −0.5kg/sem)", c: "#7890ff" },
                { n: "4", t: "Sugere ajuste de calorias se estiver desviando do alvo", c: "#e8a020" },
              ].map(s => (
                <div key={s.n} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-heading text-[.6rem]"
                    style={{ background: `${s.c}12`, border: `1px solid ${s.c}25`, color: s.c }}>
                    {s.n}
                  </div>
                  <p className="font-landing text-[.72rem] text-muted-foreground leading-[1.5] pt-0.5">{s.t}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="font-mono text-[.5rem] text-muted-foreground tracking-[.06em] italic">
                ⚡ Esta é a mesma tecnologia que apps como MacroFactor usam. No NutriON, incluído em todos os planos.
              </p>
            </div>
          </motion.div>
        )}

        {/* Add weight form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <p className="font-heading text-[.78rem] tracking-[.04em] mb-3">Registrar peso de hoje</p>
          <AddWeightForm onAdd={addLog} />
        </motion.div>

        {/* Recent logs */}
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <p className="font-heading text-[.78rem] tracking-[.04em] mb-3">Histórico de pesagens</p>
            <div className="space-y-2">
              {logs.slice(0, 10).map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: "hsl(var(--border))" }}
                >
                  <div>
                    <p className="font-heading text-[.85rem]">{log.weight_kg} kg</p>
                    <p className="font-mono text-[.5rem] text-muted-foreground">
                      {format(parseISO(log.logged_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      {log.body_fat_pct ? ` · ${log.body_fat_pct}% gord.` : ""}
                    </p>
                  </div>
                  {i !== 0 && (
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
