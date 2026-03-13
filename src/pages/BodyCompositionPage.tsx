import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Scale, Ruler, TrendingDown, TrendingUp, Plus, Trophy, AlertTriangle, CheckCircle, Dumbbell, Target } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface BodyEntry {
  date: string;
  weight: number;
  bodyFat: number;
  leanMass: number;
  ffmi: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
}

// Natural bodybuilder FFMI thresholds
const FFMI_LEVELS = [
  { max: 17, label: "Iniciante", color: "#888", desc: "Abaixo da média" },
  { max: 19, label: "Intermediário", color: "#e8a020", desc: "Boa base muscular" },
  { max: 21, label: "Avançado", color: "#00f0b4", desc: "Acima da média natural" },
  { max: 23, label: "Elite Natural", color: "hsl(var(--primary))", desc: "Top 5% natty" },
  { max: 26, label: "Limite Natty", color: "#7890ff", desc: "Máximo natural comprovado" },
  { max: 99, label: "Enhanced", color: "hsl(var(--destructive))", desc: "Acima do limite natural" },
];

function getFfmiLevel(ffmi: number) {
  return FFMI_LEVELS.find(l => ffmi < l.max) ?? FFMI_LEVELS[FFMI_LEVELS.length - 1];
}

function calcFFMI(weightKg: number, heightCm: number, bodyFatPct: number) {
  const leanMass = weightKg * (1 - bodyFatPct / 100);
  const heightM = heightCm / 100;
  const ffmi = leanMass / (heightM * heightM);
  const normalizedFfmi = ffmi + 6.1 * (1.8 - heightM); // normalize to 1.8m
  return { leanMass: parseFloat(leanMass.toFixed(1)), ffmi: parseFloat(normalizedFfmi.toFixed(1)) };
}

const BodyCompositionPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const height = profile?.height_cm || 175;

  const [entries, setEntries] = useState<BodyEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("nutrion-body-entries") || "[]");
    } catch { return []; }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    weight: profile?.weight_kg?.toString() || "",
    bodyFat: "",
    waist: "",
    chest: "",
    arms: "",
    thighs: "",
  });

  const latest = entries[entries.length - 1];
  const prev = entries.length >= 2 ? entries[entries.length - 2] : null;

  const saveEntry = () => {
    const w = parseFloat(form.weight);
    const bf = parseFloat(form.bodyFat);
    if (!w || !bf || bf < 3 || bf > 50) {
      toast.error("Preencha peso e % de gordura válidos");
      return;
    }
    const { leanMass, ffmi } = calcFFMI(w, height, bf);
    const entry: BodyEntry = {
      date: new Date().toISOString().split("T")[0],
      weight: w,
      bodyFat: bf,
      leanMass,
      ffmi,
      waist: form.waist ? parseFloat(form.waist) : undefined,
      chest: form.chest ? parseFloat(form.chest) : undefined,
      arms: form.arms ? parseFloat(form.arms) : undefined,
      thighs: form.thighs ? parseFloat(form.thighs) : undefined,
    };
    const updated = [...entries, entry];
    setEntries(updated);
    localStorage.setItem("nutrion-body-entries", JSON.stringify(updated));
    setShowForm(false);
    setForm({ weight: "", bodyFat: "", waist: "", chest: "", arms: "", thighs: "" });
    toast.success("Composição corporal registrada");
  };

  const ffmiLevel = latest ? getFfmiLevel(latest.ffmi) : null;
  const weightDiff = latest && prev ? (latest.weight - prev.weight).toFixed(1) : null;
  const leanDiff = latest && prev ? (latest.leanMass - prev.leanMass).toFixed(1) : null;
  const fatDiff = latest && prev
    ? ((latest.weight * latest.bodyFat / 100) - (prev.weight * prev.bodyFat / 100)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur sticky top-0">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Composição Corporal</h1>
          <p className="text-[10px] text-muted-foreground font-mono">FFMI · Massa Magra · Recomposição</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono"
        >
          <Plus className="w-3.5 h-3.5" /> Registrar
        </button>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Entry form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4"
            >
              <p className="text-xs font-mono text-primary uppercase tracking-wider mb-3">Nova medição</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[9px] font-mono text-muted-foreground uppercase">Peso (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="85.0" className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted-foreground uppercase">% Gordura</label>
                  <input type="number" value={form.bodyFat} onChange={e => setForm(f => ({ ...f, bodyFat: e.target.value }))}
                    placeholder="14.5" className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                </div>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase mb-2">Medidas (cm) — opcional</p>
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {(["waist", "chest", "arms", "thighs"] as const).map(k => (
                  <div key={k}>
                    <label className="text-[8px] font-mono text-muted-foreground capitalize block mb-1">
                      {k === "waist" ? "Cintura" : k === "chest" ? "Peito" : k === "arms" ? "Braço" : "Coxa"}
                    </label>
                    <input type="number" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      placeholder="—" className="w-full px-2 py-1.5 rounded border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-border text-xs font-mono text-muted-foreground">Cancelar</button>
                <button onClick={saveEntry} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold">Salvar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!latest ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card/50 p-8 text-center">
            <Scale className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-mono">Nenhuma medição ainda</p>
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">Registre seu peso e % de gordura para calcular FFMI e massa magra</p>
          </motion.div>
        ) : (
          <>
            {/* FFMI Card — hero metric */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border overflow-hidden"
              style={{ borderColor: `${ffmiLevel!.color}30`, background: `${ffmiLevel!.color}08` }}>
              <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${ffmiLevel!.color}80, transparent)` }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: `${ffmiLevel!.color}90` }}>Fat-Free Mass Index</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black font-mono" style={{ color: ffmiLevel!.color }}>{latest.ffmi}</span>
                      <span className="text-sm text-muted-foreground font-mono mb-1">/ 26</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 rounded text-[9px] font-mono font-bold uppercase"
                      style={{ background: `${ffmiLevel!.color}20`, color: ffmiLevel!.color, border: `1px solid ${ffmiLevel!.color}30` }}>
                      {ffmiLevel!.label}
                    </span>
                    <p className="text-[9px] font-mono text-muted-foreground mt-1">{ffmiLevel!.desc}</p>
                  </div>
                </div>

                {/* FFMI progress bar */}
                <div className="relative h-2 bg-border rounded-full overflow-hidden mb-4">
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, hsl(var(--primary)), ${ffmiLevel!.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(latest.ffmi / 26 * 100, 100)}%` }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                  {/* Natural limit line at 25 */}
                  <div className="absolute top-0 bottom-0 w-px bg-[#7890ff]/60" style={{ left: `${25 / 26 * 100}%` }} />
                </div>

                {/* FFMI threshold ticks */}
                <div className="flex justify-between text-[7px] font-mono text-muted-foreground/50 mb-2">
                  <span>17</span><span>19</span><span>21</span><span>23</span><span>25</span><span>26</span>
                </div>

                {/* Body stats row */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-base font-bold font-mono text-foreground">{latest.leanMass}<span className="text-[9px] text-muted-foreground">kg</span></p>
                    <p className="text-[8px] font-mono text-muted-foreground">Massa Magra</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold font-mono text-foreground">{latest.bodyFat}<span className="text-[9px] text-muted-foreground">%</span></p>
                    <p className="text-[8px] font-mono text-muted-foreground">Gordura</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold font-mono text-foreground">{latest.weight}<span className="text-[9px] text-muted-foreground">kg</span></p>
                    <p className="text-[8px] font-mono text-muted-foreground">Peso Total</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Body composition visual — fat vs lean bar */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card/60 p-4">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Composição Visual</p>
              <div className="flex rounded-lg overflow-hidden h-8 mb-2">
                <motion.div className="flex items-center justify-center text-[9px] font-mono font-bold text-primary-foreground"
                  style={{ background: "hsl(var(--primary))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - latest.bodyFat}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}>
                  {100 - latest.bodyFat < 25 ? "" : `Massa Magra ${(100 - latest.bodyFat).toFixed(0)}%`}
                </motion.div>
                <motion.div className="flex items-center justify-center text-[9px] font-mono font-bold text-destructive-foreground"
                  style={{ background: "hsl(var(--destructive) / 0.7)", flex: 1 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}>
                  {latest.bodyFat < 8 ? "" : `Gordura ${latest.bodyFat.toFixed(0)}%`}
                </motion.div>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                <span>● Massa magra: <span className="text-foreground font-bold">{latest.leanMass}kg</span></span>
                <span>● Gordura: <span className="text-foreground font-bold">{(latest.weight * latest.bodyFat / 100).toFixed(1)}kg</span></span>
              </div>
            </motion.div>

            {/* Delta from last measurement */}
            {prev && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-xl border border-border bg-card/60 p-4">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Mudança desde última medição</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Peso", val: weightDiff, unit: "kg" },
                    { label: "Massa Magra", val: leanDiff, unit: "kg", positive: true },
                    { label: "Gordura", val: fatDiff, unit: "kg", positive: false },
                  ].map(({ label, val, unit, positive }) => {
                    const n = parseFloat(val || "0");
                    const isGood = positive !== undefined ? (positive ? n > 0 : n < 0) : undefined;
                    return (
                      <div key={label} className="rounded-lg bg-background/50 border border-border p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          {n > 0 ? <TrendingUp className={`w-3 h-3 ${isGood === true ? "text-primary" : isGood === false ? "text-destructive" : "text-muted-foreground"}`} />
                            : n < 0 ? <TrendingDown className={`w-3 h-3 ${isGood === false ? "text-primary" : isGood === true ? "text-destructive" : "text-muted-foreground"}`} />
                              : null}
                          <span className={`text-sm font-bold font-mono ${n > 0 ? (isGood === true ? "text-primary" : isGood === false ? "text-destructive" : "text-foreground") : n < 0 ? (isGood === false ? "text-primary" : isGood === true ? "text-destructive" : "text-foreground") : "text-muted-foreground"}`}>
                            {n > 0 ? "+" : ""}{val}{unit}
                          </span>
                        </div>
                        <p className="text-[8px] font-mono text-muted-foreground">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Measurements */}
            {(latest.waist || latest.chest || latest.arms || latest.thighs) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card/60 p-4">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Medidas corporais
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "waist", label: "Cintura" },
                    { key: "chest", label: "Peito" },
                    { key: "arms", label: "Braço" },
                    { key: "thighs", label: "Coxa" },
                  ].map(({ key, label }) => {
                    const val = latest[key as keyof BodyEntry];
                    if (!val) return null;
                    return (
                      <div key={key} className="rounded-lg bg-primary/5 border border-primary/15 p-2 text-center">
                        <p className="text-sm font-bold font-mono text-primary">{val}<span className="text-[8px]">cm</span></p>
                        <p className="text-[8px] font-mono text-muted-foreground">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* History timeline */}
            {entries.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="rounded-xl border border-border bg-card/60 p-4">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Histórico de medições</p>
                <div className="space-y-2">
                  {[...entries].reverse().slice(0, 6).map((e, i) => (
                    <div key={e.date} className={`flex items-center justify-between py-2 ${i < entries.length - 1 ? "border-b border-border" : ""}`}>
                      <div>
                        <p className="text-[10px] font-mono text-muted-foreground">{e.date}</p>
                        <p className="text-xs font-bold font-mono text-foreground">{e.weight}kg · {e.bodyFat}% bf</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-primary">FFMI {e.ffmi}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">{e.leanMass}kg magra</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Natural FFMI guide */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card/40 p-4">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Escala FFMI Natural
              </p>
              <div className="space-y-1.5">
                {FFMI_LEVELS.slice(0, 5).map(lvl => (
                  <div key={lvl.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lvl.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold" style={{ color: lvl.color }}>{lvl.label}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">&lt;{lvl.max}</span>
                      </div>
                      <p className="text-[8px] font-mono text-muted-foreground">{lvl.desc}</p>
                    </div>
                    {latest.ffmi < lvl.max && !FFMI_LEVELS.slice(0, FFMI_LEVELS.indexOf(lvl)).some(l => latest.ffmi < l.max) && (
                      <span className="text-[8px] font-mono text-primary">← você</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BodyCompositionPage;
