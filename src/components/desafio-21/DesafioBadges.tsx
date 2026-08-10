import { Footprints, Zap, Shield, Flame, Trophy, Utensils, CheckCircle, Lock } from "lucide-react";
import { BADGES } from "@/lib/desafio21";

const ICONS: Record<string, any> = { Footprints, Zap, Shield, Flame, Trophy, Utensils, CheckCircle };

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

export default function DesafioBadges({ earned }: { earned: string[] }) {
  return (
    <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 16 }}>
      <p style={{ ...mono(10, "#5a6a79", 2), marginBottom: 12 }}>
        BADGES — {earned.length}/{BADGES.length}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {BADGES.map((b) => {
          const has = earned.includes(b.id);
          const Icon = has ? ICONS[b.icon] ?? Trophy : Lock;
          return (
            <div
              key={b.id}
              className="flex items-center gap-2.5"
              style={{
                background: has ? "rgba(0,212,255,0.06)" : "#04080c",
                border: `1px solid ${has ? "rgba(0,212,255,0.3)" : "#12222c"}`,
                borderRadius: 12, padding: 12, opacity: has ? 1 : 0.45,
                boxShadow: has ? "0 0 20px rgba(0,212,255,0.15)" : "none",
              }}
            >
              <Icon style={{ width: 18, height: 18, color: has ? "#00D4FF" : "#333", flexShrink: 0 }} />
              <div className="min-w-0">
                <p style={raj(15, 700, has ? "#F5F0E8" : "#5a6a79")}>{has ? b.name : "???"}</p>
                <p style={mono(8, "#5a6a79", 0.5)}>{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
