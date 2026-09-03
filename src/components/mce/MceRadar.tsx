import { PILLAR_META } from "@/data/mceDiagnostico";

interface Props {
  m: number;
  c: number;
  e: number;
  size?: number;
  animate?: boolean;
}

const CYAN = "#00D4FF";

export default function MceRadar({ m, c, e, size = 260, animate = true }: Props) {
  const cx = size / 2;
  const cy = size / 2 + 8;
  const R = size * 0.36;

  // M topo, C esquerda-baixo, E direita-baixo
  const angles = [-90, 150, 30].map((d) => (d * Math.PI) / 180);
  const point = (angle: number, r: number) => ({
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  });

  const grid = [0.25, 0.5, 0.75, 1].map((f) =>
    angles.map((a) => point(a, R * f)).map((p) => `${p.x},${p.y}`).join(" ")
  );

  const values = [m, c, e];
  const poly = angles
    .map((a, i) => point(a, (R * Math.max(values[i], 3)) / 100))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const labels = [
    { key: "M" as const, pos: point(angles[0], R + 26), value: m },
    { key: "C" as const, pos: point(angles[1], R + 30), value: c },
    { key: "E" as const, pos: point(angles[2], R + 30), value: e },
  ];

  return (
    <svg width={size} height={size + 24} style={{ display: "block", margin: "0 auto" }}>
      {grid.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#1a2236" strokeWidth={1} />
      ))}
      {angles.map((a, i) => {
        const p = point(a, R);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1a2236" strokeWidth={1} />;
      })}
      <polygon
        points={poly}
        fill={CYAN}
        fillOpacity={0.15}
        stroke={CYAN}
        strokeWidth={2.5}
        style={animate ? { transition: "all 1.4s cubic-bezier(.22,1,.36,1)" } : undefined}
      />
      {angles.map((a, i) => {
        const p = point(a, (R * Math.max(values[i], 3)) / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={CYAN} />;
      })}
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.pos.x}
          y={l.pos.y}
          textAnchor="middle"
          fontSize={11}
          fontFamily="'Space Mono', monospace"
          fill={PILLAR_META[l.key].color}
        >
          {PILLAR_META[l.key].emoji} {l.value}%
        </text>
      ))}
    </svg>
  );
}
