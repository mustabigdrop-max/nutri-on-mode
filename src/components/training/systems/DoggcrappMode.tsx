import { useState, useEffect, useRef } from "react";
import { Dog, Play, Pause, RotateCcw } from "lucide-react";

const STRETCHES: Record<string, string> = {
  Peitoral: "Decúbito dorsal segurando halteres pesados, cotovelos abertos a 90°.",
  Costas: "Pendurado em barra com peso preso na cintura. Foco em retração escapular.",
  Bíceps: "Sentado, halter atrás, antebraço supinado, mantendo extensão.",
  Tríceps: "Halter atrás da cabeça com cotovelo fechado, alongamento completo.",
  Quadríceps: "Lunge profunda com pé traseiro elevado e tronco vertical.",
  Posterior: "Stiff em deficit segurando halter pesado por 60s na descida.",
  Ombro: "Bracejada cruzada com peso, alongando posterior por 60s.",
};

export default function DoggcrappMode() {
  const [muscle, setMuscle] = useState("Peitoral");
  const [exercises, setExercises] = useState<string[]>(["Supino reto barra", "Supino inclinado halter", "Crossover polia alta"]);
  const [rotationIdx, setRotationIdx] = useState(0);
  const [stretchTimer, setStretchTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setStretchTimer((t) => t + 1), 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [running]);

  const min = String(Math.floor(stretchTimer / 60)).padStart(2, "0");
  const sec = String(stretchTimer % 60).padStart(2, "0");

  const currentEx = exercises[rotationIdx % exercises.length];

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <Dog className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Doggcrapp (DC) Mode</h3>
      </div>
      <p className="text-[11px] text-muted-foreground">1 set até falha + Rest-pause (2 mini-sets, 10-15 respirações) + Extreme stretching.</p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Grupo</label>
          <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className="w-full mt-1 h-9 rounded-lg bg-background border border-border text-xs px-2">
            {Object.keys(STRETCHES).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Sessão #</label>
          <Input value={rotationIdx + 1} disabled />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-muted-foreground uppercase">Banco de exercícios (rotação automática)</label>
        <div className="mt-1 space-y-1">
          {exercises.map((ex, i) => (
            <div key={i} className={`p-2 rounded-md text-xs ${i === rotationIdx % exercises.length ? "bg-primary/10 border border-primary/40 text-primary font-bold" : "bg-muted/30 text-muted-foreground"}`}>
              {i + 1}. {ex} {i === rotationIdx % exercises.length && "← HOJE"}
            </div>
          ))}
        </div>
        <button onClick={() => setRotationIdx((r) => r + 1)} className="mt-2 text-[11px] px-3 py-1 rounded-md bg-primary/20 text-primary font-bold">Rotacionar →</button>
      </div>

      <div className="p-3 rounded-lg bg-primary/5 border border-primary/30">
        <p className="text-xs font-black text-primary">Protocolo do dia — {currentEx}</p>
        <ol className="text-[11px] text-foreground/90 mt-2 space-y-1 list-decimal list-inside">
          <li>Set 1: até falha técnica (6-12 reps)</li>
          <li>Repouse 10-15 respirações profundas</li>
          <li>Set 2 (rest-pause): mesmo peso até falha</li>
          <li>Repouse 10-15 respirações</li>
          <li>Set 3 (rest-pause): mesmo peso até falha</li>
        </ol>
      </div>

      {/* Stretching timer */}
      <div className="p-3 rounded-lg bg-card border border-border">
        <p className="text-xs font-bold text-foreground">Extreme Stretching — {muscle}</p>
        <p className="text-[10px] text-muted-foreground mb-2">{STRETCHES[muscle]}</p>
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-black text-primary tabular-nums">{min}:{sec}</div>
          <div className="flex gap-2">
            <button onClick={() => setRunning((r) => !r)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
              {running ? <><Pause className="w-3 h-3" /> Pausar</> : <><Play className="w-3 h-3" /> Iniciar</>}
            </button>
            <button onClick={() => { setRunning(false); setStretchTimer(0); }} className="px-3 py-1.5 rounded-md bg-muted text-foreground text-xs font-bold flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Alvo: 3-5 minutos por grupo.</p>
      </div>
    </div>
  );
}

function Input({ value, disabled }: { value: any; disabled?: boolean }) {
  return <input value={value} disabled={disabled} className="w-full mt-1 h-9 rounded-lg bg-muted border border-border text-xs px-2 text-foreground" />;
}
