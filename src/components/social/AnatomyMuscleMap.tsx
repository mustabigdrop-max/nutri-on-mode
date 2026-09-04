// Mapa muscular anatômico (vista anterior + posterior) para o Social ON.
// Cada grupo é desenhado como forma anatômica real e recebe intensidade
// de ativação (primária / secundária) com brilho e pulso.

const C = {
  s: "#0a0e18",
  s2: "#111827",
  body: "#141c2b",
  bodyEdge: "#22344f",
  line: "#1e2d45",
  text: "#e8edf5",
  muted: "#6b7a94",
  cyan: "#00D4FF",
  gold: "#B8922A",
  mono: "'Space Mono', monospace",
};

type View = "front" | "back";

type MusclePart = {
  label: string;
  view: View;
  d: string[];
};

// Chaves aceitas (mesmas usadas pelo motor de análise) + sinônimos comuns.
const MUSCLES: Record<string, MusclePart> = {
  neck: {
    label: "Pescoço",
    view: "front",
    d: ["M92 46 L98 60 L104 46 Z", "M108 46 L102 60 L96 46 Z"],
  },
  traps_front: {
    label: "Trapézio superior",
    view: "front",
    d: ["M78 56 Q100 48 122 56 L118 66 Q100 58 82 66 Z"],
  },
  upper_chest: {
    label: "Peitoral superior",
    view: "front",
    d: [
      "M99 68 L80 66 Q68 70 66 80 Q80 86 99 84 Z",
      "M101 68 L120 66 Q132 70 134 80 Q120 86 101 84 Z",
    ],
  },
  lower_chest: {
    label: "Peitoral inferior",
    view: "front",
    d: [
      "M99 85 Q80 87 66 81 Q68 96 84 100 Q96 100 99 96 Z",
      "M101 85 Q120 87 134 81 Q132 96 116 100 Q104 100 101 96 Z",
    ],
  },
  front_delt: {
    label: "Deltoide anterior",
    view: "front",
    d: [
      "M78 62 Q64 64 60 78 Q58 88 63 94 Q72 88 74 74 Z",
      "M122 62 Q136 64 140 78 Q142 88 137 94 Q128 88 126 74 Z",
    ],
  },
  side_delt: {
    label: "Deltoide lateral",
    view: "front",
    d: [
      "M60 78 Q52 84 52 96 Q56 102 63 98 Q58 88 60 78 Z",
      "M140 78 Q148 84 148 96 Q144 102 137 98 Q142 88 140 78 Z",
    ],
  },
  biceps: {
    label: "Bíceps",
    view: "front",
    d: [
      "M56 100 Q50 112 52 128 Q58 134 64 128 Q66 112 63 100 Z",
      "M144 100 Q150 112 148 128 Q142 134 136 128 Q134 112 137 100 Z",
    ],
  },
  forearms: {
    label: "Antebraços",
    view: "front",
    d: [
      "M52 132 Q46 148 44 168 Q50 174 56 168 Q60 148 60 132 Z",
      "M148 132 Q154 148 156 168 Q150 174 144 168 Q140 148 140 132 Z",
    ],
  },
  core: {
    label: "Core / Reto abdominal",
    view: "front",
    d: [
      "M88 102 L112 102 L112 116 L88 116 Z",
      "M88 118 L112 118 L112 132 L88 132 Z",
      "M89 134 L111 134 L110 148 L90 148 Z",
      "M91 150 L109 150 Q106 162 100 166 Q94 162 91 150 Z",
    ],
  },
  obliques: {
    label: "Oblíquos",
    view: "front",
    d: [
      "M86 104 Q76 112 78 138 Q82 152 88 156 L88 104 Z",
      "M114 104 Q124 112 122 138 Q118 152 112 156 L112 104 Z",
    ],
  },
  hip_flexors: {
    label: "Flexores do quadril",
    view: "front",
    d: [
      "M88 158 Q82 166 84 176 L98 172 L98 160 Z",
      "M112 158 Q118 166 116 176 L102 172 L102 160 Z",
    ],
  },
  adductors: {
    label: "Adutores",
    view: "front",
    d: [
      "M92 174 Q86 194 88 214 L98 210 L98 174 Z",
      "M108 174 Q114 194 112 214 L102 210 L102 174 Z",
    ],
  },
  quads: {
    label: "Quadríceps",
    view: "front",
    d: [
      "M78 176 Q70 200 74 232 Q82 244 92 236 Q96 206 94 176 Z",
      "M122 176 Q130 200 126 232 Q118 244 108 236 Q104 206 106 176 Z",
    ],
  },
  tibialis: {
    label: "Tibial anterior",
    view: "front",
    d: [
      "M80 250 Q74 272 76 296 Q82 300 86 294 Q88 270 88 250 Z",
      "M120 250 Q126 272 124 296 Q118 300 114 294 Q112 270 112 250 Z",
    ],
  },
  traps: {
    label: "Trapézio",
    view: "back",
    d: [
      "M99 54 L76 62 Q68 76 74 94 L99 108 Z",
      "M101 54 L124 62 Q132 76 126 94 L101 108 Z",
    ],
  },
  upper_back: {
    label: "Dorsal superior / Romboides",
    view: "back",
    d: ["M80 94 Q100 88 120 94 Q122 108 118 118 Q100 112 82 118 Q78 108 80 94 Z"],
  },
  rear_delt: {
    label: "Deltoide posterior",
    view: "back",
    d: [
      "M76 64 Q62 68 58 82 Q56 94 62 98 Q72 92 76 76 Z",
      "M124 64 Q138 68 142 82 Q144 94 138 98 Q128 92 124 76 Z",
    ],
  },
  triceps: {
    label: "Tríceps",
    view: "back",
    d: [
      "M56 100 Q49 114 52 130 Q59 136 65 129 Q67 112 63 100 Z",
      "M144 100 Q151 114 148 130 Q141 136 135 129 Q133 112 137 100 Z",
    ],
  },
  lats: {
    label: "Latíssimo do dorso",
    view: "back",
    d: [
      "M80 118 Q70 134 78 156 L98 150 L98 120 Z",
      "M120 118 Q130 134 122 156 L102 150 L102 120 Z",
    ],
  },
  lower_back: {
    label: "Eretores da espinha",
    view: "back",
    d: [
      "M92 120 Q88 144 92 164 L98 164 L98 120 Z",
      "M108 120 Q112 144 108 164 L102 164 L102 120 Z",
    ],
  },
  glutes: {
    label: "Glúteos",
    view: "back",
    d: [
      "M98 168 Q80 168 76 186 Q78 204 92 206 Q99 198 98 168 Z",
      "M102 168 Q120 168 124 186 Q122 204 108 206 Q101 198 102 168 Z",
    ],
  },
  hamstrings: {
    label: "Isquiotibiais",
    view: "back",
    d: [
      "M80 208 Q72 230 78 248 Q88 254 94 244 Q96 224 94 208 Z",
      "M120 208 Q128 230 122 248 Q112 254 106 244 Q104 224 106 208 Z",
    ],
  },
  calves: {
    label: "Panturrilhas",
    view: "back",
    d: [
      "M80 254 Q72 272 78 292 Q86 298 90 288 Q92 270 90 254 Z",
      "M120 254 Q128 272 122 292 Q114 298 110 288 Q108 270 110 254 Z",
    ],
  },
};

