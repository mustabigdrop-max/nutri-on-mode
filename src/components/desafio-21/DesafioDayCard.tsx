import { useState } from "react";
import { CheckCircle2, Dumbbell, Footprints, Moon, Camera, Utensils } from "lucide-react";
import DesafioNutrition from "./DesafioNutrition";
import { DAY_TYPE_META, DayPlan, DesafioConfig, workoutFor } from "@/lib/desafio21";

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

interface Props {
  cfg: DesafioConfig;
  plan: DayPlan;
  onComplete: (opts: { nutrition: boolean; photo: boolean }) => void;
}

export default function DesafioDayCard({ cfg, plan, onComplete }: Props) {
  const [nutrition, setNutrition] = useState(false);
  const [photo, setPhoto] = useState(false);
  const done = cfg.completedDays.includes(plan.day);
  const meta = DAY_TYPE_META[plan.type];
  const Icon = plan.type.startsWith("musculacao") ? Dumbbell : plan.type.startsWith("corrida") ? Footprints : Moon;

  const Toggle = ({ active, onClick, icon: I, label, xp }: any) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="flex items-center gap-2 flex-1"
      style={{
        background: active ? "rgba(0,212,255,0.1)" : "#04080c",
        border: `1px solid ${active ? "#00D4FF" : "#12222c"}`,
        borderRadius: 8, padding: "10px 12px",
      }}
    >
      <I style={{ width: 13, height: 13, color: active ? "#00D4FF" : "#5a6a79" }} />
      <span style={mono(9, active ? "#00D4FF" : "#5a6a79", 1)}>{label}</span>
      <span style={{ ...mono(9, "#3f5260", 0), marginLeft: "auto" }}>+{xp}</span>
    </button>
  );

  return (
    <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 16, boxShadow: "0 0 20px rgba(0,212,255,0.15)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span style={mono(10, "#5a6a79", 2)}>HOJE — DIA {plan.day}</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Icon style={{ width: 16, height: 16, color: meta.color }} />
        <span style={raj(20, 700, meta.color)}>{meta.label}</span>
      </div>
      <p style={{ ...raj(17, 600, "#c9d6df"), marginBottom: 12 }}>{plan.label}</p>

      <div style={{ background: "#060a0f", border: "1px solid #12222c", borderRadius: 12, padding: 14, marginBottom: 10 }}>
        <p style={{ ...mono(10, "#00D4FF", 2), marginBottom: 8 }}>TREINO</p>
        <ul className="space-y-1.5">
          {workoutFor(plan).map((x) => (
            <li key={x} style={raj(16, 500, "#c9d6df")}>• {x}</li>
          ))}
        </ul>
      </div>

      <DesafioNutrition goal={cfg.goal} type={plan.type} />

      {!done && (
        <>
          <div className="flex gap-2 mt-3">
            <Toggle active={nutrition} onClick={() => setNutrition((v) => !v)} icon={Utensils} label="NUTRIÇÃO" xp={30} />
            <Toggle active={photo} onClick={() => setPhoto((v) => !v)} icon={Camera} label="FOTO" xp={40} />
          </div>

          <button
            type="button"
            aria-label="Completar o dia de hoje"
            onClick={() => onComplete({ nutrition, photo })}
            className="w-full flex items-center justify-center gap-2 mt-3 transition-transform active:scale-[0.98]"
            style={{ background: "#00D4FF", borderRadius: 8, padding: "14px 0", ...raj(18, 700, "#020205") }}
          >
            <CheckCircle2 style={{ width: 17, height: 17 }} /> COMPLETAR DIA
          </button>
        </>
      )}

      {done && (
        <p className="flex items-center justify-center gap-2 mt-4" style={mono(11, "#00FF88", 1)}>
          <CheckCircle2 style={{ width: 14, height: 14 }} /> DIA CONCLUÍDO
        </p>
      )}
    </div>
  );
}
