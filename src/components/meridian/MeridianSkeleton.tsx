// MERIDIAN — Skeleton loader matching SITREP visual style.
export default function MeridianSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        background: "rgba(184,146,42,0.04)",
        border: "1px solid rgba(184,146,42,0.25)",
        borderLeft: "4px solid #B8922A",
        padding: 20,
        borderRadius: 4,
        display: "grid",
        gap: 12,
      }}
    >
      <style>{`
        @keyframes meridian-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .meridian-skel-bar {
          height: 12px;
          border-radius: 2px;
          background: linear-gradient(
            90deg,
            rgba(184,146,42,0.06) 0%,
            rgba(184,146,42,0.18) 50%,
            rgba(184,146,42,0.06) 100%
          );
          background-size: 800px 100%;
          animation: meridian-shimmer 1.4s linear infinite;
        }
      `}</style>
      <div className="meridian-skel-bar" style={{ width: "32%", height: 8 }} />
      <div className="meridian-skel-bar" style={{ width: "60%", height: 18 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="meridian-skel-bar"
          style={{ width: `${90 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
