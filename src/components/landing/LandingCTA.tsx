import { useRef } from "react";
import { motion, useInView } from "framer-motion";

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

      {/* Layer 1: Provocation */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="font-mono text-[.8rem] text-black/50 tracking-[.1em] uppercase mb-8 relative"
      >
        Você ainda vai usar aquele app que só te dá um cardápio?
      </motion.p>

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
        className="text-[1rem] text-black/55 mb-2 font-landing max-w-[500px] mx-auto leading-[1.6] relative"
      >
        Resultado não acontece quando você quer. Acontece quando você estrutura. Entra no modo ON agora.
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
        <a
          href="https://pay.kiwify.com.br/6pXyygp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-primary font-heading text-[1.3rem] tracking-[.1em] px-[52px] py-5 rounded-[2px] hover:bg-foreground hover:text-black transition-all"
        >
          Entrar no modo ON →
        </a>
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
