import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mceSounds } from "@/lib/mceSounds";

const C = {
  s1: "#0B0B12", s2: "#10101A", s3: "#181824",
  border: "#ffffff08", cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", orange: "#F97316", muted: "#4A4A5A", dim: "#333340",
  text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

export type PatternAnalysis = {
  pattern_detected?: boolean;
  risk_level?: string;
  pattern_name?: string;
  explanation?: string;
  micro_intervention?: { exercise?: string; instruction?: string; duration?: string; science?: string } | null;
  audio_suggestion?: string;
  streak_risk?: string;
  prediction?: string;
};

type Props = {
  scores: Record<string, number>;
  streak: number;
  hour: number;
  doneItems: number;
  totalItems: number;
  weakBlock?: { name: string; pct: number } | null;
  weakPillar: string;
  soundEnabled: boolean;
};

const RISK_COLORS: Record<string, string> = { baixo: C.green, médio: C.gold, alto: C.orange, crítico: C.red };

export default function McePatternDetector({ scores, streak, hour, doneItems, totalItems, weakBlock, weakPillar, soundEnabled }: Props) {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef(false);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("mce-forge", {
        body: {
          mode: "pattern_detect",
          scores, streak, hour, doneCount: doneItems, totalCount: totalItems,
          weakBlock: weakBlock?.name ?? null, weakBlockPct: weakBlock?.pct ?? 100, weakPillar,
        },
      });
      if (err) throw err;
      const res = data as PatternAnalysis;
      setAnalysis(res);
      if (soundEnabled && (res?.risk_level === "alto" || res?.risk_level === "crítico")) mceSounds.warning();
    } catch {
      setError("Não foi possível escanear padrões agora.");
    } finally {
      setLoading(false);
    }
  }, [scores, streak, hour, doneItems, totalItems, weakBlock, weakPillar, soundEnabled]);

  // Auto-detecta na tarde quando o dia está atrasado
  useEffect(() => {
    if (autoRan.current || dismissed) return;
    if (hour >= 12 && totalItems > 0 && doneItems / totalItems < 0.4) {
      autoRan.current = true;
      void detect();
    }
  }, [hour, doneItems, totalItems, dismissed, detect]);

  if (dismissed) return null;

  if (loading) {
    return (
      <div style={{ background: C.s1, border: `1px solid ${C.cyan}20`, padding: 14, marginBottom: 12, fontFamily: F.m, fontSize: 10, color: C.cyan, letterSpacing: 1 }}>
        ESCANEANDO PADRÕES COMPORTAMENTAIS…
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={detect}
          style={{
            width: "100%", padding: 12, background: `${C.cyan}0A`, border: `1px solid ${C.cyan}30`,
            color: C.cyan, fontFamily: F.t, fontSize: 14, fontWeight: 700, letterSpacing: 1, cursor: "pointer",
          }}
        >
          DETECTAR PADRÕES
        </button>
        {error && <p style={{ margin: "6px 0 0", fontFamily: F.b, fontSize: 11, color: C.red }}>{error}</p>}
      </div>
    );
  }

  const rc = RISK_COLORS[analysis.risk_level ?? ""] ?? C.muted;

  return (
    <div style={{ background: C.s1, border: `1px solid ${rc}30`, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1.5, color: "#020205", background: rc, padding: "2px 6px" }}>
            {(analysis.risk_level ?? "—").toUpperCase()}
          </span>
          <span style={{ fontFamily: F.t, fontSize: 16, fontWeight: 700, color: C.white }}>{analysis.pattern_name}</span>
        </div>
        <button onClick={() => setDismissed(true)} aria-label="Dispensar" style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 13 }}>✕</button>
      </div>

      <div style={{ padding: 14 }}>
        {analysis.explanation && (
          <p style={{ margin: "0 0 12px", fontFamily: F.b, fontSize: 12.5, lineHeight: 1.6, color: C.text }}>{analysis.explanation}</p>
        )}

        {analysis.micro_intervention && (
          <div style={{ background: `${C.purple}06`, border: `1px solid ${C.purple}20`, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.purple }}>MICRO-INTERVENÇÃO</span>
              <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{analysis.micro_intervention.duration}</span>
            </div>
            <p style={{ margin: "0 0 4px", fontFamily: F.t, fontSize: 15, fontWeight: 700, color: C.white }}>{analysis.micro_intervention.exercise}</p>
            <p style={{ margin: "0 0 6px", fontFamily: F.b, fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{analysis.micro_intervention.instruction}</p>
            <span style={{ fontFamily: F.m, fontSize: 9, color: C.muted }}>{analysis.micro_intervention.science}</span>
          </div>
        )}

        {analysis.audio_suggestion && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.s2, padding: "10px 12px", marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>🎧</span>
            <span style={{ fontFamily: F.b, fontSize: 12, color: C.text }}>Ouça agora: <strong style={{ color: C.cyan }}>{analysis.audio_suggestion}</strong></span>
          </div>
        )}

        {analysis.streak_risk && (
          <div style={{ background: `${C.orange}06`, border: `1px solid ${C.orange}20`, padding: 10, marginBottom: 10, fontFamily: F.b, fontSize: 12, color: C.text }}>
            🔥 {analysis.streak_risk}
          </div>
        )}

        {analysis.prediction && (
          <p style={{ margin: 0, fontFamily: F.m, fontSize: 10, color: C.muted, lineHeight: 1.6 }}>{analysis.prediction}</p>
        )}

        <button
          onClick={detect}
          style={{ marginTop: 12, width: "100%", padding: 10, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontFamily: F.m, fontSize: 9, letterSpacing: 1.5, cursor: "pointer" }}
        >
          RE-ESCANEAR
        </button>
      </div>
    </div>
  );
}
