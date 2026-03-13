import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const PROVOCATIONS = [
  "Você já tentou emagrecer 3 vezes este ano.",
  "Seu app atual sabe o que você comeu. Não sabe por que você desistiu.",
  "Motivação dura 2 semanas. Protocolo dura a vida.",
  "Cardápio é intenção. Protocolo é resultado.",
  "99% dos apps te pedem para contar caloria. 0% te explicam por que você errou.",
];

const RotatingProvocation = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % PROVOCATIONS.length), 3800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-[1.4rem] overflow-hidden relative mb-10">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0 font-mono text-[.66rem] text-[#f0edf8]/32 tracking-[.05em]"
        >
          <span className="text-[#e8a020]/50 mr-2">›</span>
          {PROVOCATIONS[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

// Floating clinical data metrics
const METRICS = [
  { label: "GEB CALCULADO", value: "1.847 kcal", color: "#e8a020", delay: 1.4 },
  { label: "PROTEÍNA ALVO", value: "2.2 g/kg", color: "#00f0b4", delay: 1.6 },
  { label: "JANELA ANABÓLICA", value: "30 min", color: "#7890ff", delay: 1.8 },
  { label: "SCORE METABÓLICO", value: "94 / 100", color: "#e8a020", delay: 2.0 },
];

// Orbital ring dots
const ORBIT_DOTS = [
  { angle: 0, label: "PROTEÍNA", value: "2.2g/kg", color: "#e8a020" },
  { angle: 90, label: "CARBOIDRATO", value: "4.0g/kg", color: "#00f0b4" },
  { angle: 180, label: "GORDURA", value: "1.1g/kg", color: "#7890ff" },
  { angle: 270, label: "HIDRATAÇÃO", value: "38ml/kg", color: "#e8a020" },
];

const BodyScanViz = () => (
  <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] flex-shrink-0">
    {/* Outer orbital ring */}
    <motion.div
      className="absolute inset-0 rounded-full border border-[#e8a020]/10"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, ease: "linear", repeat: Infinity }}
    >
      {/* Orbital nodes */}
      {ORBIT_DOTS.map(({ angle, label, value, color }) => {
        const rad = (angle * Math.PI) / 180;
        const r = 50; // % from center
        const cx = 50 + r * Math.cos(rad - Math.PI / 2);
        const cy = 50 + r * Math.sin(rad - Math.PI / 2);
        return (
          <div
            key={label}
            className="absolute"
            style={{ left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%, -50%)" }}
          >
            {/* Node dot */}
            <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          </div>
        );
      })}
    </motion.div>

    {/* Middle ring — counter-rotating */}
    <motion.div
      className="absolute inset-[28px] rounded-full border border-[#00f0b4]/08"
      style={{ borderStyle: "dashed" }}
      animate={{ rotate: -360 }}
      transition={{ duration: 20, ease: "linear", repeat: Infinity }}
    />

    {/* Inner ring */}
    <div className="absolute inset-[56px] rounded-full border border-[#e8a020]/12" />

    {/* Body wireframe — center */}
    <div className="absolute inset-[70px] flex flex-col items-center justify-start pt-2 gap-0">
      {/* Head */}
      <div
        className="w-7 h-7 rounded-full border mb-1 flex-shrink-0"
        style={{ borderColor: "rgba(0,240,180,.35)", boxShadow: "0 0 10px rgba(0,240,180,.15)" }}
      />
      {/* Cervical spine */}
      <div className="w-px h-3 flex-shrink-0" style={{ background: "linear-gradient(to bottom, rgba(0,240,180,.3), rgba(232,160,32,.2))" }} />
      {/* Shoulders + torso */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="flex-shrink-0">
        {/* Shoulders */}
        <path d="M10 12 Q18 8 28 8 L52 8 Q62 8 70 12" stroke="rgba(232,160,32,.3)" strokeWidth="1" fill="none" />
        {/* Clavicles */}
        <line x1="30" y1="8" x2="40" y2="14" stroke="rgba(0,240,180,.2)" strokeWidth="0.8" />
        <line x1="50" y1="8" x2="40" y2="14" stroke="rgba(0,240,180,.2)" strokeWidth="0.8" />
        {/* Sternum / spine */}
        <line x1="40" y1="14" x2="40" y2="60" stroke="rgba(232,160,32,.25)" strokeWidth="0.8" />
        {/* Ribs — left */}
        <path d="M40 22 Q28 26 24 30" stroke="rgba(0,240,180,.15)" strokeWidth="0.7" fill="none" />
        <path d="M40 30 Q26 34 22 38" stroke="rgba(0,240,180,.15)" strokeWidth="0.7" fill="none" />
        <path d="M40 38 Q27 42 24 46" stroke="rgba(0,240,180,.12)" strokeWidth="0.7" fill="none" />
        {/* Ribs — right */}
        <path d="M40 22 Q52 26 56 30" stroke="rgba(0,240,180,.15)" strokeWidth="0.7" fill="none" />
        <path d="M40 30 Q54 34 58 38" stroke="rgba(0,240,180,.15)" strokeWidth="0.7" fill="none" />
        <path d="M40 38 Q53 42 56 46" stroke="rgba(0,240,180,.12)" strokeWidth="0.7" fill="none" />
        {/* Pelvis */}
        <path d="M26 62 Q40 68 54 62" stroke="rgba(232,160,32,.22)" strokeWidth="1" fill="none" />
        {/* Hip joints */}
        <circle cx="28" cy="60" r="2.5" stroke="rgba(232,160,32,.3)" strokeWidth="0.8" fill="none" />
        <circle cx="52" cy="60" r="2.5" stroke="rgba(232,160,32,.3)" strokeWidth="0.8" fill="none" />
      </svg>
    </div>

    {/* Scanning line */}
    <motion.div
      className="absolute left-[10%] right-[10%] h-[1px] rounded-full pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,180,.5), rgba(232,160,32,.7), rgba(0,240,180,.5), transparent)" }}
      animate={{ top: ["8%", "92%", "8%"] }}
      transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
    />

    {/* Pulse rings from center */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border border-[#00f0b4]/08 pointer-events-none"
        style={{ inset: "50%", margin: 0, width: 0, height: 0 }}
        animate={{
          width: ["0px", "260px"],
          height: ["0px", "260px"],
          left: ["50%", "0%"],
          top: ["50%", "0%"],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 3,
          delay: i * 1,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    ))}

    {/* Floating data chips (not on orbit, positioned around the circle) */}
    {ORBIT_DOTS.map(({ angle, label, value, color }, i) => {
      const rad = (angle * Math.PI) / 180;
      const r = 62;
      const cx = 50 + r * Math.cos(rad - Math.PI / 2);
      const cy = 50 + r * Math.sin(rad - Math.PI / 2);
      const isRight = cx > 50;
      return (
        <motion.div
          key={label}
          className="absolute pointer-events-none"
          style={{
            left: `${cx}%`,
            top: `${cy}%`,
            transform: `translate(${isRight ? "8px" : "calc(-100% - 8px)"}, -50%)`,
          }}
          initial={{ opacity: 0, x: isRight ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.2 + i * 0.15, duration: 0.5 }}
        >
          <div
            className="backdrop-blur-md border px-2.5 py-1.5 rounded-[2px]"
            style={{ borderColor: `${color}25`, background: "rgba(3,3,10,.7)" }}
          >
            <div className="font-mono text-[.48rem] tracking-[.14em] mb-0.5" style={{ color }}>
              {label}
            </div>
            <div className="font-heading text-[.8rem] text-white/90 leading-none">{value}</div>
          </div>
        </motion.div>
      );
    })}

    {/* Center glow */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-4 h-4 rounded-full" style={{
        background: "radial-gradient(circle, rgba(232,160,32,.8) 0%, rgba(232,160,32,.2) 50%, transparent 70%)",
        boxShadow: "0 0 20px rgba(232,160,32,.5), 0 0 40px rgba(232,160,32,.2)",
      }} />
    </div>
  </div>
);

