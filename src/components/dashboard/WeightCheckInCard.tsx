import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useProfile } from "@/hooks/useProfile";
import { Scale, Zap, ChevronRight, Plus, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { isToday } from "date-fns";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  on_track: { label: "No alvo", color: "#00f0b4" },
  too_fast: { label: "Rápido", color: "#e8a020" },
  too_slow: { label: "Lento", color: "#ff6644" },
  gaining_unexpected: { label: "Atenção", color: "#ff6644" },
  insufficient_data: { label: "Coletando", color: "#7890ff" },
};

const WeightCheckInCard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const objetivo = profile?.objetivo_principal || "saude_geral";
  const targetRate = objetivo === "perder" ? -0.5 : objetivo === "ganhar" ? 0.35 : 0;
  const { logs, latestWeight, totalDelta, trend, addLog } = useWeightLogs(null, targetRate);
  const [showForm, setShowForm] = useState(false);
  const [kg, setKg] = useState("");
  const [saving, setSaving] = useState(false);

  const st = STATUS_LABELS[trend.status] || STATUS_LABELS.insufficient_data;
  const todayLogged = logs.length > 0 && isToday(new Date(logs[0].logged_at));

  const handleSubmit = async () => {
    const w = parseFloat(kg);
    if (!w || w < 30 || w > 300) { toast.error("Peso inválido"); return; }
    setSaving(true);
    await addLog(w);
    toast.success("Peso registrado — MCE recalibrado ✓");
    setKg(""); setShowForm(false); setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hud-card mb-4 overflow-hidden"
    >
      {/* Top accent */}
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${st.color}, transparent)` }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-heading font-bold text-foreground">PESO & MCE</p>
              <p className="text-[9px] font-mono text-muted-foreground">Calibração adaptativa</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}25` }}>
            {st.label}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-[9px] font-mono text-muted-foreground">Atual</p>
            <p className="text-base font-heading font-bold text-primary">{latestWeight ? `${latestWeight}kg` : "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono text-muted-foreground">Variação</p>
            <p className="text-base font-heading font-bold" style={{ color: totalDelta !== null && totalDelta < 0 ? "#00f0b4" : totalDelta !== null && totalDelta > 0 ? "#ff4466" : "#8888aa" }}>
              {totalDelta !== null ? `${totalDelta > 0 ? "+" : ""}${totalDelta}kg` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-mono text-muted-foreground">Taxa/sem</p>
            <p className="text-base font-heading font-bold" style={{ color: trend.daysOfData >= 3 ? st.color : "#8888aa" }}>
              {trend.daysOfData >= 3 ? `${trend.weeklyRateKg > 0 ? "+" : ""}${trend.weeklyRateKg}` : "—"}
            </p>
          </div>
        </div>

        {/* MCE adjustment */}
        {trend.adjustmentKcal !== 0 && trend.daysOfData >= 3 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3" style={{ background: `${st.color}08`, border: `1px solid ${st.color}15` }}>
            <Zap className="w-3 h-3 flex-shrink-0" style={{ color: st.color }} />
            <span className="text-[9px] font-mono" style={{ color: st.color }}>
              MCE sugere {trend.adjustmentKcal > 0 ? "+" : ""}{trend.adjustmentKcal} kcal/dia para manter o protocolo no alvo
            </span>
          </div>
        )}

        {/* Action row */}
        <AnimatePresence mode="wait">
          {!todayLogged && !showForm && (
            <motion.button
              key="ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-primary/30 text-primary text-xs font-mono hover:bg-primary/5 transition-colors mb-2"
            >
              <Plus className="w-3.5 h-3.5" /> Pesou hoje?
            </motion.button>
          )}
          {showForm && (
            <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-2 mb-2">
              <input
                type="number"
                step="0.1"
                placeholder="kg"
                value={kg}
                onChange={e => setKg(e.target.value)}
                className="flex-1 h-9 rounded-lg bg-secondary border border-border px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button onClick={handleSubmit} disabled={saving} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">OK</button>
              <button onClick={() => setShowForm(false)} className="h-9 px-2 text-muted-foreground"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {todayLogged && !showForm && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-1.5 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-mono text-green-400">Pesagem de hoje registrada</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => navigate("/weight-adaptive")}
          className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <span className="text-[10px] font-mono text-muted-foreground">Ver MCE completo</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

export default WeightCheckInCard;
