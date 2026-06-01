// MERIDIAN — Peak Week protocol UI (7 dias finais).
import { useState } from "react";
import { useMeridianPeakWeek } from "@/hooks/useMeridianPeakWeek";

interface Props {
  planId: string;
  competitionId: string;
  peakStartDate: string;
}

const DAY_LABELS = ["D-6", "D-5", "D-4", "D-3 Depleção", "D-2 Carb-up", "D-1 Saturação", "STAGE"];
const ACCENT = "#f0c040";

export default function MeridianPeakWeekProtocol({ planId, competitionId, peakStartDate }: Props) {
  const { protocol, loading, saving, upsert, initialize, defaults } = useMeridianPeakWeek(
    planId, competitionId, peakStartDate,
  );
  const [editingNotes, setEditingNotes] = useState("");

  if (loading) return <Shell>Carregando protocolo...</Shell>;

  if (!protocol) {
    return (
      <Shell>
        <div style={{ fontSize: 12, color: "#b8b8b8", marginBottom: 10 }}>
          Peak Week ainda não configurada. Inicializa com protocolo padrão (depleção D-3, carb-up D-2/D-1)?
        </div>
        <button onClick={initialize} disabled={saving} style={btnPrimary}>
          {saving ? "Configurando..." : "▶ ATIVAR PEAK WEEK"}
        </button>
      </Shell>
    );
  }

  const rows = [
    { key: "water_liters", label: "Água (L)", values: protocol.water_liters },
    { key: "sodium_mg", label: "Sódio (mg)", values: protocol.sodium_mg },
    { key: "potassium_mg", label: "Potássio (mg)", values: protocol.potassium_mg },
    { key: "carbs_grams", label: "Carbs (g)", values: protocol.carbs_grams },
    { key: "posing_minutes", label: "Posing (min)", values: protocol.posing_minutes },
  ];

  return (
    <Shell>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 560 }}>
          <thead>
            <tr>
              <th style={th}>Métrica</th>
              {DAY_LABELS.map((d) => (
                <th key={d} style={{ ...th, color: d === "STAGE" ? ACCENT : "#7a7a7a" }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td style={tdLabel}>{r.label}</td>
                {Array.from({ length: 7 }).map((_, i) => (
                  <td key={i} style={td}>{r.values?.[i] ?? defaults[r.key as keyof typeof defaults]?.[i] ?? "—"}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={tdLabel}>Treino</td>
              <td colSpan={7} style={{ ...td, textAlign: "left", paddingLeft: 8, color: "#cfcfcf" }}>
                {protocol.training_focus?.join(" → ")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: "#cfcfcf" }}>
        <strong style={{ color: ACCENT }}>Bronzeamento:</strong> {protocol.tanning_schedule ?? defaults.tanning_schedule}
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 10, letterSpacing: 2, color: "#7a7a7a" }}>NOTAS OPERACIONAIS</label>
        <textarea
          value={editingNotes || protocol.notes || ""}
          onChange={(e) => setEditingNotes(e.target.value)}
          rows={2}
          placeholder="Ex: cortar fibra D-2, gengibre nos refeeds, posing com salto..."
          style={textarea}
        />
        <button
          onClick={() => upsert({ notes: editingNotes })}
          disabled={saving || !editingNotes}
          style={{ ...btnPrimary, marginTop: 8 }}
        >
          {saving ? "Salvando..." : "SALVAR NOTAS"}
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(240,192,64,0.05)",
      border: "1px solid rgba(240,192,64,0.35)",
      borderLeft: `4px solid ${ACCENT}`,
      padding: 18,
      borderRadius: 4,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: ACCENT, marginBottom: 12 }}>
        SITREP // PEAK WEEK — 7 DIAS FINAIS
      </div>
      {children}
    </div>
  );
}

const th: React.CSSProperties = { fontSize: 9, letterSpacing: 1.5, color: "#7a7a7a", padding: "8px 6px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" };
const td: React.CSSProperties = { padding: "8px 4px", textAlign: "center", color: "#e8e8e8", borderBottom: "1px solid rgba(255,255,255,0.04)" };
const tdLabel: React.CSSProperties = { ...td, textAlign: "left", paddingLeft: 8, fontSize: 11, color: "#b8b8b8", fontWeight: 600 };
const btnPrimary: React.CSSProperties = {
  background: ACCENT, color: "#0a0a0a", border: "none", padding: "10px 16px",
  fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: 2, cursor: "pointer", borderRadius: 3, fontWeight: 700,
};
const textarea: React.CSSProperties = {
  width: "100%", marginTop: 6, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8e8e8", padding: 10, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, borderRadius: 3, resize: "vertical",
};
