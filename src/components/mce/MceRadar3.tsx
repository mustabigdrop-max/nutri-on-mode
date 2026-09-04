interface Props {
  values: number[];
  labels: string[];
  colors: string[];
  size?: number;
  animate?: boolean;
  accent?: string;
}

export default function MceRadar3({ values, labels, colors, size = 220, animate = true, accent = "#00D4FF" }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const angles = values.map((_, i) => -Math.PI / 2 + ((2 * Math.PI) / values.length) * i);
  const pt = (a: number, v: number) => ({
    x: cx + ((r * (animate ? v : 0)) / 100) * Math.cos(a),
    y: cy + ((r * (animate ? v : 0)) / 100) * Math.sin(a),
  });
  const pts = values.map((v, i) => pt(angles[i], Math.max(v, 3)));

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {[25, 50, 75, 100].map((lvl) => (
        <polygon
          key={lvl}
          points={angles.map((a) => pt(a, lvl)).map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#1e2d45"
          strokeWidth={0.7}
        />
      ))}
      {angles.map((a, i) => {
        const p = pt(a, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e2d45" strokeWidth={0.7} />;
      })}
      <polygon
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={`${accent}1f`}
        stroke={accent}
        strokeWidth={2}
        style={{ transition: "all 1.5s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={colors[i]} />
      ))}
      {labels.map((l, i) => {
        const lp = pt(angles[i], 132);
        return (
          <text key={l} x={lp.x} y={lp.y} textAnchor="middle" fontSize={10} fontFamily="'Space Mono', monospace" fill={colors[i]}>
            <tspan x={lp.x} dy={0} fontSize={11} fontWeight={700}>
              {values[i]}%
            </tspan>
            <tspan x={lp.x} dy={12} fontSize={8} fill="#6b7a94">
              {l}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
