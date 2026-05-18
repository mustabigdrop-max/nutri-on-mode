// APEX Visual — Fenner Clinical Score gauge
import { useMemo } from "react";
import { Activity } from "lucide-react";
import { computeFennerScore, topDeficits, type ClinicalTestsState } from "@/data/fennerTests";

interface Props {
  state: ClinicalTestsState;
}

export function ApexFennerGauge({ state }: Props) {
  const fs = useMemo(() => computeFennerScore(state), [state]);
  const deficits = useMemo(() => topDeficits(state), [state]);
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const dash = (fs.total / 100) * circ;
  const priority = fs.total <= 40 ? "Fase 1 — Inibir/Liberar" : fs.total <= 65 ? "Fase 2 — Alongar/Mobilizar" : "Fase 3 — Ativar/Integrar";

  return (
    <div className="border border-primary/30 bg-primary/5 rounded-none p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={14} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Fenner Clinical Score (FCS)
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-5">
        <div className="relative" style={{ width: 140, height: 140 }}>
          <svg viewBox="0 0 140 140" width={140} height={140}>
            <circle cx={70} cy={70} r={radius} fill="none" stroke="#1E2A42" strokeWidth={10} />
            <circle
              cx={70} cy={70} r={radius} fill="none"
              stroke={fs.color} strokeWidth={10} strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.3s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold" style={{ color: fs.color, fontFamily: "'Rajdhani','Syne',sans-serif" }}>
              {fs.total}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">/100</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: fs.color }}>
              {fs.tier}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Component label="Flexibilidade" value={fs.components.flexibility} max={100} />
            <Component label="Força MRC" value={fs.components.strength} max={100} />
            <Component label="Dinâmica" value={fs.components.dynamic} max={100} />
          </div>

          <div className="text-[11px] border-t border-border pt-2">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">
              Pontos mais críticos
            </div>
            {deficits.length === 0 ? (
              <div className="text-muted-foreground italic">Sem déficits relevantes registrados.</div>
            ) : (
              <ul className="space-y-0.5">
                {deficits.map((d, i) => (
                  <li key={i} className="text-foreground/85">• {d}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="text-[11px] flex items-center gap-2 pt-1">
            <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Prioridade</span>
            <span className="font-semibold" style={{ color: fs.color }}>{priority}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Component({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="border border-border bg-background/40 p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-bold text-foreground font-mono">{value}</div>
      <div className="h-1 bg-border mt-1">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default ApexFennerGauge;
