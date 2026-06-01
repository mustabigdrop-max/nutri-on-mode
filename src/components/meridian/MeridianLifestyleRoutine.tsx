// MERIDIAN — Lifestyle routine card (Track Lifestyle — Bloco 5).
import { useEffect, useState } from "react";
import { useMeridianLifestyleRoutine } from "@/hooks/useMeridianLifestyleRoutine";
import { toast } from "@/hooks/use-toast";

interface Props {
  planId: string;
  defaultBfMin: number;
  defaultBfMax: number;
}

const LIFESTYLE_COLOR = "#1B4965";

const PHASES = [
  { value: "MAINTENANCE", label: "Manutenção", color: "#1B4965" },
  { value: "MINI_CUT", label: "Mini-Cut", color: "#8a6a2a" },
  { value: "EVENT_PREP", label: "Event Prep", color: "#B8922A" },
  { value: "REVERSE", label: "Reverse Diet", color: "#4ade80" },
];

export default function MeridianLifestyleRoutine({ planId, defaultBfMin, defaultBfMax }: Props) {
  const { routine, loading, upsert } = useMeridianLifestyleRoutine();
  const [draft, setDraft] = useState({
    target_bf_min: defaultBfMin,
    target_bf_max: defaultBfMax,
    training_days_per_week: 4,
    cardio_minutes_per_week: 120,
    step_target_daily: 8000,
    current_phase: "MAINTENANCE",
    next_event_name: "",
    next_event_date: "",
    sustainability_score: 7,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (routine) {
      setDraft({
        target_bf_min: Number(routine.target_bf_min),
        target_bf_max: Number(routine.target_bf_max),
        training_days_per_week: routine.training_days_per_week,
        cardio_minutes_per_week: routine.cardio_minutes_per_week,
        step_target_daily: routine.step_target_daily,
        current_phase: routine.current_phase,
        next_event_name: routine.next_event_name ?? "",
        next_event_date: routine.next_event_date ?? "",
        sustainability_score: routine.sustainability_score ?? 7,
      });
    }
  }, [routine]);

  const save = async () => {
    setSaving(true);
    try {
      await upsert({
        plan_id: planId,
        target_bf_min: draft.target_bf_min,
        target_bf_max: draft.target_bf_max,
        training_days_per_week: draft.training_days_per_week,
        cardio_minutes_per_week: draft.cardio_minutes_per_week,
        step_target_daily: draft.step_target_daily,
        current_phase: draft.current_phase,
        next_event_name: draft.next_event_name || null,
        next_event_date: draft.next_event_date || null,
        sustainability_score: draft.sustainability_score,
      });
      toast({ title: "Rotina lifestyle salva" });
    } catch (e: any) {
      toast({ title: "Falha ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const phaseMeta = PHASES.find((p) => p.value === draft.current_phase) ?? PHASES[0];

  return (
    <div
      style={{
        background: "rgba(27,73,101,0.04)",
        border: `1px solid ${LIFESTYLE_COLOR}55`,
        borderLeft: `4px solid ${LIFESTYLE_COLOR}`,
        padding: 18,
        borderRadius: 4,
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#e8e8e8",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a" }}>
          SITREP // ROTINA LIFESTYLE
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: LIFESTYLE_COLOR, marginTop: 4 }}>
          MODO: {phaseMeta.label.toUpperCase()}
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: "#7a7a7a" }}>Carregando...</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <Row label="Fase atual">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
              {PHASES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, current_phase: p.value })}
                  style={{
                    padding: "8px 6px",
                    background: draft.current_phase === p.value ? `${p.color}22` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${draft.current_phase === p.value ? p.color : "rgba(255,255,255,0.08)"}`,
                    color: draft.current_phase === p.value ? p.color : "#b8b8b8",
                    fontSize: 11,
                    letterSpacing: 1,
                    fontWeight: 600,
                    cursor: "pointer",
                    borderRadius: 3,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Row>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Row label="BF target min (%)">
              <input
                type="number"
                step={0.5}
                value={draft.target_bf_min}
                onChange={(e) => setDraft({ ...draft, target_bf_min: Number(e.target.value) })}
                style={inputStyle}
              />
            </Row>
            <Row label="BF target max (%)">
              <input
                type="number"
                step={0.5}
                value={draft.target_bf_max}
                onChange={(e) => setDraft({ ...draft, target_bf_max: Number(e.target.value) })}
                style={inputStyle}
              />
            </Row>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Row label="Treinos/sem">
              <input
                type="number"
                value={draft.training_days_per_week}
                onChange={(e) => setDraft({ ...draft, training_days_per_week: Number(e.target.value) })}
                style={inputStyle}
              />
            </Row>
            <Row label="Cardio (min/sem)">
              <input
                type="number"
                value={draft.cardio_minutes_per_week}
                onChange={(e) => setDraft({ ...draft, cardio_minutes_per_week: Number(e.target.value) })}
                style={inputStyle}
              />
            </Row>
            <Row label="Passos/dia">
              <input
                type="number"
                value={draft.step_target_daily}
                onChange={(e) => setDraft({ ...draft, step_target_daily: Number(e.target.value) })}
                style={inputStyle}
              />
            </Row>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
            <Row label="Próximo evento (opcional)">
              <input
                type="text"
                placeholder="ex: viagem, casamento, sessão de fotos"
                value={draft.next_event_name}
                onChange={(e) => setDraft({ ...draft, next_event_name: e.target.value })}
                style={inputStyle}
              />
            </Row>
            <Row label="Data do evento">
              <input
                type="date"
                value={draft.next_event_date}
                onChange={(e) => setDraft({ ...draft, next_event_date: e.target.value })}
                style={inputStyle}
              />
            </Row>
          </div>

          <Row label={`Sustentabilidade percebida: ${draft.sustainability_score}/10`}>
            <input
              type="range"
              min={1}
              max={10}
              value={draft.sustainability_score}
              onChange={(e) => setDraft({ ...draft, sustainability_score: Number(e.target.value) })}
              style={{ width: "100%", accentColor: LIFESTYLE_COLOR }}
            />
          </Row>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              background: LIFESTYLE_COLOR,
              border: "none",
              color: "#fff",
              padding: "11px 14px",
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
              borderRadius: 3,
              justifySelf: "start",
            }}
          >
            {saving ? "SALVANDO..." : routine ? "ATUALIZAR ROTINA" : "SALVAR ROTINA"}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: "#7a7a7a", marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8e8e8",
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 13,
  borderRadius: 3,
};
