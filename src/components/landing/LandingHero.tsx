import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const provocations = [
  "Você já tentou emagrecer 3 vezes este ano.",
  "99% dos apps te pedem para contar caloria. 0% te explicam por que você errou.",
  "Dieta sem método é só restrição com prazo de validade.",
  "Você não precisa de mais informação. Precisa de execução.",
  "O problema nunca foi falta de disciplina. Foi falta de estrutura.",
];

const LandingHero = () => {
  const navigate = useNavigate();
  const [provIndex, setProvIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProvIndex((prev) => (prev + 1) % provocations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-[120px] pb-20 relative overflow-hidden">
      {/* Rotating provocation ticker */}
      <div className="h-8 mb-6 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={provIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[.75rem] text-primary/80 tracking-[.04em] absolute"
          >
            "{provocations[provIndex]}"
          </motion.p>
        </AnimatePresence>
      </div>

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

      {/* Subheadline phrase */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="font-heading text-foreground/70 mt-4"
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
        <p className="text-[1.15rem] leading-[1.7] text-primary/90 font-semibold font-landing mb-4">
          A única plataforma de nutrição baseada na metodologia MCE — Mindset, Comportamento e Execução — para quem não quer mais começar na segunda-feira.
        </p>
        <p className="text-[1rem] leading-[1.7] text-muted-foreground font-landing mb-6">
          A maioria dos apps te dá um cardápio. O nutriON te dá um <strong className="text-foreground">método</strong>. Porque mudar o corpo começa na cabeça, passa pelo comportamento e só acontece de verdade na <strong className="text-foreground">execução diária</strong>.
        </p>

        {/* US flag badge */}
        <div className="inline-flex items-center gap-2 bg-primary/[.06] border border-primary/20 px-4 py-2 rounded-full mb-2">
          <span className="text-[14px]">🇺🇸</span>
          <span className="font-mono text-[.65rem] text-muted-foreground tracking-[.06em]">
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
            <span className="font-mono text-[.68rem] text-muted-foreground tracking-[.06em] whitespace-pre-line">{m.label}</span>
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
          className="bg-primary text-primary-foreground font-heading text-[1.05rem] tracking-[.08em] px-9 py-4 rounded-[2px] inline-flex items-center gap-2.5 hover:bg-background hover:text-primary hover:outline-2 hover:outline hover:outline-primary transition-all"
        >
          🟢 Quero sair do plano e entrar em resultado →
        </button>
        <a
          href="#protocols"
          className="border border-border text-muted-foreground font-mono text-[.75rem] tracking-[.08em] px-7 py-4 rounded-[2px] hover:border-primary hover:text-primary transition-all"
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
