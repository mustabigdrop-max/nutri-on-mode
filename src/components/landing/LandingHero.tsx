import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingHero = () => {
  const navigate = useNavigate();

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
        Ciência que alimenta · Atitude que transforma · 24h no modo resultado
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="font-heading leading-[.88] mb-0"
        style={{ fontSize: "clamp(5rem, 14vw, 14rem)", letterSpacing: "-.01em" }}
      >
        <span className="text-[#f0edf8]">NUTRI</span>
        <span className="text-primary relative inline-block" style={{ textShadow: "0 0 60px rgba(255,184,0,.35)" }}>
          ON
          <span className="absolute bottom-[-4px] left-0 right-0 h-[3px] bg-primary" style={{ boxShadow: "0 0 16px hsl(43 100% 50%)" }} />
        </span>
        <br />
        <span style={{ WebkitTextStroke: "1px rgba(255,255,255,.12)", color: "transparent" }}>PRECISION</span>
      </motion.h1>

      {/* Sub content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[900px]"
      >
        <div>
          <p className="text-[1.1rem] leading-[1.7] text-[#8888b0] max-w-[420px] font-landing">
            A maioria das pessoas sabe o que comer. O problema é <strong className="text-[#f0edf8]">não parar de fazer isso</strong>. O NUTRION não te dá mais uma dieta — te coloca no modo <strong className="text-[#f0edf8]">ON</strong>: 24h planejado, monitorado e evoluindo. Nutrição de precisão para quem já decidiu que resultado não é opção, é consequência.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/[.06] border border-primary/20 px-4 py-2 rounded-full">
            <span className="w-[7px] h-[7px] bg-primary rounded-full animate-pulse" style={{ boxShadow: "0 0 8px hsl(43 100% 50%)" }} />
            <span className="font-mono text-[.65rem] text-[#9090b8] tracking-[.06em]">
              Você está no modo <strong className="text-primary">ON</strong> agora
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 justify-end">
          {[
            { val: "24H", label: "Sempre ON — planejamento\nativo a qualquer hora do dia" },
            { val: "10", label: "Protocolos científicos\nLow Carb · Keto · Atleta · Vegano · JI" },
            { val: "0", label: "Apps iguais no Brasil\nPrecisão de coach. Escala de IA." },
          ].map((m) => (
            <div key={m.val} className="flex items-center gap-3">
              <span className="font-heading text-[1.8rem] text-primary min-w-[64px]">{m.val}</span>
              <span className="font-mono text-[.68rem] text-[#50507a] tracking-[.06em] whitespace-pre-line">{m.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-12 flex gap-4 flex-wrap"
      >
        <button
          onClick={() => navigate("/auth")}
          className="bg-primary text-black font-heading text-[1.1rem] tracking-[.1em] px-9 py-4 rounded-[2px] inline-flex items-center gap-2.5 hover:bg-black hover:text-primary hover:outline-2 hover:outline hover:outline-primary transition-all"
        >
          Começar grátis 7 dias →
        </button>
        <a
          href="#protocols"
          className="border border-[#2a2a4a] text-[#50507a] font-mono text-[.75rem] tracking-[.08em] px-7 py-4 rounded-[2px] hover:border-primary hover:text-primary transition-all"
        >
          Ver protocolos
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-px h-[60px] animate-pulse" style={{ background: "linear-gradient(to bottom, hsl(43 100% 50%), transparent)" }} />
      </div>
    </section>
  );
};

export default LandingHero;
