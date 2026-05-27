import { useState } from "react";
import { motion } from "framer-motion";
import { useWeightLogs, type WeightTrend } from "@/hooks/useWeightLogs";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import BottomNav from "@/components/BottomNav";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";
const GREEN = "#00C896";
const PURPLE = "#7890ff";

const STATUS_CONFIG: Record<WeightTrend["status"], {
  label: string; sub: string; color: string; code: string;
}> = {
  on_track:            { label: "Protocolo no Alvo",     sub: "Taxa de mudança dentro da faixa ideal. Continua.",        color: GREEN,  code: "OK" },
  too_fast:            { label: "Ritmo Acima do Limite", sub: "Mudança rápida demais. Risco de catabolismo detectado.",   color: GOLD,   code: "WRN" },
  too_slow:            { label: "Progresso Abaixo do Alvo", sub: "Taxa abaixo do planejado. Protocolo requer ajuste.",    color: "#ff6644", code: "ADJ" },
  gaining_unexpected:  { label: "Ganho Não Previsto",    sub: "Peso subindo em modo manutenção. Reavaliar protocolo.",   color: "#ff6644", code: "ERR" },
  insufficient_data:   { label: "Dados Insuficientes",   sub: "Registre peso por 3+ dias para ativar calibração MCE.",   color: PURPLE, code: "PND" },
};

