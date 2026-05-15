import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const BOOT_STEPS = [
  "Conectando ao sistema...",
  "Carregando protocolos MCE...",
  "Verificando sincronização...",
  "Sistema MCE · Ativo",
];

const useLiveCounter = (base: number) => {
  const [count, setCount] = useState(base);
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      const delay = 2400 + Math.random() * 2600;
      timeoutId = setTimeout(() => {
        setCount((c) => c + 1);
        tick();
      }, delay);
    };
    tick();
    return () => clearTimeout(timeoutId);
  }, []);
  return count;
};

const ROTATING_LINES = [
  "Sua fome nunca foi de comida.",
  "Força de vontade não periodiza treino. Sistema sim.",
  "Você sabe o que fazer. O problema nunca foi esse.",
  "Ninguém falhou na dieta. Falhou no diagnóstico.",
  "Seu corpo responde ao padrão que você instalou. Não à sua intenção.",
  "Não existe platô de resultado. Existe platô de padrão.",
  "A fome que você sente às 23h não é física. É padrão sem protocolo.",
  "Cardápio é intenção. Protocolo é resultado.",
  "95% sabe o que comer. 5% tem estrutura pra não parar.",
  "Transformação não é evento. É sistema que nunca para.",
];

const PARTICLES = [
  { left: "8%", top: "12%", dur: 5 },
  { left: "18%", top: "78%", dur: 6.5 },
  { left: "27%", top: "32%", dur: 4.2 },
  { left: "33%", top: "62%", dur: 7.1 },
  { left: "41%", top: "18%", dur: 5.8 },
  { left: "49%", top: "85%", dur: 4.6 },
  { left: "58%", top: "42%", dur: 6.2 },
  { left: "66%", top: "22%", dur: 5.1 },
  { left: "74%", top: "68%", dur: 7.4 },
  { left: "82%", top: "38%", dur: 4.9 },
  { left: "90%", top: "75%", dur: 6.7 },
  { left: "12%", top: "48%", dur: 5.5 },
];

const ORBIT_NODES = [
  { angle: 0, label: "PROTEÍNA", color: "#e8a020" },
  { angle: 90, label: "CARBOIDRATO", color: "#00f0b4" },
  { angle: 180, label: "GORDURA", color: "#7890ff" },
  { angle: 270, label: "HIDRATAÇÃO", color: "#e8a020" },
];

const CHIPS = [
  { pos: "top-[2%] left-[-6%]", label: "GEB CALCULADO", value: "1.847 kcal", color: "#e8a020", x: -30, delay: 2.2 },
  { pos: "top-[2%] right-[-6%]", label: "PROTEÍNA ALVO", value: "2.2 g/kg", color: "#00f0b4", x: 30, delay: 2.3 },
  { pos: "bottom-[2%] left-[-6%]", label: "MUSCLE STATE", value: "FULL 💪", color: "#e8a020", x: -30, delay: 2.4 },
  { pos: "bottom-[2%] right-[-6%]", label: "SCORE MCE", value: "94 / 100", color: "#7890ff", x: 30, delay: 2.5 },
];

const MCE_PILLARS = [
  { letter: "M", label: "MINDSET", desc: "Padrão mental", color: "#7890ff", bars: [0.9, 0.6, 0.85, 0.7, 0.95] },
  { letter: "C", label: "COMPORTAMENTO", desc: "Antes do prato", color: "#e8a020", bars: [0.7, 0.95, 0.75, 1.0, 0.8] },
  { letter: "E", label: "EXECUÇÃO", desc: "Protocolo ativo", color: "#00f0b4", bars: [0.85, 0.65, 0.95, 0.7, 0.88] },
];

