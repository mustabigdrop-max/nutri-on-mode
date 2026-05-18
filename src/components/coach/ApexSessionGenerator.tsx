// APEX Visual — Gerador de Sessão Única
// Escolhe região + duração + equipamentos; monta automaticamente as 4 fases
import { useMemo, useState } from "react";
import { Clock, Wrench, Activity, Target, Layers, Play, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  APEX_CORRECTIVE_LIBRARY,
  PHASE_META,
  type Phase,
  type Region,
  type Exercise,
} from "@/data/apexCorrectiveLibrary";

type Tools = { foam: boolean; ball: boolean };

type Tools = {
  foam: boolean;
  ball: boolean;
  band: boolean;       // faixa elástica / mini-band
  dumbbells: boolean;  // halteres
  step: boolean;       // step / caixote / banco baixo
};

const DURATIONS = [15, 30, 45, 60] as const;
type Duration = (typeof DURATIONS)[number];

// Distribuição de tempo por fase (% do total)
const PHASE_SPLIT: Record<Phase, number> = { 1: 0.2, 2: 0.25, 3: 0.35, 4: 0.2 };
// Tempo estimado por exercício/fase (min)
const PER_EX_MIN: Record<Phase, number> = { 1: 2, 2: 2, 3: 3, 4: 3 };

// Heurística de equipamento necessário, a partir do texto do exercício
const RX = {
  band: /\b(band|elástic|elastico|mini.?band|theraband|tubing|cable)\b/i,
  dumbbell: /\b(halter|haltere|dumbbell|kettlebell|peso livre|livro pesado)\b/i,
  step: /\b(step|caixote|banco|degrau|step.?up|elev[aá]ç)\b/i,
};

function detectNeeded(ex: Exercise): Array<"band" | "dumbbell" | "step"> {
  const text = `${ex.name} ${ex.target} ${(ex.cues ?? []).join(" ")} ${ex.progression ?? ""} ${ex.regression ?? ""}`;
  const out: Array<"band" | "dumbbell" | "step"> = [];
  if (RX.band.test(text)) out.push("band");
  if (RX.dumbbell.test(text)) out.push("dumbbell");
  if (RX.step.test(text)) out.push("step");
  return out;
}

function pickReleaseProtocol(ex: Exercise, tools: Tools): string {
  const rels = ex.releases ?? [];
  if (tools.foam) {
    const r = rels.find((x) => x.tool === "foam");
    if (r && !/contraindicado|não se aplica/i.test(r.protocol)) return `[Foam] ${r.protocol}`;
  }
  if (tools.ball) {
    const r = rels.find((x) => x.tool === "ball");
    if (r && !/contraindicado|não se aplica/i.test(r.protocol)) return `[Bola] ${r.protocol}`;
  }
  const none = rels.find((x) => x.tool === "none");
  return none ? `[Sem equip.] ${none.protocol}` : "";
}

function adaptExercise(ex: Exercise, tools: Tools): { ex: Exercise; note?: string; missing: string[] } {
  const needed = detectNeeded(ex);
  const missing: string[] = [];
  if (needed.includes("band") && !tools.band) missing.push("faixa elástica");
  if (needed.includes("dumbbell") && !tools.dumbbells) missing.push("halteres");
  if (needed.includes("step") && !tools.step) missing.push("step");

  if (missing.length === 0) return { ex, missing: [] };
  // tenta usar regressão como alternativa
  if (ex.regression) {
    return {
      ex: { ...ex, name: `${ex.name} — alternativa`, cues: [ex.regression] },
      note: `Adaptado (sem ${missing.join(", ")})`,
      missing,
    };
  }
  return { ex, note: `Requer ${missing.join(", ")} — execute versão isométrica/sem carga`, missing };
}

function buildSession(region: Region, duration: Duration, tools: Tools) {
  const blocks = ([1, 2, 3, 4] as Phase[]).map((phase) => {
    const budget = Math.max(2, Math.round(duration * PHASE_SPLIT[phase]));
    const perEx = PER_EX_MIN[phase];
    const count = Math.max(1, Math.min(region.phases[phase].length, Math.floor(budget / perEx) || 1));
    const items = region.phases[phase].slice(0, count);
    return { phase, minutes: budget, items };
  });
  const total = blocks.reduce((s, b) => s + b.minutes, 0);
  return { blocks, total };
}

function formatPlainText(region: Region, duration: Duration, tools: Tools) {
  const { blocks, total } = buildSession(region, duration, tools);
  const lines: string[] = [];
  lines.push(`APEX VISUAL — SESSÃO CORRETIVA`);
  lines.push(`Região: ${region.title} (${region.subtitle})`);
  lines.push(`Duração alvo: ${duration} min · Total alocado: ${total} min`);
  lines.push(
    `Equipamentos: ${[
      tools.foam ? "Foam roller" : null,
      tools.ball ? "Bola tênis/lacrosse" : null,
      "Sem equipamento",
    ]
      .filter(Boolean)
      .join(" · ")}`,
  );
  lines.push("");
  for (const b of blocks) {
    const meta = PHASE_META[b.phase];
    lines.push(`── FASE ${b.phase} · ${meta.label.toUpperCase()} (${b.minutes} min) ──`);
    b.items.forEach((ex, i) => {
      lines.push(`${i + 1}. ${ex.name} — alvo: ${ex.target}`);
      if (ex.phase === 1) {
        const p = pickReleaseProtocol(ex, tools);
        if (p) lines.push(`   ${p}`);
      } else {
        if (ex.sets || ex.repsOrDuration) lines.push(`   ${ex.sets ?? ""} ${ex.repsOrDuration ?? ""}`.trim());
        if (ex.cues?.length) lines.push(`   Cue: ${ex.cues[0]}`);
      }
    });
    lines.push("");
  }
  return lines.join("\n");
}

