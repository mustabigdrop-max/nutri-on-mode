import { Zap, Dumbbell, Footprints, Flame } from "lucide-react";
import { DesafioConfig, getStats } from "@/lib/desafio21";

const CY = "#00D4FF";
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.1,
});
const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});

export default function DesafioXPBar({ cfg }: { cfg: DesafioConfig }) {
  const stats = getStats(cfg);
  return (
    <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 16 }}>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p style={mono(10, "#5a6a79", 2)}>PROGRESSO</p>
          <p style={raj(32, 700)}>
            DIA {cfg.currentDay} <span style={raj(18, 400, "#5a6a79")}>de 21</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="desafio-flame" style={{ width: 16, height: 16, color: "#FFB800" }} />
          <span style={mono(12, "#FFB800", 1)}>Streak: {cfg.streak}d</span>
        </div>
      </div>

      <div style={{ height: 10, borderRadius: 6, background: "#0d1a24", overflow: "hidden" }}>
        <div
          style={{
            width: `${stats.progress}%`, height: "100%",
            background: "linear-gradient(90deg,#00D4FF,#00FF88)",
            transition: "width .4s ease",
          }}
        />
      </div>
      <p style={{ ...mono(10, "#5a6a79", 1), marginTop: 6, textAlign: "right" }}>{stats.progress}%</p>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { icon: Zap, label: "XP", value: cfg.totalXP.toLocaleString("pt-BR"), color: CY },
          { icon: Dumbbell, label: "TREINOS", value: String(stats.gym), color: CY },
          { icon: Footprints, label: "CORRIDAS", value: String(stats.runs), color: "#00FF88" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2"
            style={{ background: "#060a0f", border: "1px solid #12222c", borderRadius: 8, padding: 10 }}>
            <s.icon style={{ width: 14, height: 14, color: s.color }} />
            <div className="min-w-0">
              <p style={mono(13, "#F5F0E8", 0)}>{s.value}</p>
              <p style={mono(8, "#5a6a79", 1.5)}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
