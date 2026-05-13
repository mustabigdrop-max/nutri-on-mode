interface ApexSymbolProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

export function ApexSymbol({ size = 48, color = "#00D4FF", animated = true }: ApexSymbolProps) {
  const s = size;
  const c = color;
  // unique id suffix avoids collisions when multiple instances of same size are rendered
  const uid = `${s}-${Math.round(Math.random() * 1e6)}`;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <radialGradient id={`apexGlow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`apexCyan-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor={c} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        <style>{`
          @keyframes apexRing1-${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes apexRing2-${uid} { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
          @keyframes apexRing3-${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes apexPulse-${uid} {
            0%, 100% { opacity: 1; r: 4px; }
            50%      { opacity: 0.4; r: 2.5px; }
          }
          @keyframes apexScan-${uid} {
            0%   { transform: translateY(-28px); opacity: 0; }
            8%   { opacity: 0.7; }
            92%  { opacity: 0.7; }
            100% { transform: translateY(28px); opacity: 0; }
          }
          .apex-ring-outer-${uid} {
            transform-box: fill-box;
            transform-origin: center;
            animation: ${animated ? `apexRing3-${uid} 12s linear infinite` : "none"};
          }
          .apex-ring-mid-${uid} {
            transform-box: fill-box;
            transform-origin: center;
            animation: ${animated ? `apexRing2-${uid} 5s linear infinite` : "none"};
          }
          .apex-ring-inner-${uid} {
            transform-box: fill-box;
            transform-origin: center;
            animation: ${animated ? `apexRing1-${uid} 8s linear infinite` : "none"};
          }
          .apex-core-${uid} {
            animation: ${animated ? `apexPulse-${uid} 2s ease-in-out infinite` : "none"};
          }
          .apex-scan-${uid} {
            animation: ${animated ? `apexScan-${uid} 2.5s ease-in-out infinite` : "none"};
          }
        `}</style>
      </defs>

      {/* Glow de fundo */}
      <circle cx="50" cy="50" r="48" fill={`url(#apexGlow-${uid})`} />

      {/* Anel externo — pontilhado lento */}
      <g className={`apex-ring-outer-${uid}`}>
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={c}
          strokeWidth="0.6"
          strokeDasharray="2 4"
          opacity="0.5"
        />
      </g>

      {/* Anel médio — com marcadores cardeais */}
      <g className={`apex-ring-mid-${uid}`}>
        <circle cx="50" cy="50" r="34" fill="none" stroke={c} strokeWidth="0.8" opacity="0.7" />
        <circle cx="50" cy="16" r="1.6" fill={c} />
        <circle cx="84" cy="50" r="1.6" fill={c} />
        <circle cx="50" cy="84" r="1.6" fill={c} />
        <circle cx="16" cy="50" r="1.6" fill={c} />
      </g>

      {/* Anel interno — traços */}
      <g className={`apex-ring-inner-${uid}`}>
        <circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke={c}
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.85"
        />
      </g>

      {/* Cruz de mira interna */}
      <line x1="50" y1="34" x2="50" y2="44" stroke={c} strokeWidth="1" opacity="0.9" />
      <line x1="50" y1="56" x2="50" y2="66" stroke={c} strokeWidth="1" opacity="0.9" />
      <line x1="34" y1="50" x2="44" y2="50" stroke={c} strokeWidth="1" opacity="0.9" />
      <line x1="56" y1="50" x2="66" y2="50" stroke={c} strokeWidth="1" opacity="0.9" />

      {/* Cantos do crosshair externo — L shapes */}
      <polyline points="10,18 10,10 18,10" fill="none" stroke={c} strokeWidth="1.4" />
      <polyline points="82,10 90,10 90,18" fill="none" stroke={c} strokeWidth="1.4" />
      <polyline points="10,82 10,90 18,90" fill="none" stroke={c} strokeWidth="1.4" />
      <polyline points="90,82 90,90 82,90" fill="none" stroke={c} strokeWidth="1.4" />

      {/* Linha de scan horizontal */}
      <g className={`apex-scan-${uid}`}>
        <line x1="20" y1="50" x2="80" y2="50" stroke={`url(#apexCyan-${uid})`} strokeWidth="1" />
      </g>

      {/* Núcleo central pulsante */}
      <circle className={`apex-core-${uid}`} cx="50" cy="50" r="3.5" fill={c} />
    </svg>
  );
}

export default ApexSymbol;
