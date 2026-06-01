// MERIDIAN — Briefing tático IA consolidado (Drug Tests + Multi-Show + Recovery).
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  planId: string;
  competitionId: string;
}

interface SectionAssessment {
  status: "VERDE" | "AMARELO" | "VERMELHO" | "NA";
  headline: string;
  ordens: string[];
  alertas: string[];
}

interface Briefing {
  drug_tests: SectionAssessment;
  multi_show: SectionAssessment;
  recovery: SectionAssessment;
  generated_at: string;
  model: string;
}

const ACCENT = "#B8922A";

const STATUS_COLORS: Record<string, string> = {
  VERDE: "#4ade80",
  AMARELO: "#facc15",
  VERMELHO: "#ef4444",
  NA: "#7a7a7a",
};

export default function MeridianTacticalIntel({ planId, competitionId }: Props) {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("meridian-tactical-intel", {
        body: { plan_id: planId, competition_id: competitionId },
      });
      if (err) throw err;
      if ((data as any)?.error) throw new Error((data as any).error);
      setBriefing((data as any)?.briefing);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao gerar briefing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(184,146,42,0.05)",
        border: "1px solid rgba(184,146,42,0.35)",
        borderLeft: `4px solid ${ACCENT}`,
        padding: 18,
        borderRadius: 4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: ACCENT }}>
          SITREP // TACTICAL INTEL BRIEFING
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: loading ? "rgba(184,146,42,0.3)" : ACCENT,
            color: "#0a0a0a",
            border: "none",
            padding: "6px 14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10,
            letterSpacing: 2,
            cursor: loading ? "wait" : "pointer",
            borderRadius: 3,
            fontWeight: 700,
          }}
        >
          {loading ? "ANALISANDO..." : briefing ? "▶ REGENERAR" : "▶ GERAR BRIEFING"}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 12, color: "#fcd5d5", padding: 8, background: "rgba(239,68,68,0.1)", borderRadius: 3, marginBottom: 10 }}>
          {error}
        </div>
      )}

      {!briefing && !loading && !error && (
        <div style={{ fontSize: 12, color: "#7a7a7a", fontStyle: "italic" }}>
          Aguardando ordem para gerar briefing tático consolidado (drug tests + multi-show + recovery).
        </div>
      )}

      {briefing && (
        <div style={{ display: "grid", gap: 12 }}>
          <Section title="DRUG TESTS / COMPLIANCE" data={briefing.drug_tests} />
          <Section title="MULTI-SHOW CHAIN" data={briefing.multi_show} />
          <Section title="RECOVERY PÓS-PALCO" data={briefing.recovery} />
          <div style={{ fontSize: 9, color: "#5a5a5a", letterSpacing: 1, textAlign: "right" }}>
            {briefing.model} · {new Date(briefing.generated_at).toLocaleString("pt-BR")}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, data }: { title: string; data: SectionAssessment }) {
  const color = STATUS_COLORS[data.status] ?? "#7a7a7a";
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        padding: 12,
        borderRadius: 3,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: "#7a7a7a" }}>{title}</div>
        <div
          style={{
            padding: "3px 8px",
            border: `1px solid ${color}55`,
            color,
            fontSize: 9,
            letterSpacing: 1.5,
            fontWeight: 700,
            borderRadius: 2,
          }}
        >
          {data.status}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#e8e8e8", marginBottom: 8, lineHeight: 1.4 }}>{data.headline}</div>
      {data.ordens.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1.5, marginBottom: 4 }}>ORDENS</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#cfcfcf", lineHeight: 1.5 }}>
            {data.ordens.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}
      {data.alertas.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: "#ef4444", letterSpacing: 1.5, marginBottom: 4 }}>ALERTAS</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#fcd5d5", lineHeight: 1.5 }}>
            {data.alertas.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
