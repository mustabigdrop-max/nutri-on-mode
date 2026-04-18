import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, BookOpen, Zap, Target, TrendingUp,
  FlaskConical, Dumbbell, Crown, Shield, Microscope, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  STRATUM_MODULES, STRATUM_PILLARS, STRATUM_PROGRESSION_RULES, STRATUM_FULL_REFERENCES,
  type StratumLevel, type StratumModule,
} from "@/data/stratumData";

const BG = "#060a06";
const SURFACE = "#0c120c";
const SURFACE2 = "#111a11";
const BORDER = "rgba(74,222,128,0.1)";
const BORDER_ACTIVE = "rgba(74,222,128,0.35)";
const GREEN = "#4ade80";
const GREEN_DIM = "rgba(74,222,128,0.08)";
const TEXT = "#f0fdf4";
const TEXT_DIM = "#94a3b8";
const TEXT_MUTED = "#64748b";
const FONT = "'Space Grotesk', sans-serif";

interface Props {
  onApplyToTraining?: (payload: { module: StratumModule; level: StratumLevel }) => void;
}

const LEVEL_LABELS: Record<StratumLevel, string> = {
  intermediario: "Intermediário",
  avancado: "Avançado",
  elite: "Elite",
};

const LEVEL_ICONS: Record<StratumLevel, any> = {
  intermediario: Dumbbell,
  avancado: TrendingUp,
  elite: Crown,
};

