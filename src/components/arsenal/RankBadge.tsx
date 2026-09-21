// ARSENAL VIRAL — BADGE DE PATENTE
import type { Rank } from "@/lib/apexRanks";

interface Props {
  rank: Rank;
  variant?: "icon" | "banner";
  size?: number;
}

const RankBadge = ({ rank, variant = "icon", size = 120 }: Props) => {
  const borda = rank.corSecundaria
    ? `linear-gradient(135deg, ${rank.cor}, ${rank.corSecundaria})`
    : rank.cor;

  if (variant === "banner") {
    return (
      <div
        style={{
          display: "flex", alignItems: "center", gap: 14, width: "100%", maxWidth: 400, height: 80,
          padding: "0 16px", background: "#020205", border: "1px solid transparent",
          borderImage: `${borda} 1`, boxShadow: rank.glow ? `0 0 22px ${rank.cor}44` : "none",
        }}
      >
        <span style={{ fontSize: 34, lineHeight: 1 }}>{rank.icone}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: "700 20px 'Rajdhani', sans-serif", letterSpacing: ".08em", color: rank.cor }}>{rank.nome}</div>
          <div style={{ font: "400 9px 'Space Mono', monospace", color: "rgba(255,255,255,.5)", letterSpacing: ".06em" }}>
            APEX {rank.min}–{rank.max}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: size, height: size, display: "grid", placeItems: "center", gap: 4,
        background: "#020205", border: `1px solid ${rank.cor}`,
        boxShadow: rank.glow ? `0 0 18px ${rank.cor}55` : "none",
      }}
    >
      <span style={{ fontSize: size * 0.3, lineHeight: 1 }}>{rank.icone}</span>
      <span style={{ font: `700 ${Math.round(size * 0.1)}px 'Rajdhani', sans-serif`, letterSpacing: ".1em", color: rank.cor }}>
        {rank.nome}
      </span>
    </div>
  );
};

export default RankBadge;
