// MERIDIAN — Post-stage Recovery: reverse diet + deload + check mental.
import { useState } from "react";
import { useMeridianRecovery } from "@/hooks/useMeridianRecovery";

interface Props {
  planId: string;
  competitionId: string;
  baseStageKcal?: number;
}

const ACCENT = "#2a8a9e";

export default function MeridianPostStageRecovery({ planId, competitionId, baseStageKcal = 1800 }: Props) {
  const { recovery, loading, saving, upsert } = useMeridianRecovery(planId, competitionId);
  const [weeks, setWeeks] = useState(4);
  const [step, setStep] = useState(100);
  const [refeed, setRefeed] = useState(2);
  const [risk, setRisk] = useState<string>("medium");
  const [notes, setNotes] = useState("");

  if (loading) return <Shell>Carregando recovery...</Shell>;

  if (!recovery) {
    return (
      <Shell>
        <div style={{ fontSize: 12, color: "#b8b8b8", marginBottom: 12 }}>
          Configure o protocolo de recovery pós-palco (reverse diet + deload + saúde mental).
        </div>
        <div style={grid2}>
          <Field label="Semanas de recovery"><input type="number" min={2} max={16} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} style={input} /></Field>
          <Field label="Reverse kcal/sem"><input type="number" min={50} max={300} step={25} value={step} onChange={(e) => setStep(Number(e.target.value))} style={input} /></Field>
          <Field label="Refeed dias/sem"><input type="number" min={0} max={7} value={refeed} onChange={(e) => setRefeed(Number(e.target.value))} style={input} /></Field>
          <Field label="Risco binge">
            <select value={risk} onChange={(e) => setRisk(e.target.value)} style={input}>
              <option value="low">Baixo</option>
              <option value="medium">Médio</option>
              <option value="high">Alto</option>
            </select>
          </Field>
        </div>
        <button
          onClick={() => upsert({ recovery_weeks: weeks, reverse_diet_kcal_step: step, refeed_days_per_week: refeed, binge_risk_level: risk, notes }, baseStageKcal)}
          disabled={saving}
          style={btnPrimary}
        >
          {saving ? "Salvando..." : "▶ INICIAR REVERSE DIET"}
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <Pill label="SEMANAS" value={String(recovery.recovery_weeks)} />
        <Pill label="STEP" value={`+${recovery.reverse_diet_kcal_step} kcal`} />
        <Pill label="REFEED" value={`${recovery.refeed_days_per_week}x/sem`} />
        <Pill label="DELOAD" value={`${recovery.training_deload_weeks} sem`} />
        <Pill label="RISCO BINGE" value={recovery.binge_risk_level.toUpperCase()} />
      </div>

      <div style={{ fontSize: 10, letterSpacing: 2, color: "#7a7a7a", marginBottom: 6 }}>REVERSE LADDER (kcal/sem)</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {recovery.weekly_kcal_targets?.map((k, i) => (
          <div key={i} style={ladder}>
            <div style={{ fontSize: 9, color: "#7a7a7a" }}>SEM {i + 1}</div>
            <div style={{ fontSize: 14, color: ACCENT, fontWeight: 700 }}>{k}</div>
          </div>
        ))}
      </div>

      <textarea
        value={notes || recovery.notes || ""}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Sintomas, peso pós-show, sono, libido, humor..."
        rows={2}
        style={textarea}
      />
      <button onClick={() => upsert({ notes })} disabled={saving} style={{ ...btnPrimary, marginTop: 8 }}>
        {saving ? "Salvando..." : "ATUALIZAR NOTAS"}
      </button>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(42,138,158,0.05)",
      border: "1px solid rgba(42,138,158,0.35)",
      borderLeft: `4px solid ${ACCENT}`,
      padding: 18,
      borderRadius: 4,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: ACCENT, marginBottom: 12 }}>
        SITREP // RECOVERY PÓS-PALCO
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 9, letterSpacing: 2, color: "#7a7a7a", display: "block", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "6px 10px", background: "rgba(0,0,0,0.3)", border: `1px solid ${ACCENT}55`, borderRadius: 2, fontSize: 11 }}>
      <span style={{ color: "#7a7a7a", marginRight: 6, letterSpacing: 1 }}>{label}</span>
      <strong style={{ color: ACCENT }}>{value}</strong>
    </div>
  );
}

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 };
const input: React.CSSProperties = {
  width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8e8e8", padding: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, borderRadius: 3,
};
const textarea: React.CSSProperties = { ...input, resize: "vertical" };
const btnPrimary: React.CSSProperties = {
  background: ACCENT, color: "#0a0a0a", border: "none", padding: "10px 16px",
  fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 2, cursor: "pointer", borderRadius: 3, fontWeight: 700,
};
const ladder: React.CSSProperties = {
  padding: "8px 10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 3, minWidth: 70, textAlign: "center",
};
