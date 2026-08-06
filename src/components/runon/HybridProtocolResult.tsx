/** RunON — resultado do protocolo híbrido gerado a partir do Perfil Hybrid. */
import {
  Calendar, Dumbbell, Footprints, ShieldCheck, Utensils, Syringe, AlertTriangle, RotateCcw,
} from "lucide-react";
import { RC, mono, raj, SectionCard, StatCard, RBadge } from "@/components/runon/runonUi";
import type { RunOnProtocol } from "@/lib/runonProtocol";

export default function HybridProtocolResult({
  protocol, onRegenerate,
}: { protocol: RunOnProtocol; onRegenerate: () => void }) {
  const p = protocol;
  const date = new Date(p.generatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="space-y-4">
      <SectionCard accent={RC.cyan}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p style={mono(6, RC.mutedDark, 3)}>PROTOCOLO RUNON · {date}</p>
            <p style={{ ...raj(22, 700, RC.cyan), marginTop: 2 }}>{p.athlete}</p>
            <p style={mono(7, RC.mutedDark, 1)}>{p.phase} · PRIORIDADE PERNAS: {p.legPriority}</p>
          </div>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5"
            style={{ ...mono(7, RC.cyan, 2), border: `1px solid ${RC.cyan}22`, borderRadius: 4, padding: "6px 12px" }}
          >
            <RotateCcw style={{ width: 12, height: 12 }} />
            RECALCULAR
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <StatCard label="VOLUME CORRIDA" value={String(p.runMinutes)} suffix="min/sem" color={RC.cyan} />
          <StatCard label="SESSÕES CORRIDA" value={String(p.runSessions)} suffix="x" color={RC.cyan} />
          <StatCard label="RISCO INTERFERÊNCIA" value={p.interferenceRisk.toFixed(1)} suffix="/10" color={p.riskColor} />
          <StatCard label="LEG GUARD" value={p.legGuard} color={p.legGuard === "ATIVO" ? RC.green : RC.orange} />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={mono(6, RC.mutedDark, 3)}>ÍNDICE DE INTERFERÊNCIA</span>
            <span style={mono(7, p.riskColor, 2)}>{p.riskLabel}</span>
          </div>
          <div style={{ height: 6, background: RC.bg2, borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${(p.interferenceRisk / 10) * 100}%`,
                height: "100%",
                background: p.riskColor,
                boxShadow: `0 0 10px ${p.riskColor}66`,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard label="SEMANA GERADA" icon={Calendar}>
        {p.days.map((d) => (
          <div key={d.day} className="py-3" style={{ borderBottom: `1px solid ${RC.bg2}` }}>
            <div className="flex items-start gap-3">
              <span style={{ ...raj(14, 700, d.color), width: 42 }}>{d.day}</span>
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, color: RC.white }}>
                  <Dumbbell style={{ width: 12, height: 12, color: RC.gold }} />
                  {d.lift}
                </p>
                <p className="flex items-center gap-1.5" style={{ fontSize: 12, color: d.cardio.startsWith("Sem") || d.cardio === "—" ? "#444" : RC.cyan, marginTop: 3 }}>
                  <Footprints style={{ width: 12, height: 12 }} />
                  {d.cardio}
                </p>
                <p style={{ fontSize: 11, color: "#555", marginTop: 4, lineHeight: 1.5 }}>{d.note}</p>
              </div>
              {d.isLeg && <RBadge color={RC.red}>LEG DAY</RBadge>}
            </div>
          </div>
        ))}
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SectionCard label="NUTRITION BRIDGE" icon={Utensils} color={RC.gold} accent={RC.gold}>
          {[["PROTEÍNA", p.macros.protein], ["CARBOIDRATO", p.macros.carb], ["GORDURA", p.macros.fat], ["CALORIAS", p.macros.kcal]].map(([l, v], i) => (
            <div key={l} className="flex items-center justify-between gap-2 py-2.5" style={{ borderBottom: i < 3 ? `1px solid ${RC.bg2}` : "none" }}>
              <span style={mono(6, RC.mutedDark, 3)}>{l}</span>
              <span style={{ ...raj(14, 700, RC.white) }}>{v}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard label="STACK SUGERIDO (AEGIS)" icon={Syringe} color={RC.purple} accent={RC.purple}>
          <p style={raj(17, 700, RC.purple)}>{p.stack.name}</p>
          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.55, marginTop: 4 }}>{p.stack.goal}</p>
          <div className="mt-3">
            {p.stack.items.map((it, i) => (
              <div key={it} className="flex gap-2 py-2" style={{ borderBottom: i < p.stack.items.length - 1 ? `1px solid ${RC.bg2}` : "none" }}>
                <span style={{ ...mono(9, RC.purple, 0), textTransform: "none" }}>›</span>
                <span style={{ fontSize: 12, color: "#777" }}>{it}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: "#4a4a4a", marginTop: 10, lineHeight: 1.5 }}>
            Referência educacional curada — uso exige acompanhamento de profissional habilitado.
          </p>
        </SectionCard>
      </div>

      <SectionCard label="ALERTAS DO SISTEMA" icon={AlertTriangle} color={RC.orange} accent={RC.orange}>
        {p.alerts.map((a, i) => (
          <div key={a} className="flex gap-2 py-2" style={{ borderBottom: i < p.alerts.length - 1 ? `1px solid ${RC.bg2}` : "none" }}>
            <ShieldCheck style={{ width: 13, height: 13, color: RC.orange, flexShrink: 0, marginTop: 3 }} />
            <span style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{a}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
