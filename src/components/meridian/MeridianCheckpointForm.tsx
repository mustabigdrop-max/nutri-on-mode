// MERIDIAN — Formulário de Checkpoint Semanal (Bloco 3).
import { useState } from "react";
import { useMeridianCheckpoints } from "@/hooks/useMeridianCheckpoints";
import { getCurrentPhase } from "@/lib/meridian/calculator";
import { PHASE_LABELS, type MeridianPlan } from "@/lib/meridian/types";

const ACCENT = "#B8922A";

interface Props {
  plan: MeridianPlan;
  competitionId: string;
  onSubmitted?: () => void;
}

export default function MeridianCheckpointForm({ plan, competitionId, onSubmitted }: Props) {
  const { submitCheckpoint, recalibrate } = useMeridianCheckpoints(plan.id);
  const [weight, setWeight] = useState("");
  const [bf, setBf] = useState("");
  const [waist, setWaist] = useState("");
  const [energy, setEnergy] = useState(7);
  const [hunger, setHunger] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [perf, setPerf] = useState(7);
  const [mood, setMood] = useState(7);
  const [adherence, setAdherence] = useState(85);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sitrep, setSitrep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPhase = getCurrentPhase(plan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSitrep(null);
    if (!weight) {
      setError("Peso é obrigatório.");
      return;
    }
    setSubmitting(true);
    try {
      const cp = await submitCheckpoint({
        plan_id: plan.id,
        competition_id: competitionId,
        current_phase: currentPhase,
        weight_kg: Number(weight),
        bf_percent: bf ? Number(bf) : null,
        waist_cm: waist ? Number(waist) : null,
        energy_level: energy,
        hunger_level: hunger,
        sleep_quality: sleep,
        training_performance: perf,
        mood,
        adherence_pct: adherence,
        notes: notes || null,
      });
      const adj = await recalibrate(cp.id);
      setSitrep(adj?.reason ?? "Checkpoint registrado.");
      // Fire-and-forget: análise narrativa IA por checkpoint
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase.functions
          .invoke("meridian-checkpoint-narrative", { body: { checkpoint_id: cp.id } })
          .catch((err) => console.warn("[meridian] checkpoint narrative falhou:", err));
      });
      onSubmitted?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#e8e8e8",
        display: "grid",
        gap: 14,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 18,
        borderRadius: 4,
      }}
    >
      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a", marginBottom: 4 }}>
          CHECKPOINT SEMANAL // {PHASE_LABELS[currentPhase]}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>SITREP DE CAMPO</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <NumField label="PESO (kg)" value={weight} setValue={setWeight} step="0.1" />
        <NumField label="BF (%)" value={bf} setValue={setBf} step="0.1" />
        <NumField label="CINTURA (cm)" value={waist} setValue={setWaist} step="0.1" />
      </div>

      <SliderField label="ENERGIA" value={energy} setValue={setEnergy} />
      <SliderField label="FOME" value={hunger} setValue={setHunger} />
      <SliderField label="QUALIDADE DO SONO" value={sleep} setValue={setSleep} />
      <SliderField label="PERFORMANCE NO TREINO" value={perf} setValue={setPerf} />
      <SliderField label="HUMOR" value={mood} setValue={setMood} />
      <SliderField label="ADERÊNCIA (%)" value={adherence} setValue={setAdherence} max={100} />

      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a", marginBottom: 4 }}>
          NOTAS DE CAMPO
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e8e8e8",
            padding: 10,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            borderRadius: 3,
            resize: "vertical",
          }}
        />
      </div>

      {error && (
        <div style={{ color: "#ef4444", fontSize: 12 }}>⚠ {error}</div>
      )}

      {sitrep && (
        <div
          style={{
            background: "rgba(184,146,42,0.08)",
            borderLeft: `3px solid ${ACCENT}`,
            padding: 12,
            fontSize: 12,
            color: "#e8e8e8",
            borderRadius: 3,
          }}
        >
          <strong style={{ color: ACCENT, letterSpacing: 2, fontSize: 10 }}>
            SITREP // RECALIBRAÇÃO
          </strong>
          <div style={{ marginTop: 4 }}>{sitrep}</div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          background: ACCENT,
          color: "#000",
          border: "none",
          padding: "12px 16px",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12,
          letterSpacing: 3,
          fontWeight: 700,
          cursor: submitting ? "wait" : "pointer",
          borderRadius: 3,
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? "PROCESSANDO..." : "▶ REGISTRAR E RECALIBRAR"}
      </button>
    </form>
  );
}

function NumField({
  label,
  value,
  setValue,
  step = "1",
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  step?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: "#7a7a7a", marginBottom: 4 }}>
        {label}
      </div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: "100%",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#e8e8e8",
          padding: "10px 12px",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14,
          borderRadius: 3,
        }}
      />
    </div>
  );
}

function SliderField({
  label,
  value,
  setValue,
  max = 10,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          letterSpacing: 2,
          color: "#7a7a7a",
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#B8922A", fontWeight: 700 }}>
          {value}/{max}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#B8922A" }}
      />
    </div>
  );
}
