import { useState } from "react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

const LEVELS = [
  { id: 5, label: "Voando (muito leve)", emoji: "🚀", velocity: ">0.9 m/s", zone: "Velocidade", recommendation: "Reduzir carga ou aumentar reps. Não há estímulo de força/hipertrofia." },
  { id: 4, label: "Rápido (leve)", emoji: "⚡", velocity: "0.7-0.9 m/s", zone: "Potência", recommendation: "Ótimo para potência. Para hipertrofia, aumentar 5-10% da carga." },
  { id: 3, label: "Normal", emoji: "✅", velocity: "0.5-0.7 m/s", zone: "Hipertrofia", recommendation: "Zona ideal para hipertrofia. Manter carga." },
  { id: 2, label: "Pesado (devagar)", emoji: "🏋️", velocity: "0.3-0.5 m/s", zone: "Força máxima", recommendation: "Zona de força máxima. Para hipertrofia, reduzir 5-10%." },
  { id: 1, label: "Extremamente pesado", emoji: "🔴", velocity: "<0.3 m/s", zone: "Falha técnica próxima", recommendation: "Encerrar exercício. Risco de quebra técnica e lesão." },
];

export default function VelocityTracking() {
  const [perception, setPerception] = useState<number | null>(null);
  const [exercise, setExercise] = useState("Hack Squat");
  const selected = LEVELS.find((l) => l.id === perception);

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Velocity Based Training (VBT)</h3>
      </div>
      <p className="text-[11px] text-muted-foreground">Mapeie a velocidade percebida da barra para receber recomendação automática de carga.</p>

      <div>
        <label className="text-[10px] font-bold text-muted-foreground uppercase">Exercício</label>
        <input value={exercise} onChange={(e) => setExercise(e.target.value)} className="w-full mt-1 h-9 rounded-lg bg-background border border-border text-xs px-2 text-foreground" />
      </div>

      <div>
        <p className="text-xs font-bold text-foreground mb-2">Hoje o {exercise} pareceu...</p>
        <div className="grid grid-cols-1 gap-2">
          {LEVELS.map((l) => {
            const active = perception === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setPerception(l.id)}
                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition ${
                  active ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/30"
                }`}
              >
                <span className="text-xl">{l.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{l.label}</p>
                  <p className="text-[10px] text-muted-foreground">{l.velocity} → {l.zone}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-1">
            {selected.id >= 4 ? <TrendingDown className="w-4 h-4 text-amber-500" /> : <TrendingUp className="w-4 h-4 text-primary" />}
            <p className="text-xs font-black text-primary">Recomendação automática</p>
          </div>
          <p className="text-xs text-foreground">{selected.recommendation}</p>
        </div>
      )}
    </div>
  );
}
