const ACTIVITIES = [
  { dot: "#00f0b4", text: "G.T. · Men's Physique · RPE 9 · Dia de Pernas" },
  { dot: "#e8a020", text: "J.C. · Pull PPL · Muscle State FULL · +240 kcal" },
  { dot: "#00f0b4", text: "R.M. · Corrida 12km · Carb loading 8g/kg" },
  { dot: "#7890ff", text: "A.S. · Peak Week Dia 4 · Supercompensação iniciada" },
  { dot: "#e8a020", text: "F.L. · HIIT · Eletrólitos: sódio 450mg" },
  { dot: "#00f0b4", text: "M.B. · Upper Body · Readiness 9/10 · Pronto" },
  { dot: "#ff4444", text: "C.N. · Deload ativado · 3 sessões RPE≥8 detectado" },
  { dot: "#e8a020", text: "L.T. · Push PPL · Intra-treino: EAA 10g" },
];

const LandingActivityFeed = () => (
  <div
    className="relative overflow-hidden flex items-center"
    style={{
      background: "#040410",
      borderTop: "1px solid rgba(232,160,32,.06)",
      borderBottom: "1px solid rgba(232,160,32,.06)",
      height: "80px",
    }}
  >
    {/* Live label */}
    <div className="relative z-20 flex items-center gap-2 pl-6 pr-5 shrink-0">
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: "#00f0b4", boxShadow: "0 0 8px rgba(0,240,180,1)" }}
      />
      <span
        className="font-mono text-[.58rem] tracking-[.22em] uppercase"
        style={{ color: "rgba(0,240,180,.85)" }}
      >
        ● Ao vivo
      </span>
    </div>

    {/* Fades */}
    <div
      className="absolute left-[120px] top-0 bottom-0 w-20 z-10 pointer-events-none"
      style={{ background: "linear-gradient(to right, #040410, transparent)" }}
    />
    <div
      className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
      style={{ background: "linear-gradient(to left, #040410, transparent)" }}
    />

    {/* Ticker */}
    <div className="flex-1 overflow-hidden">
      <div className="flex whitespace-nowrap animate-[activity-ticker_35s_linear_infinite]">
        {[...ACTIVITIES, ...ACTIVITIES, ...ACTIVITIES].map((a, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 px-7 font-mono text-[.56rem] tracking-[.06em] shrink-0"
            style={{ color: "rgba(240,237,248,.55)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: a.dot, boxShadow: `0 0 6px ${a.dot}` }}
            />
            {a.text}
            <span style={{ color: "#30306a" }}>·</span>
          </span>
        ))}
      </div>
    </div>
    <style>{`@keyframes activity-ticker { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
  </div>
);

export default LandingActivityFeed;
