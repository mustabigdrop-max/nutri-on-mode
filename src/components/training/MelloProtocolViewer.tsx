/**
 * ============================================================================
 * <MelloProtocolViewer />
 * ============================================================================
 * Renderizador único para protocolos no padrão "Mello Atualização".
 * Recebe um objeto já validado contra MelloProtocolSchema.
 *
 * Estética SITREP: zinc/preto, mono utilitário, burnt gold como ponto único
 * de boldness (#B8922A).
 * ============================================================================
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Flame,
  StickyNote,
  Activity,
  Dumbbell,
} from "lucide-react";
import type { MelloProtocol } from "@/types/melloProtocol";

// Burnt gold — usado inline pra zero risco de purge
const GOLD = "#B8922A";

interface MelloProtocolViewerProps {
  protocol: MelloProtocol;
  expandAll?: boolean;
  className?: string;
}

// ----------------- Helpers visuais -----------------

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 px-4 py-3 min-w-[120px]">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      <div className="text-base font-mono text-zinc-100 mt-1">{value}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-10 mb-4">
      <span
        className="block h-px w-8"
        style={{ backgroundColor: GOLD }}
        aria-hidden
      />
      <h2
        className="text-[11px] font-mono uppercase tracking-[0.2em]"
        style={{ color: GOLD }}
      >
        {children}
      </h2>
      <span className="block h-px flex-1 bg-zinc-800" aria-hidden />
    </div>
  );
}

function VolumeBar({
  muscle,
  prescribed,
  isPrimary,
}: {
  muscle: string;
  prescribed: number;
  isPrimary: boolean;
}) {
  // Para fixture: "actual" não vem no schema; usamos prescribed como referência.
  // Em produção, esse componente pode receber actual via prop opcional.
  const max = 25;
  const pct = Math.min(100, (prescribed / max) * 100);
  const color = isPrimary ? GOLD : "#71717a"; // zinc-500

  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-zinc-200">{muscle}</span>
        <span className="text-xs font-mono text-zinc-500">
          {prescribed} sér/sem
        </span>
      </div>
      <div className="h-2 bg-zinc-900 border border-zinc-800 relative overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function AlertBlock({ text }: { text: string }) {
  // Detecta título antes de ":" para criar card de alerta tipo cabeçalho
  const idx = text.indexOf(":");
  const title = idx > 0 ? text.slice(0, idx) : "Alerta de Melhoria";
  const body = idx > 0 ? text.slice(idx + 1).trim() : text;

  return (
    <div className="border border-red-900/60 bg-red-950/20 ring-1 ring-red-900/30 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-mono uppercase tracking-wider text-zinc-100">
          {title}
        </h4>
        <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">
          ALTA
        </span>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}

// ----------------- Sessão (collapsable) -----------------

function SessionCard({
  day,
  defaultOpen,
}: {
  day: MelloProtocol["training_days"][number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-2 mb-4" style={{ borderColor: GOLD }}>
      {/* Cabeçalho */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-zinc-950 hover:bg-zinc-900/60 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="font-mono text-2xl shrink-0"
            style={{ color: GOLD }}
          >
            D{day.day_number}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-sans text-zinc-100 truncate">
              {day.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <span>120MIN</span>
              <span className="text-zinc-700">·</span>
              <span className="truncate">#{day.focus.replace(/\s+·\s+/g, " #")}</span>
            </div>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-zinc-400 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 py-5 bg-black border-t border-zinc-900">
          {/* SITREP row */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6 pb-4 border-b border-zinc-900">
            <span>⌗ Perfis: gaps detectados</span>
            <span>⚡ Super: 0 pronto</span>
            <span>⌬ Z2×0 Z3×{day.exercises.length}</span>
            <span>⊕ {day.focus.split(" ")[0].toLowerCase()} 50%</span>
          </div>

          {/* Warmup */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{ color: GOLD }} />
              <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-100">
                Warm-up
              </h4>
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
              Específico para {day.focus}
            </p>
            <ul className="space-y-2">
              {day.warmup.map((w, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-4 text-sm"
                >
                  <div className="min-w-0">
                    <div className="text-zinc-200">{w.name}</div>
                    {w.notes && (
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {w.notes}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-xs text-zinc-400 shrink-0 whitespace-nowrap">
                    {w.sets}×{w.reps}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercícios principais */}
          <Eyebrow>Exercícios Principais</Eyebrow>
          <ul className="space-y-3">
            {day.exercises.map((ex) => (
              <li
                key={ex.order}
                className="border border-zinc-800 bg-zinc-950/40 p-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="font-mono text-2xl leading-none pt-0.5 shrink-0"
                    style={{ color: GOLD }}
                  >
                    {String(ex.order).padStart(2, "0")}
                    <span className="text-zinc-700 mx-1">│</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="font-sans text-zinc-100 text-base">
                        {ex.name}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="border border-zinc-700 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                          Z3
                        </span>
                        <span
                          className="border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest"
                          style={{ borderColor: GOLD, color: GOLD }}
                        >
                          {ex.rir}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs font-mono text-zinc-500">
                      <Activity className="w-3 h-3" />
                      <span>{ex.sets} séries × {ex.reps} reps</span>
                      <span className="text-zinc-700">·</span>
                      <span>{ex.rest_seconds}s descanso</span>
                      {ex.tempo && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span>tempo {ex.tempo}</span>
                        </>
                      )}
                      {ex.technique && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-300">{ex.technique}</span>
                        </>
                      )}
                    </div>
                    {ex.notes && (
                      <div className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        ≋ {ex.notes}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Nota da sessão */}
          {day.finisher && (
            <div className="mt-5 border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-4 h-4 text-zinc-400" />
                <h5 className="text-[11px] font-mono uppercase tracking-widest text-zinc-300">
                  Nota da Sessão
                </h5>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {day.finisher}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------- Componente principal -----------------

export function MelloProtocolViewer({
  protocol,
  expandAll = false,
  className = "",
}: MelloProtocolViewerProps) {
  const bo = protocol.block_overview;
  const deloadWeek = protocol.phase_plan.find((p) => p.is_deload)?.week;
  const primaryMuscles = new Set(
    bo.muscle_priorities.filter((m) => m.priority === "alta").map((m) => m.muscle)
  );

  return (
    <div className={`min-h-screen bg-black text-zinc-100 ${className}`}>
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Tag elite */}
        <div className="mb-6">
          <span
            className="inline-block border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em]"
            style={{ borderColor: "#10b981", color: "#10b981" }}
          >
            🏆 Protocolo de Elite
          </span>
        </div>

        {/* Título */}
        <h1 className="font-sans text-3xl md:text-4xl tracking-tight text-zinc-50 leading-tight">
          {bo.title}
        </h1>

        {/* Descrição */}
        <p className="prose text-zinc-400 max-w-3xl mt-4 text-base leading-relaxed">
          {bo.notes}
        </p>

        {/* Stat cards */}
        <div className="flex flex-wrap gap-3 mt-8">
          <StatCard label="Duração" value={`${bo.mesocycle_duration_weeks} sem`} />
          <StatCard label="Divisão" value={bo.split.split(" ")[0]} />
          <StatCard label="Frequência" value={`${bo.training_frequency_days_per_week}×/sem`} />
          {deloadWeek && (
            <StatCard label="Deload" value={`Sem ${deloadWeek}`} />
          )}
          <StatCard label="Fase" value={bo.phase} />
        </div>

        {/* Modelo de progressão */}
        <Eyebrow>Modelo de Progressão</Eyebrow>
        <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
          {bo.progression_model}
        </p>

        {/* Prioridade muscular */}
        <Eyebrow>Prioridade Muscular</Eyebrow>
        <div className="flex items-center gap-5 mb-4 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5"
              style={{ backgroundColor: GOLD }}
            />
            Primário
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-zinc-500" />
            Sinergista
          </span>
        </div>
        <div className="max-w-2xl">
          {bo.muscle_priorities.map((m, i) => (
            <VolumeBar
              key={i}
              muscle={m.muscle}
              prescribed={m.weekly_sets}
              isPrimary={primaryMuscles.has(m.muscle)}
            />
          ))}
        </div>

        {/* Inline volume callouts (heurísticos a partir do schema) */}
        <div className="mt-6 space-y-2 max-w-2xl">
          {bo.muscle_priorities
            .filter((m) => m.weekly_sets >= 22)
            .map((m, i) => (
              <div
                key={`over-${i}`}
                className="flex items-start gap-2 text-sm text-red-400"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <span className="text-zinc-200 font-medium">{m.muscle}:</span>{" "}
                  {m.weekly_sets} séries excedem MAV recomendado para a fase.
                </span>
              </div>
            ))}
          {bo.muscle_priorities
            .filter((m) => m.weekly_sets <= 8)
            .map((m, i) => (
              <div
                key={`under-${i}`}
                className="flex items-start gap-2 text-sm text-sky-400"
              >
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <span className="text-zinc-200 font-medium">{m.muscle}:</span>{" "}
                  subdose detectada ({m.weekly_sets}/14) — verificar racional.
                </span>
              </div>
            ))}
        </div>

        {/* Observações do coach */}
        <Eyebrow>Observações do Coach</Eyebrow>
        <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
          {bo.notes}
        </p>

        {/* Alertas de melhoria */}
        <Eyebrow>Alertas de Melhoria</Eyebrow>
        <div className="grid md:grid-cols-2 gap-3">
          {protocol.improvement_alerts.map((a, i) => (
            <AlertBlock key={i} text={a} />
          ))}
        </div>

        {/* Sessões */}
        <Eyebrow>Sessões</Eyebrow>
        <div>
          {protocol.training_days.map((day, i) => (
            <SessionCard
              key={day.day_number}
              day={day}
              defaultOpen={expandAll || i === 0}
            />
          ))}
        </div>

        {/* Footer SITREP */}
        <footer className="mt-16 pt-6 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
          <span className="flex items-center gap-2">
            <Dumbbell className="w-3 h-3" />
            nutriON · TrainingON
          </span>
          <span>Protocolo Mello v1 · classified</span>
        </footer>
      </div>
    </div>
  );
}

export default MelloProtocolViewer;
