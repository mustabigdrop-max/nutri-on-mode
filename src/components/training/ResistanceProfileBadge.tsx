import { useState } from "react";
import {
  findExerciseProfile,
  PROFILE_CONFIG,
  calcProfileBalance,
  type ResistanceProfile,
} from "@/utils/exerciseProfiles";

export function ResistanceProfileBadge({
  exerciseName,
  showTip = true,
}: {
  exerciseName: string;
  showTip?: boolean;
}) {
  const profile = findExerciseProfile(exerciseName);
  if (!profile) return null;
  const cfg = PROFILE_CONFIG[profile.perfil];
  return (
    <span
      title={showTip ? cfg.tip : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `0.5px solid ${cfg.border}`,
        borderRadius: 8,
        padding: "1px 6px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 9 }}>{cfg.icon}</span>
      {cfg.label}
      {profile.porcao && profile.porcao !== profile.musculo_alvo && (
        <span style={{ fontSize: 8, color: `${cfg.color}AA`, marginLeft: 2 }}>
          · {profile.porcao}
        </span>
      )}
    </span>
  );
}

export function SessionProfilePanel({
  exercises,
}: {
  exercises: Array<{ name?: string; nome?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const balance = calcProfileBalance(exercises || []);
  if (balance.length === 0) return null;
  const hasGaps = balance.some(b => b.gaps.length > 0);

  return (
    <div
      style={{
        margin: "12px 0",
        background: "rgba(255,255,255,0.03)",
        border: `0.5px solid ${hasGaps ? "rgba(251,191,36,0.3)" : "rgba(52,211,153,0.2)"}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: hasGaps ? "#FBBF24" : "#34D399" }}>
            {hasGaps ? "⚠" : "✓"} Perfis de Resistência
          </span>
          {hasGaps && (
            <span
              style={{
                fontSize: 9,
                color: "rgba(251,191,36,0.7)",
                background: "rgba(251,191,36,0.1)",
                padding: "1px 6px",
                borderRadius: 6,
              }}
            >
              gaps detectados
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 14px 12px" }}>
          {balance.map((b, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  margin: "0 0 5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {b.musculo} · {b.total} exercício{b.total !== 1 ? "s" : ""}
              </p>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 4 }}>
                {([
                  { key: "alongado", count: b.alongado, cfg: PROFILE_CONFIG.ALONGADO },
                  { key: "constante", count: b.constante, cfg: PROFILE_CONFIG.CONSTANTE },
                  { key: "encurtado", count: b.encurtado, cfg: PROFILE_CONFIG.ENCURTADO },
                  { key: "misto", count: b.misto, cfg: PROFILE_CONFIG.MISTO },
                ]).map((p, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      background: p.count > 0 ? p.cfg.bg : "rgba(255,255,255,0.04)",
                      border: `0.5px solid ${p.count > 0 ? p.cfg.border : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 8,
                      opacity: p.count > 0 ? 1 : 0.5,
                    }}
                  >
                    <span style={{ fontSize: 10, color: p.count > 0 ? p.cfg.color : "rgba(255,255,255,0.25)" }}>
                      {p.cfg.icon}
                    </span>
                    <span style={{ fontSize: 10, color: p.count > 0 ? p.cfg.color : "rgba(255,255,255,0.25)" }}>
                      {p.cfg.label} ×{p.count}
                    </span>
                  </div>
                ))}
              </div>
              {b.gaps.length > 0 && (
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(251,191,36,0.7)",
                    margin: "3px 0 0",
                    fontStyle: "italic",
                  }}
                >
                  ⚠ Sem exercício{" "}
                  {b.gaps.map(g => PROFILE_CONFIG[g].label.toLowerCase()).join(" e ")} para {b.musculo} nesta sessão
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileFilter({
  selected,
  onChange,
}: {
  selected: ResistanceProfile | null;
  onChange: (p: ResistanceProfile | null) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      <button
        onClick={() => onChange(null)}
        style={{
          fontSize: 11,
          padding: "4px 10px",
          background: selected === null ? "rgba(255,255,255,0.1)" : "transparent",
          border: "0.5px solid rgba(255,255,255,0.15)",
          borderRadius: 16,
          cursor: "pointer",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        Todos
      </button>
      {(Object.keys(PROFILE_CONFIG) as ResistanceProfile[]).map(p => {
        const cfg = PROFILE_CONFIG[p];
        const isSel = selected === p;
        return (
          <button
            key={p}
            onClick={() => onChange(isSel ? null : p)}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              background: isSel ? cfg.bg : "transparent",
              border: `0.5px solid ${isSel ? cfg.border : "rgba(255,255,255,0.1)"}`,
              borderRadius: 16,
              cursor: "pointer",
              color: isSel ? cfg.color : "rgba(255,255,255,0.5)",
              transition: "all .15s",
            }}
          >
            {cfg.icon} {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
