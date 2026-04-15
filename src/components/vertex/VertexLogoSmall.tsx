/**
 * Small VERTEX logo variants: 80px, 48px, 32px, 20px
 */

export const VertexLogo80 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 80 80" width="80" height="80" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vl80-liq" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="39" fill="#030408" stroke="#7c3aed" strokeWidth="0.5" opacity="0.3" />
    {/* Grid 3x3 */}
    {[28, 40, 52].map(v => <line key={`h${v}`} x1="20" y1={v} x2="60" y2={v} stroke="#7c3aed" strokeWidth="0.2" opacity="0.15" />)}
    {[28, 40, 52].map(v => <line key={`v${v}`} x1={v} y1="20" x2={v} y2="60" stroke="#7c3aed" strokeWidth="0.2" opacity="0.15" />)}
    {/* Flask left side */}
    <rect x="16" y="32" width="6" height="12" rx="1" fill="#030408" stroke="#7c3aed" strokeWidth="0.5" opacity="0.6" />
    <path d="M14 44 L10 56 L26 56 L22 44 Z" fill="#030408" stroke="#7c3aed" strokeWidth="0.5" opacity="0.6" />
    <path d="M14 50 L11 56 L25 56 L22 50 Z" fill="url(#vl80-liq)" />
    <circle cx="16" cy="53" r="1.2" fill="none" stroke="#7c3aed" strokeWidth="0.5" />
    <circle cx="20" cy="54" r="0.8" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
    {/* Triangle right */}
    <polygon points="52,18 68,44 36,44" fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.5" />
    <circle cx="52" cy="18" r="2.5" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="0.8" />
    {/* V below */}
    <path d="M42,48 L52,64 L62,48" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="52" cy="64" r="1.5" fill="#c4b5fd" opacity="0.8" />
    {/* Electron */}
    <circle cx="66" cy="30" r="1.5" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="0.5" />
  </svg>
);

export const VertexLogo48 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" width="48" height="48" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vl48-liq" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="11" fill="#030408" />
    {/* Grid 2x2 */}
    <line x1="16" y1="16" x2="32" y2="16" stroke="#7c3aed" strokeWidth="0.2" opacity="0.15" />
    <line x1="16" y1="32" x2="32" y2="32" stroke="#7c3aed" strokeWidth="0.2" opacity="0.15" />
    <line x1="16" y1="16" x2="16" y2="32" stroke="#7c3aed" strokeWidth="0.2" opacity="0.15" />
    <line x1="32" y1="16" x2="32" y2="32" stroke="#7c3aed" strokeWidth="0.2" opacity="0.15" />
    {/* Flask */}
    <rect x="20" y="18" width="8" height="10" rx="1" fill="#030408" stroke="#7c3aed" strokeWidth="0.5" opacity="0.6" />
    <path d="M18 28 L12 40 L36 40 L30 28 Z" fill="#030408" stroke="#7c3aed" strokeWidth="0.5" opacity="0.6" />
    <path d="M18 34 L14 40 L34 40 L30 34 Z" fill="url(#vl48-liq)" />
    {/* Triangle */}
    <polygon points="24,6 38,24 10,24" fill="none" stroke="#7c3aed" strokeWidth="0.7" opacity="0.5" />
    <circle cx="24" cy="6" r="1.8" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="0.6" />
    {/* V below */}
    <path d="M16,28 L24,40 L32,28" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="24" cy="40" r="1.5" fill="#c4b5fd" opacity="0.8" />
  </svg>
);

export const VertexLogo32 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" width="32" height="32" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vl32-liq" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="#030408" />
    {/* Flask micro */}
    <rect x="13" y="12" width="6" height="7" rx="1" fill="#030408" stroke="#7c3aed" strokeWidth="0.4" opacity="0.6" />
    <path d="M12 19 L8 28 L24 28 L20 19 Z" fill="#030408" stroke="#7c3aed" strokeWidth="0.4" opacity="0.6" />
    <path d="M12 24 L9 28 L23 28 L20 24 Z" fill="url(#vl32-liq)" />
    {/* Triangle compact */}
    <polygon points="16,3 26,16 6,16" fill="none" stroke="#7c3aed" strokeWidth="0.6" opacity="0.5" />
    <circle cx="16" cy="3" r="1.5" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="0.5" />
    {/* V below */}
    <path d="M10,19 L16,28 L22,19" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="28" r="1.2" fill="#c4b5fd" opacity="0.8" />
  </svg>
);

export const VertexLogo20 = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" width="20" height="20" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="5" fill="#030408" />
    {/* Triangle dominant */}
    <polygon points="10,2 18,12 2,12" fill="none" stroke="#7c3aed" strokeWidth="0.6" opacity="0.6" />
    <circle cx="10" cy="2" r="1.2" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="0.4" />
    {/* V below */}
    <path d="M5,13 L10,19 L15,13" fill="none" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="19" r="1" fill="#c4b5fd" opacity="0.8" />
  </svg>
);
