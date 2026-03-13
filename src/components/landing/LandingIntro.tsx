import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
  { text: "CARREGANDO PROTOCOLOS CIENTÍFICOS...", delay: 400 },
  { text: "IA COMPORTAMENTAL ONLINE...", delay: 500 },
  { text: "MAPEANDO PERFIL METABÓLICO...", delay: 450 },
  { text: "SISTEMA PRONTO ✓", delay: 350 },
];

const LandingIntro = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      setGone(true);
      document.body.style.overflow = "";
    }, 700);
  }, [exiting]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    let totalDelay = 200;
    const step = 100 / bootLines.length;
    const timers: ReturnType<typeof setTimeout>[] = [];

    bootLines.forEach((line, i) => {
      totalDelay += line.delay;
      timers.push(
        setTimeout(() => {
          setLines((prev) => [...prev, line.text]);
          setProgress((i + 1) * step);
        }, totalDelay)
      );
    });

    timers.push(setTimeout(() => setShowFinal(true), totalDelay + 400));
    timers.push(setTimeout(dismiss, totalDelay + 2000));

    return () => timers.forEach(clearTimeout);
  }, [dismiss]);

  if (gone) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center"
        >
          {/* Scanline */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / .08) 2px, hsl(var(--foreground) / .08) 4px)",
            }}
          />

          {/* Skip */}
          <button
            onClick={dismiss}
            className="absolute top-6 right-6 font-mono text-[.65rem] tracking-[.15em] text-muted-foreground hover:text-primary transition-colors"
          >
            PULAR ›
          </button>

          <div className="w-full max-w-md px-6">
            <div className="font-mono text-xs space-y-2 mb-8 min-h-[120px]">
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={line.includes("✓") ? "text-accent" : "text-muted-foreground"}
                >
                  <span className="text-primary/60 mr-2">{">"}</span>
                  {line}
                </motion.p>
              ))}
            </div>

            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "hsl(var(--primary))" }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <AnimatePresence>
              {showFinal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <p className="font-mono text-[.65rem] tracking-[.2em] text-muted-foreground mb-2">
                    PROTOCOLO ATIVO
                  </p>
                  <p
                    className="font-heading text-2xl sm:text-3xl tracking-wide text-primary"
                    style={{ textShadow: "0 0 40px hsl(38 80% 52% / .5)" }}
                  >
                    BEM-VINDO AO MODO ON
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LandingIntro;
