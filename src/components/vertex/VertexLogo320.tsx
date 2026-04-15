const VertexLogo320 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 320 320" width="320" height="320" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vl-liquid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="vl-tri-stroke" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <linearGradient id="vl-v-stroke" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <linearGradient id="vl-tri-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.13" />
        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.04" />
      </linearGradient>
    </defs>

    {/* 1. Background */}
    <circle cx="160" cy="155" r="148" fill="#030408" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />
    <circle cx="160" cy="155" r="140" fill="none" stroke="#4f46e5" strokeWidth="0.3" opacity="0.15" />

    {/* 2. Lab Grid */}
    {[95, 125, 155, 185, 215].map(y => <line key={`h${y}`} x1="95" y1={y} x2="225" y2={y} stroke="#7c3aed" strokeWidth="0.25" opacity="0.1" />)}
    {[95, 125, 155, 185, 215].map(x => <line key={`v${x}`} x1={x} y1="95" x2={x} y2="225" stroke="#7c3aed" strokeWidth="0.25" opacity="0.1" />)}

    {/* 8. Outer ring dashed */}
    <circle cx="160" cy="155" r="152" fill="none" stroke="#7c3aed" strokeWidth="0.4" opacity="0.1" strokeDasharray="3,9" />

    {/* 8. Cardinal markers */}
    <line x1="160" y1="7" x2="160" y2="18" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
    <line x1="160" y1="292" x2="160" y2="303" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
    <line x1="7" y1="155" x2="18" y2="155" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
    <line x1="302" y1="155" x2="313" y2="155" stroke="#7c3aed" strokeWidth="1" opacity="0.4" />
    {/* Diagonal markers */}
    <line x1="50" y1="50" x2="59" y2="59" stroke="#7c3aed" strokeWidth="0.8" opacity="0.3" />
    <line x1="261" y1="50" x2="270" y2="59" stroke="#7c3aed" strokeWidth="0.8" opacity="0.3" />
    <line x1="50" y1="261" x2="59" y2="252" stroke="#7c3aed" strokeWidth="0.8" opacity="0.3" />
    <line x1="261" y1="261" x2="270" y2="252" stroke="#7c3aed" strokeWidth="0.8" opacity="0.3" />

    {/* 6. Molecular Orbits */}
    <ellipse cx="160" cy="148" rx="115" ry="36" fill="none" stroke="#7c3aed" strokeWidth="0.4" opacity="0.22" transform="rotate(-30 160 148)" />
    <ellipse cx="160" cy="148" rx="115" ry="36" fill="none" stroke="#06b6d4" strokeWidth="0.4" opacity="0.18" transform="rotate(30 160 148)" />
    <ellipse cx="160" cy="148" rx="20" ry="115" fill="none" stroke="#a78bfa" strokeWidth="0.4" opacity="0.15" />
    {/* Electrons */}
    <circle cx="256" cy="138" r="3.5" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="1" />
    <circle cx="66" cy="140" r="2.5" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" />
    <circle cx="160" cy="34" r="3" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1" />
    <circle cx="244" cy="185" r="2" fill="#4f46e5" stroke="#818cf8" strokeWidth="1" />

    {/* 3. Erlenmeyer Flask */}
    <rect x="148" y="142" width="24" height="47" rx="2" fill="#030408" stroke="#7c3aed" strokeWidth="1" opacity="0.65" />
    <path d="M138 188 L108 241 L212 241 L182 188 Z" fill="#030408" stroke="#7c3aed" strokeWidth="1" opacity="0.65" />
    <rect x="143" y="136" width="34" height="8" rx="2" fill="#030408" stroke="#a78bfa" strokeWidth="1" />
    <path d="M138 208 L112 241 L208 241 L182 208 Z" fill="url(#vl-liquid)" />
    <line x1="138" y1="208" x2="182" y2="208" stroke="#a78bfa" strokeWidth="0.6" opacity="0.45" />
    {/* Bubbles */}
    <circle cx="145" cy="225" r="3" fill="none" stroke="#7c3aed" strokeWidth="0.8" />
    <circle cx="165" cy="231" r="2" fill="none" stroke="#7c3aed" strokeWidth="0.8" />
    <circle cx="185" cy="221" r="4" fill="none" stroke="#06b6d4" strokeWidth="0.8" />
    <circle cx="175" cy="235" r="2.5" fill="none" stroke="#7c3aed" strokeWidth="0.8" />
    {/* Vapor */}
    <path d="M155 136 Q150 123 158 111 Q165 99 160 88" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.3" strokeDasharray="2,3" />
    <path d="M165 136 Q172 121 165 108 Q158 95 164 83" fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.25" strokeDasharray="2,3" />

    {/* 4. Triangle */}
    <polygon points="160,55 222,162 98,162" fill="url(#vl-tri-fill)" stroke="url(#vl-tri-stroke)" strokeWidth="1.2" />
    <polygon points="160,72 210,152 110,152" fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.35" />
    <circle cx="160" cy="55" r="4" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="1" />
    <line x1="160" y1="55" x2="160" y2="162" stroke="#a78bfa" strokeWidth="0.5" opacity="0.25" strokeDasharray="3,5" />

    {/* 5. V below triangle */}
    <path d="M136 172 L160 218 L184 172" fill="none" stroke="url(#vl-v-stroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M136 172 L160 218 L184 172" fill="none" stroke="#c4b5fd" strokeWidth="1" opacity="0.4" />
    <circle cx="160" cy="218" r="2.5" fill="#c4b5fd" opacity="0.8" />

    {/* 7. Decorative nodes */}
    <circle cx="82" cy="80" r="5" fill="none" stroke="#7c3aed" strokeWidth="0.8" />
    <circle cx="82" cy="80" r="2" fill="#7c3aed" />
    <line x1="82" y1="80" x2="108" y2="106" stroke="#7c3aed" strokeWidth="0.4" opacity="0.25" />
    <circle cx="238" cy="80" r="5" fill="none" stroke="#06b6d4" strokeWidth="0.8" />
    <circle cx="238" cy="80" r="2" fill="#06b6d4" />
    <line x1="238" y1="80" x2="212" y2="106" stroke="#06b6d4" strokeWidth="0.4" opacity="0.25" />
    <circle cx="72" cy="241" r="4" fill="none" stroke="#a78bfa" strokeWidth="0.8" />
    <circle cx="72" cy="241" r="1.5" fill="#a78bfa" />
    <circle cx="248" cy="241" r="4" fill="none" stroke="#a78bfa" strokeWidth="0.8" />
    <circle cx="248" cy="241" r="1.5" fill="#a78bfa" />

    {/* 9. Typography */}
    <text x="160" y="268" textAnchor="middle" fontFamily="'Rajdhani', sans-serif" fontWeight="700" fontSize="22" fill="#a78bfa" letterSpacing="6">VERTEX</text>
    <text x="160" y="283" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#4f46e5" letterSpacing="2.5">PHARMACOLOGICAL INTELLIGENCE</text>
  </svg>
);

export default VertexLogo320;
