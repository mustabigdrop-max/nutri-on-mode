// APEX Visual — Biblioteca Corretiva Interativa
// Seleção de equipamentos + 6 regiões com 4 fases (Inibir / Alongar / Ativar / Integrar)
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Wrench, Activity, Target, Layers, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { APEX_CORRECTIVE_LIBRARY, PHASE_META, type Phase, type Region, type Exercise, type Tool } from "@/data/apexCorrectiveLibrary";

type ToolAvailability = { foam: boolean; ball: boolean; none: true };

function ReleaseBlock({ ex, tools }: { ex: Exercise; tools: ToolAvailability }) {
  const visible = (ex.releases ?? []).filter((r) => (r.tool === "none" ? true : tools[r.tool]));
  if (visible.length === 0) {
    return (
      <div className="p-3 border border-amber-500/30 bg-amber-500/5 text-xs text-amber-300/90 rounded-none">
        Nenhum equipamento selecionado para este exercício. A opção <b>Sem equipamento</b> está sempre disponível abaixo:
        <div className="mt-2 text-foreground/90">
          {(ex.releases ?? []).find((r) => r.tool === "none")?.protocol}
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {visible.map((r) => (
        <div key={r.tool} className="p-3 border border-border bg-background/50 rounded-none">
          <div className="flex items-center gap-2 mb-1.5">
            <Wrench size={12} className="text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">{r.toolLabel}</span>
          </div>
          <div className="text-xs leading-relaxed text-foreground/85">{r.protocol}</div>
        </div>
      ))}
    </div>
  );
}

function ExerciseCard({ ex, tools }: { ex: Exercise; tools: ToolAvailability }) {
  const meta = PHASE_META[ex.phase];
  return (
    <div className="border border-border bg-card/30 rounded-none p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{ex.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            <Target size={10} className="inline mr-1" />
            {ex.target}
            {ex.status && (
              <span className="ml-2 px-1.5 py-0.5 border border-border text-[10px] uppercase tracking-wide" style={{ color: ex.status === "shortened" ? "#D94040" : "#0F8A63" }}>
                {ex.status === "shortened" ? "Encurtado" : "Inibido"}
              </span>
            )}
          </div>
        </div>
        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color, borderLeft: `2px solid ${meta.color}` }}>
          F{ex.phase} · {meta.label}
        </span>
      </div>

      {ex.phase === 1 && ex.releases && <ReleaseBlock ex={ex} tools={tools} />}

      {(ex.sets || ex.repsOrDuration) && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {ex.sets && <span className="px-2 py-0.5 bg-primary/10 text-primary font-mono">{ex.sets} séries</span>}
          {ex.repsOrDuration && <span className="px-2 py-0.5 bg-secondary/40 text-foreground/80 font-mono">{ex.repsOrDuration}</span>}
        </div>
      )}

      {ex.cues && ex.cues.length > 0 && (
        <ul className="space-y-0.5 text-xs text-foreground/80">
          {ex.cues.map((c, i) => (
            <li key={i} className="flex gap-1.5"><CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" /><span>{c}</span></li>
          ))}
        </ul>
      )}

      {(ex.regression || ex.progression) && (
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {ex.regression && (
            <div className="p-1.5 border border-border bg-background/40">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Regressão</div>
              <div className="text-foreground/80">{ex.regression}</div>
            </div>
          )}
          {ex.progression && (
            <div className="p-1.5 border border-border bg-background/40">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Progressão</div>
              <div className="text-foreground/80">{ex.progression}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseGroup({ phase, exercises, tools }: { phase: Phase; exercises: Exercise[]; tools: ToolAvailability }) {
  if (exercises.length === 0) return null;
  const meta = PHASE_META[phase];
  const Icon = phase === 1 ? Wrench : phase === 2 ? Activity : phase === 3 ? Target : Layers;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-1.5 border-b" style={{ borderColor: `${meta.color}40` }}>
        <Icon size={14} style={{ color: meta.color }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: meta.color }}>
          Fase {phase} — {meta.label}
        </span>
        <span className="text-[10px] text-muted-foreground">· {meta.hint}</span>
      </div>
      <div className="grid gap-2">
        {exercises.map((ex, i) => <ExerciseCard key={i} ex={ex} tools={tools} />)}
      </div>
    </div>
  );
}

function RegionAccordion({ region, tools }: { region: Region; tools: ToolAvailability }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border bg-card/20 rounded-none">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-3 hover:bg-card/40 transition-colors text-left"
      >
        {open ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-muted-foreground" />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-foreground uppercase tracking-wide">{region.title}</div>
          <div className="text-[11px] text-muted-foreground">{region.subtitle}</div>
        </div>
      </button>
      {open && (
        <div className="p-3 pt-1 space-y-4 border-t border-border">
          <div className="grid gap-2 md:grid-cols-2 text-[11px]">
            <div className="p-2 border-l-2 border-red-500/60 bg-red-500/5">
              <div className="text-[9px] uppercase tracking-wider text-red-400 mb-0.5">Dominantes / Encurtados</div>
              <div className="text-foreground/85">{region.dominant}</div>
            </div>
            <div className="p-2 border-l-2 border-emerald-500/60 bg-emerald-500/5">
              <div className="text-[9px] uppercase tracking-wider text-emerald-400 mb-0.5">Inibidos / Fracos</div>
              <div className="text-foreground/85">{region.inhibited}</div>
            </div>
          </div>

          <PhaseGroup phase={1} exercises={region.phases[1]} tools={tools} />
          <PhaseGroup phase={2} exercises={region.phases[2]} tools={tools} />
          <PhaseGroup phase={3} exercises={region.phases[3]} tools={tools} />
          <PhaseGroup phase={4} exercises={region.phases[4]} tools={tools} />

          {region.contraindicated.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <XCircle size={13} className="text-red-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">Contraindicados</span>
              </div>
              <ul className="space-y-1">
                {region.contraindicated.map((c, i) => (
                  <li key={i} className="text-[11px] text-foreground/80 flex gap-2">
                    <AlertTriangle size={11} className="text-red-500 mt-0.5 shrink-0" />
                    <span><b>{c.item}.</b> <span className="text-muted-foreground">{c.reason}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ApexCorrectiveLibrary() {
  const [foam, setFoam] = useState(false);
  const [ball, setBall] = useState(false);
  const tools: ToolAvailability = useMemo(() => ({ foam, ball, none: true }), [foam, ball]);

  return (
    <div className="space-y-3">
      {/* Equipment selector */}
      <div className="border border-primary/30 bg-primary/5 rounded-none p-3 space-y-2">
        <div className="text-xs font-bold uppercase tracking-widest text-primary">
          Biblioteca Corretiva — Seletor de Equipamento
        </div>
        <div className="text-[11px] text-muted-foreground">
          Selecione os equipamentos disponíveis para o atleta. O protocolo será ajustado automaticamente.
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={foam} onCheckedChange={(v) => setFoam(!!v)} />
            <span className="text-xs">Foam roller</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={ball} onCheckedChange={(v) => setBall(!!v)} />
            <span className="text-xs">Bola de tênis / lacrosse</span>
          </label>
          <label className="flex items-center gap-2 cursor-not-allowed opacity-90">
            <Checkbox checked disabled />
            <span className="text-xs">Sem equipamento <span className="text-muted-foreground">(sempre disponível)</span></span>
          </label>
        </div>
      </div>

      {/* Regions */}
      <div className="space-y-2">
        {APEX_CORRECTIVE_LIBRARY.map((region) => (
          <RegionAccordion key={region.id} region={region} tools={tools} />
        ))}
      </div>

      <div className="text-[10px] text-muted-foreground text-center pt-2">
        Parâmetros · Foam: 60-90s/ponto · Bola: 30-60s/ponto (círculos 1-2cm) · Ativo: 10-15 reps lentas, exalar no ponto de tensão, hold 2-3s no fim da amplitude.
      </div>
    </div>
  );
}
