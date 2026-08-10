import { useState } from "react";
import {
  Footprints, Rabbit, Timer, Zap, Dumbbell, Flame, Repeat, Medal, Gauge,
  Check, ChevronLeft, ChevronRight, Calendar, Moon,
} from "lucide-react";
import {
  DaysPerWeek, DesafioConfig, DISTRIBUTION, Goal, GymLevel, RunLevel, TEMPLATES, createConfig,
} from "@/lib/desafio21";

const CY = "#00D4FF";

const RUN_OPTS: { id: RunLevel; label: string; icon: any }[] = [
  { id: "never", label: "Nunca corri", icon: Footprints },
  { id: "sometimes", label: "Corro às vezes", icon: Rabbit },
  { id: "regular", label: "Corro 2-3x por semana", icon: Timer },
  { id: "frequent", label: "Corro 4+ vezes", icon: Zap },
];

const GYM_OPTS: { id: GymLevel; label: string; icon: any }[] = [
  { id: "beginner", label: "Menos de 6 meses", icon: Dumbbell },
  { id: "intermediate", label: "6 meses a 2 anos", icon: Dumbbell },
  { id: "advanced", label: "2 a 5 anos", icon: Dumbbell },
  { id: "elite", label: "5+ anos", icon: Dumbbell },
];

const GOAL_OPTS: { id: Goal; title: string; desc: string; icon: any }[] = [
  { id: "cut", title: "Queimar gordura sem perder massa", desc: "Cutting inteligente", icon: Flame },
  { id: "transition", title: "Manter ganhos e adicionar cardio", desc: "Transição híbrida", icon: Repeat },
  { id: "race", title: "Preparar para uma corrida sem largar o ferro", desc: "Race Ready", icon: Medal },
  { id: "conditioning", title: "Melhorar condicionamento geral", desc: "Motor completo", icon: Gauge },
];

const raj = (size: number, weight = 700, color = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: size, fontWeight: weight, color, lineHeight: 1.15,
});
const mono = (size: number, color: string, spacing = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: size, color, letterSpacing: `${spacing}px`,
});

function OptionCard({
  active, onClick, icon: Icon, title, desc, ariaLabel,
}: { active: boolean; onClick: () => void; icon: any; title: string; desc?: string; ariaLabel: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 transition-all"
      style={{
        background: active ? "rgba(0,212,255,0.08)" : "rgba(0,212,255,0.03)",
        border: `1px solid ${active ? CY : "rgba(0,212,255,0.15)"}`,
        borderRadius: 12,
        padding: 14,
        boxShadow: active ? "0 0 20px rgba(0,212,255,0.15)" : "none",
      }}
    >
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(0,212,255,0.08)", border: `1px solid ${CY}33` }}
      >
        <Icon style={{ width: 18, height: 18, color: CY }} />
      </span>
      <span className="flex-1 min-w-0">
        <span style={{ ...raj(17, 700), display: "block" }}>{title}</span>
        {desc && <span style={{ ...mono(10, "#7a8a99"), display: "block", marginTop: 2 }}>{desc}</span>}
      </span>
      {active && (
        <span
          className="flex items-center justify-center shrink-0 animate-in zoom-in duration-200"
          style={{ width: 22, height: 22, borderRadius: 999, background: CY }}
        >
          <Check style={{ width: 13, height: 13, color: "#020205" }} />
        </span>
      )}
    </button>
  );
}

interface Props {
  onCancel: () => void;
  onComplete: (cfg: DesafioConfig) => void;
}

