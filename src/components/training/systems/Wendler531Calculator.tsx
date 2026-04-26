import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Calculator, Award } from "lucide-react";

const LIFTS = [
  { id: "squat", label: "Squat" },
  { id: "bench", label: "Bench Press" },
  { id: "deadlift", label: "Deadlift" },
  { id: "ohp", label: "Overhead Press" },
];

const WEEKS = [
  { week: 1, sets: [{ pct: 0.65, reps: 5 }, { pct: 0.75, reps: 5 }, { pct: 0.85, reps: "5+" as const }] },
  { week: 2, sets: [{ pct: 0.70, reps: 3 }, { pct: 0.80, reps: 3 }, { pct: 0.90, reps: "3+" as const }] },
  { week: 3, sets: [{ pct: 0.75, reps: 5 }, { pct: 0.85, reps: 3 }, { pct: 0.95, reps: "1+" as const }] },
  { week: 4, sets: [{ pct: 0.40, reps: 5 }, { pct: 0.50, reps: 5 }, { pct: 0.60, reps: 5 }], deload: true },
];

export default function Wendler531Calculator() {
  const [lift, setLift] = useState(LIFTS[0].id);
  const [oneRm, setOneRm] = useState(140);
  const [amrapWeight, setAmrapWeight] = useState(0);
  const [amrapReps, setAmrapReps] = useState(0);

  const tm = useMemo(() => Math.round(oneRm * 0.9), [oneRm]); // training max = 90%

  const epleyNew1RM = useMemo(() => {
    if (amrapWeight && amrapReps) return Math.round(amrapWeight * (1 + amrapReps / 30));
    return null;
  }, [amrapWeight, amrapReps]);

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Sistema 5/3/1 (Wendler)</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Exercício</label>
          <select value={lift} onChange={(e) => setLift(e.target.value)} className="w-full mt-1 h-9 rounded-lg bg-background border border-border text-xs px-2">
            {LIFTS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">1RM Estimado (kg)</label>
          <Input type="number" value={oneRm} onChange={(e) => setOneRm(Number(e.target.value))} className="mt-1 h-9 text-sm" />
        </div>
      </div>

      <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-xs text-foreground">
        <b>Training Max (TM = 90% 1RM):</b> {tm} kg — todos os percentuais abaixo usam o TM.
      </div>

      {/* Cycle table */}
      <div className="space-y-2">
        {WEEKS.map((w) => (
          <div key={w.week} className={`p-3 rounded-lg border ${w.deload ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-background"}`}>
            <p className="text-xs font-black text-foreground">Semana {w.week} {w.deload && <span className="text-amber-500">(Deload)</span>}</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {w.sets.map((s, i) => {
                const peso = Math.round(tm * s.pct);
                return (
                  <div key={i} className="text-center p-2 rounded-md bg-muted/30">
                    <p className="text-[9px] text-muted-foreground">Set {i + 1} ({(s.pct * 100).toFixed(0)}%)</p>
                    <p className="text-sm font-bold text-foreground">{peso} kg</p>
                    <p className="text-[10px] text-primary">× {s.reps}{i === 2 && !w.deload ? " AMRAP" : ""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AMRAP → novo 1RM */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Atualizar 1RM via AMRAP (Epley)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Peso AMRAP (kg)</label>
            <Input type="number" value={amrapWeight || ""} onChange={(e) => setAmrapWeight(Number(e.target.value))} placeholder="ex: 119" className="mt-1 h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Reps no set final</label>
            <Input type="number" value={amrapReps || ""} onChange={(e) => setAmrapReps(Number(e.target.value))} placeholder="ex: 8" className="mt-1 h-8 text-xs" />
          </div>
        </div>
        {epleyNew1RM && (
          <p className="mt-2 text-xs text-primary font-bold">Novo 1RM estimado: {epleyNew1RM} kg → próximo TM: {Math.round(epleyNew1RM * 0.9)} kg</p>
        )}
      </div>
    </div>
  );
}
