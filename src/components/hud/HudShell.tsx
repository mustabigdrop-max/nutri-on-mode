import { ReactNode } from "react";

/**
 * Background HUD: hex grid + scan line + corner brackets fixos.
 * Coloque <HudShell> como root da página; o conteúdo segue normal por cima.
 */
export const HudShell = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-screen hud-bg" style={{ color: "#F5F0E8" }}>
    <div className="hud-scan" />
    <div className="hud-corner-fixed" style={{ top: 12, left: 12, borderTop: "1px solid #B8922A", borderLeft: "1px solid #B8922A" }} />
    <div className="hud-corner-fixed" style={{ top: 12, right: 12, borderTop: "1px solid #B8922A", borderRight: "1px solid #B8922A" }} />
    <div className="hud-corner-fixed" style={{ bottom: 12, left: 12, borderBottom: "1px solid #B8922A", borderLeft: "1px solid #B8922A" }} />
    <div className="hud-corner-fixed" style={{ bottom: 12, right: 12, borderBottom: "1px solid #B8922A", borderRight: "1px solid #B8922A" }} />
    <div className="relative z-[3]">{children}</div>
  </div>
);

/** Status bar topo: dot pulsante + label + meta */
export const HudStatusBar = ({
  label,
  meta,
  color = "#00D4FF",
}: {
  label: string;
  meta?: string;
  color?: string;
}) => (
  <div className="flex items-center justify-between text-[10px]" style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.18em" }}>
    <div className="flex items-center gap-2" style={{ color }}>
      <span className="hud-status-dot" />
      <span className="uppercase">{label}</span>
    </div>
    {meta && <span className="uppercase" style={{ color: "rgba(80,80,122,1)" }}>{meta}</span>}
  </div>
);

/** Hexágono com 2-3 letras de código */
export const HudHex = ({
  code,
  color = "#B8922A",
  size = 64,
}: {
  code: string;
  color?: string;
  size?: number;
}) => (
  <div className="relative inline-block" style={{ width: size, height: size }}>
    {/* outer */}
    <div
      className="hud-hex absolute inset-0"
      style={{ background: color }}
    />
    {/* inner cutout */}
    <div
      className="hud-hex absolute"
      style={{
        inset: 2,
        background: "#0a0a1a",
        color,
        fontSize: size * 0.28,
      }}
    >
      {code}
    </div>
  </div>
);

/** Painel HUD com clip-path + corner brackets internos */
export const HudPanel = ({
  children,
  className = "",
  tag,
  tagColor = "#B8922A",
}: {
  children: ReactNode;
  className?: string;
  tag?: string;
  tagColor?: string;
}) => (
  <div className={`hud-panel ${className}`}>
    {tag && (
      <div
        className="absolute top-2 right-3 z-[2]"
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.2em",
          color: tagColor,
          textTransform: "uppercase",
        }}
      >
        {tag}
      </div>
    )}
    {children}
  </div>
);
