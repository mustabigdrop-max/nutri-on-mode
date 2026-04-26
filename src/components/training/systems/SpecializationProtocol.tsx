import { useState, useMemo } from "react";
import { MUSCLES, VOLUME_LANDMARKS } from "@/data/trainingData";
import { Target, TrendingUp, Calendar } from "lucide-react";

const LEVELS_OPTS = [
  { v: "intermediate", label: "Intermediário" },
  { v: "advanced", label: "Avançado" },
];

export default function SpecializationProtocol() {
  const [muscle, setMuscle] = useState(MUSCLES[5]); // Quadríceps default
  const [weeks, setWeeks] = useState(8);
  const [level, setLevel] = useState<"intermediate" | "advanced">("advanced");

  const landmark = useMemo(() => VOLUME_LANDMARKS.find((l) => l.muscle === muscle), [muscle]);
  const lm = landmark ? landmark[level] : null;

  const weekPlan = useMemo(() => {
    if (!lm) return [];
    const plans: { week: number; phase: string; volume: number; note: string }[] = [];
    for (let w = 1; w <= weeks; w++) {
      let phase = "", volume = lm.mev, note = "";
      if (w <= 2) { phase = "Acumulação inicial"; volume = Math.round(lm.mev * 1.2); note = "MEV +20%"; }
      else if (w <= 4) { phase = "Acumulação média"; volume = lm.mav; note = "MAV"; }
      else if (w <= 6) { phase = "Intensificação"; volume = Math.round(lm.mav * 1.1); note = "MAV +10%"; }
      else if (w === 7 || w === 8) { phase = "Pico de volume"; volume = lm.mrv; note = "MRV (limite)"; }
      else if (w === 9) { phase = "Deload"; volume = Math.round(lm.mev * 0.6); note = "Recuperação"; }
      else { phase = "Novo ciclo"; volume = Math.round(lm.mav * 1.15); note = "Reentrada com mais volume"; }
      plans.push({ week: w, phase, volume, note });
    }
    return plans;
  }, [weeks, lm]);

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Protocolo de Especialização</h3>
      </div>
      <p className="text-xs text-muted-foreground">3 sessões/semana no grupo alvo (Força → Hipertrofia → Técnicas). Outros grupos em MEV.</p>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Grupo alvo</label>
          <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className="w-full mt-1 h-9 rounded-lg bg-background border border-border text-xs px-2">
            {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Duração</label>
          <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="w-full mt-1 h-9 rounded-lg bg-background border border-border text-xs px-2">
            {[6, 8, 10, 12].map((w) => <option key={w} value={w}>{w} semanas</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Nível</label>
          <select value={level} onChange={(e) => setLevel(e.target.value as any)} className="w-full mt-1 h-9 rounded-lg bg-background border border-border text-xs px-2">
            {LEVELS_OPTS.map((l) => <option key={l.v} value={l.v}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Sessões fixas */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "A", label: "Sessão A — Força", desc: "3-5 reps × 5 sets, compostos pesados, 3-5min descanso." },
          { id: "B", label: "Sessão B — Hipertrofia", desc: "8-12 reps × 4-5 sets, volume alto, 60-90s descanso." },
          { id: "C", label: "Sessão C — Técnicas", desc: "BFR, myo-reps, pausa, drop sets, RIR 0-1." },
        ].map((s) => (
          <div key={s.id} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-black text-primary">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Plano semanal */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Progressão automática ({muscle})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="text-left p-2">Sem</th>
                <th className="text-left p-2">Fase</th>
                <th className="text-left p-2">Volume (sets)</th>
                <th className="text-left p-2">Nota</th>
              </tr>
            </thead>
            <tbody>
              {weekPlan.map((w) => (
                <tr key={w.week} className="border-t border-border">
                  <td className="p-2 font-bold text-primary">{w.week}</td>
                  <td className="p-2 text-foreground">{w.phase}</td>
                  <td className="p-2 text-foreground">{w.volume}</td>
                  <td className="p-2 text-muted-foreground">{w.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lm && (
          <p className="text-[10px] text-muted-foreground mt-2">
            <Calendar className="inline w-3 h-3 mr-1" />
            Landmarks {muscle} ({level}): MEV {lm.mev} / MAV {lm.mav} / MRV {lm.mrv} sets/sem.
          </p>
        )}
      </div>
    </div>
  );
}