export function ApexSessionGenerator() {
  const [regionId, setRegionId] = useState<string>(APEX_CORRECTIVE_LIBRARY[0].id);
  const [duration, setDuration] = useState<Duration>(30);
  const [foam, setFoam] = useState(false);
  const [ball, setBall] = useState(false);
  const tools: Tools = { foam, ball };

  const region = useMemo(
    () => APEX_CORRECTIVE_LIBRARY.find((r) => r.id === regionId) ?? APEX_CORRECTIVE_LIBRARY[0],
    [regionId],
  );
  const session = useMemo(() => buildSession(region, duration, tools), [region, duration, foam, ball]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatPlainText(region, duration, tools));
      toast({ title: "Sessão copiada", description: "Cole no seu plano ou compartilhe com o atleta." });
    } catch {
      toast({ title: "Falha ao copiar", variant: "destructive" });
    }
  };

  const PhaseIcon = (p: Phase) => (p === 1 ? Wrench : p === 2 ? Activity : p === 3 ? Target : Layers);

  return (
    <div className="space-y-3 border border-primary/30 bg-primary/5 rounded-none p-3">
      <div className="flex items-center gap-2">
        <Play size={14} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Gerador de Sessão Corretiva
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Escolha região, duração e equipamentos. As fases são distribuídas automaticamente.
      </p>

      {/* Controles */}
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Região</div>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full bg-background border border-border rounded-none text-xs px-2 py-1.5 focus:border-primary outline-none"
          >
            {APEX_CORRECTIVE_LIBRARY.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Duração</div>
          <div className="flex gap-1">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 text-xs py-1.5 border rounded-none transition-colors ${
                  duration === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground/80 hover:border-primary/60"
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Equipamentos</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <Checkbox checked={foam} onCheckedChange={(v) => setFoam(!!v)} />
              Foam roller
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <Checkbox checked={ball} onCheckedChange={(v) => setBall(!!v)} />
              Bola de tênis / lacrosse
            </label>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock size={12} />
          <span>
            Total alocado: <b className="text-foreground">{session.total} min</b> ·{" "}
            Região: <b className="text-foreground">{region.title}</b>
          </span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] px-2 py-1 border border-primary/50 text-primary hover:bg-primary/10 rounded-none uppercase tracking-wider"
        >
          <Copy size={11} /> Copiar sessão
        </button>
      </div>

      {/* Blocos por fase */}
      <div className="space-y-2">
        {session.blocks.map((b) => {
          const meta = PHASE_META[b.phase];
          const Icon = PhaseIcon(b.phase);
          return (
            <div key={b.phase} className="border border-border bg-background/40 rounded-none">
              <div
                className="flex items-center gap-2 px-3 py-1.5 border-b"
                style={{ borderColor: `${meta.color}40`, background: `${meta.color}10` }}
              >
                <Icon size={13} style={{ color: meta.color }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                  Fase {b.phase} · {meta.label}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">{b.minutes} min</span>
              </div>
              <div className="p-2 space-y-1.5">
                {b.items.length === 0 && (
                  <div className="text-[11px] text-muted-foreground italic">Sem exercícios disponíveis nesta fase.</div>
                )}
                {b.items.map((ex, i) => {
                  const protocol = ex.phase === 1 ? pickReleaseProtocol(ex, tools) : "";
                  const noEquipWarn =
                    ex.phase === 1 && !foam && !ball && /contraindicado/i.test(protocol);
                  return (
                    <div key={i} className="text-xs border-l-2 pl-2 py-1" style={{ borderColor: `${meta.color}80` }}>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground">{ex.name}</div>
                          <div className="text-[10px] text-muted-foreground">Alvo: {ex.target}</div>
                          {ex.phase === 1 ? (
                            <div className="text-[11px] text-foreground/80 mt-1">{protocol}</div>
                          ) : (
                            <div className="text-[11px] text-foreground/80 mt-1 flex flex-wrap gap-2">
                              {ex.sets && <span className="font-mono">{ex.sets} séries</span>}
                              {ex.repsOrDuration && <span className="font-mono">{ex.repsOrDuration}</span>}
                              {ex.cues?.[0] && <span className="text-muted-foreground">· {ex.cues[0]}</span>}
                            </div>
                          )}
                          {noEquipWarn && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                              <AlertTriangle size={10} /> Use sempre a opção sem equipamento neste alvo.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ApexSessionGenerator;
