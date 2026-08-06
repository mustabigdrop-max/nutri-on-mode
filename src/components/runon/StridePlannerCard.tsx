/** RunON — Stride Planner ajustado pelo Race Mode. */
import { Footprints, Gauge, Timer, Route, Activity } from "lucide-react";
import { RC, mono, raj, SectionCard, StatCard, RBadge } from "@/components/runon/runonUi";
import { RaceModeConfig, buildStridePlan } from "@/lib/raceMode";

export default function StridePlannerCard({ cfg }: { cfg: RaceModeConfig }) {
  const plan = buildStridePlan(cfg);
  const c = plan.distance.color;

  return (
    <div className="space-y-4">
      <SectionCard label="STRIDE PLANNER" icon={Footprints} accent={c} color={c}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p style={raj(34, 900, c)}>{plan.distance.label}</p>
            <div className="mt-1">
              <RBadge color={plan.phase.color}>{plan.phase.label}</RBadge>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard label="PACE ALVO" value={plan.targetPace} color={c} />
            <StatCard label="TEMPO EST." value={plan.finishTime} color={c} />
            <StatCard label="CADÊNCIA" value={plan.cadence} color={RC.gold} />
            <StatCard label="PASSADA" value={`${plan.strideLengthCm} cm`} color={RC.purple} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <StatCard label="VELOCIDADE" value={`${plan.speedKmh} km/h`} color={RC.white} />
          <StatCard label="VOLUME SEMANAL" value={`${plan.weeklyKm} km`} color={RC.green} />
          <StatCard label="LONGÃO" value={`${plan.longRunKm} km`} color={RC.cyan} />
          <StatCard label="SESSÕES QUALIDADE" value={`${plan.qualitySessions}x`} color={RC.orange} />
        </div>
      </SectionCard>

      <SectionCard label="ZONAS DE PACE DERIVADAS" icon={Gauge}>
        <div className="grid grid-cols-[1.1fr_auto] gap-2 pb-2" style={{ borderBottom: `2px solid ${RC.border}` }}>
          <span style={mono(6, RC.mutedDark, 3)}>ZONA</span>
          <span style={mono(6, RC.mutedDark, 3)}>PACE</span>
        </div>
        {plan.zones.map((z, i) => (
          <div key={z.name} className="py-3" style={{ borderBottom: i === plan.zones.length - 1 ? "none" : `1px solid ${RC.border}` }}>
            <div className="grid grid-cols-[1.1fr_auto] gap-2 items-center">
              <span style={{ fontSize: 12.5, fontWeight: 700, color: z.color }}>{z.name}</span>
              <span style={raj(16, 800, RC.white)}>{z.pace}</span>
            </div>
            <p style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.5 }}>{z.note}</p>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="ESTRATÉGIA DE SPLITS" icon={Timer} accent={c} color={c}>
        {plan.splits.map((s, i) => (
          <div key={s.km} className="flex items-start gap-3 py-3" style={{ borderBottom: i === plan.splits.length - 1 ? "none" : `1px solid ${RC.border}` }}>
            <span style={{ ...raj(14, 800, c), width: 70, flexShrink: 0 }}>{s.km}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={raj(15, 800, RC.white)}>{s.pace}</span>
                <RBadge color={RC.gold}>{s.cumulative}</RBadge>
              </div>
              <p style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.5 }}>{s.note}</p>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="CUES TÉCNICOS DA SEMANA" icon={Activity} accent={plan.phase.color} color={plan.phase.color}>
        {plan.cues.map((q, i) => (
          <div key={i} className="flex gap-2 py-2">
            <Route style={{ width: 12, height: 12, color: plan.phase.color, marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#777", lineHeight: 1.55 }}>{q}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
