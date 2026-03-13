import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
  { text: "CARREGANDO PROTOCOLOS CIENTÍFICOS...", delay: 400 },
  { text: "IA COMPORTAMENTAL ONLINE...", delay: 800 },
  { text: "MAPEANDO PERFIL METABÓLICO...", delay: 600 },
  { text: "SISTEMA PRONTO ✓", delay: 500 },
];

const LandingIntro = () => {
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("nutrion-intro-seen");
    if (seen) return;
    setVisible(true);
    document.body.style.overflow = "hidden";

    let totalDelay = 300;
    const progressStep = 100 / bootLines.length;

    bootLines.forEach((line, i) => {
      totalDelay += line.delay;
      setTimeout(() => {
        setLines((prev) => [...prev, line.text]);
        setProgress((i + 1) * progressStep);
      }, totalDelay);
    });

    setTimeout(() => setShowFinal(true), totalDelay + 600);
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("nutrion-intro-seen", "1");
        document.body.style.overflow = "";
      }, 800);
    }, totalDelay + 2400);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center"
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / .08) 2px, hsl(var(--foreground) / .08) 4px)",
            }}
          />

          <div className="w-full max-w-md px-6">
            {/* Boot lines */}
            <div className="font-mono text-xs space-y-2 mb-8 min-h-[120px]">
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={
                    line.includes("✓")
                      ? "text-accent"
                      : "text-muted-foreground"
                  }
                >
                  <span className="text-primary/60 mr-2">{">"}</span>
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "hsl(var(--primary))" }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Final message */}
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
