import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, ChevronRight, Plus, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * WeightCheckInCard — compact dashboard card for the adaptive MCE.
 * Shows current weight, 7-day trend, and MCE status in a single card.
 * CTA: navigate to full MCE Adaptive page.
 */
export default function WeightCheckInCard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [inputKg, setInputKg] = useState("");
  const [saving, setSaving] = useState(false);

  const targetWeeklyRate = (() => {
    const obj = profile?.objetivo ?? "manter";
    if (obj === "perder" || obj === "emagrecer") return -0.5;
    if (obj === "ganhar" || obj === "hipertrofia") return 0.35;
    return 0;
  })();

  const { logs, addLog, latestWeight, totalDelta, trend } = useWeightLogs(
    profile?.calorias_diarias ?? null,
    targetWeeklyRate
  );

  const todayLogged = logs[0]
    ? isToday(parseISO(logs[0].logged_at))
    : false;

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(inputKg.replace(",", "."));
    if (!val || val < 30 || val > 300) return toast.error("Peso inválido");
    setSaving(true);
    try {
      await addLog(val);
      setInputKg("");
      setShowQuickAdd(false);
      toast.success("Peso registrado — MCE recalibrado ✓");
    } catch { toast.error("Erro ao salvar peso"); }
    finally { setSaving(false); }
  }

  const statusColor = {
    on_track: "#00f0b4",
    too_fast: "#e8a020",
    too_slow: "#ff6644",
    gaining_unexpected: "#ff6644",
    insufficient_data: "#7890ff",
  }[trend.status];

  const statusLabel = {
    on_track: "No alvo",
    too_fast: "Rápido demais",
    too_slow: "Abaixo do alvo",
    gaining_unexpected: "Ganho inesperado",
    insufficient_data: "Calibrando MCE",
  }[trend.status];

  const StatusIcon = {
    on_track: CheckCircle,
    too_fast: AlertTriangle,
    too_slow: AlertTriangle,
    gaining_unexpected: AlertTriangle,
    insufficient_data: Scale,
  }[trend.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border overflow-hidden bg-card"
    >
      {/* Top accent */}
      <div className="h-[2px]"
        style={{ background: `linear-gradient(90deg, ${statusColor}80, ${statusColor}30, transparent)` }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${statusColor}12`, border: `1px solid ${statusColor}22` }}>
              <Scale className="w-3.5 h-3.5" style={{ color: statusColor }} />
            </div>
            <div>
              <p className="font-heading text-[.72rem] tracking-[.04em]">PESO & MCE</p>
              <p className="font-mono text-[.44rem] text-muted-foreground tracking-[.08em]">Calibração adaptativa</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: `${statusColor}10`, border: `1px solid ${statusColor}20` }}>
            <StatusIcon className="w-2.5 h-2.5" style={{ color: statusColor }} />
            <span className="font-mono text-[.44rem]" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Current weight */}
          <div className="text-center p-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
            <p className="font-mono text-[.42rem] text-muted-foreground uppercase tracking-wider mb-1">Atual</p>
            <p className="font-heading text-[1.2rem] leading-none text-primary">
              {latestWeight ? `${latestWeight}` : "—"}
            </p>
            <p className="font-mono text-[.42rem] text-muted-foreground mt-0.5">kg</p>
          </div>

          {/* Total change */}
          <div className="text-center p-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
            <p className="font-mono text-[.42rem] text-muted-foreground uppercase tracking-wider mb-1">Variação</p>
            <p className="font-heading text-[1.2rem] leading-none"
              style={{ color: totalDelta === null ? "hsl(var(--muted-foreground))" : totalDelta <= 0 ? "#00f0b4" : "#ff6644" }}>
              {totalDelta !== null ? `${totalDelta > 0 ? "+" : ""}${totalDelta}` : "—"}
            </p>
            <p className="font-mono text-[.42rem] text-muted-foreground mt-0.5">kg total</p>
          </div>

          {/* Weekly rate */}
          <div className="text-center p-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
            <p className="font-mono text-[.42rem] text-muted-foreground uppercase tracking-wider mb-1">Semana</p>
            <p className="font-heading text-[1.2rem] leading-none"
              style={{ color: trend.daysOfData < 3 ? "hsl(var(--muted-foreground))" : statusColor }}>
              {trend.daysOfData >= 3 ? `${trend.weeklyRateKg > 0 ? "+" : ""}${trend.weeklyRateKg}` : "—"}
            </p>
            <p className="font-mono text-[.42rem] text-muted-foreground mt-0.5">kg/sem</p>
          </div>
        </div>

        {/* MCE adjustment pill */}
        {trend.adjustmentKcal !== 0 && trend.daysOfData >= 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
            style={{ background: `${statusColor}08`, border: `1px solid ${statusColor}18` }}
          >
            <Zap className="w-3 h-3 flex-shrink-0" style={{ color: statusColor }} />
            <p className="font-mono text-[.48rem]" style={{ color: `${statusColor}90` }}>
              MCE sugere{" "}
              <strong style={{ color: statusColor }}>
                {trend.adjustmentKcal > 0 ? "+" : ""}{trend.adjustmentKcal} kcal/dia
              </strong>
              {" "}para manter o protocolo no alvo
            </p>
          </motion.div>
        )}

        {/* Action row */}
        <AnimatePresence mode="wait">
          {showQuickAdd ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleQuickAdd}
              className="flex gap-2"
            >
              <input
                autoFocus
                type="number" step="0.1" placeholder="Peso em kg (ex: 78.5)"
                value={inputKg} onChange={e => setInputKg(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-[.8rem] font-mono focus:outline-none focus:border-primary transition-colors"
              />
              <button type="submit" disabled={saving || !inputKg}
                className="px-3 py-2 rounded-xl font-heading text-[.7rem] transition-all disabled:opacity-40"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                {saving ? "..." : "OK"}
              </button>
              <button type="button" onClick={() => setShowQuickAdd(false)}
                className="px-3 py-2 rounded-xl font-heading text-[.7rem] border border-border text-muted-foreground hover:text-foreground transition-colors">
                ✕
              </button>
            </motion.form>
          ) : (
            <motion.div key="buttons" className="flex gap-2">
              {!todayLogged ? (
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed font-heading text-[.7rem] tracking-[.04em] transition-all hover:border-primary hover:text-primary"
                  style={{ borderColor: "rgba(255,255,255,.1)", color: "hsl(var(--muted-foreground))" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Pesou hoje?
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl"
                  style={{ background: "rgba(0,240,180,.06)", border: "1px solid rgba(0,240,180,.18)" }}>
                  <CheckCircle className="w-3.5 h-3.5 text-[#00f0b4]" />
                  <span className="font-heading text-[.7rem] text-[#00f0b4]">Pesagem de hoje registrada</span>
                </div>
              )}
              <button
                onClick={() => navigate("/weight-adaptive")}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl border font-mono text-[.55rem] tracking-[.06em] text-muted-foreground hover:text-foreground hover:border-primary transition-all"
                style={{ borderColor: "rgba(255,255,255,.08)" }}
              >
                MCE <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
