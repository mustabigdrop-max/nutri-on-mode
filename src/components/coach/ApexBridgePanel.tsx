import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Sparkles, Activity, Copy, Check } from "lucide-react";
import {
  getApexTrainingRules,
  type ApexTrainingBridgeResult,
} from "@/utils/apexTrainingBridge";
import { findExerciseProfile, PROFILE_CONFIG } from "@/utils/exerciseProfiles";
import {
  APEX_TO_PROFILE_MAP,
  generateApexCorrectionProtocol,
  type AchadoClinico,
} from "@/utils/apexProfileBridge";

interface Props {
  athleteId: string | null | undefined;
}

const AMBER = "#E8A020";
const AMBER_DIM = "rgba(232,160,32,0.08)";
const BORDER = "rgba(232,160,32,0.25)";
const RED = "#ef4444";
const RED_DIM = "rgba(239,68,68,0.08)";
const GREEN = "#34D399";
const TEXT = "#fff8eb";
const TEXT_DIM = "#a8a29e";
const TEXT_MUTED = "#78716c";
const FONT = "'Space Grotesk', sans-serif";

export default function ApexBridgePanel({ athleteId }: Props) {
  const [data, setData] = useState<ApexTrainingBridgeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Ordenar corretivos: ALONGADO primeiro (SMH priority)
  const corretivosOrdenados = useMemo(() => {
    if (!data?.corretivos) return [];
    return [...data.corretivos].sort((a, b) => {
      const pa = findExerciseProfile(a.nome)?.perfil;
      const pb = findExerciseProfile(b.nome)?.perfil;
      if (pa === "ALONGADO" && pb !== "ALONGADO") return -1;
      if (pb === "ALONGADO" && pa !== "ALONGADO") return 1;
      return 0;
    });
  }, [data?.corretivos]);

  // Músculos inibidos derivados do mapa APEX→Perfil
  const musculosInibidos = useMemo(() => {
    if (!data?.achadosAtivos) return [] as string[];
    const set = new Set<string>();
    for (const a of data.achadosAtivos) {
      const rules = APEX_TO_PROFILE_MAP[a.key];
      rules?.forEach((r) => set.add(r.musculo_inibido));
    }
    return Array.from(set);
  }, [data?.achadosAtivos]);

  const smhCount = useMemo(
    () =>
      corretivosOrdenados.filter(
        (c) => findExerciseProfile(c.nome)?.perfil === "ALONGADO",
      ).length,
    [corretivosOrdenados],
  );

  const handleCopy = async () => {
    if (!data?.achadosAtivos) return;
    const achados: AchadoClinico[] = data.achadosAtivos.map((a) => ({
      key: a.key,
      titulo: a.label,
      graus: a.graus,
    }));
    const text = generateApexCorrectionProtocol(achados);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

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
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors"
          style={{
            background: copied ? "rgba(52,211,153,0.15)" : AMBER_DIM,
            color: copied ? GREEN : AMBER,
            border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : BORDER}`,
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "copiado" : "copiar protocolo"}
        </button>
      </div>

      {/* SMH Banner — Perfil de Resistência ativo */}
      {smhCount > 0 && (
        <div
          className="rounded-lg p-3"
          style={{
            background: "rgba(52,211,153,0.06)",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <div className="text-[11px] font-bold mb-1" style={{ color: GREEN }}>
            APEX + Perfil de Resistência ativo
          </div>
          <div className="text-[10px] leading-relaxed" style={{ color: TEXT_DIM }}>
            {smhCount} exercício{smhCount > 1 ? "s" : ""} no perfil{" "}
            <span style={{ color: GREEN, fontWeight: 600 }}>ALONGADO</span>{" "}
            priorizado{smhCount > 1 ? "s" : ""} no aquecimento
            {musculosInibidos.length > 0 && (
              <>
                {" "}para os músculos inibidos:{" "}
                <span style={{ color: TEXT }}>{musculosInibidos.join(", ")}</span>
              </>
            )}
            .
          </div>
        </div>
      )}

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
      {corretivosOrdenados.length > 0 && (
        <div className="space-y-2">
          <div
            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: AMBER }}
          >
            <Activity className="w-3 h-3" />
            Corretivos para injetar no aquecimento
          </div>
          <div className="grid gap-2">
            {corretivosOrdenados.map((c, i) => {
              const profile = findExerciseProfile(c.nome);
              const cfg = profile ? PROFILE_CONFIG[profile.perfil] : null;
              const isSMH = profile?.perfil === "ALONGADO";
              return (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="text-[13px] font-semibold flex-1 min-w-0" style={{ color: TEXT }}>
                      {c.nome}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap"
                        style={{ background: AMBER, color: "#0a0a0a" }}
                      >
                        APEX
                      </span>
                      {cfg && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap"
                          style={{
                            color: cfg.color,
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                          }}
                          title={cfg.tip}
                        >
                          {cfg.icon} {cfg.label}
                        </span>
                      )}
                      {isSMH && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap"
                          style={{
                            color: "rgba(52,211,153,0.85)",
                            background: "rgba(52,211,153,0.08)",
                            border: "1px solid rgba(52,211,153,0.25)",
                          }}
                          title="Stretched-Mediated Hypertrophy"
                        >
                          SMH
                        </span>
                      )}
                    </div>
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
              );
            })}
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