// Sinônimos vindos do motor / textos livres
const ALIASES: Record<string, string> = {
  chest: "lower_chest",
  peitoral: "lower_chest",
  pec: "lower_chest",
  peito: "lower_chest",
  shoulders: "side_delt",
  deltoids: "side_delt",
  ombros: "side_delt",
  delts: "side_delt",
  abs: "core",
  abdomen: "core",
  abdominais: "core",
  back: "upper_back",
  costas: "upper_back",
  dorsal: "lats",
  dorsais: "lats",
  gluteos: "glutes",
  glutes_max: "glutes",
  quadriceps: "quads",
  posteriores: "hamstrings",
  isquiotibiais: "hamstrings",
  panturrilhas: "calves",
  panturrilha: "calves",
  biceps_braquial: "biceps",
  triceps_braquial: "triceps",
  antebraco: "forearms",
  antebracos: "forearms",
  trapezio: "traps",
  lombar: "lower_back",
  oblique: "obliques",
  obliquos: "obliques",
  adutores: "adductors",
  pescoco: "neck",
};

function normalize(z: string) {
  const k = z
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
  if (MUSCLES[k]) return k;
  if (ALIASES[k]) return ALIASES[k];
  const hit = Object.keys(MUSCLES).find((m) => k.includes(m) || m.includes(k));
  if (hit) return hit;
  const alias = Object.keys(ALIASES).find((a) => k.includes(a));
  return alias ? ALIASES[alias] : null;
}

