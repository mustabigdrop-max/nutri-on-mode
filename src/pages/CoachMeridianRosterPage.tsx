// MERIDIAN — Página COACH: roster de atletas em prep.
import { ArrowLeft, AlertTriangle, FlaskConical, Target, Plus, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMeridianCoachRoster, type MeridianRosterRow } from "@/hooks/useMeridianCoachRoster";
import { useMeridianPendingAthletes } from "@/hooks/useMeridianPendingAthletes";


const ACCENT = "#B8922A";

const CATEGORY_LABEL: Record<string, string> = {
  OPEN_BODYBUILDING: "Open Bodybuilding",
  BODYBUILDING_212: "Bodybuilding 212",
  CLASSIC_PHYSIQUE: "Classic Physique",
  MENS_PHYSIQUE: "Men's Physique",
  WHEELCHAIR_BODYBUILDING: "Wheelchair BB",
  WOMENS_BODYBUILDING: "Women's BB",
  WOMENS_PHYSIQUE: "Women's Physique",
  FIGURE: "Figure",
  FITNESS: "Fitness",
  WELLNESS: "Wellness",
  BIKINI: "Bikini",
};

export default function CoachMeridianRosterPage() {
  const navigate = useNavigate();
  const { rows, loading, error, reload } = useMeridianCoachRoster();

  const critical = rows.filter(
    (r) =>
      r.viability_status === "RED" ||
      r.triad_severity === "RED" ||
      (r.days_to_stage != null && r.days_to_stage <= 14),
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#03030a",
        color: "#e8e8e8",
        fontFamily: "'Space Grotesk', sans-serif",
        padding: "24px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/coach/dashboard")}
          style={{
            background: "transparent",
            border: "none",
            color: "#999",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} /> COACH DASHBOARD
        </button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: ACCENT, marginBottom: 6 }}>
            COACH · MERIDIAN ROSTER
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e8e8e8", letterSpacing: 1 }}>
            Atletas em prep
          </div>
          <div style={{ fontSize: 12, color: "#7a7a7a", marginTop: 4 }}>
            Todos os alunos vinculados com plano MERIDIAN ativo. Ordenado por proximidade do palco.
          </div>
        </div>

        {/* RESUMO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <Stat label="ATLETAS ATIVOS" value={String(rows.length)} />
          <Stat
            label="EM PEAK WEEK"
            value={String(rows.filter((r) => (r.days_to_stage ?? 999) <= 7).length)}
            color="#facc15"
          />
          <Stat
            label="RED-S FLAGS"
            value={String(rows.filter((r) => r.triad_severity === "RED").length)}
            color="#ef4444"
          />
          <Stat
            label="DRUG TESTS PRÓXIMOS"
            value={String(rows.filter((r) => !!r.next_drug_test_date).length)}
            color="#2a8a9e"
          />
        </div>

        {critical.length > 0 && (
          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderLeft: "4px solid #ef4444",
              padding: 14,
              borderRadius: 4,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: "#ef4444",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <AlertTriangle size={12} /> SITREP // ATENÇÃO TÁTICA
            </div>
            <div style={{ fontSize: 12, color: "#fcd5d5" }}>
              {critical.length} atleta(s) em estado crítico (viabilidade RED, RED-S ou ≤14d para palco). Priorize revisão.
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: 12,
              borderRadius: 4,
              color: "#ef4444",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: "#7a7a7a", fontSize: 13 }}>Carregando roster...</div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: 32,
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: 4,
              textAlign: "center",
              color: "#7a7a7a",
              fontSize: 13,
            }}
          >
            Nenhum atleta vinculado possui plano MERIDIAN ativo.
            <br />
            Acesse o painel do atleta e crie uma operação MERIDIAN para começar.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r) => (
              <RosterCard key={r.patient_user_id} row={r} onOpen={() => navigate(`/coach/meridian/${r.patient_user_id}`)} />
            ))}
          </div>
        )}

        <button
          onClick={reload}
          style={{
            marginTop: 18,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#999",
            padding: "8px 14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10,
            letterSpacing: 2,
            cursor: "pointer",
            borderRadius: 3,
          }}
        >
          ⟳ RECARREGAR ROSTER
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color = ACCENT }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        padding: 14,
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 3,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a7a7a", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function RosterCard({ row, onOpen }: { row: MeridianRosterRow; onOpen: () => void }) {
  const viabColor =
    row.viability_status === "GREEN"
      ? "#4ade80"
      : row.viability_status === "YELLOW"
      ? "#facc15"
      : row.viability_status === "RED"
      ? "#ef4444"
      : "#7a7a7a";

  const triadColor =
    row.triad_severity === "GREEN"
      ? "#4ade80"
      : row.triad_severity === "YELLOW"
      ? "#facc15"
      : row.triad_severity === "RED"
      ? "#ef4444"
      : null;

  const urgent = row.days_to_stage != null && row.days_to_stage <= 14;

  return (
    <button
      onClick={onOpen}
      style={{
        textAlign: "left",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${urgent ? "#ef4444" : "rgba(255,255,255,0.06)"}`,
        borderLeft: `3px solid ${ACCENT}`,
        padding: 14,
        borderRadius: 3,
        cursor: "pointer",
        color: "#e8e8e8",
        fontFamily: "'Space Grotesk', sans-serif",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,146,42,0.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e8e8e8" }}>{row.full_name}</div>
          <div style={{ fontSize: 11, color: "#7a7a7a", marginTop: 2 }}>
            {row.competition_name ?? "—"} ·{" "}
            {row.category ? CATEGORY_LABEL[row.category] ?? row.category : "—"} ·{" "}
            {row.federation ?? "—"}
            {row.is_natural_federation && (
              <span style={{ color: "#4ade80", marginLeft: 6 }}>NATURAL</span>
            )}
          </div>
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: urgent ? "#ef4444" : ACCENT,
            letterSpacing: 1,
          }}
        >
          {row.days_to_stage != null ? `${row.days_to_stage}d` : "—"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Pill label="VIAB" value={row.viability_status ?? "—"} color={viabColor} />
        {row.current_phase && <Pill label="FASE" value={row.current_phase} color="#7a7a7a" />}
        {row.stage_target_weight_kg && (
          <Pill
            label="ALVO"
            value={`${row.stage_target_weight_kg}kg · ${row.stage_target_bf_percent}%`}
            color={ACCENT}
            icon={<Target size={10} />}
          />
        )}
        {row.last_adherence_pct != null && (
          <Pill
            label="ADERÊNCIA"
            value={`${row.last_adherence_pct}%`}
            color={row.last_adherence_pct >= 80 ? "#4ade80" : row.last_adherence_pct >= 60 ? "#facc15" : "#ef4444"}
          />
        )}
        {triadColor && (
          <Pill
            label="TRIAD"
            value={row.triad_severity!}
            color={triadColor}
            icon={<AlertTriangle size={10} />}
          />
        )}
        {row.next_drug_test_date && (
          <Pill
            label="DRUG TEST"
            value={row.next_drug_test_date}
            color="#2a8a9e"
            icon={<FlaskConical size={10} />}
          />
        )}
      </div>
    </button>
  );
}

function Pill({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "4px 8px",
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${color}55`,
        borderRadius: 2,
        fontSize: 10,
        letterSpacing: 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {icon}
      <span style={{ color: "#7a7a7a" }}>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}
