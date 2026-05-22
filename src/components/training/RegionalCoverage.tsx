import { useState, useMemo } from "react";
import {
  findExerciseRegion,
  calcRegionCoverage,
  REGIONS_BY_MUSCLE,
  getApexRegionalPriorities,
  type MuscleRegion,
} from "@/utils/muscleRegions";

// ─── Badge de Porção ───
export function MuscleRegionBadge({ exerciseName }: { exerciseName: string }) {
  const region = findExerciseRegion(exerciseName);
  if (!region) return null;
  const cor =
    region.importancia === "CRITICA"
      ? "#B8922A"
      : region.importancia === "ALTA"
      ? "#38BDF8"
      : "rgba(255,255,255,0.3)";
  return (
    <span
      title={`Impacto: ${region.impacto_visual}`}
      style={{
        fontSize: 9, fontWeight: 500,
        color: cor,
        background: `${cor}12`,
        border: `0.5px solid ${cor}30`,
        borderRadius: 6, padding: "1px 6px",
      }}
    >
      {region.porcao}
      {region.importancia === "CRITICA" && (
        <span style={{ marginLeft: 3, fontSize: 8 }}>★</span>
      )}
    </span>
  );
}

// ─── Painel de Cobertura Regional ───
export function RegionalCoveragePanel({
  exercises,
  muscleGroups,
}: {
  exercises: { nome: string }[];
  muscleGroups?: string[];
}) {
  const [open, setOpen] = useState(false);

  // auto-detectar grupos cobertos pelos exercícios se não passados
  const groups = useMemo(() => {
    if (muscleGroups?.length) return muscleGroups;
    const set = new Set<string>();
    for (const ex of exercises) {
      const r = findExerciseRegion(ex.nome ?? "");
      if (r) set.add(r.musculo);
    }
    return Array.from(set);
  }, [muscleGroups, exercises]);

  const coverages = groups
    .map((m) => ({ musculo: m, coverage: calcRegionCoverage(exercises, m) }))
    .filter(
      (c) =>
        c.coverage.cobertas.length > 0 || c.coverage.faltando.length > 0,
    );

  if (!coverages.length) return null;
  const allCriticasOk = coverages.every((c) => c.coverage.criticas_ok);

  return (
    <div
      style={{
        margin: "0 0 12px",
        background: "rgba(255,255,255,0.03)",
        border: `0.5px solid ${
          allCriticasOk ? "rgba(184,146,42,0.2)" : "rgba(239,68,68,0.3)"
        }`,
        borderRadius: 10, overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11, fontWeight: 600,
              color: allCriticasOk ? "#B8922A" : "#EF4444",
            }}
          >
            {allCriticasOk ? "★" : "⚠"} Cobertura Regional
          </span>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {coverages.map((c) => (
              <span
                key={c.musculo}
                style={{
                  fontSize: 9,
                  color: c.coverage.criticas_ok
                    ? "rgba(184,146,42,0.8)"
                    : "rgba(239,68,68,0.8)",
                  background: c.coverage.criticas_ok
                    ? "rgba(184,146,42,0.1)"
                    : "rgba(239,68,68,0.1)",
                  border: `0.5px solid ${
                    c.coverage.criticas_ok
                      ? "rgba(184,146,42,0.25)"
                      : "rgba(239,68,68,0.25)"
                  }`,
                  borderRadius: 5, padding: "1px 5px",
                }}
              >
                {c.musculo} {c.coverage.score}%
              </span>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          {coverages.map(({ musculo, coverage }) => (
            <div key={musculo} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <p
                  style={{
                    fontSize: 10, fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {musculo}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 60, height: 4, borderRadius: 2,
                      background: "rgba(255,255,255,0.08)", overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${coverage.score}%`,
                        background:
                          coverage.score >= 80
                            ? "#34D399"
                            : coverage.score >= 50
                            ? "#FBBF24"
                            : "#EF4444",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.4)",
                      minWidth: 30,
                    }}
                  >
                    {coverage.score}%
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 5,
                }}
              >
                {coverage.cobertas.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      fontSize: 9, padding: "2px 7px",
                      background:
                        r.importancia === "CRITICA"
                          ? "rgba(184,146,42,0.15)"
                          : "rgba(52,211,153,0.1)",
                      border: `0.5px solid ${
                        r.importancia === "CRITICA"
                          ? "rgba(184,146,42,0.3)"
                          : "rgba(52,211,153,0.2)"
                      }`,
                      borderRadius: 6,
                      color: r.importancia === "CRITICA" ? "#B8922A" : "#34D399",
                    }}
                  >
                    ✓ {r.porcao}
                    {r.importancia === "CRITICA" && " ★"}
                  </span>
                ))}
              </div>

              {coverage.faltando.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {coverage.faltando.map((r) => (
                    <span
                      key={r.id}
                      style={{
                        fontSize: 9, padding: "2px 7px",
                        background:
                          r.importancia === "CRITICA"
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(255,255,255,0.04)",
                        border: `0.5px solid ${
                          r.importancia === "CRITICA"
                            ? "rgba(239,68,68,0.25)"
                            : "rgba(255,255,255,0.08)"
                        }`,
                        borderRadius: 6,
                        color:
                          r.importancia === "CRITICA"
                            ? "#EF4444"
                            : "rgba(255,255,255,0.3)",
                      }}
                    >
                      ○ {r.porcao}
                      {r.importancia === "CRITICA" && " ★"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Banner APEX → Porções prioritárias ───
export function ApexRegionalPriorities({ achados }: { achados: string[] }) {
  const priorities = getApexRegionalPriorities(achados);
  if (!priorities.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {priorities.map((r: MuscleRegion) => (
        <span
          key={r.id}
          title={r.impacto_visual}
          style={{
            fontSize: 9,
            color: "#B8922A",
            background: "rgba(184,146,42,0.1)",
            border: "0.5px solid rgba(184,146,42,0.25)",
            padding: "1px 6px",
            borderRadius: 5,
          }}
        >
          ★ {r.porcao}
        </span>
      ))}
    </div>
  );
}
