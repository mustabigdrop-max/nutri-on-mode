// MERIDIAN — Análise narrativa IA por checkpoint (status, progresso, ajustes, alertas).
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ACCENT = "#B8922A";

type Status = "VERDE" | "AMARELO" | "VERMELHO";

interface Assessment {
  status?: Status;
  headline?: string;
  progresso?: string;
  ajustes?: string[];
  alertas?: string[];
  generated_at?: string;
}

interface Props {
  checkpointId: string;
  initial?: Assessment | null;
  onUpdated?: (a: Assessment) => void;
}

const STATUS_COLOR: Record<Status, string> = {
  VERDE: "#4ade80",
  AMARELO: "#f5c518",
  VERMELHO: "#ef4444",
};

export default function MeridianCheckpointNarrative({ checkpointId, initial, onUpdated }: Props) {
  const [assessment, setAssessment] = useState<Assessment | null>(initial ?? null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("meridian-checkpoint-narrative", {
        body: { checkpoint_id: checkpointId },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const a = (data as any)?.assessment ?? null;
      setAssessment(a);
      onUpdated?.(a);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao analisar checkpoint.");
    } finally {
      setLoading(false);
    }
  }

  const statusColor = assessment?.status ? STATUS_COLOR[assessment.status] : "#7a7a7a";

  return (
    <div
      style={{
        marginTop: 10,
        padding: 12,
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 3,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 2, color: ACCENT }}>
          ANÁLISE IA {assessment?.status ? `// ${assessment.status}` : ""}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: "transparent",
            color: ACCENT,
            border: `1px solid ${ACCENT}`,
            padding: "4px 10px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10,
            letterSpacing: 1.5,
            cursor: loading ? "wait" : "pointer",
            borderRadius: 2,
            fontWeight: 600,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "ANALISANDO..." : assessment ? "▶ REGENERAR" : "▶ ANALISAR"}
        </button>
      </div>

      {assessment ? (
        <div style={{ marginTop: 10, display: "grid", gap: 8, fontSize: 12, color: "#e8e8e8" }}>
          {assessment.headline && (
            <div style={{ fontWeight: 700, color: statusColor }}>{assessment.headline}</div>
          )}
          {assessment.progresso && (
            <Section label="PROGRESSO" color="#b8b8b8">
              {assessment.progresso}
            </Section>
          )}
          {assessment.ajustes && assessment.ajustes.length > 0 && (
            <Section label="ORDEM TÁTICA" color={ACCENT}>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {assessment.ajustes.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </Section>
          )}
          {assessment.alertas && assessment.alertas.length > 0 && (
            <Section label="ALERTAS" color="#ef4444">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {assessment.alertas.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 8, fontSize: 11, color: "#7a7a7a", fontStyle: "italic" }}>
          Sem análise IA neste checkpoint. Gere a leitura tática.
        </div>
      )}
    </div>
  );
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 2, color, marginBottom: 3 }}>{label}</div>
      <div style={{ color: "#e8e8e8", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}
