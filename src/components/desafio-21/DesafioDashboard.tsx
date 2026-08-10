import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import DesafioXPBar from "./DesafioXPBar";
import DesafioCalendar from "./DesafioCalendar";
import DesafioDayCard from "./DesafioDayCard";
import DesafioBadges from "./DesafioBadges";
import DesafioCompletion from "./DesafioCompletion";
import {
  BADGES, DesafioConfig, clearConfig, completeDay, getPlan, saveConfig,
} from "@/lib/desafio21";

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

interface Props {
  config: DesafioConfig;
  onChange: (cfg: DesafioConfig | null) => void;
}

export default function DesafioDashboard({ config, onChange }: Props) {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const plan = useMemo(() => getPlan(config), [config]);
  const today = plan.find((p) => p.day === config.currentDay) ?? plan[plan.length - 1];
  const finished = config.completedDays.length >= 21;

  const handleComplete = useCallback(
    (opts: { nutrition: boolean; photo: boolean }) => {
      const { next, newBadges } = completeDay(config, opts);
      saveConfig(next);
      onChange(next);
      if (newBadges.length) setUnlocked(newBadges);
      if (next.completedDays.length >= 21) setShowResult(true);
    },
    [config, onChange],
  );

  const reset = () => {
    clearConfig();
    onChange(null);
    navigate("/runon/desafio-21");
  };

  if (finished && showResult) {
    return (
      <div style={{ background: "#020205", minHeight: "100vh" }}>
        <DesafioCompletion cfg={config} onReset={reset} onViewProgress={() => setShowResult(false)} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#020205" }}>
      <div className="mx-auto px-4 pt-5 space-y-4" style={{ maxWidth: 560 }}>
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Voltar ao RunON" onClick={() => navigate("/runon")}
            className="flex items-center gap-1" style={mono(10, "#00D4FF", 2)}>
            <ChevronLeft style={{ width: 14, height: 14 }} /> RUNON
          </button>
          <span style={mono(10, "#5a6a79", 2)}>DESAFIO 21 DIAS</span>
        </div>

        <DesafioXPBar cfg={config} />
        <DesafioCalendar cfg={config} />
        <DesafioDayCard cfg={config} plan={today} onComplete={handleComplete} />
        <DesafioBadges earned={config.badges} />

        {finished && (
          <button
            type="button"
            aria-label="Ver card de resultado final"
            onClick={() => setShowResult(true)}
            className="w-full flex items-center justify-center gap-2"
            style={{ background: "#00D4FF", borderRadius: 8, padding: "14px 0", ...raj(17, 700, "#020205") }}
          >
            <Trophy style={{ width: 16, height: 16 }} /> VER MEU RESULTADO
          </button>
        )}
      </div>

      {unlocked.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" style={{ background: "rgba(2,2,5,0.9)" }}>
          <div className="relative text-center w-full" style={{
            maxWidth: 320, background: "rgba(0,212,255,0.06)",
            border: "1px solid rgba(0,212,255,0.3)", borderRadius: 12, padding: 26,
            boxShadow: "0 0 20px rgba(0,212,255,0.15)",
          }}>
            <button type="button" aria-label="Fechar" onClick={() => setUnlocked([])} className="absolute top-3 right-3">
              <X style={{ width: 16, height: 16, color: "#5a6a79" }} />
            </button>
            <Trophy style={{ width: 42, height: 42, color: "#00D4FF", margin: "0 auto" }} />
            <p style={{ ...mono(10, "#00FF88", 3), marginTop: 12 }}>BADGE DESBLOQUEADO</p>
            {unlocked.map((id) => {
              const b = BADGES.find((x) => x.id === id);
              return (
                <div key={id} style={{ marginTop: 10 }}>
                  <p style={raj(22, 700)}>{b?.name}</p>
                  <p style={mono(10, "#7a8a99", 0.5)}>{b?.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
