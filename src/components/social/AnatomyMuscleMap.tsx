// Mapa muscular anatômico (vista anterior + posterior).
// Cada grupo é desenhado com contornos musculares reais (não silhueta lisa)
// e recebe intensidade de ativação: principal (âmbar) e secundário (verde).

const C = {
  s: "#0a0e18",
  body: "#1a1a2e",
  bodyEdge: "#2b3350",
  line: "#242c46",
  fiber: "#333a55",
  muted: "#6b7a94",
  amber: "#EF9F27",
  teal: "#5DCAA5",
  mono: "'Space Mono', monospace",
};

type View = "front" | "back";

type MusclePart = {
  label: string;
  view: View;
  d: string[];
  /** linhas de fibra/contorno para dar aspecto anatômico */
  fibers?: string[];
};

const MUSCLES: Record<string, MusclePart> = {
  neck: {
    label: "Pescoço (esternocleidomastoideo)",
    view: "front",
    d: ["M93 46 Q96 56 99 61 L101 58 L98 46 Z", "M107 46 Q104 56 101 61 L99 58 L102 46 Z"],
  },
  traps_front: {
    label: "Trapézio superior",
    view: "front",
    d: ["M78 57 Q100 47 122 57 L117 67 Q100 57 83 67 Z"],
    fibers: ["M88 60 Q100 54 112 60"],
  },
  upper_chest: {
    label: "Peitoral superior",
    view: "front",
    d: [
      "M99 68 L81 66 Q69 70 66 80 Q80 87 99 84 Z",
      "M101 68 L119 66 Q131 70 134 80 Q120 87 101 84 Z",
    ],
    fibers: ["M70 74 Q86 78 98 76", "M130 74 Q114 78 102 76"],
  },
  lower_chest: {
    label: "Peitoral inferior",
    view: "front",
    d: [
      "M99 85 Q80 88 66 81 Q69 97 84 101 Q96 101 99 96 Z",
      "M101 85 Q120 88 134 81 Q131 97 116 101 Q104 101 101 96 Z",
    ],
    fibers: ["M70 88 Q86 94 97 93", "M130 88 Q114 94 103 93"],
  },
  serratus: {
    label: "Serrátil (lateral do peito)",
    view: "front",
    d: [
      "M74 96 L82 104 L74 106 L80 112 L72 113 L68 104 Z",
      "M126 96 L118 104 L126 106 L120 112 L128 113 L132 104 Z",
    ],
  },
  front_delt: {
    label: "Deltoide anterior",
    view: "front",
    d: [
      "M78 62 Q64 65 60 78 Q58 88 63 94 Q72 88 75 74 Z",
      "M122 62 Q136 65 140 78 Q142 88 137 94 Q128 88 125 74 Z",
    ],
    fibers: ["M65 72 Q70 80 68 90", "M135 72 Q130 80 132 90"],
  },
  side_delt: {
    label: "Deltoide lateral",
    view: "front",
    d: [
      "M60 78 Q51 85 52 97 Q57 103 63 98 Q58 88 60 78 Z",
      "M140 78 Q149 85 148 97 Q143 103 137 98 Q142 88 140 78 Z",
    ],
  },
  biceps: {
    label: "Bíceps",
    view: "front",
    d: [
      "M56 100 Q49 113 52 129 Q58 135 65 128 Q67 112 63 100 Z",
      "M144 100 Q151 113 148 129 Q142 135 135 128 Q133 112 137 100 Z",
    ],
    fibers: ["M58 106 Q56 118 58 128", "M142 106 Q144 118 142 128"],
  },
  forearms: {
    label: "Antebraço",
    view: "front",
    d: [
      "M52 132 Q45 149 44 169 Q50 175 57 168 Q60 148 60 132 Z",
      "M148 132 Q155 149 156 169 Q150 175 143 168 Q140 148 140 132 Z",
    ],
    fibers: ["M50 140 Q49 156 50 166", "M150 140 Q151 156 150 166"],
  },
  core: {
    label: "Abdômen (barriga)",
    view: "front",
    d: [
      "M89 103 L99 103 L99 116 L89 116 Z",
      "M101 103 L111 103 L111 116 L101 116 Z",
      "M89 118 L99 118 L99 131 L89 131 Z",
      "M101 118 L111 118 L111 131 L101 131 Z",
      "M90 133 L99 133 L99 146 L90 146 Z",
      "M101 133 L110 133 L110 146 L101 146 Z",
      "M91 148 L99 148 Q98 160 100 166 Q94 162 91 148 Z",
      "M109 148 L101 148 Q102 160 100 166 Q106 162 109 148 Z",
    ],
  },
  obliques: {
    label: "Oblíquos (lateral da barriga)",
    view: "front",
    d: [
      "M87 104 Q77 113 79 139 Q83 152 88 156 L88 104 Z",
      "M113 104 Q123 113 121 139 Q117 152 112 156 L112 104 Z",
    ],
    fibers: ["M82 116 L88 124", "M118 116 L112 124", "M82 130 L88 138", "M118 130 L112 138"],
  },
  hip_flexors: {
    label: "Flexores do quadril",
    view: "front",
    d: [
      "M88 158 Q82 167 84 177 L98 172 L98 160 Z",
      "M112 158 Q118 167 116 177 L102 172 L102 160 Z",
    ],
  },
  adductors: {
    label: "Adutores (parte interna da coxa)",
    view: "front",
    d: [
      "M92 175 Q86 195 88 215 L98 210 L98 175 Z",
      "M108 175 Q114 195 112 215 L102 210 L102 175 Z",
    ],
    fibers: ["M94 182 Q93 198 95 208", "M106 182 Q107 198 105 208"],
  },
  abductors: {
    label: "Abdutores (lateral da coxa)",
    view: "front",
    d: ["M77 176 Q71 194 73 212 L80 208 Q80 190 82 176 Z", "M123 176 Q129 194 127 212 L120 208 Q120 190 118 176 Z"],
  },
  quads: {
    label: "Quadríceps (frente da coxa)",
    view: "front",
    d: [
      // vasto lateral / reto femoral / vasto medial
      "M79 177 Q71 200 75 228 Q80 236 85 230 Q86 202 87 177 Z",
      "M88 177 Q86 204 87 232 Q92 240 95 230 Q96 202 95 177 Z",
      "M121 177 Q129 200 125 228 Q120 236 115 230 Q114 202 113 177 Z",
      "M112 177 Q114 204 113 232 Q108 240 105 230 Q104 202 105 177 Z",
    ],
    fibers: ["M82 190 Q80 210 82 226", "M118 190 Q120 210 118 226"],
  },
  knee: {
    label: "Joelho",
    view: "front",
    d: ["M80 238 Q88 236 92 242 Q86 248 80 244 Z", "M120 238 Q112 236 108 242 Q114 248 120 244 Z"],
  },
  tibialis: {
    label: "Tibial (canela)",
    view: "front",
    d: [
      "M81 251 Q75 273 77 296 Q83 301 87 294 Q88 271 88 251 Z",
      "M119 251 Q125 273 123 296 Q117 301 113 294 Q112 271 112 251 Z",
    ],
  },
  traps: {
    label: "Trapézio (parte alta das costas)",
    view: "back",
    d: [
      "M99 54 L77 62 Q69 77 75 95 L99 108 Z",
      "M101 54 L123 62 Q131 77 125 95 L101 108 Z",
    ],
    fibers: ["M84 66 L98 78", "M116 66 L102 78", "M80 84 L98 96", "M120 84 L102 96"],
  },
  rhomboids: {
    label: "Romboides (entre as escápulas)",
    view: "back",
    d: ["M88 92 L99 96 L99 114 L86 108 Z", "M112 92 L101 96 L101 114 L114 108 Z"],
  },
  infraspinatus: {
    label: "Infraespinhal / manguito rotador",
    view: "back",
    d: ["M78 92 Q70 100 74 114 L86 110 L84 94 Z", "M122 92 Q130 100 126 114 L114 110 L116 94 Z"],
    fibers: ["M78 100 L85 104", "M122 100 L115 104"],
  },
  upper_back: {
    label: "Dorsal superior",
    view: "back",
    d: ["M81 95 Q100 89 119 95 Q121 109 117 119 Q100 113 83 119 Q79 109 81 95 Z"],
  },
  rear_delt: {
    label: "Deltoide posterior",
    view: "back",
    d: [
      "M76 64 Q62 69 58 83 Q56 95 62 99 Q72 93 77 77 Z",
      "M124 64 Q138 69 142 83 Q144 95 138 99 Q128 93 123 77 Z",
    ],
  },
  triceps: {
    label: "Tríceps",
    view: "back",
    d: [
      "M56 100 Q49 115 52 131 Q59 137 66 129 Q68 112 63 100 Z",
      "M144 100 Q151 115 148 131 Q141 137 134 129 Q132 112 137 100 Z",
    ],
    fibers: ["M59 106 L59 128", "M141 106 L141 128"],
  },
  lats: {
    label: "Dorsais (costas)",
    view: "back",
    d: [
      "M81 119 Q70 136 79 157 L98 150 L98 121 Z",
      "M119 119 Q130 136 121 157 L102 150 L102 121 Z",
    ],
    fibers: ["M84 128 Q90 140 96 146", "M116 128 Q110 140 104 146"],
  },
  lower_back: {
    label: "Eretores (coluna lombar)",
    view: "back",
    d: [
      "M92 121 Q88 145 92 165 L98 165 L98 121 Z",
      "M108 121 Q112 145 108 165 L102 165 L102 121 Z",
    ],
  },
  glutes: {
    label: "Glúteo máximo (bumbum)",
    view: "back",
    d: [
      "M98 168 Q80 168 76 187 Q78 205 92 207 Q99 199 98 168 Z",
      "M102 168 Q120 168 124 187 Q122 205 108 207 Q101 199 102 168 Z",
    ],
    fibers: ["M82 178 Q90 186 94 196", "M118 178 Q110 186 106 196"],
  },
  glute_med: {
    label: "Glúteo médio (lateral do quadril)",
    view: "back",
    d: ["M76 166 Q70 174 74 186 L82 178 Z", "M124 166 Q130 174 126 186 L118 178 Z"],
  },
  hamstrings: {
    label: "Posteriores (trás da coxa)",
    view: "back",
    d: [
      "M80 209 Q73 230 78 248 Q84 254 88 246 Q89 226 88 209 Z",
      "M90 209 Q89 230 92 246 Q96 252 96 244 Q96 226 95 209 Z",
      "M120 209 Q127 230 122 248 Q116 254 112 246 Q111 226 112 209 Z",
      "M110 209 Q111 230 108 246 Q104 252 104 244 Q104 226 105 209 Z",
    ],
    fibers: ["M84 218 Q83 234 85 244", "M116 218 Q117 234 115 244"],
  },
  calves: {
    label: "Panturrilha (batata da perna)",
    view: "back",
    d: [
      "M80 255 Q73 271 78 286 Q84 292 88 283 Q90 268 89 255 Z",
      "M90 255 Q90 270 92 283 Q96 289 96 280 Q96 267 95 255 Z",
      "M120 255 Q127 271 122 286 Q116 292 112 283 Q110 268 111 255 Z",
      "M110 255 Q110 270 108 283 Q104 289 104 280 Q104 267 105 255 Z",
    ],
  },
  soleus: {
    label: "Sóleo (panturrilha profunda)",
    view: "back",
    d: ["M80 288 Q78 296 82 302 L90 298 L88 288 Z", "M120 288 Q122 296 118 302 L110 298 L112 288 Z"],
  },
};

