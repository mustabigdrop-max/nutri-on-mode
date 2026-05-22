import { useState } from "react";
import {
  ZONE_CONFIG,
  detectZoneFromString,
  isRIRCompatibleWithZone,
  suggestRIRForZone,
  validateTriple,
  type RepZone,
  type WavePattern,
} from "@/utils/repZones";

// ─────── Badge de Zona ───────
export function RepZoneBadge({
  reps,
  compact = false,
}: {
  reps: string | number | undefined | null;
  compact?: boolean;
}) {
  const zona = detectZoneFromString(reps);
  const cfg = ZONE_CONFIG[zona];

  if (compact) {
    return (
      <span
        title={`${cfg.label} · ${cfg.faixa} · ${cfg.adaptacao}`}
        style={{
          fontSize: 9, fontWeight: 600,
          color: cfg.cor, background: cfg.bg,
          border: `0.5px solid ${cfg.border}`,
          borderRadius: 6, padding: "1px 5px",
        }}
      >
        Z{zona}
      </span>
    );
  }

  return (
    <span
      title={`${cfg.adaptacao} · ${cfg.carga}`}
      style={{
        fontSize: 10, fontWeight: 600,
        color: cfg.cor, background: cfg.bg,
        border: `0.5px solid ${cfg.border}`,
        borderRadius: 8, padding: "1px 7px",
      }}
    >
      {cfg.label} · {cfg.faixa}
    </span>
  );
}

// ─────── Alerta RIR × Zona ───────
export function ZoneRIRCompatibilityAlert({
  zona, rir,
}: { zona: RepZone; rir: number }) {
  if (isRIRCompatibleWithZone(rir, zona)) return null;
  const suggested = suggestRIRForZone(zona);
  const cfg = ZONE_CONFIG[zona];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 8px", marginTop: 6,
      background: "rgba(239,68,68,0.08)",
      border: "0.5px solid rgba(239,68,68,0.2)",
      borderRadius: 7,
    }}>
      <span style={{ fontSize: 11 }}>⚠</span>
      <p style={{ fontSize: 10, color: "rgba(239,68,68,0.8)", margin: 0, lineHeight: 1.4 }}>
        RIR {rir} incomum para {cfg.label}. Sugerido: RIR {suggested}
      </p>
    </div>
  );
}

// ─────── Indicador de Coerência Tripla ───────
export function TripleCoherenceMarker({
  exerciseName, reps, rir,
}: {
  exerciseName: string;
  reps: string | number | undefined | null;
  rir: number;
}) {
  const v = validateTriple(exerciseName, reps, rir);
  if (v.valido)
    return <span style={{ fontSize: 9, color: "rgba(52,211,153,0.6)" }}>✓</span>;
  return (
    <span
      title={v.avisos.join(" · ")}
      style={{ fontSize: 9, color: "rgba(251,191,36,0.7)", cursor: "help" }}
    >
      ⚠
    </span>
  );
}

// ─────── Painel de Ondulação por Sessão ───────
export function SessionZonePanel({
  exercises, weekZones, patternName,
}: {
  exercises: any[];
  weekZones: RepZone[];
  patternName: string;
}) {
  const [open, setOpen] = useState(false);
  const zoneCounts: Partial<Record<RepZone, number>> = {};
  for (const ex of exercises) {
    const z = detectZoneFromString(ex?.reps ?? "10");
    zoneCounts[z] = (zoneCounts[z] ?? 0) + 1;
  }
  const missingZones = weekZones.filter((z) => !zoneCounts[z]);
  const hasGaps = missingZones.length > 0;

  return (
    <div style={{
      margin: "0 0 12px",
      background: "rgba(255,255,255,0.03)",
      border: `0.5px solid ${hasGaps ? "rgba(251,191,36,0.3)" : "rgba(184,146,42,0.2)"}`,
      borderRadius: 10, overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#B8922A" }}>
            Ondulação · {patternName}
          </span>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {weekZones.map((z) => {
              const cfg = ZONE_CONFIG[z];
              const count = zoneCounts[z] ?? 0;
              return (
                <span key={z} style={{
                  fontSize: 9, fontWeight: 600,
                  color: count > 0 ? cfg.cor : "rgba(255,255,255,0.2)",
                  background: count > 0 ? cfg.bg : "rgba(255,255,255,0.04)",
                  border: `0.5px solid ${count > 0 ? cfg.border : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 6, padding: "1px 5px",
                }}>
                  Z{z} ×{count}
                </span>
              );
            })}
          </div>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 14px 12px" }}>
          <div style={{
            display: "flex", height: 6, borderRadius: 4, overflow: "hidden",
            marginBottom: 10, gap: 1,
          }}>
            {weekZones.map((z) => {
              const cfg = ZONE_CONFIG[z];
              const count = zoneCounts[z] ?? 0;
              const total = exercises.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={z} style={{
                  width: `${pct}%`,
                  background: count > 0 ? cfg.cor : "rgba(255,255,255,0.08)",
                  minWidth: count > 0 ? 4 : 0,
                  transition: "width .3s",
                }} />
              );
            })}
          </div>

          {weekZones.map((z) => {
            const cfg = ZONE_CONFIG[z];
            const count = zoneCounts[z] ?? 0;
            return (
              <div key={z} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: 6, padding: "6px 8px",
                background: count > 0 ? cfg.bg : "rgba(255,255,255,0.03)",
                borderRadius: 7,
              }}>
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: count > 0 ? cfg.cor : "rgba(255,255,255,0.3)",
                  }}>
                    {cfg.label} · {cfg.faixa}
                  </span>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>
                    {cfg.adaptacao}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: count > 0 ? cfg.cor : "rgba(255,255,255,0.2)",
                }}>
                  {count} ex.
                </span>
              </div>
            );
          })}

          {hasGaps && (
            <p style={{
              fontSize: 10, color: "rgba(251,191,36,0.7)",
              margin: "6px 0 0", fontStyle: "italic",
            }}>
              ⚠ Zonas sem exercícios: {missingZones.map((z) => ZONE_CONFIG[z].label).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