export default function DesafioWizard({ onCancel, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [runLevel, setRunLevel] = useState<RunLevel | null>(null);
  const [gymLevel, setGymLevel] = useState<GymLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [days, setDays] = useState<DaysPerWeek>(5);

  const canNext =
    (step === 0 && runLevel && gymLevel) ||
    (step === 1 && goal) ||
    step === 2 ||
    step === 3;

  const week1 = TEMPLATES[days].slice(0, 7);

  const iconForType = (t: string) =>
    t.startsWith("musculacao") ? Dumbbell : t.startsWith("corrida") ? Footprints : Moon;
  const colorForType = (t: string) =>
    t.startsWith("musculacao") ? CY : t.startsWith("corrida") ? "#00FF88" : "#FFB800";

  const finish = () => {
    if (!runLevel || !gymLevel || !goal) return;
    onComplete(createConfig({ runLevel, gymLevel, goal, daysPerWeek: days }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#020205" }}>
      <div className="mx-auto px-4 py-6" style={{ maxWidth: 560 }}>
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => (step === 0 ? onCancel() : setStep((s) => s - 1))}
            className="flex items-center gap-1"
            style={{ ...mono(10, CY, 2) }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} /> VOLTAR
          </button>
          <span style={mono(10, "#5a6a79", 2)}>ETAPA {step + 1}/4</span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? CY : "#1a2a3a" }} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h2 style={raj(26, 700)}>Qual é seu nível hoje?</h2>
            <p style={mono(11, CY, 2)}>CORRIDA</p>
            <div className="space-y-2">
              {RUN_OPTS.map((o) => (
                <OptionCard key={o.id} active={runLevel === o.id} onClick={() => setRunLevel(o.id)}
                  icon={o.icon} title={o.label} ariaLabel={`Nível de corrida: ${o.label}`} />
              ))}
            </div>
            <p style={{ ...mono(11, CY, 2), marginTop: 18 }}>MUSCULAÇÃO</p>
            <div className="space-y-2">
              {GYM_OPTS.map((o) => (
                <OptionCard key={o.id} active={gymLevel === o.id} onClick={() => setGymLevel(o.id)}
                  icon={o.icon} title={o.label} ariaLabel={`Nível de musculação: ${o.label}`} />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 style={raj(26, 700)}>O que você quer conquistar nesses 21 dias?</h2>
            {GOAL_OPTS.map((o) => (
              <OptionCard key={o.id} active={goal === o.id} onClick={() => setGoal(o.id)}
                icon={o.icon} title={o.title} desc={o.desc} ariaLabel={`Objetivo: ${o.title}`} />
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 style={raj(26, 700)}>Quantos dias por semana você treina?</h2>
            <div
              className="text-center"
              style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 18 }}
            >
              <p style={raj(44, 700, CY)}>{days}</p>
              <p style={mono(11, "#7a8a99", 2)}>DIAS / SEMANA</p>
              <input
                type="range" min={3} max={6} step={1} value={days}
                aria-label="Dias de treino por semana"
                onChange={(e) => setDays(Number(e.target.value) as DaysPerWeek)}
                className="w-full mt-4"
                style={{ accentColor: CY }}
              />
              <p style={{ ...mono(11, "#00FF88", 1), marginTop: 10 }}>{DISTRIBUTION[days]}</p>
            </div>

            <div>
              <p style={{ ...mono(10, "#5a6a79", 2), marginBottom: 8 }}>PREVIEW — SEMANA 1</p>
              <div className="grid grid-cols-7 gap-1.5">
                {week1.map((d) => {
                  const Icon = iconForType(d.type);
                  const c = colorForType(d.type);
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-1"
                      style={{ background: `${c}0d`, border: `1px solid ${c}33`, borderRadius: 8, padding: "8px 2px" }}>
                      <Icon style={{ width: 14, height: 14, color: c }} />
                      <span style={mono(8, "#5a6a79", 0)}>D{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 style={raj(26, 700)}>Seu Desafio está pronto.</h2>
            <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 12, padding: 16 }}>
              {[
                ["CORRIDA", RUN_OPTS.find((o) => o.id === runLevel)?.label ?? "—"],
                ["MUSCULAÇÃO", GYM_OPTS.find((o) => o.id === gymLevel)?.label ?? "—"],
                ["OBJETIVO", GOAL_OPTS.find((o) => o.id === goal)?.title ?? "—"],
                ["FREQUÊNCIA", `${days} dias/semana · ${DISTRIBUTION[days]}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: "1px solid #0f1a24" }}>
                  <span style={mono(10, "#5a6a79", 2)}>{k}</span>
                  <span style={{ ...raj(15, 600), textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ ...raj(18, 500, CY), fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
              "21 dias. Sem desculpa. Sem meio termo. Você vai provar que dá pra correr E construir."
            </p>
            <div className="flex items-center justify-center gap-2" style={mono(10, "#5a6a79", 2)}>
              <Calendar style={{ width: 13, height: 13 }} /> INÍCIO HOJE
            </div>
          </div>
        )}

        <div className="mt-8 pb-10">
          {step < 3 ? (
            <button
              type="button"
              aria-label="Avançar etapa"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="w-full flex items-center justify-center gap-2"
              style={{
                background: canNext ? CY : "#12222c", color: canNext ? "#020205" : "#44555f",
                borderRadius: 8, padding: "14px 0", ...raj(17, 700, canNext ? "#020205" : "#44555f"),
              }}
            >
              CONTINUAR <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Ativar desafio de 21 dias"
              onClick={finish}
              className="w-full"
              style={{
                background: CY, borderRadius: 8, padding: "16px 0",
                boxShadow: "0 0 20px rgba(0,212,255,0.25)", ...raj(19, 700, "#020205"),
              }}
            >
              ATIVAR DESAFIO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