const ALIASES: Record<string, string> = {
  chest: "lower_chest",
  peitoral: "lower_chest",
  peito: "lower_chest",
  peitoral_maior: "lower_chest",
  peitoral_superior: "upper_chest",
  peitoral_inferior: "lower_chest",
  shoulders: "side_delt",
  deltoids: "side_delt",
  deltoides: "side_delt",
  ombros: "side_delt",
  ombro: "side_delt",
  ombro_frente: "front_delt",
  ombro_lateral: "side_delt",
  ombro_tras: "rear_delt",
  deltoides_posteriores: "rear_delt",
  deltoide_posterior: "rear_delt",
  deltoide_anterior: "front_delt",
  abs: "core",
  abdomen: "core",
  abdominais: "core",
  reto_abdominal: "core",
  transverso: "core",
  transverso_abdominal: "core",
  barriga: "core",
  back: "upper_back",
  costas: "lats",
  dorsal: "lats",
  dorsais: "lats",
  latissimo: "lats",
  romboides: "rhomboids",
  rhomboids: "rhomboids",
  escapulas: "rhomboids",
  manguito: "infraspinatus",
  manguito_rotador: "infraspinatus",
  rotator_cuff: "infraspinatus",
  infraespinhal: "infraspinatus",
  redondo_menor: "infraspinatus",
  supraespinhal: "infraspinatus",
  gluteos: "glutes",
  gluteo: "glutes",
  gluteo_maximo: "glutes",
  gluteo_medio: "glute_med",
  gluteus_medius: "glute_med",
  bumbum: "glutes",
  quadriceps: "quads",
  quadriceps_femoral: "quads",
  posteriores: "hamstrings",
  isquiotibiais: "hamstrings",
  hamstrings: "hamstrings",
  panturrilhas: "calves",
  panturrilha: "calves",
  gemeos: "calves",
  soleo: "soleus",
  biceps_braquial: "biceps",
  triceps_braquial: "triceps",
  antebraco: "forearms",
  antebracos: "forearms",
  trapezio: "traps",
  trapezio_medio: "traps",
  trapezio_superior: "traps_front",
  lombar: "lower_back",
  eretores: "lower_back",
  eretores_da_espinha: "lower_back",
  erector_spinae: "lower_back",
  oblique: "obliques",
  obliquos: "obliques",
  adutores: "adductors",
  abdutores: "abductors",
  serratil: "serratus",
  serratus_anterior: "serratus",
  pescoco: "neck",
  flexores_do_quadril: "hip_flexors",
  hip_flexors: "hip_flexors",
  tibial: "tibialis",
  tibial_anterior: "tibialis",
  canela: "tibialis",
};