const HOW_IT_WORKS = [
  { code: "01", text: "Registre seu peso diariamente ao acordar, em jejum" },
  { code: "02", text: "Com 3+ registros, o MCE calcula sua taxa real de mudança" },
  { code: "03", text: "O algoritmo estima seu TDEE real com base em peso × calorias" },
  { code: "04", text: "Recomendações de ajuste calórico são geradas automaticamente" },
];

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

  const handleAdd = async () => {
    const w = parseFloat(kg);
    if (!w || w < 30 || w > 300) { toast.error("Peso deve ser entre 30 e 300 kg"); return; }
    setSaving(true);
    await addLog(w, bf ? parseFloat(bf) : undefined);
    toast.success("Peso registrado — MCE recalibrado");
    setKg(""); setBf("");
    setSaving(false);
  };

  const chartData = [...logs].reverse().map(l => ({
    date: format(new Date(l.logged_at), "dd/MM"),
    peso: l.weight_kg,
  }));

  const metrics = [
    { code: "PW", label: "Peso Atual",        value: latestWeight ? `${latestWeight} kg` : "—", color: GOLD },
    { code: "DT", label: "Variação Total",     value: totalDelta !== null ? `${totalDelta > 0 ? "+" : ""}${totalDelta} kg` : "—", color: totalDelta !== null && totalDelta < 0 ? GREEN : "#ff4466" },
    { code: "TX", label: "Taxa Semanal Real",  value: trend.daysOfData >= 3 ? `${trend.weeklyRateKg > 0 ? "+" : ""}${trend.weeklyRateKg} kg/sem` : "—", color: cfg.color },
    { code: "TD", label: "TDEE Real Estimado", value: trend.estimatedTDEE ? `${trend.estimatedTDEE} kcal` : "—", color: CYAN },
  ];

  return (
    <div
      className="min-h-screen pb-24 relative overflow-hidden"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif", color: "#F5F0E8" }}
    >
      {/* Hex grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Radial glow tied to status color */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: 600, height: 300, background: `radial-gradient(ellipse, ${cfg.color}0a 0%, transparent 70%)` }}
      />

      <div className="hud-scan-line" />

      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 px-4 py-3"
        style={{ background: "rgba(10,10,26,0.96)", borderBottom: "1px solid rgba(184,146,42,0.1)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            style={{ color: "rgba(80,80,122,0.7)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,80,122,0.7)")}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>

          <div className="flex-1">
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.1em", color: "#F5F0E8" }}>
              MCE ADAPTATIVO
            </h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.15em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase" }}>
              Motor de Calibração Metabólica Real
            </p>
          </div>

          {/* Live status indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`, animation: "dotPulse 1.6s ease-in-out infinite" }}
            />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.15em", color: cfg.color, textTransform: "uppercase" }}>
              {cfg.code}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4 relative z-10">

        {/* ═══ STATUS CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
          style={{
            border: `1px solid ${cfg.color}33`,
            background: "rgba(10,10,26,0.8)",
            clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
          }}
        >
          <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
          <span className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `1px solid ${cfg.color}66`, borderLeft: `1px solid ${cfg.color}66` }} />
          <span className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `1px solid ${cfg.color}33`, borderRight: `1px solid ${cfg.color}33` }} />

          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 28, height: 28,
                  background: `rgba(${cfg.color === GREEN ? "0,200,150" : cfg.color === GOLD ? "184,146,42" : cfg.color === CYAN ? "0,212,255" : cfg.color === PURPLE ? "120,144,255" : "255,100,68"},0.12)`,
                  border: `1px solid ${cfg.color}44`,
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              >
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", fontWeight: 700, color: cfg.color }}>{cfg.code}</span>
              </div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: cfg.color, letterSpacing: "0.04em" }}>
                {cfg.label.toUpperCase()}
              </span>
            </div>

            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.85)", lineHeight: 1.6 }}>
              {cfg.sub}
            </p>

            {trend.adjustmentKcal !== 0 && trend.daysOfData >= 3 && (
              <div
                className="flex items-center gap-2 mt-3 px-3 py-2"
                style={{
                  background: `rgba(${cfg.color === GREEN ? "0,200,150" : "184,146,42"},0.08)`,
                  border: `1px solid ${cfg.color}25`,
                }}
              >
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.08em", color: cfg.color, lineHeight: 1.5 }}>
                  MCE RECOMENDA: {trend.adjustmentKcal > 0 ? "+" : ""}{trend.adjustmentKcal} kcal/dia
                  {" "}→{" "}
                  <span style={{ color: "rgba(245,240,232,0.6)" }}>Configurações → Recalcular VET</span>
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══ 4 METRICS ═══ */}
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m, i) => (
            <motion.div
              key={m.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="relative overflow-hidden group"
              style={{
                background: "rgba(10,10,26,0.8)",
                border: "1px solid rgba(184,146,42,0.1)",
                padding: "14px",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              }}
            >
              <span
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }}
              />
              <div className="absolute top-2 right-2 opacity-25" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.38rem", color: m.color }}>
                {m.code}
              </div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.14em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase", marginBottom: 6 }}>
                {m.label}
              </p>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.6rem", color: m.color, lineHeight: 1, textShadow: `0 0 20px ${m.color}44` }}>
                {m.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ═══ CHART ═══ */}
        {chartData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden"
            style={{
              background: "rgba(10,10,26,0.8)",
              border: "1px solid rgba(184,146,42,0.1)",
              clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
            }}
          >
            <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}66, transparent)` }} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase" }}>
                  Evolução de Peso
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.12em", color: `${cfg.color}66` }}>
                  TREND-{trend.daysOfData}D
                </span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cfg.color} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 8, fill: "rgba(80,80,122,0.7)", fontFamily: "'Space Mono', monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 8, fill: "rgba(80,80,122,0.7)", fontFamily: "'Space Mono', monospace" }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d0d1f",
                      border: `1px solid ${cfg.color}33`,
                      borderRadius: 0,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      color: "#F5F0E8",
                    }}
                    labelStyle={{ color: "rgba(80,80,122,0.8)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="peso"
                    stroke={cfg.color}
                    fill="url(#wGrad)"
                    strokeWidth={1.5}
                    dot={{ fill: cfg.color, strokeWidth: 0, r: 2.5 }}
                    activeDot={{ fill: cfg.color, strokeWidth: 0, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ═══ HOW IT WORKS (when no data yet) ═══ */}
        {trend.daysOfData < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden"
            style={{
              background: "rgba(10,10,26,0.6)",
              border: `1px solid ${PURPLE}22`,
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${PURPLE}66, transparent)` }} />
            <div className="p-4">
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.18em", color: PURPLE, textTransform: "uppercase", marginBottom: 12 }}>
                Como Funciona o MCE
              </p>
              <div className="space-y-3">
                {HOW_IT_WORKS.map((s) => (
                  <div key={s.code} className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 22, height: 22,
                        background: `rgba(120,144,255,0.1)`,
                        border: `1px solid ${PURPLE}44`,
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      }}
                    >
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.4rem", fontWeight: 700, color: PURPLE }}>{s.code}</span>
                    </div>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.06em", color: "rgba(80,80,122,0.85)", lineHeight: 1.6 }}>
                      {s.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ REGISTER WEIGHT ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden"
          style={{
            background: "rgba(10,10,26,0.8)",
            border: "1px solid rgba(184,146,42,0.12)",
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          <span className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }} />
          <div className="p-4">
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>
              Registrar Peso
            </p>
            <div className="flex gap-2">
              {/* KG input */}
              <div className="flex-1 relative group">
                <div
                  className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
                  style={{ width: 36, borderRight: "1px solid rgba(184,146,42,0.2)" }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", color: "rgba(184,146,42,0.5)" }}>KG</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Peso"
                  value={kg}
                  onChange={e => setKg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  style={{
                    width: "100%",
                    paddingLeft: 44,
                    paddingRight: 10,
                    paddingTop: 11,
                    paddingBottom: 11,
                    background: "rgba(10,10,26,0.9)",
                    border: "1px solid rgba(184,146,42,0.18)",
                    color: "#F5F0E8",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.82rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                    clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.45)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.18)"; }}
                />
              </div>

              {/* BF input */}
              <div className="relative group" style={{ width: 80 }}>
                <div
                  className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
                  style={{ width: 30, borderRight: "1px solid rgba(184,146,42,0.2)" }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.38rem", color: "rgba(184,146,42,0.4)" }}>BF</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="%"
                  value={bf}
                  onChange={e => setBf(e.target.value)}
                  style={{
                    width: "100%",
                    paddingLeft: 36,
                    paddingRight: 8,
                    paddingTop: 11,
                    paddingBottom: 11,
                    background: "rgba(10,10,26,0.9)",
                    border: "1px solid rgba(184,146,42,0.18)",
                    color: "#F5F0E8",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.82rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                    clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.45)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.18)"; }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  height: 44,
                  paddingLeft: 16,
                  paddingRight: 16,
                  background: saving ? "rgba(184,146,42,0.3)" : GOLD,
                  color: "#0a0a1a",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                {saving ? "..." : "LOG"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ═══ LOG HISTORY ═══ */}
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="relative overflow-hidden"
            style={{
              background: "rgba(10,10,26,0.8)",
              border: "1px solid rgba(184,146,42,0.08)",
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.18em", color: "rgba(80,80,122,0.6)", textTransform: "uppercase" }}>
                  Registros Recentes
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.42rem", letterSpacing: "0.1em", color: "rgba(184,146,42,0.3)" }}>
                  LOG-{logs.length}
                </span>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(184,146,42,0.06)" }}>
              {logs.slice(0, 10).map((l, i) => (
                <div key={l.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 22, height: 22,
                        background: i === 0 ? "rgba(184,146,42,0.12)" : "rgba(80,80,122,0.08)",
                        border: `1px solid ${i === 0 ? GOLD + "44" : "rgba(80,80,122,0.2)"}`,
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      }}
                    >
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.38rem", color: i === 0 ? GOLD : "rgba(80,80,122,0.5)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1rem", color: i === 0 ? GOLD : "#F5F0E8" }}>
                        {l.weight_kg} kg
                      </span>
                      {l.body_fat_pct && (
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", color: "rgba(80,80,122,0.7)", marginLeft: 8 }}>
                          {l.body_fat_pct}% BF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.6)" }}>
                      {format(new Date(l.logged_at), "dd MMM HH:mm", { locale: ptBR })}
                    </span>
                    {i > 0 && (
                      <button
                        onClick={() => deleteLog(l.id)}
                        style={{ color: "rgba(80,80,122,0.4)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6644")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,80,122,0.4)")}
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default WeightAdaptivePage;
