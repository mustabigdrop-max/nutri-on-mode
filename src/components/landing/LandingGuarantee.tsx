import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const bullets = [
  "Acesso completo a todos os protocolos por 7 dias",
  "Cancele com 1 clique — sem burocracia, sem email",
  "Sem cobrança se cancelar dentro do prazo",
  "Seus dados ficam salvos caso volte",
];

const LandingGuarantee = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      className="px-6 md:px-12 py-[80px] max-w-3xl mx-auto text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="border border-primary/20 bg-card/20 backdrop-blur-sm rounded-sm px-8 py-10 md:px-14 md:py-14 relative overflow-hidden"
      >
        {/* Shield SVG */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center mb-6"
        >
          <svg
            width="64"
            height="76"
            viewBox="0 0 64 76"
            fill="none"
            className="text-primary"
          >
            {/* Shield body */}
            <path
              d="M32 2L4 16V36C4 54.78 16.16 72.16 32 76C47.84 72.16 60 54.78 60 36V16L32 2Z"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              className="drop-shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
            />
            {/* Inner highlight */}
            <path
              d="M32 8L10 20V36C10 51.5 20.4 65.8 32 69.6C43.6 65.8 54 51.5 54 36V20L32 8Z"
              fill="hsl(var(--primary) / 0.08)"
            />
            {/* Checkmark */}
            <motion.path
              d="M22 38L29 45L42 30"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="font-heading text-primary leading-none mb-2"
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)" }}
        >
          7 DIAS PARA MUDAR DE IDEIA
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-muted-foreground text-[.85rem] mb-8 max-w-[420px] mx-auto leading-relaxed"
        >
          Teste tudo. Se não fizer sentido pra você, cancela. Simples assim.
        </motion.p>

        {/* Bullets */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-left max-w-[380px] mx-auto space-y-3 mb-8"
        >
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[.82rem] text-muted-foreground"
            >
              <span className="text-primary mt-0.5 shrink-0">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </motion.ul>

        {/* Closing line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="font-heading text-[1rem] text-foreground tracking-[.05em]"
        >
          O risco é nosso.{" "}
          <span className="text-primary">O resultado é seu.</span>
        </motion.p>
      </motion.div>
    </section>
  );
};

export default LandingGuarantee;
