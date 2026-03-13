import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const LandingHero = () => {
  const navigate = useNavigate();
  const [activeCount, setActiveCount] = useState(23);

  // Simulate live counter fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(15, Math.min(48, prev + delta));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-[120px] pb-20 relative overflow-hidden">
      {/* Tag */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="font-mono text-[.7rem] text-primary tracking-[.25em] uppercase mb-7 flex items-center gap-3"
      >
        <span className="w-6 h-px bg-primary" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        Metodologia MCE · Mindset · Comportamento · Execução
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="font-heading leading-[.88] mb-0"
        style={{ fontSize: "clamp(3.2rem, 10vw, 9rem)", letterSpacing: "-.01em" }}
      >
        <span className="text-foreground">NUTRI</span>
        <span className="text-primary relative inline-block" style={{ textShadow: "0 0 60px rgba(232,160,32,.35)" }}>
          ON
          <span className="absolute bottom-[-4px] left-0 right-0 h-[3px] bg-primary" style={{ boxShadow: "0 0 16px hsl(38 80% 52%)" }} />
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="font-heading text-foreground/70 mt-4"
        style={{ fontSize: "clamp(1.2rem, 3vw, 2.4rem)", letterSpacing: "-.01em" }}
      >
        Planejamento sem execução é só opinião.
      </motion.p>

      {/* Mirror copy — identity-based */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.85 }}
        className="mt-10 max-w-[640px]"
      >
        <p className="text-[1.15rem] leading-[1.75] text-foreground/90 font-landing mb-4">
          Você não chegou até aqui por acidente.
        </p>
        <p className="text-[1rem] leading-[1.75] text-muted-foreground font-landing mb-3">
          Quem chega aqui já tentou de tudo — app de caloria, dieta da internet, planilha do coach. E já sabe que{" "}
          <strong className="text-foreground">nada colou</strong>.
        </p>
        <p className="text-[1.05rem] leading-[1.75] text-primary/90 font-semibold font-landing">
          O NUTRION não é mais uma tentativa. É o sistema que substitui todas elas.
        </p>
      </motion.div>

      {/* Live counter badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="mt-8 inline-flex items-center gap-2.5 bg-card/60 border border-border px-4 py-2.5 rounded-full w-fit"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
        </span>
        <span className="font-mono text-[.72rem] text-muted-foreground tracking-wide">
          <span className="text-accent font-semibold">{activeCount}</span> pessoas ativas agora
        </span>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.3 }}
        className="mt-10 flex gap-4 flex-wrap"
      >
        <button
          onClick={() => navigate("/auth")}
          className="bg-primary text-primary-foreground font-heading text-[1.05rem] tracking-[.08em] px-9 py-4 rounded-[2px] inline-flex items-center gap-2.5 hover:bg-background hover:text-primary hover:outline-2 hover:outline hover:outline-primary transition-all"
        >
          🟢 Ativar meu protocolo →
        </button>
        <a
          href="#protocols"
          className="border border-border text-muted-foreground font-mono text-[.75rem] tracking-[.08em] px-7 py-4 rounded-[2px] hover:border-primary hover:text-primary transition-all"
        >
          Ver como funciona
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-px h-[60px] animate-pulse" style={{ background: "linear-gradient(to bottom, hsl(38 80% 52%), transparent)" }} />
      </div>
    </section>
  );
};

export default LandingHero;
