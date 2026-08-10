import { useState } from "react";
import { Dumbbell, Footprints, Moon, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DesafioConfig, DAY_TYPE_META, getPlan, getMissedDays, workoutFor, computeNutrition } from "@/lib/desafio21";

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

export default function DesafioCalendar({ cfg }: { cfg: DesafioConfig }) {
  const plan = getPlan(cfg);
  const missed = getMissedDays(cfg);
  const [openDay, setOpenDay] = useState<number | null>(null);

  const detail = openDay ? plan.find((p) => p.day === openDay) : null;
  const nut = detail ? computeNutrition(cfg.goal, detail.type) : null;

  return (
    <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 16 }}>
      <p style={{ ...mono(10, "#5a6a79", 2), marginBottom: 12 }}>CALENDÁRIO — 21 DIAS</p>

      <div className="space-y-2">
        {[0, 1, 2].map((w) => (
          <div key={w} className="flex items-center gap-2">
            <span style={{ ...mono(8, "#3f5260", 1), width: 26 }}>S{w + 1}</span>
            <div className="grid grid-cols-7 gap-1.5 flex-1">
              {plan.slice(w * 7, w * 7 + 7).map((d) => {
                const done = cfg.completedDays.includes(d.day);
                const isToday = d.day === cfg.currentDay;
                const isMissed = missed.includes(d.day);
                const color = DAY_TYPE_META[d.type].color;
                const Icon = d.type.startsWith("musculacao") ? Dumbbell : d.type.startsWith("corrida") ? Footprints : Moon;
                return (
                  <button
                    key={d.day}
                    type="button"
                    aria-label={`Dia ${d.day} — ${d.label}`}
                    onClick={() => setOpenDay(d.day)}
                    className={`flex items-center justify-center aspect-square ${isToday ? "animate-pulse" : ""}`}
                    style={{
                      borderRadius: 999,
                      background: done ? color : isToday ? "rgba(0,212,255,0.12)" : "transparent",
                      border: `1.5px solid ${done ? color : isMissed ? "#FF4444" : isToday ? "#00D4FF" : "#1a2a3a"}`,
                    }}
                  >
                    {done ? (
                      <Icon style={{ width: 13, height: 13, color: "#020205" }} />
                    ) : isMissed ? (
                      <X style={{ width: 12, height: 12, color: "#FF4444" }} />
                    ) : (
                      <span style={mono(9, isToday ? "#00D4FF" : "#33475a", 0)}>{d.day}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {[
          ["#00D4FF", "Musculação"], ["#00FF88", "Corrida"], ["#FFB800", "Descanso"], ["#FF4444", "Perdido"],
        ].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: 999, background: c, display: "inline-block" }} />
            <span style={mono(8, "#5a6a79", 1)}>{l}</span>
          </span>
        ))}
      </div>

      <Sheet open={openDay !== null} onOpenChange={(o) => !o && setOpenDay(null)}>
        <SheetContent side="bottom" style={{ background: "#050a10", borderTop: "1px solid rgba(0,212,255,0.2)" }}>
          {detail && nut && (
            <>
              <SheetHeader>
                <SheetTitle style={raj(22, 700)}>
                  DIA {detail.day} — {detail.label}
                </SheetTitle>
              </SheetHeader>
              <p style={{ ...mono(10, DAY_TYPE_META[detail.type].color, 2), marginTop: 4 }}>
                {DAY_TYPE_META[detail.type].label}
              </p>
              <ul className="mt-4 space-y-1.5">
                {workoutFor(detail).map((x) => (
                  <li key={x} style={raj(16, 500, "#c9d6df")}>• {x}</li>
                ))}
              </ul>
              <p style={{ ...mono(11, "#7a8a99", 1), marginTop: 14 }}>
                {nut.kcal} kcal · P {nut.protein}g · C {nut.carb}g · G {nut.fat}g
              </p>
              <p style={{ ...mono(10, "#5a6a79", 1), marginTop: 8, marginBottom: 16 }}>
                {cfg.completedDays.includes(detail.day) ? "Concluído ✅" : "Ainda não concluído"}
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
