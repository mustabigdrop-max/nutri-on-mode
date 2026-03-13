import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const LandingCTA = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-[140px] overflow-hidden"
    >
      {/* Background — gold gradient + nebula */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #030310 0%, #0a0608 40%, #0e0804 60%, #030310 100%)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(232,160,32,.1) 0%, rgba(232,80,20,.04) 40%, transparent 70%)",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(232,160,32,.014) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,.014) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Huge watermark */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading pointer-events-none select-none whitespace-nowrap leading-none"
        style={{
          fontSize: "clamp(8rem, 22vw, 22rem)",
          color: "rgba(232,160,32,.025)",
          letterSpacing: "-.02em",
        }}
      >
        ON
      </div>

      <div className="max-w-[800px] mx-auto text-center relative z-10">

        {/* Provocative pre-headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <p className="font-heading text-[#f0edf8]/25 mb-1" style={{ fontSize: "clamp(1rem, 2.5vw, 1.6rem)" }}>
            Você ainda vai usar aquele app?
          </p>
          <div className="h-px max-w-[120px] mx-auto" style={{ background: "linear-gradient(90deg, transparent, rgba(232,160,32,.4), transparent)" }} />
        </motion.div>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading leading-[.88] mb-8"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
        >
          <span style={{ WebkitTextStroke: "1px rgba(232,160,32,.3)", color: "transparent" }}>
            VOCÊ
          </span>
          <br />
          <span style={{ color: "#f0edf8" }}>ESTÁ</span>
          <br />
          <span style={{ color: "#e8a020", textShadow: "0 0 60px rgba(232,160,32,.5), 0 0 120px rgba(232,160,32,.2)" }}>
            NUTRI<span style={{ WebkitTextStroke: "2px #e8a020", color: "transparent" }}>ON</span>?
          </span>
        </motion.h2>

        {/* Body copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-10"
        >
          <p className="font-landing text-[1rem] text-[#8888b0] leading-[1.8] mb-3 max-w-[520px] mx-auto">
            Cada semana sem sistema é uma semana de resultado que não vai acontecer.
            Resultado não espera motivação. Resultado espera estrutura.
          </p>
          <p className="font-landing text-[1rem] text-[#f0edf8]/60 font-semibold">
            Entra no modo ON agora.
          </p>
        </motion.div>

        {/* Risk reversal + social proof */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-6 flex-wrap mb-10"
        >
          {[
            { icon: "🔓", text: "Cancele quando quiser" },
            { icon: "⚡", text: "Protocolo em 7 minutos" },
            { icon: "🛡️", text: "Sem pegadinha" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <span className="text-[.8rem]">{icon}</span>
              <span className="font-mono text-[.6rem] text-[#60607a] tracking-[.06em]">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <a
            href="https://pay.kiwify.com.br/6pXyygp"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-block"
          >
            {/* Glow behind button */}
            <div
              className="absolute -inset-4 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(232,160,32,.2), transparent)" }}
            />

            <div
              className="relative font-heading text-[1.2rem] tracking-[.1em] px-14 py-5 transition-all duration-300 group-hover:scale-[1.02] active:scale-[.98]"
              style={{
                background: "#e8a020",
                color: "#030310",
                clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
                boxShadow: "0 0 40px rgba(232,160,32,.3), 0 20px 40px rgba(0,0,0,.4)",
              }}
            >
              <span className="relative z-10">ENTRAR NO MODO ON →</span>
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            </div>
          </a>
        </motion.div>

        {/* Social proof below button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          {/* Live user count */}
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              {["#e8a020", "#00f0b4", "#7890ff", "#ff4466"].map((c, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border border-[#03030a] flex items-center justify-center text-[.5rem]"
                  style={{ background: `${c}25`, borderColor: c + "40" }}
                />
              ))}
            </div>
            <span className="font-mono text-[.58rem] text-[#50507a] tracking-[.06em]">
              3.847+ já ativaram o protocolo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#00f0b4]" style={{ boxShadow: "0 0 6px rgba(0,240,180,.8)" }} />
            <span className="font-mono text-[.54rem] text-[#30305a] tracking-[.06em]">
              Novas ativações a cada hora
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCTA;
