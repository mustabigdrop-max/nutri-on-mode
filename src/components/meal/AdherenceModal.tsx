import { motion } from "framer-motion";
import { X, Target, Flame, Beef, Wheat, Droplet, TrendingUp, Award } from "lucide-react";

interface PlanItem {
  day_index: number;
  meal_type: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confirmed: boolean;
}

interface Profile {
  vet_kcal?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}

interface Props {
  items: PlanItem[];
  profile: Profile | null | undefined;
  onClose: () => void;
}

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function AdherenceModal({ items, profile, onClose }: Props) {
  const total = items.length || 1;
  const confirmed = items.filter(i => i.confirmed).length;
  const adherencePct = Math.round((confirmed / total) * 100);

  const byDay = Array.from({ length: 7 }, (_, d) => {
    const dayItems = items.filter(i => i.day_index === d);
    const dayConfirmed = dayItems.filter(i => i.confirmed);
    const kcal = dayConfirmed.reduce((s, i) => s + (i.kcal || 0), 0);
    const p = dayConfirmed.reduce((s, i) => s + (i.protein_g || 0), 0);
    const c = dayConfirmed.reduce((s, i) => s + (i.carbs_g || 0), 0);
    const g = dayConfirmed.reduce((s, i) => s + (i.fat_g || 0), 0);
    return { d, total: dayItems.length, confirmed: dayConfirmed.length, kcal, p, c, g };
  });

  const targetKcal = profile?.vet_kcal || 0;
  const targetP = profile?.protein_g || 0;
  const targetC = profile?.carbs_g || 0;
  const targetG = profile?.fat_g || 0;

  // Macro accuracy: average % off-target across confirmed days
  const accuracy = (() => {
    const days = byDay.filter(d => d.confirmed > 0);
    if (!days.length || !targetKcal) return null;
    const acc = days.map(d => {
      const off = Math.abs(d.kcal - targetKcal) / targetKcal;
      return Math.max(0, 1 - off);
    });
    return Math.round((acc.reduce((s, x) => s + x, 0) / acc.length) * 100);
  })();

  const streak = (() => {
    let s = 0;
    for (let d = 6; d >= 0; d--) {
      const day = byDay[d];
      if (day.total > 0 && day.confirmed === day.total) s++;
      else if (day.total > 0) break;
    }
    return s;
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Aderência Semanal
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Hero metric */}
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-4 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary">Aderência geral</span>
            <p className="text-4xl font-bold text-primary mt-1">{adherencePct}%</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {confirmed}/{total} refeições confirmadas
            </p>
          </div>

          {/* Side metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{streak}</p>
              <span className="text-[10px] font-mono text-muted-foreground">Dias 100% seguidos</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <Target className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{accuracy ?? "—"}{accuracy != null ? "%" : ""}</p>
              <span className="text-[10px] font-mono text-muted-foreground">Precisão kcal</span>
            </div>
          </div>

          {/* Per-day bars */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Por dia</span>
            <div className="mt-2 space-y-1.5">
              {byDay.map(d => {
                const pct = d.total > 0 ? Math.round((d.confirmed / d.total) * 100) : 0;
                return (
                  <div key={d.d} className="flex items-center gap-2">
                    <span className="w-8 text-xs font-mono text-muted-foreground">{DAYS[d.d]}</span>
                    <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: d.d * 0.05 }}
                        className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-amber-500/60"}`}
                      />
                    </div>
                    <span className="w-12 text-right text-[10px] font-mono text-foreground">{d.confirmed}/{d.total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Macro precision (averages of confirmed days) */}
          {targetKcal > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Médias dos dias confirmados</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <MacroRow icon={<Flame className="w-3 h-3" />} label="Kcal" target={targetKcal} avg={avg(byDay, "kcal")} color="text-primary" />
                <MacroRow icon={<Beef className="w-3 h-3" />} label="Prot" target={targetP} avg={avg(byDay, "p")} color="text-rose-400" suffix="g" />
                <MacroRow icon={<Wheat className="w-3 h-3" />} label="Carb" target={targetC} avg={avg(byDay, "c")} color="text-amber-400" suffix="g" />
                <MacroRow icon={<Droplet className="w-3 h-3" />} label="Gord" target={targetG} avg={avg(byDay, "g")} color="text-sky-400" suffix="g" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function avg(byDay: { confirmed: number; kcal: number; p: number; c: number; g: number }[], key: "kcal" | "p" | "c" | "g") {
  const days = byDay.filter(d => d.confirmed > 0);
  if (!days.length) return 0;
  return Math.round(days.reduce((s, d) => s + (d as any)[key], 0) / days.length);
}

function MacroRow({ icon, label, target, avg, color, suffix = "" }: { icon: React.ReactNode; label: string; target: number; avg: number; color: string; suffix?: string }) {
  const pct = target > 0 ? Math.min(100, Math.round((avg / target) * 100)) : 0;
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="text-[10px] font-mono uppercase">{label}</span>
      </div>
      <p className="text-sm font-bold font-mono text-foreground">{avg}{suffix} <span className="text-[9px] text-muted-foreground">/{target}{suffix}</span></p>
      <div className="h-1 rounded-full bg-secondary overflow-hidden mt-1">
        <div className={`h-full ${color.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