function normalize(z: string) {
  const k = z
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
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

  // Nunca renderizar mapa vazio.
  if (primary.size === 0 && secondary.size === 0) return null;

  const activeLabels = [...primary].map((k) => MUSCLES[k].label);
  const secondaryLabels = [...secondary].map((k) => MUSCLES[k].label);

  const renderBody = (view: View) => (
    <svg viewBox="0 0 200 320" height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`skin-${view}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f2440" />
          <stop offset="100%" stopColor="#15182c" />
        </linearGradient>
        <linearGradient id={`hot-${view}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.amber} stopOpacity="0.95" />
          <stop offset="100%" stopColor={C.amber} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`warm-${view}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.teal} stopOpacity="0.8" />
          <stop offset="100%" stopColor={C.teal} stopOpacity="0.4" />
        </linearGradient>
        <filter id={`glow-${view}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* silhueta corporal */}
      <g fill={`url(#skin-${view})`} stroke={C.bodyEdge} strokeWidth="1">
        <ellipse cx="100" cy="32" rx="15" ry="19" />
        <path d="M93 47 L107 47 L109 60 L91 60 Z" />
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
            ? `url(#hot-${view})`
            : isSecondary
              ? `url(#warm-${view})`
              : C.body;
          const stroke = isPrimary ? C.amber : isSecondary ? C.teal : C.line;
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
                  strokeWidth={isPrimary || isSecondary ? 0.9 : 0.6}
                  opacity={isPrimary ? 1 : isSecondary ? 0.95 : 0.9}
                />
              ))}
              {m.fibers?.map((d, i) => (
                <path
                  key={`f${i}`}
                  d={d}
                  fill="none"
                  stroke={isPrimary ? "#ffffff" : isSecondary ? "#ffffff" : C.fiber}
                  strokeWidth="0.5"
                  opacity={isPrimary ? 0.35 : isSecondary ? 0.25 : 0.55}
                />
              ))}
            </g>
          );
        })}

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
        }}
      >
        {renderBody("front")}
        {renderBody("back")}
      </div>

      {(activeLabels.length > 0 || secondaryLabels.length > 0) && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {activeLabels.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontFamily: C.mono, color: C.amber, letterSpacing: 1.4 }}>
                PRINCIPAIS
              </span>
              {activeLabels.map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 999,
                    color: C.amber,
                    background: `${C.amber}18`,
                    border: `1px solid ${C.amber}55`,
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          )}
          {secondaryLabels.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontFamily: C.mono, color: C.teal, letterSpacing: 1.4 }}>
                SECUNDÁRIOS
              </span>
              {secondaryLabels.map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 999,
                    color: C.teal,
                    background: `${C.teal}18`,
                    border: `1px solid ${C.teal}55`,
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes anatomyPulse { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}
