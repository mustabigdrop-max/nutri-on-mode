// MERIDIAN Bloco 9 — Briefing narrativo SITREP gerado por IA (Gemini 2.5 Flash).
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  planId: string;
}

const ACCENT = "#E8A020";

export default function MeridianNarrativeBriefing({ planId }: Props) {
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<string>("");

  async function generate() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("meridian-narrative", {
        body: { plan_id: planId },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      setNarrative((data as any)?.narrative ?? "");
    } catch (e: any) {
      const msg = e?.message ?? "Erro ao gerar briefing.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(232,160,32,0.05)",
        border: "1px solid rgba(232,160,32,0.35)",
        borderLeft: `4px solid ${ACCENT}`,
        padding: 18,
        borderRadius: 4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: ACCENT }}>
          SITREP // BRIEFING TÁTICO IA
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: ACCENT,
            color: "#0a0a0a",
            border: "none",
            padding: "8px 14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: 2,
            cursor: loading ? "wait" : "pointer",
            borderRadius: 3,
            fontWeight: 700,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "GERANDO..." : narrative ? "▶ REGENERAR" : "▶ GERAR BRIEFING"}
        </button>
      </div>

      {narrative ? (
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            lineHeight: 1.7,
            color: "#e8e8e8",
            background: "rgba(0,0,0,0.3)",
            padding: 14,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {narrative}
        </pre>
      ) : (
        <div style={{ fontSize: 12, color: "#7a7a7a", fontStyle: "italic" }}>
          Gere o briefing semanal com base no plano, checkpoints recentes e alertas de viabilidade. Linguagem SITREP, sem prescrição médica.
        </div>
      )}
    </div>
  );
}
