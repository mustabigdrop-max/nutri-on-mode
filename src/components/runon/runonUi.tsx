/** RunON — tokens e primitivas visuais no padrão APEX Visual Intelligence. */
import { useEffect, useRef } from "react";

export const RC = {
  cyan: "#00D4FF",
  cyanDim: "#00D4FF15",
  cyanBorder: "#00D4FF33",
  cyanGlow: "#00D4FF22",
  cyanText: "#00D4FF88",
  purple: "#a855f7",
  purpleDim: "#a855f715",
  purpleBorder: "#a855f733",
  gold: "#B8922A",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  white: "#F5F0E8",
  bg: "#020205",
  bg2: "#0A0A12",
  card: "#0D0D14",
  cardHover: "#12121A",
  muted: "#888888",
  mutedDark: "#2A2A2A",
  border: "#1A1A22",
} as const;

export const MONO = "'Space Mono', monospace";
export const RAJ = "'Rajdhani', sans-serif";

export const mono = (
  size: number,
  color: string,
  spacing = 2,
): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  color,
  letterSpacing: `${spacing}px`,
  textTransform: "uppercase",
});

export const raj = (size: number, weight = 700, color: string = RC.white): React.CSSProperties => ({
  fontFamily: RAJ,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.15,
});

/* ─────────── Canvas hexagonal de fundo ─────────── */
export function HexBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const R = 26;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,212,255,0.05)";
      ctx.lineWidth = 0.5;
      const dy = R * Math.sqrt(3);
      const offset = (t * 0.12) % dy;
      for (let row = -1; row * dy < h + dy; row++) {
        for (let col = -1; col * (R * 1.5) < w + R * 2; col++) {
          const cx = col * R * 1.5;
          const cy = row * dy + (col % 2 ? dy / 2 : 0) + offset;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const x = cx + R * Math.cos(a);
            const y = cy + R * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.5, width: "100%", height: "100%" }}
    />
  );
}

/* ─────────── Primitivas ─────────── */
export function IconBox({
  icon: Icon, color, size = 40, iconSize = 18,
}: { icon: any; color: string; size?: number; iconSize?: number }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: `${color}12`,
        border: `1px solid ${color}33`,
        borderRadius: size > 44 ? 8 : 6,
        boxShadow: `0 0 20px ${color}11`,
      }}
    >
      <Icon style={{ width: iconSize, height: iconSize, color }} />
    </div>
  );
}

export function RBadge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-block"
      style={{
        ...mono(7, color, 2),
        border: `1px solid ${color}44`,
        background: `${color}11`,
        padding: "3px 10px",
        borderRadius: 3,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function SectionCard({
  label, icon: Icon, color = RC.cyan, accent, children, className = "",
}: {
  label?: string; icon?: any; color?: string; accent?: string;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div
      className={`runon-card ${className}`}
      style={{
        background: RC.card,
        border: `1px solid ${RC.border}`,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        borderRadius: 10,
        padding: 20,
        transition: "border-color 0.3s ease",
      }}
    >
      {label && (
        <div
          className="flex items-center gap-2"
          style={{ paddingBottom: 12, marginBottom: 14, borderBottom: `1px solid ${RC.bg2}` }}
        >
          {Icon && <Icon style={{ width: 16, height: 16, color }} />}
          <span style={mono(7, color, 3)}>{label}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({
  label, value, suffix, color = RC.cyan,
}: { label: string; value: string; suffix?: string; color?: string }) {
  return (
    <div style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 8, padding: 14 }}>
      <p style={mono(6, RC.mutedDark, 3)}>{label}</p>
      <p style={{ ...raj(18, 700, RC.white), marginTop: 6 }}>
        {value}
        {suffix && <span style={{ ...raj(14, 600, color), marginLeft: 4 }}>{suffix}</span>}
      </p>
    </div>
  );
}

export function Chip({
  active, onClick, color = RC.cyan, children,
}: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
      style={{
        ...mono(8, active ? color : "#444", 1),
        padding: "6px 14px",
        borderRadius: 20,
        border: `1px solid ${active ? `${color}44` : RC.border}`,
        background: active ? `${color}0a` : "transparent",
        boxShadow: active ? `0 0 8px ${color}11` : "none",
      }}
    >
      {children}
    </button>
  );
}
