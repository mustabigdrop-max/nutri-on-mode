/** Tokens visuais compartilhados dos cards de periodização nutricional. */
export const NP = {
  bg: "#03030a",
  card: "#06060e",
  card2: "#0a0a14",
  border: "#1a1a28",
  gold: "#B8922A",
  goldBright: "#e8a020",
  goldDim: "rgba(184,146,42,.28)",
  goldBg: "rgba(184,146,42,.10)",
  teal: "#00f0b4",
  tealBg: "rgba(0,240,180,.08)",
  purple: "#7890ff",
  purpleBg: "rgba(120,144,255,.10)",
  blueGrey: "#8aa0c0",
  blueGreyBg: "rgba(138,160,192,.10)",
  text: "#f0edf8",
  muted: "#5a5a78",
  dim: "#40406a",
  red: "#ff4444",
} as const;

export const mono = "'Space Mono', ui-monospace, monospace";

export const labelStyle: React.CSSProperties = {
  fontSize: 9,
  fontFamily: mono,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  margin: 0,
};

export const cardStyle: React.CSSProperties = {
  background: NP.card,
  border: `1px solid ${NP.border}`,
  borderRadius: 16,
  padding: 16,
};
