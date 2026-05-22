import { useEffect, useState } from "react";
import { AlertTriangle, Sparkles, Activity } from "lucide-react";
import {
  getApexTrainingRules,
  type ApexTrainingBridgeResult,
} from "@/utils/apexTrainingBridge";

interface Props {
  athleteId: string | null | undefined;
}

const AMBER = "#E8A020";
const AMBER_DIM = "rgba(232,160,32,0.08)";
const BORDER = "rgba(232,160,32,0.25)";
const RED = "#ef4444";
const RED_DIM = "rgba(239,68,68,0.08)";
const TEXT = "#fff8eb";
const TEXT_DIM = "#a8a29e";
const TEXT_MUTED = "#78716c";
const FONT = "'Space Grotesk', sans-serif";

export default function ApexBridgePanel({ athleteId }: Props) {
  const [data, setData] = useState<ApexTrainingBridgeResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!athleteId) {
      setData(null);
      return;
    }
    setLoading(true);
    getApexTrainingRules(athleteId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [athleteId]);

  if (!athleteId || loading || !data || !data.achadosAtivos.length) return null;

  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{
        background: "linear-gradient(135deg, rgba(232,160,32,0.06), rgba(232,160,32,0.02))",
        border: `1px solid ${BORDER}`,
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: AMBER_DIM, border: `1px solid ${BORDER}` }}
        >
          <Sparkles className="w-4 h-4" style={{ color: AMBER }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold" style={{ color: AMBER }}>
            APEX integrado — treino adaptado
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: TEXT_DIM }}>
            {data.corretivos.length} corretivos sugeridos · {data.contraindicados.length} exercícios monitorados ·
            baseado na análise postural mais recente
          </div>
        </div>
      </div>

      {/* Achados ativos */}
      <div className="flex flex-wrap gap-1.5">
        {data.achadosAtivos.map((a) => (
          <span
            key={a.key}
            className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider"
            style={{
              background: AMBER_DIM,
              color: AMBER,
              border: `1px solid ${BORDER}`,
            }}
          >
            {a.label} · {a.graus}°
          </span>
        ))}
      </div>

      {/* Corretivos */}
      {data.corretivos.length > 0 && (
        <div className="space-y-2">
          <div
            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: AMBER }}
          >
            <Activity className="w-3 h-3" />
            Corretivos para injetar no aquecimento
          </div>
          <div className="grid gap-2">
            {data.corretivos.map((c, i) => (
              <div
                key={i}
                className="rounded-lg p-3"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[13px] font-semibold" style={{ color: TEXT }}>
                    {c.nome}
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap"
                    style={{ background: AMBER, color: "#0a0a0a" }}
                  >
                    APEX
                  </span>
                </div>
                <div className="text-[11px] mt-1" style={{ color: TEXT_DIM }}>
                  {c.series}x{c.reps}
                  {c.tempo ? ` · ${c.tempo}` : ""}
                </div>
                <div className="text-[10px] mt-1 italic" style={{ color: TEXT_MUTED }}>
                  → {c.foco}
                </div>
                <div className="text-[9px] mt-1 uppercase tracking-wider" style={{ color: AMBER, opacity: 0.7 }}>
                  origem: {c.origem}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contraindicados */}
      {data.contraindicados.length > 0 && (
        <div className="space-y-2">
          <div
            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: RED }}
          >
            <AlertTriangle className="w-3 h-3" />
            Padrões monitorados (decisão final do coach)
          </div>
          <div className="grid gap-1.5">
            {data.contraindicados.map((c, i) => (
              <div
                key={i}
                className="rounded-lg p-2.5 flex items-start gap-2"
                style={{ background: RED_DIM, border: `1px solid rgba(239,68,68,0.25)` }}
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: RED }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold capitalize" style={{ color: TEXT }}>
                    {c.padrao}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: TEXT_DIM }}>
                    {c.motivo}
                  </div>
                  <div className="text-[9px] mt-1 uppercase tracking-wider" style={{ color: RED, opacity: 0.7 }}>
                    achado: {c.origem}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Músculos alvo */}
      {data.musculosAlvo.length > 0 && (
        <div
          className="text-[10px] pt-2"
          style={{ color: TEXT_MUTED, borderTop: `1px solid ${BORDER}` }}
        >
          <span className="uppercase tracking-wider font-bold" style={{ color: TEXT_DIM }}>
            Ativação prioritária:
          </span>{" "}
          {data.musculosAlvo.join(" · ")}
        </div>
      )}
    </div>
  );
}