export default function StratumModule({ onApplyToTraining }: Props) {
  const [activeModuleId, setActiveModuleId] = useState<string>(STRATUM_MODULES[0].id);
  const [activeLevel, setActiveLevel] = useState<StratumLevel>("intermediario");
  const [showPillars, setShowPillars] = useState(false);
  const [showRefs, setShowRefs] = useState(false);

  const activeModule = useMemo(
    () => STRATUM_MODULES.find((m) => m.id === activeModuleId)!,
    [activeModuleId]
  );

  const availableLevels = useMemo(() => {
    const levels = new Set(activeModule.phases.map((p) => p.level));
    return (["intermediario", "avancado", "elite"] as StratumLevel[]).filter((l) => levels.has(l));
  }, [activeModule]);

  const visiblePhases = useMemo(
    () => activeModule.phases.filter((p) => p.level === activeLevel),
    [activeModule, activeLevel]
  );

  // Garantir que o nível ativo é válido para o módulo
  if (!availableLevels.includes(activeLevel) && availableLevels.length > 0) {
    setActiveLevel(availableLevels[0]);
  }

  return (
    <div className="space-y-3 mt-3" style={{ fontFamily: FONT }}>
      {/* Header STRATUM */}
      <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${SURFACE} 0%, ${SURFACE2} 100%)`, border: `1px solid ${BORDER_ACTIVE}` }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GREEN_DIM, border: `1px solid ${BORDER_ACTIVE}` }}>
            <FlaskConical className="w-5 h-5" style={{ color: GREEN }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-black tracking-tight" style={{ color: TEXT }}>STRATUM</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER_ACTIVE}` }}>
                ADMIN UPSELL
              </span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: TEXT_DIM }}>
              Sistema científico de protocolos baseado em <span style={{ color: GREEN }}>EMG validado</span>, MEV/MAV/MRV e literatura peer-reviewed.
            </p>
          </div>
        </div>

        {/* Pilares colapsáveis */}
        <button
          onClick={() => setShowPillars((v) => !v)}
          className="w-full mt-3 flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT_DIM }}
        >
          <span className="flex items-center gap-2"><Microscope className="w-3.5 h-3.5" style={{ color: GREEN }} />5 Pilares Científicos</span>
          {showPillars ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {showPillars && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-2 mt-2">
                {STRATUM_PILLARS.map((p, i) => (
                  <div key={p.id} className="p-3 rounded-lg" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: GREEN_DIM, color: GREEN }}>0{i + 1}</span>
                      <div className="flex-1">
                        <div className="text-[12px] font-bold mb-1" style={{ color: TEXT }}>{p.title}</div>
                        <p className="text-[10px] leading-relaxed mb-1" style={{ color: TEXT_DIM }}>{p.summary}</p>
                        <p className="text-[9px] italic" style={{ color: TEXT_MUTED }}>{p.ref}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Seletor de módulos */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
        {STRATUM_MODULES.map((m) => {
          const active = m.id === activeModuleId;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModuleId(m.id)}
              className="p-2.5 rounded-xl transition-all flex flex-col items-center gap-1"
              style={{
                background: active ? GREEN_DIM : SURFACE,
                border: `1px solid ${active ? BORDER_ACTIVE : BORDER}`,
              }}
            >
              <span className="text-base">{m.emoji}</span>
              <span className="text-[10px] font-bold" style={{ color: active ? GREEN : TEXT_DIM }}>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo do módulo */}
      <div className="rounded-2xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{activeModule.emoji}</span>
          <div className="flex-1">
            <h3 className="text-sm font-black" style={{ color: TEXT }}>STRATUM | {activeModule.name.toUpperCase()}</h3>
            <p className="text-[11px] italic mt-0.5" style={{ color: GREEN }}>"{activeModule.tagline}"</p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed mb-3 p-2.5 rounded-lg" style={{ background: SURFACE2, color: TEXT_DIM, border: `1px solid ${BORDER}` }}>
          <span className="font-bold" style={{ color: GREEN }}>Base científica: </span>{activeModule.scientificBase}
        </p>

        {/* Volume Landmarks + EMG */}
        {(activeModule.volumeLandmarks || activeModule.emgRanking) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {activeModule.volumeLandmarks && (
              <div className="p-2.5 rounded-lg" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
                <div className="text-[10px] font-bold mb-1.5 flex items-center gap-1" style={{ color: GREEN }}>
                  <Target className="w-3 h-3" />VOLUME LANDMARKS
                </div>
                <div className="space-y-1">
                  {activeModule.volumeLandmarks.map((vl) => (
                    <div key={vl.metric} className="flex justify-between text-[10px]">
                      <span style={{ color: TEXT_MUTED }}>{vl.metric}</span>
                      <span className="font-bold" style={{ color: TEXT }}>{vl.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeModule.emgRanking && (
              <div className="p-2.5 rounded-lg" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
                <div className="text-[10px] font-bold mb-1.5 flex items-center gap-1" style={{ color: GREEN }}>
                  <Zap className="w-3 h-3" />EMG RANKING
                </div>
                <div className="space-y-1">
                  {activeModule.emgRanking.map((e, i) => (
                    <div key={i} className="text-[10px]">
                      <div className="font-bold" style={{ color: TEXT }}>{i + 1}. {e.exercise}</div>
                      <div style={{ color: TEXT_MUTED }}>{e.activation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtro de nível */}
        <div className="flex gap-1.5 mb-3">
          {availableLevels.map((lvl) => {
            const Icon = LEVEL_ICONS[lvl];
            const active = lvl === activeLevel;
            return (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: active ? GREEN_DIM : SURFACE2,
                  border: `1px solid ${active ? BORDER_ACTIVE : BORDER}`,
                  color: active ? GREEN : TEXT_DIM,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {LEVEL_LABELS[lvl]}
              </button>
            );
          })}
        </div>

        {/* Fases / Protocolos */}
        <div className="space-y-3">
          {visiblePhases.map((phase, pi) => (
            <div key={pi} className="rounded-xl p-3" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5" style={{ color: GREEN }} />
                <h4 className="text-[12px] font-black" style={{ color: TEXT }}>{phase.title}</h4>
              </div>
              {phase.subtitle && <p className="text-[10px] mb-2" style={{ color: TEXT_DIM }}>{phase.subtitle}</p>}
              {phase.notes && (
                <p className="text-[10px] mb-2 p-2 rounded" style={{ background: GREEN_DIM, color: GREEN, border: `1px solid ${BORDER_ACTIVE}` }}>
                  ⚡ {phase.notes}
                </p>
              )}

              {phase.warmup && (
                <div className="mb-2 p-2 rounded" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                  <div className="text-[9px] font-bold mb-1" style={{ color: TEXT_MUTED }}>AQUECIMENTO</div>
                  <ul className="text-[10px] space-y-0.5" style={{ color: TEXT_DIM }}>
                    {phase.warmup.map((w, i) => <li key={i}>• {w}</li>)}
                  </ul>
                </div>
              )}

              {phase.blocks.map((block, bi) => (
                <div key={bi} className="mb-2 last:mb-0">
                  <div className="text-[10px] font-bold mb-1.5" style={{ color: GREEN }}>{block.label}</div>
                  <div className="space-y-1.5">
                    {block.exercises.map((ex, ei) => (
                      <div key={ei} className="p-2 rounded-lg" style={{ background: BG, border: `1px solid ${ex.superset ? BORDER_ACTIVE : BORDER}` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 text-[11px] font-bold" style={{ color: TEXT }}>
                            {ex.superset && <span className="text-[8px] mr-1 px-1 py-0.5 rounded" style={{ background: GREEN_DIM, color: GREEN }}>SS</span>}
                            {ex.name}
                          </div>
                          <div className="flex gap-1.5 text-[10px] font-mono shrink-0">
                            <span style={{ color: GREEN }}>{ex.sets}</span>
                            <span style={{ color: TEXT_MUTED }}>×</span>
                            <span style={{ color: TEXT }}>{ex.reps}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {ex.rpe && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: SURFACE2, color: TEXT_DIM }}>RPE {ex.rpe}</span>}
                          {ex.rest && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: SURFACE2, color: TEXT_DIM }}>Rest {ex.rest}</span>}
                          {ex.cadence && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: SURFACE2, color: TEXT_DIM }}>Cad {ex.cadence}</span>}
                        </div>
                        {ex.cue && <p className="text-[10px] italic mt-1" style={{ color: TEXT_DIM }}>💬 {ex.cue}</p>}
                        {ex.ref && <p className="text-[9px] mt-1" style={{ color: TEXT_MUTED }}>📚 {ex.ref}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Progressão */}
        {activeModule.progression && (
          <div className="mt-3 rounded-xl p-3" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <div className="text-[11px] font-bold mb-2 flex items-center gap-1.5" style={{ color: GREEN }}>
              <TrendingUp className="w-3.5 h-3.5" />PROGRESSÃO SEMANAL
            </div>
            <ul className="text-[10px] space-y-1" style={{ color: TEXT_DIM }}>
              {activeModule.progression.map((p, i) => <li key={i}>→ {p}</li>)}
            </ul>
          </div>
        )}

        {/* Referências colapsáveis */}
        <button
          onClick={() => setShowRefs((v) => !v)}
          className="w-full mt-3 flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT_DIM }}
        >
          <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" style={{ color: GREEN }} />Referências ({activeModule.references.length})</span>
          {showRefs ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {showRefs && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-1.5 mt-2">
                {activeModule.references.map((r, i) => (
                  <div key={i} className="p-2 rounded-lg text-[10px]" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
                    <div className="font-bold" style={{ color: TEXT }}>{r.authors} ({r.year})</div>
                    <div style={{ color: TEXT_DIM }}>"{r.title}"</div>
                    <div className="italic mt-0.5" style={{ color: TEXT_MUTED }}>{r.journal}</div>
                    {r.finding && <div className="mt-1 p-1.5 rounded" style={{ background: GREEN_DIM, color: GREEN }}>📊 {r.finding}</div>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aplicar no TrainingON */}
        {onApplyToTraining && (
          <Button
            onClick={() => onApplyToTraining({ module: activeModule, level: activeLevel })}
            className="w-full mt-3 font-black text-[12px] h-11 rounded-xl tracking-wide"
            style={{ background: GREEN, color: BG }}
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            APLICAR NO TRAININGON ({activeModule.name} · {LEVEL_LABELS[activeLevel]})
          </Button>
        )}
      </div>
    </div>
  );
}
