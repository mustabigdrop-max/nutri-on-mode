import { useMemo } from "react";
import type { CircadianMeal } from "@/hooks/useCircadian";

interface Props {
  wakeTime: string;
  sleepTime: string;
  meals: CircadianMeal[];
  workoutTime?: string;
}

const parseTime = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

const CONTEXT_COLORS: Record<string, string> = {
  "Pico Insulínico": "#f97316",
  "Janela Principal": "#eab308",
  "Cortisol Caindo": "#a78bfa",
  "Pré-treino": "#ef4444",
  "Pós-treino": "#22c55e",
  "Janela Anabólica": "#22c55e",
  "Preparação Sono": "#6366f1",
};

const CircadianTimeline = ({ wakeTime, sleepTime, meals, workoutTime }: Props) => {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;
  const innerR = 85;

  const wake = parseTime(wakeTime);
  const sleep = parseTime(sleepTime);

  const hourToAngle = (h: number): number => {
    return ((h - 6) / 24) * 360 - 90; // 6AM at top
  };

  const polarToCart = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const arcPath = (startAngle: number, endAngle: number, radius: number) => {
    if (endAngle < startAngle) endAngle += 360;
    const start = polarToCart(startAngle, radius);
    const end = polarToCart(endAngle, radius);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  // Current time position
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const currentAngle = hourToAngle(currentHour);
  const currentPos = polarToCart(currentAngle, r);

  // Cortisol zones
  const cortisolZones = [
    { start: 6, end: 9, label: "Alto", color: "#ef4444" },
    { start: 9, end: 12, label: "Médio", color: "#eab308" },
    { start: 12, end: 14, label: "Baixo", color: "#22c55e" },
    { start: 14, end: 17, label: "Médio", color: "#eab308" },
    { start: 17, end: 21, label: "Baixo", color: "#22c55e" },
    { start: 21, end: 6, label: "Mínimo", color: "#6366f1" },
  ];

  // Hour markers
  const hours = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div className="relative flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />

        {/* Sleep zone (dark) */}
        <path
          d={arcPath(hourToAngle(sleep), hourToAngle(wake), r)}
          fill="none"
          stroke="#312e81"
          strokeWidth="20"
          opacity="0.4"
          strokeLinecap="round"
        />

        {/* Awake zone (amber) */}
        <path
          d={arcPath(hourToAngle(wake), hourToAngle(sleep), r)}
          fill="none"
          stroke="#f97316"
          strokeWidth="20"
          opacity="0.15"
          strokeLinecap="round"
        />

        {/* Cortisol inner ring */}
        {cortisolZones.map((zone, i) => (
          <path
            key={i}
            d={arcPath(hourToAngle(zone.start), hourToAngle(zone.end), innerR)}
            fill="none"
            stroke={zone.color}
            strokeWidth="4"
            opacity="0.5"
            strokeLinecap="round"
          />
        ))}

        {/* Workout marker */}
        {workoutTime && (
          (() => {
            const wt = parseTime(workoutTime);
            const angle = hourToAngle(wt);
            const pos = polarToCart(angle, r);
            return (
              <g>
                <circle cx={pos.x} cy={pos.y} r="8" fill="#ef4444" opacity="0.8" />
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white">🏋️</text>
              </g>
            );
          })()
        )}

        {/* Meal markers */}
        {meals.map((meal, i) => {
          const mealHour = parseTime(meal.time);
          const angle = hourToAngle(mealHour);
          const pos = polarToCart(angle, r);
          const color = CONTEXT_COLORS[meal.context_tag] || "#f97316";
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r="6" fill={color} stroke="hsl(var(--background))" strokeWidth="2" />
              <circle cx={pos.x} cy={pos.y} r="10" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
            </g>
          );
        })}

        {/* Hour labels */}
        {hours.map(h => {
          const angle = hourToAngle(h);
          const pos = polarToCart(angle, r + 20);
          return (
            <text key={h} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="monospace">
              {h.toString().padStart(2, "0")}h
            </text>
          );
        })}

        {/* Current time indicator */}
        <circle cx={currentPos.x} cy={currentPos.y} r="5" fill="#f97316" stroke="hsl(var(--background))" strokeWidth="2">
          <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={currentPos.x} cy={currentPos.y} r="12" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Center info */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" fontFamily="monospace">
          {now.getHours().toString().padStart(2, "0")}:{now.getMinutes().toString().padStart(2, "0")}
        </text>
        <text x={cx} y={cx + 6} textAnchor="middle" fontSize="8" fill="hsl(var(--foreground))" fontWeight="bold">
          {currentHour >= wake && currentHour < sleep ? "ATIVO" : "SONO"}
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 text-[9px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Refeição</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-800 inline-block" /> Sono</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Treino</span>
      </div>
    </div>
  );
};

export default CircadianTimeline;
