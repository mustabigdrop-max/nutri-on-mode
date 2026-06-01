// MERIDIAN — Track Selector (Enhanced / Natural / Lifestyle).
import { TRACK_META } from "@/lib/meridian/constants";
import type { AthleteTrack } from "@/lib/meridian/types";

interface Props {
  value: AthleteTrack | null;
  onChange: (t: AthleteTrack) => void;
}

export default function MeridianTrackSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11,
          letterSpacing: 3,
          color: "#7a7a7a",
          textTransform: "uppercase",
        }}
      >
        SITREP // SELEÇÃO DE TRACK
      </div>
      {(Object.keys(TRACK_META) as AthleteTrack[]).map((t) => {
        const meta = TRACK_META[t];
        const selected = value === t;
        const disabled = !meta.available;
        return (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(t)}
            style={{
              textAlign: "left",
              background: selected ? meta.bg : "rgba(255,255,255,0.02)",
              border: `1px solid ${selected ? meta.color : "rgba(255,255,255,0.08)"}`,
              borderLeft: `4px solid ${meta.color}`,
              padding: 18,
              borderRadius: 4,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.45 : 1,
              transition: "all 0.15s",
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#e8e8e8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: meta.color,
                  textTransform: "uppercase",
                }}
              >
                {meta.label}
              </div>
              {!meta.available && (
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    padding: "3px 8px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 2,
                    color: "#999",
                  }}
                >
                  EM BREVE
                </div>
              )}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "#b8b8b8" }}>
              {meta.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
