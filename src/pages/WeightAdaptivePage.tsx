import { useState } from "react";
import { motion } from "framer-motion";
import { useWeightLogs, type WeightTrend } from "@/hooks/useWeightLogs";
import { useProfile } from "@/hooks/useProfile";
import { CheckCircle, AlertTriangle, TrendingDown, Info, Zap, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import BottomNav from "@/components/BottomNav";

const STATUS_CONFIG: Record<WeightTrend["status"], { label: string; sub: string; color: string; Icon: typeof CheckCircle }> = {
  on_track: { label: "Protocolo no alvo", sub: "Sua taxa de mudança está dentro da faixa ideal.", color: "#00f0b4", Icon: CheckCircle },
  too_fast: { label: "Rápido demais", sub: "Você está mudando mais rápido que o seguro. Risco de catabolismo.", color: "#e8a020", Icon: AlertTriangle },
  too_slow: { label: "Progresso abaixo do alvo", sub: "Mudança mais lenta que o planejado. O protocolo precisa de ajuste.", color: "#ff6644", Icon: TrendingDown },
  gaining_unexpected: { label: "Ganho inesperado", sub: "Você está ganhando peso no modo manutenção.", color: "#ff6644", Icon: AlertTriangle },
  insufficient_data: { label: "Dados insuficientes", sub: "Registre peso por pelo menos 3 dias para ativar a calibração MCE.", color: "#7890ff", Icon: Info },
};

const WeightAdaptivePage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const objetivo = profile?.objetivo_principal || "saude_geral";
  const targetRate = objetivo === "perder" ? -0.5 : objetivo === "ganhar" ? 0.35 : 0;
  const { logs, loading, addLog, deleteLog, latestWeight, totalDelta, trend } = useWeightLogs(null, targetRate);
  const [kg, setKg] = useState("");
  const [bf, setBf] = useState("");
  const [saving, setSaving] = useState(false);

  const cfg = STATUS_CONFIG[trend.status];
  const StatusIcon = cfg.Icon;

  const handleAdd = async () => {
    const w = parseFloat(kg);
    if (!w || w < 30 || w > 300) { toast.error("Peso deve ser entre 30 e 300 kg"); return; }
    setSaving(true);
    await addLog(w, bf ? parseFloat(bf) : undefined);
    toast.success("Peso registrado — MCE recalibrado ✓");
    setKg(""); setBf("");
    setSaving(false);
  };

  const chartData = [...logs].reverse().map(l => ({
    date: format(new Date(l.logged_at), "dd/MM"),
    peso: l.weight_kg,
  }));

  const idealLine = logs.length >= 2 ? (() => {
    const first = chartData[0]?.peso ?? 0;
    return chartData.map((_, i) => first + (targetRate / 7) * i * (trend.daysOfData / chartData.length));
  })() : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate("/coach/dashboard")}><ArrowLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div className="flex-1">
            <h1 className="text-sm font-heading font-bold text-foreground">MCE ADAPTATIVO</h1>
            <p className="text-[9px] font-mono text-muted-foreground">Motor de Calibração Metabólica Real</p>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
            <span className="text-[9px] font-mono font-bold" style={{ color: cfg.color }}>LIVE</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Status card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-4" style={{ borderColor: `${cfg.color}30` }}>
          <div className="flex items-start gap-3">
            <StatusIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
            <div className="flex-1">
              <p className="text-sm font-heading font-bold text-foreground">{cfg.label}</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{cfg.sub}</p>
              {trend.adjustmentKcal !== 0 && trend.daysOfData >= 3 && (
                <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg" style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}20` }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-[10px] font-mono" style={{ color: cfg.color }}>
                    MCE RECOMENDA: {trend.adjustmentKcal > 0 ? "+" : ""}{trend.adjustmentKcal} kcal/dia → vá para Configurações → Recalcular VET para aplicar
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 4 metrics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Peso atual", value: latestWeight ? `${latestWeight} kg` : "—", color: "#e8a020" },
            { label: "Variação total", value: totalDelta !== null ? `${totalDelta > 0 ? "+" : ""}${totalDelta} kg` : "—", color: totalDelta !== null && totalDelta < 0 ? "#00f0b4" : "#ff4466" },
            { label: "Taxa semanal real", value: trend.daysOfData >= 3 ? `${trend.weeklyRateKg > 0 ? "+" : ""}${trend.weeklyRateKg} kg/sem` : "—", color: cfg.color },
            { label: "TDEE real estimado", value: trend.estimatedTDEE ? `${trend.estimatedTDEE} kcal` : "—", color: "#7890ff" },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="rounded-xl border border-border bg-card p-3">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{m.label}</p>
              <p className="text-lg font-heading font-bold mt-1" style={{ color: m.color }}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-3">EVOLUÇÃO DE PESO</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#50507a" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#50507a" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#06060f", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="peso" stroke={cfg.color} fill="url(#wGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Explanation when insufficient data */}
        {trend.daysOfData < 3 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-heading font-bold text-foreground">Como funciona o MCE</p>
            {[
              "Registre seu peso diariamente (de preferência ao acordar)",
              "Com 3+ registros, o MCE calcula sua taxa real de mudança",
              "O algoritmo estima seu TDEE real com base em peso × calorias consumidas",
              "Recomendações de ajuste calórico são geradas automaticamente"
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold" style={{ background: "rgba(120,144,255,.1)", color: "#7890ff" }}>{i + 1}</span>
                <p className="text-xs font-mono text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add weight form */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-heading font-bold text-foreground mb-3">Registrar peso</p>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Peso (kg)"
              value={kg}
              onChange={e => setKg(e.target.value)}
              className="flex-1 h-10 rounded-lg bg-secondary border border-border px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              step="0.1"
              placeholder="% gordura"
              value={bf}
              onChange={e => setBf(e.target.value)}
              className="w-24 h-10 rounded-lg bg-secondary border border-border px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleAdd}
              disabled={saving}
              className="h-10 px-4 rounded-lg font-heading font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "..." : "Registrar"}
            </button>
          </div>
        </div>

        {/* Recent logs */}
        {logs.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-heading font-bold text-foreground mb-3">Registros recentes</p>
            <div className="space-y-2">
              {logs.slice(0, 10).map((l, i) => (
                <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-mono font-bold text-foreground">{l.weight_kg} kg</span>
                    {l.body_fat_pct && <span className="text-[10px] font-mono text-muted-foreground ml-2">{l.body_fat_pct}% BF</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {format(new Date(l.logged_at), "dd MMM HH:mm", { locale: ptBR })}
                    </span>
                    {i > 0 && (
                      <button onClick={() => deleteLog(l.id)} className="p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default WeightAdaptivePage;
