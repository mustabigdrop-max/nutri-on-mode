// MERIDIAN — Drug test calendar (Track Natural — Bloco 4).
import { useState } from "react";
import { useMeridianDrugTests, type MeridianDrugTest } from "@/hooks/useMeridianDrugTests";
import { toast } from "@/hooks/use-toast";

interface Props {
  competitionId: string;
  planId?: string | null;
  federation: string;
}

const NATURAL_COLOR = "#4B5320";

const TEST_TYPES = [
  { value: "URINE", label: "Urina" },
  { value: "POLYGRAPH", label: "Polígrafo" },
  { value: "BLOOD", label: "Sangue" },
  { value: "SALIVA", label: "Saliva" },
  { value: "HAIR", label: "Cabelo" },
];

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Agendado", color: "#facc15" },
  { value: "COMPLETED", label: "Concluído", color: "#4ade80" },
  { value: "MISSED", label: "Perdido", color: "#ef4444" },
  { value: "WAIVED", label: "Dispensado", color: "#7a7a7a" },
];

const RESULT_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PASSED", label: "Aprovado" },
  { value: "FAILED", label: "Reprovado" },
];

export default function MeridianDrugTestCalendar({ competitionId, planId, federation }: Props) {
  const { tests, loading, create, update, remove } = useMeridianDrugTests(competitionId);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    federation,
    test_type: "URINE",
    scheduled_date: "",
    is_mandatory: true,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!draft.scheduled_date) {
      toast({ title: "Defina a data", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await create({
        competition_id: competitionId,
        plan_id: planId ?? null,
        federation: draft.federation,
        test_type: draft.test_type,
        scheduled_date: draft.scheduled_date,
        is_mandatory: draft.is_mandatory,
        notes: draft.notes || null,
        status: "SCHEDULED",
      });
      toast({ title: "Drug test agendado" });
      setShowForm(false);
      setDraft({ ...draft, scheduled_date: "", notes: "" });
    } catch (e: any) {
      toast({ title: "Falha ao agendar", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(75,83,32,0.04)",
        border: `1px solid ${NATURAL_COLOR}55`,
        borderLeft: `4px solid ${NATURAL_COLOR}`,
        padding: 18,
        borderRadius: 4,
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#e8e8e8",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a" }}>
            SITREP // DRUG TEST CALENDAR
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: NATURAL_COLOR, marginTop: 4 }}>
            FEDERAÇÃO: {federation}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          style={{
            background: NATURAL_COLOR,
            border: "none",
            color: "#fff",
            padding: "8px 14px",
            fontSize: 11,
            letterSpacing: 2,
            fontWeight: 600,
            cursor: "pointer",
            borderRadius: 3,
          }}
        >
          {showForm ? "× CANCELAR" : "+ AGENDAR TESTE"}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            display: "grid",
            gap: 10,
            padding: 14,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 3,
            marginBottom: 12,
          }}
        >
          <Row label="Federação">
            <input
              type="text"
              value={draft.federation}
              onChange={(e) => setDraft({ ...draft, federation: e.target.value })}
              style={inputStyle}
            />
          </Row>
          <Row label="Tipo de teste">
            <select
              value={draft.test_type}
              onChange={(e) => setDraft({ ...draft, test_type: e.target.value })}
              style={inputStyle}
            >
              {TEST_TYPES.map((t) => (
                <option key={t.value} value={t.value} style={{ background: "#0a0a0a" }}>
                  {t.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Data agendada">
            <input
              type="date"
              value={draft.scheduled_date}
              onChange={(e) => setDraft({ ...draft, scheduled_date: e.target.value })}
              style={inputStyle}
            />
          </Row>
          <Row label="Obrigatório?">
            <label style={{ display: "flex", gap: 6, alignItems: "center", color: "#b8b8b8", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={draft.is_mandatory}
                onChange={(e) => setDraft({ ...draft, is_mandatory: e.target.checked })}
              />
              Sim, exigido pela federação
            </label>
          </Row>
          <Row label="Notas">
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Row>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            style={{
              background: NATURAL_COLOR,
              border: "none",
              color: "#fff",
              padding: "10px 14px",
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              cursor: submitting ? "wait" : "pointer",
              borderRadius: 3,
            }}
          >
            {submitting ? "SALVANDO..." : "CONFIRMAR AGENDAMENTO"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: 12, color: "#7a7a7a" }}>Carregando...</div>
      ) : tests.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: "#7a7a7a",
            padding: 14,
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 3,
          }}
        >
          Nenhum drug test agendado. Cadastre o calendário oficial da federação.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {tests.map((t) => (
            <TestRow key={t.id} test={t} onUpdate={update} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function TestRow({
  test,
  onUpdate,
  onDelete,
}: {
  test: MeridianDrugTest;
  onUpdate: (id: string, patch: Partial<MeridianDrugTest>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === test.status) ?? STATUS_OPTIONS[0];
  const isPast = new Date(test.scheduled_date) < new Date(new Date().toISOString().slice(0, 10));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto",
        gap: 10,
        alignItems: "center",
        padding: 10,
        background: "rgba(0,0,0,0.25)",
        border: `1px solid ${statusMeta.color}33`,
        borderLeft: `3px solid ${statusMeta.color}`,
        borderRadius: 3,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e8e8" }}>
          {test.test_type} · {test.federation}
        </div>
        <div style={{ fontSize: 11, color: "#7a7a7a", marginTop: 2 }}>
          {new Date(test.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR")}
          {test.is_mandatory && " · obrigatório"}
          {test.notes && ` · ${test.notes}`}
        </div>
      </div>
      <select
        value={test.status}
        onChange={(e) => onUpdate(test.id, { status: e.target.value })}
        style={{ ...inputStyle, padding: "6px 8px", fontSize: 11, width: 130 }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value} style={{ background: "#0a0a0a" }}>
            {s.label}
          </option>
        ))}
      </select>
      {(test.status === "COMPLETED" || isPast) && (
        <select
          value={test.result ?? "PENDING"}
          onChange={(e) => onUpdate(test.id, { result: e.target.value })}
          style={{ ...inputStyle, padding: "6px 8px", fontSize: 11, width: 110 }}
        >
          {RESULT_OPTIONS.map((r) => (
            <option key={r.value} value={r.value} style={{ background: "#0a0a0a" }}>
              {r.label}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={() => {
          if (confirm("Remover este drug test?")) onDelete(test.id);
        }}
        style={{
          background: "transparent",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#ef4444",
          padding: "5px 9px",
          fontSize: 11,
          cursor: "pointer",
          borderRadius: 2,
        }}
      >
        ×
      </button>
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
