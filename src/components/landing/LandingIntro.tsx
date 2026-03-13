import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_STEPS = [
  { text: "CARREGANDO PROTOCOLOS CIENTÍFICOS", color: "#3a3a5a" },
  { text: "CALIBRANDO MOTOR MCE", color: "#3a3a5a" },
  { text: "INICIANDO IA COMPORTAMENTAL", color: "#3a3a5a" },
  { text: "VERIFICANDO CRONOBIOLOGIA", color: "#3a3a5a" },
  { text: "SISTEMA PRONTO · PROTOCOLO ATIVO", color: "#00f0b4" },
];

const LandingIntro = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "ready" | "exit">("boot");

  const skip = useCallback(() => {
    setPhase("exit");
    setTimeout(onDone, 450);
  }, [onDone]);

  useEffect(() => {
    // Progress bar animation
    let p = 0;
    const progId = setInterval(() => {
      p = Math.min(p + 1.6, 100);
      setProgress(p);
      if (p >= 100) clearInterval(progId);
    }, 24);

    // Boot lines staggered
    const delays = [280, 560, 840, 1100, 1380];
    const timers = delays.map((d, i) =>
      setTimeout(() => setStep((s) => Math.max(s, i + 1)), d)
    );

    // Ready state
    const tReady = setTimeout(() => setPhase("ready"), 1700);

    // Auto exit
    const tExit = setTimeout(() => {
      setPhase("exit");
      setTimeout(onDone, 550);
    }, 2600);

    return () => {
      clearInterval(progId);
      timers.forEach(clearTimeout);
      clearTimeout(tReady);
      clearTimeout(tExit);
    };
  }, [onDone]);

  if (phase === "exit") {
    return (
      <motion.div
        className="fixed inset-0 z-[1000] bg-[#030310] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "#030310" }}>

      {/* Honeycomb grid */}
      <div className="absolute inset-0 pointer-events-none opacity-60" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='104'%3E%3Cpath d='M30 2 L58 18 L58 50 L30 66 L2 50 L2 18 Z' fill='none' stroke='rgba(232,160,32,.016)' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 104px",
      }} />

      {/* Sweep scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,180,.22), rgba(232,160,32,.35), rgba(0,240,180,.22), transparent)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 1.8, ease: "linear", repeat: Infinity }}
      />

      {/* Center nebula */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(232,160,32,.05), transparent)",
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 95% 95% at 50% 50%, transparent 20%, rgba(3,3,16,.8) 100%)",
      }} />

      {/* Corner brackets */}
      {[["top-6 left-6", "border-t border-l"], ["top-6 right-6", "border-t border-r"], ["bottom-6 left-6", "border-b border-l"], ["bottom-6 right-6", "border-b border-r"]].map(([pos, borders], i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} w-8 h-8 ${borders} border-[#e8a020]/15`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[480px] px-8">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="font-heading leading-none mb-2" style={{ fontSize: "clamp(3.5rem, 10vw, 5.5rem)" }}>
            <span className="text-[#f0edf8]">NUTRI</span>
            <span style={{ color: "#e8a020", textShadow: "0 0 50px rgba(232,160,32,.7), 0 0 100px rgba(232,160,32,.3)" }}>
              ON
            </span>
          </div>
          <div className="font-mono text-[.5rem] text-[#222244] tracking-[.4em] uppercase">
            SISTEMA MCE · VERSÃO 2.4.1
          </div>
        </motion.div>

        {/* Boot lines */}
        <div className="mb-8 space-y-2.5" style={{ minHeight: "120px" }}>
          {BOOT_STEPS.map((s, i) => (
            <AnimatePresence key={i}>
              {step > i && (
                <motion.div
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center gap-3 font-mono text-[.58rem] tracking-[.1em]"
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{
                      background: s.color,
                      boxShadow: i === 4 ? "0 0 8px rgba(0,240,180,.8)" : "none",
                    }}
                  />
                  <span style={{ color: s.color }}>{s.text}</span>
                  {i === 4 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[#00f0b4] text-[.7rem]"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-[1px] w-full bg-white/[.04] overflow-hidden rounded-full">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #e8a020, #f0c060, #00f0b4)",
                width: `${progress}%`,
                boxShadow: "0 0 8px rgba(232,160,32,.5)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[.44rem] text-[#18183a] tracking-[.15em]">INICIALIZANDO</span>
            <span className="font-mono text-[.44rem] text-[#28285a] tracking-[.08em]">{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* Ready message */}
        <AnimatePresence>
          {phase === "ready" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mt-9 space-y-1"
            >
              <div
                className="font-heading tracking-[.08em]"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2.4rem)", color: "#e8a020", textShadow: "0 0 50px rgba(232,160,32,.6)" }}
              >
                PROTOCOLO ATIVO
              </div>
              <div className="font-mono text-[.5rem] text-[#00f0b4]/50 tracking-[.3em]">
                BEM-VINDO AO MODO ON
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip */}
      <button
        onClick={skip}
        className="absolute bottom-7 right-8 font-mono text-[.5rem] text-[#222248] hover:text-[#40407a] tracking-[.18em] transition-colors duration-300 z-20"
      >
        PULAR →
      </button>
    </div>
  );
};

export default LandingIntro;
