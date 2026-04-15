const VertexLogoHorizontal = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 680 76" className={className} xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: 'auto' }}>
    <defs>
      <linearGradient id="vlh-liquid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="vlh-v-stroke" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>

    {/* Icon box */}
    <rect x="0" y="6" width="64" height="64" rx="14" fill="#030408" />

    {/* Grid 3x3 inside icon */}
    {[22, 38, 54].map(y => <line key={`h${y}`} x1="8" y1={y} x2="56" y2={y} stroke="#7c3aed" strokeWidth="0.25" opacity="0.15" />)}
    {[22, 38, 54].map(x => <line key={`v${x}`} x1={x} y1="14" x2={x} y2="62" stroke="#7c3aed" strokeWidth="0.25" opacity="0.15" />)}

    {/* Flask inside icon */}
    <rect x="28" y="28" width="8" height="14" rx="1" fill="#030408" stroke="#7c3aed" strokeWidth="0.6" opacity="0.65" />
    <path d="M24 42 L16 58 L48 58 L40 42 Z" fill="#030408" stroke="#7c3aed" strokeWidth="0.6" opacity="0.65" />
    <rect x="26" y="26" width="12" height="3" rx="1" fill="#030408" stroke="#a78bfa" strokeWidth="0.6" />
    <path d="M24 50 L18 58 L46 58 L40 50 Z" fill="url(#vlh-liquid)" />

    {/* Triangle */}
    <polygon points="32,12 50,36 14,36" fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.5" />
    <circle cx="32" cy="12" r="2.2" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="0.8" />

    {/* V below triangle */}
    <path d="M22,40 L32,58 L42,40" fill="none" stroke="url(#vlh-v-stroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22,40 L32,58 L42,40" fill="none" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.4" />
    <circle cx="32" cy="58" r="2" fill="#c4b5fd" opacity="0.8" />

    {/* Orbit + electron */}
    <ellipse cx="32" cy="38" rx="28" ry="10" fill="none" stroke="#06b6d4" strokeWidth="0.3" opacity="0.2" strokeDasharray="2,3" />
    <circle cx="56" cy="34" r="2" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="0.6" />

    {/* Text */}
    <text x="82" y="34" fontFamily="'Rajdhani', sans-serif" fontWeight="700" fontSize="26" fill="#a78bfa" letterSpacing="3">DR. VERTEX</text>
    <text x="84" y="50" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="#4f46e5" letterSpacing="1.5">PHARMACOLOGICAL INTELLIGENCE</text>
    <line x1="82" y1="55" x2="360" y2="55" stroke="#7c3aed" strokeWidth="0.4" opacity="0.3" />
    <text x="84" y="67" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#3a2d5c" letterSpacing="1">nutriON CSO · Ciência sem censura. Prática sem medo.</text>
  </svg>
);

export default VertexLogoHorizontal;
