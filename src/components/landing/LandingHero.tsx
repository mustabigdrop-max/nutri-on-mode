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
        <span className="text-[#f0edf8]">NUTRI</span>
        <span className="text-primary relative inline-block" style={{ textShadow: "0 0 60px rgba(232,160,32,.35)" }}>
          ON
          <span className="absolute bottom-[-4px] left-0 right-0 h-[3px] bg-primary" style={{ boxShadow: "0 0 16px hsl(38 80% 52%)" }} />
        </span>
      </motion.h1>

      {/* Subheadline phrase */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="font-heading text-[#f0edf8]/70 mt-4"
        style={{ fontSize: "clamp(1.2rem, 3vw, 2.4rem)", letterSpacing: "-.01em" }}
      >
        Planejamento sem execução é só opinião.
      </motion.p>

      {/* Sub content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-10 max-w-[700px]"
      >
        {/* Subheadline */}
        <p className="text-[1.15rem] leading-[1.7] text-primary/90 font-semibold font-landing mb-4">
          A única plataforma de nutrição baseada na metodologia MCE — Mindset, Comportamento e Execução — para quem não quer mais começar na segunda-feira.
        </p>

        {/* Parágrafo de apoio */}
        <p className="text-[1rem] leading-[1.7] text-[#8888b0] font-landing mb-6">
          A maioria dos apps te dá um cardápio. O nutriON te dá um <strong className="text-[#f0edf8]">método</strong>. Porque mudar o corpo começa na cabeça, passa pelo comportamento e só acontece de verdade na <strong className="text-[#f0edf8]">execução diária</strong>.
        </p>

        {/* US flag badge */}
        <div className="inline-flex items-center gap-2 bg-primary/[.06] border border-primary/20 px-4 py-2 rounded-full mb-2">
          <span className="text-[14px]">🇺🇸</span>
          <span className="font-mono text-[.65rem] text-[#9090b8] tracking-[.06em]">
            Formação americana em nutrição
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.95 }}
        className="mt-8 flex flex-wrap gap-6"
      >
        {[
          { val: "MCE", label: "Mindset · Comportamento\n· Execução" },
          { val: "24H", label: "Sempre ON — planejamento\nativo a qualquer hora" },
          { val: "0", label: "Apps iguais no Brasil\nPrecisão de coach. Escala de IA." },
        ].map((m) => (
          <div key={m.val} className="flex items-center gap-3">
            <span className="font-heading text-[1.8rem] text-primary min-w-[64px]">{m.val}</span>
            <span className="font-mono text-[.68rem] text-[#50507a] tracking-[.06em] whitespace-pre-line">{m.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="mt-10 flex gap-4 flex-wrap"
      >
        <button
          onClick={() => navigate("/auth")}
          className="bg-primary text-black font-heading text-[1.05rem] tracking-[.08em] px-9 py-4 rounded-[2px] inline-flex items-center gap-2.5 hover:bg-black hover:text-primary hover:outline-2 hover:outline hover:outline-primary transition-all"
        >
          🟢 Quero sair do plano e entrar em resultado →
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
        <div className="w-px h-[60px] animate-pulse" style={{ background: "linear-gradient(to bottom, hsl(38 80% 52%), transparent)" }} />
      </div>
    </section>
  );
};

export default LandingHero;
