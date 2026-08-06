/** RUN ON — abas do módulo híbrido (musculação + corrida) no padrão APEX. */
import { useState } from "react";
import {
  Atom, FlaskConical, Dumbbell, Users, Syringe, Utensils, Activity, ShieldAlert,
  Bike, Footprints, CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle,
  ChevronDown, Trophy, BookOpen,
} from "lucide-react";
import {
  RC, mono, raj, IconBox, RBadge, SectionCard, StatCard, Chip,
} from "@/components/runon/runonUi";
import {
  interferenceIntro, interferenceEvidence, goldenRules, runVsBike, runVsBikeVerdict,
  bbWeeks, masters, pharmaDisclaimer, compoundsFavor, compoundsAgainst, pharmaPhases,
  cardioSafety, peptides, peptideStacks, hybridMacros, criticalMicros,
  doubleSessionTimeline, hybridKpis, overreachingSignals, overreachingAction,
  competitiveEdge, scientificRefs,
} from "@/data/runonHybridData";

const row = (last: boolean) => ({ borderBottom: last ? "none" : `1px solid ${RC.bg2}` });

/* ─────────── CIÊNCIA · Interference Effect ─────────── */
export function ScienceTab() {
  return (
    <div className="space-y-4">
      <SectionCard label="EFEITO DE INTERFERÊNCIA" icon={Atom} accent={RC.cyan}>
        {interferenceIntro.map((t, i) => (
          <p key={i} style={{ fontSize: 13, color: i === 0 ? RC.muted : RC.white, lineHeight: 1.7, marginBottom: 10 }}>
            {t}
          </p>
        ))}
      </SectionCard>

      <SectionCard label="O QUE A CIÊNCIA DE 2024–2026 DIZ" icon={FlaskConical}>
        {interferenceEvidence.map((e, i) => (
          <div key={e.title} className="flex items-start justify-between gap-3 py-3" style={row(i === interferenceEvidence.length - 1)}>
            <div className="min-w-0">
              <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{e.title}</p>
              <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginTop: 3 }}>{e.desc}</p>
            </div>
            <RBadge color={RC.cyan}>{e.tag}</RBadge>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="REGRAS DE OURO DO BODYBUILDER QUE CORRE" icon={Trophy} color={RC.gold} accent={RC.gold}>
        {goldenRules.map((g, i) => (
          <div key={g.rule} className="py-3" style={row(i === goldenRules.length - 1)}>
            <div className="flex items-start gap-2">
              <span style={{ ...mono(9, RC.gold, 0), textTransform: "none" }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{g.rule}</p>
                <p style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.5 }}>{g.why}</p>
              </div>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="CORRIDA VS CICLISMO" icon={Bike}>
        <div className="grid grid-cols-3 gap-2 pb-2" style={{ borderBottom: `2px solid ${RC.border}` }}>
          <span style={mono(6, RC.mutedDark, 3)}>CRITÉRIO</span>
          <span style={mono(6, RC.mutedDark, 3)}>CORRIDA</span>
          <span style={mono(6, RC.mutedDark, 3)}>CICLISMO</span>
        </div>
        {runVsBike.map((r) => (
          <div key={r.criterio} className="grid grid-cols-3 gap-2 py-3" style={{ borderBottom: `1px solid ${RC.bg2}` }}>
            <span style={{ fontSize: 12, color: "#777" }}>{r.criterio}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: r.win === "run" ? RC.green : RC.white }}>{r.corrida}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: r.win === "bike" ? RC.green : RC.white }}>{r.ciclismo}</span>
          </div>
        ))}
        <div style={{ borderLeft: `3px solid ${RC.cyan}`, background: RC.bg2, padding: "12px 16px", borderRadius: 6, marginTop: 14 }}>
          <p style={mono(6, RC.mutedDark, 3)}>VEREDICTO RUN ON</p>
          <p style={{ fontSize: 12, color: RC.muted, lineHeight: 1.6, marginTop: 4 }}>{runVsBikeVerdict}</p>
        </div>
      </SectionCard>

      <SectionCard label="REFERÊNCIAS CIENTÍFICAS" icon={BookOpen}>
        {scientificRefs.map((r, i) => (
          <div key={i} className="flex gap-2 py-2" style={row(i === scientificRefs.length - 1)}>
            <span style={{ ...mono(9, RC.cyan, 0), textTransform: "none" }}>→</span>
            <span style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>{r}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── BB SPLIT · semanas do bodybuilder ─────────── */
export function BodybuilderTab() {
  const [id, setId] = useState(bbWeeks[0].id);
  const w = bbWeeks.find((x) => x.id === id)!;
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {bbWeeks.map((b) => (
          <Chip key={b.id} active={b.id === id} color={b.color} onClick={() => setId(b.id)}>
            {b.name}
          </Chip>
        ))}
      </div>

      <SectionCard accent={w.color}>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <p style={raj(20, 700, w.color)}>{w.name}</p>
            <p style={mono(8, RC.mutedDark, 1)}>{w.subtitle}</p>
          </div>
          <RBadge color={w.color}>{w.volume}</RBadge>
        </div>

        <div className="mt-5">
          {w.days.map((d) => (
            <div key={d.day} className="py-3" style={{ borderBottom: `1px solid ${RC.bg2}` }}>
              <div className="flex items-center gap-3">
                <span style={{ ...raj(14, 700, d.color), width: 40 }}>{d.day}</span>
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, color: RC.white }}>
                    <Dumbbell style={{ width: 12, height: 12, color: RC.gold }} />
                    {d.lift}
                  </p>
                  <p className="flex items-center gap-1.5" style={{ fontSize: 12, color: d.cardio === "Sem cardio" || d.cardio === "—" ? "#444" : RC.cyan, marginTop: 3 }}>
                    <Footprints style={{ width: 12, height: 12 }} />
                    {d.cardio}
                  </p>
                  <p style={{ fontSize: 11, color: "#555", marginTop: 4, lineHeight: 1.5 }}>{d.note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderLeft: `3px solid ${w.color}`, background: RC.bg2, padding: "12px 16px", borderRadius: 6, marginTop: 14 }}>
          <p style={mono(6, RC.mutedDark, 3)}>REGRA CRÍTICA</p>
          <p style={{ fontSize: 12, color: RC.muted, lineHeight: 1.6, marginTop: 4 }}>{w.rule}</p>
        </div>
      </SectionCard>

      <SectionCard label="DIFERENCIAL COMPETITIVO" icon={TrendingUp}>
        {competitiveEdge.map((c, i) => (
          <div key={c.feature} className="grid grid-cols-[1.4fr_1fr_auto] gap-2 items-center py-3" style={row(i === competitiveEdge.length - 1)}>
            <span style={{ fontSize: 12, color: RC.white, fontWeight: 600 }}>{c.feature}</span>
            <span style={{ fontSize: 11, color: "#555" }}>{c.others}</span>
            <RBadge color={RC.cyan}>{c.runon}</RBadge>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── MESTRES ─────────── */
export function MastersTab() {
  const [open, setOpen] = useState<string | null>(masters[0].name);
  return (
    <div className="space-y-3">
      {masters.map((m) => {
        const expanded = open === m.name;
        return (
          <div
            key={m.name}
            style={{
              background: RC.card,
              border: `1px solid ${expanded ? `${m.color}33` : RC.border}`,
              borderRadius: 10,
              padding: expanded ? 20 : "16px 20px",
              transition: "all 0.3s ease",
            }}
          >
            <button onClick={() => setOpen(expanded ? null : m.name)} className="w-full flex items-center gap-3 text-left">
              <IconBox icon={Users} color={m.color} size={40} iconSize={18} />
              <div className="flex-1 min-w-0">
                <p style={raj(16, 700)}>{m.name}</p>
                <p style={mono(8, RC.mutedDark, 1)}>{m.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 shrink-0 transition-transform" style={{ color: "#444", transform: expanded ? "rotate(180deg)" : "none" }} />
            </button>

            {expanded && (
              <div className="mt-4 space-y-3 animate-fade-in">
                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{m.bio}</p>
                <div>
                  {m.principles.map((p, i) => (
                    <div key={p} className="flex gap-2 py-2" style={row(i === m.principles.length - 1)}>
                      <span style={{ ...mono(10, m.color, 0), textTransform: "none" }}>→</span>
                      <span style={{ fontSize: 12, color: "#777", lineHeight: 1.55 }}>{p}</span>
                    </div>
                  ))}
                </div>
                {m.application && (
                  <div style={{ borderLeft: `3px solid ${m.color}`, background: RC.bg2, padding: "12px 16px", borderRadius: 6 }}>
                    <p style={mono(6, RC.mutedDark, 3)}>APLICAÇÃO NO RUN ON</p>
                    <p style={{ fontSize: 12, color: RC.muted, lineHeight: 1.6, marginTop: 4 }}>{m.application}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── FARMACOLOGIA ─────────── */
function Disclaimer() {
  return (
    <div style={{ background: "#f9731610", border: `1px solid #f9731633`, borderRadius: 10, padding: 16 }}>
      <div className="flex items-start gap-2">
        <AlertTriangle style={{ width: 16, height: 16, color: RC.orange, flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={mono(7, RC.orange, 2)}>AVISO EDUCACIONAL</p>
          <p style={{ fontSize: 11, color: "#777", lineHeight: 1.6, marginTop: 5 }}>{pharmaDisclaimer}</p>
        </div>
      </div>
    </div>
  );
}

export function PharmaTab() {
  return (
    <div className="space-y-4">
      <Disclaimer />

      <SectionCard label="COMPOSTOS QUE FAVORECEM O ATLETA QUE CORRE" icon={CheckCircle2} color={RC.green} accent={RC.green}>
        {compoundsFavor.map((c, i) => (
          <div key={c.name} className="py-3" style={row(i === compoundsFavor.length - 1)}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{c.name}</p>
              <RBadge color={RC.green}>{c.mechanism}</RBadge>
            </div>
            <p style={{ fontSize: 12, color: "#777", marginTop: 5, lineHeight: 1.5 }}>{c.benefit}</p>
            <p style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{c.note}</p>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="COMPOSTOS QUE PREJUDICAM A CORRIDA" icon={XCircle} color={RC.red} accent={RC.red}>
        {compoundsAgainst.map((c, i) => (
          <div key={c.name} className="flex items-start gap-3 py-3" style={row(i === compoundsAgainst.length - 1)}>
            <XCircle style={{ width: 14, height: 14, color: RC.red, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{c.name}</p>
              <p style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.5 }}>{c.issue}</p>
            </div>
          </div>
        ))}
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pharmaPhases.map((p) => (
          <SectionCard key={p.phase} accent={p.color}>
            <p style={raj(17, 700, p.color)}>{p.phase}</p>
            <p style={mono(7, RC.mutedDark, 1)}>{p.subtitle}</p>
            <div className="mt-3">
              {p.items.map((it, i) => (
                <div key={it} className="flex gap-2 py-2" style={row(i === p.items.length - 1)}>
                  <span style={{ ...mono(9, p.color, 0), textTransform: "none" }}>›</span>
                  <span style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{it}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard label="CONSIDERAÇÕES CARDIOVASCULARES" icon={ShieldAlert} color={RC.red}>
        {cardioSafety.map((s, i) => (
          <div key={s} className="flex gap-2 py-2" style={row(i === cardioSafety.length - 1)}>
            <span style={{ ...mono(9, RC.red, 0), textTransform: "none" }}>!</span>
            <span style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── PEPTÍDEOS ─────────── */
const PEPT_CATS = ["Todos", "Reparo tecidual", "Mitocondrial", "GH Secretagogo", "Metabólico"] as const;

export function PeptidesTab() {
  const [cat, setCat] = useState<string>("Todos");
  const [open, setOpen] = useState<string | null>(peptides[0].id);
  const list = cat === "Todos" ? peptides : peptides.filter((p) => p.category === cat);

  return (
    <div className="space-y-4">
      <Disclaimer />

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {PEPT_CATS.map((c) => (
          <Chip key={c} active={c === cat} color={RC.purple} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((p) => {
          const expanded = open === p.id;
          return (
            <div
              key={p.id}
              style={{
                background: RC.card,
                border: `1px solid ${expanded ? `${p.color}33` : RC.border}`,
                borderRadius: 10,
                padding: expanded ? 20 : "16px 20px",
                transition: "all 0.3s ease",
              }}
            >
              <button onClick={() => setOpen(expanded ? null : p.id)} className="w-full flex items-center gap-3 text-left">
                <IconBox icon={Syringe} color={p.color} size={40} iconSize={18} />
                <div className="flex-1 min-w-0">
                  <p style={raj(16, 700)}>{p.name}</p>
                  <p style={mono(8, RC.mutedDark, 1)}>{p.full}</p>
                </div>
                <RBadge color={p.color}>{p.category}</RBadge>
                <ChevronDown className="w-4 h-4 shrink-0 transition-transform" style={{ color: "#444", transform: expanded ? "rotate(180deg)" : "none" }} />
              </button>

              {expanded && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  {([["O QUE É", p.what], ["MECANISMO", p.mechanism], ["PARA O ATLETA HÍBRIDO", p.forAthlete], ["PROTOCOLO", p.protocol], ["EVIDÊNCIA", p.evidence]] as [string, string | undefined][])
                    .filter(([, v]) => !!v)
                    .map(([label, v]) => (
                      <div key={label} style={{ borderLeft: `3px solid ${p.color}`, background: RC.bg2, padding: "10px 14px", borderRadius: 6 }}>
                        <p style={mono(6, RC.mutedDark, 3)}>{label}</p>
                        <p style={{ fontSize: 12, color: RC.muted, lineHeight: 1.6, marginTop: 4 }}>{v}</p>
                      </div>
                    ))}
                  {p.extra?.map((e) => (
                    <div key={e} className="flex gap-2">
                      <span style={{ ...mono(9, p.color, 0), textTransform: "none" }}>→</span>
                      <span style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{e}</span>
                    </div>
                  ))}
                  {p.wada && (
                    <div className="flex items-center gap-2">
                      <span style={mono(6, RC.mutedDark, 3)}>STATUS WADA</span>
                      <RBadge color={RC.orange}>{p.wada}</RBadge>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ ...mono(7, RC.mutedDark, 3), paddingTop: 8 }}>STACKS RECOMENDADOS POR OBJETIVO</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {peptideStacks.map((s) => (
          <SectionCard key={s.id} accent={s.color}>
            <p style={raj(17, 700, s.color)}>{s.name}</p>
            <p style={mono(7, RC.mutedDark, 1)}>{s.phase}</p>
            <div className="mt-3">
              {s.items.map((it, i) => (
                <div key={it.compound} className="py-2" style={row(i === s.items.length - 1)}>
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ fontSize: 12, fontWeight: 700, color: RC.white }}>{it.compound}</span>
                    <span style={{ ...raj(13, 700, s.color) }}>{it.dose}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{it.freq}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.55, marginTop: 10 }}>{s.goal}</p>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

/* ─────────── FUEL MATRIX ─────────── */
export function FuelTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {hybridMacros.map((m) => (
          <SectionCard key={m.name} accent={m.color}>
            <p style={mono(6, RC.mutedDark, 3)}>{m.name}</p>
            <p style={{ ...raj(20, 700, m.color), marginTop: 6 }}>{m.value}</p>
            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, marginTop: 6 }}>{m.note}</p>
          </SectionCard>
        ))}
      </div>

      <SectionCard label="MICRONUTRIENTES CRÍTICOS" icon={Utensils}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {criticalMicros.map((m) => (
            <div key={m.name} style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 12 }}>
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontSize: 12, fontWeight: 700, color: RC.white }}>{m.name}</span>
                <span style={{ ...raj(13, 700, RC.cyan) }}>{m.dose}</span>
              </div>
              <p style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{m.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard label="TIMING PARA SESSÕES DUPLAS" icon={Clock} accent={RC.cyan}>
        {doubleSessionTimeline.map((t, i) => (
          <div key={t.time} className="flex items-start gap-3 py-2.5" style={row(i === doubleSessionTimeline.length - 1)}>
            <span style={{ ...raj(14, 700, RC.cyan), width: 52 }}>{t.time}</span>
            <span style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{t.action}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── MONITOR ─────────── */
export function MonitorTab() {
  return (
    <div className="space-y-4">
      <SectionCard label="KPIS DO ATLETA HÍBRIDO" icon={Activity}>
        <div className="grid grid-cols-[1.2fr_auto] gap-2 pb-2" style={{ borderBottom: `2px solid ${RC.border}` }}>
          <span style={mono(6, RC.mutedDark, 3)}>MÉTRICA</span>
          <span style={mono(6, RC.mutedDark, 3)}>FREQUÊNCIA</span>
        </div>
        {hybridKpis.map((k, i) => (
          <div key={k.metric} className="py-3" style={row(i === hybridKpis.length - 1)}>
            <div className="grid grid-cols-[1.2fr_auto] gap-2 items-center">
              <span style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{k.metric}</span>
              <RBadge color={k.color}>{k.freq}</RBadge>
            </div>
            <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{k.alert}</p>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="SINAIS DE OVERREACHING" icon={AlertTriangle} color={RC.red} accent={RC.red}>
        {overreachingSignals.map((s, i) => (
          <div key={s} className="flex gap-2 py-2" style={row(i === overreachingSignals.length - 1)}>
            <span
              className="rounded-full animate-pulse shrink-0"
              style={{ width: 6, height: 6, background: RC.red, marginTop: 6 }}
            />
            <span style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
        <div style={{ borderLeft: `3px solid ${RC.red}`, background: RC.bg2, padding: "12px 16px", borderRadius: 6, marginTop: 14 }}>
          <p style={{ fontSize: 12, color: RC.muted, lineHeight: 1.6 }}>{overreachingAction}</p>
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="THRESHOLD LISS" value="< 150" suffix="min/sem" color={RC.green} />
        <StatCard label="BUFFER LEG DAY" value="48" suffix="h" color={RC.orange} />
        <StatCard label="GAP ENTRE SESSÕES" value="6" suffix="h+" color={RC.cyan} />
        <StatCard label="SONO MÍNIMO" value="8" suffix="h" color={RC.purple} />
      </div>
    </div>
  );
}
