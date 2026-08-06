/** RunON — Fuel Matrix ajustada pelo Race Mode. */
import { Fuel, Clock, AlertTriangle } from "lucide-react";
import { RC, mono, raj, SectionCard, StatCard, RBadge } from "@/components/runon/runonUi";
import { RaceModeConfig, buildFuelPlan } from "@/lib/raceMode";

export default function RaceFuelMatrix({ cfg }: { cfg: RaceModeConfig }) {
  const plan = buildFuelPlan(cfg);
  const c = plan.distance.color;

  return (
    <div className="space-y-4">
      <SectionCard label="FUEL MATRIX — RACE MODE" icon={Fuel} accent={c} color={c}>
        <div className="flex items-center gap-2 flex-wrap">
          <RBadge color={c}>{plan.distance.label}</RBadge>
          <RBadge color={plan.phase.color}>{plan.phase.label}</RBadge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <StatCard label="CARBOIDRATO" value={plan.dailyCarbs} color={c} />
          <StatCard label="CARB G/KG" value={plan.dailyCarbsGkg} color={RC.gold} />
          <StatCard label="PROTEÍNA" value={plan.protein} color={RC.green} />
          <StatCard label="HIDRATAÇÃO" value={plan.fluid} color={RC.cyan} />
        </div>
      </SectionCard>

      <SectionCard label="PROTOCOLO DE FUELING DA PROVA" icon={Fuel}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {plan.rows.map((r) => (
            <div key={r.label} style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderLeft: `3px solid ${r.color}`, borderRadius: 8, padding: 12 }}>
              <p style={mono(6, RC.mutedDark, 3)}>{r.label}</p>
              <p style={{ ...raj(17, 800, r.color), marginTop: 5 }}>{r.value}</p>
              <p style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.5 }}>{r.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard label="TIMELINE" icon={Clock} accent={plan.phase.color} color={plan.phase.color}>
        {plan.timeline.map((t, i) => (
          <div key={t.time} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i === plan.timeline.length - 1 ? "none" : `1px solid ${RC.border}` }}>
            <span style={{ ...raj(14, 800, plan.phase.color), width: 84, flexShrink: 0 }}>{t.time}</span>
            <span style={{ fontSize: 12, color: "#777", lineHeight: 1.55 }}>{t.action}</span>
          </div>
        ))}
      </SectionCard>

      {plan.alerts.length > 0 && (
        <SectionCard label="ALERTAS" icon={AlertTriangle} color={RC.orange} accent={RC.orange}>
          {plan.alerts.map((a) => (
            <div key={a} className="flex gap-2 py-2">
              <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: RC.orange, marginTop: 6 }} />
              <span style={{ fontSize: 12, color: "#777", lineHeight: 1.55 }}>{a}</span>
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
}