const LandingHero = () => {
  const navigate = useNavigate();
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSystemReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-[100px] pb-20 relative overflow-hidden">

      {/* Entry scan line — sweeps once on load */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-[15]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(0,240,180,.35) 20%, rgba(232,160,32,.7) 50%, rgba(0,240,180,.35) 80%, transparent 100%)",
          boxShadow: "0 0 20px rgba(0,240,180,.3)",
        }}
        initial={{ top: "-2%", opacity: 0 }}
        animate={{ top: ["0%", "102%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2, times: [0, 0.05, 0.9, 1] }}
      />

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0 w-full max-w-[1400px] mx-auto">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 relative z-10">

          {/* Rotating provocation */}
          <RotatingProvocation />

          {/* System status badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center gap-2.5 mb-8 border border-[#00f0b4]/15 bg-[#00f0b4]/[.03] px-4 py-2 rounded-full"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00f0b4]"
              style={{
                boxShadow: "0 0 8px rgba(0,240,180,1)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <span className="font-mono text-[.58rem] text-[#00f0b4]/80 tracking-[.2em] uppercase">
              {systemReady ? "Sistema MCE · Ativo" : "Inicializando..."}
            </span>
            <span className="font-mono text-[.55rem] text-[#50507a] tracking-[.08em]">v2.4.1</span>
          </motion.div>

          {/* Ghost subtitle above */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-heading text-[#f0edf8]/06 select-none leading-none mb-1"
            style={{ fontSize: "clamp(1rem, 3vw, 2.2rem)", letterSpacing: ".35em" }}
          >
            TRANSFORME
          </motion.div>

          {/* NUTRION — main headline */}
          <div className="relative mb-1">
            <h1
              className="font-heading leading-[.82] relative"
              style={{ fontSize: "clamp(4.5rem, 12vw, 11rem)" }}
            >
              {/* NUTRI — solid white */}
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.7 }}
                className="inline-block text-[#f0edf8]"
                style={{ letterSpacing: "-.02em" }}
              >
                NUTRI
              </motion.span>

              {/* ON — outlined gold, glowing */}
              <motion.span
                initial={{ opacity: 0, scale: 1.4, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="inline-block relative"
                style={{
                  letterSpacing: "-.01em",
                  color: "transparent",
                  WebkitTextStroke: "2px hsl(38 80% 52%)",
                  textShadow: "0 0 60px rgba(232,160,32,.6), 0 0 120px rgba(232,160,32,.25)",
                }}
              >
                ON
                {/* Power dot */}
                <motion.span
                  className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-[#e8a020]"
                  style={{ boxShadow: "0 0 14px rgba(232,160,32,1), 0 0 28px rgba(232,160,32,.4)" }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </motion.span>
            </h1>
          </div>

          {/* Ghost subtitle below */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-heading text-[#f0edf8]/05 select-none leading-none mb-8"
            style={{ fontSize: "clamp(1rem, 3vw, 2.2rem)", letterSpacing: ".32em" }}
          >
            SEU CORPO. SEU PROTOCOLO.
          </motion.div>

          {/* Separator */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="flex items-center gap-4 mb-6 max-w-[520px]"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-[#e8a020]/35 via-[#e8a020]/08 to-transparent" />
            <span className="font-mono text-[.55rem] text-[#e8a020]/35 tracking-[.25em]">MCE.SYS.ONLINE</span>
            <div className="w-6 h-px bg-[#e8a020]/15" />
          </motion.div>

          {/* Body copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
            className="max-w-[500px] mb-8"
          >
            <p className="text-[1rem] leading-[1.85] text-[#f0edf8]/55 font-landing mb-4">
              A maioria dos apps te dá um cardápio. O NUTRION te dá um{" "}
              <span className="text-[#e8a020] font-semibold">protocolo</span>. Baseado em ciência,
              executado por{" "}
              <span className="text-[#00f0b4] font-semibold">IA comportamental</span>, sustentado pelo
              seu{" "}
              <span className="text-[#f0edf8]/85 font-semibold">mindset</span>.
            </p>

            {/* Inline badge */}
            <div className="inline-flex items-center gap-2 border border-[#e8a020]/12 bg-[#e8a020]/[.03] px-3.5 py-1.5 rounded-full">
              <span className="text-[12px]">🇺🇸</span>
              <span className="font-mono text-[.58rem] text-[#8888b0] tracking-[.08em]">Formação americana em nutrição</span>
              <span className="w-1 h-1 rounded-full bg-[#00f0b4]/40" />
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="flex flex-wrap mb-9 border border-[#e8a020]/08 w-fit"
          >
            {[
              { val: "MCE", label: "Metodologia", sub: "Mindset · Comportamento · Execução" },
              { val: "24H", label: "Sempre ON", sub: "Planejamento nativo a qualquer hora" },
              { val: "0", label: "Apps iguais", sub: "Nada como isso no Brasil" },
            ].map((m, i) => (
              <div key={m.val} className="px-5 py-4 border-r border-[#e8a020]/08 last:border-r-0 relative">
                <div
                  className="font-heading text-[2.1rem] text-[#e8a020] leading-none mb-1"
                  style={{ textShadow: "0 0 24px rgba(232,160,32,.4)" }}
                >
                  {m.val}
                </div>
                <div className="font-mono text-[.55rem] text-[#f0edf8]/45 tracking-[.12em] uppercase">{m.label}</div>
                <div className="font-mono text-[.5rem] text-[#404060] tracking-[.04em] mt-0.5">{m.sub}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.7 }}
            className="flex gap-3 flex-wrap"
          >
            {/* Primary — clipped corner button */}
            <button
              onClick={() => navigate("/auth")}
              className="group relative font-heading text-[.95rem] tracking-[.07em] px-9 py-4 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[.98]"
              style={{
                background: "hsl(38 80% 52%)",
                color: "#030310",
                clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                boxShadow: "0 0 30px rgba(232,160,32,.25)",
              }}
            >
              <span className="relative z-10">ATIVAR MEU PROTOCOLO →</span>
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/12 transition-colors duration-300" />
            </button>

            {/* Secondary */}
            <a
              href="#protocols"
              className="font-mono text-[.68rem] text-[#4a4a6a] tracking-[.12em] px-6 py-4 border border-[#1c1c32] hover:border-[#e8a020]/25 hover:text-[#e8a020]/70 transition-all duration-300 flex items-center gap-2.5"
            >
              <span className="w-1 h-1 rounded-full bg-current opacity-70" />
              VER PROTOCOLOS
            </a>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — Body Scan Viz ── */}
        <motion.div
          className="flex-shrink-0 relative hidden lg:flex items-center justify-center"
          style={{ width: "480px" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.0 }}
        >
          {/* Floating metric panels — above + below */}
          {METRICS.map((m, i) => {
            const isLeft = i % 2 === 0;
            const topPct = [8, 22, 60, 75][i];
            return (
              <motion.div
                key={m.label}
                className="absolute z-20"
                style={{
                  [isLeft ? "left" : "right"]: "-10px",
                  top: `${topPct}%`,
                  transform: "translateY(-50%)",
                }}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: m.delay, duration: 0.5 }}
              >
                <div
                  className="backdrop-blur-xl border rounded-[3px] px-3.5 py-2.5"
                  style={{
                    borderColor: `${m.color}20`,
                    background: "rgba(3,3,10,.75)",
                    boxShadow: `0 0 20px ${m.color}10`,
                  }}
                >
                  <div className="font-mono text-[.5rem] tracking-[.16em] mb-1" style={{ color: m.color }}>
                    {m.label}
                  </div>
                  <div className="font-heading text-[1rem] text-white/90 leading-none">{m.value}</div>
                </div>
              </motion.div>
            );
          })}

          <BodyScanViz />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <span className="font-mono text-[.52rem] tracking-[.3em] text-[#30305a]">SCROLL</span>
        <div
          className="w-px h-10"
          style={{ background: "linear-gradient(to bottom, rgba(232,160,32,.5), transparent)" }}
        />
      </motion.div>
    </section>
  );
};

export default LandingHero;
