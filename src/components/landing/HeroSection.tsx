import { motion } from "framer-motion";
import { Zap, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-subtle bg-secondary/50 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-gold" />
          <span className="text-sm font-mono text-primary">MODO ON — ATIVO 24H</span>
        </motion.div>

        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">NUTRI</span>
          <span className="text-gradient-gold animate-pulse-gold">ON</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          Ciência que alimenta. Atitude que transforma.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-base sm:text-lg text-primary font-mono font-semibold mb-10"
        >
          24h no modo resultado.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button className="group relative px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-all hover:scale-105 glow-gold">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Começar 7 dias grátis
            </span>
          </button>
          <button className="px-8 py-4 rounded-lg border border-border text-foreground font-semibold text-lg transition-all hover:border-primary/40 hover:bg-secondary/50">
            Ver como funciona
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Sem cartão de crédito · Cancele quando quiser
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
