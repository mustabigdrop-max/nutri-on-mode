import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const Typewriter = ({ text, start, speed = 28, className = "", prefix = "" }: { text: string; start: boolean; speed?: number; className?: string; prefix?: string }) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!start) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [start, text, speed]);
  return <div className={className}>{prefix}{out}</div>;
};

const ProvocationBlock = ({ inView }: { inView: boolean }) => {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const timers = [0, 300, 600, 900, 1200, 1500, 1900, 2600].map((d, i) =>
      setTimeout(() => setT(i + 1), d)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div
      className="mx-auto mb-8 text-left"
      style={{
        maxWidth: 600,
        padding: "20px 24px",
        background: "#0d0d1f",
        border: "0.5px solid #ffffff10",
        borderLeft: "2px solid #E24B4A",
        borderRadius: 8,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={t >= 1 ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
        className="text-[11px] md:text-[12px] text-[#888]"
        style={{ letterSpacing: "0.08em" }}
      >
        Você ainda vai usar aquele app que
      </motion.div>
      <Typewriter
        start={t >= 2}
        text="te dá um cardápio genérico,"
        className="text-[12px] md:text-[13px] text-white font-bold mt-1"
      />
      <Typewriter
        start={t >= 3}
        text="ignora sua postura,"
        prefix="✗ "
        className="text-[12px] md:text-[13px] mt-1 text-[#E24B4A] font-bold"
        speed={28}
      />
      <Typewriter
        start={t >= 4}
        text="ignora seu protocolo,"
        prefix="✗ "
        className="text-[12px] md:text-[13px] mt-1 text-[#E24B4A] font-bold"
      />
      <Typewriter
        start={t >= 5}
        text="ignora seu comportamento"
        prefix="✗ "
        className="text-[12px] md:text-[13px] mt-1 text-[#E24B4A] font-bold"
      />
      <Typewriter
        start={t >= 6}
        text="e ignora seu ciclo —"
        prefix="✗ "
        className="text-[12px] md:text-[13px] mt-1 text-[#E24B4A] font-bold"
      />
      <style>{`
        .prov-red { color: #E24B4A; font-weight: 700; }
      `}</style>
      <Typewriter
        start={t >= 7}
        text="e ainda promete resultado?"
        className="text-[13px] md:text-[14px] text-white font-bold mt-3"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={t >= 8 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="text-[10px] md:text-[11px] mt-4 flex items-center gap-2"
        style={{ letterSpacing: "0.1em", color: "#00D4FF" }}
      >
        <span
          style={{ color: "#1D9E75" }}
          className="inline-block animate-pulse"
        >
          ●
        </span>
        EXISTE UMA ALTERNATIVA.
      </motion.div>
    </div>
  );
};

const avatarColors = ["bg-primary", "bg-cyan-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500"];

const LandingCTA = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} className="bg-primary px-6 md:px-12 py-[120px] text-center relative overflow-hidden">
      {/* Background watermark */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[30vw] text-black/[.06] pointer-events-none whitespace-nowrap leading-none">
        NutriON
      </span>

      {/* Layer 1: Provocation block */}
      <div className="relative">
        <ProvocationBlock inView={inView} />
      </div>

      {/* Layer 2: Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="font-heading text-black leading-[.9] mb-6 relative"
        style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
      >
        VOCÊ ESTÁ<br />
        <span style={{ WebkitTextStroke: "2px #000", color: "transparent" }}>NUTRI</span>
        <span>ON?</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-[1.1rem] text-black/70 mb-2 font-landing max-w-[540px] mx-auto leading-[1.6] relative font-semibold"
      >
        O nutriON não é mais uma tentativa. É o protocolo feito pra quem você é.
      </motion.p>

      {/* Layer 3: Risk reversal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="relative mb-9"
      >
        <p className="font-mono text-[.7rem] text-black/40 mb-1">
          Cancele quando quiser. Sem pegadinha. Sem letras miúdas.
        </p>
      </motion.div>

      {/* CTA button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative mb-10"
      >
        <span className="relative inline-block cta-energy-ring">
          <a
            href="https://pay.kiwify.com.br/G8uxU9O"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-block bg-black text-primary font-heading text-[1.3rem] tracking-[.1em] px-[52px] py-5 rounded-[2px] hover:bg-foreground hover:text-black transition-all"
          >
            Entrar no modo ON →
          </a>
        </span>
      </motion.div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative flex items-center justify-center gap-3"
      >
        <div className="flex -space-x-2">
          {avatarColors.map((color, i) => (
            <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-primary`} />
          ))}
        </div>
        <span className="font-mono text-[.7rem] text-black/50 tracking-[.04em]">
          Novas ativações a cada hora
        </span>
      </motion.div>
    </div>
  );
};

export default LandingCTA;