type Props = {
  activeZones?: string[];
  secondaryZones?: string[];
  height?: number;
};

export default function AnatomyMuscleMap({
  activeZones = [],
  secondaryZones = [],
  height = 300,
}: Props) {
  const primary = new Set(activeZones.map(normalize).filter(Boolean) as string[]);
  const secondary = new Set(
    (secondaryZones.map(normalize).filter(Boolean) as string[]).filter((k) => !primary.has(k)),
  );

  const activeLabels = [...primary].map((k) => MUSCLES[k].label);
  const secondaryLabels = [...secondary].map((k) => MUSCLES[k].label);

  const renderBody = (view: View) => (
    <svg viewBox="0 0 200 320" height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`skin-${view}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#182233" />
          <stop offset="100%" stopColor="#0d1420" />
        </linearGradient>
        <radialGradient id={`heat-${view}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.cyan} stopOpacity="0.85" />
          <stop offset="100%" stopColor={C.cyan} stopOpacity="0.35" />
        </radialGradient>
        <filter id={`glow-${view}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* silhueta corporal */}
      <g fill={`url(#skin-${view})`} stroke={C.bodyEdge} strokeWidth="1">
        <ellipse cx="100" cy="32" rx="16" ry="19" />
        <path d="M92 48 L108 48 L110 60 L90 60 Z" />
        <path d="M78 60 Q60 64 56 84 L52 132 L44 176 L58 180 L66 136 L70 106 L72 160 Q70 172 76 176 L124 176 Q130 172 128 160 L130 106 L134 136 L142 180 L156 176 L148 132 L144 84 Q140 64 122 60 Z" />
        <path d="M76 176 Q68 214 74 250 L76 300 Q82 308 92 302 L96 250 L99 200 L101 200 L104 250 L108 302 Q118 308 124 300 L126 250 Q132 214 124 176 Z" />
      </g>

      {/* músculos */}
      {Object.entries(MUSCLES)
        .filter(([, m]) => m.view === view)
        .map(([key, m]) => {
          const isPrimary = primary.has(key);
          const isSecondary = secondary.has(key);
          const fill = isPrimary
            ? `url(#heat-${view})`
            : isSecondary
              ? `${C.gold}55`
              : "#1b2536";
          const stroke = isPrimary ? C.cyan : isSecondary ? C.gold : "#26354c";
          return (
            <g
              key={key}
              filter={isPrimary ? `url(#glow-${view})` : undefined}
              style={isPrimary ? { animation: "anatomyPulse 2.2s ease-in-out infinite" } : undefined}
            >
              {m.d.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isPrimary || isSecondary ? 0.9 : 0.5}
                  opacity={isPrimary ? 1 : isSecondary ? 0.9 : 0.55}
                />
              ))}
            </g>
          );
        })}

      {/* linha de escaneamento */}
      <rect x="0" y="0" width="200" height="2" fill={C.cyan} opacity="0.25">
        <animate attributeName="y" values="20;300;20" dur="6s" repeatCount="indefinite" />
      </rect>

      <text
        x="100"
        y="316"
        textAnchor="middle"
        fill={C.muted}
        fontSize="9"
        fontFamily={C.mono}
        letterSpacing="2"
      >
        {view === "front" ? "ANTERIOR" : "POSTERIOR"}
      </text>
    </svg>
  );

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          background: C.s,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: "10px 6px",
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {renderBody("front")}
        {renderBody("back")}
      </div>

      {(activeLabels.length > 0 || secondaryLabels.length > 0) && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {activeLabels.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: C.mono,
                  color: C.cyan,
                  letterSpacing: 1.4,
                }}
              >
                PRIMÁRIOS
              </span>
              {activeLabels.map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 999,
                    color: C.cyan,
                    background: `${C.cyan}18`,
                    border: `1px solid ${C.cyan}55`,
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          )}
          {secondaryLabels.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: C.mono,
                  color: C.gold,
                  letterSpacing: 1.4,
                }}
              >
                SINERGISTAS
              </span>
              {secondaryLabels.map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 999,
                    color: C.gold,
                    background: `${C.gold}18`,
                    border: `1px solid ${C.gold}55`,
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes anatomyPulse { 0%,100% { opacity: 0.82; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}