const MCESystemCard = () => (
  <div className="lg:hidden w-full">
    <div
      className="relative border p-4 rounded-sm overflow-hidden"
      style={{ borderColor: "rgba(232,160,32,.12)", background: "rgba(4,4,14,.85)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#00f0b4", boxShadow: "0 0 8px rgba(0,240,180,.9)" }}
          />
          <span className="font-mono text-[.5rem] tracking-[.22em] uppercase" style={{ color: "rgba(0,240,180,.7)" }}>
            MCE · SISTEMA ATIVO
          </span>
        </div>
        <span className="font-mono text-[.5rem]" style={{ color: "#50507a" }}>NUTRI·ON v2.4</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MCE_PILLARS.map((p, i) => (
          <motion.div
            key={p.letter}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.5 + i * 0.15 }}
            className="relative border p-2.5 rounded-sm overflow-hidden"
            style={{ borderColor: `${p.color}18`, background: "rgba(4,4,14,.85)" }}
          >
            <div
              className="font-heading text-[2.1rem] leading-none mb-1"
              style={{
                color: "transparent",
                WebkitTextStroke: `1px ${p.color}`,
                textShadow: `0 0 18px ${p.color}66`,
              }}
            >
              {p.letter}
            </div>
            <div className="font-mono text-[.44rem] tracking-[.16em] uppercase mb-0.5" style={{ color: p.color }}>
              {p.label}
            </div>
            <div className="font-mono text-[.42rem] mb-2" style={{ color: "#404060" }}>
              {p.desc}
            </div>
            <div className="flex items-end gap-[2px] h-4">
              {p.bars.map((b, bi) => (
                <motion.div
                  key={bi}
                  className="flex-1 rounded-[1px]"
                  style={{ background: p.color, opacity: 0.7 }}
                  animate={{ height: [`${b * 40}%`, `${b * 100}%`, `${b * 55}%`] }}
                  transition={{ duration: 1.4 + bi * 0.18, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          originX: 0.5,
          background: "linear-gradient(90deg, transparent, #7890ff, #e8a020, #00f0b4, transparent)",
        }}
        animate={{ opacity: [0.35, 1, 0.35], scaleX: [0.85, 1, 0.85] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  </div>
);

const LandingHero = () => {
  const [lineIdx, setLineIdx] = useState(0);
  const [bootStep, setBootStep] = useState(0);
  const liveCount = useLiveCounter(3847);

  useEffect(() => {
    const id = setInterval(() => setLineIdx((p) => (p + 1) % ROTATING_LINES.length), 3800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timeouts = [350, 800, 1300, 1950].map((d, i) =>
      setTimeout(() => setBootStep(i), d)
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "#03030a" }}
    >
      {/* Sweep line on load */}
      <motion.div
        initial={{ top: "0%", opacity: 0 }}
        animate={{ top: "102%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.8, ease: "easeInOut" }}
        className="absolute left-0 right-0 z-[5] pointer-events-none"
        style={{
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,240,180,.4) 25%, rgba(232,160,32,.8) 50%, rgba(0,240,180,.4) 75%, transparent 100%)",
          boxShadow: "0 0 20px rgba(0,240,180,.4)",
        }}
      />

      {/* Ambient backgrounds */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 70% 50%, rgba(232,160,32,.07) 0%, rgba(120,144,255,.03) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,160,32,.012) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,.012) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full pointer-events-none"
          style={{ left: p.left, top: p.top, background: "rgba(232,160,32,.4)" }}
          animate={{ y: [-8, 8, -8], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch px-6 md:px-12 pt-[120px] pb-20 gap-10">
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          {/* [1] Rotating micro-text */}
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="flex items-center gap-1.5 border px-2 py-[3px] rounded-sm shrink-0"
              style={{ borderColor: "rgba(255,68,68,.22)", background: "rgba(255,68,68,.04)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#ff4444", boxShadow: "0 0 6px rgba(255,68,68,.9)" }}
              />
              <span
                className="font-mono text-[.44rem] tracking-[.15em]"
                style={{ color: "#ff4444" }}
              >
                AO VIVO
              </span>
            </div>
            <div className="h-[1.3rem] overflow-hidden flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lineIdx}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="font-mono text-[.62rem] tracking-[.05em]"
                  style={{ color: "rgba(240,237,248,.28)" }}
                >
                  <span className="mr-2" style={{ color: "rgba(232,160,32,.4)" }}>›</span>
                  {ROTATING_LINES[lineIdx]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* [2] MCE badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2.5 border px-4 py-2 rounded-full mb-8 w-fit"
            style={{ borderColor: "rgba(0,240,180,.15)", background: "rgba(0,240,180,.03)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00f0b4", boxShadow: "0 0 8px rgba(0,240,180,1)" }}
            />
            <span
              className="font-mono text-[.58rem] tracking-[.2em] uppercase"
              style={{ color: "rgba(0,240,180,.8)" }}
            >
              Sistema MCE · Ativo
            </span>
            <span className="font-mono text-[.58rem]" style={{ color: "#50507a" }}>v2.4.1</span>
          </motion.div>

          {/* [3] Ghost text above */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-heading select-none mb-1"
            style={{
              color: "rgba(240,237,248,.05)",
              letterSpacing: ".35em",
              fontSize: "clamp(1rem,3vw,2.2rem)",
            }}
          >
            TRANSFORME
          </motion.div>

          {/* [4] Headline */}
          <h1
            className="font-heading flex flex-wrap items-baseline"
            style={{ fontSize: "clamp(4.5rem, 12vw, 11rem)", lineHeight: 0.82 }}
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              style={{ color: "#f0edf8", letterSpacing: "-.02em" }}
            >
              NUTRI
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 1.4, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 1.0 }}
              className="relative inline-block"
              style={{
                color: "transparent",
                WebkitTextStroke: "2px hsl(38 80% 52%)",
                textShadow: "0 0 60px rgba(232,160,32,.6), 0 0 120px rgba(232,160,32,.25)",
              }}
            >
              ON
              <motion.span
                className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full"
                style={{
                  background: "#e8a020",
                  boxShadow: "0 0 14px rgba(232,160,32,1), 0 0 28px rgba(232,160,32,.4)",
                }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </motion.span>
          </h1>

          {/* [5] Ghost text below */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="font-heading select-none mb-8 mt-2"
            style={{
              color: "rgba(240,237,248,.05)",
              letterSpacing: ".32em",
              fontSize: "clamp(1rem,3vw,2.2rem)",
            }}
          >
            MINDSET · COMPORTAMENTO · EXECUÇÃO
          </motion.div>

          {/* [6] Animated separator */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            style={{ originX: 0 }}
            className="flex items-center gap-4 max-w-[520px] mb-6"
          >
            <div
              className="h-px flex-1"
              style={{
                background: "linear-gradient(to right, rgba(232,160,32,.35), rgba(232,160,32,.08), transparent)",
              }}
            />
            <span
              className="font-mono text-[.55rem] tracking-[.25em]"
              style={{ color: "rgba(232,160,32,.35)" }}
            >
              MCE.SYS.ONLINE
            </span>
            <div className="w-6 h-px" style={{ background: "rgba(232,160,32,.15)" }} />
          </motion.div>

          {/* [7] Three cascade lines */}
          <div className="max-w-[580px] mb-6">
            <motion.p
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.3 }}
              className="font-heading leading-tight"
              style={{
                fontSize: "clamp(1.05rem, 2.5vw, 1.8rem)",
                color: "rgba(240,237,248,.35)",
              }}
            >
              TODO APP TE DÁ UM PLANO.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.52 }}
              className="font-heading leading-tight"
              style={{
                fontSize: "clamp(1.05rem, 2.5vw, 1.8rem)",
                color: "rgba(240,237,248,.72)",
              }}
            >
              TODO PERSONAL TE DÁ UM TREINO.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.75, delay: 1.78 }}
              className="font-heading leading-tight"
              style={{
                fontSize: "clamp(1.05rem, 2.5vw, 1.8rem)",
                color: "#e8a020",
                textShadow: "0 0 35px rgba(232,160,32,.5), 0 0 70px rgba(232,160,32,.2)",
              }}
            >
              O NUTRION É O SISTEMA
              <br />
              QUE FAZ VOCÊ NÃO PARAR.
            </motion.p>
          </div>

          {/* [8] Support paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.1 }}
            className="max-w-[500px] mb-8"
          >
            <p
              className="font-landing text-[.88rem] leading-[1.88]"
              style={{ color: "#60607a" }}
            >
              Nutrição de precisão, prescrição de treino adaptativa e análise comportamental — integrados num único protocolo que aprende com você e{" "}
              <span style={{ color: "rgba(240,237,248,.62)" }}>
                age antes de você parar
              </span>
              .
            </p>
          </motion.div>

          {/* [9] Inline badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.3 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <div
              className="flex items-center gap-2 border px-3 py-1.5 rounded-full"
              style={{ borderColor: "rgba(0,240,180,.15)", background: "rgba(0,240,180,.03)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#00f0b4", boxShadow: "0 0 6px rgba(0,240,180,.8)" }}
              />
              <span className="font-mono text-[.56rem]" style={{ color: "rgba(0,240,180,.7)" }}>
                protocolos executados hoje
              </span>
            </div>
            <div
              className="flex items-center gap-2 border px-3 py-1.5 rounded-full"
              style={{ borderColor: "rgba(232,160,32,.1)", background: "rgba(232,160,32,.03)" }}
            >
              <span style={{ color: "#e8a020" }}>⚡</span>
              <span className="font-mono text-[.55rem]" style={{ color: "#8888b0" }}>
                Treino · Nutrição · Comportamento · Performance
              </span>
            </div>
          </motion.div>

          {/* [10] Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.5 }}
            className="flex flex-wrap mb-9 border w-fit"
            style={{ borderColor: "rgba(232,160,32,.08)" }}
          >
            {[
              { v: "MCE", l: "Método Exclusivo", s: "Mindset · Comportamento · Execução" },
              { v: "RPE", l: "Tracking Nativo", s: "Deload automático por acúmulo de fadiga" },
              { v: "8", l: "Grupos Musculares", s: "Heatmap de recuperação em tempo real" },
            ].map((c, i, arr) => (
              <div
                key={i}
                className={`px-5 py-4 ${i < arr.length - 1 ? "border-r" : ""}`}
                style={{ borderColor: "rgba(232,160,32,.08)" }}
              >
                <div
                  className="font-heading text-[2.1rem] leading-none mb-2"
                  style={{ color: "#e8a020", textShadow: "0 0 20px rgba(232,160,32,.4)" }}
                >
                  {c.v}
                </div>
                <div
                  className="font-mono text-[.55rem] tracking-[.12em] uppercase mb-1"
                  style={{ color: "rgba(240,237,248,.45)" }}
                >
                  {c.l}
                </div>
                <div className="font-mono text-[.5rem]" style={{ color: "#404060" }}>
                  {c.s}
                </div>
              </div>
            ))}
          </motion.div>

          {/* [11] CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.7 }}
            className="flex gap-3 flex-wrap"
          >
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("plans");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group relative font-heading text-[.95rem] tracking-[.07em] px-9 py-4 transition-transform hover:scale-[1.02]"
              style={{
                background: "hsl(38 80% 52%)",
                color: "#030310",
                clipPath:
                  "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                boxShadow: "0 0 35px rgba(232,160,32,.35)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(255,255,255,.12)" }}
              />
              <span className="relative">COMEÇAR PROTOCOLO ON →</span>
            </button>
            <a
              href="/auth"
              className="group relative font-heading text-[.95rem] tracking-[.07em] px-9 py-4 transition-transform hover:scale-[1.02]"
              style={{
                background: "hsl(38 80% 52%)",
                color: "#030310",
                clipPath:
                  "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                boxShadow: "0 0 30px rgba(232,160,32,.25)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(255,255,255,.12)" }}
              />
              <span className="relative">ATIVAR MEU PROTOCOLO →</span>
            </a>
            <a
              href="#protocols"
              className="flex items-center gap-2 font-mono text-[.68rem] tracking-[.12em] px-6 py-4 border transition-colors"
              style={{ color: "#4a4a6a", borderColor: "#1c1c32" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(232,160,32,.25)";
                e.currentTarget.style.color = "rgba(232,160,32,.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1c1c32";
                e.currentTarget.style.color = "#4a4a6a";
              }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: "currentColor" }} />
              VER PROTOCOLOS
            </a>
          </motion.div>
        </div>

        {/* MCE System Card — mobile only */}
        <MCESystemCard />

        {/* RIGHT COLUMN — visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.0 }}
          className="hidden lg:flex w-[480px] flex-shrink-0 relative items-center justify-center"
        >
          <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px]">
            {/* Outer ring rotating */}
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: "rgba(232,160,32,.1)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {ORBIT_NODES.map((n, i) => {
                const rad = (n.angle * Math.PI) / 180;
                const cx = 50 + 50 * Math.cos(rad);
                const cy = 50 + 50 * Math.sin(rad);
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${cx}%`,
                      top: `${cy}%`,
                      background: n.color,
                      boxShadow: `0 0 8px ${n.color}`,
                    }}
                    title={n.label}
                  />
                );
              })}
            </motion.div>

            {/* Middle ring counter-rotating */}
            <motion.div
              className="absolute inset-[30px] rounded-full border border-dashed"
              style={{ borderColor: "rgba(0,240,180,.08)" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner ring */}
            <div
              className="absolute inset-[60px] rounded-full border"
              style={{ borderColor: "rgba(232,160,32,.12)" }}
            />

            {/* Wireframe body */}
            <div className="absolute inset-[78px] flex flex-col items-center justify-start pt-2">
              <div
                className="w-7 h-7 rounded-full border mb-1"
                style={{
                  borderColor: "rgba(0,240,180,.35)",
                  boxShadow: "0 0 10px rgba(0,240,180,.15)",
                }}
              />
              <div
                className="w-px h-3"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,240,180,.3), rgba(232,160,32,.2))",
                }}
              />
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                {/* shoulders */}
                <path d="M10 12 Q18 8 28 8 L52 8 Q62 8 70 12" stroke="rgba(232,160,32,.3)" strokeWidth="1" fill="none" />
                {/* clavicles */}
                <line x1="28" y1="8" x2="40" y2="16" stroke="rgba(0,240,180,.2)" strokeWidth="1" />
                <line x1="52" y1="8" x2="40" y2="16" stroke="rgba(0,240,180,.2)" strokeWidth="1" />
                {/* sternum */}
                <line x1="40" y1="16" x2="40" y2="46" stroke="rgba(232,160,32,.25)" strokeWidth="1" />
                {/* ribs left */}
                <path d="M40 22 Q28 24 22 28" stroke="rgba(0,240,180,.15)" strokeWidth="1" fill="none" opacity="0.9" />
                <path d="M40 30 Q26 32 20 36" stroke="rgba(0,240,180,.13)" strokeWidth="1" fill="none" opacity="0.7" />
                <path d="M40 38 Q26 40 22 44" stroke="rgba(0,240,180,.11)" strokeWidth="1" fill="none" opacity="0.5" />
                {/* ribs right */}
                <path d="M40 22 Q52 24 58 28" stroke="rgba(0,240,180,.15)" strokeWidth="1" fill="none" opacity="0.9" />
                <path d="M40 30 Q54 32 60 36" stroke="rgba(0,240,180,.13)" strokeWidth="1" fill="none" opacity="0.7" />
                <path d="M40 38 Q54 40 58 44" stroke="rgba(0,240,180,.11)" strokeWidth="1" fill="none" opacity="0.5" />
                {/* pelvis */}
                <path d="M22 56 Q40 64 58 56" stroke="rgba(232,160,32,.22)" strokeWidth="1" fill="none" />
                <circle cx="28" cy="58" r="2.5" stroke="rgba(232,160,32,.3)" strokeWidth="1" fill="none" />
                <circle cx="52" cy="58" r="2.5" stroke="rgba(232,160,32,.3)" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {/* Scan line */}
            <motion.div
              className="absolute left-[10%] right-[10%] pointer-events-none"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(0,240,180,.5), rgba(232,160,32,.7), transparent)",
              }}
              animate={{ top: ["8%", "92%", "8%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />

            {/* Pulse rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border pointer-events-none"
                style={{ borderColor: "rgba(0,240,180,.08)", left: "50%", top: "50%" }}
                animate={{
                  width: [0, 260],
                  height: [0, 260],
                  x: [0, -130],
                  y: [0, -130],
                  opacity: [0.5, 0],
                }}
                transition={{ duration: 3, delay: i * 1, repeat: Infinity, ease: "easeOut" }}
              />
            ))}

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(232,160,32,.8) 0%, rgba(232,160,32,.2) 50%, transparent 70%)",
                  boxShadow: "0 0 20px rgba(232,160,32,.5), 0 0 40px rgba(232,160,32,.2)",
                }}
              />
            </div>

            {/* Floating chips */}
            {CHIPS.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: c.x }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: c.delay }}
                className={`absolute ${c.pos} backdrop-blur-md border rounded-[2px] px-2.5 py-1.5`}
                style={{
                  borderColor: `${c.color}40`,
                  background: "rgba(3,3,10,.7)",
                }}
              >
                <div
                  className="font-mono text-[.48rem] tracking-[.14em]"
                  style={{ color: c.color }}
                >
                  {c.label}
                </div>
                <div className="font-heading text-[.85rem]" style={{ color: "rgba(255,255,255,.9)" }}>
                  {c.value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span
            className="font-mono text-[.52rem] tracking-[.3em]"
            style={{ color: "#30305a" }}
          >
            SCROLL
          </span>
          <div
            className="w-px h-10"
            style={{ background: "linear-gradient(to bottom, rgba(232,160,32,.5), transparent)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LandingHero;
